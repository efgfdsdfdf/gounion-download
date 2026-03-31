import React, { useState, useRef } from "react";
import { Image, Send, Video, X } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { useAuthStore } from "../../store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";

export const CreatePost = () => {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { caption: string; image?: File | null }) =>
      api.posts.create(data),
    onSuccess: (newPost) => {
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old || !old.pages) {
          return { pages: [[newPost]], pageParams: [0] };
        }
        const newPages = [...old.pages];
        newPages[0] = [newPost, ...newPages[0]];
        return { ...old, pages: newPages };
      });
      handleRemoveFile();
      setContent("");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    mutation.mutate({ caption: content, image: selectedFile });
  };

  return (
    <GlassCard className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <img
            src={user?.avatarUrl}
            alt={user?.username}
            className="w-10 h-10 rounded-full object-cover border border-white/10"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-600 resize-none h-20 text-lg"
            />

            {previewUrl && (
              <div className="relative mt-4 rounded-xl overflow-hidden border border-white/10 group">
                {selectedFile?.type.startsWith("image/") ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    className="w-full h-auto max-h-96 object-cover"
                    controls
                  />
                )}
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors backdrop-blur-md"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
              <div className="flex gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-400 hover:text-violet-400 transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center gap-2"
                >
                  <Image size={20} />
                  <span className="text-xs font-medium hidden sm:inline">
                    Photo
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-400 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center gap-2"
                >
                  <Video size={20} />
                  <span className="text-xs font-medium hidden sm:inline">
                    Video
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={
                  (!content.trim() && !selectedFile) || mutation.isPending
                }
                className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              >
                {mutation.isPending ? (
                  "Posting..."
                ) : (
                  <>
                    <span>Post</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </GlassCard>
  );
};
