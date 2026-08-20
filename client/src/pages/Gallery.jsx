import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Search, Filter, Award, Sparkles, X, Maximize2, ShieldCheck, HelpCircle, Flag, MessageSquare, AlertTriangle, Trophy, Eye, Download, Lock, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import WatermarkPreview from '../components/WatermarkPreview';
import { getBackendUrl } from '../utils/url';

const formatExifBrandModel = (brand, model) => {
  const isInvalid = (str) => !str || str.trim() === '' || str.trim().toUpperCase() === 'UNKNOWN' || str.trim().toUpperCase() === 'N/A';
  const cleanBrand = isInvalid(brand) ? '' : brand.trim();
  const cleanModel = isInvalid(model) ? '' : model.trim();

  if (cleanBrand && cleanModel) return `${cleanBrand} ${cleanModel}`;
  if (cleanBrand) return cleanBrand;
  if (cleanModel) return cleanModel;
  return 'N/A';
};

export default function Gallery() {
  const { apiFetch, user, loading: authLoading } = useAuth();

  const [certAlertMsg, setCertAlertMsg] = useState(null);

  const handleShowCertificateAlert = (type) => {
    setCertAlertMsg(
      `This is a preview of your ${type === 'Champion' ? 'Champion' : 'Participation'} Certificate. The official printed certificate can only be collected from the event office or the designated exhibition/gallery after the competition. Digital download is not available.`
    );
  };

  const [eventsList, setEventsList] = useState([]);
  const [photographs, setPhotographs] = useState([]);
  const [categories, setCategories] = useState([]);

  // Accordion state & Per-event tab / filter states
  const [openEventIds, setOpenEventIds] = useState(new Set());
  const [eventTabs, setEventTabs] = useState({});
  const [eventSearches, setEventSearches] = useState({});
  const [eventCategories, setEventCategories] = useState({});
  const [eventParticipants, setEventParticipants] = useState({});

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        // Fetch all events
        const eData = await apiFetch('/api/events');
        if (eData.success && eData.events.length > 0) {
          setEventsList(eData.events);
          // Keep all panels closed by default when page loads
          setOpenEventIds(new Set());
        }

        // Fetch categories
        const cData = await apiFetch('/api/categories');
        if (cData.success) setCategories(cData.categories);

        // Fetch approved gallery photos
        const pData = await apiFetch('/api/submissions/gallery');
        if (pData.success) setPhotographs(pData.photographs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleryData();
  }, []);

  const toggleEventOpen = (eventId) => {
    setOpenEventIds(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.clear();
        next.add(eventId);
      }
      return next;
    });
  };

  const getEventTab = (ev) => {
    if (eventTabs[ev._id]) return eventTabs[ev._id];
    return ev.winnersPublished ? 'winners' : 'gallery';
  };

  const setEventTab = (eventId, tabName) => {
    setEventTabs(prev => ({ ...prev, [eventId]: tabName }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100/90 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Camera className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
          Loading Exhibition...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-100/90 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200">
      
      {/* ══════════════════════════ PAGE HEADER with event-bg.jpg (Identical to EventInfo.jsx) ══════════════ */}
      <section className="text-white py-10 relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/event-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 z-10 bg-slate-900/75" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #818cf8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-5">
          <h1 className="font-display font-black text-4xl sm:text-5xl leading-tight tracking-tight">
            Gallery &amp; Exhibition
            <br />
            <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Results Showcase
            </span>
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            Explore event-wise approved photography &amp; video submissions, winner leaderboards, exhibition highlights, and official competition scorecards across all Sumbaran Art Society events.
          </p>

        </div>
      </section>

      {/* ══════════════════════════ MAIN CONTENT (Container) ══════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* EVENT ACCORDION PANELS */}
        {eventsList.length === 0 ? (
          <div className="text-center text-slate-400 py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <Camera size={36} className="mx-auto mb-2 text-slate-350" />
            <p className="text-sm font-semibold">No events found.</p>
          </div>
        ) : (
          <div id="events-accordion" className="flex flex-col gap-5">
            {eventsList.map(ev => {
              const isOpen = openEventIds.has(ev._id);
              const activeTab = getEventTab(ev);

              const evPhotos = photographs.filter(p => 
                (p.eventId && String(p.eventId) === String(ev._id)) ||
                (p.eventTitle && String(p.eventTitle).trim().toLowerCase() === String(ev.title).trim().toLowerCase())
              );

              const search = eventSearches[ev._id] || '';
              const catFilter = eventCategories[ev._id] || '';
              const partFilter = eventParticipants[ev._id] || '';

              const filteredPhotos = evPhotos.filter(p => {
                const matchesSearch = !search ? true : (
                  p.title?.toLowerCase().includes(search.toLowerCase()) ||
                  p.participantName?.toLowerCase().includes(search.toLowerCase()) ||
                  p.cameraModel?.toLowerCase().includes(search.toLowerCase()) ||
                  p.cameraBrand?.toLowerCase().includes(search.toLowerCase())
                );
                const matchesCategory = catFilter ? p.category === catFilter : true;
                const matchesParticipant = partFilter ? p.participantName === partFilter : true;
                return matchesSearch && matchesCategory && matchesParticipant;
              });

              const approvedPhotos = filteredPhotos.filter(p => p.scores && p.scores.length > 0 && p.scores.every(s => (s.approvalStatus || 'Approved') === 'Approved'));
              const disapprovedPhotos = filteredPhotos.filter(p => {
                const isDisapproved = p.scores && p.scores.some(s => s.approvalStatus === 'Disapproved');
                if (!isDisapproved) return false;
                if (user && user.role === 'Participant') {
                  return p.userId === user._id || p.participantEmail === user.email || p.userId === user.id;
                }
                return true;
              });

              const hasWinners = Boolean(ev.winnersPublished && ev.winners && ev.winners.length > 0);
              const showWinnersTab = !user || user.role !== 'Participant' || hasWinners;

              const isVideoEvent = ev.mediaType === 'video' || String(ev.eventType).toLowerCase().includes('video') || String(ev.eventType).toLowerCase().includes('reel');

              return (
                <div key={ev._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-all">
                  
                  {/* Collapsible Panel Header */}
                  <div
                    onClick={() => toggleEventOpen(ev._id)}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 sm:px-6 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors select-none"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                        {ev.title}
                      </h2>
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {isVideoEvent ? 'SHORT VIDEO & REELS CONTEST' : 'PHOTOGRAPHY CONTEST'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {ev.winnersPublished ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                          FINALIZED
                        </span>
                      ) : ev.status === 'Active' ? (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                          COMPLETED
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-bold">
                        ({evPhotos.length} Uploaded)
                      </span>
                      {isOpen ? (
                        <ChevronUp size={20} className="text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Collapsible Panel Body */}
                  {isOpen && (
                    <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 flex flex-col gap-6">
                      
                      {/* Sub-Navigation Tabs Bar */}
                      <div className="flex justify-center w-full">
                        <div className={`grid ${showWinnersTab ? 'grid-cols-3' : 'grid-cols-2'} bg-slate-200/70 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto sm:flex gap-1`}>
                          <button
                            onClick={() => setEventTab(ev._id, 'gallery')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                              activeTab === 'gallery'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            <Camera size={13} className="shrink-0" />
                            <span>Approved ({approvedPhotos.length})</span>
                          </button>

                          <button
                            onClick={() => setEventTab(ev._id, 'disapproved')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                              activeTab === 'disapproved'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            <Flag size={13} className="shrink-0" />
                            <span>Disapproved ({disapprovedPhotos.length})</span>
                          </button>

                          {showWinnersTab && (
                            <button
                              onClick={() => setEventTab(ev._id, 'winners')}
                              className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'winners'
                                  ? 'bg-amber-600 text-white shadow-md'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                              }`}
                            >
                              <Award size={13} className="shrink-0" />
                              <span>Winners</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sub-Filters Bar (Search, Category, Participant) */}
                      {activeTab !== 'winners' && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
                          <div className="relative w-full sm:max-w-xs">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={search}
                              onChange={(e) => setEventSearches(prev => ({ ...prev, [ev._id]: e.target.value }))}
                              placeholder="Search title, camera, photographer..."
                              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <select
                              value={partFilter}
                              onChange={(e) => setEventParticipants(prev => ({ ...prev, [ev._id]: e.target.value }))}
                              className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none font-semibold cursor-pointer"
                            >
                              <option value="">All Participants</option>
                              {[...new Set(evPhotos.map(p => p.participantName))].filter(Boolean).map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>

                            <select
                              value={catFilter}
                              onChange={(e) => setEventCategories(prev => ({ ...prev, [ev._id]: e.target.value }))}
                              className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none font-semibold cursor-pointer"
                            >
                              <option value="">All Categories</option>
                              {categories
                                .filter(c => !ev.eventType || (c.contestTypes && c.contestTypes.includes(ev.eventType)))
                                .map(c => (
                                  <option key={c._id} value={c.name}>{c.name}</option>
                                ))
                              }
                            </select>
                          </div>
                        </div>
                      )}

                      {/* TAB CONTENT: APPROVED */}
                      {activeTab === 'gallery' && (
                        <div>
                          {approvedPhotos.length === 0 ? (
                            <div className="text-center text-slate-400 py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                              <Camera size={32} className="mx-auto mb-2 text-slate-300" />
                              <p className="text-xs font-semibold">No approved submissions found for this contest.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {approvedPhotos.map(photo => (
                                <div
                                  key={photo.photoId}
                                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col group justify-between"
                                >
                                  <div className="relative overflow-hidden aspect-video bg-black flex items-center justify-center">
                                    {photo.mediaType === 'video' || photo.fileUrl?.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i) || photo.fileUrl?.includes('/video/upload/') ? (
                                      <video
                                        src={getBackendUrl(photo.fileUrl)}
                                        controls
                                        crossOrigin="anonymous"
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-contain"
                                      />
                                    ) : photo.fileUrl ? (
                                      <img
                                        src={getBackendUrl(photo.fileUrl)}
                                        alt={photo.title}
                                        crossOrigin="anonymous"
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
                                        No Preview
                                      </div>
                                    )}
                                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                                      <ShieldCheck size={10} className="fill-white/20" /> Approved
                                    </span>
                                    <button
                                      onClick={() => setSelectedPhoto(photo)}
                                      className="absolute top-3 right-3 p-1.5 bg-slate-950/60 hover:bg-slate-950 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                    >
                                      <Maximize2 size={14} />
                                    </button>
                                  </div>

                                  <div className="p-4 flex flex-col gap-3 justify-between grow">
                                    <div>
                                      <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                                          {photo.title}
                                        </h3>
                                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-bold text-slate-500 shrink-0">
                                          {photo.category}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                        By {photo.participantName}
                                      </p>
                                    </div>

                                    {/* Exif details footer */}
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center text-[9px] text-slate-450 uppercase tracking-wider font-bold">
                                      <span>{formatExifBrandModel(photo.cameraBrand, photo.cameraModel)}</span>
                                      <button
                                        onClick={() => setSelectedPhoto(photo)}
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                      >
                                        View Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB CONTENT: DISAPPROVED */}
                      {activeTab === 'disapproved' && (
                        <div>
                          {disapprovedPhotos.length === 0 ? (
                            <div className="text-center text-slate-400 py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                              <Flag size={32} className="mx-auto mb-2 text-slate-300" />
                              <p className="text-xs font-semibold">No disapproved submissions for this contest.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {disapprovedPhotos.map(photo => {
                                const disapprovals = photo.scores?.filter(s => s.approvalStatus === 'Disapproved') || [];
                                return (
                                  <div
                                    key={photo.photoId}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col group justify-between"
                                  >
                                    <div className="relative overflow-hidden aspect-video bg-black flex items-center justify-center">
                                      {photo.mediaType === 'video' || photo.fileUrl?.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i) || photo.fileUrl?.includes('/video/upload/') ? (
                                        <video
                                          src={getBackendUrl(photo.fileUrl)}
                                          autoPlay
                                          loop
                                          muted
                                          playsInline
                                          controls
                                          crossOrigin="anonymous"
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover opacity-80"
                                        />
                                      ) : photo.fileUrl ? (
                                        <img
                                          src={getBackendUrl(photo.fileUrl)}
                                          alt={photo.title}
                                          crossOrigin="anonymous"
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
                                          No Preview
                                        </div>
                                      )}
                                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                                        <Flag size={9} className="fill-white" /> Disapproved
                                      </span>
                                      <button
                                        onClick={() => setSelectedPhoto(photo)}
                                        className="absolute top-3 right-3 p-1.5 bg-slate-950/60 hover:bg-slate-950 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                      >
                                        <Maximize2 size={14} />
                                      </button>
                                    </div>

                                    <div className="p-4 flex flex-col gap-3 justify-between grow">
                                      <div>
                                        <div className="flex justify-between items-start gap-2">
                                          <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                                            {photo.title}
                                          </h3>
                                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-bold text-slate-500 shrink-0">
                                            {photo.category}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                          By {photo.participantName}
                                        </p>

                                        {/* Disapproval reasons */}
                                        <div className="mt-2 pt-2 border-t border-red-200/40 dark:border-red-900/20 text-[10px] bg-red-50/50 dark:bg-red-950/10 p-2.5 rounded-lg border">
                                          <span className="font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1">
                                            ⚠️ Entry Disapproved by Judge
                                          </span>
                                          <div className="flex flex-col gap-1.5 mt-1 text-slate-650 dark:text-slate-400">
                                            {disapprovals.map((s, idx) => (
                                              <div key={idx} className="border-t border-red-100/30 dark:border-red-900/10 pt-1.5 first:border-0 first:pt-0">
                                                <span className="font-bold text-[9px] text-slate-500 uppercase tracking-wider block">Explanation Remarks ({s.judgeName || 'Panel Judge'}):</span>
                                                <p className="italic mt-0.5">"{s.remarks || 'No remarks provided.'}"</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Exif details footer */}
                                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center text-[9px] text-slate-450 uppercase tracking-wider font-bold">
                                        <span>{formatExifBrandModel(photo.cameraBrand, photo.cameraModel)}</span>
                                        <button
                                          onClick={() => setSelectedPhoto(photo)}
                                          className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                        >
                                          View Details
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB CONTENT: WINNERS */}
                      {activeTab === 'winners' && (
                        <div>
                          {!ev.winnersPublished || !ev.winners || ev.winners.length === 0 ? (
                            <div className="text-center text-slate-400 py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                              <Award size={32} className="mx-auto mb-2 text-slate-350 animate-bounce" />
                              <p className="text-xs font-semibold">Rankings pending publication for {ev.title}.</p>
                              <p className="text-[11px] text-slate-500 mt-1">Judges are currently grading the entries. Winners will be declared shortly.</p>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-6">
                              {ev.winners.map((w, idx) => {
                                const isFirst = w.rank.toLowerCase().includes('1st') || w.rank.toLowerCase().includes('first');
                                const isSecond = w.rank.toLowerCase().includes('2nd') || w.rank.toLowerCase().includes('second');

                                const trophyColor = isFirst ? 'text-amber-500' : isSecond ? 'text-slate-400' : 'text-amber-700';
                                const badgeBg = isFirst ? 'bg-amber-500/10 text-amber-600' : isSecond ? 'bg-slate-300/20 text-slate-600 dark:text-slate-400' : 'bg-amber-700/10 text-amber-800 dark:text-amber-600';
                                const cardBorder = isFirst ? 'border-amber-500/40 bg-amber-500/5' : isSecond ? 'border-slate-300 dark:border-slate-700' : 'border-amber-750/30';

                                const certTemplateName = isFirst ? '1st-Prize.png' : isSecond ? '2nd-Prize.png' : '3rd-Prize.png';
                                const customCertUrl = isFirst ? ev?.certificates?.firstPrize : isSecond ? ev?.certificates?.secondPrize : ev?.certificates?.thirdPrize;
                                const certImgSrc = getBackendUrl(customCertUrl || w.certificateImageUrl || `/${certTemplateName}`);

                                const matchedPhoto = photographs.find(p => p.photoId === w.photoId || p.photoId === w.photographId || String(p.photoId) === String(w.photoId));
                                const winnerMediaUrl = w.fileUrl || matchedPhoto?.fileUrl || '';
                                const isVideo = ev.mediaType === 'video' ||
                                                String(ev.eventType || '').toLowerCase().includes('video') ||
                                                String(ev.eventType || '').toLowerCase().includes('reel') ||
                                                w.mediaType === 'video' ||
                                                matchedPhoto?.mediaType === 'video' ||
                                                winnerMediaUrl.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i) ||
                                                winnerMediaUrl.includes('/video/upload/');

                                const badgeText = isVideo ? 'WINNING VIDEO / REELS' : 'WINNING FRAME';

                                return (
                                  <div
                                    key={idx}
                                    className={`flex flex-col lg:flex-row items-center gap-6 p-6 bg-white dark:bg-slate-900 border rounded-3xl shadow-md transition-all hover:shadow-lg ${cardBorder}`}
                                  >
                                    {/* Left: Winner Media Display */}
                                    <div className="relative group shrink-0 w-full lg:w-64 aspect-video overflow-hidden rounded-2xl bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                                      {winnerMediaUrl ? (
                                        isVideo ? (
                                          <video
                                            src={getBackendUrl(winnerMediaUrl)}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            controls
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          />
                                        ) : (
                                          <img
                                            src={getBackendUrl(winnerMediaUrl)}
                                            alt={w.photoTitle}
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          />
                                        )
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs font-semibold">
                                          {isVideo ? 'No Video Preview' : 'No Photo Preview'}
                                        </div>
                                      )}
                                      <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/75 backdrop-blur-sm rounded-lg text-[9px] text-white font-extrabold uppercase z-10 shadow-md">
                                        {badgeText}
                                      </div>
                                    </div>

                                    {/* Middle: Winner details */}
                                    <div className="flex-1 flex flex-col justify-between gap-4 text-left w-full">
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${badgeBg}`}>
                                            <Trophy size={11} className={trophyColor} />
                                            {w.rank}
                                          </span>
                                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                            Final Score: {w.score}/10
                                          </span>
                                        </div>

                                        <h3 className="font-display font-black text-xl text-slate-900 dark:text-white leading-snug">
                                          {w.photoTitle}
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-1">
                                          <div>
                                            <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Champion Artist</p>
                                            <p className="mt-0.5 text-slate-850 dark:text-slate-200 font-extrabold text-sm">{w.userName}</p>
                                            {w.userEmail && <p className="text-[10px] text-slate-400 mt-0.5">{w.userEmail}</p>}
                                          </div>
                                          <div>
                                            <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Reward & Accolades</p>
                                            <p className="mt-0.5 text-indigo-600 dark:text-indigo-400 font-bold">{w.prizeAmount || (isFirst ? '₹50,000' : isSecond ? '₹30,000' : '₹20,000')} Cash</p>
                                            <p className="text-[10px] text-slate-455 mt-0.5">Includes Winner Trophy & Certificate</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right: Certificate Preview and Action Buttons */}
                                    <div className="shrink-0 w-full lg:w-44 flex flex-col gap-3 items-center border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800/60 pt-4 lg:pt-0 lg:pl-6">
                                      <div
                                        className="relative group w-28 aspect-[1/1.414] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer select-none"
                                        onClick={() => handleShowCertificateAlert('Champion')}
                                      >
                                        <img
                                          src={certImgSrc}
                                          alt="Certificate Preview"
                                          crossOrigin="anonymous"
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover filter blur-[0.3px] pointer-events-none select-none"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `/${certTemplateName}`;
                                          }}
                                          onContextMenu={e => e.preventDefault()}
                                        />
                                        <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center p-1 pointer-events-none">
                                          <div className="text-[5.5px] leading-tight font-black text-red-600/45 dark:text-red-500/35 uppercase tracking-tighter text-center select-none rotate-[-25deg] border border-dashed border-red-600/30 bg-white/80 px-1 py-0.5 rounded shadow-sm">
                                            SAMPLE CERTIFICATE
                                            <br />
                                            NOT VALID FOR
                                            <br />
                                            PRINT OR DOWNLOAD
                                          </div>
                                        </div>
                                      </div>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Certificate Preview</span>

                                      <div className="flex flex-col gap-1.5 w-full mt-1">
                                        <button
                                          type="button"
                                          onClick={() => handleShowCertificateAlert('Champion')}
                                          className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                                        >
                                          <Eye size={12} />
                                          View Preview (Locked)
                                        </button>
                                        <button
                                          onClick={() => handleShowCertificateAlert('Champion')}
                                          className="w-full py-1.5 px-3 bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 text-slate-400 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer text-center"
                                          type="button"
                                        >
                                          <Lock size={12} />
                                          Download PDF
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* DETAIL MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-950/60 hover:bg-slate-950 text-white rounded-full cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 bg-slate-950 flex items-center justify-center relative p-3 min-h-80 lg:min-h-120">
                {selectedPhoto.mediaType === 'video' || selectedPhoto.fileUrl?.match(/\.(mp4|mov|webm|avi|mkv)$/i) || selectedPhoto.fileUrl?.includes('/video/upload/') ? (
                  <video 
                    src={getBackendUrl(selectedPhoto.fileUrl)} 
                    controls 
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    preload="metadata"
                    className="w-full h-full max-h-[70vh] object-contain rounded-xl" 
                  />
                ) : (
                  <WatermarkPreview 
                    src={getBackendUrl(selectedPhoto.fileUrl)} 
                    enableZoom={true}
                    className="w-full h-full max-h-[70vh] object-contain rounded-xl" 
                  />
                )}
              </div>
              <div className="lg:col-span-4 p-6 flex flex-col justify-between text-xs max-h-[70vh] overflow-y-auto">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">{selectedPhoto.title}</h3>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2 py-0.5 rounded font-bold text-[9px] inline-block mt-1">
                      {selectedPhoto.category}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Photographer</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-250">{selectedPhoto.participantName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</span>
                    <p className="text-slate-500 leading-relaxed mt-0.5">{selectedPhoto.description || 'No description shared.'}</p>
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">EXIF Capture Info</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                      <div>
                        <span>Brand:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250 font-sans">{!selectedPhoto.cameraBrand || selectedPhoto.cameraBrand.toUpperCase() === 'UNKNOWN' ? 'N/A' : selectedPhoto.cameraBrand}</p>
                      </div>
                      <div>
                        <span>Model:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250 font-sans">{!selectedPhoto.cameraModel || selectedPhoto.cameraModel.toUpperCase() === 'UNKNOWN' ? 'N/A' : selectedPhoto.cameraModel}</p>
                      </div>
                      <div>
                        <span>Lens:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250 truncate">{selectedPhoto.lensUsed || 'N/A'}</p>
                      </div>
                      <div>
                        <span>Capture Date:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250">{selectedPhoto.dateCaptured ? new Date(selectedPhoto.dateCaptured).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-6">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck size={16} className="text-indigo-650" />
                    <span>EXIF Audited DSLR Capture</span>
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-xl shadow cursor-pointer text-xs"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Certificate Preview Alert Modal */}
      {certAlertMsg && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-indigo-500/20 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="flex flex-col gap-2 items-center">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl mb-2">
                <Lock size={28} className="animate-pulse" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white uppercase tracking-wider">
                Reference Preview Only
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                {certAlertMsg}
              </p>
            </div>
            <button
              onClick={() => setCertAlertMsg(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              Got It
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
