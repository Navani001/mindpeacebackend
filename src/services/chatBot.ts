import prisma from "../lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
export async function UpdateChat(data: any) {
  if (!data) {
    console.log("No data provided");
    return { message: "no data provided", data: null };
  }

  try {
    const chat = await prisma.chats.update({
      where: { id: data.id },
      data: {
        name: data.name,
        userId: data.userId,
        mood: data.mood,
        score: data.score,
      },
    });

    return { message: "Chat updated successfully", data: { chat: chat } };
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
        name: data.name,
        userId: data.userId,
        mood: data.mood,
        score: data.score,
      },
    });

    return { message: "Chat created successfully", data: { chat: chat } };
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
  });
  return { message: "User chats fetched successfully", data: { chats: chats } };
}
export const  Message= async (data:any)=>{
    if(!data){
        console.log("No data provided");
        return { message: "no data provided", data: null };
    }
    try{
      const userchat=await prisma.messages.findMany({
        where:{chatId:data.chatId,sender:"user"}
      })
  const entireString= userchat.map((message)=>message.content).join(" ")+" "+data.content;
    console.log("entire string",entireString)
    

const chatSchema:any = z.object({
  name: z.string().describe("name of chat title based on user messages in the string don't include any emotion in here"),
  mood: z.string().describe("mood of the chat based on message."),
  score: z.number().describe("score of the mood from -10 to 10"),
});

const schemaJson = zodToJsonSchema(chatSchema);

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "" });
const chatUnique=await prisma.chats.findUnique({ where:{
  id:data.chatId
}})
const prompt = `
Based on the user's messages: "${entireString}"

Generate a JSON response with exactly these fields:
1. "name": A short chat title (string) - describe the topic, not the emotion
2. "mood": The emotional mood (string) - like "Happy", "Sad", "Anxious", "Inquisitive", etc.
3. "score": A number from -10 to 10 representing the mood intensity

Current chat name is: "${chatUnique?.name}"

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
  // Extract first JSON object if parsing fails
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
    const message=await prisma.messages.create({
        data:{
            chatId:data.chatId,
            content:data.content,
            sender:data.sender
        }
    })
    return {message:"Message created successfully",data:{message:message,chat:updatedChat.data?.chat} }

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
    return {message:"Chat messages fetched successfully",data:{messages:messages,chats}}
}

