import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, MessageSquare, User, Bell } from "lucide-react";
import { useAuthStore } from "../../store";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { motion } from "framer-motion";

export const MobileNav = () => {
  const { user } = useAuthStore();
  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: api.notifications.getUnreadCount,
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count || 0;

  const NAV_ITEMS = [
    { icon: Home, label: "Feed", path: "/" },
    { icon: Users, label: "Groups", path: "/groups" },
    { icon: Bell, label: "Alerts", path: "/notifications" },
    { icon: MessageSquare, label: "Chat", path: "/messages" },
    { icon: User, label: "Profile", path: `/profile/${user?.username}` },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-[#09090b]/60 backdrop-blur-2xl border border-white/10 z-50 flex items-center justify-around px-2 rounded-2xl shadow-2xl">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            relative flex flex-col items-center justify-center h-full flex-1 transition-all duration-300
            ${isActive ? "text-violet-400" : "text-zinc-500 hover:text-zinc-300"}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-violet-600/10 rounded-xl"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <div className="relative z-10 transition-transform">
                <item.icon size={20} className={isActive ? "scale-110" : ""} />
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="relative z-10 text-[9px] mt-1 font-bold tracking-tight uppercase">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};
