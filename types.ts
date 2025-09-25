export type MessageRole = 'user' | 'model';

export interface Message {
  role: MessageRole;
  content: string;
  audio?: {
    data: string; // base64 encoded string
    mimeType: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export type Theme = 'light' | 'dark';

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
}
