import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendIcon, ImageIcon, MenuIcon } from "lucide-react";
import { MessageList } from "./MessageList";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function ChatArea() {
  const {
    getActiveChatroom,
    addMessage,
    createChatroom,
    isTyping,
    setTyping,
    isSidebarOpen,
    setSidebarOpen,
  } = useAppStore();

  const activeChatroom = getActiveChatroom();
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const messages = activeChatroom?.messages || [];

  const handleSendMessage = async () => {
    if (!message.trim() && !imageFile) return;

    let chatroomId = activeChatroom?.id;

    // Create new chatroom if none exists
    if (!chatroomId) {
      const newChatroom = createChatroom();
      chatroomId = newChatroom.id;
    }

    // Add user message
    const userMessage = {
      content: message.trim(),
      sender: "user" as const,
      timestamp: new Date(),
      imageUrl: imagePreview || undefined,
    };

    addMessage(chatroomId, userMessage);

    // Clear input
    setMessage("");
    setImageFile(null);
    setImagePreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulate AI typing
    setTyping(true);

    // Simulate AI response with throttling
    setTimeout(
      () => {
        const aiResponses = [
          "Hello there! How can I help you today?",
          "That's an interesting question. Let me think about that...",
          "I'd be happy to help you with that. Here's what I think:",
          "Great question! Based on what you've shared, I would suggest:",
          "I understand what you're asking. Here's my perspective:",
          "Thanks for sharing that. Let me provide some insights:",
        ];

        const randomResponse =
          aiResponses[Math.floor(Math.random() * aiResponses.length)];

        const aiMessage = {
          content: randomResponse,
          sender: "ai" as const,
          timestamp: new Date(),
        };

        addMessage(chatroomId!, aiMessage);
        setTyping(false);
      },
      1500 + Math.random() * 2000,
    ); // Random delay between 1.5-3.5s
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
    }
  };

  // Empty state when no active chatroom
  if (!activeChatroom) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  G
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium">Gemini</h2>
                <p className="text-xs text-muted-foreground">2.5 Flash</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <Avatar className="h-16 w-16 mx-auto">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  G
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Hello there! How can I help you today?
            </h3>
            <p className="text-muted-foreground mb-6">
              I'm Gemini, a helpful AI assistant. You can ask me questions,
              request help with tasks, or just have a conversation.
            </p>
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border">
          <div className="max-w-4xl mx-auto">
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeImage}
                >
                  ×
                </Button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="mb-1"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>

              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a prompt for Gemini"
                  className="min-h-[44px] max-h-[120px] resize-none pr-12"
                  rows={1}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim() && !imageFile}
                  className="absolute right-2 bottom-2 h-8 w-8"
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-3">
              <Button variant="ghost" size="sm" disabled>
                <span className="mr-2">🔬</span>
                Deep Research
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <span className="mr-2">🎨</span>
                Canvas
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // Additional safety check to prevent race conditions during deletion
  if (!activeChatroom) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No active chatroom</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                G
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">Gemini</h2>
              <p className="text-xs text-muted-foreground">2.5 Flash</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {activeChatroom && (
        <MessageList
          chatroomId={activeChatroom.id}
          messages={messages}
          isTyping={isTyping}
        />
      )}

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-32 rounded-lg"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={removeImage}
              >
                ×
              </Button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="mb-1"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter a prompt for Gemini"
                className="min-h-[44px] max-h-[120px] resize-none pr-12"
                rows={1}
                disabled={isTyping}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={(!message.trim() && !imageFile) || isTyping}
                className="absolute right-2 bottom-2 h-8 w-8"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-3">
            <Button variant="ghost" size="sm" disabled>
              <span className="mr-2">🔬</span>
              Deep Research
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <span className="mr-2">🎨</span>
              Canvas
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
