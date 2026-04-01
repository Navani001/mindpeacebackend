import prisma from "../lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { encrypt, safeDecrypt } from "../lib/crypto";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "" });

// ── Embedding helpers ─────────────────────────────────────────────────────────

/** Generate a text embedding vector using Google's gemini-embedding-001 model (3072 dims) */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result: any = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });
    const values = result.embeddings?.[0]?.values ?? [];
    console.log("Embedding generated, dim:", values.length);
    return values;
  } catch (err) {
    console.error("Embedding generation failed:", err);
    return [];
  }
}

/**
 * Find the top-K most semantically similar past user messages in a chat
 * using native pgvector cosine distance (`<=>`).
 * Returns decrypted content strings sorted by similarity.
 */
async function findSimilarMessages(chatId: string, queryText: string, topK = 5): Promise<string[]> {
  const queryVec = await generateEmbedding(queryText);
  if (!queryVec.length) return [];

  // Format as pgvector literal: '[0.1,0.2,...]'
  const vectorLiteral = `[${queryVec.join(",")}]`;

  // Native pgvector cosine distance search — low distance = high similarity
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT content, 1 - (embedding <=> '${vectorLiteral}'::vector) AS similarity
    FROM messages
    WHERE "chatId" = '${chatId}' AND sender = 'user' AND embedding IS NOT NULL
    ORDER BY embedding <=> '${vectorLiteral}'::vector
    LIMIT ${topK}
  `);

  return rows
    .filter((r) => parseFloat(r.similarity) > 0.5)
    .map((r) => safeDecrypt(r.content));
}

/** Decrypt message fields from DB */
function decryptMessage(msg: any) {
  return { ...msg, content: safeDecrypt(msg.content) };
}

/** Decrypt chat metadata fields from DB */
function decryptChat(chat: any) {
  if (!chat) return chat;
  return {
    ...chat,
    name: safeDecrypt(chat.name),
    mood: safeDecrypt(chat.mood),
    messages: chat.messages ? chat.messages.map(decryptMessage) : undefined,
  };
}

export async function UpdateChat(data: any) {
  if (!data) {
    console.log("No data provided");
    return { message: "no data provided", data: null };
  }

  try {
    const chat = await prisma.chats.update({
      where: { id: data.id },
      data: {
        name: encrypt(data.name),
        userId: data.userId,
        mood: encrypt(data.mood),
        score: data.score,
      },
    });

    return { message: "Chat updated successfully", data: { chat: decryptChat(chat) } };
  } catch (err) {
    return { message: "Chat update failed", data: null };
  }
}
export async function ChatCreation(data: any) {
  if (!data) {
    console.log("No data provided");
    return { message: "no data provided", data: null };
  }

  try {
    const chat = await prisma.chats.create({
      data: {
        name: encrypt(data.name),
        userId: data.userId,
        mood: encrypt(data.mood),
        score: data.score,
      },
    });

    return { message: "Chat created successfully", data: { chat: decryptChat(chat) } };
  } catch (err) {
    return { message: "Chat creation failed", data: null };
  }
}
export async function GetUserChats(userId: number) {
  if (!userId) {
    console.log("No userId provided");
    return { message: "no userId provided", data: null };
  } 
  const chats = await prisma.chats.findMany({
    where: { userId: userId },
    orderBy: { updatedAt: 'desc' }
  });
  return { message: "User chats fetched successfully", data: { chats: chats.map(decryptChat) } };
}
export const  Message= async (data:any)=>{
    if(!data){
        console.log("No data provided");
        return { message: "no data provided", data: null };
    }
    try{
      // 1. Find semantically similar past messages for context (RAG)
      const similarMessages = await findSimilarMessages(data.chatId, data.content);

      // 2. Build the full message history string for mood/title analysis
      const userchat=await prisma.messages.findMany({
        where:{chatId:data.chatId,sender:"user"}
      })
      const entireString= userchat.map((message)=>safeDecrypt(message.content)).join(" ")+" "+data.content;
      console.log("entire string",entireString)

const chatSchema:any = z.object({
  name: z.string().describe("name of chat title based on user messages in the string don't include any emotion in here"),
  mood: z.string().describe("mood of the chat based on message."),
  score: z.number().describe("score of the mood from -10 to 10"),
});

const schemaJson = zodToJsonSchema(chatSchema);

const chatUnique=await prisma.chats.findUnique({ where:{
  id:data.chatId
}})

// 3. Build semantically-enriched prompt using similar past messages
const semanticContext = similarMessages.length > 0
  ? `\n\nRelevant context from this student's past messages:\n${similarMessages.map((m, i) => `${i + 1}. "${m}"`).join("\n")}`
  : "";

const prompt = `
Based on the user's messages: "${entireString}"${semanticContext}

Generate a JSON response with exactly these fields:
1. "name": A short chat title (string) - describe the topic, not the emotion
2. "mood": The emotional mood (string) - like "Happy", "Sad", "Anxious", "Inquisitive", etc.
3. "score": A number from -10 to 10 representing the mood intensity

Current chat name is: "${chatUnique ? safeDecrypt(chatUnique.name) : ""}"

IMPORTANT: Return ONLY valid JSON with these three fields. Example:
{"name": "Mental Health Discussion", "mood": "Reflective", "score": 5}
`;

const response:any = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseJsonSchema: schemaJson,
  },
});

console.log("AI Response:", response);
console.log("AI Response Text:", response.text);

let parsedResponse;
try {
  parsedResponse = JSON.parse(response.text);
  console.log("Parsed Response:", parsedResponse);
} catch (parseErr) {
  console.error("Failed to parse AI response:", parseErr);
  const jsonMatch = response.text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    parsedResponse = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error("Invalid JSON response from AI");
  }
}

const chat = chatSchema.parse(parsedResponse);
console.log("Validated Chat:", chat);
const updatedChat=await UpdateChat({id:data.chatId,name:chat.name,mood:chat.mood,score:chat.score,userId:data.userId});

    // 4. Generate embedding for the new message and store encrypted content + native pgvector
    const embedding = await generateEmbedding(data.content);
    const encryptedContent = encrypt(data.content);

    let message: any;
    if (embedding.length > 0) {
      const vectorLiteral = `[${embedding.join(",")}]`;
      const results: any[] = await prisma.$queryRawUnsafe(`
        INSERT INTO messages (id, "chatId", content, sender, embedding, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), '${data.chatId}', '${encryptedContent.replace(/'/g, "''")}', '${data.sender}', '${vectorLiteral}'::vector, NOW(), NOW())
        RETURNING id, "chatId", content, sender, "createdAt", "updatedAt"
      `);
      message = results[0];
    } else {
      message = await prisma.messages.create({
        data: { chatId: data.chatId, content: encryptedContent, sender: data.sender },
      });
    }
    return {message:"Message created successfully",data:{message:decryptMessage(message),chat:updatedChat.data?.chat} }

  }  catch(err){

    console.log(err)
        return {message:"Message creation failed",data:null}
    }
}
export const GetChatMessages= async (chatId:string)=>{
    if(!chatId){
        console.log("No chatId provided");
        return { message: "no chatId provided", data: null };
    }
    const messages=await prisma.messages.findMany({
        where:{chatId:chatId}
    })
    const chats=await prisma.chats.findUnique({
      where:{id:chatId}
    })
    return {message:"Chat messages fetched successfully",data:{messages:messages.map(decryptMessage),chats:decryptChat(chats)}}
}


export async function GetLatestChat(userId: number) {
  if (!userId) {
    console.log("No userId provided");
    return { message: "no userId provided", data: null };
  }

  try {
    const chat = await prisma.chats.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!chat) {
      return { message: "No chats found", data: null };
    }

    return { message: "Latest chat fetched successfully", data: { chat: decryptChat(chat) } };
  } catch (err) {
    console.error("Error fetching latest chat:", err);
    return { message: "Failed to fetch latest chat", data: null };
  }
}

export async function DeleteChat(chatId: string) {
  if (!chatId) {
    console.log("No chatId provided");
    return { message: "no chatId provided", data: null };
  }

  try {
    // Delete all messages in the chat first
    await prisma.messages.deleteMany({
      where: { chatId: chatId },
    });

    // Then delete the chat
    const deletedChat = await prisma.chats.delete({
      where: { id: chatId },
    });

    return { message: "Chat deleted successfully", data: { chat: deletedChat } };
  } catch (err) {
    console.error("Error deleting chat:", err);
    return { message: "Chat deletion failed", data: null };
  }
}
