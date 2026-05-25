'use client';

import React, { useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import ActiveWorkoutLogger from './ActiveWorkoutLogger';
import {
  Play,
  Plus,
  Calendar,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  BookOpen,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoutineExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
}

interface RoutineItem {
  id: string;
  name: string;
  isPublic: boolean;
  exercises: RoutineExercise[];
}

interface HistoryItem {
  id: string;
  title: string;
  notes: string | null;
  duration: number;
  volume: number;
  completedAt: Date;
  exercises: Array<{
    name: string;
    sets: Array<{
      setNumber: number;
      weight: number;
      reps: number;
      completed: boolean;
    }>;
  }>;
}

interface WorkoutsOverviewClientProps {
  exerciseBank: Array<{ id: string; name: string; muscleGroup: string }>;
  routines: RoutineItem[];
  history: HistoryItem[];
}

export default function WorkoutsOverviewClient({
  exerciseBank,
  routines,
  history,
}: WorkoutsOverviewClientProps) {
  const { isActive, startWorkout } = useWorkoutStore();
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  // If a workout is active, lock viewport and render active logging console
  if (isActive) {
    return <ActiveWorkoutLogger exerciseBank={exerciseBank} />;
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* 1. Quick Start Session */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Quick Start</h3>
        <div className="glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111118]/40 relative overflow-hidden">
          <div className="absolute -left-8 -bottom-8 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-white">Start Empty Workout</span>
            <span className="text-xs text-gray-500 font-medium">Log a dynamic gym session with ad-hoc exercises</span>
          </div>
          <button
            onClick={() => startWorkout()}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-extrabold text-xs transition-all hover:opacity-90 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-1.5 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START BLANK LIFT</span>
          </button>
        </div>
      </div>

      {/* 2. Select Routine Template */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Start from Routine</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {routines.map((r) => (
            <div
              key={r.id}
              className="glass-card p-4 flex items-center justify-between hover:bg-white/[0.01] border border-white/5 bg-[#111118]/20 transition-all duration-150"
            >
              <div className="flex flex-col gap-1 pr-4">
                <span className="text-sm font-bold text-gray-200 line-clamp-1">{r.name}</span>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  {r.exercises.length} Exercises • {r.isPublic ? 'Public Template' : 'Custom'}
                </span>
              </div>
              <button
                onClick={() => startWorkout(r)}
                className="px-3.5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>START</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Training History timeline */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Workout History</h3>
        
        <div className="flex flex-col gap-4">
          {history.length === 0 ? (
            <div className="glass-card p-12 text-center text-gray-500 font-medium text-sm">
              No historical workouts logged in database. Start lifting to track progress!
            </div>
          ) : (
            history.map((h) => {
              const isExpanded = !!expandedWorkouts[h.id];
              return (
                <div key={h.id} className="glass-card p-5 flex flex-col gap-4">
                  {/* History Header */}
                  <div
                    onClick={() => toggleExpand(h.id)}
                    className="flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200 leading-tight">{h.title}</span>
                        <span className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wide">
                          {new Date(h.completedAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Duration */}
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Time
                        </span>
                        <span className="text-xs font-bold text-gray-300 mt-0.5 mono-font">
                          {formatDuration(h.duration)}
                        </span>
                      </div>

                      {/* Volume */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Volume
                        </span>
                        <span className="text-xs font-black text-blue-400 mt-0.5 mono-font">
                          {Math.round(h.volume)} kg
                        </span>
                      </div>

                      {/* Chevron Toggle */}
                      <div className="text-gray-400 ml-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Exercise Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-white/5 pt-4 mt-2"
                      >
                        <div className="flex flex-col gap-4">
                          {h.notes && (
                            <p className="text-xs text-gray-400 italic bg-white/[0.01] p-3 rounded-lg border border-white/5">
                              {h.notes}
                            </p>
                          )}

                          {h.exercises.map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1.5">
                              <span className="text-xs font-bold text-gray-200">{item.name}</span>
                              <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 font-bold mono-font">
                                {item.sets.map((set: any, sIdx: number) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 rounded bg-white/5 border border-white/5"
                                  >
                                    Set {set.setNumber}: {set.weight}kg × {set.reps}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
