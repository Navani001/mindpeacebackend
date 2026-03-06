-- CreateTable
CREATE TABLE "MoodCheckIn" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "moodLabel" TEXT NOT NULL,
    "moodScore" INTEGER NOT NULL,
    "notes" TEXT,
    "checkInDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MindfulSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "activity" TEXT,
    "sessionDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MindfulSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellnessTaskLog" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "taskText" TEXT NOT NULL,
    "targetDate" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WellnessTaskLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MoodCheckIn_userId_checkInDate_idx" ON "MoodCheckIn"("userId", "checkInDate");

-- CreateIndex
CREATE INDEX "MoodCheckIn_userId_moodScore_idx" ON "MoodCheckIn"("userId", "moodScore");

-- CreateIndex
CREATE UNIQUE INDEX "MoodCheckIn_userId_checkInDate_key" ON "MoodCheckIn"("userId", "checkInDate");

-- CreateIndex
CREATE INDEX "MindfulSession_userId_sessionDate_idx" ON "MindfulSession"("userId", "sessionDate");

-- CreateIndex
CREATE INDEX "WellnessTaskLog_userId_targetDate_idx" ON "WellnessTaskLog"("userId", "targetDate");

-- CreateIndex
CREATE INDEX "WellnessTaskLog_userId_completed_idx" ON "WellnessTaskLog"("userId", "completed");

-- AddForeignKey
ALTER TABLE "MoodCheckIn" ADD CONSTRAINT "MoodCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindfulSession" ADD CONSTRAINT "MindfulSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WellnessTaskLog" ADD CONSTRAINT "WellnessTaskLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
