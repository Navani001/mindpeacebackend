import { FastifyInstance } from "fastify";
import { ChatCreationController, CreateChatMessageController, DeleteChatController, GetChatMessagesControllers, GetLatestChatController, GetUserChatsControllers } from "../controllers/chatBot";


export async function ChatRoute(fastify: FastifyInstance) {
  fastify.post("/",{preHandler: [fastify.authenticate]}, ChatCreationController);
  fastify.get("/",{preHandler: [fastify.authenticate]}, GetUserChatsControllers );
  fastify.get("/latest",{preHandler: [fastify.authenticate]}, GetLatestChatController );
  fastify.get("/messages/:chatId",{preHandler: [fastify.authenticate]}, GetChatMessagesControllers );
  fastify.post("/messages/:chatId",{preHandler: [fastify.authenticate]}, CreateChatMessageController );
  fastify.delete("/:chatId",{preHandler: [fastify.authenticate]}, DeleteChatController );


}