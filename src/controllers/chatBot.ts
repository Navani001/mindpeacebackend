import { FastifyReply, FastifyRequest } from "fastify";
import { ChatCreation, DeleteChat, GetChatMessages, GetLatestChat, GetUserChats, Message } from "../services/chatBot";

function isDatabaseUnavailableError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes("P1001") ||
    errorMessage.includes("Can't reach database server") ||
    errorMessage.includes("ECONNREFUSED") ||
    errorMessage.includes("ENOTFOUND")
  );
}

export async function ChatCreationController(req: FastifyRequest, reply: FastifyReply) {
  const { name, mood, score } = req.body as { name: string, userId: number, mood: string, score: number };
    const userId = (req.user as { id: number }).id;
  try {
    const result = await  ChatCreation({ name, userId, mood, score });
    if (result.data) {
      return reply.status(200).send({
        success: true,
        message: 'Chat created successfully',
        data: result.data
      });
    } else {
      return reply.status(401).send({
        success: false,
        message: 'Chat creation failed',
        error: 'Invalid data'
      });
    }
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


export async function GetUserChatsControllers(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: number }).id;
  try {
    const result = await  GetUserChats(userId);
    if (result.data) {
      return reply.status(200).send({
        success: true,
        message: 'Chats fetched successfully',
        data: result.data
      });
    } else if (isDatabaseUnavailableError((result as any).error)) {
      return reply.status(503).send({
        success: false,
        message: 'Database unavailable',
        error: 'Unable to connect to database. Please try again later.'
      });
    } else {
      return reply.status(400).send({
        success: false,
        message: 'Chats fetch failed',
        error: 'Invalid data'
      });
    }
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return reply.status(503).send({
        success: false,
        message: 'Database unavailable',
        error: 'Unable to connect to database. Please try again later.'
      });
    }

    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: 'Unexpected server error'
    });
  }
}
export async function GetChatMessagesControllers(req: FastifyRequest, reply: FastifyReply) {
      const { chatId } = req.params as { chatId: string };

  try {
    const result = await  GetChatMessages(chatId);
    if (result.data) {
      return reply.status(200).send({
        success: true,
        message: 'Chats fetched successfully',
        data: result.data
      });
    } else {
      return reply.status(401).send({
        success: false,
        message: 'Chats fetch failed',
        error: 'Invalid data'
      });
    }
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


export async function GetLatestChatController(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: number }).id;
  try {
    const result = await  GetLatestChat(userId);
    if (result.data) {
      return reply.status(200).send({
        success: true,
        message: 'Latest chat fetched successfully',
        data: result.data
      });
    } else {
      return reply.status(401).send({
        success: false,
        message: 'Latest chat fetch failed',
        error: 'Invalid data'
      });
    }
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function CreateChatMessageController(req: FastifyRequest, reply: FastifyReply) {
    const { chatId } = req.params as { chatId: string };
    const { content, sender } = req.body as { content: string, sender: string };
  const chatData={chatId,content,sender};
  
  try {
    const result = await Message(chatData);
    if (result.data) {
      return reply.status(200).send({
        success: true,
        message: 'Chats fetched successfully',
        data: result.data
      });
    } else {
      return reply.status(401).send({
        success: false,
        message: 'Chats fetch failed',
        error: 'Invalid data'
      });
    }
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function DeleteChatController(req: FastifyRequest, reply: FastifyReply) {
  const { chatId } = req.params as { chatId: string };
  
  try {
    const result = await DeleteChat(chatId);
    if (result.data) {
      return reply.status(200).send({
        success: true,
        message: 'Chat deleted successfully',
        data: result.data
      });
    } else {
      return reply.status(404).send({
        success: false,
        message: 'Chat deletion failed',
        error: 'Chat not found'
      });
    }
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}