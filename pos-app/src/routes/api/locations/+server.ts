import { db } from '#lib/server/db/index.ts';
import { locations } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq, inArray, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
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

	// ajv validation
	if (!validate(body)) {
		return json({ error: validate.errors }, { status: 415 });
	}

	if (
		await db.query.locations.findFirst({
			where: and(eq(locations.name, body.name), eq(locations.location_status, 'active'))
		})
	) {
		return json({ error: 'Location name already exists' }, { status: 415 });
	}

	await db
		.insert(locations)
		.values({ name: body.name, city: body.city, street: body.street, location_status: 'active' });
	return json({ success: true }, { status: 201 });
};

export const QUERY: RequestHandler = async ({ url, request }) => {
	try {
		let body: unknown;
		const ajv = new Ajv();
		interface MyData {
			cities?: string[];
		}

		const schema: JSONSchemaType<MyData> = {
			type: 'object',
			properties: {
				cities: {
					type: 'array',
					nullable: true,
					items: { type: 'string' }
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

		if (body.cities && body.cities?.length > 0) {
			let city_arr: string[] = body.cities;

			result = await db
				.select()
				.from(locations)
				.where(and(inArray(locations.city, city_arr), eq(locations.location_status, 'active')));
		} else {
			result = await db.select().from(locations).where(eq(locations.location_status, 'active'));
		}

		return json({ status: 'success', data: result });
	} catch (error) {
		return json({ status: 'error', message: 'failed to get the locations' }, { status: 500 });
	}
};

// this is for just getting the list of cities that currently exist
export const GET: RequestHandler = async (url) => {
	try {
		let city_arr = await db
			.selectDistinct({ city: locations.city })
			.from(locations)
			.where(eq(locations.location_status, 'active'));

		console.log(city_arr);

		return json({ status: 'success', data: city_arr });
	} catch (error) {
		return json({ status: 'error', message: 'failed to get the locations' }, { status: 500 });
	}
};
