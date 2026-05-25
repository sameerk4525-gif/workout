'use client';

import React from 'react';
import { Crown } from 'lucide-react';

interface LeaderboardRowProps {
  rank: number;
  avatar: string;
  username: string;
  level: number;
  metricValue: string;
  isCurrentUser?: boolean;
}

export default function LeaderboardRow({
  rank,
  avatar,
  username,
  level,
  metricValue,
  isCurrentUser = false,
}: LeaderboardRowProps) {
  // Rank crown styles
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
          <Crown className="w-4 h-4 fill-yellow-500/20" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/20 border border-slate-400/30 text-slate-300">
          <Crown className="w-4 h-4 fill-slate-400/20" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 border border-amber-700/30 text-amber-600">
          <Crown className="w-4 h-4 fill-amber-700/20" />
        </div>
      );
    }
    return <span className="text-gray-400 font-bold mono-font text-sm w-8 text-center">{rank}</span>;
  };

  const bgClass = isCurrentUser
    ? 'background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.3);'
    : '';

  return (
    <div
      style={isCurrentUser ? { background: 'rgba(59, 130, 246, 0.06)', borderColor: 'rgba(59, 130, 246, 0.25)' } : {}}
      className={`flex items-center justify-between p-4 rounded-xl border ${
        isCurrentUser ? 'border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.08)]' : 'border-white/5 bg-white/[0.02]'
      } hover:bg-white/[0.04] transition-all duration-150`}
    >
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <div className="w-8 flex justify-center shrink-0">{getRankBadge()}</div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={username}
            className={`w-10 h-10 rounded-full border ${isCurrentUser ? 'border-blue-500/50' : 'border-white/10'}`}
          />
          <div className="flex flex-col">
            <span className={`text-sm font-bold tracking-wide ${isCurrentUser ? 'text-blue-400' : 'text-gray-200'}`}>
              @{username}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
              Level {level}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Value */}
      <span className={`text-sm font-extrabold tracking-wide mono-font ${isCurrentUser ? 'text-blue-400' : 'text-gray-200'}`}>
        {metricValue}
      </span>
    </div>
  );
}
