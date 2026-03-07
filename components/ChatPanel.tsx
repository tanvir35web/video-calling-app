"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, X } from "lucide-react";
import { Message } from "@/hooks/useAgoraChat";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({
  messages,
  onSendMessage,
  isOpen,
  onClose,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-24 w-80 h-96 bg-gray-900 rounded-2xl shadow-2xl flex flex-col border border-gray-800 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-400" />
          <h3 className="text-white font-semibold">Chat</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            কোনো message নেই
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isLocal ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                  msg.isLocal
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {!msg.isLocal && (
                  <p className="text-xs text-gray-400 mb-1">{msg.sender}</p>
                )}
                <p className="text-sm break-words">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message লিখুন..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
