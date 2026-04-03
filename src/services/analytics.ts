import prisma from "../lib/prisma";

const getDateOnly = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const moodLabels = ["Awful", "Bad", "Okay", "Good", "Great"];

const buildDefaultTasksFromRecentMood = (recentMoodScores: number[]) => {
  if (!recentMoodScores.length) {
    return [
      "Take a 10-minute mindful breathing break",
      "Drink water and stretch for 5 minutes",
      "Write one sentence about how you feel today",
    ];
  }

  const avgMood = recentMoodScores.reduce((acc, score) => acc + score, 0) / recentMoodScores.length;

  if (avgMood <= 2) {
    return [
      "Take a gentle 10-minute walk",
      "Try a 5-minute grounding exercise",
      "Message someone you trust today",
    ];
  }

  if (avgMood <= 3) {
    return [
      "Do a 10-minute mindfulness session",
      "Journal 3 things that felt okay today",
      "Take a short break away from screens",
    ];
  }

  return [
    "Keep momentum with a 15-minute focus block",
    "Do one act of self-care you enjoy",
    "Reflect on one positive moment from today",
  ];
};

export async function UpsertMoodCheckIn(data: {
  userId: number;
  moodLabel: string;
  moodScore: number;
  notes?: string;
  checkInDate?: string;
}) {
  if (!data.userId) return { message: "no userId provided", data: null };

  try {
    const checkInDate = getDateOnly(data.checkInDate);
    const moodCheckIn = await prisma.moodCheckIn.upsert({
      where: {
        userId_checkInDate: {
          userId: data.userId,
          checkInDate,
        },
      },
      update: {
        moodLabel: data.moodLabel,
        moodScore: data.moodScore,
        notes: data.notes,
      },
      create: {
        userId: data.userId,
        moodLabel: data.moodLabel,
        moodScore: data.moodScore,
        notes: data.notes,
        checkInDate,
      },
    });

    return { message: "Mood check-in saved", data: { moodCheckIn } };
  } catch (err) {
    console.error("Error saving mood check-in:", err);
    return { message: "Mood check-in failed", data: null };
  }
}

export async function CreateMindfulSession(data: {
  userId: number;
  durationMinutes: number;
  activity?: string;
  sessionDate?: string;
}) {
  if (!data.userId) return { message: "no userId provided", data: null };

  try {
    const mindfulSession = await prisma.mindfulSession.create({
      data: {
        userId: data.userId,
        durationMinutes: data.durationMinutes,
        activity: data.activity,
        sessionDate: getDateOnly(data.sessionDate),
      },
    });

    return { message: "Mindful session saved", data: { mindfulSession } };
  } catch (err) {
    console.error("Error saving mindful session:", err);
    return { message: "Mindful session failed", data: null };
  }
}

export async function CreateWellnessTask(data: {
  userId: number;
  taskText: string;
  targetDate?: string;
}) {
  if (!data.userId) return { message: "no userId provided", data: null };

  try {
    const task = await prisma.wellnessTaskLog.create({
      data: {
        userId: data.userId,
        taskText: data.taskText,
        targetDate: getDateOnly(data.targetDate),
      },
    });

    return { message: "Task created", data: { task } };
  } catch (err) {
    console.error("Error creating task:", err);
    return { message: "Task creation failed", data: null };
  }
}

export async function UpdateWellnessTaskStatus(data: {
  userId: number;
  taskId: string;
  completed: boolean;
}) {
  if (!data.userId) return { message: "no userId provided", data: null };

  try {
    const existing = await prisma.wellnessTaskLog.findFirst({
      where: { id: data.taskId, userId: data.userId },
    });

    if (!existing) return { message: "Task not found", data: null };

    const task = await prisma.wellnessTaskLog.update({
      where: { id: data.taskId },
      data: {
        completed: data.completed,
        completedAt: data.completed ? new Date() : null,
      },
    });

    return { message: "Task updated", data: { task } };
  } catch (err) {
    console.error("Error updating task:", err);
    return { message: "Task update failed", data: null };
  }
}

export async function GetDashboardData(userId: number) {
  if (!userId) return { message: "no userId provided", data: null };

  try {
    const today = getDateOnly();

    const [allCheckIns, todayCheckIn, mindfulSessions, todayTasksResult, lastYearCheckIns] = await Promise.all([
      prisma.moodCheckIn.findMany({ where: { userId }, orderBy: { checkInDate: "asc" } }),
      prisma.moodCheckIn.findFirst({
        where: {
          userId,
          checkInDate: today,
        },
      }),
      prisma.mindfulSession.findMany({ where: { userId } }),
      prisma.wellnessTaskLog.findMany({
        where: {
          userId,
          targetDate: today,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.moodCheckIn.findMany({
        where: {
          userId,
          checkInDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 365)),
          },
        },
        orderBy: { checkInDate: "asc" },
      }),
    ]);

    let todayTasks = todayTasksResult;
    if (todayTasks.length === 0) {
      const recentMoodScores = allCheckIns.slice(-3).map((item) => item.moodScore);
      const defaultTaskTexts = buildDefaultTasksFromRecentMood(recentMoodScores);

      todayTasks = await Promise.all(
        defaultTaskTexts.map((taskText) =>
          prisma.wellnessTaskLog.create({
            data: {
              userId,
              taskText,
              targetDate: today,
            },
          })
        )
      );
    }

    const totalCheckIns = allCheckIns.length;
    const avgMoodScore = totalCheckIns
      ? Number((allCheckIns.reduce((acc, item) => acc + item.moodScore, 0) / totalCheckIns).toFixed(1))
      : 0;
    const mindfulMinutes = mindfulSessions.reduce((acc, item) => acc + item.durationMinutes, 0);

    const checkInDateSet = new Set(
      allCheckIns.map((item) => item.checkInDate.toISOString().split("T")[0])
    );

    let streak = 0;
    const cursor = new Date();
    while (true) {
      const key = cursor.toISOString().split("T")[0];
      if (!checkInDateSet.has(key)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Build a lookup map of existing check-ins by date string
    const checkInByDate = new Map(
      lastYearCheckIns.map((item) => [
        item.checkInDate.toISOString().split("T")[0],
        item,
      ])
    );

    // Generate a full 365-day array, filling missing days with level 0
    const activityData: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
    const heatmapToday = new Date();
    heatmapToday.setHours(0, 0, 0, 0);
    for (let i = 364; i >= 0; i--) {
      const d = new Date(heatmapToday);
      d.setDate(heatmapToday.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const existing = checkInByDate.get(key);
      activityData.push({
        date: key,
        count: existing ? existing.moodScore : 0,
        level: existing ? (Math.min(existing.moodScore, 4) as 0 | 1 | 2 | 3 | 4) : 0,
      });
    }

    return {
      message: "Dashboard data fetched",
      data: {
        streak,
        totalCheckIns,
        avgMoodScore,
        mindfulMinutes,
        todayCheckIn,
        todayTasks,
        activityData,
      },
    };
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return { message: "Dashboard fetch failed", data: null };
  }
}

export async function GetAnalyticsData(userId: number) {
  if (!userId) return { message: "no userId provided", data: null };

  try {
    const [allCheckIns, last7Days] = await Promise.all([
      prisma.moodCheckIn.findMany({ where: { userId }, orderBy: { checkInDate: "asc" } }),
      prisma.moodCheckIn.findMany({
        where: {
          userId,
          checkInDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 6)),
          },
        },
        orderBy: { checkInDate: "asc" },
      }),
    ]);

    const total = allCheckIns.length || 1;

    const moodDistribution = moodLabels.map((label) => {
      const count = allCheckIns.filter((item) => item.moodLabel === label).length;
      return {
        label,
        percentage: Math.round((count / total) * 100),
        count,
      };
    });

    const weeklyData = last7Days.map((item) => ({
      day: item.checkInDate.toLocaleDateString("en-US", { weekday: "short" }),
      score: item.moodScore,
      label: item.moodLabel,
      date: item.checkInDate,
    }));

    const avgMoodScore = allCheckIns.length
      ? Number((allCheckIns.reduce((acc, item) => acc + item.moodScore, 0) / allCheckIns.length).toFixed(1))
      : 0;

    return {
      message: "Analytics data fetched",
      data: {
        moodDistribution,
        weeklyData,
        totalCheckIns: allCheckIns.length,
        avgMoodScore,
      },
    };
  } catch (err) {
    console.error("Error fetching analytics data:", err);
    return { message: "Analytics fetch failed", data: null };
  }
}

export async function GetWellnessTasks(userId: number, date?: string) {
  if (!userId) return { message: "no userId provided", data: null };

  try {
    const target = getDateOnly(date);
    const tasks = await prisma.wellnessTaskLog.findMany({
      where: {
        userId,
        targetDate: target,
      },
      orderBy: { createdAt: "asc" },
    });

    return { message: "Tasks fetched", data: { tasks } };
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return { message: "Task fetch failed", data: null };
  }
}
