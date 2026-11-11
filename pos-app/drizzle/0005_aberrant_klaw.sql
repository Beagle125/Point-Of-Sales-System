ALTER TABLE `locations` RENAME COLUMN `location_status` TO `location_validity`;--> statement-breakpoint
ALTER TABLE `locations` MODIFY COLUMN `location_validity` enum('void','valid') NOT NULL;--> statement-breakpoint
ALTER TABLE `ingredients` ADD `ingredient_validity` enum('valid','void') NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `order_validity` enum('valid','void') NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `product_validity` enum('valid','void') NOT NULL;