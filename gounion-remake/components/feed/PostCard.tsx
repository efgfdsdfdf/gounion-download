import React from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  Trash2,
} from "lucide-react";
import { Post } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentSection } from "./CommentSection";
import { useAuthStore } from "../../store";
import { MediaPlayer } from "../ui/MediaPlayer";

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showComments, setShowComments] = React.useState(false);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const likeMutation = useMutation({
    mutationFn: () => api.posts.like(post.id),
    onMutate: async () => {
      const feedKey = ["feed"];
      const groupKey = post.groupId ? ["group-posts", post.groupId] : null;
      const profileKey = ["profile-posts", post.author.username];

      await queryClient.cancelQueries({ queryKey: feedKey });
      if (groupKey) await queryClient.cancelQueries({ queryKey: groupKey });
      await queryClient.cancelQueries({ queryKey: profileKey });

      const previousFeed = queryClient.getQueryData(feedKey);
      const previousGroupPosts = groupKey
        ? queryClient.getQueryData(groupKey)
        : null;
      const previousProfilePosts = queryClient.getQueryData(profileKey);

      const updatePost = (p: Post) => {
        if (p.id === post.id) {
          return {
            ...p,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            isLiked: !p.isLiked,
          };
        }
        return p;
      };

      queryClient.setQueryData(feedKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => page.map(updatePost)),
        };
      });

      if (groupKey) {
        queryClient.setQueryData(groupKey, (old: any) => {
          if (!old) return old;
          return old.map(updatePost);
        });
      }

      queryClient.setQueryData(profileKey, (old: any) => {
        if (!old) return old;
        return old.map(updatePost);
      });

      return { previousFeed, previousGroupPosts, previousProfilePosts };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["feed"], context?.previousFeed);
      if (post.groupId && context?.previousGroupPosts) {
        queryClient.setQueryData(
          ["group-posts", post.groupId],
          context.previousGroupPosts,
        );
      }
      queryClient.setQueryData(
        ["profile-posts", post.author.username],
        context?.previousProfilePosts,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      if (post.groupId) {
        queryClient.invalidateQueries({
          queryKey: ["group-posts", post.groupId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["profile-posts", post.author.username],
      });
    },
  });

  const [showMenu, setShowMenu] = React.useState(false);

  const reportMutation = useMutation({
    mutationFn: (reason: string) =>
      api.reports.create({ reason, postId: parseInt(post.id) }),
    onSuccess: () => {
      alert("Post reported successfully. Thank you for keeping GoUnion safe!");
      setShowMenu(false);
    },
    onError: () => {
      alert("Failed to report post. Please try again later.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.posts.delete(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      alert("Post deleted.");
    },
  });

  const handleReport = () => {
    const reason = prompt("Why are you reporting this post?");
    if (reason) {
      reportMutation.mutate(reason);
    }
  };

  const isModerator =
    currentUser?.role === "admin" || currentUser?.role === "moderator";
  const isOwner = currentUser?.id === post.author.id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[32px] overflow-hidden mb-6 group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5 hover:border-white/10"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/profile/${post.author.username}`}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full story-ring p-[2px] transition-transform duration-500 group-hover:scale-105">
              <div className="w-full h-full rounded-full border-2 border-[#0a0a0c] overflow-hidden">
                <img
                  src={
                    post.author.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${post.author.fullName}&background=random`
                  }
                  className="w-full h-full object-cover"
                  alt={post.author.fullName}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white hover:text-primary transition-colors">
                  {post.author.fullName}
                </h3>
                <span className="w-3 h-3 bg-accent rounded-full flex items-center justify-center text-[6px] font-black text-white">
                  ✓
                </span>
              </div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {post.author.university} • {post.timestamp}
              </p>
            </div>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 transition-colors rounded-xl ${showMenu ? "bg-white/10 text-white" : "text-zinc-600 hover:text-white"}`}
            >
              <MoreHorizontal size={20} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[100]"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-xl z-[110] overflow-hidden"
                  >
                    {!isOwner && (
                      <button
                        onClick={handleReport}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Flag size={16} />
                        Report Content
                      </button>
                    )}
                    {(isOwner || isModerator) && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this post?")) deleteMutation.mutate();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={16} />
                        Delete Post
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="text-zinc-200 text-[15px] leading-relaxed mb-4 font-medium">
          {post.content}
        </div>

        {/* Media */}
        {post.imageUrl && (
          <div className="mb-6">
            <MediaPlayer url={post.imageUrl} alt="Post media" />
          </div>
        )}

        {/* Interactions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-6">
            <button
              onClick={() => likeMutation.mutate()}
              className={`flex items-center gap-2 transition-all duration-300 group/btn ${post.isLiked ? "text-primary" : "text-zinc-500 hover:text-primary"}`}
            >
              <div
                className={`p-2 rounded-xl transition-colors ${post.isLiked ? "bg-primary/10" : "group-hover:bg-primary/5"}`}
              >
                <Heart
                  size={20}
                  className={post.isLiked ? "fill-current" : ""}
                />
              </div>
              <span className="text-xs font-black">{post.likes}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 transition-all duration-300 group/btn ${showComments ? "text-accent" : "text-zinc-500 hover:text-accent"}`}
            >
              <div
                className={`p-2 rounded-xl transition-colors ${showComments ? "bg-accent/10" : "group-hover:bg-accent/5"}`}
              >
                <MessageCircle size={20} />
              </div>
              <span className="text-xs font-black">{post.comments}</span>
            </button>
            <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all duration-300 group/btn">
              <div className="p-2 rounded-xl group-hover:bg-white/5">
                <Share2 size={20} />
              </div>
            </button>
          </div>
          <button className="p-2 text-zinc-500 hover:text-white transition-colors">
            <Bookmark size={20} />
          </button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "circOut" }}
            >
              <CommentSection
                postId={post.id}
                groupId={post.groupId}
                authorUsername={post.author.username}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};
