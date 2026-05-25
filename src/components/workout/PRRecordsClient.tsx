'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  Layers,
  Zap,
  Search,
  Calendar,
  Flame,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import MuscleGroupBadge from '@/components/ui/MuscleGroupBadge';

interface PRItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  value: number;
  type: string;
  achievedAt: Date;
}

interface CalculatedStat {
  exerciseName: string;
  maxVolume: number;
  maxReps: number;
  max1RM: number;
}

interface PRRecordsClientProps {
  prRecords: PRItem[];
  calculatedStats: CalculatedStat[];
}

export default function PRRecordsClient({ prRecords, calculatedStats }: PRRecordsClientProps) {
  const [searchText, setSearchText] = useState('');

  // Filter stats by search query
  const filteredStats = calculatedStats.filter((item) =>
    item.exerciseName.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredPrTimeline = prRecords.filter((item) =>
    item.exerciseName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* 1. Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight display-font bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Personal Records Arena 🏆
          </h2>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Browse all-time maximum weights, peak set volumes, and record high repetitions.
          </p>
        </div>
      </div>

      {/* 2. Interactive Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Filter records by exercise name (e.g. Squat)..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-white font-semibold text-sm focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* 3. Three Columns PR Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Estimated 1RM (Epley) */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Award className="w-5 h-5 text-yellow-500 filter drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]" />
            <h3 className="text-sm font-black display-font text-white">All-Time Max 1RM</h3>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto">
            {filteredStats.length === 0 ? (
              <span className="text-center text-xs text-gray-600 py-6">No 1RM stats found.</span>
            ) : (
              filteredStats.map((item) => (
                <div key={item.exerciseName} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-300 line-clamp-1">{item.exerciseName}</span>
                  <span className="font-extrabold text-yellow-400 shrink-0 mono-font">
                    {item.max1RM} <span className="text-[10px] text-gray-500 font-medium">kg</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Peak Set Volume */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Layers className="w-5 h-5 text-blue-400 filter drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]" />
            <h3 className="text-sm font-black display-font text-white">Peak Set Volume</h3>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto">
            {filteredStats.length === 0 ? (
              <span className="text-center text-xs text-gray-600 py-6">No volume stats found.</span>
            ) : (
              filteredStats.map((item) => (
                <div key={item.exerciseName} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-300 line-clamp-1">{item.exerciseName}</span>
                  <span className="font-extrabold text-blue-400 shrink-0 mono-font">
                    {Math.round(item.maxVolume)} <span className="text-[10px] text-gray-500 font-medium">kg</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 3: Most Repetitions */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Zap className="w-5 h-5 text-orange-400 filter drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]" />
            <h3 className="text-sm font-black display-font text-white">Maximum Repetitions</h3>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto">
            {filteredStats.length === 0 ? (
              <span className="text-center text-xs text-gray-600 py-6">No reps stats found.</span>
            ) : (
              filteredStats.map((item) => (
                <div key={item.exerciseName} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-300 line-clamp-1">{item.exerciseName}</span>
                  <span className="font-extrabold text-orange-400 shrink-0 mono-font">
                    {item.maxReps} <span className="text-[10px] text-gray-500 font-medium">reps</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Timeline Achievements History List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Records Timeline Logs</h3>
        
        <div className="flex flex-col gap-3">
          {filteredPrTimeline.length === 0 ? (
            <div className="glass-card p-6 text-center text-gray-500 text-sm font-medium">
              No recent record beating events matching filter.
            </div>
          ) : (
            filteredPrTimeline.map((pr) => (
              <div
                key={pr.id}
                className="glass-card p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
                    <Flame className="w-5 h-5 fill-orange-500/10" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-200">{pr.exerciseName}</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
                      Category: {pr.muscleGroup}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-orange-500" /> Max Load
                    </span>
                    <span className="text-xs font-black text-orange-400 mt-0.5 mono-font">
                      {pr.value} kg
                    </span>
                  </div>
                  
                  {/* Date achieved */}
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date Achieved
                    </span>
                    <span className="text-xs font-bold text-gray-400 mt-0.5 mono-font">
                      {new Date(pr.achievedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
