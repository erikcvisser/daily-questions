-- AlterTable
ALTER TABLE "users" ADD COLUMN "pushNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "pushNotificationTime" TEXT;

-- Backfill: copy existing notificationTime to pushNotificationTime for users with device tokens
UPDATE "users" SET "pushNotificationTime" = "notificationTime"
WHERE "notificationTime" IS NOT NULL
AND "id" IN (SELECT DISTINCT "userId" FROM "device_tokens");
