import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, UserPlus, Check } from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { Skeleton } from '../components/ui/Skeleton';
import { User } from '../types';

export const Alumni = () => {
  const [query, setQuery] = useState('');
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', query],
    queryFn: () => api.search.users(query),
    enabled: true // Always load some users initially
  });

  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => api.friends.sendRequest(userId),
    onSuccess: () => {
      // In a real app, we'd update the UI state to show "Request Sent"
      alert('Friend request sent!');
    }
  });

  return (
    <div className="w-full pb-20 md:pb-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Connect with Alumni</h1>
        <p className="text-zinc-400">Discover and network with students from various universities.</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, university..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-zinc-200 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-sans"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((user: User) => (
            <GlassCard key={user.id} hoverEffect className="flex items-center gap-4">
              <img src={user.avatarUrl} alt={user.username} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate">@{user.username}</h3>
                <p className="text-zinc-500 text-sm truncate">{user.university}</p>
                <button 
                  onClick={() => sendRequestMutation.mutate(user.id)}
                  disabled={sendRequestMutation.isPending}
                  className="mt-2 flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <UserPlus size={14} />
                  Connect
                </button>
              </div>
            </GlassCard>
          ))}
          {users?.length === 0 && (
            <div className="col-span-full text-center py-20 text-zinc-500">
              No users found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
