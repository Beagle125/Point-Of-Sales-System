import { db } from '#lib/server/db/index.ts';
import { payments, orders } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	const ajv = new Ajv();

	enum TransactionType {
		EWALLET = 'e-wallet',
		CASH = 'cash',
		CARD = 'card'
	}

	interface MyData {
		order_id: number;
		amount: string;
		transaction_type: TransactionType;
	}

	const schema: JSONSchemaType<MyData> = {
		type: 'object',
		properties: {
			order_id: { type: 'number' },
			amount: { type: 'string', pattern: '^-?\\d+(\\.\\d+)?$' },
			transaction_type: { type: 'string', enum: Object.values(TransactionType) }
		},
		required: ['order_id', 'amount', 'transaction_type'],
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

	if (!(await db.query.orders.findFirst({ where: eq(orders.order_id, body.order_id) }))) {
		return json({ error: 'Order ID does not exist' }, { status: 415 });
	}

	await db.insert(payments).values({
		order_id: body.order_id,
		amount: body.amount,
		transaction_type: body.transaction_type,
		payment_validity: 'valid'
	});
	return json({ success: true }, { status: 201 });
};

export const QUERY: RequestHandler = async ({ url, request }) => {
	try {
		let body: unknown;
		const ajv = new Ajv();

		enum TransactionType {
			EWALLET = 'e-wallet',
			CASH = 'cash',
			CARD = 'card',
			NONE = 'none'
		}
		interface MyData {
			transaction_type: TransactionType;
		}

		const schema: JSONSchemaType<MyData> = {
			type: 'object',
			properties: {
				transaction_type: { type: 'string', pattern: '^(?!\\s*$).+' }
			},
			required: [],
			additionalProperties: false
		};

		const validate = ajv.compile(schema);
		let result;
		body = await request.json();

		// ajv validation
		if (!validate(body)) {
			return json({ error: validate.errors }, { status: 415 });
		}

		if (body.transaction_type !== 'none') {
			result = await db
				.select()
				.from(payments)
				.where(
					and(
						eq(payments.transaction_type, body.transaction_type),
						eq(payments.payment_validity, 'valid')
					)
				);
		} else {
			result = await db.select().from(payments).where(eq(payments.payment_validity, 'valid'));
		}

		return json({ status: 'success', data: result });
	} catch (error) {
		return json({ status: 'error', message: 'failed to get the payments' }, { status: 500 });
	}
};
