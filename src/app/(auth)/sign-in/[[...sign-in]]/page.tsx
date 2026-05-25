'use client';

import React from 'react';
import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

export default function SignInPage() {
  const handleDemoMode = () => {
    // Redirect directly to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8F9FA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-8 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 glow-blue mb-2">
            <Dumbbell className="w-10 h-10 text-blue-500 fill-blue-500/10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight display-font">
            IRON<span className="text-blue-500">QUEST</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium max-w-xs mt-1">
            Build your ultimate physique. Gamify your training metrics.
          </p>
        </div>

        {/* Auth Interface */}
        <div className="glass-card p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-center">
            <h2 className="text-lg font-bold text-gray-200">Welcome Back</h2>
            <p className="text-xs text-gray-500">Sign in to resume your training streak</p>
          </div>

          {/* Fallback local demo entry button */}
          <button
            onClick={handleDemoMode}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-extrabold text-sm transition-all hover:opacity-90 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2"
          >
            <span>🔥 Enter Demo Mode (Instant Access)</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">OR USE CLERK AUTH</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="text-center text-xs text-gray-500 font-medium">
            Clerk Authentication is ready for deployment. Set up your Vercel/Clerk keys in production to enable social logins.
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 font-medium">
          New to the gym?{' '}
          <Link href="/sign-up" className="text-blue-400 font-bold hover:underline">
            Register Account
          </Link>
        </p>
      </div>
    </div>
  );
}
