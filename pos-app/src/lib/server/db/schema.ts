import {
	primaryKey,
	mysqlTable,
	int,
	decimal,
	mysqlEnum,
	datetime,
	varchar
} from 'drizzle-orm/mysql-core';

// products Table
export const products = mysqlTable('products', {
	product_id: int('product_id').primaryKey().autoincrement().notNull(),
	name: varchar('name', { length: 256 }).notNull(),
	unit_price: decimal('unit_price', { precision: 19, scale: 4 }).notNull()
});

// orders Table
export const orders = mysqlTable('orders', {
	order_id: int('order_id').primaryKey().autoincrement().notNull(),
	location_id: int('location_id')
		.references(() => locations.location_id)
		.notNull(),
	order_date: datetime('order_date').notNull()
});

// payments Table
export const payments = mysqlTable('payments', {
	payment_id: int('payment_id').primaryKey().autoincrement().notNull(),
	order_id: int('order_id')
		.references(() => orders.order_id, {
			onDelete: 'cascade',
			onUpdate: 'cascade'
		})
		.notNull(),
	amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
	transaction_type: mysqlEnum('transaction_type', ['e-wallet', 'cash', 'card']).notNull(),
	payment_status: mysqlEnum('payment_status', ['valid', 'void']).notNull()
});

// ingredients Table
export const ingredients = mysqlTable('ingredients', {
	ingredient_id: int('ingredient_id').primaryKey().autoincrement().notNull(),
	name: varchar('name', { length: 256 }).notNull()
});

// locations Table
export const locations = mysqlTable('locations', {
	location_id: int('location_id').primaryKey().autoincrement().notNull(),
	name: varchar('name', { length: 256 }).notNull(),
	street: varchar('street', { length: 256 }).notNull(),
	city: varchar('city', { length: 256 }).notNull(),
	location_status: mysqlEnum('location_status', ['active', 'inactive']).notNull()
});

// JUNCTION TABLES

// product_ingredients Table
export const product_ingredients = mysqlTable(
	'product_ingredients',
	{
		product_id: int('product_id')
			.references(() => products.product_id, { onDelete: 'cascade', onUpdate: 'cascade' })
			.notNull(),
		ingredient_id: int('ingredient_id')
			.references(() => ingredients.ingredient_id, { onDelete: 'cascade', onUpdate: 'cascade' })
			.notNull()
	},
	(table) => [primaryKey({ columns: [table.product_id, table.ingredient_id] })]
);

// product_ingredients Table
export const product_orders = mysqlTable(
	'product_orders',
	{
		product_id: int('product_id')
			.references(() => products.product_id, { onDelete: 'cascade', onUpdate: 'cascade' })
			.notNull(),
		order_id: int('order_id')
			.references(() => orders.order_id, { onDelete: 'cascade', onUpdate: 'cascade' })
			.notNull(),
		quantity: int('quantity').notNull(),
		unit_price: decimal('unit_price', { precision: 19, scale: 4 }).notNull()
	},
	(table) => [primaryKey({ columns: [table.product_id, table.order_id] })]
);
