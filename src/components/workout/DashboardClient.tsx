'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Award,
  Calendar,
  Layers,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import XPBar from '@/components/gamification/XPBar';
import LeaderboardRow from '@/components/ui/LeaderboardRow';

interface DashboardClientProps {
  user: {
    username: string;
    avatar: string;
    level: number;
    xp: number;
    streak: number;
  };
  stats: {
    totalWorkouts: number;
    thisWeekWorkouts: number;
    totalVolume: number;
  };
  recentWorkouts: Array<{
    id: string;
    title: string;
    duration: number;
    volume: number;
    completedAt: Date;
  }>;
  latestPRs: Array<{
    id: string;
    exerciseName: string;
    value: number;
    type: string;
    achievedAt: Date;
  }>;
  leaderboard: {
    rank: number;
    topThree: Array<{
      username: string;
      avatar: string;
      level: number;
      xp: number;
    }>;
  };
}

function CircularProgress({ value, max }: { value: number; max: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 38;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        {/* Track */}
        <circle
          cx="56"
          cy="56"
          r={radius}
          className="stroke-white/5"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Fill */}
        <motion.circle
          cx="56"
          cy="56"
          r={radius}
          className="stroke-blue-500"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black display-font text-white leading-none">
          {value}
          <span className="text-xs text-gray-500 font-bold">/{max}</span>
        </span>
        <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest mt-1">Lifts</span>
      </div>
    </div>
  );
}

export default function DashboardClient({
  user,
  stats,
  recentWorkouts,
  latestPRs,
  leaderboard,
}: DashboardClientProps) {
  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  // Convert seconds to HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} mins`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* 1. Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight display-font bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome back, <span className="text-blue-500">@{user.username}</span>!
          </h2>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Keep your training momentum high. Your gym empire is thriving.
          </p>
        </div>
        
        {/* Quick Start active workout */}
        <Link
          href="/workouts"
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-extrabold text-xs transition-all hover:opacity-90 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>START NEW WORKOUT</span>
        </Link>
      </div>

      {/* 2. Stats Grid Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current Streak" value={user.streak} suffix="Days" icon={Flame} glowColor="orange" />
        <StatCard label="Total Workouts" value={stats.totalWorkouts} suffix="Sessions" icon={Award} />
        <StatCard label="This Week" value={stats.thisWeekWorkouts} suffix="Lifts" icon={Calendar} />
        <StatCard label="Total Volume" value={Math.round(stats.totalVolume)} suffix="kg" icon={Layers} />
      </div>

      {/* 3. Progress Section (XP Bar + Weekly Goal Circular Ring) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* XP Bar takes 2 columns on desktop */}
        <div className="lg:col-span-2 flex">
          <XPBar xp={user.xp} />
        </div>

        {/* Weekly Goal ring takes 1 column */}
        <div className="glass-card p-5 flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Weekly Goal</h4>
            <p className="text-xs text-gray-400 font-medium mt-1.5 max-w-[150px]">
              You have logged <span className="text-blue-400 font-bold">{stats.thisWeekWorkouts}</span> out of{' '}
              <span className="text-white font-bold">4</span> workouts this week.
            </p>
          </div>
          <CircularProgress value={stats.thisWeekWorkouts} max={4} />
        </div>
      </div>

      {/* 4. Details Section (Recent Activity, Latest PRs, Leaderboard Snapshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. Recent Activity List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Recent Activity</h3>
            <Link href="/social" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentWorkouts.length === 0 ? (
              <div className="glass-card p-6 text-center text-gray-500 font-medium text-sm">
                No workouts logged yet. Let&apos;s start your first lift!
              </div>
            ) : (
              recentWorkouts.map((w) => (
                <motion.div
                  key={w.id}
                  variants={itemVariants}
                  className="glass-card p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-200">{w.title}</span>
                      <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                        {new Date(w.completedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" /> Duration
                      </span>
                      <span className="text-xs font-extrabold text-gray-200 mt-0.5 mono-font">
                        {formatDuration(w.duration)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3 text-gray-500" /> Volume
                      </span>
                      <span className="text-xs font-extrabold text-blue-400 mt-0.5 mono-font">
                        {Math.round(w.volume)} kg
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* B. Sidebar (Latest PRs & Leaderboard Snapshot) */}
        <div className="flex flex-col gap-6">
          {/* Latest PRs */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Latest Personal Records</h3>
            <div className="glass-card p-4 flex flex-col gap-3.5">
              {latestPRs.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs font-medium">
                  No records beaten yet. Complete a workout to trigger!
                </div>
              ) : (
                latestPRs.map((pr) => (
                  <div key={pr.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-400 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]" />
                      <span className="font-bold text-gray-300 leading-none">{pr.exerciseName}</span>
                    </div>
                    <span className="font-extrabold text-orange-400 mono-font">
                      {pr.value} <span className="text-[10px] text-gray-500 font-medium">kg</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard Snapshot */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Leaderboard</h3>
              <Link href="/leaderboard" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                <span>Full Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {leaderboard.topThree.map((userSnap, idx) => (
                <LeaderboardRow
                  key={userSnap.username}
                  rank={idx + 1}
                  avatar={userSnap.avatar}
                  username={userSnap.username}
                  level={userSnap.level}
                  metricValue={`${userSnap.xp} XP`}
                />
              ))}

              {/* Current user snapshot pointer if rank is outside top 3 */}
              {leaderboard.rank > 3 && (
                <>
                  <div className="flex justify-center py-1">
                    <span className="text-gray-600 font-black tracking-widest text-[8px]">...</span>
                  </div>
                  <LeaderboardRow
                    rank={leaderboard.rank}
                    avatar={user.avatar}
                    username={user.username}
                    level={user.level}
                    metricValue={`${user.xp} XP`}
                    isCurrentUser={true}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
