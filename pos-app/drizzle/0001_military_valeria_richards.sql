ALTER TABLE `product_ingredients` DROP FOREIGN KEY `product_ingredients_product_id_products_product_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_ingredients` DROP FOREIGN KEY `product_ingredients_ingredient_id_ingredients_ingredient_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_orders` DROP FOREIGN KEY `product_orders_product_id_products_product_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_orders` DROP FOREIGN KEY `product_orders_order_id_orders_order_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_ingredients` ADD CONSTRAINT `product_ingredients_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_ingredients` ADD CONSTRAINT `product_ingredients_ingredient_id_ingredients_ingredient_id_fk` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`ingredient_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_orders` ADD CONSTRAINT `product_orders_product_id_products_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_orders` ADD CONSTRAINT `product_orders_order_id_orders_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE cascade ON UPDATE no action;