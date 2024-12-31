-- AlterTable
ALTER TABLE "questions" 
DROP COLUMN "day_of_week",
ADD COLUMN "days_of_week" INTEGER[] DEFAULT ARRAY[]::INTEGER[]; 