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
  ShieldCheck,
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
      className={`${className} flex flex-col h-screen border-r border-white/5 bg-black/40 backdrop-blur-3xl pt-8 pb-8 px-5 sticky top-0`}
    >
      <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-serif font-black text-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-105">
          G
        </div>
        <span className="font-serif text-3xl font-bold tracking-tight text-white">
          GoUnion
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
              ${
                isActive
                  ? "bg-gradient-to-r from-white/10 to-white/5 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={`transition-transform duration-300 ${!isActive ? "group-hover:scale-110 text-white/60 group-hover:text-white" : "text-white"}`}
                />
                <span className="font-medium text-sm">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group mt-4
              ${
                isActive
                  ? "bg-gradient-to-r from-white/10 to-white/5 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }
            `}
        >
          {({ isActive }) => (
            <>
              <User size={20} className={isActive ? "text-white" : "text-white/60 group-hover:text-white"} />
              <span className="font-medium text-sm">Profile</span>
            </>
          )}
        </NavLink>

        {(user?.role === "admin" || user?.role === "moderator") && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group mt-2
              ${
                isActive
                  ? "bg-gradient-to-r from-white/10 to-white/5 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  : "text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-400/10 border border-transparent"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <ShieldCheck size={20} className={isActive ? "text-white" : "text-emerald-400/80 group-hover:text-emerald-400"} />
                <span className="font-medium text-sm">Admin Panel</span>
              </>
            )}
          </NavLink>
        )}
      </nav>

      <div className="p-4 mt-auto">
        <div className="glass rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-white/10 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-white/50 truncate">@{user?.username}</p>
            </div>
          </div>
          <div className="h-px w-full bg-white/10" />
          <div className="flex items-center justify-between">
            <button className="text-white/50 hover:text-white transition-colors p-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Plus size={16} /> Post
            </button>
            <button onClick={logout} className="text-white/50 hover:text-red-400 transition-colors p-1">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
