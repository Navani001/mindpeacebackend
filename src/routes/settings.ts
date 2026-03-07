import { FastifyInstance } from "fastify";
import {
  GetProfileController,
  UpdateProfileController,
  ChangePasswordController,
  GetTrustNumbersController,
  AddTrustNumberController,
  DeleteTrustNumberController,
} from "../controllers/settings";

export async function SettingsRoute(fastify: FastifyInstance) {
  // Profile
  fastify.get("/profile", { preHandler: [fastify.authenticate] }, GetProfileController);
  fastify.put("/profile", { preHandler: [fastify.authenticate] }, UpdateProfileController);
  fastify.put("/password", { preHandler: [fastify.authenticate] }, ChangePasswordController);

  // Emergency / Trust Numbers
  fastify.get("/trust-numbers", { preHandler: [fastify.authenticate] }, GetTrustNumbersController);
  fastify.post("/trust-numbers", { preHandler: [fastify.authenticate] }, AddTrustNumberController);
  fastify.delete("/trust-numbers/:numberId", { preHandler: [fastify.authenticate] }, DeleteTrustNumberController);
}
