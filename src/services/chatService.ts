// Type definitions
export interface StreamResponse {
  type: "START" | "CONTEXT" | "MESSAGE" | "END";
  message_id?: string;
  context_sources?: ContextSource[];
  role?: string;
  message?: string;
}

export interface ContextSource {
  title: string;
  source: string;
  url: string;
}

export interface ChatHistoryMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  session_id: string;
  messages: ChatHistoryMessage[];
  created_at: string;
  updated_at: string;
}

// Read API URL from environment variable
const API_URL = "";

// Session management
const SESSION_STORAGE_KEY = "chat_session_id";

export const chatService = {
  // Get existing session ID or create a new one
  async getSessionId(): Promise<string> {
    // Try to get from localStorage first
    const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSessionId) {
      return storedSessionId;
    }

    // If no session ID exists, create a new one
    try {
      const response = await fetch(`${API_URL}/api/v1/chat/session`, {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      const sessionId = data.session_id;

      // Store the session ID
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      return sessionId;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  },

  // Fetch chat history for the current session
  async fetchChatHistory(): Promise<ChatHistory | null> {
    try {
      const sessionId = await this.getSessionId();

      const response = await fetch(
        `${API_URL}/api/v1/chat/history/${sessionId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }

      const data = await response.json();
      return data as ChatHistory;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return null;
    }
  },

  // Send a message and process streaming response
  async sendMessage(
    message: string,
    onStart: (messageId: string) => void,
    onContext: (sources: ContextSource[]) => void,
    onMessageChunk: (chunk: string) => void,
    onEnd: () => void
  ): Promise<void> {
    try {
      const sessionId = await this.getSessionId();

      // Create URL with query parameters for EventSource
      const url = `${API_URL}/api/v1/chat/query`;

      // Use fetch with proper SSE headers
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(
          `Failed to send message: ${response.status} ${response.statusText}`
        );
      }

      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete JSON objects from the buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line) {
            try {
              // Check if line starts with "data: " and extract the JSON part
              const jsonStr = line.startsWith("data:")
                ? line.substring(5).trim()
                : line;
              const data = JSON.parse(jsonStr) as StreamResponse;

              switch (data.type) {
                case "START":
                  if (data.message_id) {
                    onStart(data.message_id);
                  }
                  break;
                case "CONTEXT":
                  if (data.context_sources) {
                    onContext(data.context_sources);
                  }
                  break;
                case "MESSAGE":
                  if (data.message && data.role === "ai") {
                    onMessageChunk(data.message);
                  }
                  break;
                case "END":
                  onEnd();
                  break;
              }
            } catch (error) {
              console.error("Error parsing JSON:", error, line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Clear the current session
  clearSession(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  // Format timestamp for messages
  formatTimestamp(): string {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  },
};
