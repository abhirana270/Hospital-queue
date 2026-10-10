'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TopBar() {
  const [time, setTime] = useState<string>('');
  const [user, setUser] = useState<{ name: string; role: string }>({
    name: 'Administrator',
    role: 'admin',
  });

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hospital_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // default
    }
  }, []);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: System Status & Live Clock */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-semibold text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>5 C++ DSA Engines Online</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium text-slate-500 bg-slate-100/70 px-3 py-1 rounded-full border border-slate-200/60">
          <span>🕒</span>
          <span>{time || '--:--:--'}</span>
        </div>
      </div>

      {/* Right: Emergency Hotline & User Badge */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/70 px-3 py-1 rounded-full">
          <span className="animate-pulse">🚨</span>
          <span>ER Trauma Hotline: <strong className="font-mono">Ext. 911</strong></span>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 hover:border-sky-300 hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
        >
          <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
            {user.role === 'admin' ? 'A' : user.role === 'doctor' ? 'D' : 'R'}
          </span>
          <span className="truncate max-w-[120px]">{user.name}</span>
        </Link>
      </div>
    </header>
  );
}
