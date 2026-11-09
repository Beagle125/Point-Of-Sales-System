ALTER TABLE `locations` ADD `location_status` enum('active','inactive') NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `payment_status` enum('valid','void') NOT NULL;