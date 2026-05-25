'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  MessageSquare,
  Clock,
  Layers,
  Send,
  ChevronDown,
  ChevronUp,
  Dumbbell
} from 'lucide-react';

interface FeedComment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    username: string;
    avatar: string;
  };
}

interface FeedExercise {
  name: string;
  sets: Array<{
    setNumber: number;
    weight: number;
    reps: number;
  }>;
}

interface FeedItem {
  id: string;
  title: string;
  notes: string | null;
  duration: number;
  volume: number;
  completedAt: Date;
  user: {
    id: string;
    username: string;
    avatar: string;
    level: number;
  };
  likesCount: number;
  hasLiked: boolean;
  comments: FeedComment[];
  exercises: FeedExercise[];
}

interface SocialFeedClientProps {
  initialFeed: FeedItem[];
  currentUserId: string;
}

function WorkoutCard({
  item,
  onLikeToggle,
  onCommentAdd,
}: {
  item: FeedItem;
  onLikeToggle: (id: string) => void;
  onCommentAdd: (id: string, text: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const handleLike = () => {
    onLikeToggle(item.id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onCommentAdd(item.id, commentText);
    setCommentText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 flex flex-col gap-4 border border-white/5 bg-[#111118]/45 relative overflow-hidden"
    >
      {/* Background glow decoration */}
      <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

      {/* 1. Header (User Info) */}
      <div className="flex items-center justify-between">
        <Link href={`/profile/${item.user.username}`} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.user.avatar}
            alt={item.user.username}
            className="w-10 h-10 rounded-full border border-white/10"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-200 hover:text-blue-400 transition-colors">
              @{item.user.username}
            </span>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
              Level {item.user.level}
            </span>
          </div>
        </Link>

        {/* Completed date */}
        <span className="text-[10px] text-gray-500 font-bold mono-font">
          {new Date(item.completedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {/* 2. Workout Title & Volume stats */}
      <div className="flex flex-col gap-1">
        <h4 className="text-md font-black tracking-tight display-font text-white">{item.title}</h4>
        {item.notes && <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1 italic">{item.notes}</p>}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 text-center bg-white/[0.01] border border-white/5 p-3 rounded-xl">
        <div className="flex flex-col gap-0.5 items-center justify-center">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> Time
          </span>
          <span className="text-xs font-black text-gray-200 mt-0.5 mono-font">
            {formatDuration(item.duration)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 items-center justify-center border-l border-white/5">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3" /> Volume
          </span>
          <span className="text-xs font-black text-blue-400 mt-0.5 mono-font">
            {Math.round(item.volume).toLocaleString()} kg
          </span>
        </div>
      </div>

      {/* 3. Collapsible Exercises preview list */}
      <div className="border-t border-white/5 pt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4 text-blue-500" />
            <span>Exercises List ({item.exercises.length})</span>
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3 pl-5 flex flex-col gap-3 border-l border-white/5"
            >
              {item.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-200">{ex.name}</span>
                  <div className="flex flex-wrap gap-1.5 text-[9px] text-gray-400 font-bold mono-font">
                    {ex.sets.map((set, sIdx) => (
                      <span key={sIdx} className="px-1.5 py-0.5 rounded bg-white/5">
                        Set {set.setNumber}: {set.weight}kg × {set.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Social action bar (Likes & Comments buttons) */}
      <div className="flex items-center gap-6 border-t border-white/5 pt-3">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105 ${
            item.hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${item.hasLiked ? 'fill-red-500' : ''}`} />
          <span className="mono-font">{item.likesCount}</span>
        </button>

        {/* Comment toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105 ${
            showComments ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="mono-font">{item.comments.length}</span>
        </button>
      </div>

      {/* 5. Collapsible Comments Box */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/5 pt-4 mt-1 flex flex-col gap-4"
          >
            {/* List */}
            <div className="flex flex-col gap-3 max-h-56 overflow-y-auto">
              {item.comments.length === 0 ? (
                <span className="text-center text-xs text-gray-500 font-medium py-2">
                  No comments yet. Write the first motivational words!
                </span>
              ) : (
                item.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 text-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.user.avatar}
                      alt={c.user.username}
                      className="w-7 h-7 rounded-full border border-white/10 shrink-0 mt-0.5"
                    />
                    <div className="flex flex-col bg-white/[0.02] border border-white/5 p-2 rounded-xl flex-1">
                      <span className="font-extrabold text-gray-300">@{c.user.username}</span>
                      <p className="text-gray-400 mt-1 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 relative">
              <input
                type="text"
                placeholder="Write a motivational comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full py-2.5 pl-4 pr-12 rounded-xl bg-white/5 border border-white/5 text-white font-semibold text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SocialFeedClient({
  initialFeed,
  currentUserId,
}: SocialFeedClientProps) {
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialFeed.length >= 10);

  // Handle Likes locally and optimistic updates
  const handleLikeToggle = async (workoutId: string) => {
    // 1. Optimistic update
    setFeed((prev) =>
      prev.map((item) => {
        if (item.id === workoutId) {
          const nextHasLiked = !item.hasLiked;
          return {
            ...item,
            hasLiked: nextHasLiked,
            likesCount: nextHasLiked ? item.likesCount + 1 : item.likesCount - 1,
          };
        }
        return item;
      })
    );

    // 2. Fetch API POST
    try {
      const response = await fetch(`/api/workouts/${workoutId}/like`, {
        method: 'POST',
      });
      const data = await response.json();
      
      // Update actual data from backend response
      setFeed((prev) =>
        prev.map((item) => {
          if (item.id === workoutId) {
            return {
              ...item,
              hasLiked: data.isLiked,
              likesCount: data.likeCount,
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Handle Commenting locally and optimistic updates
  const handleCommentAdd = async (workoutId: string, content: string) => {
    // 1. Optimistic creation
    const tempCommentId = `temp_comment_${Date.now()}`;
    const myUsername = 'thor_lifts'; // fallback mock username
    const myAvatar = 'https://api.dicebear.com/7.x/adventurer/svg?seed=thor';

    setFeed((prev) =>
      prev.map((item) => {
        if (item.id === workoutId) {
          const tempComment: FeedComment = {
            id: tempCommentId,
            content,
            createdAt: new Date(),
            user: {
              username: myUsername,
              avatar: myAvatar,
            },
          };
          return {
            ...item,
            comments: [...item.comments, tempComment],
          };
        }
        return item;
      })
    );

    // 2. Fetch API POST
    try {
      const response = await fetch(`/api/workouts/${workoutId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      // Replace temp comment with actual comment returned by backend
      setFeed((prev) =>
        prev.map((item) => {
          if (item.id === workoutId) {
            return {
              ...item,
              comments: item.comments.map((c) =>
                c.id === tempCommentId
                  ? {
                      id: data.comment.id,
                      content: data.comment.content,
                      createdAt: new Date(data.comment.createdAt),
                      user: {
                        username: data.comment.user.username,
                        avatar: data.comment.user.avatar,
                      },
                    }
                  : c
              ),
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  const handleLoadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);

    try {
      const response = await fetch(`/api/feed?page=${nextPage}`);
      const data = await response.json();

      if (data.results.length < 10) {
        setHasMore(false);
      }
      setFeed((prev) => [...prev, ...data.results]);
    } catch (err) {
      console.error('Error fetching next feed page:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto pb-20">
      {/* List Feed Cards */}
      <div className="flex flex-col gap-5">
        {feed.map((item) => (
          <WorkoutCard
            key={item.id}
            item={item}
            onLikeToggle={handleLikeToggle}
            onCommentAdd={handleCommentAdd}
          />
        ))}
      </div>

      {/* Pagination Load More */}
      {hasMore && feed.length >= 10 && !isLoading && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-bold text-gray-300 hover:text-white transition-colors"
        >
          LOAD MORE SOCIAL ACTIVITY
        </button>
      )}

      {isLoading && (
        <div className="flex flex-col gap-4 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="w-full h-44 rounded-2xl bg-white/[0.01] border border-white/5" />
          ))}
        </div>
      )}
    </div>
  );
}
