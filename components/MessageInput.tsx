
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './Icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows={1}
        className="w-full p-3 pr-12 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 resize-none"
        disabled={isProcessing}
      />
      <button
        onClick={handleSend}
        disabled={isProcessing || !input.trim()}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
