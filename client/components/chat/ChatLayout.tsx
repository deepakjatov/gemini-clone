import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { useAppStore } from "@/store";

export function ChatLayout() {
  const { isSidebarOpen } = useAppStore();

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <ChatArea />
      </div>
    </div>
  );
}
