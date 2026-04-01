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
  fastify.get("/dashboard", { preHandler: [fastify.authenticate], schema: { tags: ["Analytics"], summary: "Get dashboard data", description: "Return dashboard metrics and wellness overview.", security: [{ bearerAuth: [] }] } }, GetDashboardDataController);
  fastify.get("/insights", { preHandler: [fastify.authenticate], schema: { tags: ["Analytics"], summary: "Get insights", description: "Return detailed analytics insights for the authenticated user.", security: [{ bearerAuth: [] }] } }, GetAnalyticsDataController);
  fastify.get("/tasks", { preHandler: [fastify.authenticate], schema: { tags: ["Analytics"], summary: "List wellness tasks", description: "Return wellness tasks for the authenticated user.", security: [{ bearerAuth: [] }] } }, GetWellnessTasksController);

  fastify.post("/check-in", { preHandler: [fastify.authenticate], schema: { tags: ["Analytics"], summary: "Save mood check-in", description: "Save a daily mood check-in for the authenticated user.", security: [{ bearerAuth: [] }] } }, SaveMoodCheckInController);
  fastify.post("/mindful-session", { preHandler: [fastify.authenticate], schema: { tags: ["Analytics"], summary: "Create mindful session", description: "Create a mindful session record.", security: [{ bearerAuth: [] }] } }, CreateMindfulSessionController);
  fastify.post("/tasks", { preHandler: [fastify.authenticate], schema: { tags: ["Analytics"], summary: "Create wellness task", description: "Create a wellness task for the authenticated user.", security: [{ bearerAuth: [] }] } }, CreateWellnessTaskController);
  fastify.patch("/tasks/:taskId", { preHandler: [fastify.authenticate], schema: { tags: ["Analytics"], summary: "Update wellness task", description: "Update the completion status of a wellness task.", security: [{ bearerAuth: [] }] } }, UpdateWellnessTaskStatusController);
}
