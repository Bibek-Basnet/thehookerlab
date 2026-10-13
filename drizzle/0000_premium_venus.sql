CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"enquiry_type" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"organisation" text,
	"contact_method" text NOT NULL,
	"phone" text,
	"age_group" text,
	"level" text,
	"group_size" text,
	"location" text,
	"timing" text,
	"message" text NOT NULL,
	"workshop_topics" text[] DEFAULT '{}'::text[] NOT NULL,
	"consent_contact" boolean NOT NULL,
	"source_page" text,
	"submitted_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_notes" text,
	"notified_at" timestamp with time zone,
	"notify_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expertise_pillars" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"word" text NOT NULL,
	"summary" text NOT NULL,
	"image_src" text NOT NULL,
	"image_alt" text NOT NULL,
	"panel" boolean DEFAULT true NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expertise_pillars_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "expertise_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"pillar_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL,
	"detail" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"format" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"list_title" text NOT NULL,
	"points" text[] DEFAULT '{}'::text[] NOT NULL,
	"image_src" text NOT NULL,
	"image_alt" text NOT NULL,
	"price" numeric(10, 2),
	"price_note" text,
	"show_price" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"level" text NOT NULL,
	"experience" text NOT NULL,
	"focus_areas" text[] DEFAULT '{}'::text[] NOT NULL,
	"goal" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"location" text NOT NULL,
	"privacy_accepted" boolean NOT NULL,
	"accepted_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_notes" text,
	"notified_at" timestamp with time zone,
	"notify_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_copy" (
	"key" text PRIMARY KEY NOT NULL,
	"eyebrow" text NOT NULL,
	"headline" text NOT NULL,
	"headline_accent" text,
	"intro" text,
	"cta_label" text,
	"cta_href" text,
	"hero_image" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"contact_email" text NOT NULL,
	"notification_email" text NOT NULL,
	"from_email" text NOT NULL,
	"from_name" text NOT NULL,
	"show_pricing" boolean DEFAULT false NOT NULL,
	"currency" text DEFAULT 'NZD' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"org" text NOT NULL,
	"image_src" text NOT NULL,
	"quote" text NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expertise_skills" ADD CONSTRAINT "expertise_skills_pillar_id_expertise_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."expertise_pillars"("id") ON DELETE cascade ON UPDATE no action;