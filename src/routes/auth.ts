import { FastifyInstance } from "fastify";
import { CreateUserController, LoginUserController } from "../controllers/auth";
export async function LoginUserRoute(fastify: FastifyInstance) {
  fastify.post("/login", LoginUserController);
  fastify.post("/create", CreateUserController);

  // fastify.post("/users", { onRequest: [fastify.authenticate] }, createUser);
}