import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { useTheme } from './hooks/useTheme';
import type { Conversation, Message, User } from './types';
import { streamChat, transcribeAudio } from './services/geminiService';
import { LoginScreen } from './components/LoginScreen';

const App: React.FC = () => {
  const [theme, setTheme] = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for mock user in local storage on initial load
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('mock_user');
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    // Load conversations for the logged-in user
    const storedConversations = localStorage.getItem(`chat_conversations_${user.email}`);
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    } else {
      setConversations([]); // Start with a clean slate for new users
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Save conversations for the logged-in user
    localStorage.setItem(`chat_conversations_${user.email}`, JSON.stringify(conversations));
  }, [conversations, user]);

  const handleLogin = () => {
    const mockUser: User = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      avatarUrl: 'https://picsum.photos/seed/user/80/80'
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('mock_user');
    setUser(null);
    setConversations([]);
    setActiveConversationId(null);
  };

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

  const handleSendMessage = useCallback(async (message: string | null, audio?: { data: string; mimeType: string; }) => {
    if (isProcessing || !user) return;
    setIsProcessing(true);

    let userMessage: Message;
    let tempUserMessage: Message | null = null;
    let conversationId = activeConversationId;
    
    let currentConversation = activeConversation;
    if (!currentConversation) {
        conversationId = `conv-${Date.now()}`;
        const newConv: Conversation = { id: conversationId, title: "New Chat", messages: [] };
        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(conversationId);
        currentConversation = newConv;
    }

    if (audio) {
        tempUserMessage = { role: 'user', content: '🎤 Transcribing...', audio };
    } else if (message) {
        userMessage = { role: 'user', content: message };
    } else {
        setIsProcessing(false);
        return;
    }
    
    if (tempUserMessage) {
        const tempMsg = tempUserMessage;
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, tempMsg] } : c));
        const transcribedText = await transcribeAudio(audio!);
        userMessage = { role: 'user', content: transcribedText, audio };
    }

    const finalUserMessage = userMessage!;

    setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
            const newMessages = tempUserMessage 
                ? c.messages.map(m => m === tempUserMessage ? finalUserMessage : m)
                : [...c.messages, finalUserMessage];
            
            const newTitle = c.messages.length === 0 
                ? finalUserMessage.content.substring(0, 30) + (finalUserMessage.content.length > 30 ? '...' : '')
                : c.title;

            return { ...c, title: newTitle, messages: newMessages };
        }
        return c;
    }));

    const modelMessage: Message = { role: 'model', content: '' };
     setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        // Ensure we add the message only once
        if (c.messages[c.messages.length -1]?.role !== 'model') {
           return { ...c, messages: [...c.messages, modelMessage] };
        }
        return c;
      }
      return c;
    }));


    try {
      const conv = conversations.find(c => c.id === conversationId);
      const history = conv ? conv.messages.filter(m => m.role === 'user' || m.role === 'model') : [];
      history.push(finalUserMessage);
      
      const stream = streamChat(history);
      let accumulatedContent = '';
      for await (const chunk of stream) {
        accumulatedContent += chunk;
        setConversations(prev => prev.map(c => {
            if (c.id === conversationId) {
                const updatedMessages = [...c.messages];
                const lastMsgIndex = updatedMessages.length - 1;
                if (lastMsgIndex >= 0 && updatedMessages[lastMsgIndex].role === 'model') {
                    updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], content: accumulatedContent };
                }
                return { ...c, messages: updatedMessages };
            }
            return c;
        }));
      }
    } catch (error) {
      console.error("Error streaming from Gemini:", error);
      const errorContent = "Sorry, I encountered an error. Please try again.";
      setConversations(prev => prev.map(c => {
          if (c.id === conversationId) {
              const updatedMessages = [...c.messages];
              const lastMsgIndex = updatedMessages.length - 1;
              if (lastMsgIndex >= 0 && updatedMessages[lastMsgIndex].role === 'model') {
                  updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], content: errorContent };
              }
              return { ...c, messages: updatedMessages };
          }
          return c;
      }));
    } finally {
      setIsProcessing(false);
    }
  }, [activeConversation, activeConversationId, conversations, isProcessing, user]);
  
  if (!user) {
      return <LoginScreen onLogin={handleLogin} />;
  }

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
        user={user}
        onLogout={handleLogout}
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
