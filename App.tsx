
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { useTheme } from './hooks/useTheme';
import type { Conversation, Message } from './types';
import { streamChat } from './services/geminiService';

const App: React.FC = () => {
  const [theme, setTheme] = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const storedConversations = localStorage.getItem('chat_conversations');
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
        setActiveConversationId(null);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const handleSendMessage = useCallback(async (message: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const userMessage: Message = { role: 'user', content: message };
    let currentConversation = activeConversation;
    let conversationId = activeConversationId;

    if (!currentConversation) {
      conversationId = `conv-${Date.now()}`;
      const newConversation: Conversation = {
        id: conversationId,
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        messages: [userMessage],
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(conversationId);
      currentConversation = newConversation;
    } else {
      const updatedMessages = [...currentConversation.messages, userMessage];
      const updatedConversation = { ...currentConversation, messages: updatedMessages };
      setConversations(prev => prev.map(c => c.id === conversationId ? updatedConversation : c));
      currentConversation = updatedConversation;
    }

    const modelMessage: Message = { role: 'model', content: '' };
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return { ...c, messages: [...c.messages, modelMessage] };
      }
      return c;
    }));

    try {
      const stream = streamChat(currentConversation.messages);
      for await (const chunk of stream) {
        modelMessage.content += chunk;
        setConversations(prev => prev.map(c => {
            if (c.id === conversationId) {
                const lastMsgIndex = c.messages.length - 1;
                const updatedMessages = [...c.messages];
                if (updatedMessages[lastMsgIndex].role === 'model') {
                    updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], content: modelMessage.content };
                }
                return { ...c, messages: updatedMessages };
            }
            return c;
        }));
      }
    } catch (error) {
      console.error("Error streaming from Gemini:", error);
      modelMessage.content = "Sorry, I encountered an error. Please try again.";
      setConversations(prev => prev.map(c => {
          if (c.id === conversationId) {
              const lastMsgIndex = c.messages.length - 1;
              const updatedMessages = [...c.messages];
              if (updatedMessages[lastMsgIndex].role === 'model') {
                  updatedMessages[lastMsgIndex] = modelMessage;
              }
              return { ...c, messages: updatedMessages };
          }
          return c;
      }));
    } finally {
      setIsProcessing(false);
    }
  }, [activeConversation, activeConversationId, conversations, isProcessing]);

  return (
    <div className="flex h-screen w-screen text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        theme={theme}
        setTheme={setTheme}
      />
      <main className="flex-1 flex flex-col h-screen">
        <ChatView
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  );
};

export default App;
