import { GoogleGenAI, Chat } from "@google/genai";
import type { Message } from '../types';

const API_KEY = "AIzaSyDsU6Ks2cjZ1AkDqVklsSCv3jerr7jmz58";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

// Convert our Message[] to Gemini's Content[] format, merging consecutive messages of the same role
const buildGeminiHistory = (messages: Message[]) => {
    const history = [];
    let currentParts = [];
    let currentRole = '';

    for (const message of messages) {
        // We only care about user and model roles for history
        if(message.role !== 'user' && message.role !== 'model') continue;

        if (message.role === currentRole) {
            currentParts.push({ text: message.content });
        } else {
            if (currentParts.length > 0) {
                history.push({ role: currentRole, parts: currentParts });
            }
            currentParts = [{ text: message.content }];
            currentRole = message.role;
        }
    }
    if (currentParts.length > 0) {
        history.push({ role: currentRole, parts: currentParts });
    }
    return history;
}


export async function* streamChat(messages: Message[]): AsyncGenerator<string> {
  // The last message is the new user prompt
  const latestMessage = messages.pop();
  if (!latestMessage || latestMessage.role !== 'user') {
    throw new Error("Last message must be from the user.");
  }
  
  const chat: Chat = ai.chats.create({
    model,
    history: buildGeminiHistory(messages),
  });

  const result = await chat.sendMessageStream({ message: latestMessage.content });

  for await (const chunk of result) {
    yield chunk.text;
  }
}