import React from "react";
import { FaUserCircle } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Define source type
interface Source {
  id: number;
  url: string;
  title: string;
  source: string;
}

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  isLoading?: boolean;
  sources?: Source[]; // Add sources prop
  isComplete?: boolean; // Flag to indicate message is fully received
}

// Define types for source processing
type TextPart = { type: "text"; content: string };
type SourcePart = { type: "source"; numbers: number[] };
type Part = TextPart | SourcePart;

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  timestamp,
  isLoading = false,
  sources = [], // Default to empty array
  isComplete = false, // Default to false
}) => {
  // Clean up excessive whitespace while preserving markdown format
  const cleanMessage = message
    .replace(/\n{3,}/g, "\n\n") // Replace 3+ consecutive line breaks with just 2
    .trim();

  // Extract sources from the message
  const [messageContent, extractedSources] = React.useMemo(() => {
    // If message is not complete yet, don't extract sources
    if (!isComplete) return [cleanMessage, []];

    // Find the Sources section
    const parts = cleanMessage.split("## Sources");
    if (parts.length <= 1) return [cleanMessage, []];

    // Extract source information
    const content = parts[0].trim();
    const sourcesText = parts[1].trim();

    // Parse sources
    const sourceLines = sourcesText
      .split("\n")
      .filter((line) => /^\d+\./.test(line.trim()));
    const parsed = sourceLines.map((line) => {
      const idMatch = line.match(/^(\d+)\./);
      const id = idMatch ? parseInt(idMatch[1], 10) : 0;

      const titleMatch = line.match(/\[(.*?)\]/);
      const title = titleMatch ? titleMatch[1] : "";

      const urlMatch = line.match(/\((https?:\/\/.*?)\)/);
      const url = urlMatch ? urlMatch[1] : "";

      return {
        id,
        url,
        title,
        source: title, // Using title as source name
      };
    });

    return [content, parsed];
  }, [cleanMessage, isComplete]);

  // Combined sources (prop sources take precedence)
  const allSources = sources.length > 0 ? sources : extractedSources;

  // Function to render a source pill
  const SourcePill = ({ number }: { number: number }) => {
    // Find the source with the matching id
    const source = allSources.find((src) => src.id === number);

    // Only make it a link if we have a URL
    if (source?.url) {
      return (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-[1.4rem] h-[1.4rem] text-xs font-semibold rounded-none bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 no-underline align-middle mx-0.5"
          aria-label={`Source ${number}: ${source?.title || "Unknown"}`}
          title={source?.title || `Source ${number}`}
        >
          {number}
        </a>
      );
    }

    // Fallback to non-clickable pill
    return (
      <span
        className="inline-flex items-center justify-center w-[1.4rem] h-[1.4rem] text-xs font-semibold rounded-none bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 no-underline align-middle mx-0.5"
        aria-label={`Source ${number}`}
      >
        {number}
      </span>
    );
  };

  // Function to process text content and render source pills
  const processText = (text: string): React.ReactNode => {
    // Only process text containing source references
    if (!text.includes("[") || !isComplete) return text;

    // Use a regex pattern that captures the entire source reference
    const sourcePattern = /\[(\d+(?:,\s*\d+)*)\]/g;

    // Split the text into parts and source references
    const parts: Part[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = sourcePattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }

      // Process the source numbers
      const sourceRef = match[1];
      const sourceNums = sourceRef
        .split(",")
        .map((num) => parseInt(num.trim(), 10));

      // Add a source pill for each number
      parts.push({
        type: "source",
        numbers: sourceNums,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      });
    }

    // No source references found, return the original text
    if (parts.length === 0) return text;

    // Render the parts
    return (
      <>
        {parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <React.Fragment key={`text-${index}`}>
                {part.content}
              </React.Fragment>
            );
          } else {
            return (
              <span key={`sources-${index}`} className="inline-flex gap-0.5">
                {part.numbers.map((num, i) => (
                  <SourcePill key={`pill-${index}-${i}`} number={num} />
                ))}
              </span>
            );
          }
        })}
      </>
    );
  };

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4 items-start`}
    >
      {!isUser && (
        <div className="mr-2 mt-0.5">
          <FaUserCircle className="h-8 w-8 text-blue-400" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        <div
          className={`p-4 rounded-lg ${
            isUser ? "bg-blue-600 text-white" : "bg-[#2a3041] text-white"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <span>{message}</span>
              <span className="loading-dots ml-2">
                <span className="dot dot1"></span>
                <span className="dot dot2"></span>
                <span className="dot dot3"></span>
              </span>
            </div>
          ) : (
            <div className="markdown-content">
              <div className="prose prose-invert max-w-none prose-li:marker:text-white prose-ul:space-y-1 prose-p:my-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:underline"
                      />
                    ),
                    code: ({ ...props }) => (
                      <code
                        {...props}
                        className="bg-gray-700 px-1 py-0.5 rounded text-sm"
                      />
                    ),
                    pre: ({ ...props }) => (
                      <pre
                        {...props}
                        className="bg-gray-700 p-2 rounded-md overflow-auto my-2"
                      />
                    ),
                    // Properly style list items
                    ul: ({ ...props }) => (
                      <ul
                        {...props}
                        className="list-disc pl-6 space-y-1 my-2"
                      />
                    ),
                    ol: ({ ...props }) => (
                      <ol
                        {...props}
                        className="list-decimal pl-6 space-y-1 my-2"
                      />
                    ),
                    li: ({ ...props }) => <li {...props} className="pl-1" />,
                    // Headers
                    h1: ({ ...props }) => (
                      <h1 {...props} className="text-xl font-bold mt-4 mb-2" />
                    ),
                    h2: ({ ...props }) => (
                      <h2 {...props} className="text-lg font-bold mt-4 mb-2" />
                    ),
                    h3: ({ ...props }) => (
                      <h3 {...props} className="text-md font-bold mt-3 mb-2" />
                    ),
                    p: ({ children, ...props }) => <p {...props}>{children}</p>,
                    // Process text nodes to find and replace source references
                    text: ({ children }) => {
                      if (typeof children === "string") {
                        return processText(children);
                      }
                      return children;
                    },
                  }}
                >
                  {isComplete && allSources.length > 0
                    ? messageContent
                    : cleanMessage}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
        <div
          className={`text-xs text-gray-400 mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
