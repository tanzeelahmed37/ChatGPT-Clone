import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MicrophoneIcon, StopIcon } from './Icons';

interface MessageInputProps {
  onSendMessage: (message: string | null, audio?: { data: string; mimeType: string; }) => void;
  isProcessing: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim(), undefined);
      setInput('');
    }
  };
  
  const handleStartRecording = async () => {
    if (isRecording) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64String = reader.result?.toString().split(',')[1];
                if (base64String) {
                    onSendMessage(null, { data: base64String, mimeType: 'audio/webm' });
                }
            };
            stream.getTracks().forEach(track => track.stop()); // Stop microphone access
        };
        mediaRecorder.start();
    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access was denied. Please allow microphone access in your browser settings.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isRecording ? "Recording..." : "Type your message..."}
        rows={1}
        className="w-full p-3 pr-12 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 resize-none"
        disabled={isProcessing || isRecording}
      />
      
        {input.trim() ? (
            <button
                onClick={handleSend}
                disabled={isProcessing}
                className="p-2 rounded-full bg-blue-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                aria-label="Send message"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        ) : isRecording ? (
            <button
                onClick={handleStopRecording}
                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors animate-pulse"
                aria-label="Stop recording"
            >
                <StopIcon className="w-5 h-5" />
            </button>
        ) : (
            <button
                onClick={handleStartRecording}
                disabled={isProcessing}
                className="p-2 rounded-full bg-gray-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                aria-label="Start recording"
            >
                <MicrophoneIcon className="w-5 h-5" />
            </button>
        )
    }
    </div>
  );
};