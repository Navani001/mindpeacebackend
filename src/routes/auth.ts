import { FastifyInstance } from "fastify";
import { CreateUserController, LoginUserController } from "../controllers/auth";
export async function LoginUserRoute(fastify: FastifyInstance) {
  fastify.post("/login", {
    schema: {
      tags: ["Auth"],
      summary: "Login user",
      description: "Authenticate an existing user and return an access token.",
    },
  }, LoginUserController);
  fastify.post("/create", {
    schema: {
      tags: ["Auth"],
      summary: "Create user",
      description: "Create a new user account and return the created session details.",
    },
  }, CreateUserController);

  // fastify.post("/users", { onRequest: [fastify.authenticate] }, createUser);
}