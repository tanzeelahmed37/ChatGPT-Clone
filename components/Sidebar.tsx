import React from 'react';
import type { Conversation, Theme, User } from '../types';
import { PlusIcon, SunIcon, MoonIcon, TrashIcon, LogoutIcon } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User;
  onLogout: () => void;
}

const UserProfile: React.FC<{ user: User }> = ({ user }) => (
    <div className="flex items-center p-4 border-t border-gray-700/50">
        <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full" />
        <div className="ml-3 overflow-hidden">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
        </div>
    </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  theme,
  setTheme,
  user,
  onLogout,
}) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col z-40 transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:w-80`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700/50">
          <button
            onClick={onNewChat}
            className="flex items-center w-full text-left p-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Chat
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {conversations.map((conv) => (
            <div key={conv.id} className="group flex items-center">
              <button
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left p-2 rounded-md truncate transition-colors ${
                  activeConversationId === conv.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                }`}
              >
                {conv.title}
              </button>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                }}
                className="p-1 ml-1 rounded-md text-gray-500 hover:text-white hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete conversation"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </nav>
        <div className="p-2 space-y-1">
            <button
                onClick={toggleTheme}
                className="w-full flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
                {theme === 'dark' ? (
                    <SunIcon className="w-5 h-5 mr-2" />
                ) : (
                    <MoonIcon className="w-5 h-5 mr-2" />
                )}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
                onClick={onLogout}
                className="w-full flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
                <LogoutIcon className="w-5 h-5 mr-2" />
                <span>Sign Out</span>
            </button>
        </div>
        <UserProfile user={user} />
      </aside>
    </>
  );
};
