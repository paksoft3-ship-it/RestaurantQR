CREATE TABLE "menu_pdfs" (
	"restaurant_id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"file_size" integer NOT NULL,
	"content_base64" text NOT NULL,
	"uploaded_at" text NOT NULL
);
