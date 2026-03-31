import React from "react";
import { Plus, UserPlus, Users, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export const RightSidebar = ({ className }: { className?: string }) => {
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["suggestions"],
    queryFn: api.profiles.getSuggestions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => api.profiles.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });

  return (
    <div
      className={`${className} flex flex-col h-full border-l border-white/5 bg-[#0a0a0c]/40 backdrop-blur-3xl pt-8 pb-8 px-6 overflow-y-auto scrollbar-hide`}
    >
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="p-1.5 bg-primary/20 rounded-lg">
            <UserPlus size={16} className="text-primary" />
          </div>
          <h3 className="text-zinc-100 font-bold text-sm tracking-tight uppercase">
            Who to Follow
          </h3>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-20 bg-white/5 rounded" />
                  <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
              </div>
            ))
          ) : (
            <AnimatePresence>
              {suggestions?.slice(0, 5).map((user: any, index: number) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between group p-2 -mx-2 rounded-2xl hover:bg-white/[0.03] transition-all duration-300"
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative">
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-primary transition-colors"
                      />
                      <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[13px] font-black text-zinc-100 truncate group-hover:text-primary transition-colors">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate font-bold uppercase tracking-tighter">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => followMutation.mutate(user.id)}
                    className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all duration-300 transform active:scale-95 shadow-[0_0_10px_rgba(196,255,14,0.1)]"
                  >
                    <Plus size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="p-1.5 bg-accent/20 rounded-lg">
            <Users size={16} className="text-accent" />
          </div>
          <h3 className="text-zinc-100 font-bold text-sm tracking-tight uppercase">
            Suggested Groups
          </h3>
        </div>

        <div className="space-y-4">
          {[
            { name: "Computer Science 2026", members: "1.2k", icon: "💻" },
            { name: "University Sports Club", members: "850", icon: "⚽" },
            { name: "Design Ethos", members: "430", icon: "🎨" },
          ].map((group, i) => (
            <div
              key={i}
              className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-white/[0.03] transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center justify-center text-xl group-hover:border-accent/30 transition-colors">
                  {group.icon}
                </div>
                <div>
                  <p className="text-[13px] font-black text-zinc-200 group-hover:text-accent transition-colors">
                    {group.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-tighter">
                    {group.members} students
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-100 transition-all">
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-[32px] p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />
          <h4 className="text-white font-black text-sm mb-2 relative z-10 tracking-tight">
            Premium Student Plus
          </h4>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-4 relative z-10">
            Unlock advanced networking, custom profile themes, and exclusive
            academic groups.
          </p>
          <button className="w-full py-3 bg-primary text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-primary/5 relative z-10">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};
