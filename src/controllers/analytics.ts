import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateMindfulSession,
  CreateWellnessTask,
  GetAnalyticsData,
  GetDashboardData,
  GetWellnessTasks,
  UpdateWellnessTaskStatus,
  UpsertMoodCheckIn,
} from "../services/analytics";

export async function SaveMoodCheckInController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const { moodLabel, moodScore, notes, checkInDate } = req.body as {
    moodLabel: string;
    moodScore: number;
    notes?: string;
    checkInDate?: string;
  };

  try {
    const result = await UpsertMoodCheckIn({ userId, moodLabel, moodScore, notes, checkInDate });
    if (result.data) {
      return reply.status(200).send({ success: true, message: "Mood check-in saved", data: result.data });
    }
    return reply.status(400).send({ success: false, message: "Mood check-in failed", error: "Invalid data" });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function CreateMindfulSessionController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const { durationMinutes, activity, sessionDate } = req.body as {
    durationMinutes: number;
    activity?: string;
    sessionDate?: string;
  };

  try {
    const result = await CreateMindfulSession({ userId, durationMinutes, activity, sessionDate });
    if (result.data) {
      return reply.status(201).send({ success: true, message: "Mindful session created", data: result.data });
    }
    return reply.status(400).send({ success: false, message: "Mindful session failed", error: "Invalid data" });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function CreateWellnessTaskController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const { taskText, targetDate } = req.body as { taskText: string; targetDate?: string };

  try {
    const result = await CreateWellnessTask({ userId, taskText, targetDate });
    if (result.data) {
      return reply.status(201).send({ success: true, message: "Task created", data: result.data });
    }
    return reply.status(400).send({ success: false, message: "Task creation failed", error: "Invalid data" });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function UpdateWellnessTaskStatusController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const { taskId } = req.params as { taskId: string };
  const { completed } = req.body as { completed: boolean };

  try {
    const result = await UpdateWellnessTaskStatus({ userId, taskId, completed });
    if (result.data) {
      return reply.status(200).send({ success: true, message: "Task updated", data: result.data });
    }
    return reply.status(404).send({ success: false, message: "Task update failed", error: "Task not found" });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function GetDashboardDataController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;

  try {
    const result = await GetDashboardData(userId);
    if (result.data) {
      return reply.status(200).send({ success: true, message: "Dashboard data fetched", data: result.data });
    }
    return reply.status(400).send({ success: false, message: "Dashboard fetch failed", error: "Invalid data" });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function GetAnalyticsDataController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;

  try {
    const result = await GetAnalyticsData(userId);
    if (result.data) {
      return reply.status(200).send({ success: true, message: "Analytics data fetched", data: result.data });
    }
    return reply.status(400).send({ success: false, message: "Analytics fetch failed", error: "Invalid data" });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function GetWellnessTasksController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const { date } = req.query as { date?: string };

  try {
    const result = await GetWellnessTasks(userId, date);
    if (result.data) {
      return reply.status(200).send({ success: true, message: "Tasks fetched", data: result.data });
    }
    return reply.status(400).send({ success: false, message: "Task fetch failed", error: "Invalid data" });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
