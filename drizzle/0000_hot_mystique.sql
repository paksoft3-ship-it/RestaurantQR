CREATE TABLE "activity" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_id" text NOT NULL,
	"timestamp" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"data" jsonb NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "branding" (
	"restaurant_id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"slug" text NOT NULL,
	"status" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"type" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"status" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"created_at" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_products" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"category_id" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nfc_products" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opening_hours" (
	"restaurant_id" text NOT NULL,
	"day" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL,
	CONSTRAINT "opening_hours_restaurant_id_day_pk" PRIMARY KEY("restaurant_id","day")
);
--> statement-breakpoint
CREATE TABLE "qr_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" text PRIMARY KEY NOT NULL,
	"internal_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"operational_status" text NOT NULL,
	"publishing_status" text NOT NULL,
	"setup_status" text NOT NULL,
	"visual_direction" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"data" jsonb NOT NULL,
	CONSTRAINT "restaurants_slug_unique" UNIQUE("slug")
);
