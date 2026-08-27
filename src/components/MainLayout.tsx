import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar } from './AppBar';
import { Sidebar } from './Sidebar';
import { db } from '../Firebase';
import { onValue, ref } from 'firebase/database';
import { Megaphone, Sparkles } from 'lucide-react';
import { MoneyWaterRain } from '../fun/MoneyWaterRain';

export const MainLayout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [newsDuration, setNewsDuration] = useState<number>(-1);
  const [breakingNews, setBreakingNews] = useState<string>('');
  const [sponsersDuration, setSponsersDuration] = useState<number>(-1);

  useEffect(() => {
    const durationRef = ref(db, "funshit/breakingNewsTimer");
    const unsubDuration = onValue(durationRef, (snapshot) => {
      if (snapshot.exists()) {
        setNewsDuration(snapshot.val());
      } else {
        setNewsDuration(-1);
      }
    });

    const titleRef = ref(db, "funshit/breakingNewsTitle");
    const unsubTitle = onValue(titleRef, (snapshot) => {
      if (snapshot.exists()) {
        setBreakingNews(snapshot.val());
      } else {
        setBreakingNews('');
      }
    });

    const sponsersDurationRef = ref(db, "funshit/sponsersDuration");
    const unsubSponsersDuration = onValue(sponsersDurationRef, (snapshot) => {
      if (snapshot.exists()) {
        setSponsersDuration(snapshot.val());
      } else {
        setSponsersDuration(-1);
      }
    });

    return () => {
      unsubDuration();
      unsubTitle();
      unsubSponsersDuration();
    }
  }, []);

  const isNewsActive = newsDuration > 0;
  const isSponserActive = sponsersDuration > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      <style>{`
    @keyframes slideRightAcross {
        0% {
            transform: translate3d(-100%, 0, 0);
        }
        100% {
            transform: translate3d(100vw, 0, 0);
        }
    }
    .animate-slide-across {
        animation: slideRightAcross 6s linear infinite;
        display: inline-flex;
        width: max-content;
        max-width: none;
        will-change: transform;
    }
`}</style>

      {isSponserActive && <MoneyWaterRain />}
      {/* Sliding Sponsor Image in Center */}
      {isSponserActive && (
        <div className="fixed top-1/2 -translate-y-1/2 left-0 w-full pointer-events-none z-50 overflow-hidden">
          <div className="animate-slide-across inline-flex flex-col items-center gap-3 bg-zinc-900/95 border-4 border-emerald-400 p-8 sm:p-10 rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.7)] backdrop-blur-md">

            {/* Title Above Moving Image */}
            <span className="text-emerald-400 font-black text-xl sm:text-3xl uppercase tracking-widest text-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              ⭐ תחרות זה לא יכלה להתקיים בלי ⭐
            </span>
            <span className="text-emerald-400 font-black text-xl sm:text-3xl uppercase tracking-widest text-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              ⭐ בלוג הברזיות של תמיר ⭐
            </span>

            {/* Increased Image Size */}
            <img
              src="src/assets/Tamir.jpg"
              alt="Sponsor Logo"
              className="h-44 sm:h-64 max-w-[80vw] w-auto object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      )}


      {isNewsActive && (
        <div className="fixed top-1/2 -translate-y-1/2 left-0 w-full pointer-events-none z-50 overflow-hidden flex">
          <div className="animate-slide-across items-center justify-center bg-amber-500 text-zinc-950 px-8 py-4 rounded-2xl font-black text-4xl sm:text-6xl uppercase tracking-wider shadow-[0_0_50px_rgba(245,158,11,0.5)] border-4 border-amber-300 whitespace-nowrap shrink-0">
            {breakingNews}
          </div>
        </div>
      )}
      {isSponserActive && (
        <div className="bg-emerald-600 text-white px-4 py-3 shadow-lg border-b border-emerald-500 animate-pulse transition-all relative z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5 text-yellow-300 shrink-0" />
            <span className="font-extrabold text-base sm:text-xl tracking-wide uppercase">
              OFFICIAL SPONSOR SPOTLIGHT
            </span>
            <span className="ml-2 text-xs font-mono font-bold bg-black/40 px-2.5 py-0.5 rounded border border-white/10 text-yellow-300">
              {sponsersDuration}s
            </span>
          </div>
        </div>)}
      {/* Sliding Image Overlay (Active during Breaking News) */}
      {isNewsActive && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg border-b border-red-500 animate-pulse transition-all relative z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
            <Megaphone className="w-5 h-5 text-yellow-300 shrink-0" />
            <span className="font-extrabold text-base sm:text-xl tracking-wide uppercase">
              Live tournament update!!
            </span>
            <span className="ml-2 text-xs font-mono font-bold bg-black/40 px-2.5 py-0.5 rounded border border-white/10 text-yellow-300">
              {newsDuration}s
            </span>
          </div>
        </div>
      )}

      <AppBar onOpenDrawer={() => setIsDrawerOpen(true)} />
      <Sidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Page Content View */}
      <main className="flex-1 p-6 items-center justify-center w-full">
        <Outlet />
      </main>
    </div>
  );
};