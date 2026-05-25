'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  LineChart,
  Trophy,
  Users,
  User,
  LogOut,
  Flame,
  Bell
} from 'lucide-react';

interface ShellProps {
  children: ReactNode;
}

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Workout', href: '/workouts', icon: Dumbbell },
  { label: 'Routines', href: '/routines', icon: BookOpen },
  { label: 'Exercises', href: '/exercises', icon: BookOpen },
  { label: 'Analytics', href: '/analytics', icon: LineChart },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Social', href: '/social', icon: Users },
];

export default function Shell({ children }: ShellProps) {
  const pathname = usePathname();

  // Hide nav layout on sign-in, sign-up and onboarding pages
  const isAuthPage =
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/onboarding');

  if (isAuthPage) {
    return <main className="min-h-screen bg-[#0A0A0F]">{children}</main>;
  }

  // Mock active user details (clerk sync fallback)
  const mockUser = {
    username: 'thor_lifts',
    streak: 8,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=thor'
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8F9FA] flex flex-col md:flex-row">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0B0B10] h-screen sticky top-0 shrink-0 p-5 justify-between">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 px-2">
            <Dumbbell className="w-8 h-8 text-blue-500 fill-blue-500/10 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-xl font-extrabold tracking-tight display-font bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              IRON<span className="text-blue-500">QUEST</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                    isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-bg"
                      className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account / Footer */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
          {/* Active user details / profile */}
          <Link
            href={`/profile/${mockUser.username}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mockUser.avatar}
              alt={mockUser.username}
              className="w-10 h-10 rounded-full border border-white/10"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-200">@{mockUser.username}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">View Profile</span>
            </div>
          </Link>

          {/* Sign Out Button */}
          <Link
            href="/sign-in"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* 2. Main Content Layout Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0F] sticky top-0 z-40">
          {/* Mobile brand logo */}
          <div className="md:hidden flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-blue-500" />
            <span className="font-extrabold tracking-tight display-font text-md">
              IRON<span className="text-blue-500">QUEST</span>
            </span>
          </div>

          <div className="hidden md:block">
            {/* Display active context label */}
            <h1 className="text-xl font-black tracking-tight capitalize display-font">
              {pathname === '/' || pathname === '/dashboard'
                ? 'Gym HQ'
                : pathname.split('/')[1]?.replace('-', ' ')}
            </h1>
          </div>

          {/* User Quick Info & Alerts */}
          <div className="flex items-center gap-4">
            {/* Streak Counter 🔥 */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Flame className="w-4 h-4 fill-orange-500/20" />
              <span className="text-xs font-black mono-font leading-none">{mockUser.streak} DAYS</span>
            </div>

            {/* Notification trigger */}
            <button className="relative p-2 rounded-full border border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 glow-blue animate-pulse" />
            </button>
          </div>
        </header>

        {/* Dynamic page contents render block */}
        <main className="flex-1 p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Sticky Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0B0B10]/90 backdrop-filter backdrop-blur-lg border-t border-white/5 z-50 flex items-center justify-around px-2 shadow-[0_-8px_32px_0_rgba(0,0,0,0.5)]">
        {[
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Workout', href: '/workouts', icon: Dumbbell },
          { label: 'Routines', href: '/routines', icon: BookOpen },
          { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
          { label: 'Social', href: '/social', icon: Users },
        ].map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all ${
                isActive ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <item.icon className={`w-5.5 h-5.5 ${isActive ? 'text-blue-500 filter drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]' : 'text-gray-500'}`} />
              <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
