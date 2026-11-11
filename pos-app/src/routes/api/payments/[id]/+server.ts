import { db } from '#lib/server/db/index.ts';
import { payments } from '#lib/server/db/schema.ts';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import { eq, and } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params }) => {
	const paymentId = Number(params.id);
	if (!Number.isInteger(paymentId) || paymentId <= 0) {
		return json({ error: 'Invalid payment ID.' }, { status: 400 });
	}

	const payment = await db.query.payments.findFirst({
		where: and(eq(payments.payment_id, paymentId), eq(payments.payment_validity, 'valid')),
		columns: { payment_id: true }
	});

	if (!payment) {
		return json({ error: 'Payment not found.' }, { status: 404 });
	}

	await db
		.update(payments)
		.set({ payment_validity: 'void' })
		.where(eq(payments.payment_id, paymentId));
	return json({ success: true });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const paymentId = Number(params.id);
	if (
		!(await db.query.payments.findFirst({
			where: and(eq(payments.payment_id, paymentId), eq(payments.payment_validity, 'valid')),
			columns: { payment_id: true }
		}))
	) {
		return json({ error: 'Payment has not been found or has been voided' }, { status: 404 });
	}

	let body: unknown;

	const ajv = new Ajv();

	enum TransactionType {
		EWALLET = 'e-wallet',
		CASH = 'cash',
		CARD = 'card'
	}

	interface MyData {
		amount: string;
		transaction_type: TransactionType;
	}

	const schema: JSONSchemaType<MyData> = {
		type: 'object',
		properties: {
			amount: { type: 'string', pattern: '^-?\\d+(\\.\\d+)?$' },
			transaction_type: { type: 'string', pattern: '^(?!\\s*$).+' }
		},
		required: ['amount', 'transaction_type'],
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

	// update the product

	await db.update(payments).set({ amount: body.amount, transaction_type: body.transaction_type });

	return json({ success: true }, { status: 201 });
};
