import React from 'react';

interface MuscleGroupBadgeProps {
  muscleGroup: string;
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  chest: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  back: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  shoulders: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  legs: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  glutes: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  core: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  biceps: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  triceps: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  cardio: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
};

export default function MuscleGroupBadge({ muscleGroup }: MuscleGroupBadgeProps) {
  const norm = muscleGroup.toLowerCase();
  const theme = colorMap[norm] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.bg} ${theme.text} ${theme.border} tracking-wide shrink-0`}
    >
      {muscleGroup}
    </span>
  );
}
