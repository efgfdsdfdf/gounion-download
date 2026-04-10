import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, UserPlus, Check, Sparkles, MapPin, GraduationCap } from "lucide-react";
import { api } from "../services/api";
import { Skeleton } from "../components/ui/Skeleton";

export const Alumni = () => {
  const [query, setQuery] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", query],
    queryFn: () => api.search.users(query),
    enabled: true, 
  });

  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => api.friends.sendRequest(userId),
    onSuccess: () => {
      // In a real app, we'd update the UI state to show "Request Sent"
    },
  });

  return (
    <div className="w-full pb-20 md:pb-0 selection:bg-primary/30">
      <div className="mb-12 relative p-8 rounded-[2.5rem] bg-[#0a0a0c] overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-primary to-accent" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <GraduationCap size={28} className="text-accent" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">Campus Network</h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Connect with the elite collective across all departments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-12 group">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-accent transition-colors"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, faculty, or cohort..."
          className="w-full bg-[#111] border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/10 transition-all font-bold text-sm tracking-tight shadow-inner"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users?.map((user: any) => (
            <div
              key={user.id}
              className="glass-panel group relative !rounded-[2.5rem] p-8 border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />
              
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-accent to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                  <img
                    src={user.profile?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt={user.username}
                    className="relative w-20 h-20 rounded-2xl object-cover border border-white/10 bg-[#0a0a0c]"
                  />
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Verified</span>
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <h3 className="font-serif text-2xl font-bold text-white tracking-tight group-hover:text-accent transition-colors">
                  @{user.username}
                </h3>
                <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-[9px]">
                  <MapPin size={10} className="text-accent" />
                  <span>{user.profile?.university || "Global Campus"}</span>
                </div>
              </div>

              <button
                onClick={() => sendRequestMutation.mutate(user.id)}
                disabled={sendRequestMutation.isPending}
                className="w-full py-4 bg-white/5 border border-white/5 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  <UserPlus size={14} className="transition-transform group-hover/btn:scale-110" />
                  {sendRequestMutation.isPending ? "Syncing..." : "Initialize Link"}
                </span>
              </button>
            </div>
          ))}
          {users?.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <Sparkles size={40} className="mx-auto text-zinc-800 mb-6 opacity-20" />
              <p className="font-serif text-2xl text-zinc-500">No network profiles identified in this sector.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
