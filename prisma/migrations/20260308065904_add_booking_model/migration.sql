-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "consultantId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "message" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Booking_consultantId_status_idx" ON "Booking"("consultantId", "status");

-- CreateIndex
CREATE INDEX "Booking_studentId_status_idx" ON "Booking"("studentId", "status");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
