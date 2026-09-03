import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Helper to scroll all scrollable viewports to top
  const performScrollToTop = useCallback((smooth = true) => {
    const behavior = smooth ? 'smooth' : 'instant';

    // 1. Standard window scroll
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior
      });
    } catch (e) {
      window.scrollTo(0, 0);
    }

    // 2. HTML & Body scroll
    if (document.documentElement) {
      try {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior });
      } catch (e) {
        document.documentElement.scrollTop = 0;
      }
    }
    if (document.body) {
      try {
        document.body.scrollTo({ top: 0, left: 0, behavior });
      } catch (e) {
        document.body.scrollTop = 0;
      }
    }

    // 3. Scroll all internal workspace containers (e.g. Admin, Judge, Participant dashboard main panes, tables, etc.)
    const scrollContainers = document.querySelectorAll('main, [data-scroll-container], .overflow-y-auto, .overflow-auto');
    scrollContainers.forEach((el) => {
      if (el && el.scrollTop > 0) {
        try {
          el.scrollTo({
            top: 0,
            left: 0,
            behavior
          });
        } catch (e) {
          el.scrollTop = 0;
        }
      }
    });
  }, []);

  // 1. Automatic smooth scroll to top whenever URL changes (pathname, search, or hash)
  useEffect(() => {
    performScrollToTop(true);
    const timer = setTimeout(() => {
      performScrollToTop(true);
    }, 80);
    return () => clearTimeout(timer);
  }, [pathname, search, hash, performScrollToTop]);

  // 2. Intercept clicks on links or buttons to ensure smooth scroll to top
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const targetElement = e.target.closest('a, button, [role="button"], [role="tab"], .nav-link, nav button');
      if (targetElement) {
        // Skip modal close buttons or small toggles that should not jump the viewport
        if (targetElement.getAttribute('aria-label') === 'Close' || targetElement.closest('.modal-content') || targetElement.closest('[role="dialog"]')) {
          return;
        }

        const href = targetElement.getAttribute('href');
        // If it is an external link, do not scroll
        if (href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'))) {
          return;
        }

        // Smooth scroll to top when clicking links, tabs, or navigation buttons
        setTimeout(() => {
          performScrollToTop(true);
        }, 50);
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => document.removeEventListener('click', handleGlobalClick, { capture: true });
  }, [performScrollToTop]);

  // 3. Monitor scroll position across window and dashboard main containers
  useEffect(() => {
    const checkScroll = () => {
      let scrolled = window.scrollY > 150 || (document.documentElement && document.documentElement.scrollTop > 150) || (document.body && document.body.scrollTop > 150);

      if (!scrolled) {
        const containers = document.querySelectorAll('main, [data-scroll-container], .overflow-y-auto');
        containers.forEach((el) => {
          if (el.scrollTop > 150) {
            scrolled = true;
          }
        });
      }

      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    document.addEventListener('scroll', checkScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener('scroll', checkScroll);
      document.removeEventListener('scroll', checkScroll, { capture: true });
    };
  }, []);

  const handleScrollToTopClick = () => {
    performScrollToTop(true);
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={handleScrollToTopClick}
          type="button"
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all duration-300 ease-out cursor-pointer flex items-center justify-center border-2 border-white/30 backdrop-blur-md animate-in fade-in zoom-in-75 duration-200 group"
          aria-label="Scroll to top"
          title="Scroll to top"
          data-tooltip="Scroll to top"
        >
          <ArrowUp size={22} className="stroke-[2.5] group-hover:-translate-y-1 transition-transform duration-200" />
        </button>
      )}
    </>
  );
}

