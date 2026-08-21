import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Camera, Sun, Moon, Menu, X, LogOut, LayoutDashboard, User, Bell, BellRing, CheckCheck, Check, Trash2, ChevronDown, History, Building2, Info, Trophy, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { getBackendUrl } from '../utils/url';

export default function Navbar() {
  const { user, logout, refreshUser, apiFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [currentReminderIdx, setCurrentReminderIdx] = useState(0);
  const [dismissedRemindersSession, setDismissedRemindersSession] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If event.target was unmounted during click (e.g. notification item deleted), ignore
      if (event.target && !document.body.contains(event.target)) {
        return;
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll detection — used to reveal logo + white navbar on landing page
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (refreshUser) refreshUser();
    }, 10000);
    return () => clearInterval(interval);
  }, [user, refreshUser]);

  const unreadNotifs = user?.notifications ? user.notifications.filter(n => !n.isRead) : [];
  const unreadCount = unreadNotifs.length;

  // Automatically trigger Reminder Modal Popup on login when new/unread reminders exist
  useEffect(() => {
    if (!user) {
      setShowReminderPopup(false);
      return;
    }
    const timer = setTimeout(() => {
      if (unreadNotifs.length > 0 && !dismissedRemindersSession) {
        setShowReminderPopup(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [user?._id, unreadNotifs.length, dismissedRemindersSession]);

  const markAsRead = async (notifId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const idParam = typeof notifId === 'object' ? (notifId._id || notifId.toString()) : notifId;
      await apiFetch(`/api/auth/notifications/${idParam}/read`, { method: 'POST' });
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Failed to mark notification as read:", err.message);
    }
  };

  const markAllAsRead = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await apiFetch('/api/auth/notifications/read-all', { method: 'POST' });
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Failed to mark all as read:", err.message);
    }
  };

  const deleteNotif = async (notifId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const idParam = typeof notifId === 'object' ? (notifId._id || notifId.toString()) : notifId;
      await apiFetch(`/api/auth/notifications/${idParam}`, { method: 'DELETE' });
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Failed to delete notification:", err.message);
    }
  };

  const deleteAllNotifs = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await apiFetch('/api/auth/notifications/all', { method: 'DELETE' });
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Failed to delete all notifications:", err.message);
    }
  };

  const renderNotificationBell = () => {
    if (!user) return null;
    const isDashboardPage = ['/dashboard', '/admin', '/judge', '/profile'].includes(location.pathname);
    if (!isDashboardPage) return null;
    return (
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowProfileDropdown(false);
          }}
          className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold px-1 select-none">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-70 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-xs">Notifications</h4>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={markAllAsRead}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCheck size={12} />
                    Mark all as read
                  </button>
                )}
                {user?.notifications && user.notifications.length > 0 && (
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={deleteAllNotifs}
                    className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="delete all"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {user.notifications && user.notifications.length > 0 ? (
                [...user.notifications].reverse().map((notif, idx) => {
                  const realIdx = user.notifications.length - 1 - idx;
                  const targetId = notif._id ? (typeof notif._id === 'object' ? (notif._id._id || notif._id.toString()) : notif._id) : realIdx;
                  return (
                    <div
                      key={targetId || idx}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => !notif.isRead && markAsRead(targetId, e)}
                      className={`p-4 text-left transition-colors cursor-pointer flex gap-3 ${
                        notif.isRead
                          ? 'bg-transparent text-slate-500 dark:text-slate-400'
                          : 'bg-indigo-50/40 dark:bg-indigo-950/10 text-slate-900 dark:text-slate-200 font-medium'
                      } hover:bg-slate-50 dark:hover:bg-slate-850`}
                    >
                      <div className="grow text-xs leading-relaxed">
                        <p>{notif.message}</p>
                        <span className="text-[9px] text-slate-400 block mt-1">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1 items-center shrink-0 self-start">
                        {!notif.isRead && (
                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => markAsRead(targetId, e)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-slate-850"
                            title="Dismiss (Mark read)"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => deleteNotif(targetId, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-slate-855"
                          title="Delete Notification"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                  No notifications yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleAdminClick = () => {
    if (user && (user.role === 'Participant' || user.role === 'Judge')) {
      logout();
    }
  };

  const handleJudgeClick = () => {
    if (user && user.role === 'Participant') {
      logout();
    }
  };

  const isActive = (path) => location.pathname === path;
  const isLandingPage = location.pathname === '/';

  // Link color helper — Light buttons when scrolled (Active button has distinct indigo highlight), white text on hero
  const navLinkClass = (path) =>
    `text-sm font-medium transition-all rounded-lg cursor-pointer ${
      onHero
        ? isActive(path)
          ? 'text-white font-semibold underline underline-offset-4 px-1 py-1'
          : 'text-white/90 hover:text-white px-1 py-1'
        : isActive(path)
          ? 'bg-indigo-600 text-white font-semibold shadow-xs border border-indigo-700 px-3.5 py-1.5'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 border border-slate-200/80 px-3.5 py-1.5'
    }`;

  // Position: fixed on top for all pages when scrolling
  const navPosition = 'fixed top-0 left-0 right-0 w-full';

  // On landing: transparent at top, solid white once scrolled
  const navBg = isLandingPage
    ? scrolled
      ? 'bg-white dark:bg-slate-900 shadow-md border-b border-slate-200 dark:border-slate-800'
      : 'bg-transparent border-b border-transparent'
    : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-md';

  // Link colors: on landing-at-top → white; on landing-scrolled or other pages → normal
  const onHero = isLandingPage && !scrolled;

  return (
    <nav className={`${navPosition} z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 transition-all duration-300">
          {/* Logo / User Info Left Section */}
          <div className="flex items-center">
            {onHero ? (
              user ? (
                <div className="flex items-center gap-3 animate-in fade-in duration-200">
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-md">
                    {user.avatar ? (
                      <img
                        src={getBackendUrl(user.avatar)}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      user.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="flex flex-col text-left leading-tight shrink-0">
                    <span className="text-sm font-black text-white drop-shadow-xs whitespace-nowrap">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-widest whitespace-nowrap">
                      {user.role}
                    </span>
                  </div>
                </div>
              ) : null
            ) : (
              <Link
                to="/"
                className="flex items-center gap-2 group"
              >
                <img
                  src="/sumbacontest.jpg"
                  alt="SumbaContest Logo"
                  className="h-9 sm:h-11 md:h-12 max-h-10 md:max-h-12 w-auto object-contain rounded-md transition-transform group-hover:scale-102"
                />
              </Link>
            )}
          </div>

          {/* Desktop Nav */}
          <div className={`hidden md:flex items-center ${onHero ? 'justify-center gap-8 sm:gap-10 w-full' : 'gap-3'}`}>
            <Link to="/info" className={`flex items-center gap-1.5 ${navLinkClass('/info')}`}>
              <Info size={16} />
              <span>Event Info</span>
            </Link>

            <Link to="/gallery" className={`flex items-center gap-1.5 ${navLinkClass('/gallery')}`}>
              <Trophy size={16} />
              <span>Gallery &amp; Results</span>
            </Link>

            {!user && (
              <Link to="/admin" state={{ forceAdmin: true }} onClick={handleAdminClick} className={`flex items-center gap-1.5 ${navLinkClass('/admin')}`}>
                <ShieldCheck size={16} />
                <span>Admin Portal</span>
              </Link>
            )}

            {(!user || user.role === 'Admin') && (
              <Link to="/judge" state={{ forceJudge: true }} onClick={handleJudgeClick} className={`flex items-center gap-1.5 ${navLinkClass('/judge')}`}>
                <Award size={16} />
                <span>Judges Portal</span>
              </Link>
            )}
            
            {user && (
              <>
                <Link
                  to={user.role === 'Admin' ? '/admin' : user.role === 'Judge' ? '/judge' : '/dashboard'}
                  className={`flex items-center gap-1.5 ${navLinkClass(user.role === 'Admin' ? '/admin' : user.role === 'Judge' ? '/judge' : '/dashboard')}`}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
                {onHero && (
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-1.5 ${navLinkClass('')}`}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                )}
              </>
            )}

            {/* Auth Buttons — Hidden on hero page load, revealed on scroll or inner pages */}
            {!onHero && (
              user ? (
                <div className="flex items-center gap-3 ml-2">
                  {renderNotificationBell()}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center gap-2 text-xs font-medium py-1.5 px-3 rounded-lg transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-300 text-white flex items-center justify-center font-medium text-[11px] shrink-0 shadow-xs overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={getBackendUrl(user.avatar)}
                            alt={user.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          user.name ? user.name.charAt(0).toUpperCase() : 'U'
                        )}
                      </div>
                      <span>{user.name ? user.name.split(' ')[0] : 'User'}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-300 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={getBackendUrl(user.avatar)}
                                alt={user.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              user.name ? user.name.charAt(0).toUpperCase() : 'U'
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              if (user.role === 'Admin') {
                                navigate('/admin', { state: { tab: 'profile_settings' } });
                              } else if (user.role === 'Judge') {
                                navigate('/judge', { state: { tab: 'profile_settings' } });
                              } else {
                                navigate('/profile');
                              }
                            }}
                            className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <User size={15} className="text-indigo-600 dark:text-indigo-400" />
                            <span>Profile Settings</span>
                          </button>

                          {user.role === 'Admin' && (
                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                navigate('/admin', { state: { tab: 'event_history' } });
                              }}
                              className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <History size={15} className="text-indigo-600 dark:text-indigo-400" />
                              <span>All Events History</span>
                            </button>
                          )}

                          {(user.role === 'Admin' || user.role === 'Judge') && (
                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                if (user.role === 'Admin') {
                                  navigate('/admin', { state: { tab: 'notifications' } });
                                } else {
                                  navigate('/judge', { state: { tab: 'notifications' } });
                                }
                              }}
                              className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Bell size={15} className="text-indigo-600 dark:text-indigo-400" />
                              <span>Notifications</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 ml-2">
                  <Link
                    to="/login"
                    state={{ forceContestant: true }}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm px-4 py-1.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm px-4 py-1.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            {!isOpen && user && renderNotificationBell()}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 text-white rounded-b-none overflow-hidden">
          <div className="px-4 pt-3 pb-6 space-y-2 max-h-[85vh] overflow-y-auto">


            <Link
              to="/info"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                isActive('/info')
                  ? 'bg-indigo-300 text-white shadow-md'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Info size={16} />
              <span>Event Info</span>
            </Link>

            <Link
              to="/gallery"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                isActive('/gallery')
                  ? 'bg-indigo-300 text-white shadow-md'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Trophy size={16} />
              <span>Gallery &amp; Results</span>
            </Link>

            {!user && (
              <Link
                to="/admin"
                state={{ forceAdmin: true }}
                onClick={() => {
                  handleAdminClick();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive('/admin')
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Admin Portal</span>
              </Link>
            )}

            {(!user || user.role === 'Admin') && (
              <Link
                to="/judge"
                state={{ forceJudge: true }}
                onClick={() => {
                  handleJudgeClick();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive('/judge')
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Award size={16} />
                <span>Judges Portal</span>
              </Link>
            )}

            {user && user.role === 'Participant' && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive('/dashboard')
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>Dashboard</span>
              </Link>
            )}

            {user && user.role === 'Judge' && (
              <Link
                to="/judge"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive('/judge')
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>Dashboard</span>
              </Link>
            )}

            <div className="pt-3 mt-2 border-t border-slate-800/80">
              {user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (user.role === 'Admin') {
                        navigate('/admin', { state: { tab: 'profile_settings' } });
                      } else {
                        navigate('/profile');
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all text-left cursor-pointer"
                  >
                    <User size={18} className="text-indigo-400" />
                    <span>Profile Settings</span>
                  </button>

                  {user.role === 'Admin' && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/admin', { state: { tab: 'event_history' } });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all text-left cursor-pointer"
                    >
                      <History size={18} className="text-indigo-400" />
                      <span>All Events History</span>
                    </button>
                  )}

                  {user.role === 'Admin' && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/admin', { state: { tab: 'notifications' } });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all text-left cursor-pointer"
                    >
                      <Bell size={18} className="text-indigo-400" />
                      <span>Notifications</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    to="/login"
                    state={{ forceContestant: true }}
                    onClick={() => setIsOpen(false)}
                    className="text-center py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-center py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Participant Centered Notifications Modal Popup */}
      {showParticipantModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Bell className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="font-display font-black text-slate-900 dark:text-white text-base">My Notifications ({unreadCount} unread)</h3>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCheck size={14} />
                    Mark all as read
                  </button>
                )}
                {user?.notifications && user.notifications.length > 0 && (
                  <button
                    onClick={deleteAllNotifs}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    title="delete all"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  onClick={() => setShowParticipantModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Notifications list */}
            <div className="flex flex-col gap-3">
              {user?.notifications && user.notifications.length > 0 ? (
                [...user.notifications].reverse().map((notif, idx) => {
                  const realIdx = user.notifications.length - 1 - idx;
                  return (
                    <div
                      key={notif._id || idx}
                      className="border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-4 shadow-sm text-xs font-semibold"
                    >
                      <div className="flex items-center gap-3.5 grow text-left">
                        {/* Green Badge Icon */}
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <CheckCheck size={14} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-slate-700 dark:text-slate-200 text-[11px] leading-relaxed font-semibold">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : new Date().toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-3 shrink-0">
                        {!notif.isRead ? (
                          <button
                            onClick={(e) => markAsRead(notif._id || realIdx, e)}
                            className="text-slate-400 hover:text-slate-650 dark:text-slate-400 dark:hover:text-slate-250 font-black tracking-wider text-[10px] uppercase cursor-pointer py-1 px-2.5 rounded-lg transition-all"
                          >
                            DISMISS
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 font-extrabold tracking-wider text-[10px] uppercase select-none px-2">
                            READ
                          </span>
                        )}
                        <button
                          onClick={(e) => deleteNotif(notif._id || realIdx, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-400 text-xs italic">
                  No notifications found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════ AUTOMATIC REMINDER / NOTIFICATION POPUP ON LOGIN ═════════════════ */}
      {showReminderPopup && unreadNotifs.length > 0 && (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-amber-500/40 dark:border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200 relative overflow-hidden text-left">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-amber-500 via-orange-500 to-indigo-600" />
            
            {/* Ambient Corner Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Title + Unread Counter + Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                  <BellRing size={20} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">
                    New Reminder / Notification
                  </h3>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {unreadNotifs.length > 1 ? `Reminder ${currentReminderIdx + 1} of ${unreadNotifs.length}` : 'Attention Required'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReminderPopup(false);
                  setDismissedRemindersSession(true);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Reminder Popup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notification Card Details */}
            {(() => {
              const notif = unreadNotifs[currentReminderIdx] || unreadNotifs[0];
              if (!notif) return null;
              const notifId = notif._id || (user.notifications.length - 1 - currentReminderIdx);

              return (
                <div className="flex flex-col gap-4">
                  {/* Metadata Row: Sender & Date */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                        {(notif.senderName || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">
                          {notif.senderName || 'System Admin'}
                        </p>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                          From: {notif.senderRole || 'Admin'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>

                  {/* Event Title Badge (if available) */}
                  {notif.eventTitle && (
                    <div className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-2">
                      <Camera size={14} className="text-indigo-500 shrink-0" />
                      <span className="truncate">Event: {notif.eventTitle}</span>
                    </div>
                  )}

                  {/* Reminder Message Box */}
                  <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-medium">
                    {notif.message}
                  </div>

                  {/* Next / Previous Navigation if multiple unread */}
                  {unreadNotifs.length > 1 && (
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                      <button
                        onClick={() => setCurrentReminderIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentReminderIdx === 0}
                        className="text-indigo-600 hover:text-indigo-700 disabled:opacity-30 cursor-pointer font-bold"
                      >
                        ← Previous
                      </button>
                      <span>{currentReminderIdx + 1} / {unreadNotifs.length}</span>
                      <button
                        onClick={() => setCurrentReminderIdx(prev => Math.min(unreadNotifs.length - 1, prev + 1))}
                        disabled={currentReminderIdx >= unreadNotifs.length - 1}
                        className="text-indigo-600 hover:text-indigo-700 disabled:opacity-30 cursor-pointer font-bold"
                      >
                        Next →
                      </button>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setShowReminderPopup(false);
                        setDismissedRemindersSession(true);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Close
                    </button>

                    <button
                      onClick={async (e) => {
                        await markAsRead(notifId, e);
                        if (unreadNotifs.length <= 1) {
                          setShowReminderPopup(false);
                        } else {
                          setCurrentReminderIdx(0);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCheck size={14} />
                      Mark as Read
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </nav>
  );
}
