import { db } from '#lib/server/db/index.ts';
import { products } from '#lib/server/db/schema.ts';

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

	// validate if a product already has the same name
	if (await db.query.products.findFirst({ where: eq(products.name, body.name) })) {
		return json({ error: 'Product name already exists' }, { status: 415 });
	}

	// ajv validation
	if (validate(body)) {
		await db.insert(products).values({ name: body.name, unit_price: body.unit_price });
		return json({ success: true }, { status: 201 });
	} else {
		return json({ error: validate.errors }, { status: 415 });
	}
};
