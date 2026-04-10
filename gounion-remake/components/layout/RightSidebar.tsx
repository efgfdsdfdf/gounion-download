import React from 'react';
import { Sparkles, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const trendingGroups = [
  { id: 1, name: 'Stanford AI Club', members: 1240, active: 342 },
  { id: 2, name: 'Late Night Hackers', members: 856, active: 120 },
  { id: 3, name: 'Design Co.', members: 2100, active: 45 },
];

const suggestions = [
  { id: 1, name: 'Sarah Chen', major: 'Computer Science', year: "'25", avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
  { id: 2, name: 'Marcus Johnson', major: 'Economics', year: "'26", avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus' },
  { id: 3, name: 'Elena Rodriguez', major: 'Design', year: "'24", avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena' },
];

export const RightSidebar = () => {
  return (
    <motion.aside 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="hidden xl:block w-80 shrink-0 border-l border-white/5 bg-black/40 backdrop-blur-3xl p-6 h-screen sticky top-0 overflow-y-auto"
    >
      {/* Mutual Discovery */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-serif text-lg text-white">Mutual Discovery</h3>
        </div>
        
        <div className="space-y-4">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full border border-white/10 object-cover bg-white/5"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-sm font-bold text-white group-hover:underline cursor-pointer">{user.name}</p>
                  <p className="text-xs text-zinc-500 font-medium">{user.major} {user.year}</p>
                </div>
              </div>
              <button className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Groups */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="font-serif text-lg text-white">Trending on Campus</h3>
        </div>

        <div className="space-y-3">
          {trendingGroups.map((group) => (
            <div key={group.id} className="glass rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{group.name}</h4>
                <Users className="w-3 h-3 text-white/40" />
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span>{group.members.toLocaleString()} members</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-emerald-400">{group.active} online</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex flex-wrap gap-x-3 gap-y-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Help Center</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <span>© 2026 GoUnion</span>
        </div>
      </div>
    </motion.aside>
  );
};
