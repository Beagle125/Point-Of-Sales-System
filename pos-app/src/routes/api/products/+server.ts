import { db } from '#lib/server/db/index.ts';
import { products } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return json({ error: 'Request body must be a valid JSON.' }, { status: 400 });
	}

	if (typeof body !== 'object' || body === null || !('name' in body) || !('unit_price' in body)) {
		return json({ error: 'Provide a product name and unit price.' }, { status: 400 });
	}

	const name = typeof body.name === 'string' ? body.name.trim() : '';
	const unitPrice = typeof body.unit_price === 'string' ? body.unit_price.trim() : '';

	if (!name) {
		return json({ error: 'Enter a product name.' }, { status: 400 });
	}

	if (!/^\d{1,15}(?:\.\d{1,4})?$/.test(unitPrice)) {
		return json({ error: 'Enter a valid non-negative price.' }, { status: 400 });
	}

	await db.insert(products).values({ name, unit_price: unitPrice });
	return json({ success: true }, { status: 201 });
};
