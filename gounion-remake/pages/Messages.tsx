import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Phone, Video, MoreVertical, Search } from "lucide-react";
import { api } from "../services/api";

export const Messages = () => {
  const queryClient = useQueryClient();
  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: api.chats.getAll,
  });
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: messages } = useQuery({
    queryKey: ["messages", selectedChatId],
    queryFn: () => api.chats.getMessages(selectedChatId!),
    enabled: !!selectedChatId,
    refetchInterval: 5000, // Poll every 5s for demo purposes
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, content }: { chatId: string; content: string }) =>
      api.chats.sendMessage(chatId, content),
    onMutate: async ({ content }) => {
      setMessageText("");
      await queryClient.cancelQueries({ queryKey: ["messages", selectedChatId] });
      await queryClient.cancelQueries({ queryKey: ["chats"] });

      const previousMessages = queryClient.getQueryData(["messages", selectedChatId]);
      const previousChats = queryClient.getQueryData(["chats"]);

      const newMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderId: currentUserId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };

      // Optimistically update messages
      queryClient.setQueryData(["messages", selectedChatId], (old: any) => {
        return old ? [...old, newMessage] : [newMessage];
      });

      // Optimistically update chats list (move to top and update last message)
      queryClient.setQueryData(["chats"], (old: any) => {
        if (!old) return old;
        const chatIndex = old.findIndex((c: any) => c.id === selectedChatId);
        if (chatIndex === -1) return old;

        const updatedChat = {
          ...old[chatIndex],
          lastMessage: content,
          timestamp: newMessage.timestamp
        };

        const newChats = [...old];
        newChats.splice(chatIndex, 1);
        return [updatedChat, ...newChats];
      });

      return { previousMessages, previousChats };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(["messages", selectedChatId], context?.previousMessages);
      queryClient.setQueryData(["chats"], context?.previousChats);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const selectedChat = chats?.find((c) => c.id === selectedChatId);
  const currentUserId = sessionStorage.getItem("user_id");

  const handleSend = () => {
    if (!messageText.trim() || !selectedChatId) return;
    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: messageText,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-sm">
      {/* Sidebar List */}
      <div
        className={`w-full md:w-80 border-r border-white/5 flex flex-col ${selectedChatId ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats?.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No conversations yet
            </div>
          )}
          {chats?.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`p-4 flex gap-3 cursor-pointer transition-colors ${selectedChatId === chat.id ? "bg-violet-500/10 border-l-2 border-violet-500" : "hover:bg-white/5 border-l-2 border-transparent"}`}
            >
              <div className="relative">
                <img
                  src={chat.partner.avatarUrl}
                  alt={chat.partner.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#09090b] rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4
                    className={`font-semibold text-sm truncate ${selectedChatId === chat.id ? "text-violet-200" : "text-zinc-200"}`}
                  >
                    {chat.partner.fullName}
                  </h4>
                  <span className="text-xs text-zinc-500">
                    {chat.timestamp}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${chat.unreadCount > 0 ? "text-zinc-100 font-medium" : "text-zinc-500"}`}
                >
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${!selectedChatId ? "hidden md:flex" : "flex"}`}
      >
        {selectedChat ? (
          <>
            <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden text-zinc-400 mr-2"
                >
                  ←
                </button>
                <img
                  src={selectedChat.partner.avatarUrl}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-zinc-100">
                    {selectedChat.partner.fullName}
                  </h3>
                  <span className="text-xs text-emerald-500 flex items-center gap-1">
                    ● Online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <button className="hover:text-violet-400 transition-colors">
                  <Phone size={20} />
                </button>
                <button className="hover:text-violet-400 transition-colors">
                  <Video size={20} />
                </button>
                <button className="hover:text-white transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages?.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.senderId === currentUserId ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.senderId !== currentUserId && (
                    <img
                      src={selectedChat.partner.avatarUrl}
                      className="w-8 h-8 rounded-full self-end mb-1"
                    />
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.senderId === currentUserId
                        ? "bg-violet-600 text-white rounded-br-none shadow-lg shadow-violet-900/20"
                        : "bg-white/10 text-zinc-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-[10px] opacity-50 block mt-1 text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {messages?.length === 0 && (
                <div className="h-full flex items-center justify-center text-zinc-500 italic text-sm">
                  Start the conversation!
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-200 placeholder:text-zinc-600"
                />
                <button
                  onClick={handleSend}
                  disabled={
                    sendMessageMutation.isPending || !messageText.trim()
                  }
                  className="text-zinc-500 hover:text-violet-400 transition-colors disabled:opacity-30"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Send size={32} className="opacity-50" />
            </div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
