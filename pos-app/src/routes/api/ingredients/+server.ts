import { db } from '#lib/server/db/index.ts';
import { ingredients } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq } from 'drizzle-orm';

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

	if (await db.query.ingredients.findFirst({ where: eq(ingredients.name, body.name) })) {
		return json({ error: 'Ingredient name already exists' }, { status: 415 });
	}

	await db.insert(ingredients).values({ name: body.name });
	return json({ success: true }, { status: 201 });
};

export const GET: RequestHandler = async ({ url }) => {
	try {
		const result = await db.select().from(ingredients);
		return json({ status: 'success', data: result });
	} catch (error) {
		return json({ status: 'error', message: 'failed to get the ingredients' }, { status: 500 });
	}
};
