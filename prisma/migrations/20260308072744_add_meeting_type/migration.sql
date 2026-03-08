-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('online', 'offline');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "meetingType" "MeetingType" NOT NULL DEFAULT 'online';
