import { db } from '#lib/server/db/index.ts';
import { products } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params }) => {
	const productId = Number(params.id);
	if (!Number.isInteger(productId) || productId <= 0) {
		return json({ error: 'Invalid product ID.' }, { status: 400 });
	}

	const product = await db.query.products.findFirst({
		where: eq(products.product_id, productId),
		columns: { product_id: true }
	});

	if (!product) {
		return json({ error: 'Product not found.' }, { status: 404 });
	}

	await db.delete(products).where(eq(products.product_id, productId));
	return json({ success: true });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	let body: unknown;

	const ajv = new Ajv();

	interface MyData {
		name: string;
		unit_price: string;
	}

	const schema: JSONSchemaType<MyData> = {
		type: 'object',
		properties: {
			name: { type: 'string', pattern: '^(?!\\s*$).+' },
			unit_price: { type: 'string', pattern: '^(?!\\s*$).+' }
		},
		required: ['name', 'unit_price'],
		additionalProperties: false
	};

	const validate = ajv.compile(schema);

	// initial validation of valid json
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Request body must be a valid JSON.' }, { status: 415 });
	}

	// ajv validation
	if (!validate(body)) {
		return json({ error: validate.errors }, { status: 415 });
	}

	// validate if a product already has the same name
	if (await db.query.products.findFirst({ where: eq(products.name, body.name) })) {
		return json({ error: 'Product name already exists' }, { status: 415 });
	}

	// update the product
	const productId = Number(params.id);

	await db
		.update(products)
		.set({ name: body.name, unit_price: body.unit_price })
		.where(eq(products.product_id, productId));

	return json({ success: true }, { status: 201 });
};
