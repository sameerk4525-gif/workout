'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Layers,
  Calendar,
  ChevronDown,
  Activity,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

interface WorkoutItem {
  id: string;
  title: string;
  volume: number;
  duration: number;
  completedAt: Date;
}

interface SetLog {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  completed: boolean;
  date: Date;
}

interface ExerciseOption {
  id: string;
  name: string;
}

interface AnalyticsClientProps {
  workouts: WorkoutItem[];
  setHistory: SetLog[];
  exerciseDropdown: ExerciseOption[];
}

export default function AnalyticsClient({
  workouts,
  setHistory,
  exerciseDropdown,
}: AnalyticsClientProps) {
  const [filterPeriod, setFilterPeriod] = useState<'30' | '90' | '180' | '365'>('90');
  const [selectedExId, setSelectedExId] = useState<string>(exerciseDropdown[0]?.id || '');

  // 1. Filter data based on time period
  const getCutoffDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(filterPeriod));
    return d;
  };

  const cutoff = getCutoffDate();
  const periodWorkouts = workouts.filter((w) => new Date(w.completedAt) >= cutoff);
  const periodSets = setHistory.filter((s) => new Date(s.date) >= cutoff);

  // 2. Heatmap frequency calculation (SVG Grid)
  const renderHeatmap = () => {
    // Generate grid coordinates for last 12 weeks (84 days) for a sleek dashboard widget
    const weeksCount = 14;
    const daysCount = 7;
    const totalDays = weeksCount * daysCount;
    
    const datesList: Array<{ date: Date; workoutCount: number }> = [];
    const today = new Date();
    
    // Start from the Sunday of weeksCount weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays);
    const startDayOffset = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOffset); // Align to Sunday

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const count = workouts.filter((w) => {
        const wDate = new Date(w.completedAt);
        return (
          wDate.getFullYear() === currentDate.getFullYear() &&
          wDate.getMonth() === currentDate.getMonth() &&
          wDate.getDate() === currentDate.getDate()
        );
      }).length;

      datesList.push({ date: currentDate, workoutCount: count });
    }

    // Colors mapping
    const getCellColor = (count: number) => {
      if (count === 0) return 'fill-[#14141E]';
      if (count === 1) return 'fill-blue-500/40';
      return 'fill-blue-500 stroke-blue-400/20'; // high volume lifts
    };

    const columns = [];
    for (let w = 0; w < weeksCount; w++) {
      const days = [];
      for (let d = 0; d < daysCount; d++) {
        const idx = w * daysCount + d;
        const info = datesList[idx];
        if (info) {
          days.push(
            <rect
              key={idx}
              x={w * 13}
              y={d * 13}
              width="10"
              height="10"
              rx="2"
              className={`${getCellColor(info.workoutCount)} transition-colors duration-150`}
              title={`${info.date.toLocaleDateString()}: ${info.workoutCount} workouts`}
            />
          );
        }
      }
      columns.push(<g key={w}>{days}</g>);
    }

    return (
      <svg width={weeksCount * 13} height={daysCount * 13} className="w-full h-full max-w-sm mt-1">
        {columns}
      </svg>
    );
  };

  // 3. Strength Progression & 1RM Over Time per exercise
  const exerciseLogs = periodSets.filter((s) => s.exerciseId === selectedExId);
  
  // Group by date to find maximum weight and estimated 1RM
  const prDateMap: Record<string, { date: Date; maxWeight: number; max1RM: number }> = {};
  
  for (const log of exerciseLogs) {
    const dateStr = new Date(log.date).toISOString().split('T')[0];
    const epley1RM = log.weight * (1 + log.reps / 30);
    
    if (!prDateMap[dateStr]) {
      prDateMap[dateStr] = {
        date: new Date(log.date),
        maxWeight: 0,
        max1RM: 0,
      };
    }

    if (log.weight > prDateMap[dateStr].maxWeight) prDateMap[dateStr].maxWeight = log.weight;
    if (epley1RM > prDateMap[dateStr].max1RM) prDateMap[dateStr].max1RM = Math.round(epley1RM);
  }

  const progressionData = Object.values(prDateMap)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((item) => ({
      date: item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: item.maxWeight,
      oneRepMax: item.max1RM,
    }));

  // 4. Volume by Muscle Group (stacked BarChart, grouped by week)
  const muscleGroupsList = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Cardio'];
  const weekVolumeMap: Record<string, { weekLabel: string; date: Date; [key: string]: any }> = {};

  for (const s of periodSets) {
    if (!s.completed) continue;
    
    // Group sets by week start
    const setDate = new Date(s.date);
    const startOfWeek = new Date(setDate);
    startOfWeek.setDate(setDate.getDate() - setDate.getDay()); // Sunday
    const weekKey = startOfWeek.toISOString().split('T')[0];

    if (!weekVolumeMap[weekKey]) {
      weekVolumeMap[weekKey] = {
        weekLabel: startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        date: startOfWeek,
      };
      // Initialize muscle groups to 0
      muscleGroupsList.forEach((m) => {
        weekVolumeMap[weekKey][m] = 0;
      });
    }

    weekVolumeMap[weekKey][s.muscleGroup] = Math.round(
      (weekVolumeMap[weekKey][s.muscleGroup] || 0) + s.weight * s.reps
    );
  }

  const muscleVolumeData = Object.values(weekVolumeMap).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // 5. Weekly Volume Trend & 4-Week Rolling Average
  // Calculate total volume per week
  const weeklyTotalVolume = muscleVolumeData.map((item, idx) => {
    const total = muscleGroupsList.reduce((sum, m) => sum + (item[m] || 0), 0);
    return {
      weekLabel: item.weekLabel,
      totalVolume: total,
      date: item.date,
    };
  });

  // Calculate 4-week rolling average
  const trendData = weeklyTotalVolume.map((item, idx) => {
    let sum = 0;
    let count = 0;
    
    // Look back up to 4 weeks (including current week)
    for (let i = Math.max(0, idx - 3); i <= idx; i++) {
      sum += weeklyTotalVolume[i].totalVolume;
      count++;
    }

    const rollingAvg = count > 0 ? Math.round(sum / count) : 0;

    return {
      weekLabel: item.weekLabel,
      volume: item.totalVolume,
      rollingAverage: rollingAvg,
    };
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Filters Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight display-font bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Performance Insights 📊
          </h2>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Analyze strength progression, muscle balance, and training frequency.
          </p>
        </div>

        {/* Time period tags */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl shrink-0">
          {[
            { id: '30', label: '30D' },
            { id: '90', label: '3M' },
            { id: '180', label: '6M' },
            { id: '365', label: '1Y' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setFilterPeriod(period.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                filterPeriod === period.id ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 1. Heatmap Widget (Left) + Selected Exercise Selector (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Heatmap Widget */}
        <div className="glass-card p-5 md:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div>
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Training Frequency Heatmap
            </h4>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Your weekly training density grid. Keep hitting consistent workouts!
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center p-3 rounded-xl bg-white/[0.01] border border-white/5">
            {renderHeatmap()}
          </div>
        </div>

        {/* Selected Exercise Dropdown */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-orange-400" /> Exercise Selection
            </h4>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Select an exercise to populate progression charts.
            </p>
          </div>

          {exerciseDropdown.length === 0 ? (
            <div className="text-xs text-gray-500 font-medium italic mt-2 text-center">
              No logged exercises found. Complete workouts to register.
            </div>
          ) : (
            <div className="relative mt-2">
              <select
                value={selectedExId}
                onChange={(e) => setSelectedExId(e.target.value)}
                className="w-full py-3 pl-4 pr-10 rounded-xl bg-white/5 border border-white/5 text-white font-bold text-xs focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
              >
                {exerciseDropdown.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-[#111118]">
                    {ex.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Row: 2. Strength Progression & Estimated 1RM Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strength Progression */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Max Weight Progression (kg)
          </h4>

          <div className="w-full h-64 mt-2">
            {progressionData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium italic bg-white/[0.01] border border-white/5 rounded-xl">
                No logs available for this exercise in selected period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressionData}>
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
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3B82F6', strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Estimated 1RM AreaChart */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-400" /> Estimated 1RM Over Time (kg)
          </h4>

          <div className="w-full h-64 mt-2">
            {progressionData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium italic bg-white/[0.01] border border-white/5 rounded-xl">
                No 1RM history available for this exercise in period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressionData}>
                  <defs>
                    <linearGradient id="color1RM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
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
                    dataKey="oneRepMax"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#color1RM)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row: 3. Volume by Muscle Group (Stacked BarChart) */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" /> Weekly Lifted Volume by Muscle Group (kg)
        </h4>

        <div className="w-full h-72 mt-2">
          {muscleVolumeData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium italic bg-white/[0.01] border border-white/5 rounded-xl">
              No volume logs available for selected time scale.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={muscleVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="weekLabel" stroke="#6C757D" fontSize={10} tickLine={false} />
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                <Bar dataKey="Chest" stackId="a" fill="#3B82F6" />
                <Bar dataKey="Back" stackId="a" fill="#10B981" />
                <Bar dataKey="Shoulders" stackId="a" fill="#8B5CF6" />
                <Bar dataKey="Biceps" stackId="a" fill="#14B8A6" />
                <Bar dataKey="Triceps" stackId="a" fill="#6366F1" />
                <Bar dataKey="Legs" stackId="a" fill="#EF4444" />
                <Bar dataKey="Glutes" stackId="a" fill="#EC4899" />
                <Bar dataKey="Core" stackId="a" fill="#F97316" />
                <Bar dataKey="Cardio" stackId="a" fill="#EAB308" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row: 4. Weekly Volume Trend Chart (with 4-Week Rolling Average) */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-400" /> Weekly Training Volume Trend & 4-Week Rolling Average
        </h4>

        <div className="w-full h-72 mt-2">
          {trendData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium italic bg-white/[0.01] border border-white/5 rounded-xl">
              No volume trends available. Log workouts to populate curves.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="weekLabel" stroke="#6C757D" fontSize={10} tickLine={false} />
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
                <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                <Area
                  type="monotone"
                  name="Weekly Total Volume"
                  dataKey="volume"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                />
                <Area
                  type="monotone"
                  name="4-Week Rolling Avg"
                  dataKey="rollingAverage"
                  stroke="#F97316"
                  strokeWidth={3}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
