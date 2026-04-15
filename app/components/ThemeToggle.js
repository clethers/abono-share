'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('abonoshare_dark_mode') === 'true';
    setDark(saved);
    document.documentElement.classList.toggle('dark', saved);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('abonoshare_dark_mode', next);
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F4F7F9] dark:bg-white/10 border border-[#E2E8F0] dark:border-white/10 text-[#6C727A] dark:text-[#94A3B8] hover:text-[#1A1C1E] dark:hover:text-white transition-all"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
    </button>
  );
}
