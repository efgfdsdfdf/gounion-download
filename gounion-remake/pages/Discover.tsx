import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { api } from "../services/api";
import { Post } from "../types";
import { useAuthStore } from "../store";

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v|avi|mkv|m3u8)(\?|$)/i.test(url);
};

export const Discover = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = React.useState(true);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["discover-reels"],
      queryFn: api.posts.getReels,
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length > 0 ? allPages.length : undefined,
    });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.posts.like(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discover-reels"] });
      queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const elements = Object.values(videoRefs.current).filter(
      (el): el is HTMLVideoElement => Boolean(el),
    );
    if (!elements.length) return;

    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio > 0.65) {
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0.25, 0.65, 0.9] },
    );

    elements.forEach((video) => playObserver.observe(video));
    return () => playObserver.disconnect();
  }, [data]);

  const uniqueReels = Array.from(
    new Map((data?.pages.flat() || []).map((post: Post) => [post.id, post])).values(),
  );
  const reels = uniqueReels.filter(
    (post: Post) => isVideoUrl(post.imageUrl) && post.author.id !== currentUser?.id,
  );

  if (status === "pending") {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-white/60">
        Loading reels...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] overflow-y-auto snap-y snap-mandatory rounded-3xl border border-white/10 bg-black">
      {reels.length === 0 ? (
        <div className="h-full flex items-center justify-center text-white/60">
          No reels yet.
        </div>
      ) : (
        reels.map((reel) => (
          <section
            key={reel.id}
            className="snap-start h-[calc(100vh-8rem)] relative bg-black"
          >
            <video
              ref={(el) => {
                videoRefs.current[reel.id] = el;
              }}
              src={reel.imageUrl}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
            />

            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <div className="flex items-end justify-between gap-6">
                <div className="min-w-0">
                  <Link
                    to={`/profile/${reel.author.username}`}
                    className="font-semibold text-white hover:underline"
                  >
                    @{reel.author.username}
                  </Link>
                  <p className="mt-2 text-sm text-white/90 line-clamp-3">
                    {reel.content || "New reel"}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-4">
                  <button
                    onClick={() => likeMutation.mutate(reel.id)}
                    className="flex flex-col items-center text-white/90 hover:text-pink-400 transition-colors"
                  >
                    <Heart
                      className={`w-6 h-6 ${reel.isLiked ? "fill-current text-pink-500" : ""}`}
                    />
                    <span className="text-xs mt-1">{reel.likes}</span>
                  </button>
                  <div className="flex flex-col items-center text-white/90">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-xs mt-1">{reel.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))
      )}
      <div ref={loadMoreRef} className="h-8" />
    </div>
  );
};
