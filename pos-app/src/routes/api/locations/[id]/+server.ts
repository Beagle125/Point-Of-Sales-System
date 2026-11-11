import { db } from '#lib/server/db/index.ts';
import { locations } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq, and } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params }) => {
	const locationId = Number(params.id);

	if (!Number.isInteger(locationId) || locationId <= 0) {
		return json({ error: 'Invalid location ID.' }, { status: 400 });
	}

	const location = await db.query.locations.findFirst({
		where: and(eq(locations.location_id, locationId), eq(locations.location_validity, 'valid')),
		columns: { location_id: true }
	});

	if (!location) {
		return json({ error: 'Location id not found or was deleted.' }, { status: 404 });
	}

	await db
		.update(locations)
		.set({ location_validity: 'void' })
		.where(eq(locations.location_id, locationId));
	return json({ success: true });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	let body: unknown;

	const ajv = new Ajv();

	interface MyData {
		name: string;
		city: string;
		street: string;
	}

	const schema: JSONSchemaType<MyData> = {
		type: 'object',
		properties: {
			name: { type: 'string', pattern: '^(?!\\s*$).+' },
			city: { type: 'string', pattern: '^(?!\\s*$).+' },
			street: { type: 'string', pattern: '^(?!\\s*$).+' }
		},
		required: ['name', 'city', 'street'],
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

	const locationId = Number(params.id);

	if (
		!(await db.query.locations.findFirst({
			where: and(eq(locations.location_id, locationId), eq(locations.location_validity, 'valid')),
			columns: { location_id: true }
		}))
	) {
		return json({ error: 'Specified location id was not found or was deleted.' }, { status: 404 });
	}

	await db
		.update(locations)
		.set({ name: body.name, city: body.city, street: body.street })
		.where(and(eq(locations.location_id, locationId), eq(locations.location_validity, 'valid')));

	return json({ success: true }, { status: 201 });
};
