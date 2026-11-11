import { db } from '#lib/server/db/index.ts';
import { orders, product_orders, products, payments } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq, sql, inArray, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	const ajv = new Ajv();

	interface ProductRecord {
		product_id: number;
		quantity: number;
	}

	enum TransactionType {
		EWALLET = 'e-wallet',
		CASH = 'cash',
		CARD = 'card'
	}

	interface MyData {
		location_id: number;
		product_arr: ProductRecord[];
		payment_amount?: string;
		transaction_type?: TransactionType;
	}

	const schema: JSONSchemaType<MyData> = {
		type: 'object',
		properties: {
			location_id: { type: 'number' },
			product_arr: {
				type: 'array',
				items: {
					type: 'object',
					properties: { product_id: { type: 'number' }, quantity: { type: 'number' } },
					required: ['product_id', 'quantity'],
					additionalProperties: false
				}
			},
			payment_amount: { type: 'string', pattern: '^-?\\d+(\\.\\d+)?$', nullable: true },
			transaction_type: { type: 'string', pattern: '^(?!\\s*$).+', nullable: true }
		},
		required: ['location_id', 'product_arr'],
		additionalProperties: false
	};

	const validate = ajv.compile(schema);

	try {
		body = await request.json();
		console.log(body);
	} catch {
		return json({ error: 'Request body must be a valid JSON' }, { status: 415 });
	}

	if (!validate(body)) {
		return json({ error: validate.errors }, { status: 415 });
	}

	// create the new order
	const [created] = await db
		.insert(orders)
		.values({ location_id: body.location_id, order_date: sql`now()`, order_validity: 'valid' })
		.$returningId();

	// update junction table
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
			order_id: created.order_id,
			product_id: record.product_id,
			quantity: record.quantity,
			unit_price: record.price
		}))
	);

	if (body.payment_amount && body.transaction_type) {
		await db.insert(payments).values({
			order_id: created.order_id,
			amount: body.payment_amount,
			transaction_type: body.transaction_type,
			payment_validity: 'valid'
		});
	}

	return json({ success: true }, { status: 201 });
};

export const QUERY: RequestHandler = async ({ url, request }) => {
	try {
		let body: unknown;
		const ajv = new Ajv();
		interface MyData {
			locations?: number[];
			products?: number[];
		}

		const schema: JSONSchemaType<MyData> = {
			type: 'object',
			properties: {
				locations: {
					type: 'array',
					nullable: true,
					items: { type: 'number' }
				},
				products: {
					type: 'array',
					nullable: true,
					items: { type: 'number' }
				}
			},
			additionalProperties: false
		};

		const validate = ajv.compile(schema);
		let result;
		body = await request.json();

		// ajv validation
		if (!validate(body)) {
			return json({ error: validate.errors }, { status: 415 });
		}

		if (body.locations && body.locations.length > 0 && body.products && body.products.length > 0) {
			let location_arr: number[] = body.locations;
			let product_arr: number[] = body.products;
			result = await db
				.select()
				.from(orders)
				.leftJoin(product_orders, eq(orders.order_id, product_orders.order_id))
				.where(
					and(
						inArray(orders.location_id, location_arr),
						inArray(product_orders.product_id, product_arr),
						eq(orders.order_validity, 'valid')
					)
				);
		} else if (body.locations && body.locations.length > 0) {
			let location_arr: number[] = body.locations;
			result = await db
				.select()
				.from(orders)
				.where(and(inArray(orders.location_id, location_arr), eq(orders.order_validity, 'valid')));
		} else if (body.products && body.products.length > 0) {
			let product_arr: number[] = body.products;
			result = await db
				.select()
				.from(orders)
				.leftJoin(product_orders, eq(orders.order_id, product_orders.order_id))
				.where(
					and(inArray(product_orders.product_id, product_arr), eq(orders.order_validity, 'valid'))
				);
		} else {
			result = await db.select().from(orders).where(eq(orders.order_validity, 'valid'));
		}

		return json({ status: 'success', data: result });
	} catch (error) {
		return json({ status: 'error', message: 'failed to get the orders' }, { status: 500 });
	}
};
