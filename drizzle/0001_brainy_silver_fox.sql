ALTER TABLE "programs" ADD COLUMN "price_from" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
UPDATE "programs" SET "price_from" = false WHERE "slug" = 'online-one-on-one';
