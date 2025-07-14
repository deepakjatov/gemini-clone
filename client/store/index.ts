import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  imageUrl?: string;
}

export interface Chatroom {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastMessage?: Date;
}

export interface User {
  id: string;
  phone: string;
  countryCode: string;
  isAuthenticated: boolean;
}

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticating: boolean;
  otpSent: boolean;

  // Chat state
  chatrooms: Chatroom[];
  activeChatroomId: string | null;
  isTyping: boolean;
  searchQuery: string;

  // UI state
  isSidebarOpen: boolean;
  theme: "light" | "dark";

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticating: (isAuthenticating: boolean) => void;
  setOtpSent: (otpSent: boolean) => void;

  createChatroom: (title?: string) => Chatroom;
  deleteChatroom: (id: string) => void;
  setActiveChatroom: (id: string) => void;

  addMessage: (chatroomId: string, message: Omit<Message, "id">) => void;
  setTyping: (isTyping: boolean) => void;

  setSearchQuery: (query: string) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;

  // Computed
  getActiveChatroom: () => Chatroom | null;
  getFilteredChatrooms: () => Chatroom[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticating: false,
      otpSent: false,

      chatrooms: [],
      activeChatroomId: null,
      isTyping: false,
      searchQuery: "",

      isSidebarOpen: true,
      theme: "light",

      // Auth actions
      setUser: (user) => set({ user }),
      setAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
      setOtpSent: (otpSent) => set({ otpSent }),

      // Chat actions
      createChatroom: (title) => {
        const newChatroom: Chatroom = {
          id: crypto.randomUUID(),
          title: title || "New Chat",
          messages: [],
          createdAt: new Date(),
        };

        set((state) => ({
          chatrooms: [newChatroom, ...state.chatrooms],
          activeChatroomId: newChatroom.id,
        }));

        return newChatroom;
      },

      deleteChatroom: (id) => {
        set((state) => {
          // First, ensure the chatroom exists
          const chatroomExists = state.chatrooms.some((room) => room.id === id);
          if (!chatroomExists) {
            return state; // No changes if chatroom doesn't exist
          }

          const remainingChatrooms = state.chatrooms.filter(
            (room) => room.id !== id,
          );
          let newActiveChatroomId = state.activeChatroomId;

          // If we're deleting the active chatroom, select another one or set to null
          if (state.activeChatroomId === id) {
            if (remainingChatrooms.length > 0) {
              // Select the most recent chatroom (first in array)
              newActiveChatroomId = remainingChatrooms[0].id;
            } else {
              // No chatrooms left
              newActiveChatroomId = null;
            }
          }

          return {
            ...state,
            chatrooms: remainingChatrooms,
            activeChatroomId: newActiveChatroomId,
            // Reset any chat-related UI state
            isTyping: false,
          };
        });
      },

      setActiveChatroom: (id) => set({ activeChatroomId: id }),

      addMessage: (chatroomId, messageData) => {
        const message: Message = {
          ...messageData,
          id: crypto.randomUUID(),
        };

        set((state) => ({
          chatrooms: state.chatrooms.map((room) =>
            room.id === chatroomId
              ? {
                  ...room,
                  messages: [...room.messages, message],
                  lastMessage: message.timestamp,
                  title:
                    room.messages.length === 0
                      ? message.content.length > 50
                        ? message.content.substring(0, 50) + "..."
                        : message.content
                      : room.title,
                }
              : room,
          ),
        }));
      },

      setTyping: (isTyping) => set({ isTyping }),

      // UI actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setTheme: (theme) => set({ theme }),

      // Computed getters
      getActiveChatroom: () => {
        const { chatrooms, activeChatroomId } = get();
        return chatrooms.find((room) => room.id === activeChatroomId) || null;
      },

      getFilteredChatrooms: () => {
        const { chatrooms, searchQuery } = get();
        if (!searchQuery) return chatrooms;

        return chatrooms.filter((room) =>
          room.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      },
    }),
    {
      name: "gemini-app-storage",
      partialize: (state) => ({
        user: state.user,
        chatrooms: state.chatrooms,
        activeChatroomId: state.activeChatroomId,
        theme: state.theme,
      }),
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;

          try {
            const parsed = JSON.parse(item);
            // Convert date strings back to Date objects
            if (parsed.state?.chatrooms) {
              parsed.state.chatrooms = parsed.state.chatrooms.map(
                (room: any) => ({
                  ...room,
                  createdAt: new Date(room.createdAt),
                  lastMessage: room.lastMessage
                    ? new Date(room.lastMessage)
                    : undefined,
                  messages:
                    room.messages?.map((msg: any) => ({
                      ...msg,
                      timestamp: new Date(msg.timestamp),
                    })) || [],
                }),
              );
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    },
  ),
);
