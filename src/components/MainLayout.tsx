import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatContainer from "./ChatContainer";
import type { Message } from "./ChatContainer";
import { chatService } from "../services/chatService";
import type {
  ContextSource,
  ChatHistoryMessage,
} from "../services/chatService";

const MainLayout: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const currentMessageRef = useRef<{
    id: string;
    text: string;
    contextSources?: ContextSource[];
    isLoading?: boolean;
  } | null>(null);

  // Initialize chat session and load history on component mount
  useEffect(() => {
    initSession();
  }, []);

  // Function to initialize or reset session
  const initSession = async () => {
    try {
      setIsInitializing(true);
      await chatService.getSessionId();

      // Fetch chat history
      const history = await chatService.fetchChatHistory();

      if (history && history.messages.length > 0) {
        // Convert history messages to the format our app uses
        const formattedMessages: Message[] = history.messages
          .filter((msg) => msg.content.trim() !== "") // Filter out empty messages
          .map((msg: ChatHistoryMessage) => ({
            id: msg.id,
            text: msg.content,
            isUser: msg.role === "user",
            timestamp: formatAPITimestamp(msg.timestamp),
          }));

        setMessages(formattedMessages);
      } else {
        // If no history or empty history, set empty messages array
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Function to handle reset session
  const handleResetSession = async () => {
    try {
      setIsInitializing(true);

      // Clear the current session
      chatService.clearSession();

      // Set empty messages
      setMessages([]);

      // Create a new session and load any history (should be empty for new session)
      await initSession();
    } catch (error) {
      console.error("Failed to reset session:", error);
      setIsInitializing(false);
    }
  };

  // Convert API timestamp format to display format
  const formatAPITimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return chatService.formatTimestamp();
    }
  };

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: chatService.formatTimestamp(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // Create a temporary message for the bot response
      const tempBotMessageId = (Date.now() + 1).toString();

      // Add bot message with loading state
      const botMessage: Message = {
        id: tempBotMessageId,
        text: "",
        isUser: false,
        timestamp: chatService.formatTimestamp(),
        isLoading: true, // Add loading state
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Keep a reference to the current AI message
      currentMessageRef.current = {
        id: tempBotMessageId,
        text: "",
        isLoading: true,
      };

      // Handle the streaming response
      await chatService.sendMessage(
        text,
        // On Start
        (messageId) => {
          if (currentMessageRef.current) {
            currentMessageRef.current.id = messageId;
            // Don't set isLoading to false yet
            currentMessageRef.current.text = ""; // Clear the loading text

            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (msg.id === tempBotMessageId) {
                  // Use tempBotMessageId instead of current ref's ID
                  return {
                    ...msg,
                    id: messageId,
                    text: "",
                    // Keep isLoading true
                  };
                }
                return msg;
              });
            });
          }
        },
        // On Context
        (sources) => {
          if (currentMessageRef.current) {
            currentMessageRef.current.contextSources = sources;

            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (msg.id === currentMessageRef.current?.id) {
                  return {
                    ...msg,
                    contextSources: sources,
                  };
                }
                return msg;
              });
            });
          }
        },
        // On Message Chunk
        (chunk) => {
          if (currentMessageRef.current) {
            // Append the new chunk
            currentMessageRef.current.text += chunk;

            // Process the accumulated text to clean potential markdown formatting issues
            const formattedText = currentMessageRef.current.text;

            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (msg.id === currentMessageRef.current?.id) {
                  return {
                    ...msg,
                    text: formattedText,
                  };
                }
                return msg;
              });
            });
          }
        },
        // On End
        () => {
          // Update the message to remove loading state
          if (currentMessageRef.current) {
            const messageId = currentMessageRef.current.id;

            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (msg.id === messageId) {
                  return {
                    ...msg,
                    isLoading: false,
                  };
                }
                return msg;
              });
            });

            // Make sure to update the current ref too
            currentMessageRef.current.isLoading = false;
          }

          currentMessageRef.current = null;
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error (could add an error message to the chat)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: (Date.now() + 2).toString(),
          text: "Sorry, there was an error processing your request. Please try again.",
          isUser: false,
          timestamp: chatService.formatTimestamp(),
        },
      ]);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header onResetSession={handleResetSession} />
        </div>

        {/* Chat container and input */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isInitializing ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-400">Loading chat history...</div>
            </div>
          ) : (
            <ChatContainer
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
