import { db } from '#lib/server/db/index.ts';
import { products, product_ingredients } from '#lib/server/db/schema.ts';

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
		ingredients?: number[];
	}

	const schema: JSONSchemaType<MyData> = {
		type: 'object',
		properties: {
			name: { type: 'string', pattern: '^(?!\\s*$).+' },
			unit_price: { type: 'string', pattern: '^(?!\\s*$).+' },

			ingredients: {
				type: 'array',
				nullable: true,
				items: { type: 'number' }
			}
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

	// update the product
	const productId = Number(params.id);

	await db
		.update(products)
		.set({ name: body.name, unit_price: body.unit_price })
		.where(eq(products.product_id, productId));

	if (body.ingredients) {
		let ingredient_arr: number[] = body.ingredients;

		// delete existing records
		await db.delete(product_ingredients).where(eq(product_ingredients.product_id, productId));

		//  update records
		await db.insert(product_ingredients).values(
			ingredient_arr.map((ingredient_id) => ({
				product_id: productId,
				ingredient_id: ingredient_id
			}))
		);
	}

	return json({ success: true }, { status: 201 });
};
