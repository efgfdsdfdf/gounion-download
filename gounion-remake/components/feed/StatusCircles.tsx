import React, { useState } from "react";
import { Plus } from "lucide-react";
import { User } from "../../types";
import { useAuthStore } from "../../store";
import { CreateStatusModal } from "./CreateStatusModal";
import { StoryViewer } from "./StoryViewer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";

export const StatusCircles = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState<any[]>([]);
  const [viewerUser, setViewerUser] = useState<any>(null);

  const { data: storiesFeed = [] } = useQuery({
    queryKey: ["stories-feed"],
    queryFn: api.stories.getFeed,
    refetchInterval: 60000, // Refetch every minute
  });

  // Group stories by user
  const groupedStories = storiesFeed.reduce((acc: any, story: any) => {
    const userId = story.user.id;
    if (!acc[userId]) {
      acc[userId] = {
        user: story.user,
        stories: [],
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {});

  const myStories = groupedStories[user?.id]?.stories || [];
  const otherStories = Object.values(groupedStories).filter(
    (group: any) => group.user.id !== user?.id,
  );

  const openViewer = (group: any) => {
    setSelectedUserStories(group.stories);
    setViewerUser(group.user);
    setIsViewerOpen(true);
  };

  return (
    <div className="flex items-center gap-6 overflow-x-auto pb-6 mb-8 scrollbar-hide -mx-4 px-4 border-b border-white/5">
      {/* Your Status */}
      <div className="flex flex-col items-center gap-2 shrink-0 group">
        <button
          onClick={() =>
            myStories.length > 0
              ? openViewer({ stories: myStories, user })
              : setIsModalOpen(true)
          }
          className="relative p-[2.5px] rounded-full group-hover:scale-105 transition-all duration-300"
        >
          <div
            className={`w-16 h-16 rounded-full border-2 border-[#0a0a0c] bg-white/[0.03] flex items-center justify-center overflow-hidden transition-all duration-500 ${myStories.length > 0 ? "ring-4 ring-primary ring-offset-2 ring-offset-[#0a0a0c] scale-105" : ""}`}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Your Avatar"
                className={`w-full h-full object-cover transition-all duration-700 ${myStories.length > 0 ? "opacity-100 scale-100 blur-0" : "opacity-40 blur-[2px]"}`}
              />
            ) : (
              <div className="w-full h-full bg-zinc-800" />
            )}
            {myStories.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-primary/80 group-hover:text-primary transition-colors">
                <Plus size={24} />
              </div>
            )}
          </div>
          {/* WhatsApp Style Pulsing Ring */}
          {myStories.length > 0 ? (
            <div className="absolute -inset-1 rounded-full border-[3px] border-primary animate-pulse shadow-[0_0_25px_rgba(196,255,14,0.6)]" />
          ) : (
            <div className="absolute inset-0 rounded-full border-[2px] border-primary/20 border-dashed animate-[spin_30s_linear_infinite]" />
          )}
        </button>
        <span
          className={`text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${myStories.length > 0 ? "text-primary" : "text-zinc-500"}`}
        >
          {myStories.length > 0 ? "View Story" : "My Story"}
        </span>
      </div>

      {otherStories.map((group: any) => (
        <div
          key={group.user.id}
          onClick={() => openViewer(group)}
          className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer transition-transform hover:-translate-y-1"
        >
          <div className="p-[2.5px] rounded-full ring-4 ring-primary ring-offset-2 ring-offset-[#0a0a0c] scale-105 shadow-[0_0_15px_rgba(196,255,14,0.2)]">
            <div className="w-16 h-16 rounded-full border-2 border-[#0a0a0c] overflow-hidden">
              <img
                src={group.user.avatarUrl}
                alt={group.user.username}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary transition-colors">
            {group.user.username}
          </span>
        </div>
      ))}

      <StoryViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        stories={selectedUserStories}
        currentUser={viewerUser}
      />

      <CreateStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["stories-feed"] });
        }}
      />
    </div>
  );
};
