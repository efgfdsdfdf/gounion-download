import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Search,
  Users as UsersIcon,
  Plus,
  Globe,
  Lock,
  EyeOff,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { GlassCard } from "../components/ui/GlassCard";
import { Skeleton } from "../components/ui/Skeleton";
import { Group } from "../types";

export const Groups = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    privacy: "public",
    image: null as File | null,
  });

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: api.groups.getAll,
  });

  const createGroupMutation = useMutation({
    mutationFn: api.groups.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsModalOpen(false);
      setNewGroup({
        name: "",
        description: "",
        privacy: "public",
        image: null,
      });
    },
  });

  const filteredGroups = groups?.filter(
    (g: any) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full pb-20 md:pb-0">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Groups
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
            Join community groups and connect with others
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
            {groups?.length || 0} active groups
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            Create Group
          </button>
        </div>
      </div>

      <div className="relative mb-12 group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors"
          size={20}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for groups..."
          className="w-full bg-[#141417]/50 backdrop-blur-md border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary/30 focus:bg-[#141417] transition-all font-bold text-sm tracking-tight"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[400px] rounded-[2.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGroups?.map((group: any) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="block h-full group"
            >
              <GlassCard
                hoverEffect
                className="flex flex-col h-full !p-0 !rounded-[2.5rem] overflow-hidden border-white/5 group-hover:border-primary/20 transition-all duration-500"
              >
                <div className="relative h-48 bg-zinc-800 overflow-hidden">
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-[#141417]/40 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                      {group.privacy === "public" ? (
                        <Globe size={12} className="text-primary" />
                      ) : (
                        <Lock size={12} className="text-accent" />
                      )}
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter">
                        {group.privacy}
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(196,255,14,0.8)]" />
                    <span className="text-[9px] font-black text-white uppercase tracking-tighter">
                      Active
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-8">
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">
                    <UsersIcon size={14} className="text-primary" />
                    <span>
                      {group.memberCount?.toLocaleString() || 0} Members
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                    {group.description ||
                      "Join this group to connect with others."}
                  </p>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Redirect to details to join/request
                    }}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                      group.isJoined
                        ? "bg-white/5 text-zinc-500 hover:bg-white/10"
                        : "bg-primary text-black hover:opacity-90 shadow-lg shadow-primary/10 group-hover:shadow-primary/20"
                    }`}
                  >
                    {group.isJoined ? "Joined" : "Join Group"}
                  </button>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-[#141417] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter">
                    Create New Group
                  </h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                    Start a community conversation
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    placeholder="e.g. Computer Science 2026"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-primary/30 transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                    Privacy Level
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        id: "public",
                        label: "Public",
                        icon: Globe,
                        desc: "Anyone join",
                      },
                      {
                        id: "private",
                        label: "Private",
                        icon: Lock,
                        desc: "Requires request",
                      },
                      {
                        id: "secret",
                        label: "Secret",
                        icon: EyeOff,
                        desc: "Invite only",
                      },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() =>
                          setNewGroup({ ...newGroup, privacy: p.id })
                        }
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                          newGroup.privacy === p.id
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                        }`}
                      >
                        <p.icon size={20} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                    Description
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, description: e.target.value })
                    }
                    placeholder="Tell people what this group is about..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white h-32 resize-none focus:outline-none focus:border-primary/30 transition-all font-medium"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-all group">
                      <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all">
                        <ImageIcon size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">
                          Cover Image
                        </p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                          {newGroup.image
                            ? newGroup.image.name
                            : "Select JPG or PNG"}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            image: e.target.files ? e.target.files[0] : null,
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5">
                <button
                  onClick={() => createGroupMutation.mutate(newGroup)}
                  disabled={!newGroup.name || createGroupMutation.isPending}
                  className="w-full py-4 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-primary/10"
                >
                  {createGroupMutation.isPending
                    ? "Creating..."
                    : "Create Group"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
