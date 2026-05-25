'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Check,
  Dumbbell
} from 'lucide-react';
import Link from 'next/link';

interface ExerciseOption {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}

interface SelectedExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  setsList: Array<{ reps: number; weight: number }>;
}

interface CreateRoutineClientProps {
  exercises: ExerciseOption[];
}

export default function CreateRoutineClient({ exercises }: CreateRoutineClientProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Search state inside exercise selection modal
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Cardio'];

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add exercise to our active builder
  const handleAddExercise = (ex: ExerciseOption) => {
    // Prevent duplicates
    if (selectedExercises.some((item) => item.exerciseId === ex.id)) {
      alert('Exercise already added.');
      return;
    }

    const newEx: SelectedExercise = {
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      setsList: [
        { reps: 10, weight: 60 },
        { reps: 10, weight: 60 },
        { reps: 10, weight: 60 },
      ],
    };

    setSelectedExercises([...selectedExercises, newEx]);
    setShowSearchModal(false);
    setSearchText('');
  };

  // Remove exercise from builder
  const handleRemoveExercise = (idx: number) => {
    const updated = selectedExercises.filter((_, i) => i !== idx);
    setSelectedExercises(updated);
  };

  // Add set to a specific exercise
  const handleAddSet = (exIdx: number) => {
    const updated = [...selectedExercises];
    const lastSet = updated[exIdx].setsList[updated[exIdx].setsList.length - 1] || { reps: 10, weight: 60 };
    updated[exIdx].setsList.push({
      reps: lastSet.reps,
      weight: lastSet.weight,
    });
    setSelectedExercises(updated);
  };

  // Remove set from a specific exercise
  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    const updated = [...selectedExercises];
    if (updated[exIdx].setsList.length <= 1) return; // Keep at least 1 set
    updated[exIdx].setsList = updated[exIdx].setsList.filter((_, i) => i !== setIdx);
    setSelectedExercises(updated);
  };

  // Update reps or weight value of a set
  const handleSetUpdate = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    const updated = [...selectedExercises];
    updated[exIdx].setsList[setIdx][field] = value;
    setSelectedExercises(updated);
  };

  // Reorder exercises: Move Up
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...selectedExercises];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setSelectedExercises(updated);
  };

  // Reorder exercises: Move Down
  const moveDown = (idx: number) => {
    if (idx === selectedExercises.length - 1) return;
    const updated = [...selectedExercises];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setSelectedExercises(updated);
  };

  // Save routine to db
  const handleSave = async () => {
    if (!name) {
      alert('Please specify a routine name.');
      return;
    }
    if (selectedExercises.length === 0) {
      alert('Please add at least 1 exercise.');
      return;
    }

    setIsSubmitting(true);

    // Format payload
    const formattedExercises = selectedExercises.map((item) => ({
      exerciseId: item.exerciseId,
      // Send sets as average or map it. The API expects: { exerciseId, sets, reps, weight }
      // We will sum the sets, take the average weight and reps as defaults
      sets: item.setsList.length,
      reps: Math.round(item.setsList.reduce((acc, curr) => acc + curr.reps, 0) / item.setsList.length),
      weight: parseFloat((item.setsList.reduce((acc, curr) => acc + curr.weight, 0) / item.setsList.length).toFixed(1)),
    }));

    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          isPublic,
          exercises: formattedExercises,
        }),
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      router.push('/routines');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save workout routine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter exercises in the modal picker bank
  const modalFilteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || ex.muscleGroup.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-12">
      {/* Top navbar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <Link
          href="/routines"
          className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>CANCEL & RETURN</span>
        </Link>

        <button
          disabled={isSubmitting}
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.25)]"
        >
          <Save className="w-4 h-4" />
          <span>SAVE PROGRAM</span>
        </button>
      </div>

      {/* Routine Metadata form */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Workout Program Details</h3>
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Routine Name</label>
          <input
            type="text"
            placeholder="e.g. Hypertrophy Push Day"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-white font-semibold text-sm focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description / Notes</label>
          <textarea
            placeholder="Focus on chest stretch and progressive overload on compound lifts."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-white font-semibold text-sm focus:border-blue-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Public Template toggle */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-gray-200">Public Workout Template</span>
            <span className="text-[10px] text-gray-500">Make this template available for other community lifters</span>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`w-12 h-6 rounded-full p-[2px] transition-colors relative ${
              isPublic ? 'bg-blue-500' : 'bg-white/10'
            }`}
          >
            <motion.div
              layout
              className="w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ x: isPublic ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* Exercises Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight display-font text-gray-200">Routine Exercises</h3>
          <button
            onClick={() => setShowSearchModal(true)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ADD EXERCISE</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {selectedExercises.length === 0 ? (
            <div className="glass-card p-12 text-center text-gray-500 font-medium text-sm border-dashed">
              No exercises added to this routine yet. Click Add Exercise to populate.
            </div>
          ) : (
            selectedExercises.map((item, exIdx) => (
              <div key={item.exerciseId} className="glass-card p-5 flex flex-col gap-4">
                {/* Exercise Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded-md">
                      {exIdx + 1}
                    </span>
                    <h4 className="text-sm font-black tracking-tight text-white leading-none">{item.name}</h4>
                  </div>

                  {/* Ordering and remove actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(exIdx)}
                      disabled={exIdx === 0}
                      className="p-1.5 rounded bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(exIdx)}
                      disabled={exIdx === selectedExercises.length - 1}
                      className="p-1.5 rounded bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all ml-2"
                      title="Remove Exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sets Table */}
                <div className="w-full">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-white/5">
                        <th className="pb-2 w-16">Set</th>
                        <th className="pb-2 w-28">Weight (kg)</th>
                        <th className="pb-2 w-28">Reps</th>
                        <th className="pb-2 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.setsList.map((set, setIdx) => (
                        <tr key={setIdx} className="text-gray-300 font-medium">
                          <td className="py-2 font-bold">{setIdx + 1}</td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={set.weight || ''}
                              onChange={(e) =>
                                handleSetUpdate(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)
                              }
                              className="w-20 py-1.5 px-2 rounded-lg bg-white/5 border border-white/5 text-white font-bold text-xs focus:border-blue-500 focus:outline-none mono-font"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={set.reps || ''}
                              onChange={(e) =>
                                handleSetUpdate(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)
                              }
                              className="w-16 py-1.5 px-2 rounded-lg bg-white/5 border border-white/5 text-white font-bold text-xs focus:border-blue-500 focus:outline-none mono-font"
                            />
                          </td>
                          <td className="py-2 text-right">
                            <button
                              disabled={item.setsList.length <= 1}
                              onClick={() => handleRemoveSet(exIdx, setIdx)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add set trigger button */}
                <button
                  onClick={() => handleAddSet(exIdx)}
                  className="w-full py-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD SET</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Exercise Selection Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden shadow-2xl border border-white/10 animate-checkmark">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h4 className="text-md font-black display-font text-white">Add Exercise Option</h4>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchText('');
                }}
                className="text-xs font-bold text-gray-500 hover:text-white transition-colors"
              >
                CLOSE
              </button>
            </div>

            {/* Search inputs */}
            <div className="p-4 flex flex-col gap-3 bg-white/[0.01] border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search catalog by name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/5 text-white font-semibold text-xs focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold shrink-0 transition-colors ${
                      categoryFilter === c ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* List Results */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {modalFilteredExercises.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs font-medium">
                  No matching exercises found.
                </div>
              ) : (
                modalFilteredExercises.map((ex) => {
                  const alreadyAdded = selectedExercises.some((item) => item.exerciseId === ex.id);
                  return (
                    <button
                      key={ex.id}
                      disabled={alreadyAdded}
                      onClick={() => handleAddExercise(ex)}
                      className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition-all ${
                        alreadyAdded
                          ? 'bg-blue-500/5 border-blue-500/10 text-blue-500/50 opacity-50 cursor-not-allowed'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold tracking-wide">{ex.name}</span>
                        <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                          {ex.muscleGroup} • {ex.equipment}
                        </span>
                      </div>
                      <Plus className="w-4 h-4 shrink-0 text-blue-400" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
