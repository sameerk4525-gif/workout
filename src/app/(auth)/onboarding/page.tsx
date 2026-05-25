'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, User, Award, Target, ArrowRight, Check } from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=iron_champion',
    level: '',
    goals: [] as string[],
  });

  const avatarSeeds = ['champion', 'warrior', 'power', 'titan', 'beast'];

  const selectAvatar = (seed: string) => {
    setFormData({
      ...formData,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
    });
  };

  const selectLevel = (level: string) => {
    setFormData({ ...formData, level });
  };

  const toggleGoal = (goal: string) => {
    const active = formData.goals.includes(goal);
    const updated = active
      ? formData.goals.filter((g) => g !== goal)
      : [...formData.goals, goal];
    setFormData({ ...formData, goals: updated });
  };

  const handleNext = () => {
    if (step === 1 && !formData.username) {
      alert('Please choose a username.');
      return;
    }
    if (step === 2 && !formData.level) {
      alert('Please select a fitness level.');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Completed, redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8F9FA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Progress Indicators */}
      <div className="w-full max-w-lg mb-8 relative z-10">
        <div className="flex justify-between items-center px-4">
          {[
            { num: 1, label: 'Profile', icon: User },
            { num: 2, label: 'Level', icon: Award },
            { num: 3, label: 'Goals', icon: Target },
          ].map((item) => {
            const isCompleted = step > item.num;
            const isActive = step === item.num;
            return (
              <div key={item.num} className="flex flex-col items-center gap-1.5 relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : isActive
                      ? 'bg-[#111118] border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                      : 'bg-[#111118] border-white/5 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <item.icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[10px] uppercase font-bold tracking-widest ${
                    isActive ? 'text-blue-400' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute top-5 left-10 right-10 h-[2px] bg-white/5 -z-10">
          <motion.div
            className="h-full bg-blue-500"
            animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Onboarding Wizard Form Card */}
      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-black tracking-tight display-font">Choose Profile Handle</h2>
                <p className="text-sm text-gray-400">Setup your identity on the global leaderboard.</p>
              </div>

              {/* Username Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  placeholder="e.g. iron_titan"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Avatar Selector */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Avatar Preset</label>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.avatar}
                    alt="Active Avatar"
                    className="w-16 h-16 rounded-full border-2 border-blue-500/50 p-1"
                  />
                  <div className="flex gap-2 flex-wrap">
                    {avatarSeeds.map((seed) => {
                      const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
                      const isSelected = formData.avatar === url;
                      return (
                        <button
                          key={seed}
                          onClick={() => selectAvatar(seed)}
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                            isSelected ? 'border-blue-500 scale-105' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={seed} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 px-6 rounded-xl bg-blue-500 text-white font-extrabold text-sm transition-all hover:bg-blue-600 flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-black tracking-tight display-font">Fitness Experience</h2>
                <p className="text-sm text-gray-400">Select your current lifting level.</p>
              </div>

              {/* Levels list */}
              <div className="flex flex-col gap-3">
                {[
                  { id: 'Beginner', title: 'Beginner', desc: 'New to strength training or returning after a break.' },
                  { id: 'Intermediate', title: 'Intermediate', desc: 'Consistent weightlifter with basic barbell knowledge.' },
                  { id: 'Advanced', title: 'Advanced', desc: 'Advanced strength training mechanics and custom routines.' },
                ].map((item) => {
                  const isSelected = formData.level === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectLevel(item.id)}
                      className={`w-full p-4 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className={`font-bold ${isSelected ? 'text-blue-400' : 'text-gray-200'}`}>
                        {item.title}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 px-6 rounded-xl border border-white/10 hover:bg-white/5 font-extrabold text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 px-6 rounded-xl bg-blue-500 text-white font-extrabold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-black tracking-tight display-font">Choose Training Goals</h2>
                <p className="text-sm text-gray-400">Select all that apply to customize metrics.</p>
              </div>

              {/* Goals check boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'Strength', label: 'Power & Strength', icon: Dumbbell },
                  { id: 'Muscle', label: 'Muscle Building', icon: Dumbbell },
                  { id: 'Endurance', label: 'Endurance Focus', icon: Target },
                  { id: 'Weight Loss', label: 'Lean Physique', icon: Award },
                ].map((item) => {
                  const isSelected = formData.goals.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleGoal(item.id)}
                      className={`p-4 rounded-xl border flex flex-col gap-3 items-center text-center transition-all ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.15)] text-blue-400'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-xs font-bold leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 px-6 rounded-xl border border-white/10 hover:bg-white/5 font-extrabold text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-extrabold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                  <span>Finish Setup</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
