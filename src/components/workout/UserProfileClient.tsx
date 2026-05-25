'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Award,
  Layers,
  Users,
  Clock,
  Lock,
  Unlock,
  Shield,
  Bookmark
} from 'lucide-react';
import XPBar from '@/components/gamification/XPBar';

interface ProfileUser {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  streak: number;
  workoutsCount: number;
  volumeCount: number;
  followersCount: number;
  followingCount: number;
}

interface ProfileWorkout {
  id: string;
  title: string;
  notes: string | null;
  duration: number;
  volume: number;
  completedAt: Date;
}

interface ProfileAchievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

interface UserProfileClientProps {
  user: ProfileUser;
  workouts: ProfileWorkout[];
  achievements: ProfileAchievement[];
  isFollowing: boolean;
  isSelf: boolean;
}

// 12 Standard achievements catalog for display showcase
const ALL_ACHIEVEMENTS_CATALOG = [
  { type: 'FIRST_REP', title: 'First Rep', description: 'Log your first workout.', icon: '🏋️' },
  { type: 'IRON_WILL', title: 'Iron Will', description: 'Maintain a 7-day training streak.', icon: '🔥' },
  { type: 'CENTURY_CLUB', title: 'Century Club', description: 'Log 100 workouts.', icon: '💯' },
  { type: 'TON_UP', title: 'Ton Up', description: 'Lift 100kg on any exercise.', icon: '💪' },
  { type: 'VOLUME_KING', title: 'Volume King', description: 'Log 10,000kg in a single week.', icon: '👑' },
  { type: 'SOCIAL_BUTTERFLY', title: 'Social Butterfly', description: 'Follow 10 users.', icon: '🦋' },
  { type: 'ENDURANCE_MONSTER', title: 'Endurance', description: 'Complete a cardio log of 60 mins.', icon: '🏃' },
  { type: 'MAX_REPS_CHAMP', title: 'Rep Champion', description: 'Perform 30 reps on any set.', icon: '⚡' },
  { type: 'EARLY_BIRD', title: 'Early Bird', description: 'Log a workout before 6:00 AM.', icon: '🌅' },
  { type: 'NIGHT_OWL', title: 'Night Owl', description: 'Log a workout after 10:00 PM.', icon: '🌌' },
  { type: 'STEADY_GAINS', title: 'Steady Gains', description: 'Log workouts 3 days in a row.', icon: '📈' },
  { type: 'REST_TIMER_PRO', title: 'Rest Master', description: 'Configure custom rest timers.', icon: '⏱️' },
];

export default function UserProfileClient({
  user,
  workouts,
  achievements,
  isFollowing: initialIsFollowing,
  isSelf,
}: UserProfileClientProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(user.followersCount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle follow/unfollow
  const handleFollowToggle = async () => {
    setIsSubmitting(true);
    
    // Optimistic UI updates
    const nextIsFollowing = !isFollowing;
    setIsFollowing(nextIsFollowing);
    setFollowersCount(nextIsFollowing ? followersCount + 1 : followersCount - 1);

    try {
      const response = await fetch(`/api/follow/${user.id}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      // Update actual data from database response
      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount);
    } catch (err) {
      console.error('Error toggling follow relationship:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* 1. Profile Hero Panel */}
      <div className="glass-card p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Avatar, Bio, Follow Actions */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left gap-4 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-6 shrink-0">
          {/* Avatar frame */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar}
            alt={user.username}
            className="w-24 h-24 rounded-full border-2 border-blue-500 p-1 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]"
          />
          <div className="flex flex-col gap-1 w-full">
            <h2 className="text-2xl font-black tracking-tight display-font text-white">@{user.username}</h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1 px-4 md:px-0">
              {user.bio}
            </p>
          </div>

          {/* Social Stats */}
          <div className="flex items-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-white mono-font">{followersCount}</span>
              <span className="text-gray-500 font-bold uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-white mono-font">{user.followingCount}</span>
              <span className="text-gray-500 font-bold uppercase tracking-wider">Following</span>
            </div>
          </div>

          {/* Follow toggle button (hidden on self profiles) */}
          {!isSelf && (
            <button
              disabled={isSubmitting}
              onClick={handleFollowToggle}
              className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                isFollowing
                  ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isFollowing ? 'UNFOLLOW' : 'FOLLOW ATHLETE'}</span>
            </button>
          )}
        </div>

        {/* Level, XP progress, and stats counters */}
        <div className="flex-1 flex flex-col gap-6 justify-center">
          {/* XP Bar */}
          <XPBar xp={user.xp} />

          {/* Performance Counts */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="glass-card p-4 flex flex-col gap-0.5 items-center justify-center bg-white/[0.01]">
              <Flame className="w-5 h-5 text-orange-400 fill-orange-500/10 mb-1" />
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Streak</span>
              <span className="text-sm font-extrabold text-gray-200 mt-1 mono-font">{user.streak} Days</span>
            </div>
            <div className="glass-card p-4 flex flex-col gap-0.5 items-center justify-center bg-white/[0.01]">
              <Award className="w-5 h-5 text-yellow-500 fill-yellow-500/10 mb-1" />
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Workouts</span>
              <span className="text-sm font-extrabold text-gray-200 mt-1 mono-font">{user.workoutsCount} Lifts</span>
            </div>
            <div className="glass-card p-4 flex flex-col gap-0.5 items-center justify-center bg-white/[0.01]">
              <Layers className="w-5 h-5 text-blue-400 fill-blue-500/10 mb-1" />
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Total Volume</span>
              <span className="text-sm font-extrabold text-gray-200 mt-1 mono-font">
                {Math.round(user.volumeCount).toLocaleString()} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Details Splits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column (Workouts Timeline Grid, takes 2 cols) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Logged Workouts</h3>
          
          <div className="flex flex-col gap-4">
            {workouts.length === 0 ? (
              <div className="glass-card p-12 text-center text-gray-500 text-sm font-medium">
                No logged workouts available for this profile.
              </div>
            ) : (
              workouts.map((w) => (
                <div
                  key={w.id}
                  className="glass-card p-4 flex items-center justify-between hover:bg-white/[0.01] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-200">{w.title}</span>
                      <span className="text-[9px] text-gray-500 font-semibold mt-0.5">
                        {new Date(w.completedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Time
                      </span>
                      <span className="text-xs font-bold text-gray-300 mt-0.5 mono-font">
                        {formatDuration(w.duration)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> Volume
                      </span>
                      <span className="text-xs font-black text-blue-400 mt-0.5 mono-font">
                        {Math.round(w.volume).toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column (Achievements Showcase Grid) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Achievements</h3>
          
          <div className="glass-card p-5 grid grid-cols-3 gap-4">
            {ALL_ACHIEVEMENTS_CATALOG.map((ach) => {
              const userHasUnlocked = achievements.some((ua) => ua.type === ach.type);
              
              return (
                <div
                  key={ach.type}
                  className="flex flex-col items-center gap-1.5 relative group cursor-help"
                  title={`${ach.title}: ${ach.description} (${userHasUnlocked ? 'Unlocked!' : 'Locked'})`}
                >
                  {/* Badge Frame */}
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl relative transition-all ${
                      userHasUnlocked
                        ? 'bg-orange-500/10 border-orange-500/30 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.25)] scale-105'
                        : 'bg-[#14141E]/40 border-white/5 opacity-30'
                    }`}
                  >
                    <span>{ach.icon}</span>
                    
                    {/* Lock overlay seal if unearned */}
                    {!userHasUnlocked && (
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Badge Label */}
                  <span className="text-[8px] font-black uppercase text-center tracking-wide leading-none text-gray-400 truncate w-14">
                    {ach.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
