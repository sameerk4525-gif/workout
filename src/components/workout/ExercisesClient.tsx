'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, SlidersHorizontal, Dumbbell } from 'lucide-react';
import MuscleGroupBadge from '@/components/ui/MuscleGroupBadge';

interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  tips: string | null;
}

interface ExercisesClientProps {
  exercises: ExerciseItem[];
}

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Cardio'];
const EQUIPMENT_TYPES = ['All', 'Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Cable', 'Kettlebell'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function ExercisesClient({ exercises }: ExercisesClientProps) {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Filter logic
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup.toLowerCase() === selectedMuscle.toLowerCase();
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment.toLowerCase() === selectedEquipment.toLowerCase();
    const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    
    return matchesSearch && matchesMuscle && matchesEquipment && matchesDifficulty;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Search Header Area */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search exercises (e.g. Bench Press)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-white font-semibold text-sm focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Toggle Advance Filters */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
            showFilters || selectedMuscle !== 'All' || selectedEquipment !== 'All' || selectedDifficulty !== 'All'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>FILTERS</span>
        </button>
      </div>

      {/* Filter Options Expand Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 flex flex-col gap-4"
        >
          {/* 1. Muscle Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Muscle Group</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscle(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                    selectedMuscle === m ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Equipment Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Equipment</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5">
              {EQUIPMENT_TYPES.map((e) => (
                <button
                  key={e}
                  onClick={() => setSelectedEquipment(e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                    selectedEquipment === e ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Difficulty Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Difficulty</span>
            <div className="flex gap-1.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedDifficulty === d ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid of Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-gray-500 font-medium">
            No exercises match your selected search or filter settings.
          </div>
        ) : (
          filteredExercises.map((ex) => (
            <Link key={ex.id} href={`/exercises/${ex.id}`}>
              <div className="glass-card-interactive p-5 flex flex-col justify-between h-36">
                <div>
                  <h4 className="text-sm font-bold text-gray-200 tracking-wide line-clamp-1">{ex.name}</h4>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <MuscleGroupBadge muscleGroup={ex.muscleGroup} />
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-gray-400 border border-white/5">
                      {ex.equipment}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        ex.difficulty === 'Beginner'
                          ? 'bg-green-500/10 text-green-400 border-green-500/10'
                          : ex.difficulty === 'Intermediate'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10'
                          : 'bg-red-500/10 text-red-400 border-red-500/10'
                      }`}
                    >
                      {ex.difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 font-medium line-clamp-2 leading-relaxed">
                  {ex.tips || 'Tapping opens complete instructions, historical sets, and calculation 1RM tools.'}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
