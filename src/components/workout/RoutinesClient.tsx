'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Play, Copy, Trash2, ArrowRight } from 'lucide-react';

interface RoutineExercise {
  id: string;
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
  description: string | null;
  isPublic: boolean;
  isOwner: boolean;
  exercises: RoutineExercise[];
}

interface RoutinesClientProps {
  routines: RoutineItem[];
}

export default function RoutinesClient({ routines }: RoutinesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myRoutines = routines.filter((r) => r.isOwner);
  const publicRoutines = routines.filter((r) => r.isPublic);

  const displayList = activeTab === 'my' ? myRoutines : publicRoutines;

  // Handles duplicating a routine template
  const handleDuplicate = async (routineId: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duplicateId: routineId }),
      });

      if (!response.ok) {
        throw new Error('Duplication failed');
      }

      router.refresh();
      setActiveTab('my'); // Focus user list to show duplicated item
    } catch (error) {
      console.error('Error duplicating routine:', error);
      alert('Failed to duplicate routine. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handles deleting custom routine
  const handleDelete = async (routineId: string) => {
    if (!confirm('Are you sure you want to delete this custom routine?')) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/routines/${routineId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Deletion failed');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting routine:', error);
      alert('Failed to delete routine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Toggle tabs */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'my' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            My Routines ({myRoutines.length})
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'public' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Public Templates ({publicRoutines.length})
          </button>
        </div>

        {/* Create Routine Button */}
        <Link
          href="/routines/create"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-extrabold text-xs transition-all hover:opacity-90 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE ROUTINE</span>
        </Link>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-gray-500 font-medium">
            {activeTab === 'my'
              ? 'No custom routines created yet. click Create Routine to build your training program.'
              : 'No templates seeded in catalog.'}
          </div>
        ) : (
          displayList.map((r) => (
            <div
              key={r.id}
              className="glass-card p-5 flex flex-col justify-between h-72 border border-white/5 bg-[#111118]/40 relative overflow-hidden"
            >
              {/* Backglow decor */}
              <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

              <div>
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-md font-black tracking-tight display-font text-white leading-tight line-clamp-1">
                    {r.name}
                  </h4>
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider shrink-0 mt-0.5">
                    {r.exercises.length} Exercises
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 font-medium leading-relaxed mt-2 line-clamp-2">
                  {r.description || 'No routine description details provided.'}
                </p>

                {/* Exercises Preview list */}
                <div className="flex flex-col gap-1.5 mt-4 border-t border-white/5 pt-3">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Exercise List Preview</span>
                  <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed italic">
                    {r.exercises.map((e) => e.name).join(', ') || 'No exercises added.'}
                  </p>
                </div>
              </div>

              {/* Card Footer actions */}
              <div className="flex gap-2 border-t border-white/5 pt-4 mt-auto">
                {/* Start Active session */}
                <Link
                  href={`/workouts/active?routineId=${r.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>START</span>
                </Link>

                {/* Duplicate */}
                <button
                  disabled={isSubmitting}
                  onClick={() => handleDuplicate(r.id)}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Duplicate Routine"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Delete custom routines only */}
                {r.isOwner && (
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 transition-colors"
                    title="Delete Routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
