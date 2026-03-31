import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  Image as ImageIcon,
  Send,
  Shield,
  Globe,
  Lock,
  Clock,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { GlassCard } from "../components/ui/GlassCard";
import { PostCard } from "../components/feed/PostCard";
import { Skeleton } from "../components/ui/Skeleton";

export const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "admin">(
    "feed",
  );

  const currentUserId = sessionStorage.getItem("user_id");

  const { data: group, isLoading: isGroupLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => api.groups.getById(id!),
    enabled: !!id,
  });

  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ["group-members", id],
    queryFn: () => api.groups.getMembers(id!),
    enabled: !!id,
  });

  const { data: requests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ["group-requests", id],
    queryFn: () => api.groups.getRequests(id!),
    enabled: !!id && group?.creatorId === currentUserId,
  });

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["group-posts", id],
    queryFn: () => api.groups.getPosts(id!),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5 seconds for "real-time" feel
  });

  const isMember = members?.some((m: any) => m.user_id === currentUserId);
  const isAdmin = group?.creatorId === currentUserId;
  const isPending = requests?.some(
    (r: any) => r.user_id === currentUserId && r.status === "pending",
  );

  const createPostMutation = useMutation({
    mutationFn: (data: { caption: string; image: File | null }) =>
      api.groups.createPost(id!, data),
    onSuccess: () => {
      setCaption("");
      setImage(null);
      queryClient.invalidateQueries({ queryKey: ["group-posts", id] });
    },
  });

  const joinMutation = useMutation({
    mutationFn: () => api.groups.join(id!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      queryClient.invalidateQueries({ queryKey: ["group-requests", id] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: number;
      status: "accepted" | "rejected";
    }) => api.groups.approveRequest(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
    },
  });

  if (isGroupLoading)
    return (
      <div className="py-20 text-center">
        <Skeleton className="h-64 rounded-[2.5rem] mb-8" />
        <Skeleton className="h-20 rounded-2xl w-1/2 mx-auto" />
      </div>
    );

  if (!group)
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="text-2xl font-black text-white tracking-tighter mb-4">
          Group not found
        </h2>
        <button
          onClick={() => navigate("/groups")}
          className="px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Back to Groups
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      <button
        onClick={() => navigate("/groups")}
        className="flex items-center gap-3 text-zinc-500 hover:text-primary transition-all mb-8 group"
      >
        <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary group-hover:text-black transition-all">
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">
          Back to Groups
        </span>
      </button>

      <div className="relative h-72 rounded-[2.5rem] overflow-hidden mb-12 border border-white/5 shadow-2xl group">
        <img
          src={group.imageUrl}
          alt={group.name}
          className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />

        <div className="absolute top-6 left-8">
          <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
            {group.privacy === "public" ? (
              <Globe size={14} className="text-primary" />
            ) : (
              <Lock size={14} className="text-accent" />
            )}
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {group.privacy} Group
            </span>
          </div>
        </div>

        <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2 leading-tight">
              {group.name}
            </h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
              {members?.length || 0} Members
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`p-4 rounded-2xl transition-all ${activeTab === "admin" ? "bg-accent text-black" : "bg-white/5 text-zinc-500 hover:bg-white/10"}`}
              >
                <Shield size={20} />
              </button>
            )}

            {isMember ? (
              <button className="px-8 py-4 bg-white/5 text-zinc-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
                Member
              </button>
            ) : isPending ? (
              <button className="px-8 py-4 bg-white/5 text-accent rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-accent/20">
                <Clock size={16} />
                Pending Join
              </button>
            ) : (
              <button
                onClick={() => joinMutation.mutate()}
                className="px-8 py-4 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:scale-105"
              >
                Join Group
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {["feed", "members"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-white text-black shadow-lg"
                : "bg-white/5 text-zinc-500 hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === "feed" && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {isMember && (
                  <GlassCard className="!rounded-[2rem] overflow-hidden border-white/5 shadow-xl relative group">
                    <div className="flex flex-col gap-4 p-4">
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={`Share something with ${group.name}...`}
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-700 resize-none h-24 text-lg font-medium"
                      />
                      {image && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden mb-2">
                          <img
                            src={URL.createObjectURL(image)}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setImage(null)}
                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mx-2">
                        <label className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors py-2 px-3 rounded-xl hover:bg-white/5 cursor-pointer">
                          <ImageIcon size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Add Photo
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              setImage(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        <button
                          onClick={() =>
                            createPostMutation.mutate({ caption, image })
                          }
                          disabled={
                            !caption.trim() || createPostMutation.isPending
                          }
                          className="bg-primary text-black disabled:opacity-50 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/10 flex items-center gap-2"
                        >
                          <Send size={16} />
                          {createPostMutation.isPending ? "Posting..." : "Post"}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                )}

                <div className="space-y-6">
                  {isPostsLoading ? (
                    [1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-64 rounded-[2.5rem]" />
                    ))
                  ) : posts?.length === 0 ? (
                    <div className="py-20 text-center bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10">
                      <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">
                        No posts found in this group
                      </p>
                    </div>
                  ) : (
                    posts?.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "admin" && isAdmin && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-black text-white tracking-tighter mb-4">
                  Pending Member Requests
                </h3>
                {requests?.length === 0 ? (
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    No pending requests
                  </p>
                ) : (
                  requests?.map((req: any) => (
                    <GlassCard
                      key={req.id}
                      className="!p-6 border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                          <img
                            src={
                              req.user.profile?.profile_picture ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.username}`
                            }
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white font-black text-sm">
                            {req.user.username}
                          </p>
                          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            Wants to join
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            approveMutation.mutate({
                              requestId: req.id,
                              status: "accepted",
                            })
                          }
                          className="p-3 bg-primary/20 text-primary rounded-xl hover:bg-primary hover:text-black transition-all"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() =>
                            approveMutation.mutate({
                              requestId: req.id,
                              status: "rejected",
                            })
                          }
                          className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </GlassCard>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <GlassCard className="!rounded-[2rem] !p-8 border-white/5 shadow-xl">
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">
              Group Info
            </h4>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-6">
              {group.description ||
                "Official group for university communication."}
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  Status
                </span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  Privacy
                </span>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">
                  {group.privacy}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
