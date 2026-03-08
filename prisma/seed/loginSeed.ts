import { roles } from "@prisma/client";
import prisma from "../../src/lib/prisma";

const dateOnly = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date;
};

async function loginSeed() {
  const userSeedData = [
    {
      name: "John Doe",
      email: "newuser@example.com",
      password: "password123",
      role: "student" as const,
      phoneNumber: "+1234567890",
    },
    {
      name: "Admin User",
      email: "admin@mindcare.com",
      password: "password123",
      role: roles.consultant,
      phoneNumber: "+1234500000",
    },
    {
      name: "Jane Student",
      email: "jane@example.com",
      password: "password123",
      role: "consultant" as const,
      phoneNumber: "+1234567000",
    },
  ];

  const users = [] as Array<{ id: number; email: string }>;

  for (const user of userSeedData) {
    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isDeleted: false,
      },
      create: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    });

    users.push({ id: upserted.id, email: upserted.email });
  }

  const primaryUser = users.find((item) => item.email === "newuser@example.com");
  const secondaryUser = users.find((item) => item.email === "jane@example.com");

  if (!primaryUser || !secondaryUser) {
    throw new Error("Required seed users not found");
  }

  await prisma.messages.deleteMany({});
  await prisma.chats.deleteMany({});
  await prisma.trustNumber.deleteMany({});
  await prisma.moodCheckIn.deleteMany({});
  await prisma.mindfulSession.deleteMany({});
  await prisma.wellnessTaskLog.deleteMany({});

  await prisma.trustNumber.createMany({
    data: [
      { id: "tn-1", userId: primaryUser.id, number: "+15550000001" },
      { id: "tn-2", userId: primaryUser.id, number: "+15550000002" },
      { id: "tn-3", userId: secondaryUser.id, number: "+15550000003" },
    ],
  });

  await prisma.chats.createMany({
    data: [
      {
        id: "chat-1001",
        name: "Managing Anxiety Before Exams",
        mood: "Anxious",
        score: -3,
        userId: primaryUser.id,
      },
      {
        id: "chat-1002",
        name: "Daily Gratitude Reflection",
        mood: "Calm",
        score: 6,
        userId: primaryUser.id,
      },
      {
        id: "chat-2001",
        name: "Work-Life Balance",
        mood: "Reflective",
        score: 2,
        userId: secondaryUser.id,
      },
    ],
  });

  await prisma.messages.createMany({
    data: [
      {
        id: "msg-1",
        chatId: "chat-1001",
        sender: "user",
        content: "I am feeling stressed about my upcoming exams.",
      },
      {
        id: "msg-2",
        chatId: "chat-1001",
        sender: "assistant",
        content: "That sounds tough. Let's break your study schedule into smaller steps.",
      },
      {
        id: "msg-3",
        chatId: "chat-1002",
        sender: "user",
        content: "Today I am grateful for my friends and family.",
      },
      {
        id: "msg-4",
        chatId: "chat-1002",
        sender: "assistant",
        content: "That's wonderful. Gratitude journaling can really boost mood over time.",
      },
      {
        id: "msg-5",
        chatId: "chat-2001",
        sender: "user",
        content: "I am struggling to switch off after work.",
      },
      {
        id: "msg-6",
        chatId: "chat-2001",
        sender: "assistant",
        content: "Try a short wind-down routine, like walking or breathing for 10 minutes.",
      },
    ],
  });

  const moodCheckIns = [
    { day: -6, label: "Bad", score: 2 },
    { day: -5, label: "Okay", score: 3 },
    { day: -4, label: "Good", score: 4 },
    { day: -3, label: "Great", score: 5 },
    { day: -2, label: "Okay", score: 3 },
    { day: -1, label: "Good", score: 4 },
    { day: 0, label: "Great", score: 5 },
  ];

  for (const item of moodCheckIns) {
    await prisma.moodCheckIn.upsert({
      where: {
        userId_checkInDate: {
          userId: primaryUser.id,
          checkInDate: dateOnly(item.day),
        },
      },
      update: {
        moodLabel: item.label,
        moodScore: item.score,
        notes: "Seeded mood check-in",
      },
      create: {
        userId: primaryUser.id,
        moodLabel: item.label,
        moodScore: item.score,
        notes: "Seeded mood check-in",
        checkInDate: dateOnly(item.day),
      },
    });
  }

  await prisma.mindfulSession.createMany({
    data: [
      {
        id: "ms-1",
        userId: primaryUser.id,
        durationMinutes: 10,
        activity: "Breathing Exercise",
        sessionDate: dateOnly(-2),
      },
      {
        id: "ms-2",
        userId: primaryUser.id,
        durationMinutes: 20,
        activity: "Meditation",
        sessionDate: dateOnly(-1),
      },
      {
        id: "ms-3",
        userId: primaryUser.id,
        durationMinutes: 15,
        activity: "Mindful Walk",
        sessionDate: dateOnly(0),
      },
    ],
  });

  await prisma.wellnessTaskLog.createMany({
    data: [
      {
        id: "wt-1",
        userId: primaryUser.id,
        taskText: "5-min Breathing Exercise",
        targetDate: dateOnly(0),
        completed: true,
        completedAt: new Date(),
      },
      {
        id: "wt-2",
        userId: primaryUser.id,
        taskText: "Write 3 things you're grateful for",
        targetDate: dateOnly(0),
        completed: false,
      },
      {
        id: "wt-3",
        userId: primaryUser.id,
        taskText: "Drink a glass of water",
        targetDate: dateOnly(0),
        completed: true,
        completedAt: new Date(),
      },
      {
        id: "wt-4",
        userId: primaryUser.id,
        taskText: "Take a short walk",
        targetDate: dateOnly(0),
        completed: false,
      },
    ],
  });
}

export default loginSeed;