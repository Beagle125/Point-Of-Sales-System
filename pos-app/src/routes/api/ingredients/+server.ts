import { db } from '#lib/server/db/index.ts';
import { ingredients, product_ingredients } from '#lib/server/db/schema.ts';

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
	}

	const schema: JSONSchemaType<MyData> = {
		type: 'object',
		properties: {
			name: { type: 'string', pattern: '^(?!\\s*$).+' }
		},
		required: ['name'],
		additionalProperties: false
	};

	const validate = ajv.compile(schema);

	try {
		body = await request.json();
	} catch {
		return json({ error: 'Request body must be a valid JSON.' }, { status: 415 });
	}

	// ajv validation
	if (!validate(body)) {
		return json({ error: validate.errors }, { status: 415 });
	}

	if (
		await db.query.ingredients.findFirst({
			where: and(eq(ingredients.name, body.name), eq(ingredients.ingredient_validity, 'valid'))
		})
	) {
		return json({ error: 'Ingredient name already exists' }, { status: 415 });
	}

	await db.insert(ingredients).values({ name: body.name, ingredient_validity: 'valid' });
	return json({ success: true }, { status: 201 });
};

export const QUERY: RequestHandler = async ({ url, request }) => {
	try {
		let body: unknown;
		const ajv = new Ajv();
		interface MyData {
			products?: number[];
		}

		const schema: JSONSchemaType<MyData> = {
			type: 'object',
			properties: {
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

		if (body.products && body.products?.length > 0) {
			let product_arr: number[] = body.products;

			result = await db
				.select()
				.from(ingredients)
				.leftJoin(
					product_ingredients,
					eq(ingredients.ingredient_id, product_ingredients.ingredient_id)
				)
				.where(
					and(
						inArray(product_ingredients.product_id, product_arr),
						eq(ingredients.ingredient_validity, 'valid')
					)
				);
		} else {
			result = await db
				.select()
				.from(ingredients)
				.where(eq(ingredients.ingredient_validity, 'valid'));
		}

		return json({ status: 'success', data: result });
	} catch (error) {
		return json({ status: 'error', message: 'failed to get the ingredients' }, { status: 500 });
	}
};
