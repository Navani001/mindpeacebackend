import { FastifyInstance } from "fastify";
import {
  CreateMindfulSessionController,
  CreateWellnessTaskController,
  GetAnalyticsDataController,
  GetDashboardDataController,
  GetWellnessTasksController,
  SaveMoodCheckInController,
  UpdateWellnessTaskStatusController,
} from "../controllers/analytics";

export async function AnalyticsRoute(fastify: FastifyInstance) {
  fastify.get("/dashboard", { preHandler: [fastify.authenticate] }, GetDashboardDataController);
  fastify.get("/insights", { preHandler: [fastify.authenticate] }, GetAnalyticsDataController);
  fastify.get("/tasks", { preHandler: [fastify.authenticate] }, GetWellnessTasksController);

  fastify.post("/check-in", { preHandler: [fastify.authenticate] }, SaveMoodCheckInController);
  fastify.post("/mindful-session", { preHandler: [fastify.authenticate] }, CreateMindfulSessionController);
  fastify.post("/tasks", { preHandler: [fastify.authenticate] }, CreateWellnessTaskController);
  fastify.patch("/tasks/:taskId", { preHandler: [fastify.authenticate] }, UpdateWellnessTaskStatusController);
}
