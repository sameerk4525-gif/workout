'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  History,
  TrendingUp,
  AlertCircle,
  Award,
  Calendar,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import MuscleGroupBadge from '@/components/ui/MuscleGroupBadge';

interface ExerciseDetailClientProps {
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    primaryMuscles: string[];
    secondaryMuscles: string[];
    equipment: string;
    difficulty: string;
    instructions: string[];
    tips: string | null;
  };
  prRecords: Array<{
    id: string;
    value: number;
    type: string;
    achievedAt: Date;
  }>;
  history: Array<{
    workoutTitle: string;
    date: Date;
    sets: Array<{
      id: string;
      setNumber: number;
      reps: number;
      weight: number;
      rpe: number | null;
      completed: boolean;
    }>;
  }>;
}

export default function ExerciseDetailClient({
  exercise,
  prRecords,
  history,
}: ExerciseDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'instructions' | 'history'>('instructions');

  // Chart data modeling
  const chartData = prRecords.map((p) => ({
    date: new Date(p.achievedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: p.value,
  }));

  // Epley 1RM formula calculation
  const calculate1RM = (weight: number, reps: number) => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      <Link
        href="/exercises"
        className="w-fit flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO EXERCISE LIBRARY</span>
      </Link>

      {/* Hero Header Card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        {/* Glow indicator */}
        <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight display-font text-white">
            {exercise.name}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <MuscleGroupBadge muscleGroup={exercise.muscleGroup} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-gray-300">
              {exercise.equipment}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-gray-300">
              {exercise.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => setActiveTab('instructions')}
          className={`pb-3 font-bold text-sm tracking-wide flex items-center gap-2 relative transition-colors ${
            activeTab === 'instructions' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Instructions</span>
          {activeTab === 'instructions' && (
            <motion.div
              layoutId="exercise-active-tab"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 font-bold text-sm tracking-wide flex items-center gap-2 relative transition-colors ${
            activeTab === 'history' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>PR Timeline & Logs</span>
          {activeTab === 'history' && (
            <motion.div
              layoutId="exercise-active-tab"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500"
            />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {activeTab === 'instructions' ? (
          <>
            {/* Left instructions block */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Instructions steps */}
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Execution Steps</h3>
                <ol className="flex flex-col gap-4">
                  {exercise.instructions.map((stepText, idx) => (
                    <li key={idx} className="flex gap-4 items-start text-sm">
                      <span className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-gray-300 leading-relaxed font-medium">{stepText}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Safety tips card */}
              {exercise.tips && (
                <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex gap-4 items-start">
                  <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs uppercase font-extrabold text-orange-400 tracking-wider">Coach Pro-Tips</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium mt-1">{exercise.tips}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right anatomical muscle diagram */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h3 className="text-md font-bold text-gray-200 tracking-wide">Target Muscles</h3>
              
              {/* Anatomical placeholder diagram */}
              <div className="w-full h-44 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col items-center justify-center p-4 relative">
                {/* SVG Muscle Diagram Placeholder */}
                <svg viewBox="0 0 100 100" className="w-20 h-20 text-blue-500 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                  <path
                    fill="currentColor"
                    fillOpacity="0.15"
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M50 15 C45 25 35 35 35 45 C35 55 40 65 50 85 C60 65 65 55 65 45 C65 35 55 25 50 15 Z"
                  />
                  <circle cx="50" cy="30" r="6" fill="currentColor" fillOpacity="0.4" />
                </svg>
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest mt-2">Target Diagram</span>
              </div>

              {/* Primary Muscles */}
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Primary Target</span>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.primaryMuscles.map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Secondary Muscles */}
              {exercise.secondaryMuscles.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Secondary Target</span>
                  <div className="flex flex-wrap gap-1.5">
                    {exercise.secondaryMuscles.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-xs font-bold text-gray-400">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* PR Line progress chart */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* PR Progression chart */}
              <div className="glass-card p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black tracking-tight display-font text-gray-200">1RM Weight progression</h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> Best weight log
                  </span>
                </div>

                <div className="w-full h-64 mt-2">
                  {chartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 font-medium bg-white/[0.01] rounded-xl border border-white/5">
                      Progress charts populate once weight PRs are logged inside active sessions.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="date" stroke="#6C757D" fontSize={10} tickLine={false} />
                        <YAxis stroke="#6C757D" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: '#111118',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '11px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="#3B82F6"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorPr)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Set logging history list */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Historical Training Logs</h3>
                <div className="flex flex-col gap-4">
                  {history.length === 0 ? (
                    <div className="glass-card p-6 text-center text-gray-500 text-sm font-medium">
                      No sets logged yet. Complete sets in your workouts to view logs!
                    </div>
                  ) : (
                    history.map((group, idx) => (
                      <div key={idx} className="glass-card p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-bold text-gray-200">{group.workoutTitle}</span>
                          </div>
                          <span className="text-xs text-gray-500 font-bold mono-font">
                            {new Date(group.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Sets Table */}
                        <div className="w-full overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-white/5">
                                <th className="pb-2 w-16">Set</th>
                                <th className="pb-2 w-24">Weight</th>
                                <th className="pb-2 w-24">Reps</th>
                                <th className="pb-2 w-20">RPE</th>
                                <th className="pb-2 text-right">Est. 1RM</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.sets.map((set) => (
                                <tr key={set.id} className="text-gray-300 font-medium hover:bg-white/[0.01]">
                                  <td className="py-2.5 font-bold">{set.setNumber}</td>
                                  <td className="py-2.5 mono-font">{set.weight} kg</td>
                                  <td className="py-2.5 mono-font">{set.reps}</td>
                                  <td className="py-2.5 mono-font">{set.rpe || '-'}</td>
                                  <td className="py-2.5 text-right font-extrabold text-blue-400 mono-font">
                                    {calculate1RM(set.weight, set.reps)} kg
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
