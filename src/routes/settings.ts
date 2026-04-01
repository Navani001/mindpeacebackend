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
  fastify.get("/profile", { preHandler: [fastify.authenticate], schema: { tags: ["Settings"], summary: "Get profile", description: "Return the authenticated user's profile.", security: [{ bearerAuth: [] }] } }, GetProfileController);
  fastify.put("/profile", { preHandler: [fastify.authenticate], schema: { tags: ["Settings"], summary: "Update profile", description: "Update the authenticated user's profile details.", security: [{ bearerAuth: [] }] } }, UpdateProfileController);
  fastify.put("/password", { preHandler: [fastify.authenticate], schema: { tags: ["Settings"], summary: "Change password", description: "Change the authenticated user's password.", security: [{ bearerAuth: [] }] } }, ChangePasswordController);

  // Emergency / Trust Numbers
  fastify.get("/trust-numbers", { preHandler: [fastify.authenticate], schema: { tags: ["Settings"], summary: "List trust numbers", description: "Return saved trust numbers for the authenticated user.", security: [{ bearerAuth: [] }] } }, GetTrustNumbersController);
  fastify.post("/trust-numbers", { preHandler: [fastify.authenticate], schema: { tags: ["Settings"], summary: "Add trust number", description: "Add a new emergency or trust contact.", security: [{ bearerAuth: [] }] } }, AddTrustNumberController);
  fastify.delete("/trust-numbers/:numberId", { preHandler: [fastify.authenticate], schema: { tags: ["Settings"], summary: "Delete trust number", description: "Delete a saved trust number.", security: [{ bearerAuth: [] }] } }, DeleteTrustNumberController);
}
