import { db } from '#lib/server/db/index.ts';
import { products, product_ingredients } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq, and, inArray } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
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
			unit_price: { type: 'string', pattern: '^-?\\d+(\\.\\d+)?$' },

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
		console.log(body);
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

	const [created] = await db
		.insert(products)
		.values({ name: body.name, unit_price: body.unit_price, product_validity: 'valid' })
		.$returningId();

	// update the product_ingredients junction table
	if (body.ingredients && body.ingredients?.length > 0) {
		let ingredient_arr: number[] = body.ingredients;
		await db.insert(product_ingredients).values(
			ingredient_arr.map((ingredient_id) => ({
				product_id: created.product_id,
				ingredient_id: ingredient_id
			}))
		);
	}
	return json({ success: true }, { status: 201 });
};

export const QUERY: RequestHandler = async ({ url, request }) => {
	try {
		let body: unknown;
		const ajv = new Ajv();
		interface MyData {
			ingredients?: number[];
		}

		const schema: JSONSchemaType<MyData> = {
			type: 'object',
			properties: {
				ingredients: {
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

		if (body.ingredients && body.ingredients?.length > 0) {
			let ingredient_arr: number[] = body.ingredients;
			result = await db
				.select()
				.from(products)
				.leftJoin(product_ingredients, eq(products.product_id, product_ingredients.product_id))
				.where(
					and(
						inArray(product_ingredients.ingredient_id, ingredient_arr),
						eq(products.product_validity, 'valid')
					)
				);
		} else {
			result = await db.select().from(products).where(eq(products.product_validity, 'valid'));
		}

		return json({ status: 'success', data: result });
	} catch (error) {
		return json({ status: 'error', message: 'failed to get the products' }, { status: 500 });
	}
};
