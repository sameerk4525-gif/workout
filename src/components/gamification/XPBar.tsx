'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface XPBarProps {
  xp: number;
}

export default function XPBar({ xp }: XPBarProps) {
  // Every 500 XP is 1 level
  const LEVEL_XP = 500;
  const currentLevel = Math.floor(xp / LEVEL_XP) + 1;
  const xpInCurrentLevel = xp % LEVEL_XP;
  const progressPercent = (xpInCurrentLevel / LEVEL_XP) * 100;

  return (
    <div className="glass-card p-5 w-full flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
      {/* Decorative backdrop light */}
      <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Level Badge Shield */}
      <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
        <Shield className="w-14 h-14 text-orange-500/20 fill-orange-500/10 stroke-orange-500 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold text-orange-400 tracking-widest leading-none">LVL</span>
          <span className="text-xl font-black text-white leading-none mt-0.5 display-font">{currentLevel}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="flex-1 w-full">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-bold text-gray-200 tracking-wide">Level Progress</span>
          <span className="text-xs font-semibold text-gray-400 mono-font">
            <span className="text-orange-400 font-bold">{xpInCurrentLevel}</span> / {LEVEL_XP} XP
          </span>
        </div>

        {/* Outer Bar */}
        <div className="h-3 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden p-[2px]">
          {/* Inner animated bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 glow-orange"
          />
        </div>

        {/* XP needed */}
        <p className="text-[10px] text-gray-500 mt-1.5 font-medium tracking-wide">
          Earn <span className="text-orange-400/80 font-bold">{LEVEL_XP - xpInCurrentLevel} XP</span> to reach Level {currentLevel + 1}
        </p>
      </div>
    </div>
  );
}
