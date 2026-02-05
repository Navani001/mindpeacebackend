import { FastifyInstance } from "fastify";
import { ChatCreationController, CreateChatMessageController, GetChatMessagesControllers, GetUserChatsControllers } from "../controllers/chatBot";


export async function ChatRoute(fastify: FastifyInstance) {
  fastify.post("/",{preHandler: [fastify.authenticate]}, ChatCreationController);
  fastify.get("/",{preHandler: [fastify.authenticate]}, GetUserChatsControllers );
  fastify.get("/messages/:chatId",{preHandler: [fastify.authenticate]}, GetChatMessagesControllers );
  fastify.post("/messages/:chatId",{preHandler: [fastify.authenticate]}, CreateChatMessageController );


}