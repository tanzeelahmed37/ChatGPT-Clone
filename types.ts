
export type MessageRole = 'user' | 'model';

export interface Message {
  role: MessageRole;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export type Theme = 'light' | 'dark';
