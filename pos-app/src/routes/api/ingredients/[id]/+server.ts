import { db } from '#lib/server/db/index.ts';
import { ingredients } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq, and } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params }) => {
	const ingredientId = Number(params.id);

	if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
		return json({ error: 'Invalid product ID.' }, { status: 400 });
	}

	const ingredient = await db.query.ingredients.findFirst({
		where: and(
			eq(ingredients.ingredient_id, ingredientId),
			eq(ingredients.ingredient_validity, 'valid')
		),
		columns: { ingredient_id: true }
	});

	if (!ingredient) {
		return json({ error: 'Ingredient not found or was deleted.' }, { status: 404 });
	}

	await db
		.update(ingredients)
		.set({ ingredient_validity: 'void' })
		.where(eq(ingredients.ingredient_id, ingredientId));
	return json({ success: true });
};

export const PUT: RequestHandler = async ({ params, request }) => {
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

	if (!validate(body)) {
		return json({ error: validate.errors }, { status: 415 });
	}

	const ingredientId = Number(params.id);

	if (
		!(await db.query.ingredients.findFirst({
			where: and(
				eq(ingredients.ingredient_id, ingredientId),
				eq(ingredients.ingredient_validity, 'valid')
			),
			columns: { ingredient_id: true }
		}))
	) {
		return json(
			{ error: 'Specified ingredient id was not found or was deleted.' },
			{ status: 404 }
		);
	}

	await db
		.update(ingredients)
		.set({ name: body.name })
		.where(eq(ingredients.ingredient_id, ingredientId));

	return json({ success: true }, { status: 201 });
};
