import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  TrashIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export function Sidebar() {
  const {
    chatrooms,
    activeChatroomId,
    searchQuery,
    isSidebarOpen,
    createChatroom,
    deleteChatroom,
    setActiveChatroom,
    setSearchQuery,
    setSidebarOpen,
    getFilteredChatrooms,
  } = useAppStore();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredChatrooms = getFilteredChatrooms();

  const handleNewChat = () => {
    const newChatroom = createChatroom();
  };

  const handleDeleteChatroom = (id: string) => {
    const chatroom = chatrooms.find((c) => c.id === id);
    if (chatroom) {
      deleteChatroom(id);
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Unknown";
    }

    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return dateObj.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-sidebar-foreground">
                Gemini
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewChat}
                  className="h-8 w-8"
                  title="New Chat"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 lg:hidden"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleNewChat}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Chat
              </Button>
              <Button variant="ghost" className="w-full justify-start" disabled>
                <SearchIcon className="mr-2 h-4 w-4" />
                Explore Gems
              </Button>
            </div>
          </div>

          {/* Recent Section */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Recent
              </h3>
            </div>

            <ScrollArea className="flex-1 px-4">
              {filteredChatrooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    {searchQuery
                      ? "No conversations found"
                      : "No conversations yet"}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="link"
                      onClick={handleNewChat}
                      className="mt-2"
                    >
                      Start your first chat
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-1 pb-4">
                  {filteredChatrooms.map((chatroom) => (
                    <div
                      key={chatroom.id}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors",
                        activeChatroomId === chatroom.id &&
                          "bg-sidebar-accent border border-sidebar-primary/20",
                      )}
                      onClick={() => setActiveChatroom(chatroom.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-sidebar-foreground truncate">
                          {chatroom.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(
                            chatroom.lastMessage || chatroom.createdAt,
                          )}
                        </p>
                      </div>

                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontalIcon className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteConfirmId(chatroom.id)}
                              >
                                <TrashIcon className="mr-2 h-3 w-3" />
                                Delete chat
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {deleteConfirmId === chatroom.id && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete chat</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{chatroom.title}"
                                and all its messages. This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteChatroom(chatroom.id)
                                }
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        )}
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Settings Footer */}
          <div className="border-t border-sidebar-border">
            <div className="p-4 space-y-1">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                SETTINGS
              </div>
              <ThemeSwitcher />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start hover:bg-sidebar-accent"
                disabled
              >
                <span className="mr-2">⚙️</span>
                Settings & Help
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu toggle */}
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
