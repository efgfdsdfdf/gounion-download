import React, { useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CreatePost } from "../components/feed/CreatePost";
import { PostCard } from "../components/feed/PostCard";
import { StatusCircles } from "../components/feed/StatusCircles";
import { Skeleton } from "../components/ui/Skeleton";
import { api } from "../services/api";
import { Post } from "../types";

export const Dashboard = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["feed"],
      queryFn: api.posts.getFeed,
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length > 0 ? allPages.length : undefined;
      },
      refetchInterval: 5000, // Poll every 5 seconds for "real-time" feel
    });

  const { data: suggestions } = useQuery({
    queryKey: ["suggestions"],
    queryFn: api.profiles.getSuggestions,
    staleTime: 1000 * 60 * 5,
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ... same observer logic ...
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten the pages array into a single list of posts
  const posts = data?.pages.flat() || [];

  return (
    <div className="w-full pb-20 md:pb-0">
      <StatusCircles users={suggestions || []} />

      <div className="flex items-center justify-between mb-8 py-4 px-2 border-b border-white/5">
        <h1 className="text-3xl font-black text-white tracking-tighter">
          Home
        </h1>
        <select className="bg-[#141417] border border-white/10 rounded-xl text-sm text-zinc-400 py-1.5 px-4 focus:outline-none focus:border-primary transition-all">
          <option>All Posts</option>
          <option>Following</option>
          <option>Research</option>
        </select>
      </div>

      <CreatePost />

      {status === "pending" ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : status === "error" ? (
        <div className="text-center text-red-400 py-10 bg-white/5 rounded-2xl">
          <p>Unable to load posts. Please try again later.</p>
        </div>
      ) : (
        <div className="space-y-0">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Infinite Scroll Sentinel */}
          <div
            ref={loadMoreRef}
            className="h-24 flex flex-col items-center justify-center p-4"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
              </div>
            ) : hasNextPage ? (
              <div className="h-4 w-full" />
            ) : (
              <p className="text-zinc-500 text-sm">You've reached the end!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
