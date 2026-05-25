import React from 'react';
import Link from 'next/link';
import { Dumbbell, ArrowRight, Shield, Flame, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8F9FA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial spotlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl flex flex-col items-center text-center gap-6 relative z-10">
        {/* Brand Icon */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 glow-blue animate-pulse mb-2">
          <Dumbbell className="w-12 h-12 text-blue-500 fill-blue-500/10" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight display-font leading-none">
          IRON<span className="text-blue-500">QUEST</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-sm sm:text-base text-gray-400 font-medium max-w-md leading-relaxed">
          The gamified, production-grade training tracker. Record your sets, calculate 1RMs in real-time, tarnish training streaks, and rank up on global boards.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
          <Link
            href="/dashboard"
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-extrabold text-sm transition-all hover:opacity-90 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2"
          >
            <span>ENTER CORE APPLICATION</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sign-in"
            className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white font-extrabold text-sm transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center"
          >
            Sign In / Register
          </Link>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-3 gap-6 w-full border-t border-white/5 pt-8 mt-6 text-center text-xs">
          <div className="flex flex-col items-center gap-1.5">
            <Shield className="w-5 h-5 text-orange-400" />
            <span className="font-extrabold text-gray-200">100+ Lifts</span>
            <span className="text-[10px] text-gray-500">Fully Seeded Bank</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-l border-white/5">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-extrabold text-gray-200">Streaks & XP</span>
            <span className="text-[10px] text-gray-500">Rank Progression</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-l border-white/5">
            <Trophy className="w-5 h-5 text-orange-400" />
            <span className="font-extrabold text-gray-200">Achievements</span>
            <span className="text-[10px] text-gray-500">Earn Unlocked Medals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
