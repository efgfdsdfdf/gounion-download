import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  MessageSquare,
  GraduationCap,
  User,
  LogOut,
  Plus,
} from "lucide-react";
import { useAuthStore } from "../../store";

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Groups", path: "/groups" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: GraduationCap, label: "Alumni", path: "/alumni" },
];

export const Sidebar = ({ className }: { className?: string }) => {
  const { user, logout } = useAuthStore();

  return (
    <div
      className={`${className} flex flex-col h-full border-r border-white/5 bg-[#0a0a0c]/50 backdrop-blur-xl pt-8 pb-8 px-5 sticky top-0`}
    >
      <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer">
        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-transform group-hover:scale-110 border border-white/10">
          <img
            src="/logo.png"
            alt="University Logo"
            className="w-8 h-8 object-contain"
          />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white">
          GoUnion
        </span>
      </div>

      <nav className="flex-1 space-y-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
              ${
                isActive
                  ? "bg-white/5 text-primary"
                  : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
              }
            `}
          >
            <item.icon
              size={22}
              className={`transition-transform duration-300 ${item.path === "/" ? "" : "group-hover:scale-110"}`}
            />
            <span className="font-bold text-sm">{item.label}</span>
            {/* Active Indicator */}
            {({ isActive }) =>
              isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(196,255,14,0.5)]" />
              )
            }
          </NavLink>
        ))}

        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative mt-4
              ${
                isActive
                  ? "bg-white/5 text-primary"
                  : "text-zinc-500 hover:text-white hover:bg-white/10"
              }
            `}
        >
          <User size={22} />
          <span className="font-bold text-sm">Profile</span>
        </NavLink>
      </nav>

      <div className="space-y-6 pt-6 border-t border-white/5">
        <button className="w-full h-14 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(196,255,14,0.2)]">
          <Plus size={20} />
          <span>New Post</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
