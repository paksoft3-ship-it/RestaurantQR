CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"type" text NOT NULL,
	"channel" text,
	"action_type" text,
	"target" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "events_restaurant_created_idx" ON "events" USING btree ("restaurant_id","created_at");