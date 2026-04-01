import { FastifyInstance } from "fastify";
import { ChatCreationController, CreateChatMessageController, DeleteChatController, GetChatMessagesControllers, GetLatestChatController, GetUserChatsControllers } from "../controllers/chatBot";


export async function ChatRoute(fastify: FastifyInstance) {
  fastify.post("/",{ preHandler: [fastify.authenticate], schema: { tags: ["Chat"], summary: "Create chat", description: "Create a new chatbot conversation.", security: [{ bearerAuth: [] }] } }, ChatCreationController);
  fastify.get("/",{ preHandler: [fastify.authenticate], schema: { tags: ["Chat"], summary: "List chats", description: "Return all chats for the authenticated user.", security: [{ bearerAuth: [] }] } }, GetUserChatsControllers );
  fastify.get("/latest",{ preHandler: [fastify.authenticate], schema: { tags: ["Chat"], summary: "Get latest chat", description: "Return the most recent chat for the authenticated user.", security: [{ bearerAuth: [] }] } }, GetLatestChatController );
  fastify.get("/messages/:chatId",{ preHandler: [fastify.authenticate], schema: { tags: ["Chat"], summary: "Get chat messages", description: "Return messages for a specific chat.", security: [{ bearerAuth: [] }] } }, GetChatMessagesControllers );
  fastify.post("/messages/:chatId",{ preHandler: [fastify.authenticate], schema: { tags: ["Chat"], summary: "Create chat message", description: "Save a new message in a chat conversation.", security: [{ bearerAuth: [] }] } }, CreateChatMessageController );
  fastify.delete("/:chatId",{ preHandler: [fastify.authenticate], schema: { tags: ["Chat"], summary: "Delete chat", description: "Delete a chat conversation for the authenticated user.", security: [{ bearerAuth: [] }] } }, DeleteChatController );


}