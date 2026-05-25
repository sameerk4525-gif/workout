'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  glowColor?: 'blue' | 'orange';
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1.2; // seconds
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * end);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export default function StatCard({
  label,
  value,
  suffix = '',
  icon: Icon,
  trend,
  glowColor = 'blue',
}: StatCardProps) {
  const glowClass = glowColor === 'blue' ? 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]';
  const iconBg = glowColor === 'blue' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
      className={`glass-card-interactive p-6 flex flex-col justify-between h-36 ${glowClass}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-extrabold mt-2 tracking-tight mono-font flex items-baseline">
            <AnimatedNumber value={value} />
            {suffix && <span className="text-lg font-medium text-gray-500 ml-1">{suffix}</span>}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span
            className={`flex items-center gap-0.5 font-bold ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trend.value}%
          </span>
          <span className="text-gray-400 font-medium">vs last week</span>
        </div>
      )}
    </motion.div>
  );
}
