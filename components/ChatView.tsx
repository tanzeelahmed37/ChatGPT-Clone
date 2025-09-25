import React, { useRef, useEffect } from 'react';
import type { Conversation } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MenuIcon, BotIcon } from './Icons';

interface ChatViewProps {
  conversation: Conversation | null;
  onSendMessage: (message: string | null, audio?: { data: string; mimeType: string; }) => void;
  isProcessing: boolean;
  onMenuClick: () => void;
}

const WelcomeScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <BotIcon className="w-24 h-24 mb-4 text-gray-400 dark:text-gray-500"/>
        <h1 className="text-4xl font-bold text-gray-700 dark:text-gray-300">Gemini Chat</h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Start a conversation to see the magic happen.</p>
    </div>
);


export const ChatView: React.FC<ChatViewProps> = ({ conversation, onSendMessage, isProcessing, onMenuClick }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <header className="flex items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button onClick={onMenuClick} className="md:hidden p-2 mr-2">
          <MenuIcon className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold truncate">
            {conversation ? conversation.title : 'New Chat'}
        </h2>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {conversation && conversation.messages.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {conversation.messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
            <WelcomeScreen />
        )}
      </div>

      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
            <MessageInput onSendMessage={onSendMessage} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
};