import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CopyIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ShareIcon,
} from "lucide-react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import type { Message } from "@/store";

const MESSAGES_PER_PAGE = 20;

// Generate dummy historical messages for demonstration
const generateDummyMessages = (chatroomId: string, page: number): Message[] => {
  const messages: Message[] = [];
  const startIndex = page * MESSAGES_PER_PAGE;

  for (let i = 0; i < MESSAGES_PER_PAGE; i++) {
    const messageIndex = startIndex + i;
    const isUser = messageIndex % 3 === 0; // Every 3rd message is from user

    // Create truly unique ID with timestamp to avoid collisions
    const uniqueId = `dummy-${chatroomId}-page${page}-${messageIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    messages.push({
      id: uniqueId,
      content: isUser
        ? `This is user message #${messageIndex + 1}. Here's a question or statement from the user.`
        : `This is AI response #${messageIndex + 1}. Here's a helpful response from Gemini with some detailed information.`,
      sender: isUser ? "user" : "ai",
      timestamp: new Date(Date.now() - (messageIndex + 1) * 60000), // 1 minute apart
    });
  }

  return messages.reverse(); // Oldest first
};

interface MessageListProps {
  chatroomId: string;
  messages: Message[];
  isTyping: boolean;
}

export function MessageList({
  chatroomId,
  messages,
  isTyping,
}: MessageListProps) {
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(0);
  const [olderMessages, setOlderMessages] = useState<Message[]>([]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const allMessages = [...olderMessages, ...messages];

  // Reset state when chatroom changes
  useEffect(() => {
    setOlderMessages([]);
    setPage(0);
    // Only show "load older" option if there are existing messages
    setHasMoreMessages(messages.length > 0);
    setLoadingOlder(false);
  }, [chatroomId, messages.length]);

  // Auto-scroll to bottom when new messages arrive (not when loading older)
  useEffect(() => {
    if (scrollAreaRef.current && !loadingOlder) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping, loadingOlder]);

  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasMoreMessages) return;

    // Don't load dummy messages for new/empty chats
    if (messages.length === 0) {
      setHasMoreMessages(false);
      return;
    }

    // Safety limit: don't load more than 10 pages (200 messages)
    if (page >= 10) {
      setHasMoreMessages(false);
      return;
    }

    setLoadingOlder(true);

    // Simulate API call delay
    setTimeout(() => {
      const newMessages = generateDummyMessages(chatroomId, page);

      if (newMessages.length < MESSAGES_PER_PAGE || page >= 9) {
        setHasMoreMessages(false);
      }

      // Use functional update to prevent race conditions
      setOlderMessages((prev) => {
        // Check for duplicate IDs to prevent duplicates
        const existingIds = new Set(prev.map((msg) => msg.id));
        const filteredNewMessages = newMessages.filter(
          (msg) => !existingIds.has(msg.id),
        );
        return [...filteredNewMessages, ...prev];
      });

      setPage((prev) => prev + 1);
      setLoadingOlder(false);
    }, 1000);
  }, [chatroomId, loadingOlder, hasMoreMessages, page]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = event.currentTarget;

      // Load more messages when scrolled to top
      if (scrollTop === 0 && hasMoreMessages && !loadingOlder) {
        loadOlderMessages();
      }
    },
    [hasMoreMessages, loadingOlder, loadOlderMessages],
  );

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="flex-1 p-4"
      onScrollCapture={handleScroll}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Load older messages button/indicator */}
        {hasMoreMessages && (
          <div className="text-center py-4">
            {loadingOlder ? (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Loading older messages...
                </p>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={loadOlderMessages}>
                Load older messages
              </Button>
            )}
          </div>
        )}

        {/* Loading skeletons for older messages */}
        {loadingOlder && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        {allMessages.map((msg, index) => (
          <div
            key={`${msg.id}-${index}`}
            className={cn(
              "flex gap-3",
              msg.sender === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.sender === "ai" && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  G
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "max-w-[80%] space-y-2 group",
                msg.sender === "user" && "text-right",
              )}
            >
              <div
                className={cn(
                  "inline-block p-3 rounded-2xl relative",
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Uploaded"
                    className="max-w-full rounded-lg mb-2"
                  />
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Copy button on hover */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyMessage(msg.content)}
                >
                  <CopyIcon className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {typeof msg.timestamp === "string"
                    ? new Date(msg.timestamp).toLocaleTimeString()
                    : msg.timestamp.toLocaleTimeString()}
                </span>
                {msg.sender === "ai" && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled
                    >
                      <ThumbsUpIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled
                    >
                      <ThumbsDownIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled
                    >
                      <ShareIcon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {msg.sender === "user" && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-primary text-primary-foreground">
                G
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gemini is typing...
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
