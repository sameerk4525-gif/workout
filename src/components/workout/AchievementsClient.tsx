'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Sparkles, Calendar, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnlockedAchievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

interface AchievementsClientProps {
  unlockedAchievements: UnlockedAchievement[];
}

const ACHIEVEMENTS_CATALOG = [
  { type: 'FIRST_REP', title: 'First Rep', description: 'Log your first workout.', icon: '🏋️' },
  { type: 'IRON_WILL', title: 'Iron Will', description: 'Maintain a 7-day training streak.', icon: '🔥' },
  { type: 'CENTURY_CLUB', title: 'Century Club', description: 'Log 100 workouts.', icon: '💯' },
  { type: 'TON_UP', title: 'Ton Up', description: 'Lift 100kg on any exercise.', icon: '💪' },
  { type: 'VOLUME_KING', title: 'Volume King', description: 'Log 10,000kg in a single week.', icon: '👑' },
  { type: 'SOCIAL_BUTTERFLY', title: 'Social Butterfly', description: 'Follow 10 users.', icon: '🦋' },
  { type: 'ENDURANCE_MONSTER', title: 'Endurance Focus', description: 'Complete a cardio log of 60 mins.', icon: '🏃' },
  { type: 'MAX_REPS_CHAMP', title: 'Rep Champion', description: 'Perform 30 reps on any set.', icon: '⚡' },
  { type: 'EARLY_BIRD', title: 'Early Bird', description: 'Log a workout before 6:00 AM.', icon: '🌅' },
  { type: 'NIGHT_OWL', title: 'Night Owl', description: 'Log a workout after 10:00 PM.', icon: '🌌' },
  { type: 'STEADY_GAINS', title: 'Steady Gains', description: 'Log workouts 3 days in a row.', icon: '📈' },
  { type: 'REST_TIMER_PRO', title: 'Rest Master', description: 'Configure custom rest timers.', icon: '⏱️' },
];

export default function AchievementsClient({ unlockedAchievements }: AchievementsClientProps) {
  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS_CATALOG.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  // Plays a confetti pop when clicking on an unlocked achievement
  const handleBadgeClick = (isUnlocked: boolean) => {
    if (!isUnlocked) return;
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-12">
      {/* 1. Header and progress tracker */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col gap-1 sm:w-1/2">
          <h2 className="text-2xl font-black tracking-tight display-font text-white flex items-center gap-2">
            Achievements Arena <Sparkles className="w-5 h-5 text-orange-400" />
          </h2>
          <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">
            Complete workouts, maintain training streaks, and beat heavy lifting thresholds to unlock medals.
          </p>
        </div>

        {/* Progress track */}
        <div className="w-full sm:w-1/2 flex flex-col gap-2">
          <div className="flex justify-between items-baseline text-xs font-bold">
            <span className="text-gray-300">Medals Earned</span>
            <span className="text-orange-400 mono-font">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          
          <div className="h-3 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden p-[2px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 glow-orange"
            />
          </div>
        </div>
      </div>

      {/* 2. Grid of medals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACHIEVEMENTS_CATALOG.map((item) => {
          const unlockedItem = unlockedAchievements.find((ua) => ua.type === item.type);
          const isUnlocked = !!unlockedItem;

          return (
            <motion.div
              key={item.type}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
              onClick={() => handleBadgeClick(isUnlocked)}
              style={isUnlocked ? { background: 'rgba(249, 115, 22, 0.04)', borderColor: 'rgba(249, 115, 22, 0.2)' } : {}}
              className={`glass-card p-4 flex items-center gap-4 border transition-all relative overflow-hidden ${
                isUnlocked
                  ? 'border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.06)] cursor-pointer'
                  : 'border-white/5 bg-[#111118]/20 opacity-55'
              }`}
            >
              {/* Badge Emblem Frame */}
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center text-2xl relative shrink-0 ${
                  isUnlocked
                    ? 'bg-orange-500/10 border-orange-500/30 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                    : 'bg-[#14141E]/40 border-white/5'
                }`}
              >
                <span>{item.icon}</span>

                {/* Lock indicator */}
                {!isUnlocked && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Text metadata */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className={`text-xs font-black tracking-wide ${isUnlocked ? 'text-orange-400' : 'text-gray-300'}`}>
                    {item.title}
                  </span>
                  {isUnlocked && (
                    <span className="text-[8px] font-black bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded text-orange-400 tracking-wider flex items-center gap-0.5 uppercase leading-none shrink-0">
                      <Check className="w-2.5 h-2.5" /> Earned
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-gray-500 leading-normal font-medium pr-4">
                  {item.description}
                </p>

                {/* Unlock date */}
                {isUnlocked && unlockedItem && (
                  <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-1 mono-font">
                    <Calendar className="w-3 h-3 text-gray-600" /> Unlocked{' '}
                    {new Date(unlockedItem.unlockedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
