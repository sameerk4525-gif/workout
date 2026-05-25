'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkoutStore, SetItem } from '@/store/workoutStore';
import { useRouter } from 'next/navigation';
import {
  Dumbbell,
  Clock,
  Plus,
  Trash2,
  Check,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActiveWorkoutLoggerProps {
  exerciseBank: Array<{ id: string; name: string; muscleGroup: string }>;
}

export default function ActiveWorkoutLogger({ exerciseBank }: ActiveWorkoutLoggerProps) {
  const router = useRouter();
  
  const {
    isActive,
    title,
    routineId,
    startTime,
    elapsed,
    exercises,
    restTimer,
    tickTimer,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    startRestTimer,
    tickRestTimer,
    stopRestTimer,
    cancelWorkout,
    hydrateStore,
  } = useWorkoutStore();

  // 1. Hydrate active session on mount
  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  // 2. Active timer elapsed ticking interval
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, tickTimer]);

  // 3. Rest timer countdown ticking interval
  useEffect(() => {
    if (!restTimer.isRunning) return;
    const interval = setInterval(() => {
      tickRestTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer.isRunning, tickRestTimer]);

  // 4. Modal/Sheet states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  
  // Custom Numpad sheet coordinates
  const [numpadConfig, setNumpadConfig] = useState<{
    exIdx: number;
    setIdx: number;
    field: 'weight' | 'reps';
    currentValue: string;
  } | null>(null);

  // Stats calculation
  const totalVolume = exercises.reduce((sum, ex) => {
    return (
      sum +
      ex.sets.reduce((exSum, s) => {
        return exSum + (s.completed ? s.weight * s.reps : 0);
      }, 0)
    );
  }, 0);

  const completedSetsCount = exercises.reduce((sum, ex) => {
    return sum + ex.sets.filter((s) => s.completed).length;
  }, 0);

  // Time Formatter
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  // Set Row check toggle logic
  const handleCheckSet = (exIdx: number, setIdx: number, currentSet: SetItem) => {
    const targetState = !currentSet.completed;
    updateSet(exIdx, setIdx, { completed: targetState });

    if (targetState) {
      // 1. Spark confetti for checked row
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { y: 0.8 },
      });

      // 2. Auto-start rest timer
      startRestTimer(90);

      // 3. Simulated PR Detection check
      const isPR = Math.random() > 0.7; // 30% chance for test demo
      if (isPR) {
        // Confetti explosion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        
        // Show PR Toast overlay alert
        const prToast = document.createElement('div');
        prToast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3.5 flex items-center gap-3 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.3)] animate-checkmark text-orange-400 font-extrabold text-sm';
        prToast.innerHTML = `🏆 New PR! ${exercises[exIdx].name} — ${currentSet.weight}kg × ${currentSet.reps}`;
        document.body.appendChild(prToast);
        setTimeout(() => prToast.remove(), 3500);
      }
    }
  };

  // Numpad key tap
  const handleNumpadTap = (key: string) => {
    if (!numpadConfig) return;
    const { currentValue } = numpadConfig;

    let newValue = currentValue;
    if (key === 'C') {
      newValue = '0';
    } else if (key === '.') {
      if (!currentValue.includes('.')) {
        newValue = currentValue + '.';
      }
    } else {
      newValue = currentValue === '0' ? key : currentValue + key;
    }

    setNumpadConfig({ ...numpadConfig, currentValue: newValue });
    
    // Auto-update values
    const num = parseFloat(newValue) || 0;
    updateSet(numpadConfig.exIdx, numpadConfig.setIdx, { [numpadConfig.field]: num });
  };

  // Numpad weight increment helpers
  const handleNumpadIncrement = (amount: number) => {
    if (!numpadConfig) return;
    const num = parseFloat(numpadConfig.currentValue) || 0;
    const nextVal = (num + amount).toFixed(1).replace('.0', '');
    
    setNumpadConfig({ ...numpadConfig, currentValue: nextVal });
    updateSet(numpadConfig.exIdx, numpadConfig.setIdx, { [numpadConfig.field]: parseFloat(nextVal) });
  };

  // Finish Workout API POST call
  const handleFinishWorkout = async () => {
    setIsFinishing(true);
    try {
      const response = await fetch('/api/workouts/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          routineId,
          duration: elapsed,
          volume: totalVolume,
          exercises: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets.map((s) => ({
              weight: s.weight,
              reps: s.reps,
              completed: s.completed,
            })),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record session');
      }

      // Cleanup Zustand store
      cancelWorkout();
      
      // Redirect to dashboard with summary toast
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to log session in database. Try again.');
    } finally {
      setIsFinishing(false);
      setShowFinishModal(false);
    }
  };

  const [isFinishing, setIsFinishing] = useState(false);

  // Filter exercise selections
  const filteredBank = exerciseBank.filter((e) =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8F9FA] pb-32">
      {/* 1. STICKY TOP HEADER */}
      <header className="sticky top-0 z-50 bg-[#0B0B10]/90 backdrop-filter backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Logging Session</span>
          <h2 className="text-sm font-black text-white leading-none">{title}</h2>
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-black mono-font leading-none">{formatTime(elapsed)}</span>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowFinishModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-extrabold text-xs transition-all hover:opacity-90 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          FINISH
        </button>
      </header>

      {/* 2. EXERCISE LOGGING BLOCKS LIST */}
      <main className="p-4 flex flex-col gap-6 max-w-2xl mx-auto mt-4">
        {exercises.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-500 font-medium text-sm flex flex-col items-center gap-3">
            <Dumbbell className="w-12 h-12 text-gray-700 animate-pulse" />
            <p>Your active training session is empty.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-xs font-bold text-blue-400 hover:underline"
            >
              + Add Exercise Option
            </button>
          </div>
        ) : (
          exercises.map((ex, exIdx) => (
            <div key={ex.exerciseId} className="glass-card p-5 flex flex-col gap-4">
              {/* Exercise Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-gray-200 tracking-wide">{ex.name}</h3>
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider mt-0.5">
                    {ex.muscleGroup}
                  </span>
                </div>
                <button
                  onClick={() => removeExercise(exIdx)}
                  className="p-1.5 rounded text-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-all"
                  title="Remove Lift"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sets Table */}
              <div className="w-full">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-white/5">
                      <th className="pb-2 w-10 text-center">Set</th>
                      <th className="pb-2 w-20 text-center">Previous</th>
                      <th className="pb-2 w-24 text-center">Weight (kg)</th>
                      <th className="pb-2 w-20 text-center">Reps</th>
                      <th className="pb-2 w-12 text-center">✓</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map((set, setIdx) => {
                      const isRowGreen = set.completed;
                      return (
                        <tr
                          key={set.id}
                          style={isRowGreen ? { background: 'rgba(34, 197, 94, 0.08)' } : {}}
                          className={`text-gray-300 font-medium border-b border-white/[0.02] transition-colors`}
                        >
                          <td className="py-2.5 font-bold text-center">{setIdx + 1}</td>
                          <td className="py-2.5 text-center text-gray-600 font-medium italic mono-font">
                            {set.previousWeight}×{set.previousReps}
                          </td>
                          
                          {/* Weight Field (triggers numpad) */}
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() =>
                                setNumpadConfig({
                                  exIdx,
                                  setIdx,
                                  field: 'weight',
                                  currentValue: String(set.weight),
                                })
                              }
                              className="w-16 py-1 rounded bg-white/5 border border-white/5 text-white font-bold text-xs hover:border-blue-500/50 transition-colors mono-font"
                            >
                              {set.weight}
                            </button>
                          </td>

                          {/* Reps Field */}
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() =>
                                setNumpadConfig({
                                  exIdx,
                                  setIdx,
                                  field: 'reps',
                                  currentValue: String(set.reps),
                                })
                              }
                              className="w-12 py-1 rounded bg-white/5 border border-white/5 text-white font-bold text-xs hover:border-blue-500/50 transition-colors mono-font"
                            >
                              {set.reps}
                            </button>
                          </td>

                          {/* Completed Checkbox */}
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => handleCheckSet(exIdx, setIdx, set)}
                              className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center ${
                                set.completed
                                  ? 'bg-green-500 border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-checkmark'
                                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                              }`}
                            >
                              {set.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Set builder action */}
              <button
                onClick={() => addSet(exIdx)}
                className="w-full py-2 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.01] text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD SET</span>
              </button>
            </div>
          ))
        )}
      </main>

      {/* 3. STICKY BOTTOM BUTTON */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F]/90 backdrop-filter backdrop-blur-md border-t border-white/5 py-4 px-6 flex justify-center z-40">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full max-w-md py-3.5 px-6 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 hover:text-blue-300 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
        >
          <Plus className="w-4 h-4" />
          <span>ADD EXERCISE TO WORKOUT</span>
        </button>
      </footer>

      {/* 4. CUSTOM NUMPAD BOTTOM SHEET MODAL */}
      {numpadConfig && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end justify-center p-0">
          {/* Backdrop Dismiss trigger */}
          <div className="absolute inset-0 -z-10" onClick={() => setNumpadConfig(null)} />
          
          <div className="glass-card w-full max-w-md rounded-b-none border-b-0 border-white/10 p-5 flex flex-col gap-4 shadow-2xl relative animate-checkmark">
            {/* Sheet Title */}
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">
                Set {numpadConfig.setIdx + 1} • {numpadConfig.field.toUpperCase()} VALUE
              </span>
              <button
                onClick={() => setNumpadConfig(null)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                DONE
              </button>
            </div>

            {/* Target Display and Increment Row */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-3xl font-black mono-font text-white leading-none">
                  {numpadConfig.currentValue}
                  <span className="text-sm font-medium text-gray-500 ml-1">
                    {numpadConfig.field === 'weight' ? 'kg' : 'reps'}
                  </span>
                </span>
              </div>

              {/* Weight Quick increments */}
              {numpadConfig.field === 'weight' && (
                <div className="flex gap-1.5">
                  {[-5, -2.5, 2.5, 5].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleNumpadIncrement(amt)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 text-xs font-bold text-gray-300 hover:text-blue-400 transition-all mono-font"
                    >
                      {amt > 0 ? `+${amt}` : amt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid numeric key actions */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'C'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleNumpadTap(k)}
                  className="py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 text-lg font-black text-gray-300 hover:text-white active:scale-95 transition-all mono-font flex items-center justify-center"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD EXERCISE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden shadow-2xl border border-white/10 animate-checkmark">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h4 className="text-sm font-black display-font text-white">Add Lift to Workout</h4>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setExerciseSearch('');
                }}
                className="text-xs font-bold text-gray-500 hover:text-white transition-colors"
              >
                CLOSE
              </button>
            </div>

            {/* Search inputs */}
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search exercise library..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/5 text-white font-semibold text-xs focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Exercises bank list */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {filteredBank.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    addExercise(ex);
                    setShowAddModal(false);
                    setExerciseSearch('');
                  }}
                  className="w-full p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-left flex justify-between items-center transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-gray-200">{ex.name}</span>
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                      {ex.muscleGroup}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-blue-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. REST TIMER FLOATING TOAST COUNTDOWN */}
      {restTimer.isRunning && (
        <div className="fixed bottom-20 right-6 z-50 glass-card p-4 flex items-center gap-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.25)] animate-checkmark">
          <div className="relative flex items-center justify-center w-10 h-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="20" cy="20" r="16" className="stroke-white/5" strokeWidth="3" fill="transparent" />
              <circle
                cx="20"
                cy="20"
                r="16"
                className="stroke-blue-400"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray="100"
                strokeDashoffset={100 - (restTimer.timeLeft / restTimer.duration) * 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[10px] font-black mono-font text-white">{restTimer.timeLeft}s</span>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">Resting</span>
            <span className="text-xs font-semibold text-gray-400 leading-none mt-1">Water breaks & reset</span>
          </div>

          <button
            onClick={stopRestTimer}
            className="p-1 rounded bg-white/5 text-gray-400 hover:text-white transition-colors text-[9px] font-bold"
          >
            SKIP
          </button>
        </div>
      )}

      {/* 7. FINISH WORKOUT SUMMARY MODAL */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 flex flex-col gap-5 border border-white/10 animate-checkmark shadow-2xl">
            <div className="text-center flex flex-col items-center gap-2">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-1 animate-pulse">
                <Sparkles className="w-8 h-8 fill-blue-500/10" />
              </div>
              <h3 className="text-xl font-black display-font text-white">Record Workout Session</h3>
              <p className="text-xs text-gray-400">Review your training performance details before saving.</p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-3 text-center bg-white/[0.01] border border-white/5 p-4 rounded-xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Duration</span>
                <span className="text-sm font-extrabold text-gray-200 mono-font">{formatTime(elapsed)}</span>
              </div>
              <div className="flex flex-col gap-0.5 border-l border-white/5">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Completed</span>
                <span className="text-sm font-extrabold text-green-400 mono-font">{completedSetsCount} Sets</span>
              </div>
              <div className="flex flex-col gap-0.5 border-l border-white/5">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Volume</span>
                <span className="text-sm font-extrabold text-blue-400 mono-font">{Math.round(totalVolume)} kg</span>
              </div>
            </div>

            {/* XP and gamification highlights */}
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-orange-400">Workout Completed!</span>
                <span className="text-[10px] text-gray-400">Gain XP, update streak, beat records</span>
              </div>
              <span className="text-xs font-extrabold text-orange-400 mono-font bg-orange-500/15 border border-orange-500/20 px-2 py-1 rounded-md">
                +100 XP
              </span>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                disabled={isFinishing}
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 font-extrabold text-xs text-gray-400 hover:text-white transition-colors"
              >
                BACK
              </button>
              <button
                disabled={isFinishing}
                onClick={handleFinishWorkout}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.25)]"
              >
                {isFinishing ? (
                  <span>LOGGING...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>SAVE WORKOUT</span>
                  </>
                )}
              </button>
            </div>

            {/* Cancel Session Option */}
            <button
              onClick={() => {
                if (confirm('Cancel this training session? All logged sets will be discarded.')) {
                  cancelWorkout();
                  router.push('/dashboard');
                }
              }}
              className="text-[10px] text-red-500/60 hover:text-red-400 font-bold uppercase tracking-widest text-center mt-2"
            >
              DISCARD ACTIVE WORKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
