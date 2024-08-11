CREATE TABLE `users` (
	`user_id` varchar(36) NOT NULL,
	`username` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`password` text NOT NULL,
	`role` varchar DEFAULT 'user',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	`is_verified` boolean DEFAULT false,
	`verification_token` text NOT NULL,
	`refresh_token` text DEFAULT (''),
	`forget_token` text DEFAULT (''),
	`last_login` timestamp DEFAULT (now()),
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
);
