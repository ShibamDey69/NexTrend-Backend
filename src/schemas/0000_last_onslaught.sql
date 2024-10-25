CREATE TABLE IF NOT EXISTS "users" (
	"user_id" varchar(36) PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"password" text NOT NULL,
	"role" varchar(10) DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_verified" boolean DEFAULT false,
	"verification_token" text DEFAULT NULL,
	"vt_created_at" timestamp DEFAULT now(),
	"vt_gen_count" integer DEFAULT 0,
	"refresh_token" text NOT NULL,
	"forget_token" text DEFAULT NULL,
	"last_login" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
