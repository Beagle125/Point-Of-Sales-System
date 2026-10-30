import { mysqlTable, int, decimal, mysqlEnum, datetime } from 'drizzle-orm/mysql-core';

// Orders Table
export const orders = mysqlTable('orders', {
	order_id: int('order_id').primaryKey(),
	location_id: int('location_id'),
	order_date: datetime('order_date'),
})

// Payments Table
export const payments = mysqlTable('payments', {
	payment_id: int('payment_id').primaryKey(),
	order_id: int('order_id').references(() => orders.order_id, { onDelete: 'cascade', onUpdate: 'cascade' }), 
	amount: decimal('amount'),
	transaction_type: mysqlEnum('transaction_type', ["e-wallet", "cash", "card"])
})