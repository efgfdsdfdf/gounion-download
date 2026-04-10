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
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { Skeleton } from "../components/ui/Skeleton";

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
    <div className="w-full pb-20 md:pb-0 selection:bg-primary/30">
      <div className="mb-12 relative p-8 rounded-[2.5rem] bg-[#0a0a0c] overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-emerald-500" />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <UsersIcon size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">Active Communities</h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Discover campus collectives & specialized boards</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
          >
            <Plus size={16} />
            Found New Group
          </button>
        </div>
      </div>

      <div className="relative mb-12 group">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-primary transition-colors"
          size={18}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter ecosystems..."
          className="w-full bg-[#111] border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/10 transition-all font-bold text-sm tracking-tight shadow-inner"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[420px] rounded-[2.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGroups?.map((group: any) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="group block"
            >
              <div className="glass-panel h-full flex flex-col !p-0 !rounded-[2.5rem] overflow-hidden border-white/5 group-hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="relative h-48 bg-[#0a0a0c] overflow-hidden">
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />

                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
                      {group.privacy === "public" ? (
                        <Globe size={11} className="text-primary" />
                      ) : (
                        <Lock size={11} className="text-accent" />
                      )}
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter">
                        {group.privacy}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-8">
                  <h3 className="font-serif text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-4">
                    <UsersIcon size={12} />
                    <span>{group.memberCount?.toLocaleString() || 0} Members</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-emerald-500/80 uppercase">Active Now</span>
                  </div>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                    {group.description || "Official campus board for university students."}
                  </p>

                  <div className="w-full py-4 rounded-xl bg-white/5 border border-white/5 text-white font-bold text-[10px] uppercase tracking-[0.2em] text-center group-hover:bg-white group-hover:text-black transition-all">
                    Access Board
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filteredGroups?.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <Sparkles size={40} className="mx-auto text-zinc-800 mb-6 opacity-20" />
              <p className="font-serif text-2xl text-zinc-500">No communities found matching your filter.</p>
            </div>
          )}
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
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl glass-panel !p-0 rounded-[2.5rem] shadow-2xl overflow-hidden border-white/10"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white tracking-tight">Establish New Collective</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Define the visual identity & privacy governance</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all border border-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Collective Name</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="e.g. AI Ethics Research Group"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-primary/20 transition-all font-bold text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Privacy Architecture</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "public", label: "Global", icon: Globe, desc: "Open to all members" },
                      { id: "private", label: "Restricted", icon: Lock, desc: "Manual approval" },
                      { id: "secret", label: "Hidden", icon: EyeOff, desc: "Invite-only access" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setNewGroup({ ...newGroup, privacy: p.id })}
                        className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 relative ${
                          newGroup.privacy === p.id
                            ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(196,255,14,0.1)]"
                            : "bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/5"
                        }`}
                      >
                        <p.icon size={22} className={newGroup.privacy === p.id ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"} />
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${newGroup.privacy === p.id ? "text-white" : "text-zinc-500"}`}>
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Manifesto</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Describe the purpose, culture, and goals..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-white h-32 resize-none focus:outline-none focus:border-primary/20 transition-all font-medium text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-4 w-full bg-white/5 border-2 border-dashed border-white/5 rounded-2xl p-6 cursor-pointer hover:bg-white/[0.07] transition-all group border-hover:border-primary/50">
                    <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary group-hover:text-black transition-all">
                      <ImageIcon size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-white uppercase tracking-widest">Identify Cover Art</p>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                        {newGroup.image ? newGroup.image.name : "High-resolution JPG or PNG"}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setNewGroup({ ...newGroup, image: e.target.files ? e.target.files[0] : null })}
                    />
                  </label>
                </div>
              </div>

              <div className="p-8 bg-black/40 border-t border-white/5">
                <button
                  onClick={() => createGroupMutation.mutate(newGroup)}
                  disabled={!newGroup.name || createGroupMutation.isPending}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all disabled:opacity-30 shadow-2xl active:scale-[0.98]"
                >
                  {createGroupMutation.isPending ? "Constructing..." : "Initialize Collective"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
