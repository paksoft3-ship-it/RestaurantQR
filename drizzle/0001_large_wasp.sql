CREATE TABLE "faq_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"status" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"locale" text NOT NULL,
	"status" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_imports" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"processing_status" text NOT NULL,
	"created_at" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_content" (
	"id" text PRIMARY KEY NOT NULL,
	"page" text NOT NULL,
	"section" text NOT NULL,
	"status" text NOT NULL,
	"data" jsonb NOT NULL
);
