import React from 'react';
import { BotIcon, GoogleIcon, GithubIcon } from './Icons';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
      <div className="text-center p-8 max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <BotIcon className="w-20 h-20 mb-4 text-gray-400 dark:text-gray-500 mx-auto"/>
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Welcome to Gemini Chat</h1>
        <p className="mt-2 mb-8 text-md text-gray-500 dark:text-gray-400">Sign in to begin your conversation.</p>

        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Sign in with Google"
          >
            <GoogleIcon className="w-5 h-5 mr-3" />
            <span className="font-semibold text-sm">Sign in with Google</span>
          </button>
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-black dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            aria-label="Sign in with GitHub"
          >
            <GithubIcon className="w-5 h-5 mr-3" />
            <span className="font-semibold text-sm">Sign in with GitHub</span>
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
          This is a mock authentication for demonstration. Clicking either button will log you in.
        </p>
      </div>
    </div>
  );
};
