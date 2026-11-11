import { db } from '#lib/server/db/index.ts';
import { orders, products, product_orders } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params }) => {
	const orderId = Number(params.id);
	if (!Number.isInteger(orderId) || orderId <= 0) {
		return json({ error: 'Invalid order ID.' }, { status: 400 });
	}

	const order = await db.query.orders.findFirst({
		where: eq(orders.order_id, orderId),
		columns: { order_id: true }
	});

	if (!order) {
		return json({ error: 'Order not found.' }, { status: 404 });
	}

	await db.delete(orders).where(eq(orders.order_id, orderId));
	return json({ success: true });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	let body: unknown;
	const ajv = new Ajv();

	interface ProductRecord {
		product_id: number;
		quantity: number;
	}

	interface PaymentRecord {
		amount: number;
		transaction_type: string;
	}

	interface MyData {
		location_id: number;
		product_arr?: ProductRecord[];
		payment_arr?: PaymentRecord[];
	}

	const schema: JSONSchemaType<MyData> = {
		type: 'object',
		properties: {
			location_id: { type: 'number' },
			product_arr: {
				type: 'array',
				nullable: true,
				items: {
					type: 'object',
					properties: { product_id: { type: 'number' }, quantity: { type: 'number' } },
					required: ['product_id', 'quantity'],
					additionalProperties: false
				}
			},
			payment_arr: {
				type: 'array',
				nullable: true,
				items: {
					type: 'object',
					properties: { amount: { type: 'number' }, transaction_type: { type: 'string' } },
					required: ['amount', 'transaction_type'],
					additionalProperties: false
				}
			}
		},
		required: ['location_id'],
		additionalProperties: false
	};

	const validate = ajv.compile(schema);
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Request body must be a valid JSON.' }, { status: 415 });
	}

	if (!validate(body)) {
		return json({ error: validate.errors }, { status: 415 });
	}

	const orderId = Number(params.id);

	await db
		.update(orders)
		.set({ location_id: body.location_id })
		.where(eq(orders.order_id, orderId));

	// update products junction

	if (body.product_arr && body.product_arr.length > 0) {
		await db.delete(product_orders).where(eq(product_orders.order_id, orderId));

		interface JuntionRecord {
			product_id: number;
			quantity: number;
			price: string;
		}
		let junction_arr: JuntionRecord[] = [];

		for (let record of body.product_arr) {
			// get the current price
			let price = (
				await db
					.select({ unit_price: products.unit_price })
					.from(products)
					.where(eq(products.product_id, record.product_id))
			).map((row) => row.unit_price)[0];

			junction_arr.push({
				product_id: record.product_id,
				quantity: record.quantity,
				price: price
			});
		}

		await db.insert(product_orders).values(
			junction_arr.map((record) => ({
				order_id: orderId,
				product_id: record.product_id,
				quantity: record.quantity,
				unit_price: record.price
			}))
		);
	}

	// TODO update the payments

	return json({ success: true }, { status: 201 });
};
