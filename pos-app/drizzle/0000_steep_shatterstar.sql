CREATE TABLE `ingredients` (
	`ingredient_id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	CONSTRAINT `ingredients_ingredient_id` PRIMARY KEY(`ingredient_id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`location_id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`street` varchar(256) NOT NULL,
	`city` varchar(256) NOT NULL,
	CONSTRAINT `locations_location_id` PRIMARY KEY(`location_id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`order_id` int AUTO_INCREMENT NOT NULL,
	`location_id` int NOT NULL,
	`order_date` datetime NOT NULL,
	CONSTRAINT `orders_order_id` PRIMARY KEY(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`payment_id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`amount` decimal(19,4) NOT NULL,
	`transaction_type` enum('e-wallet','cash','card') NOT NULL,
	CONSTRAINT `payments_payment_id` PRIMARY KEY(`payment_id`)
);
--> statement-breakpoint
CREATE TABLE `product_ingredients` (
	`product_id` int NOT NULL,
	`ingredient_id` int NOT NULL,
	CONSTRAINT `product_ingredients_product_id_ingredient_id_pk` PRIMARY KEY(`product_id`,`ingredient_id`)
);
--> statement-breakpoint
CREATE TABLE `product_orders` (
	`product_id` int NOT NULL,
	`order_id` int NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(19,4) NOT NULL,
	CONSTRAINT `product_orders_product_id_order_id_pk` PRIMARY KEY(`product_id`,`order_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`product_id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`unit_price` decimal(19,4) NOT NULL,
	CONSTRAINT `products_product_id` PRIMARY KEY(`product_id`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_location_id_locations_location_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`location_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_orders_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `product_ingredients` ADD CONSTRAINT `product_ingredients_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_ingredients` ADD CONSTRAINT `product_ingredients_ingredient_id_ingredients_ingredient_id_fk` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`ingredient_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_orders` ADD CONSTRAINT `product_orders_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_orders` ADD CONSTRAINT `product_orders_order_id_orders_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE no action ON UPDATE no action;