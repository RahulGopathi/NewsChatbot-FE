import React, { useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import InputContainer from "./InputContainer";
import type { ContextSource } from "../services/chatService";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  contextSources?: ContextSource[];
  isLoading?: boolean;
  isComplete?: boolean;
}

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onSendMessage,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Vibrant background effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#232946] via-[#3a3f5a] to-[#131720]" />
      <div className="flex-1 overflow-y-auto p-4 sleek-scrollbar">
        <div className="mx-1 space-y-6">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
              sources={message.contextSources?.map((src, index) => ({
                id: index + 1,
                url: src.url,
                title: src.title,
                source: src.source,
              }))}
              isLoading={message.isLoading}
              isComplete={message.isComplete}
            />
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
      {/* Floating InputContainer */}
      <div className="left-0 right-0 bottom-0 px-4 pt-4 pb-4 pointer-events-none">
        <div className="pointer-events-auto">
          <InputContainer onSendMessage={onSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
