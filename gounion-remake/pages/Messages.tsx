import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Phone, Video, MoreVertical, Search, Sparkles, ChevronLeft, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";

export const Messages = () => {
  const queryClient = useQueryClient();
  const currentUserId = sessionStorage.getItem("user_id");
  
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
    refetchInterval: 5000, 
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

      queryClient.setQueryData(["messages", selectedChatId], (old: any) => {
        return old ? [...old, newMessage] : [newMessage];
      });

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
    <div className="h-[calc(100vh-8rem)] flex rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-3xl shadow-2xl selection:bg-primary/30">
      {/* Conversation List */}
      <div
        className={`w-full md:w-[380px] border-r border-white/5 flex flex-col ${selectedChatId ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-8 border-b border-white/5">
          <h2 className="font-serif text-3xl font-bold text-white mb-6 tracking-tight">Messages</h2>
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/10 transition-all font-bold"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-2">
          {chats?.length === 0 && (
            <div className="py-20 text-center">
              <Sparkles size={32} className="mx-auto text-zinc-800 mb-4 opacity-30" />
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No encrypted links found</p>
            </div>
          )}
          {chats?.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`p-4 rounded-2xl flex gap-4 cursor-pointer transition-all relative group ${
                selectedChatId === chat.id 
                ? "bg-white/5 border border-white/10 shadow-lg" 
                : "hover:bg-white/[0.02] border border-transparent"
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={chat.partner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.partner.username}`}
                  alt={chat.partner.username}
                  className={`w-14 h-14 rounded-2xl object-cover border-2 transition-colors ${selectedChatId === chat.id ? "border-primary" : "border-white/5"}`}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-[#0a0a0c] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-serif text-lg font-bold text-white truncate group-hover:text-primary transition-colors">
                    {chat.partner.fullName}
                  </h4>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">
                    {chat.timestamp}
                  </span>
                </div>
                <p className={`text-xs truncate ${chat.unreadCount > 0 ? "text-white font-bold" : "text-zinc-500 font-medium"}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {selectedChatId === chat.id && (
                <motion.div layoutId="activeChatBar" className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(196,255,14,0.5)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col bg-white/[0.01] ${!selectedChatId ? "hidden md:flex" : "flex"}`}
      >
        {selectedChat ? (
          <>
            <div className="h-24 px-8 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden p-2 bg-white/5 rounded-xl text-zinc-400 mr-2"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="relative">
                  <img
                    src={selectedChat.partner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.partner.username}`}
                    alt="User"
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                    {selectedChat.partner.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Encrypted Session</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3.5 bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                  <Phone size={20} />
                </button>
                <button className="p-3.5 bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                  <Video size={20} />
                </button>
                <button className="p-3.5 bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-none">
              <AnimatePresence mode="popLayout">
                {messages?.map((msg: any) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-4 ${msg.senderId === currentUserId ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {msg.senderId !== currentUserId && (
                      <img
                        src={selectedChat.partner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.partner.username}`}
                        className="w-9 h-9 rounded-xl self-end mb-1 border border-white/10"
                      />
                    )}
                    <div className="max-w-[70%] space-y-1">
                      <div
                        className={`p-4 rounded-[1.5rem] shadow-xl ${
                          msg.senderId === currentUserId
                            ? "bg-white text-black rounded-br-none"
                            : "bg-white/5 border border-white/5 text-white rounded-bl-none backdrop-blur-sm"
                        }`}
                      >
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest block px-1 ${msg.senderId === currentUserId ? "text-right text-zinc-700" : "text-left text-zinc-700"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {messages?.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                  <Send size={40} className="text-zinc-600" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Initialize sequence</p>
                </div>
              )}
            </div>

            <div className="p-8 backdrop-blur-md">
              <div className="flex items-center gap-4 bg-[#111] border border-white/5 rounded-[2rem] px-6 py-4 shadow-inner focus-within:border-white/10 transition-all group">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Transmit message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-800 font-bold"
                />
                <button
                  onClick={handleSend}
                  disabled={sendMessageMutation.isPending || !messageText.trim()}
                  className="p-3 bg-white text-black rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-20 shadow-xl active:scale-90"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white text-black flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <Send size={36} />
            </div>
            <h2 className="font-serif text-4xl text-white mb-4 tracking-tight">Encrypted Terminal</h2>
            <p className="max-w-xs text-zinc-600 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
              select a verified network node to establish a secure communication channel
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
