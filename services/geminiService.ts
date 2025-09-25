import { GoogleGenAI, Chat } from "@google/genai";
import type { Message } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export async function transcribeAudio(audio: { data: string, mimeType: string }): Promise<string> {
    try {
        const audioPart = {
            inlineData: {
                mimeType: audio.mimeType,
                data: audio.data,
            },
        };
        const textPart = {
            text: "Transcribe this voice message accurately."
        };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [textPart, audioPart] },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return "Audio transcription failed. Please try again.";
    }
}


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
  // FIX: Property 'at' does not exist on type 'Message[]'. Replaced with index access for compatibility.
  const latestMessage = messages[messages.length - 1];
  if (!latestMessage || latestMessage.role !== 'user') {
    // This case should ideally not be reached if UI logic is correct
    // but as a safeguard, we can return nothing or throw.
    return;
  }
  
  // The history is all messages *before* the last one.
  const history = messages.slice(0, -1);

  const chat: Chat = ai.chats.create({
    model,
    history: buildGeminiHistory(history),
  });

  const result = await chat.sendMessageStream({ message: latestMessage.content });

  for await (const chunk of result) {
    yield chunk.text;
  }
}