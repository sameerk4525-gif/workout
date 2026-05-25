import { create } from 'zustand';

export interface SetItem {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  previousWeight?: number;
  previousReps?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: SetItem[];
}

export interface WorkoutState {
  isActive: boolean;
  title: string;
  routineId: string | null;
  startTime: number | null;
  elapsed: number;
  exercises: WorkoutExercise[];
  restTimer: {
    duration: number; // default 90s
    timeLeft: number;
    isRunning: boolean;
  };
  
  // Actions
  startWorkout: (routine?: { id: string; name: string; exercises: any[] }) => void;
  addExercise: (exercise: { id: string; name: string; muscleGroup: string }) => void;
  removeExercise: (exIdx: number) => void;
  addSet: (exIdx: number) => void;
  removeSet: (exIdx: number, setIdx: number) => void;
  updateSet: (exIdx: number, setIdx: number, updates: Partial<SetItem>) => void;
  tickTimer: () => void;
  startRestTimer: (duration?: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
  cancelWorkout: () => void;
  hydrateStore: () => void;
  saveToLocalStorage: () => void;
}

const LOCAL_STORAGE_KEY = 'ironquest_active_workout_v1';

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  isActive: false,
  title: 'Active Workout',
  routineId: null,
  startTime: null,
  elapsed: 0,
  exercises: [],
  restTimer: {
    duration: 90,
    timeLeft: 0,
    isRunning: false,
  },

  startWorkout: (routine) => {
    const startTime = Date.now();
    
    if (routine) {
      const exercises = routine.exercises.map((re: any) => ({
        exerciseId: re.exerciseId,
        name: re.name,
        muscleGroup: re.muscleGroup,
        sets: Array.from({ length: re.sets || 3 }).map((_, i) => ({
          id: `${re.exerciseId}_set_${i}_${Date.now()}`,
          weight: re.weight || 60,
          reps: re.reps || 10,
          completed: false,
          previousWeight: re.weight || 60,
          previousReps: re.reps || 10,
        })),
      }));

      set({
        isActive: true,
        title: routine.name,
        routineId: routine.id,
        startTime,
        elapsed: 0,
        exercises,
        restTimer: { duration: 90, timeLeft: 0, isRunning: false },
      });
    } else {
      set({
        isActive: true,
        title: 'Empty Active Session',
        routineId: null,
        startTime,
        elapsed: 0,
        exercises: [],
        restTimer: { duration: 90, timeLeft: 0, isRunning: false },
      });
    }

    get().saveToLocalStorage();
  },

  addExercise: (ex) => {
    const current = get().exercises;
    if (current.some(item => item.exerciseId === ex.id)) return;

    const newEx: WorkoutExercise = {
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: [
        {
          id: `${ex.id}_set_0_${Date.now()}`,
          weight: 60,
          reps: 10,
          completed: false,
          previousWeight: 60,
          previousReps: 10,
        },
      ],
    };

    set({ exercises: [...current, newEx] });
    get().saveToLocalStorage();
  },

  removeExercise: (exIdx) => {
    const updated = get().exercises.filter((_, i) => i !== exIdx);
    set({ exercises: updated });
    get().saveToLocalStorage();
  },

  addSet: (exIdx) => {
    const updated = [...get().exercises];
    const sets = updated[exIdx].sets;
    const lastSet = sets[sets.length - 1] || { weight: 60, reps: 10 };
    
    sets.push({
      id: `${updated[exIdx].exerciseId}_set_${sets.length}_${Date.now()}`,
      weight: lastSet.weight,
      reps: lastSet.reps,
      completed: false,
      previousWeight: lastSet.weight,
      previousReps: lastSet.reps,
    });

    set({ exercises: updated });
    get().saveToLocalStorage();
  },

  removeSet: (exIdx, setIdx) => {
    const updated = [...get().exercises];
    const sets = updated[exIdx].sets;
    if (sets.length <= 1) return;
    
    updated[exIdx].sets = sets.filter((_, i) => i !== setIdx);
    set({ exercises: updated });
    get().saveToLocalStorage();
  },

  updateSet: (exIdx, setIdx, updates) => {
    const updated = [...get().exercises];
    updated[exIdx].sets[setIdx] = {
      ...updated[exIdx].sets[setIdx],
      ...updates,
    };
    
    set({ exercises: updated });
    get().saveToLocalStorage();
  },

  tickTimer: () => {
    if (!get().isActive) return;
    set((state) => ({ elapsed: state.elapsed + 1 }));
  },

  startRestTimer: (duration = 90) => {
    set({
      restTimer: {
        duration,
        timeLeft: duration,
        isRunning: true,
      },
    });
  },

  tickRestTimer: () => {
    const { restTimer } = get();
    if (!restTimer.isRunning) return;

    if (restTimer.timeLeft <= 1) {
      set({
        restTimer: {
          ...restTimer,
          timeLeft: 0,
          isRunning: false,
        },
      });
    } else {
      set({
        restTimer: {
          ...restTimer,
          timeLeft: restTimer.timeLeft - 1,
        },
      });
    }
  },

  stopRestTimer: () => {
    set((state) => ({
      restTimer: {
        ...state.restTimer,
        timeLeft: 0,
        isRunning: false,
      },
    }));
  },

  cancelWorkout: () => {
    set({
      isActive: false,
      title: 'Active Workout',
      routineId: null,
      startTime: null,
      elapsed: 0,
      exercises: [],
      restTimer: { duration: 90, timeLeft: 0, isRunning: false },
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  },

  hydrateStore: () => {
    if (typeof window === 'undefined') return;
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.isActive) {
          set({
            isActive: parsed.isActive,
            title: parsed.title,
            routineId: parsed.routineId,
            startTime: parsed.startTime,
            elapsed: parsed.elapsed,
            exercises: parsed.exercises,
            restTimer: parsed.restTimer || { duration: 90, timeLeft: 0, isRunning: false },
          });
          console.log('Hydrated active workout from localStorage!');
        }
      } catch (err) {
        console.error('Failed to parse cached workout:', err);
      }
    }
  },

  saveToLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const { isActive, title, routineId, startTime, elapsed, exercises, restTimer } = get();
    if (isActive) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ isActive, title, routineId, startTime, elapsed, exercises, restTimer })
      );
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  },
}));
