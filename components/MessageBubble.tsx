
import React from 'react';
import type { Message } from '../types';
import { UserIcon, BotIcon } from './Icons';

interface MessageBubbleProps {
  message: Message;
}

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\`{1,3}[^\`]+\`{1,3}|\*\*[^\*]+\*\*)/g);
    
    return (
        <p className="text-sm">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    return (
                        <pre key={index} className="bg-gray-800 text-white p-3 my-2 rounded-md overflow-x-auto text-sm">
                            <code>{part.slice(3, -3)}</code>
                        </pre>
                    );
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={index} className="bg-gray-200 dark:bg-gray-700 text-red-500 rounded-sm px-1 py-0.5 font-mono">{part.slice(1, -1)}</code>;
                }
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </p>
    );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const bubbleClasses = isUser
    ? 'bg-blue-500 text-white rounded-br-none'
    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none';
  const alignmentClasses = isUser ? 'justify-end' : 'justify-start';
  const Icon = isUser ? UserIcon : BotIcon;
  const iconClasses = isUser ? 'order-2' : 'order-1';
  const textContainerClasses = isUser ? 'order-1' : 'order-2';

  return (
    <div className={`flex items-start gap-3 ${alignmentClasses}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-gray-600'} ${iconClasses}`}>
        <Icon className={`w-5 h-5 ${isUser ? 'text-white' : 'text-gray-300'}`} />
      </div>
      <div className={`${textContainerClasses}`}>
        <div className={`px-4 py-2 rounded-lg max-w-xl md:max-w-2xl ${bubbleClasses}`}>
          {message.content ? (
            <SimpleMarkdown text={message.content} />
          ) : (
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
