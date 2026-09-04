import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ScrollableTabs({ items, activeId, onSelect, className = "" }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto-scroll active tab into view when activeId changes
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeId]);

  return (
    <div className={`relative flex items-center w-full min-w-0 ${className}`}>
      {/* Left Scroll Arrow */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 z-10 mr-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Scroll Left"
        aria-label="Scroll Left"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Tabs Container */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((t) => {
          const isActive = activeId === t.id;
          const IconComponent = t.icon;
          return (
            <button
              key={t.id}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => onSelect(t.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {IconComponent && <IconComponent size={15} className={isActive ? 'text-white' : 'text-slate-400'} />}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Scroll Arrow */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 z-10 ml-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Scroll Right"
        aria-label="Scroll Right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
