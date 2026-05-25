'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Award, Flame, Layers, Shield } from 'lucide-react';
import LeaderboardRow from '@/components/ui/LeaderboardRow';

interface LeaderboardUser {
  id: string;
  rank?: number;
  username: string;
  avatar: string;
  level: number;
  metricValue: string;
}

interface LeaderboardClientProps {
  initialStandings: LeaderboardUser[];
  currentUser: {
    id: string;
    rank: number;
    username: string;
    avatar: string;
    level: number;
    xp: number;
  };
}

export default function LeaderboardClient({
  initialStandings,
  currentUser,
}: LeaderboardClientProps) {
  const [standings, setStandings] = useState<LeaderboardUser[]>(initialStandings);
  const [metric, setMetric] = useState<'xp' | 'volume' | 'workouts' | 'streak'>('xp');
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch updated standings when metric or period changes
  const fetchStandings = async (targetMetric: typeof metric, targetPeriod: typeof period, targetPage: number, append = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/leaderboard?metric=${targetMetric}&period=${targetPeriod}&page=${targetPage}`
      );
      const data = await response.json();
      
      const parsedResults = data.results.map((item: any, idx: number) => ({
        id: item.id,
        rank: (targetPage - 1) * 20 + idx + 1,
        username: item.username,
        avatar: item.avatar,
        level: item.level,
        metricValue: item.metricValue,
      }));

      if (append) {
        setStandings((prev) => [...prev, ...parsedResults]);
      } else {
        setStandings(parsedResults);
      }

      if (data.results.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error('Error loading leaderboard standings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetricChange = (m: typeof metric) => {
    setMetric(m);
    setPage(1);
    fetchStandings(m, period, 1, false);
  };

  const handlePeriodChange = (p: typeof period) => {
    setPeriod(p);
    setPage(1);
    fetchStandings(metric, p, 1, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchStandings(metric, period, nextPage, true);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-12">
      {/* 1. Metric Selection Tabs */}
      <div className="grid grid-cols-4 bg-white/5 border border-white/5 p-1 rounded-xl shrink-0">
        {[
          { id: 'xp', label: 'XP Points', icon: Shield },
          { id: 'volume', label: 'Volume', icon: Layers },
          { id: 'streak', label: 'Streaks', icon: Flame },
          { id: 'workouts', label: 'Workouts', icon: Trophy },
        ].map((item) => {
          const isActive = metric === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMetricChange(item.id as any)}
              className={`py-2 px-1 rounded-lg font-bold text-[10px] sm:text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                isActive ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Period Selection buttons */}
      <div className="flex justify-end gap-2 text-xs font-bold">
        {[
          { id: 'all', label: 'All-Time Global' },
          { id: 'weekly', label: 'This Week' },
          { id: 'monthly', label: 'This Month' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handlePeriodChange(item.id as any)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              period === item.id
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 3. Standings board list */}
      <div className="flex flex-col gap-2.5">
        {isLoading && page === 1 ? (
          // Loading Skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-16 rounded-xl bg-white/[0.01] border border-white/5 animate-pulse"
            />
          ))
        ) : standings.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-500 text-sm font-medium">
            No rankings found for this metric/period. Log workouts to register!
          </div>
        ) : (
          standings.map((userSnap) => {
            const isMe = userSnap.id === currentUser.id;
            return (
              <LeaderboardRow
                key={userSnap.id}
                rank={userSnap.rank || 1}
                avatar={userSnap.avatar}
                username={userSnap.username}
                level={userSnap.level}
                metricValue={userSnap.metricValue}
                isCurrentUser={isMe}
              />
            );
          })
        )}
      </div>

      {/* 4. Pagination load more */}
      {hasMore && standings.length >= 20 && !isLoading && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-bold text-gray-300 hover:text-white transition-colors"
        >
          LOAD NEXT 20 ATHLETES
        </button>
      )}
    </div>
  );
}
