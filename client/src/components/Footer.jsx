import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 py-2 text-xs text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-medium">&copy; {new Date().getFullYear()} sumbaran Art Society. All rights reserved.</p>
      </div>
    </footer>
  );
}
