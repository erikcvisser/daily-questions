-- AlterTable
ALTER TABLE "users" ADD COLUMN "pushNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "pushNotificationTime" TEXT;

-- Backfill: copy existing notificationTime to pushNotificationTime for all users that have one set
UPDATE "users" SET "pushNotificationTime" = "notificationTime"
WHERE "notificationTime" IS NOT NULL;
