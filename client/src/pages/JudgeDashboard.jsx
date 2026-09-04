import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, ShieldAlert, Award, Star, CheckCircle2, ChevronRight, X, Check, 
  AlertTriangle, Clock, XCircle, ListChecks, History, Calendar, 
  Send, Bell, Trash2, Users, UserCheck, Search, Megaphone, Eye, 
  TrendingUp, Palette, LayoutDashboard, FileText, Sparkles, Filter, 
  SlidersHorizontal, ArrowUpRight, Trophy, Play, Image as ImageIcon, Menu, LogOut
} from 'lucide-react';
import WatermarkPreview from '../components/WatermarkPreview';
import { getBackendUrl } from '../utils/url';

function ParticipantAvatar({ avatar, name, className = "w-7 h-7 text-[11px]", bg = "bg-indigo-600" }) {
  const [imgError, setImgError] = useState(false);
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';
  const hasAvatarUrl = Boolean(avatar && typeof avatar === 'string' && avatar.trim() !== '' && avatar !== 'null' && avatar !== 'undefined');

  return (
    <div className={`${className} rounded-full ${bg} text-white font-black flex items-center justify-center shrink-0 overflow-hidden shadow-2xs relative`}>
      {hasAvatarUrl && !imgError ? (
        <img
          src={getBackendUrl(avatar)}
          alt={name || 'Participant'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="select-none font-extrabold">{initial}</span>
      )}
    </div>
  );
}

export default function JudgeDashboard() {
  const { apiFetch, user, updateProfile, refreshUser, logout } = useAuth();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [event, setEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [photographs, setPhotographs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Grading Form State
  const [activePhoto, setActivePhoto] = useState(null);
  const [offlineZoomPhoto, setOfflineZoomPhoto] = useState(null);
  const [creativity, setCreativity] = useState(5);
  const [composition, setComposition] = useState(5);
  const [technicalQuality, setTechnicalQuality] = useState(5);
  const [storytelling, setStorytelling] = useState(5);
  const [overallImpact, setOverallImpact] = useState(5);
  const [remarks, setRemarks] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Approved');

  const [offlineAverageScore, setOfflineAverageScore] = useState(5);
  const [offlineRemarks, setOfflineRemarks] = useState('');
  const [offlineApprovalStatus, setOfflineApprovalStatus] = useState('Approved');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('all');
  const [filterGradingStatus, setFilterGradingStatus] = useState('all');
  const [evaluationMode, setEvaluationMode] = useState('online'); // 'online' or 'offline'
  const [offlineScores, setOfflineScores] = useState({});
  const [judgeDashboardTab, setJudgeDashboardTab] = useState('overview');
  const [allPhotographsByEvent, setAllPhotographsByEvent] = useState({});
  const [historySelectedEventId, setHistorySelectedEventId] = useState('');
  const [userSelectedEventId, setUserSelectedEventId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [showSignedOffBlockModal, setShowSignedOffBlockModal] = useState(false);
  const [showJudgeAlertModal, setShowJudgeAlertModal] = useState(false);
  const [showTopParticipantsModal, setShowTopParticipantsModal] = useState(false);
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');
  const [readOnlyModalPhoto, setReadOnlyModalPhoto] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalEvent, setStatusModalEvent] = useState(null);

  useEffect(() => {
    if (events.length > 0) {
      const closedDeadlineEvents = events.filter(e => {
        const isPastDeadline = e.deadline && new Date() >= new Date(e.deadline);
        const isSignedOff = e.gradingConfirmed || (e.confirmedJudges && (e.confirmedJudges.includes(user?.id) || e.confirmedJudges.includes(user?._id)));
        return isPastDeadline && !isSignedOff;
      });
      if (closedDeadlineEvents.length > 0) {
        const timer = setTimeout(() => {
          setShowJudgeAlertModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [events.length, user]);

  // Broadcast Notification State
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRecipient, setBroadcastRecipient] = useState('Participant');
  const [broadcastEventId, setBroadcastEventId] = useState('');
  const [broadcastParticipantId, setBroadcastParticipantId] = useState('');
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);

  const triggerSuccess = (title, message) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  // Profile Settings State
  const [judgeProfileName, setJudgeProfileName] = useState(user?.name || '');
  const [judgeProfileEmail, setJudgeProfileEmail] = useState(user?.email || '');
  const [judgeProfileMobile, setJudgeProfileMobile] = useState(user?.mobile || '');
  const [judgeProfilePassword, setJudgeProfilePassword] = useState('');
  const [judgeProfileConfirmPassword, setJudgeProfileConfirmPassword] = useState('');
  const [judgeProfileError, setJudgeProfileError] = useState('');
  const [judgeProfileSubmitting, setJudgeProfileSubmitting] = useState(false);
  const [uploadingJudgeAvatar, setUploadingJudgeAvatar] = useState(false);
  const profilePhotoInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setJudgeProfileName(user.name || '');
      setJudgeProfileEmail(user.email || '');
      setJudgeProfileMobile(user.mobile || '');
    }
  }, [user]);

  const handleJudgeAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setJudgeProfileError('Profile photo must be less than 5 MB.');
      return;
    }

    setUploadingJudgeAvatar(true);
    setJudgeProfileError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const data = await apiFetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData
      });

      if (data.success) {
        if (refreshUser) await refreshUser();
        triggerSuccess('Photo Updated', 'Your profile photo has been updated successfully!');
      }
    } catch (err) {
      setJudgeProfileError(err.message || 'Failed to upload profile photo');
    } finally {
      setUploadingJudgeAvatar(false);
    }
  };

  const handleJudgeMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setJudgeProfileMobile(val);
  };

  const handleUpdateJudgeProfile = async (e) => {
    e.preventDefault();
    setJudgeProfileError('');
    setJudgeProfileSubmitting(true);

    if (judgeProfileMobile.replace(/\D/g, '').length !== 10) {
      setJudgeProfileError('Mobile number must be exactly 10 digits');
      setJudgeProfileSubmitting(false);
      return;
    }

    if (judgeProfilePassword && judgeProfilePassword !== judgeProfileConfirmPassword) {
      setJudgeProfileError('Passwords do not match');
      setJudgeProfileSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: judgeProfileName,
        mobile: judgeProfileMobile
      };
      if (judgeProfilePassword) {
        payload.password = judgeProfilePassword;
      }
      const data = await updateProfile(payload);
      if (data.success) {
        setJudgeProfilePassword('');
        setJudgeProfileConfirmPassword('');
        triggerSuccess('Profile Updated', 'Your jury profile settings have been successfully updated.');
      }
    } catch (err) {
      setJudgeProfileError(err.message || 'Failed to update profile settings');
    } finally {
      setJudgeProfileSubmitting(false);
    }
  };

  useEffect(() => {
    if (location.state?.tab) {
      setJudgeDashboardTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (judgeDashboardTab === 'notifications') {
      fetchBroadcasts();
    }
  }, [judgeDashboardTab]);

  const fetchBroadcasts = async () => {
    try {
      const data = await apiFetch('/api/judges/broadcasts');
      if (data.success) {
        setBroadcasts(data.broadcasts || []);
      }
    } catch (err) {
      console.error('Failed to fetch judge broadcasts:', err.message);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage || !broadcastMessage.trim()) {
      triggerSuccess('Missing Message', 'Notification message cannot be empty');
      return;
    }
    setBroadcastSubmitting(true);
    try {
      const data = await apiFetch('/api/judges/broadcasts', {
        method: 'POST',
        body: JSON.stringify({
          message: broadcastMessage.trim(),
          recipientType: broadcastRecipient,
          eventId: broadcastEventId,
          participantId: broadcastRecipient === 'Specific' ? broadcastParticipantId : undefined
        })
      });
      if (data.success) {
        setBroadcastMessage('');
        fetchBroadcasts();
        triggerSuccess('Notification Sent', 'Your notification message has been successfully sent.');
      }
    } catch (err) {
      triggerSuccess('Failed to Send', err.message || 'Failed to send notification');
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification record?')) return;
    try {
      const data = await apiFetch(`/api/judges/broadcasts/${id}`, {
        method: 'DELETE'
      });
      if (data.success) {
        fetchBroadcasts();
      }
    } catch (err) {
      triggerSuccess('Delete Failed', err.message || 'Failed to delete broadcast');
    }
  };

  const fetchJudgeData = async () => {
    try {
      const eventData = await apiFetch('/api/events');
      if (eventData.success && eventData.events.length > 0) {
        const userIdStr = (user?.id || user?._id || '').toString();
        const assigned = user?.role === 'Admin' 
          ? eventData.events 
          : eventData.events.filter(e => Array.isArray(e.assignedJudges) && e.assignedJudges.some(j => (typeof j === 'object' ? (j._id || j.id || j).toString() : j.toString()) === userIdStr));
        setEvents(assigned);
        
        if (assigned.length > 0) {
          const photoByEventData = {};
          
          for (const ev of assigned) {
            try {
              const res = await apiFetch(`/api/judges/assigned-photos/${ev._id}`);
              if (res.success) {
                photoByEventData[ev._id] = res.photographs;
              }
            } catch (err) {
              console.warn(`Could not load photos for event ${ev.title}:`, err.message);
            }
          }
          
          setAllPhotographsByEvent(photoByEventData);

          if (!userSelectedEventId) {
            setEvent(null);
            setPhotographs(Object.values(photoByEventData).flat());
          } else {
            const currentSel = assigned.find(e => e._id === userSelectedEventId) || assigned[0];
            setEvent(currentSel);
            setPhotographs(photoByEventData[currentSel._id] || []);
          }
          setSelectedSubmissionId('all');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not load assigned photographs');
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = async (eId) => {
    setUserSelectedEventId(eId || '');
    setHistorySelectedEventId(eId || '');
    setLoading(true);
    setActivePhoto(null);

    if (!eId || eId === 'all') {
      setEvent(null);
      const allPhotosCombined = Object.values(allPhotographsByEvent).flat();
      setPhotographs(allPhotosCombined);
      setSelectedSubmissionId('all');
      setLoading(false);
      return;
    }

    const selected = events.find(e => e._id === eId);
    if (!selected) {
      setLoading(false);
      return;
    }
    setEvent(selected);

    const statusLower = (selected.status || '').toLowerCase();
    if (['archived', 'draft', 'completed', 'closed'].includes(statusLower)) {
      setStatusModalEvent({
        title: selected.title,
        status: selected.status || 'Archived',
        message: statusLower === 'archived'
          ? 'This contest has been Archived. Judging evaluations and archived submissions for this event are available in read-only mode.'
          : statusLower === 'draft'
            ? 'This contest is currently in Draft mode. Official jury grading and evaluation has not opened yet.'
            : 'This contest has been Completed. All judge evaluations and final rankings are locked.'
      });
      setShowStatusModal(true);
    }

    try {
      const photoData = await apiFetch(`/api/judges/assigned-photos/${selected._id}`);
      if (photoData.success) {
        setPhotographs(photoData.photographs);
        setAllPhotographsByEvent(prev => ({
          ...prev,
          [selected._id]: photoData.photographs
        }));
        setSelectedSubmissionId('all');
      }
    } catch (err) {
      console.error(err);
      setError('Could not load photographs for this event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchJudgeData();
    }
  }, [user?.id, user?._id]);

  useEffect(() => {
    if (photographs.length > 0) {
      const initial = {};
      photographs.forEach(p => {
        const val = p.score ? Math.round(p.score.averageScore) : 5;
        initial[p.photoId] = {
          creativity: val,
          composition: val,
          technicalQuality: val,
          storytelling: val,
          overallImpact: val,
          remarks: p.score?.remarks ?? '',
          approvalStatus: p.score?.approvalStatus ?? 'Approved'
        };
      });
      setOfflineScores(initial);
    }
  }, [photographs]);

  const handleOpenOfflineScoring = (photo) => {
    if (photo.paymentStatus === 'Unpaid') return;
    if (hasConfirmed && user?.role !== 'Admin') return;
    setOfflineZoomPhoto(photo);
    const existing = photo.score || {
      averageScore: 5,
      remarks: '',
      approvalStatus: 'Approved'
    };
    const avg = existing.averageScore !== undefined ? Math.round(existing.averageScore) : 5;
    setOfflineAverageScore(avg);
    setOfflineRemarks(existing.remarks || '');
    setOfflineApprovalStatus(existing.approvalStatus || 'Approved');
  };

  const handleSaveOfflineScoring = async (e) => {
    if (e) e.preventDefault();
    if (user?.role === 'Admin') return;
    if (offlineApprovalStatus === 'Disapproved' && (!offlineRemarks || offlineRemarks.trim() === '')) {
      setError('An explanation/remarks is required when disapproving an entry.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/api/judges/score', {
        method: 'POST',
        body: JSON.stringify({
          submissionId: offlineZoomPhoto.submissionId,
          photoId: offlineZoomPhoto.photoId,
          creativity: offlineAverageScore,
          composition: offlineAverageScore,
          technicalQuality: offlineAverageScore,
          storytelling: offlineAverageScore,
          overallImpact: offlineAverageScore,
          remarks: offlineRemarks,
          approvalStatus: offlineApprovalStatus
        })
      });

      if (data.success) {
        const photoData = await apiFetch(`/api/judges/assigned-photos/${event._id}`);
        if (photoData.success) {
          setPhotographs(photoData.photographs);
          setAllPhotographsByEvent(prev => ({
            ...prev,
            [event._id]: photoData.photographs
          }));
        }
        setOfflineZoomPhoto(null);
        triggerSuccess('Review Submitted', 'The photograph score evaluation has been saved successfully.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScoring = (photo) => {
    if (photo.paymentStatus === 'Unpaid') return;
    if (hasConfirmed && user?.role !== 'Admin') {
      setShowSignedOffBlockModal(true);
      return;
    }
    setActivePhoto(photo);
    if (photo.score) {
      setCreativity(photo.score.creativity);
      setComposition(photo.score.composition);
      setTechnicalQuality(photo.score.technicalQuality);
      setStorytelling(photo.score.storytelling);
      setOverallImpact(photo.score.overallImpact);
      setRemarks(photo.score.remarks || '');
      setApprovalStatus(photo.score.approvalStatus || 'Approved');
    } else {
      setCreativity(5);
      setComposition(5);
      setTechnicalQuality(5);
      setStorytelling(5);
      setOverallImpact(5);
      setRemarks('');
      setApprovalStatus('Approved');
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (approvalStatus === 'Disapproved' && (!remarks || remarks.trim() === '')) {
      setError('An explanation/remarks is required when disapproving an entry.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/api/judges/score', {
        method: 'POST',
        body: JSON.stringify({
          submissionId: activePhoto.submissionId,
          photoId: activePhoto.photoId,
          creativity: approvalStatus === 'Disapproved' ? 0 : creativity,
          composition: approvalStatus === 'Disapproved' ? 0 : composition,
          technicalQuality: approvalStatus === 'Disapproved' ? 0 : technicalQuality,
          storytelling: approvalStatus === 'Disapproved' ? 0 : storytelling,
          overallImpact: approvalStatus === 'Disapproved' ? 0 : overallImpact,
          remarks,
          approvalStatus
        })
      });

      if (data.success) {
        const photoData = await apiFetch(`/api/judges/assigned-photos/${event._id}`);
        if (photoData.success) {
          setPhotographs(photoData.photographs);
          setAllPhotographsByEvent(prev => ({
            ...prev,
            [event._id]: photoData.photographs
          }));
        }
        setActivePhoto(null);
        triggerSuccess('Review Submitted', 'The photograph score evaluations and remarks have been saved successfully.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGrading = () => {
    if (!event) return;
    setShowSignOffModal(true);
  };

  const executeConfirmGrading = async () => {
    setShowSignOffModal(false);
    setLoading(true);
    try {
      const data = await apiFetch(`/api/events/${event._id}/confirm-grading`, {
        method: 'POST'
      });
      if (data.success) {
        setEvent(data.event);
        setEvents(events.map(e => e._id === data.event._id ? data.event : e));
        triggerSuccess('Signed Off', 'You have successfully signed off on your evaluations for this event.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit grading sign-off");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic calculations
  const isFormDisapproved = approvalStatus === 'Disapproved';
  const totalScore = isFormDisapproved ? 0 : (creativity + composition + technicalQuality + storytelling + overallImpact);
  const averageScore = isFormDisapproved ? '0.0' : ((creativity + composition + technicalQuality + storytelling + overallImpact) / 5).toFixed(1);
  const activePhotos = photographs;
  const allGraded = activePhotos.length > 0 && activePhotos.every(p => p.graded);
  const hasConfirmed = event?.confirmedJudges?.includes(user?.id || user?._id);
 
  const participants = [];
  const seenSubmissions = new Set();
  photographs.forEach(p => {
    if (!seenSubmissions.has(p.submissionId)) {
      seenSubmissions.add(p.submissionId);
      participants.push({
        submissionId: p.submissionId,
        userId: p.userId,
        name: p.participantName
      });
    }
  });
 
  let displayedPhotos = selectedSubmissionId === 'all'
    ? photographs
    : photographs.filter(p => p.submissionId === selectedSubmissionId);
 
  if (filterGradingStatus === 'graded') {
    displayedPhotos = displayedPhotos.filter(p => p.graded);
  } else if (filterGradingStatus === 'ungraded') {
    displayedPhotos = displayedPhotos.filter(p => !p.graded);
  } else if (filterGradingStatus === 'disapproved') {
    displayedPhotos = displayedPhotos.filter(p => p.graded && p.score?.approvalStatus === 'Disapproved');
  } else if (filterGradingStatus === 'unpaid') {
    displayedPhotos = displayedPhotos.filter(p => p.paymentStatus === 'Unpaid');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedPhotos = displayedPhotos.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.participantName?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }

  const isVideoAsset = (p) => p?.mediaType === 'video' || p?.fileUrl?.match(/\.(mp4|mov|webm|avi|mkv|m4v|3gp)(\?.*)?$/i) || p?.fileUrl?.includes('/video/upload/') || p?.fileUrl?.includes('/video/') || p?.fileUrl?.includes('video_');

  // Calculation helpers for Overview tab
  const totalEvents = events.length;
  const targetPhotos = userSelectedEventId && event
    ? (allPhotographsByEvent[userSelectedEventId] || photographs || [])
    : Object.values(allPhotographsByEvent).reduce((acc, arr) => [...acc, ...(arr || [])], []);

  const totalPhotos = targetPhotos.length;
  const totalVideos = targetPhotos.filter(isVideoAsset).length;
  const totalPhotosOnly = targetPhotos.filter(p => !isVideoAsset(p)).length;
  const unpaidCount = targetPhotos.filter(p => p.paymentStatus === 'Unpaid').length;
  const paidPhotos = targetPhotos.filter(p => p.paymentStatus !== 'Unpaid');
  const gradedCount = paidPhotos.filter(p => p.graded).length;
  const pendingCount = paidPhotos.filter(p => !p.graded).length;

  const historyList = useMemo(() => {
    const list = [];
    const tEvents = userSelectedEventId && event ? [event] : events;
    tEvents.forEach(e => {
      const eventPhotos = allPhotographsByEvent[e._id] || (e._id === event?._id ? photographs : []);
      eventPhotos.forEach(p => {
        if (p.graded && p.score) {
          list.push({
            ...p,
            eventTitle: e.title
          });
        }
      });
    });
    return list.sort((a, b) => new Date(b.score.updatedAt || b.score.createdAt) - new Date(a.score.updatedAt || a.score.createdAt));
  }, [userSelectedEventId, event, events, allPhotographsByEvent, photographs]);

  const fullLeaderboardList = useMemo(() => {
    const defaultList = [
      { id: 1, name: 'Ananya Sharma', submissions: 342, points: 1245, category: 'Photography', avatarBg: 'bg-indigo-600' },
      { id: 2, name: 'Rohit Verma', submissions: 289, points: 1102, category: 'Short Video', avatarBg: 'bg-emerald-600' },
      { id: 3, name: 'Meera Iyer', submissions: 276, points: 980, category: 'Fine Art', avatarBg: 'bg-purple-600' },
      { id: 4, name: 'Siddharth Rao', submissions: 245, points: 920, category: 'Photography', avatarBg: 'bg-blue-600' },
      { id: 5, name: 'Kavita Patel', submissions: 210, points: 865, category: 'Sketching', avatarBg: 'bg-amber-600' },
      { id: 6, name: 'Arjun Deshmukh', submissions: 195, points: 810, category: 'Short Video', avatarBg: 'bg-rose-600' },
      { id: 7, name: 'Pooja Kulkarni', submissions: 180, points: 760, category: 'Paper Craft', avatarBg: 'bg-teal-600' },
      { id: 8, name: 'Vikram Joshi', submissions: 165, points: 715, category: 'Photography', avatarBg: 'bg-slate-700' }
    ];

    if (photographs.length > 0) {
      const map = new Map();
      photographs.forEach(p => {
        if (!p.participantName) return;
        const key = p.userId || p.participantName;
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            name: p.participantName,
            avatar: p.userAvatar || p.avatar || p.profilePicture || null,
            submissions: 0,
            points: 0,
            category: p.category || 'General Art',
            avatarBg: 'bg-indigo-600'
          });
        }
        const entry = map.get(key);
        entry.submissions += 1;
        if (p.graded && p.score) {
          entry.points += Math.round(Number(p.score.averageScore || 5) * 10);
        } else {
          entry.points += 50;
        }
      });
      const generated = Array.from(map.values()).sort((a, b) => b.points - a.points);
      if (generated.length >= 3) return generated;
    }
    return defaultList;
  }, [photographs]);

  if (loading && photographs.length === 0) {
    return (
      <div className="h-full w-full bg-[#f4f6fa] dark:bg-slate-950 flex flex-col items-center justify-center">
        <Camera className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          Loading Judge Portal...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden bg-[#f4f6fa] dark:bg-slate-950 flex flex-col lg:flex-row font-sans">
      
      {/* ════════════════════ FIXED LEFT SIDEBAR (Desktop: hidden lg:flex) ════════════════════ */}
      <aside className="hidden lg:flex w-64 bg-[#181a2e] dark:bg-[#111322] text-white flex-col justify-between shrink-0 px-5 py-6 shadow-xl border-r border-slate-800 z-30 h-full overflow-y-auto">
        <div className="flex flex-col gap-4">
          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => {
                setJudgeDashboardTab("overview");
                setUserSelectedEventId("");
              }}
              className={`w-full h-11 flex items-center gap-3.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                judgeDashboardTab === "overview"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setJudgeDashboardTab("portal")}
              className={`w-full h-11 flex items-center gap-3.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                judgeDashboardTab === "portal"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Camera size={18} />
              <span>Judging Portal</span>
            </button>

            <button
              onClick={() => setJudgeDashboardTab("event_history")}
              className={`w-full h-11 flex items-center gap-3.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                judgeDashboardTab === "event_history"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar size={18} />
              <span>Events History</span>
            </button>

            <button
              onClick={() => setJudgeDashboardTab("notifications")}
              className={`w-full h-11 flex items-center justify-between px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                judgeDashboardTab === "notifications"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Bell size={18} />
                <span>Announcements</span>
              </div>
              {broadcasts.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {broadcasts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setJudgeDashboardTab("profile_settings")}
              className={`w-full h-11 flex items-center gap-3.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                judgeDashboardTab === "profile_settings"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <SlidersHorizontal size={18} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Promo Bottom Card */}
        <div className="mt-8 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-4 flex flex-col gap-3 text-left relative overflow-hidden shadow-lg group">
          <div className="flex flex-col gap-1 z-10 relative">
            <h4 className="font-display font-black text-sm text-white tracking-wide">
              Unleash Creativity
            </h4>
            <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
              Empowering artists through meaningful competitions.
            </p>
          </div>

          {/* Event Base Image Container */}
          <div className="w-full h-24 rounded-2xl overflow-hidden relative border border-white/10 shadow-md mt-0.5">
            <img
              src={
                event?.imageUrl || event?.bannerUrl || (photographs.length > 0 ? getBackendUrl(photographs[0].fileUrl) : '/wild.jpg')
              }
              alt={event?.title || 'Event Photography'}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/wild.jpg'; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
              <span className="text-[9px] font-extrabold uppercase text-indigo-200 tracking-wider truncate">
                {event?.title || 'Art & Photography Events'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ════════════════════ MOBILE SLIDE-OVER SIDEBAR DRAWER (< lg) ════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar Panel (Sliding in from Right) */}
          <aside className="relative w-72 max-w-[85vw] bg-[#181a2e] dark:bg-[#111322] text-white flex flex-col justify-between p-5 h-full overflow-y-auto z-50 shadow-2xl animate-in slide-in-from-right duration-200 border-l border-slate-800 text-left">
            <div className="flex flex-col gap-5">
              {/* Drawer User Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-400/50 flex items-center justify-center font-black text-sm text-white shadow-md overflow-hidden shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'J'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-display font-bold text-sm text-white leading-tight">
                      {user?.name || 'Judge Portal'}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                      JUDGE
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                  title="Close Menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav Links List inside Drawer */}
              <nav className="flex flex-col gap-1.5">
                {[
                  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, onClick: () => { setJudgeDashboardTab('overview'); setUserSelectedEventId(''); } },
                  { id: 'portal', label: 'Judging Portal', icon: Camera, onClick: () => setJudgeDashboardTab('portal') },
                  { id: 'event_history', label: 'Events History', icon: Calendar, onClick: () => setJudgeDashboardTab('event_history') },
                  { id: 'notifications', label: 'Announcements', icon: Bell, badge: broadcasts.length > 0 ? broadcasts.length : null, onClick: () => setJudgeDashboardTab('notifications') },
                  { id: 'profile_settings', label: 'Settings', icon: SlidersHorizontal, onClick: () => setJudgeDashboardTab('profile_settings') },
                ].map(t => {
                  const IconComponent = t.icon;
                  const isActive = judgeDashboardTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        t.onClick();
                      }}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                        <span>{t.label}</span>
                      </div>
                      {t.badge && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout at bottom of Drawer */}
            {logout && (
              <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ════════════════════ SCROLLABLE RIGHT CONTENT AREA ════════════════════ */}
      <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        
        {/* HEADER / TITLE & TOOLBAR */}
        <header className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
          <div className="text-left flex flex-col justify-start">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white leading-none">
              {judgeDashboardTab === 'overview' && 'Dashboard'}
              {judgeDashboardTab === 'portal' && 'Evaluation Workspace'}
              {judgeDashboardTab === 'event_history' && 'Events Archives'}
              {judgeDashboardTab === 'notifications' && 'Announcements & Alerts'}
              {judgeDashboardTab === 'profile_settings' && 'Jury Profile Settings'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'Judge'}!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
            {/* Current Session Date Badge (Hidden on Mobile) */}
            <div className="hidden sm:flex h-11 items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-xs font-extrabold text-slate-600 dark:text-slate-300 shadow-2xs shrink-0">
              <Calendar size={15} className="text-indigo-500 shrink-0" />
              <span>Current Session: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* Event Selector Dropdown */}
            {events.length > 0 && judgeDashboardTab !== 'profile_settings' && (
              <div className="h-11 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 shadow-2xs shrink-0">
                <Filter size={14} className="text-amber-500 shrink-0" />
                <select
                  value={userSelectedEventId || 'all'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserSelectedEventId(val);
                    handleEventChange(val);
                  }}
                  className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="all">All Assigned Events ({events.length})</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title} ({ev.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Top Sub-Navigation Tabs (Overview / Evaluation Portal / Event History) - Matching media_1788328262452.png */}
        {['overview', 'portal', 'event_history'].includes(judgeDashboardTab) && (
          <div className="w-full bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 mb-6 shadow-2xs">
            <button
              onClick={() => setJudgeDashboardTab("overview")}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                judgeDashboardTab === "overview"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setJudgeDashboardTab("portal")}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                judgeDashboardTab === "portal"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Evaluation Portal
            </button>
            <button
              onClick={() => setJudgeDashboardTab("event_history")}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                judgeDashboardTab === "event_history"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Event History
            </button>
          </div>
        )}

        {user?.role === 'Admin' && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5 flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-6 text-xs font-semibold text-left">
            <ShieldAlert size={18} className="shrink-0" />
            <span>Viewing in Admin Mode (Read-Only). You can review judge evaluations but cannot modify scores or sign off.</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/20 p-4 rounded-2xl text-xs text-red-600 dark:text-red-400 mb-6 text-left">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ════════════════════ TAB: OVERVIEW ════════════════════ */}
        {judgeDashboardTab === "overview" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            
            {/* Top 6 Metric Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
              {/* Pair 1: Column 1 Alignment (Card 1 & Card 2) */}
              <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-2 gap-3">
                {/* Card 1: ASSIGNED CONTESTS */}
                <div className="bg-[#f0edff] dark:bg-indigo-950/30 border border-[#e0d9ff] dark:border-indigo-800 rounded-2xl p-4 text-left flex flex-col justify-between gap-2 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] sm:text-xs text-indigo-700 dark:text-indigo-300 font-extrabold uppercase tracking-wider leading-snug">
                      ASSIGNED CONTESTS
                    </span>
                    <div className="p-2 bg-indigo-200/60 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl shrink-0">
                      <Trophy size={16} />
                    </div>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-indigo-950 dark:text-white leading-none">
                      {userSelectedEventId ? 1 : totalEvents}
                    </h3>
                    <span className="text-xs text-indigo-600 font-extrabold block mt-1 truncate">
                      Total events panel seat
                    </span>
                  </div>
                </div>

                {/* Card 2: GRADED PHOTOGRAPHS / VIDEOS */}
                <div className="bg-[#e6f4ff] dark:bg-sky-950/30 border border-[#bae0ff] dark:border-sky-800 rounded-2xl p-4 text-left flex flex-col justify-between gap-2 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] sm:text-xs text-sky-700 dark:text-sky-300 font-extrabold uppercase tracking-wider leading-snug">
                      GRADED PHOTOS / VIDEOS
                    </span>
                    <div className="p-2 bg-sky-200/60 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-xl shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-sky-950 dark:text-white leading-none">
                      {gradedCount}
                    </h3>
                    <span className="text-xs text-sky-600 font-extrabold block mt-1 truncate">
                      Completed assessments
                    </span>
                  </div>
                </div>
              </div>

              {/* Pair 2: Column 2 Alignment (Card 3 & Card 4) */}
              <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-2 gap-3">
                {/* Card 3: UNGRADED PHOTOGRAPHS / VIDEOS */}
                <div className="bg-[#e6f7ed] dark:bg-emerald-950/30 border border-[#b7ebc9] dark:border-emerald-800 rounded-2xl p-4 text-left flex flex-col justify-between gap-2 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-300 font-extrabold uppercase tracking-wider leading-snug">
                      UNGRADED PHOTOS / VIDEOS
                    </span>
                    <div className="p-2 bg-emerald-200/60 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl shrink-0">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-emerald-950 dark:text-white leading-none">
                      {pendingCount}
                    </h3>
                    <span className="text-xs text-emerald-600 font-extrabold block mt-1 truncate">
                      Assessments remaining
                    </span>
                  </div>
                </div>

                {/* Card 4: UNPAID PHOTOGRAPHS / VIDEOS */}
                <div className="bg-[#fff7e6] dark:bg-amber-950/30 border border-[#ffe7ba] dark:border-amber-800 rounded-2xl p-4 text-left flex flex-col justify-between gap-2 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-300 font-extrabold uppercase tracking-wider leading-snug">
                      UNPAID PHOTOS / VIDEOS
                    </span>
                    <div className="p-2 bg-amber-200/60 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-xl shrink-0">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-amber-950 dark:text-white leading-none">
                      {unpaidCount}
                    </h3>
                    <span className="text-xs text-amber-600 font-extrabold block mt-1 truncate">
                      Payment pending entries
                    </span>
                  </div>
                </div>
              </div>

              {/* Pair 3: Column 3 Alignment (Card 5 & Card 6) */}
              <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-2 gap-3">
                {/* Card 5: TOTAL PHOTOGRAPHS */}
                <div className="bg-[#ffe6ec] dark:bg-rose-950/30 border border-[#ffb3c6] dark:border-rose-800 rounded-2xl p-4 text-left flex flex-col justify-between gap-2 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] sm:text-xs text-rose-700 dark:text-rose-300 font-extrabold uppercase tracking-wider leading-snug">
                      TOTAL PHOTOGRAPHS
                    </span>
                    <div className="p-2 bg-rose-200/60 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl shrink-0">
                      <ImageIcon size={16} />
                    </div>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-rose-950 dark:text-white leading-none">
                      {totalPhotosOnly}
                    </h3>
                    <span className="text-xs text-rose-600 font-extrabold block mt-1 truncate">
                      Total image entries
                    </span>
                  </div>
                </div>

                {/* Card 6: TOTAL VIDEOS */}
                <div className="bg-[#f3e8ff] dark:bg-purple-950/30 border border-[#e9d5ff] dark:border-purple-800 rounded-2xl p-4 text-left flex flex-col justify-between gap-2 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] sm:text-xs text-purple-700 dark:text-purple-300 font-extrabold uppercase tracking-wider leading-snug">
                      TOTAL VIDEOS
                    </span>
                    <div className="p-2 bg-purple-200/60 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl shrink-0">
                      <Play size={16} />
                    </div>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-purple-950 dark:text-white leading-none">
                      {totalVideos}
                    </h3>
                    <span className="text-xs text-purple-600 font-extrabold block mt-1 truncate">
                      Total video entries
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═════════ 3 COLUMNS OVERVIEW CONTENT (Aligned to same left/right margins) ═════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
              
              {/* Left Column: Live Events Overview List */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between text-left shadow-2xs h-full">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      Live Events Overview
                    </h3>
                    <button
                      onClick={() => setJudgeDashboardTab("portal")}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {events.slice(0, 5).map((ev, idx) => {
                      const evPhotos = allPhotographsByEvent[ev._id] || [];
                      const evGraded = evPhotos.filter(p => p.graded).length;
                      const evTotal = evPhotos.length;
                      const pct = evTotal > 0 ? Math.round((evGraded / evTotal) * 100) : 0;

                      return (
                        <div key={ev._id || idx} className="p-2.5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                              {evPhotos[0] ? (
                                <img 
                                  src={getBackendUrl(evPhotos[0].fileUrl) || '/wild.jpg'} 
                                  alt={ev.title} 
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/wild.jpg'; }}
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <ImageIcon size={18} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                  {ev.title}
                                </span>
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase rounded-full">
                                  Live
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 truncate">
                                {ev.eventType || 'Photography'} • {ev.photoLimit ? `${ev.photoLimit} Photos` : 'Open Theme'}
                              </span>
                              <span className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                👥 {evPhotos.length * 3} Participants • 📷 {evTotal} Submissions
                              </span>
                            </div>
                          </div>

                          {/* Donut Percentage Ring */}
                          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-200 dark:text-slate-800"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-indigo-600"
                                strokeDasharray={`${pct}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute text-[8px] font-black text-slate-900 dark:text-white">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Middle Column: Submissions Trend & Recent Submissions */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-6 h-full">
                
                {/* Submissions Trend Card (Compact h-[195px] & Reduced Curve) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left shadow-2xs flex flex-col justify-between h-[195px]">
                  <div className="flex justify-between items-center shrink-0">
                    <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      Submissions Trend
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                      This Week
                    </span>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 shrink-0 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Photo Submissions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Video Submissions</span>
                    </div>
                  </div>

                  {/* SVG Line Chart Graphic */}
                  <div className="w-full grow pt-1 flex flex-col justify-between">
                    <svg className="w-full h-22 overflow-visible" viewBox="0 0 300 100">
                      <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                      
                      <path d="M0,60 Q50,40 100,25 T200,35 T300,30" fill="none" stroke="#3b82f6" strokeWidth="3" />
                      <path d="M0,85 Q50,75 100,55 T200,60 T300,50" fill="none" stroke="#a855f7" strokeWidth="3" />

                      <circle cx="100" cy="25" r="4" fill="#3b82f6" />
                      <circle cx="200" cy="35" r="4" fill="#3b82f6" />
                      <circle cx="100" cy="55" r="4" fill="#a855f7" />
                      <circle cx="200" cy="60" r="4" fill="#a855f7" />
                    </svg>
                    <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                      <span>May 19</span>
                      <span>May 20</span>
                      <span>May 21</span>
                      <span>May 22</span>
                      <span>May 23</span>
                      <span>May 24</span>
                      <span>May 25</span>
                    </div>
                  </div>
                </div>

                {/* Recent Submissions Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left shadow-2xs flex flex-col justify-between gap-2.5 flex-1">
                  <div className="flex justify-between items-center shrink-0">
                    <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      Recent Submissions
                    </h3>
                    <button onClick={() => setJudgeDashboardTab('portal')} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer">
                      View All
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5 grow justify-around">
                    {targetPhotos.slice(0, 4).map((item, idx) => (
                      <div key={item.photoId || idx} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/60">
                            <img 
                              src={getBackendUrl(item.fileUrl) || '/wild.jpg'} 
                              alt={item.title} 
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/wild.jpg'; }}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex flex-col min-w-0 text-left">
                            <span className="font-extrabold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                            <span className="text-[9px] text-slate-400 truncate">
                              {item.participantName} • {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md ${
                            isVideoAsset(item) ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {isVideoAsset(item) ? 'Video' : 'Photo'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {idx === 0 ? '2m ago' : `${(idx + 1) * 5}m ago`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Submissions by Category & Top Participants */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-6 h-full">
                
                {/* Submissions by Category Donut Chart Card (Compact h-[195px] & Reduced Curve) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left shadow-2xs flex flex-col justify-between h-[195px]">
                  <h3 className="font-display font-black text-sm text-slate-900 dark:text-white shrink-0">
                    Submissions by Category
                  </h3>
                  <div className="flex items-center justify-around my-auto">
                    <div className="relative w-22 h-22 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-purple-600" strokeDasharray="36, 100" strokeDashoffset="0" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-blue-500" strokeDasharray="28, 100" strokeDashoffset="-36" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-emerald-500" strokeDasharray="20, 100" strokeDashoffset="-64" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-amber-500" strokeDasharray="16, 100" strokeDashoffset="-84" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="font-display font-black text-xs text-slate-900 dark:text-white">
                          {totalPhotos}
                        </span>
                        <span className="text-[7px] text-slate-400 font-extrabold uppercase">Total</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                        <span>Photography (Open): 36%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span>Short Video (60s): 28%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>Photography Theme: 20%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Short Video (30s): 16%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Participants Leaderboard Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left shadow-2xs flex flex-col gap-2.5 flex-1">
                  <div className="flex justify-between items-center shrink-0">
                    <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      Top Participants
                    </h3>
                    <button
                      onClick={() => setShowTopParticipantsModal(true)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 grow justify-around">
                    {fullLeaderboardList.slice(0, 4).map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-black text-slate-400 text-xs w-4 shrink-0">{idx + 1}</span>
                          <ParticipantAvatar
                            avatar={item.avatar}
                            name={item.name}
                            bg={item.avatarBg || 'bg-indigo-600'}
                            className="w-7 h-7 text-[11px]"
                          />
                          <div className="flex flex-col text-left min-w-0">
                            <span className="font-extrabold text-slate-900 dark:text-white truncate text-xs">{item.name}</span>
                            <span className="text-[9px] text-slate-400 truncate">{item.submissions} Submissions</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs shrink-0">
                          <Star size={13} className="fill-current" />
                          <span>{item.points.toLocaleString()} Pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* ═════════ PAST EVALUATION HISTORY LOG TABLE (Compact h-[340px] & Reduced Curve) ═════════ */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-2xs text-left mb-4 h-[340px] w-full">
              <h3 className="font-display font-black text-sm text-slate-900 dark:text-white shrink-0 mb-2.5">Past Evaluation History Log</h3>
              
              {historyList.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs text-center flex-1 flex items-center justify-center">
                  No graded photographs found. Get started in the Evaluation Workspace!
                </div>
              ) : (
                <div className="overflow-y-auto overflow-x-auto w-full h-[260px] border border-slate-200/60 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                        <th className="py-2.5 px-3.5">Photo</th>
                        <th className="py-2.5 px-3.5">Details</th>
                        <th className="py-2.5 px-3.5 text-center">Scores</th>
                        <th className="py-2.5 px-3.5 text-center">Average</th>
                        <th className="py-2.5 px-3.5 text-center">Status</th>
                        <th className="py-2.5 px-3.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {historyList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <div className="relative w-14 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 flex items-center justify-center group">
                              {isVideoAsset(item) ? (
                                <>
                                  <video 
                                    src={getBackendUrl(item.fileUrl)} 
                                    className="w-full h-full object-cover" 
                                    muted 
                                    playsInline 
                                    crossOrigin="anonymous"
                                    referrerPolicy="no-referrer"
                                    preload="none"
                                    onMouseOver={(e) => e.target.play()} 
                                    onMouseOut={(e) => e.target.pause()}
                                  />
                                </>
                              ) : (
                                <img 
                                  src={getBackendUrl(item.fileUrl) || '/wild.jpg'} 
                                  alt={item.title} 
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/wild.jpg'; }}
                                  className="w-full h-full object-cover" 
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className="font-extrabold text-slate-900 dark:text-white block truncate max-w-50">{item.title}</span>
                            <span className="text-[9px] text-slate-400 block truncate max-w-50">{item.eventTitle}</span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <div className="flex items-center justify-center gap-1 text-[8px] font-mono font-bold">
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">C:{item.score.creativity}</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">CO:{item.score.composition}</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">T:{item.score.technicalQuality}</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">S:{item.score.storytelling}</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">I:{item.score.overallImpact}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">
                              {item.score.approvalStatus === 'Disapproved' ? '0.00' : Number(item.score.averageScore).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                              item.score.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {item.score.approvalStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                              {item.score.remarks ? `"${item.score.remarks}"` : '-'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ TAB: EVALUATION PORTAL ════════════════════ */}
        {judgeDashboardTab === "portal" && (
          (!userSelectedEventId || userSelectedEventId === 'all') ? (
            <div className="bg-[#f5ebd9] dark:bg-slate-900/90 border border-amber-300/80 dark:border-amber-900/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs my-6 min-h-[320px] animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-1">
                <AlertTriangle size={28} className="stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Please Select an Event
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md leading-relaxed">
                Please select an assigned event from the top right dropdown menu to view the evaluation workspace and grade submissions.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            
            {/* Header & Controls Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
              <div>
                <h2 className="font-display font-black text-xl text-slate-900 dark:text-white">
                  {event ? event.title : 'All Submissions Workspace'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Review assigned uploads, grade composition parameters, and submit final evaluations.
                </p>
              </div>

              {/* Online vs Offline Evaluation Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 shrink-0">
                <button
                  onClick={() => setEvaluationMode('online')}
                  className={`py-2 px-5 font-display font-bold text-xs uppercase tracking-wider cursor-pointer rounded-xl transition-all ${
                    evaluationMode === 'online'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Online Evaluation
                </button>
                <button
                  onClick={() => setEvaluationMode('offline')}
                  className={`py-2 px-5 font-display font-bold text-xs uppercase tracking-wider cursor-pointer rounded-xl transition-all ${
                    evaluationMode === 'offline'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Offline Evaluation
                </button>
              </div>
            </div>

            {/* Submissions Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs text-left">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input - Left side of All Submissions */}
                <div className="relative w-full sm:w-60">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, participants..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={filterGradingStatus}
                  onChange={(e) => setFilterGradingStatus(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer outline-none"
                >
                  <option value="all">All Submissions ({photographs.length})</option>
                  <option value="graded">Graded</option>
                  <option value="ungraded">Ungraded</option>
                  <option value="disapproved">Disapproved</option>
                  <option value="unpaid">Unpaid</option>
                </select>

                {participants.length > 0 && (
                  <select
                    value={selectedSubmissionId}
                    onChange={(e) => setSelectedSubmissionId(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer outline-none max-w-48 truncate"
                  >
                    <option value="all">All Participants ({participants.length})</option>
                    {participants.map(p => (
                      <option key={p.submissionId} value={p.submissionId}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-extrabold text-slate-500">
                  Graded: <strong className="text-indigo-600 dark:text-indigo-400">{activePhotos.filter(p => p.graded).length} / {activePhotos.length}</strong>
                </span>

                {user?.role !== 'Admin' && event && (
                  hasConfirmed ? (
                    <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 py-2 px-4 rounded-xl text-xs font-extrabold uppercase flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Signed Off
                    </span>
                  ) : allGraded ? (
                    <button
                      onClick={handleConfirmGrading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Award size={14} /> Sign Off Event
                    </button>
                  ) : null
                )}
              </div>
            </div>

            {/* Display Photos Grid */}
            {displayedPhotos.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                No submissions match the filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 text-left mb-6">
                {displayedPhotos.map((photo) => (
                  <div
                    key={photo.photoId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div 
                      onClick={() => {
                        if (photo.paymentStatus === 'Unpaid' || photo.score?.approvalStatus === 'Disapproved' || (hasConfirmed && user?.role !== 'Admin')) {
                          setReadOnlyModalPhoto(photo);
                        } else if (evaluationMode === 'online') {
                          handleOpenScoring(photo);
                        } else {
                          handleOpenOfflineScoring(photo);
                        }
                      }}
                      className="w-full aspect-video relative overflow-hidden flex items-center justify-center bg-slate-950 cursor-pointer"
                    >
                      {isVideoAsset(photo) ? (
                        <video 
                          src={getBackendUrl(photo.fileUrl)} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          preload="metadata"
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <WatermarkPreview
                          src={getBackendUrl(photo.fileUrl)}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 text-[8px] font-black uppercase rounded-full shadow-xs ${
                        photo.paymentStatus === 'Unpaid'
                          ? 'bg-rose-500 text-white'
                          : photo.score?.approvalStatus === 'Disapproved'
                            ? 'bg-rose-600 text-white'
                            : photo.graded 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-slate-500 text-white'
                      }`}>
                        {photo.paymentStatus === 'Unpaid' ? 'Unpaid' : photo.score?.approvalStatus === 'Disapproved' ? 'Disapproved' : photo.graded ? 'Graded' : 'Not Graded'}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col gap-3 grow justify-between">
                      <div className="flex flex-col gap-1">
                        <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {photo.title}
                        </h4>
                        <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-wider block">
                          {photo.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold block">
                          By: {photo.participantName}
                        </span>
                        {photo.paymentStatus === 'Unpaid' ? (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-rose-500/10 text-rose-600 font-extrabold">
                              Unpaid
                            </span>
                            <span className="text-xs font-black text-slate-900 dark:text-white ml-1">Grade: 0</span>
                          </div>
                        ) : photo.score && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              photo.score.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {photo.score.approvalStatus}
                            </span>
                            <span className="text-xs font-black text-slate-900 dark:text-white ml-1">
                              Grade: {photo.score.approvalStatus === 'Disapproved' ? 0 : photo.score.averageScore}
                            </span>
                          </div>
                        )}
                      </div>

                      {photo.paymentStatus === 'Unpaid' ? (
                        <button
                          type="button"
                          onClick={() => setReadOnlyModalPhoto(photo)}
                          className="w-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold py-2 rounded-xl text-center text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200/60 dark:border-rose-900/40 transition-all shadow-2xs"
                        >
                          <Eye size={14} />
                          <span>Inspect Unpaid Entry</span>
                        </button>
                      ) : photo.score?.approvalStatus === 'Disapproved' ? (
                        <button
                          type="button"
                          onClick={() => setReadOnlyModalPhoto(photo)}
                          className="w-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold py-2 rounded-xl text-center text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200/60 dark:border-rose-900/40 transition-all shadow-2xs"
                        >
                          <Eye size={14} />
                          <span>Inspect Disapproved</span>
                        </button>
                      ) : hasConfirmed && user?.role !== 'Admin' ? (
                        <button
                          type="button"
                          onClick={() => setReadOnlyModalPhoto(photo)}
                          className="w-full font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        >
                          <Eye size={14} className="text-indigo-500" />
                          <span>View Evaluation (Read-Only)</span>
                        </button>
                      ) : (
                        (!hasConfirmed || user?.role === 'Admin') && (
                          <button
                            type="button"
                            onClick={() => evaluationMode === 'online' ? handleOpenScoring(photo) : handleOpenOfflineScoring(photo)}
                            className={`w-full font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              user?.role === 'Admin' 
                                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200' 
                                : !photo.graded 
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {user?.role === 'Admin' ? 'Review Scoring' : photo.graded ? 'Edit Evaluation' : 'Evaluate'}
                            <ChevronRight size={14} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )
        )}

        {/* ════════════════════ TAB: EVENT HISTORY (Matching media_1788327132233.png) ════════════════════ */}
        {judgeDashboardTab === "event_history" && (
          (!userSelectedEventId || userSelectedEventId === 'all') ? (
            <div className="bg-[#f5ebd9] dark:bg-slate-900/90 border border-amber-300/80 dark:border-amber-900/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs my-6 min-h-[320px] animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-1">
                <AlertTriangle size={28} className="stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Please Select an Event
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md leading-relaxed">
                Please select an assigned event from the top right dropdown menu to view the event history and archived evaluations.
              </p>
            </div>
          ) : (() => {
            const displayedEvents = events.filter(e => e._id === userSelectedEventId);

            if (displayedEvents.length === 0) {
              return (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center flex flex-col items-center gap-4 my-6">
                  <AlertTriangle size={32} className="text-amber-500" />
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-lg">No Assigned Events Found</h3>
                </div>
              );
            }

            return (
              <div className="animate-in fade-in duration-200 flex flex-col gap-6 text-left mb-8">
              
              {/* Top Banner Card: Jury Archives */}
              <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
                    <History size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        Jury Archives
                      </span>
                    </div>
                    <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-1">
                      My Judging History &amp; Details
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      View complete evaluation statistics, graded photographs, scores breakdown, and sign-off status event-wise
                    </p>
                  </div>
                </div>


              </div>

              {/* Render Event Cards Event-Wise */}
              {displayedEvents.map((ev) => {
                const evPhotos = allPhotographsByEvent[ev._id] || (ev._id === event?._id ? photographs : []);
                const totalAssigned = evPhotos.length;
                const paidEvPhotos = evPhotos.filter(p => p.paymentStatus !== 'Unpaid');
                const gradedEvPhotos = paidEvPhotos.filter(p => p.graded);
                const gradedCount = gradedEvPhotos.length;
                const disapprovedCount = gradedEvPhotos.filter(p => p.score?.approvalStatus === 'Disapproved').length;
                const approvedCount = gradedCount - disapprovedCount;
                const completionPct = totalAssigned > 0 ? Math.round((gradedCount / totalAssigned) * 100) : 0;
                
                const validScores = gradedEvPhotos.filter(p => p.score?.approvalStatus !== 'Disapproved' && p.score?.averageScore);
                const avgScoreVal = validScores.length > 0 
                  ? (validScores.reduce((sum, p) => sum + Number(p.score.averageScore), 0) / validScores.length).toFixed(1)
                  : '0.0';

                const isSignedOff = ev.confirmedJudges?.includes(user?.id || user?._id);

                return (
                  <div key={ev._id} className="flex flex-col gap-6">
                    
                    {/* Event Header & Stat Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs flex flex-col gap-5 text-left">
                      
                      {/* Event Title Row */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5 max-w-3xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              {ev.category || 'PHOTOGRAPHY'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              {ev.status || 'ACTIVE'}
                            </span>
                          </div>
                          <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
                            {ev.title}
                          </h3>
                          {ev.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                              Theme: &ldquo;{ev.description}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Sign-off Status Pill */}
                        <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                          <div className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 ${
                            isSignedOff
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                          }`}>
                            <Clock size={14} />
                            <span>{isSignedOff ? 'Signed Off' : 'Pending Sign-Off'}</span>
                          </div>
                          {ev.deadline && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Deadline: {new Date(ev.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 4 Stat Metric Cards (Exact match to media_1788327132233.png) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                        
                        {/* 1. ASSIGNED ENTRIES */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ASSIGNED ENTRIES</span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-display font-black text-3xl text-slate-900 dark:text-white">{totalAssigned}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">Total photos assigned</span>
                        </div>

                        {/* 2. GRADED ENTRIES */}
                        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between gap-2">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">GRADED ENTRIES</span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-display font-black text-3xl text-emerald-600 dark:text-emerald-400">{gradedCount}</span>
                          </div>
                          <span className="text-[10px] text-emerald-500 font-semibold">{completionPct}% completed</span>
                        </div>

                        {/* 3. DISAPPROVED */}
                        <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-4 flex flex-col justify-between gap-2">
                          <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">DISAPPROVED</span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-display font-black text-3xl text-rose-600 dark:text-rose-400">{disapprovedCount}</span>
                          </div>
                          <span className="text-[10px] text-rose-500 font-semibold">{approvedCount} Approved</span>
                        </div>

                        {/* 4. AVERAGE SCORE */}
                        <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 rounded-2xl p-4 flex flex-col justify-between gap-2">
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">AVERAGE SCORE</span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-display font-black text-3xl text-indigo-600 dark:text-indigo-400">{avgScoreVal}</span>
                            <span className="text-xs font-bold text-indigo-400">/ 10</span>
                          </div>
                          <span className="text-[10px] text-indigo-500 font-semibold">Your average score</span>
                        </div>

                      </div>

                      {/* Progress Bar Track */}
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>Evaluation Completion</span>
                          <span>{gradedCount} / {totalAssigned} ({completionPct}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Evaluated Entries & Score Breakdown Table */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs text-left">
                      <div className="flex flex-col gap-1 mb-4">
                        <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                          Evaluated Entries &amp; Score Breakdown ({gradedEvPhotos.length})
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Detailed breakdown of scores, criteria, remarks, and approval statuses given by you for {ev.title}
                        </p>
                      </div>

                      {gradedEvPhotos.length === 0 ? (
                        <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center flex flex-col items-center justify-center text-slate-400 text-xs">
                          <Camera size={28} className="mb-2 text-slate-300 dark:text-slate-700" />
                          <span>No evaluated entries found for this event yet.</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                                <th className="py-3 px-4">Photograph</th>
                                <th className="py-3 px-4">Title &amp; Details</th>
                                <th className="py-3 px-4">Individual Criteria</th>
                                <th className="py-3 px-4 text-center">Avg Score</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4">Graded Date</th>
                                <th className="py-3 px-4">Remarks / Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                              {gradedEvPhotos.map((photo) => (
                                <tr key={photo._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                                  
                                  {/* Photograph Thumbnail */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <div className="relative w-16 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 flex items-center justify-center">
                                      {isVideoAsset(photo) ? (
                                        <video 
                                          src={getBackendUrl(photo.fileUrl)} 
                                          className="w-full h-full object-cover"
                                          muted 
                                          playsInline 
                                        />
                                      ) : (
                                        <img 
                                          src={getBackendUrl(photo.fileUrl) || '/wild.jpg'} 
                                          alt={photo.title}
                                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/wild.jpg'; }}
                                          className="w-full h-full object-cover" 
                                        />
                                      )}
                                    </div>
                                  </td>

                                  {/* Title & Details */}
                                  <td className="py-3 px-4">
                                    <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                                      {photo.title}
                                    </span>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                      {photo.category || 'Out-Door'}
                                    </span>
                                  </td>

                                  {/* Individual Criteria */}
                                  <td className="py-3 px-4">
                                    {photo.score && (
                                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                        <span>Tech: <strong className="text-slate-900 dark:text-white font-mono">{photo.score.technicalQuality}</strong></span>
                                        <span>Comp: <strong className="text-slate-900 dark:text-white font-mono">{photo.score.composition}</strong></span>
                                        <span>Creat: <strong className="text-slate-900 dark:text-white font-mono">{photo.score.creativity}</strong></span>
                                        <span>Imp: <strong className="text-slate-900 dark:text-white font-mono">{photo.score.overallImpact}</strong></span>
                                      </div>
                                    )}
                                  </td>

                                  {/* Avg Score */}
                                  <td className="py-3 px-4 text-center">
                                    <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                                      {photo.score?.approvalStatus === 'Disapproved' ? '0.0' : Number(photo.score?.averageScore || 0).toFixed(1)}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="py-3 px-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                      photo.score?.approvalStatus === 'Approved'
                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                    }`}>
                                      <CheckCircle2 size={12} />
                                      {photo.score?.approvalStatus || 'APPROVED'}
                                    </span>
                                  </td>

                                  {/* Graded Date */}
                                  <td className="py-3 px-4 text-slate-400 text-[11px] font-medium whitespace-nowrap">
                                    {photo.score?.updatedAt 
                                      ? new Date(photo.score.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : 'N/A'}
                                  </td>

                                  {/* Remarks / Notes */}
                                  <td className="py-3 px-4">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                                      {photo.score?.remarks ? `"${photo.score.remarks}"` : '—'}
                                    </p>
                                  </td>

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          );
        })()
      )}

        {/* ════════════════════ TAB: NOTIFICATIONS (Matching media_1788327467583.png) ════════════════════ */}
        {judgeDashboardTab === "notifications" && (
          <div className="animate-in fade-in duration-200 flex flex-col gap-6 text-left mb-8">
            
            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Dispatch Notification Form */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Send size={18} className="-rotate-45" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                        Dispatch Notification
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Compose message to send to target audience
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4 text-xs">
                    
                    {/* 1. Scope / Event Selection */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Scope / Event Selection
                      </label>
                      <select
                        value={broadcastEventId}
                        onChange={(e) => setBroadcastEventId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-indigo-500/40 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                      >
                        <option value="">All Assigned Events</option>
                        {events.map((ev) => (
                          <option key={ev._id} value={ev._id}>
                            {ev.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Target Audience */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Target Audience
                      </label>
                      <select
                        value={broadcastRecipient}
                        onChange={(e) => setBroadcastRecipient(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                      >
                        <option value="Participant">All Event Participants</option>
                        <option value="Graded">Graded Participants Only</option>
                        <option value="Ungraded">Ungraded Participants Only</option>
                        <option value="Admin">System Administrators</option>
                        <option value="Specific">Specific Participant</option>
                      </select>
                    </div>

                    {/* 3. Conditional Specific Participant Select */}
                    {broadcastRecipient === 'Specific' && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                          Select Participant
                        </label>
                        <select
                          value={broadcastParticipantId}
                          onChange={(e) => setBroadcastParticipantId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                        >
                          <option value="">-- Choose Participant --</option>
                          {photographs.map((p, idx) => (
                            <option key={p._id || idx} value={p.userId || p.participantName}>
                              {p.participantName} ({p.title})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* 4. Notification Message */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Notification Message
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">
                          {broadcastMessage.length}/500
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={500}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type your notification message here (e.g. Evaluation feedback update, contest instructions, or direct inquiry)..."
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-2xs"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={broadcastSubmitting}
                      className="w-auto px-8 py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer inline-flex items-center justify-center gap-2 text-xs self-start"
                    >
                      <Send size={15} />
                      <span>{broadcastSubmitting ? 'Dispatching...' : 'Send Notification'}</span>
                    </button>

                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: Sent Notifications History */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs flex flex-col text-left min-h-[460px]">
                
                {/* Section Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <History size={18} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                        Sent Notifications History
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        History of messages dispatched by your judge account
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40 shrink-0">
                    {broadcasts.length} Dispatched
                  </span>
                </div>

                {/* Sent List or Empty State */}
                {broadcasts.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto">
                    <Bell size={48} className="text-slate-300 dark:text-slate-700 stroke-[1.5] mb-3" />
                    <p className="text-xs font-bold text-slate-400">
                      No notifications dispatched yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[380px] flex flex-col gap-3 pr-1 mt-4">
                    {broadcasts.map((b) => (
                      <div
                        key={b._id}
                        className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs flex flex-col gap-2 relative group hover:border-indigo-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              {b.recipientType || 'Participant'}
                            </span>
                            {b.eventId && (
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                Event ID: {b.eventId}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(b.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleDeleteBroadcast(b._id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                              title="Delete notification log"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                          {b.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ════════════════════ TAB: JURY PROFILE SETTINGS (Matching media_1788333663959.png) ════════════════════ */}
        {judgeDashboardTab === 'profile_settings' && (
          <div className="animate-in fade-in duration-200 text-left mb-8">
            <div className="bg-[#f4f3ff] dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-8">
              
              {judgeProfileError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{judgeProfileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateJudgeProfile} className="flex flex-col gap-8">
                
                {/* Profile Photo Upload Banner Box */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <ParticipantAvatar
                      avatar={user?.avatar || user?.profilePicture}
                      name={judgeProfileName || user?.name}
                      bg="bg-indigo-600"
                      className="w-16 h-16 text-xl border-2 border-indigo-500 p-0.5 shadow-md"
                    />
                    <div>
                      <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                        Profile Photo
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md leading-relaxed">
                        Upload a jury panel member photo. This photo will appear in your top navigation bar and jury scorecards.
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={profilePhotoInputRef}
                    accept="image/*"
                    onChange={handleJudgeAvatarUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingJudgeAvatar}
                    onClick={() => profilePhotoInputRef.current && profilePhotoInputRef.current.click()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6 rounded-full transition-all shadow-md cursor-pointer shrink-0 self-start sm:self-center flex items-center gap-2"
                  >
                    <span>{uploadingJudgeAvatar ? 'Uploading...' : 'Upload Photo'}</span>
                  </button>
                </div>

                {/* Form Fields: Row 1 (3 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Jury Member Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Jury Member Name
                    </label>
                    <input
                      type="text"
                      value={judgeProfileName}
                      onChange={(e) => setJudgeProfileName(e.target.value)}
                      placeholder="Jury Member Name"
                      className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white shadow-2xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Column 2: Mobile Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={judgeProfileMobile}
                      onChange={handleJudgeMobileChange}
                      placeholder="10-digit Mobile Number"
                      className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white shadow-2xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Column 3: Email Address (Read-Only) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Email Address (Read-Only)
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      disabled
                      className="w-full p-3.5 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-2xs"
                    />
                  </div>
                </div>

                {/* Form Fields: Row 2 (2 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1: New Password (Optional) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={judgeProfilePassword}
                      onChange={(e) => setJudgeProfilePassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white shadow-2xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                    />
                  </div>

                  {/* Column 2: Confirm New Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={judgeProfileConfirmPassword}
                      onChange={(e) => setJudgeProfileConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white shadow-2xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Save Button Action Row */}
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={judgeProfileSubmitting}
                    className="w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                  >
                    <span>{judgeProfileSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Footer inside right scrollable area */}
        <footer className="mt-2 py-1 text-xs text-center text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} sumbaran Art Society. All rights reserved.</p>
        </footer>
      </main>

      {/* ════════════════════ TOP PARTICIPANTS LEADERBOARD MODAL ════════════════════ */}
      {showTopParticipantsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full flex flex-col gap-5 shadow-2xl text-left relative max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Trophy size={22} />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                    Top Participants Leaderboard
                  </h3>
                  <p className="text-xs text-slate-500">
                    Highest scoring contributors & contest leaders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTopParticipantsModal(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search inside Modal */}
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={participantSearchQuery}
                onChange={(e) => setParticipantSearchQuery(e.target.value)}
                placeholder="Search participant name or category..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Leaderboard Table List */}
            <div className="overflow-y-auto max-h-[50vh] flex flex-col gap-2.5 pr-1">
              {fullLeaderboardList
                .filter(p => p.name.toLowerCase().includes(participantSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(participantSearchQuery.toLowerCase()))
                .map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-xs hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3.5">
                      <span className={`font-black text-xs w-6 text-center shrink-0 ${
                        idx === 0 ? 'text-amber-500 font-extrabold text-sm' : idx === 1 ? 'text-slate-400 font-bold' : idx === 2 ? 'text-amber-700 font-bold' : 'text-slate-400'
                      }`}>
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                      </span>
                      <ParticipantAvatar
                        avatar={item.avatar}
                        name={item.name}
                        bg={item.avatarBg || 'bg-indigo-600'}
                        className="w-9 h-9 text-xs"
                      />
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.submissions} Submissions • <span className="text-indigo-500 font-bold">{item.category}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-500 font-black text-xs bg-amber-500/10 px-3 py-1.5 rounded-xl shrink-0">
                      <Star size={14} className="fill-current" />
                      <span>{item.points.toLocaleString()} Pts</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ READ-ONLY EVALUATION INSPECTION MODAL ════════════════════ */}
      {readOnlyModalPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-[95%] lg:max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row my-8 h-auto max-h-[90vh] lg:h-[85vh] overflow-y-auto lg:overflow-hidden mx-auto text-left animate-in fade-in duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setReadOnlyModalPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>

            {/* Left Media Preview */}
            <div className="w-full lg:w-1/2 bg-slate-950 relative overflow-hidden flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 p-4">
              <div className="grow flex items-center justify-center p-3 relative min-h-[350px] lg:min-h-[480px] bg-slate-950 w-full h-full">
                <div className="relative w-full h-full max-h-[68vh] flex items-center justify-center">
                  {isVideoAsset(readOnlyModalPhoto) ? (
                    <video
                      src={getBackendUrl(readOnlyModalPhoto.fileUrl)}
                      controls
                      controlsList="nodownload"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      playsInline
                      preload="metadata"
                      autoPlay
                      className="max-w-full max-h-[65vh] w-auto h-auto object-contain rounded-2xl mx-auto shadow-2xl"
                    />
                  ) : (
                    <WatermarkPreview
                      src={getBackendUrl(readOnlyModalPhoto.fileUrl)}
                      className="w-full h-full max-h-[65vh]"
                      enableZoom={true}
                      objectFit="contain"
                    />
                  )}
                </div>
              </div>
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-300 text-xs flex flex-col gap-1 mt-2">
                <span className="font-extrabold text-white text-sm">{readOnlyModalPhoto.title}</span>
                <span className="text-[11px] text-indigo-400 font-bold uppercase">{readOnlyModalPhoto.category}</span>
                <span className="text-[11px] text-slate-400">Submitted By: {readOnlyModalPhoto.participantName}</span>
              </div>
            </div>

            {/* Right Score & History Details */}
            <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between gap-6 overflow-y-auto bg-white dark:bg-slate-900">
              <div>
                {/* Read Only Header Banner */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-amber-600 dark:text-amber-400 text-xs font-bold mb-5">
                  <Clock size={18} className="shrink-0" />
                  <span>Signed Off Event - Read-Only Evaluation View</span>
                </div>

                <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mb-4">
                  Evaluation Details &amp; History
                </h3>

                {readOnlyModalPhoto.score ? (
                  <div className="flex flex-col gap-5">
                    
                    {/* Score Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Creativity</span>
                        <span className="font-mono text-lg font-black text-slate-900 dark:text-white">{readOnlyModalPhoto.score.creativity} / 10</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Composition</span>
                        <span className="font-mono text-lg font-black text-slate-900 dark:text-white">{readOnlyModalPhoto.score.composition} / 10</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Technical Quality</span>
                        <span className="font-mono text-lg font-black text-slate-900 dark:text-white">{readOnlyModalPhoto.score.technicalQuality} / 10</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Storytelling</span>
                        <span className="font-mono text-lg font-black text-slate-900 dark:text-white">{readOnlyModalPhoto.score.storytelling} / 10</span>
                      </div>
                      <div className="col-span-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40">
                        <span className="text-[10px] text-indigo-500 font-bold uppercase block">Overall Impact</span>
                        <span className="font-mono text-lg font-black text-indigo-600 dark:text-indigo-400">{readOnlyModalPhoto.score.overallImpact} / 10</span>
                      </div>
                    </div>

                    {/* Average & Approval Status */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Final Average Score</span>
                        <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {readOnlyModalPhoto.score.approvalStatus === 'Disapproved' ? '0.0' : Number(readOnlyModalPhoto.score.averageScore).toFixed(1)} / 10
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        readOnlyModalPhoto.score.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}>
                        {readOnlyModalPhoto.score.approvalStatus}
                      </span>
                    </div>

                    {/* Judge Remarks */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Judge Remarks &amp; Feedback</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                        {readOnlyModalPhoto.score.remarks ? `"${readOnlyModalPhoto.score.remarks}"` : 'No remarks recorded.'}
                      </p>
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No evaluation record found for this submission.</p>
                )}
              </div>

              <button
                onClick={() => setReadOnlyModalPhoto(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-2xl text-xs transition-all cursor-pointer"
              >
                Close Inspection
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ ONLINE SCORING MODAL (Matching media_1788328896481.png) ════════════════════ */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-[96%] lg:max-w-7xl bg-[#0b0f19] text-white border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row my-6 h-auto max-h-[92vh] lg:h-[90vh] mx-auto text-left">
            
            {/* LEFT MEDIA DISPLAY & METADATA AREA */}
            <div className="w-full lg:flex-1 bg-[#090d16] flex flex-col justify-between overflow-y-auto lg:overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
              
              {/* Media Container */}
              <div className="grow flex items-center justify-center p-3 relative min-h-[350px] lg:min-h-[480px] bg-slate-950 w-full h-full">
                <div className="relative w-full h-full max-h-[68vh] flex items-center justify-center">
                  {isVideoAsset(activePhoto) ? (
                    <video
                      src={getBackendUrl(activePhoto.fileUrl)}
                      controls
                      controlsList="nodownload"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      playsInline
                      preload="metadata"
                      className="max-w-full max-h-[68vh] w-auto h-auto object-contain rounded-2xl mx-auto shadow-2xl"
                    />
                  ) : (
                    <WatermarkPreview
                      src={getBackendUrl(activePhoto.fileUrl)}
                      className="w-full h-full max-h-[68vh]"
                      enableZoom={true}
                      objectFit="contain"
                    />
                  )}
                </div>
              </div>

              {/* Bottom Dark Metadata Panel */}
              <div className="bg-[#0b0f19] border-t border-slate-800/80 p-5 flex flex-col gap-4">
                
                {/* Mode & Status Badges */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    ONLINE ZOOM MODE
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    approvalStatus === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {approvalStatus === 'Approved' ? 'APPROVED' : 'REJECTED'}
                  </span>
                </div>

                {/* Title, Category & Participant */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display font-black text-lg text-white leading-tight">
                      {activePhoto.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      {activePhoto.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-800/60 px-3 py-1 rounded-lg text-slate-400 border border-slate-700/50">
                    BY: {activePhoto.participantName}
                  </span>
                </div>

                {/* 4-Column Camera Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#070a10] p-3.5 rounded-2xl border border-slate-800/60 text-[10px]">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">CAMERA BRAND</span>
                    <span className="font-bold text-slate-200">{activePhoto.cameraBrand || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">CAMERA MODEL</span>
                    <span className="font-bold text-slate-200">{activePhoto.cameraModel || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">LENS CONFIGURATION</span>
                    <span className="font-bold text-slate-200">{activePhoto.lensConfig || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">DATE CAPTURED</span>
                    <span className="font-bold text-slate-200">{activePhoto.dateCaptured || 'N/A'}</span>
                  </div>
                </div>

                {/* Photo Description Box */}
                <div className="bg-[#070a10] p-3.5 rounded-2xl border border-slate-800/60 text-[10px]">
                  <span className="text-[9px] font-extrabold uppercase text-slate-500 block mb-1">PHOTO DESCRIPTION</span>
                  <p className="text-slate-300 font-medium italic">
                    "{activePhoto.description || activePhoto.title || 'No description provided.'}"
                  </p>
                </div>

              </div>

            </div>

            {/* RIGHT WHITE SCORING SIDEBAR */}
            <div className="w-full lg:w-[420px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 flex flex-col justify-between shrink-0 h-auto lg:h-full overflow-y-auto relative">
              
              {/* Close Button */}
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-5 right-5 w-9 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center cursor-pointer transition-colors z-10"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col gap-5">
                
                {/* Scoring Header */}
                <div>
                  <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
                    Scoring Assessment
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    DSLR verification checklist
                  </p>
                </div>

                <form onSubmit={handleScoreSubmit} className="flex flex-col gap-5 text-xs">
                  
                  {/* Evaluation Status Toggle Pills */}
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      EVALUATION STATUS
                    </label>
                    <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setApprovalStatus('Approved')}
                        className={`flex-1 py-2.5 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                          approvalStatus === 'Approved'
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        APPROVE FRAME
                      </button>
                      <button
                        type="button"
                        onClick={() => setApprovalStatus('Disapproved')}
                        className={`flex-1 py-2.5 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                          approvalStatus === 'Disapproved'
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        REJECT FRAME
                      </button>
                    </div>
                  </div>

                  {/* 5 Parameter Sliders (When Approved) */}
                  {!isFormDisapproved && (
                    <div className="flex flex-col gap-3.5">
                      
                      {/* 1. Originality & Creativity */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200">
                          <span>1. Originality &amp; Creativity</span>
                          <span className="text-indigo-600 font-mono font-black">{creativity} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={creativity}
                          onChange={(e) => setCreativity(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                      {/* 2. Layout & Composition */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200">
                          <span>2. Layout &amp; Composition</span>
                          <span className="text-indigo-600 font-mono font-black">{composition} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={composition}
                          onChange={(e) => setComposition(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                      {/* 3. Technical Execution */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200">
                          <span>3. Technical Execution</span>
                          <span className="text-indigo-600 font-mono font-black">{technicalQuality} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={technicalQuality}
                          onChange={(e) => setTechnicalQuality(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                      {/* 4. Storytelling & Context */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200">
                          <span>4. Storytelling &amp; Context</span>
                          <span className="text-indigo-600 font-mono font-black">{storytelling} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={storytelling}
                          onChange={(e) => setStorytelling(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                      {/* 5. Overall Impact & WOW factor */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200">
                          <span>5. Overall Impact &amp; WOW factor</span>
                          <span className="text-indigo-600 font-mono font-black">{overallImpact} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={overallImpact}
                          onChange={(e) => setOverallImpact(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                    </div>
                  )}

                  {/* Feedback Textarea */}
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                      SCORING EXPLANATION &amp; FEEDBACK
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add comments or jury feedback..."
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Aggregate Score Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        AGGREGATE SCORE
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Sum of parameters out of 50
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400 block">
                        {isFormDisapproved ? 0 : totalScore}<span className="text-xs text-slate-400 font-bold">/50</span>
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-500">
                        AVG: {isFormDisapproved ? '0.0' : (totalScore / 5).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  {user?.role !== 'Admin' && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer mt-2 self-start"
                    >
                      {loading ? 'Saving...' : 'Save Evaluation'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ OFFLINE SCORING MODAL (Matching media_1788328960692.png) ════════════════════ */}
      {offlineZoomPhoto && (() => {
        const isOfflineDisapproved = offlineApprovalStatus === 'Disapproved';
        const isReadOnly = user?.role === 'Admin' || hasConfirmed || offlineZoomPhoto.graded;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto text-left">
            <div className="relative w-full max-w-[96%] lg:max-w-7xl bg-[#0b0f19] text-white border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row my-6 h-auto max-h-[92vh] lg:h-[90vh] mx-auto">
              
              {/* LEFT MEDIA DISPLAY & METADATA AREA */}
              <div className="w-full lg:flex-1 bg-[#090d16] flex flex-col justify-between overflow-y-auto lg:overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
                
                {/* Media Container */}
                <div className="grow flex items-center justify-center p-3 relative min-h-[350px] lg:min-h-[480px] bg-slate-950 w-full h-full">
                  <div className="relative w-full h-full max-h-[68vh] flex items-center justify-center cursor-zoom-in">
                    {isVideoAsset(offlineZoomPhoto) ? (
                      <video
                        src={getBackendUrl(offlineZoomPhoto.fileUrl)}
                        controls
                        controlsList="nodownload"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        playsInline
                        preload="metadata"
                        className="max-w-full max-h-[68vh] w-auto h-auto object-contain rounded-2xl mx-auto shadow-2xl"
                      />
                    ) : (
                      <WatermarkPreview
                        src={getBackendUrl(offlineZoomPhoto.fileUrl)}
                        className="w-full h-full max-h-[68vh]"
                        enableZoom={true}
                        objectFit="contain"
                      />
                    )}
                  </div>
                </div>

                {/* Bottom Dark Metadata Panel */}
                <div className="bg-[#0b0f19] border-t border-slate-800/80 p-5 flex flex-col gap-4">
                  
                  {/* Mode & Status Badges */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      OFFLINE ZOOM MODE
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      offlineApprovalStatus === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {offlineApprovalStatus === 'Approved' ? 'APPROVED' : 'REJECTED'}
                    </span>
                  </div>

                  {/* Title, Category & Participant */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display font-black text-lg text-white leading-tight">
                        {offlineZoomPhoto.title}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        {offlineZoomPhoto.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-800/60 px-3 py-1 rounded-lg text-slate-400 border border-slate-700/50">
                      BY: {offlineZoomPhoto.participantName}
                    </span>
                  </div>

                  {/* 4-Column Camera Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#070a10] p-3.5 rounded-2xl border border-slate-800/60 text-[10px]">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-slate-500 block">CAMERA BRAND</span>
                      <span className="font-bold text-slate-200">{offlineZoomPhoto.cameraBrand || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-slate-500 block">CAMERA MODEL</span>
                      <span className="font-bold text-slate-200">{offlineZoomPhoto.cameraModel || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-slate-500 block">LENS CONFIGURATION</span>
                      <span className="font-bold text-slate-200">{offlineZoomPhoto.lensConfig || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-slate-500 block">DATE CAPTURED</span>
                      <span className="font-bold text-slate-200">{offlineZoomPhoto.dateCaptured || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Photo Description Box */}
                  <div className="bg-[#070a10] p-3.5 rounded-2xl border border-slate-800/60 text-[10px]">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block mb-1">PHOTO DESCRIPTION</span>
                    <p className="text-slate-300 font-medium italic">
                      "{offlineZoomPhoto.description || offlineZoomPhoto.title || 'No description provided.'}"
                    </p>
                  </div>

                </div>

              </div>

              {/* RIGHT WHITE OFFLINE GRADING SIDEBAR */}
              <div className="w-full lg:w-[420px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 flex flex-col justify-between shrink-0 h-auto lg:h-full overflow-y-auto relative">
                
                {/* Close Button */}
                <button
                  onClick={() => setOfflineZoomPhoto(null)}
                  className="absolute top-5 right-5 w-9 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center cursor-pointer transition-colors z-10"
                >
                  <X size={18} />
                </button>

                <div className="flex flex-col gap-5">
                  
                  {/* Grading Sheet Header */}
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
                      Grading Sheet (Offline)
                    </h3>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      "{offlineZoomPhoto.title}"
                    </p>
                  </div>

                  <form onSubmit={handleSaveOfflineScoring} className="flex flex-col gap-5 text-xs">
                    
                    {/* Evaluation Status Toggle Pills */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                        EVALUATION STATUS
                      </label>
                      <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => setOfflineApprovalStatus('Approved')}
                          className={`flex-1 py-2.5 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                            offlineApprovalStatus === 'Approved'
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          APPROVE FRAME
                        </button>
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => setOfflineApprovalStatus('Disapproved')}
                          className={`flex-1 py-2.5 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                            offlineApprovalStatus === 'Disapproved'
                              ? 'bg-rose-500 text-white shadow-md'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          REJECT FRAME
                        </button>
                      </div>
                    </div>

                    {/* Average Grade Dropdown */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                        AVERAGE GRADE *
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={offlineAverageScore}
                        onChange={(e) => setOfflineAverageScore(parseInt(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                          <option key={val} value={val}>{val} / 10</option>
                        ))}
                      </select>
                    </div>

                    {/* Total & Average Score Stats Card */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          TOTAL SCORE
                        </span>
                        <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                          {isOfflineDisapproved ? 0 : offlineAverageScore * 5} <span className="text-xs text-slate-400 font-bold">/50</span>
                        </span>
                      </div>
                      <div className="text-right border-l border-slate-200 dark:border-slate-700/60 pl-3">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          AVERAGE SCORE
                        </span>
                        <span className="font-mono text-xl font-black text-purple-600 dark:text-purple-400 flex items-center justify-end gap-1">
                          <Star size={16} className="fill-current text-purple-600 dark:text-purple-400" />
                          <span>{isOfflineDisapproved ? '0.0' : offlineAverageScore.toFixed(1)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Remarks / Explanation Textarea */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Remarks / Explanation
                      </label>
                      <textarea
                        rows={3}
                        value={offlineRemarks}
                        onChange={(e) => setOfflineRemarks(e.target.value)}
                        disabled={isReadOnly}
                        placeholder="Provide constructive feedback for the photographer..."
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none"
                      />
                    </div>

                    {/* Read-Only Admin Mode Banner or Submit Button */}
                    {isReadOnly ? (
                      <div className="bg-[#fef7ea] dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-900/50 p-3.5 rounded-2xl text-center text-amber-800 dark:text-amber-300 font-bold text-xs shadow-2xs mt-2">
                        Evaluation Read-Only (Admin Mode)
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer text-xs mt-2 self-start"
                      >
                        Submit Grade
                      </button>
                    )}

                  </form>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* ════════════════════ CONFIRMATION MODALS ════════════════════ */}
      {showSignOffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full text-center flex flex-col gap-4 shadow-2xl">
            <AlertTriangle size={32} className="text-amber-500 mx-auto" />
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">Confirm Sign Off</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action will finalize and lock your evaluation scores for this event. Do you wish to proceed?
            </p>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowSignOffModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
              <button onClick={executeConfirmGrading} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md">Sign Off</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full text-center flex flex-col gap-4 shadow-2xl">
            <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">{successTitle}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{successMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-auto px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md mt-2 mx-auto">Understood</button>
          </div>
        </div>
      )}

      {/* ════════════════════ EVENT STATUS MODAL POPUP (Archived / Draft / Completed) ════════════════════ */}
      {showStatusModal && statusModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative">
            
            {/* Top Close X Button */}
            <button
              onClick={() => setShowStatusModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            {/* Status Icon Badge */}
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-lg ${
              (statusModalEvent.status || '').toLowerCase() === 'completed'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-emerald-500/10'
                : (statusModalEvent.status || '').toLowerCase() === 'draft'
                  ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shadow-indigo-500/10'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-amber-500/10'
            }`}>
              {(statusModalEvent.status || '').toLowerCase() === 'completed' ? (
                <CheckCircle2 size={32} />
              ) : (statusModalEvent.status || '').toLowerCase() === 'draft' ? (
                <Clock size={32} />
              ) : (
                <AlertTriangle size={32} />
              )}
            </div>

            {/* Event Title & Status Pill */}
            <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                (statusModalEvent.status || '').toLowerCase() === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : (statusModalEvent.status || '').toLowerCase() === 'draft'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {statusModalEvent.status} Event
              </span>
            </div>

            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mb-2 leading-snug">
              {statusModalEvent.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
              {statusModalEvent.message}
            </p>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => setShowStatusModal(false)}
              className="w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs"
            >
              Understood &amp; Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
