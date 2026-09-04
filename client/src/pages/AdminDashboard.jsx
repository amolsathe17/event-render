import React, { useEffect, useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import {
  BarChart,
  LayoutDashboard,
  Users,
  Camera,
  Award,
  Calendar,
  Layers,
  Search,
  Filter,
  Ban,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  TrendingUp,
  Download,
  AlertTriangle,
  UserCheck,
  Maximize2,
  FileCheck,
  RefreshCw,
  RotateCcw,
  History,
  Sparkles,
  User,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Star,
  MessageSquare,
  Bell,
  BellRing,
  Send,
  Archive,
  Clock,
  Sliders,
  ArrowUp,
  ArrowDown,
  Upload,
  Wallet,
  Building2,
  FileText,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Lock,
  Eye,
  IndianRupee,
  CheckCircle,
  Menu,
  LogOut,
  Info,
  Mail,
  BookOpen
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import StatsCharts from '../components/StatsCharts';
import AdminExpenses from '../components/AdminExpenses';
import AdminSponsorships from '../components/AdminSponsorships';
import AdminReports from '../components/AdminReports';
import ScrollableTabs from '../components/ScrollableTabs';
import { getBackendUrl, getApiBaseUrl } from '../utils/url';

export default function AdminDashboard() {
  const { apiFetch, user, logout, updateProfile } = useAuth();
  const { allEvents, selectedEvent, selectedEventId, setSelectedEventId, refreshEvents } = useEvent();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  // Stats states
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);

  // Participant list states
  const [participants, setParticipants] = useState([]);
  const [partSearch, setPartSearch] = useState('');
  const [partCity, setPartCity] = useState('');
  const [partSuspended, setPartSuspended] = useState('');
  const [partParticipantFilter, setPartParticipantFilter] = useState('');
  const [partPaymentFilter, setPartPaymentFilter] = useState('');

  // Photograph list states
  const [photographs, setPhotographs] = useState([]);
  const [photoSearch, setPhotoSearch] = useState('');
  const [photoCategory, setPhotoCategory] = useState('');
  const [photoStatus, setPhotoStatus] = useState('');
  const [photoDslrStatus, setPhotoDslrStatus] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedParticipantFilter, setSelectedParticipantFilter] = useState('');
  const [selectedContestTypeFilter, setSelectedContestTypeFilter] = useState('');

  // Judges states
  const [judges, setJudges] = useState([]);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeEmail, setNewJudgeEmail] = useState('');
  const [newJudgePassword, setNewJudgePassword] = useState('');
  const [newJudgeMobile, setNewJudgeMobile] = useState('');
  const [newJudgeCity, setNewJudgeCity] = useState('');
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [showAssignJudgesModal, setShowAssignJudgesModal] = useState(false);
  const [selectedEventForJudges, setSelectedEventForJudges] = useState(null);
  const [selectedJudgesForEvent, setSelectedJudgesForEvent] = useState([]);

  // Events & Categories states
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatTypes, setNewCatTypes] = useState([]);
  // Edit Category state
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatTypes, setEditCatTypes] = useState([]);

  // Profile settings states
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileMobile, setProfileMobile] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Contest Type States
  const [contestTypes, setContestTypes] = useState([]);
  const [newContestTypeName, setNewContestTypeName] = useState('');
  const [newContestTypeDesc, setNewContestTypeDesc] = useState('');
  const [newContestTypeLabels, setNewContestTypeLabels] = useState([]);
  const [editingContestType, setEditingContestType] = useState(null);
  const [editContestTypeName, setEditContestTypeName] = useState('');
  const [editContestTypeDesc, setEditContestTypeDesc] = useState('');
  const [editContestTypeLabels, setEditContestTypeLabels] = useState([]);
  
  // Category Details Labels states
  const [selectedCatForDetails, setSelectedCatForDetails] = useState('');
  const [selectedCtForDetails, setSelectedCtForDetails] = useState('');
  const [isInheritFromCt, setIsInheritFromCt] = useState(false);
  const [catLabelsLocal, setCatLabelsLocal] = useState([]);
  const [catLabelsMode, setCatLabelsMode] = useState('category');
  const [catLabelsInheritedFrom, setCatLabelsInheritedFrom] = useState('');
  const [isSavingCatLabels, setIsSavingCatLabels] = useState(false);
  
  // Create Event Form states
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTheme, setNewEventTheme] = useState('');
  const [newEventStartDate, setNewEventStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventDeadline, setNewEventDeadline] = useState('');
  const [newEventRules, setNewEventRules] = useState('');
  const [eventType, setEventType] = useState('Photography');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventVenue, setNewEventVenue] = useState('Bal-Gandharv Art Gallery, Jangali Mharaj Road Pune 411030');
  const [hasExhibition, setHasExhibition] = useState(false);
  const [exhibitionFromDate, setExhibitionFromDate] = useState('');
  const [exhibitionToDate, setExhibitionToDate] = useState('');
  const [loginBgUrl, setLoginBgUrl] = useState('');
  const [uploadingBg, setUploadingBg] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [prize1Reward, setPrize1Reward] = useState('₹50,000 Cash + Gold Trophy');
  const [prize2Reward, setPrize2Reward] = useState('₹30,000 Cash + Silver Trophy');
  const [prize3Reward, setPrize3Reward] = useState('₹20,000 Cash + Bronze Trophy');
  const [newEventPackages, setNewEventPackages] = useState([
    { name: 'Starter', price: 200, maxPhotos: 1 },
    { name: 'Amateur', price: 300, maxPhotos: 2 },
    { name: 'Pro', price: 400, maxPhotos: 5 }
  ]);
  const [selectedEventCategories, setSelectedEventCategories] = useState([]);
  const [newEventCertificates, setNewEventCertificates] = useState({ firstPrize: '', secondPrize: '', thirdPrize: '', participation: '' });
  const [uploadingCert, setUploadingCert] = useState({ firstPrize: false, secondPrize: false, thirdPrize: false, participation: false });
  const [showIncompleteGradingModal, setShowIncompleteGradingModal] = useState(false);

  useEffect(() => {
    if (events.length > 0) {
      const incompleteEvents = events.filter(e => !e.winnersPublished && e.status !== 'Completed' && e.status !== 'Results Published' && !e.gradingConfirmed);
      if (incompleteEvents.length > 0) {
        const timer = setTimeout(() => {
          setShowIncompleteGradingModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [events.length]);

  // Edit Event states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventTheme, setEditEventTheme] = useState('');
  const [editEventStartDate, setEditEventStartDate] = useState('');
  const [editEventDeadline, setEditEventDeadline] = useState('');
  const [editEventRules, setEditEventRules] = useState('');
  const [editEventType, setEditEventType] = useState('Photography');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [editEventVenue, setEditEventVenue] = useState('');
  const [editHasExhibition, setEditHasExhibition] = useState(false);
  const [editExhibitionFromDate, setEditExhibitionFromDate] = useState('');
  const [editExhibitionToDate, setEditExhibitionToDate] = useState('');
  const [editPrize1Reward, setEditPrize1Reward] = useState('');
  const [editPrize2Reward, setEditPrize2Reward] = useState('');
  const [editPrize3Reward, setEditPrize3Reward] = useState('');
  const [editEventPackages, setEditEventPackages] = useState([
    { name: 'Starter', price: 200, maxPhotos: 1 },
    { name: 'Amateur', price: 300, maxPhotos: 2 },
    { name: 'Pro', price: 400, maxPhotos: 5 }
  ]);
  const [editEventCategories, setEditEventCategories] = useState([]);
  const [editEventCertificates, setEditEventCertificates] = useState({ firstPrize: '', secondPrize: '', thirdPrize: '', participation: '' });
  const [uploadingEditCert, setUploadingEditCert] = useState({ firstPrize: false, secondPrize: false, thirdPrize: false, participation: false });

  const handleCertificateFileUpload = async (typeKey, file, isEdit = false) => {
    if (!file) return;
    const setUploading = isEdit ? setUploadingEditCert : setUploadingCert;
    const setCerts = isEdit ? setEditEventCertificates : setNewEventCertificates;

    setUploading(prev => ({ ...prev, [typeKey]: true }));
    try {
      const formData = new FormData();
      formData.append('certificateImage', file);

      const data = await apiFetch('/api/events/upload-certificate', {
        method: 'POST',
        body: formData
      });

      if (data.success && data.fileUrl) {
        setCerts(prev => ({ ...prev, [typeKey]: data.fileUrl }));
      } else {
        alert(data.message || 'Failed to upload certificate image.');
      }
    } catch (err) {
      console.error('Certificate upload error:', err);
      alert('Error uploading certificate image: ' + err.message);
    } finally {
      setUploading(prev => ({ ...prev, [typeKey]: false }));
    }
  };

  // Purge confirmation modal states
  const [showPurgeConfirmModal, setShowPurgeConfirmModal] = useState(false);
  const [purgeBackupTarget, setPurgeBackupTarget] = useState(null);

  // Activate confirmation modal states
  const [showActivateConfirmModal, setShowActivateConfirmModal] = useState(false);
  const [activateTargetId, setActivateTargetId] = useState(null);

  useEffect(() => {
    let defaultRules = '';
    let defaultDesc = '';
    const actualType = eventType;
    
    if (eventType === 'Photography') {
      defaultRules = [
        'All submissions must be captured using a DSLR or Mirrorless Camera. Mobile photography is strictly prohibited and results in immediate disqualification.',
        'Participants must upload high-resolution images in JPEG, PNG, or TIFF format. RAW files (.cr2, .nef, etc.) are highly recommended for metadata verification.',
        'Submissions must not contain watermarks, signatures, or borders added by post-processing.',
        'Basic editing (brightness, contrast, crop) is allowed. Heavily manipulated composites, AI additions, or removals are strictly forbidden.',
        'Entries must be uploaded before the submission deadline. Late entries will not be accepted under any circumstances.'
      ].join('\n');
      defaultDesc = '';
    } else if (eventType === 'Painting') {
      defaultRules = [
        'All submissions must be original hand-painted physical works (Watercolor, Acrylic, Oil, Canvas, etc.). Digital paintings are strictly prohibited.',
        'Participants must upload a clear high-resolution photograph of the physical painting under balanced lighting.',
        'Entries must not contain digital borders, frames, watermarks, or signatures.',
        'Only original artwork created solely by the participant will be considered. Plagiarism results in immediate disqualification.'
      ].join('\n');
      defaultDesc = 'Celebrate the beauty of color and texture. An open competition for physical painting entries highlighting original artistic expressions.';
    } else if (eventType === 'Drawing') {
      defaultRules = [
        'All submissions must be hand-drawn artworks (Pencil sketch, Charcoal, Ink, Pastels, etc.). Digital drawings are not allowed.',
        'Participants must upload a clear high-resolution scan or photo of the drawing.',
        'Entries must be 100% hand-made without digital enhancements or retouching.',
        'Plagiarism or copying from pre-existing copyrighted artwork is strictly prohibited.'
      ].join('\n');
      defaultDesc = 'A national championship celebrating the art of lines, shading, and sketches. Unveil your creations in pencil, charcoal, or ink.';
    } else if (eventType === 'Paper Craft') {
      defaultRules = [
        'Submissions must be original three-dimensional craft works made primarily from paper (Origami, Paper Quilling, Paper Sculptures, Paper mache, etc.).',
        'Participants must upload a clear showcase photograph displaying their craft from the best angle.',
        'Structural materials (like wire, wood or glue) must be minimal and subordinate to paper.',
        'Submissions using pre-fabricated kits or commercial templates are strictly prohibited.'
      ].join('\n');
      defaultDesc = 'Turning paper into awe-inspiring art. Join the premier national craft championship for origami and paper sculpture enthusiasts.';
    } else {
      defaultRules = [
        'All entries must be original works created by the participant.',
        'Participants must upload high-resolution images or files of their entry.',
        'Plagiarism or copying from existing works is strictly prohibited.',
        'Decisions of the evaluation panel will be final.'
      ].join('\n');
      defaultDesc = `The national ${actualType.toLowerCase()} championship. Open to all creative minds to showcase their talent in this category.`;
    }
    
    setNewEventRules(defaultRules);
    setNewEventDescription(defaultDesc);
  }, [eventType]);

  // Auto-pre-check categories based on selected contest type (Create Event Form)
  useEffect(() => {
    const actualType = eventType;
    if (actualType && categories.length > 0) {
      const assigned = categories
        .filter(c => c.contestTypes && c.contestTypes.includes(actualType))
        .map(c => c.name);
      setSelectedEventCategories(assigned);
    } else {
      setSelectedEventCategories([]);
    }
  }, [eventType, categories]);

  // Auto-pre-check categories based on selected contest type (Edit Event Form)
  useEffect(() => {
    if (!showEditModal) return;
    const actualType = editEventType;
    if (actualType && categories.length > 0) {
      const assigned = categories
        .filter(c => c.contestTypes && c.contestTypes.includes(actualType))
        .map(c => c.name);
      setEditEventCategories(assigned);
    } else {
      setEditEventCategories([]);
    }
  }, [editEventType, categories, showEditModal]);

  const [showEventSuccessModal, setShowEventSuccessModal] = useState(false);
  const [createdEventTitle, setCreatedEventTitle] = useState('');
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDeleteId, setEventToDeleteId] = useState(null);
  const [eventToDeleteTitle, setEventToDeleteTitle] = useState('');
  const [showDeleteCatModal, setShowDeleteCatModal] = useState(false);
  const [catToDeleteId, setCatToDeleteId] = useState(null);
  const [catToDeleteName, setCatToDeleteName] = useState('');
  const [showDeleteParticipantModal, setShowDeleteParticipantModal] = useState(false);
  const [participantToDeleteId, setParticipantToDeleteId] = useState(null);
  const [participantToDeleteName, setParticipantToDeleteName] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [participantToRefundId, setParticipantToRefundId] = useState(null);
  const [participantToRefundName, setParticipantToRefundName] = useState('');
  const [showDeleteJudgeModal, setShowDeleteJudgeModal] = useState(false);
  const [judgeToDeleteId, setJudgeToDeleteId] = useState(null);
  const [judgeToDeleteName, setJudgeToDeleteName] = useState('');
  const [showGeneralSuccessModal, setShowGeneralSuccessModal] = useState(false);
  const [generalSuccessTitle, setGeneralSuccessTitle] = useState('');
  const [generalSuccessMsg, setGeneralSuccessMsg] = useState('');
  
  // Suspend participant modal states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendTargetId, setSuspendTargetId] = useState(null);
  const [suspendTargetName, setSuspendTargetName] = useState('');
  const [suspendRemarks, setSuspendRemarks] = useState('');

  // Edit background image states
  const [editLoginBgUrl, setEditLoginBgUrl] = useState('');
  const [uploadingEditBg, setUploadingEditBg] = useState(false);

  // Broadcast states
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRecipient, setBroadcastRecipient] = useState('Participant');
  const [broadcastEventId, setBroadcastEventId] = useState('');
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastFilter, setBroadcastFilter] = useState('all');
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const handleSendJudgeReminder = async (pendingCount) => {
    setSendingReminder(true);
    try {
      const data = await apiFetch('/api/admin/send-evaluation-reminder', {
        method: 'POST',
        body: JSON.stringify({
          eventId: selectedEventId,
          pendingCount: pendingCount || 0
        })
      });
      if (data.success) {
        triggerSuccessModal('Reminder Sent', data.message || 'Reminder sent successfully to assigned judge(s).');
      } else {
        alert(data.message || 'Failed to send reminder');
      }
    } catch (err) {
      alert(err.message || 'Failed to send reminder to judges');
    } finally {
      setSendingReminder(false);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const data = await apiFetch('/api/admin/broadcasts');
      if (data.success) {
        setBroadcasts(data.broadcasts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerSuccessModal = (title, message) => {
    setGeneralSuccessTitle(title);
    setGeneralSuccessMsg(message);
    setShowGeneralSuccessModal(true);
  };

  useEffect(() => {
    if (user && (activeTab === 'profile_settings' || activeTab === 'notifications')) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfileMobile(user.mobile || '');
      setProfilePassword('');
      setProfileConfirmPassword('');
      setProfileError('');
      fetchBroadcasts();
    }
  }, [user, activeTab]);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage || !broadcastMessage.trim()) {
      alert('Notification message cannot be empty');
      return;
    }
    setBroadcastSubmitting(true);
    try {
      const data = await apiFetch('/api/admin/broadcasts', {
        method: 'POST',
        body: JSON.stringify({
          message: broadcastMessage.trim(),
          recipientType: broadcastRecipient,
          eventId: broadcastEventId
        })
      });
      if (data.success) {
        setBroadcastMessage('');
        fetchBroadcasts();
        triggerSuccessModal('Broadcast Sent', 'Your notification message has been successfully broadcast to all target recipients.');
      }
    } catch (err) {
      alert(err.message || 'Failed to send broadcast');
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification record?')) return;
    try {
      const data = await apiFetch(`/api/admin/broadcasts/${id}`, {
        method: 'DELETE'
      });
      if (data.success) {
        fetchBroadcasts();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete broadcast');
    }
  };

  const handleToggleArchiveBroadcast = async (id) => {
    try {
      const data = await apiFetch(`/api/admin/broadcasts/${id}/archive`, {
        method: 'POST'
      });
      if (data.success) {
        fetchBroadcasts();
      }
    } catch (err) {
      alert(err.message || 'Failed to update archive status');
    }
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUploadAdmin = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Profile photo must be less than 5 MB.');
      return;
    }

    setUploadingAvatar(true);
    setProfileError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const data = await apiFetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData
      });

      if (data.success) {
        if (refreshUser) await refreshUser();
        triggerSuccessModal('Photo Updated', 'Your profile photo has been updated successfully!');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to upload profile photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAdminMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setProfileMobile(val);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSubmitting(true);

    if (profileMobile.replace(/\D/g, '').length !== 10) {
      setProfileError('Mobile number must be exactly 10 digits');
      setProfileSubmitting(false);
      return;
    }

    if (profilePassword && profilePassword !== profileConfirmPassword) {
      setProfileError('Passwords do not match');
      setProfileSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: profileName,
        email: profileEmail,
        mobile: profileMobile
      };
      if (profilePassword) {
        payload.password = profilePassword;
      }
      const data = await updateProfile(payload);
      if (data.success) {
        setProfilePassword('');
        setProfileConfirmPassword('');
        triggerSuccessModal('Profile Updated', 'Your profile settings have been successfully updated.');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile settings');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Event History States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [eventHistory, setEventHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeHistoryEvent, setActiveHistoryEvent] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [openHistoryEventIds, setOpenHistoryEventIds] = useState(new Set());
  const [historyEventSubTabs, setHistoryEventSubTabs] = useState({});

  // Media Thumbnail Capture Helper (Video first-frame capture or Photo image base64)
  const getMediaThumbnailBase64 = (mediaUrl, isVideo = false) => {
    return new Promise((resolve) => {
      if (!mediaUrl) return resolve(null);
      const fullUrl = getBackendUrl(mediaUrl);

      // Cloudinary video thumbnail trick
      if (fullUrl.includes('cloudinary.com') && fullUrl.includes('/video/upload/')) {
        const jpgUrl = fullUrl.replace(/\.(mp4|mov|webm|mkv|avi)$/i, '.jpg');
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          try {
            const cvs = document.createElement('canvas');
            cvs.width = img.width || 320;
            cvs.height = img.height || 180;
            const ctx = cvs.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(cvs.toDataURL('image/jpeg'));
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = jpgUrl;
        return;
      }

      if (isVideo || mediaUrl.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i)) {
        // Video First Frame Capture via Canvas
        const video = document.createElement('video');
        video.crossOrigin = 'Anonymous';
        video.src = fullUrl;
        video.muted = true;
        video.playsInline = true;

        const timer = setTimeout(() => resolve(null), 3000);

        video.onloadeddata = () => {
          video.currentTime = 0.5;
        };

        video.onseeked = () => {
          clearTimeout(timer);
          try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 180;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg'));
          } catch (err) {
            resolve(null);
          }
        };

        video.onerror = () => {
          clearTimeout(timer);
          resolve(null);
        };
      } else {
        // Photo Image Capture
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          try {
            const cvs = document.createElement('canvas');
            cvs.width = img.width || 320;
            cvs.height = img.height || 180;
            const ctx = cvs.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(cvs.toDataURL('image/jpeg'));
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = fullUrl;
      }
    });
  };

  const downloadEventPDF = async (e) => {
    if (!e) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      let y = 20;

      const checkAddPage = (space = 25) => {
        if (y + space > 275) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      // Header Banner
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('COMPLETED EVENT & FINANCIAL AUDIT LEDGER', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} | Sumbaran Art Society`, 14, 26);

      // Event Metadata Box
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 42, 182, 42, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 42, 182, 42, 'S');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(e.title || 'Untitled Contest', 18, 51);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Status: ${e.status || 'FINALIZED'}   |   Type: ${e.mediaType === 'video' ? 'SHORT VIDEO & REELS CONTEST' : 'PHOTOGRAPHY CONTEST'}`, 18, 59);
      doc.text(`Submission Deadline: ${e.deadline ? new Date(e.deadline).toLocaleDateString('en-IN') : 'N/A'}`, 18, 65);
      doc.text(`Venue / Location: ${e.venue || 'Sumbaran Art Gallery, Sadashiv Peth, Pune'}`, 18, 71);
      doc.text(`Exhibition Date: ${e.exhibitionDate ? new Date(e.exhibitionDate).toLocaleDateString('en-IN') : 'N/A'}`, 18, 77);

      y = 92;

      // 1. PROFIT & LOSS FINANCIAL STATEMENT
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('1. PROFIT & LOSS FINANCIAL STATEMENT', 14, y);
      y += 6;

      const rev = e.totalRevenue || 0;
      const spon = e.totalSponsorship || 0;
      const exp = e.totalExpenses || 0;
      const net = (rev + spon) - exp;

      doc.setFillColor(236, 253, 245);
      doc.rect(14, y, 42, 18, 'F');
      doc.setFillColor(250, 245, 255);
      doc.rect(60, y, 42, 18, 'F');
      doc.setFillColor(255, 241, 242);
      doc.rect(106, y, 42, 18, 'F');
      doc.setFillColor(net >= 0 ? 238 : 255, net >= 0 ? 242 : 241, net >= 0 ? 255 : 242);
      doc.rect(152, y, 44, 18, 'F');

      doc.setFontSize(7);
      doc.setTextColor(4, 120, 87);
      doc.text('REGISTRATION REVENUE', 17, y + 5);
      doc.setTextColor(126, 34, 206);
      doc.text('SPONSORSHIPS', 63, y + 5);
      doc.setTextColor(190, 18, 60);
      doc.text('OPERATIONAL EXPENSES', 109, y + 5);
      doc.setTextColor(net >= 0 ? 67 : 190, net >= 0 ? 56 : 18, net >= 0 ? 202 : 60);
      doc.text('NET PROFIT / LOSS', 155, y + 5);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Rs. ${rev.toLocaleString()}`, 17, y + 13);
      doc.text(`Rs. ${spon.toLocaleString()}`, 63, y + 13);
      doc.text(`Rs. ${exp.toLocaleString()}`, 109, y + 13);
      doc.text(`Rs. ${net.toLocaleString()}`, 155, y + 13);

      y += 24;

      // Expenses Breakdown if present
      if (e.expenseDetails && e.expenseDetails.length > 0) {
        checkAddPage(15);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Expenses Ledger Breakdown:', 14, y);
        y += 5;
        e.expenseDetails.forEach((ex) => {
          checkAddPage(7);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(`• ${ex.title || ex.category}: Rs. ${(ex.amount || 0).toLocaleString()} (${ex.date ? new Date(ex.date).toLocaleDateString('en-IN') : 'N/A'}) - ${ex.notes || ex.paymentMode || ''}`, 18, y);
          y += 5;
        });
        y += 2;
      }

      // Sponsorships Breakdown if present
      if (e.sponsorshipDetails && e.sponsorshipDetails.length > 0) {
        checkAddPage(15);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Sponsorships & Grants Breakdown:', 14, y);
        y += 5;
        e.sponsorshipDetails.forEach((sp) => {
          checkAddPage(7);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(`• ${sp.sponsorName || sp.title}: Rs. ${(sp.amount || 0).toLocaleString()} - ${sp.tier || sp.notes || ''}`, 18, y);
          y += 5;
        });
        y += 2;
      }

      // 2. WINNERS CIRCLE - OFFICIAL DIGITAL CERTIFICATES (ACTUAL UPLOADED CERTIFICATE TEMPLATES)
      checkAddPage(60);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('2. WINNERS CIRCLE - OFFICIAL DIGITAL CERTIFICATES PREVIEW', 14, y);
      y += 6;

      if (e.winners && e.winners.length > 0) {
        // Pre-fetch actual certificate template images for all winners
        const winnersWithCerts = await Promise.all(
          e.winners.map(async (w) => {
            const rankLower = (w.rank || '').toLowerCase();
            const isFirst = rankLower.includes('1st') || rankLower.includes('first');
            const isSecond = rankLower.includes('2nd') || rankLower.includes('second');
            const certTemplateName = isFirst ? '1st-Prize.png' : isSecond ? '2nd-Prize.png' : '3rd-Prize.png';
            const customCertUrl = isFirst ? e.certificates?.firstPrize : isSecond ? e.certificates?.secondPrize : e.certificates?.thirdPrize;
            const certImgUrl = customCertUrl || `/${certTemplateName}`;
            const certThumb = await getMediaThumbnailBase64(certImgUrl, false);
            return { ...w, certThumb };
          })
        );

        winnersWithCerts.forEach((w, idx) => {
          checkAddPage(65);
          
          // Container Box
          doc.setFillColor(254, 252, 232); // Amber 50
          doc.rect(14, y, 182, 58, 'F');
          doc.setDrawColor(217, 119, 6); // Amber 600
          doc.setLineWidth(0.8);
          doc.rect(14, y, 182, 58, 'S');

          // Render ACTUAL CERTIFICATE IMAGE PREVIEW (Left side, x=18, y=y+4, width=36, height=50)
          if (w.certThumb) {
            try {
              doc.addImage(w.certThumb, 'PNG', 18, y + 4, 36, 50);
            } catch (err) {
              doc.setFillColor(230, 230, 230);
              doc.rect(18, y + 4, 36, 50, 'F');
            }
          } else {
            doc.setFillColor(240, 240, 240);
            doc.rect(18, y + 4, 36, 50, 'F');
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text('CERTIFICATE', 22, y + 28);
          }

          // Sample Watermark text box overlay
          doc.setFontSize(5);
          doc.setTextColor(220, 38, 38);
          doc.setFont('helvetica', 'bold');
          doc.text('SAMPLE CERTIFICATE - NOT VALID', 36, y + 26, { align: 'center' });

          // Certificate Details (Right side, x=60)
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(217, 119, 6);
          doc.text(`OFFICIAL WINNER CERTIFICATE (${(w.rank || 'WINNER').toUpperCase()})`, 60, y + 12);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(15, 23, 42);
          doc.text(w.userName || 'Artist Name', 60, y + 20);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          doc.text(`Winning Entry: "${w.photoTitle || 'Untitled'}"`, 60, y + 27);
          doc.text(`Contest Event: ${e.title}`, 60, y + 33);
          doc.text(`Reward Prize: ${w.reward || 'Award'}   |   Jury Grade: ${w.score || 0}/10`, 60, y + 39);

          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`Serial Number: CERT-SAS-2026-0${idx + 1}   |   Issued by: Sumbaran Art Society`, 60, y + 46);

          y += 64;
        });
      } else {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('Winners rankings have not been declared/published yet.', 18, y + 4);
        y += 12;
      }

      y += 4;

      // 3. APPROVED & DISAPPROVED SUBMISSIONS AUDIT WITH EMBEDDED PHOTO/VIDEO THUMBNAILS & JUDGE REMARKS
      checkAddPage(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('3. SUBMISSIONS AUDIT & JUDGE REMARKS', 14, y);
      y += 6;

      const rawPhotos = e.allPhotographs || [];
      if (rawPhotos.length > 0) {
        // Pre-fetch thumbnails (first frame of videos or photo images)
        const photosWithThumbs = await Promise.all(
          rawPhotos.map(async (p) => {
            const isVid = p.mediaType === 'video' || e.mediaType === 'video' || (p.fileUrl && p.fileUrl.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i));
            const thumb = await getMediaThumbnailBase64(p.fileUrl, isVid);
            return { ...p, isVid, thumb };
          })
        );

        photosWithThumbs.forEach((p, idx) => {
          checkAddPage(30);
          const isDis = p.status === 'Rejected' || p.status === 'Disapproved';
          doc.setFillColor(isDis ? 255 : 248, isDis ? 241 : 250, isDis ? 242 : 252);
          doc.rect(14, y, 182, 24, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.rect(14, y, 182, 24, 'S');

          // Render Image / First Frame Video Thumbnail inside PDF
          if (p.thumb) {
            try {
              doc.addImage(p.thumb, 'JPEG', 16, y + 2, 28, 20);
            } catch (err) {
              doc.setFillColor(210, 210, 210);
              doc.rect(16, y + 2, 28, 20, 'F');
            }
          } else {
            doc.setFillColor(220, 225, 230);
            doc.rect(16, y + 2, 28, 20, 'F');
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text(p.isVid ? 'VIDEO FRAME' : 'PHOTO', 18, y + 12);
          }

          // Item Details next to thumbnail (x = 48)
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(`${idx + 1}. "${p.title}" by ${p.participantName}`, 48, y + 7);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          doc.text(`Status: ${p.status}  |  Category: ${p.category}  |  Camera: ${p.cameraModel || p.cameraBrand || 'N/A'}  |  Avg Grade: ${p.averageScore || 0}/10`, 48, y + 13);

          const rems = (p.scores || []).filter(s => s.remarks).map(s => `"${s.remarks}" (${s.judgeName})`).join('; ');
          if (rems || isDis) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(190, 18, 60);
            doc.text(`Judge Remarks: ${rems || 'Disapproved during judge review.'}`, 48, y + 19);
          }

          y += 27;
        });
      } else {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('No photographs/videos uploaded for this contest.', 18, y + 4);
        y += 12;
      }

      y += 4;

      // 4. CONTESTANTS & PARTICIPANTS DIRECTORY
      checkAddPage(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('4. CONTESTANTS DIRECTORY', 14, y);
      y += 6;

      const parts = e.participantDetails || [];
      if (parts.length > 0) {
        parts.forEach((p, idx) => {
          checkAddPage(10);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(`${idx + 1}. ${p.name}`, 18, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(`Email: ${p.email} | Mobile: ${p.mobile} | City: ${p.city} | Status: ${p.isFinalSubmitted ? 'Finalized' : 'Draft'}`, 60, y);
          y += 6;
        });
      } else {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('No participants registered.', 18, y + 4);
        y += 12;
      }

      y += 4;

      // 5. EVALUATION JUDGES PANEL
      checkAddPage(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('5. EVALUATION JUDGES PANEL', 14, y);
      y += 6;

      if (e.judgeDetails && e.judgeDetails.length > 0) {
        e.judgeDetails.forEach((j) => {
          checkAddPage(8);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(`- Judge: ${j.name} (${j.email}) | City: ${j.city} | Sign-Off: ${j.hasConfirmed ? 'Signed Off' : 'Pending'}`, 18, y);
          y += 5;
        });
      } else {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('No judges assigned to this event.', 18, y);
        y += 8;
      }

      // Add Page Numbers Footer to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('Official Event Audit Report - Sumbaran Art Society DSLR Platform', 14, 287);
        doc.text(`Page ${i} of ${pageCount}`, 196, 287, { align: 'right' });
      }

      const filename = `${(e.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}_Official_Audit_Report.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating event PDF:', err);
      alert('Could not generate PDF for this event: ' + err.message);
    }
  };

  const downloadWinnersPDF = async (targetEventParam = null) => {
    try {
      const isAll = !targetEventParam || targetEventParam === 'all';
      let eventsToInclude = [];

      if (isAll) {
        const published = events.filter(e => e.winnersPublished || (e.winners && e.winners.length > 0));
        eventsToInclude = published.length > 0 ? published : events;
      } else {
        eventsToInclude = [targetEventParam];
      }

      if (eventsToInclude.length === 0) {
        alert('No events available to export.');
        return;
      }

      // Pre-fetch winners details if needed
      eventsToInclude = await Promise.all(eventsToInclude.map(async (e) => {
        if (e.winners && e.winners.length > 0) return e;
        try {
          const fetched = await apiFetch(`/api/events/${e._id}`);
          if (fetched && fetched.event && fetched.event.winners) {
            return fetched.event;
          }
        } catch (err) {
          console.warn(`Could not fetch details for event ${e._id}:`, err);
        }
        return e;
      }));

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      let y = 34;

      const drawHeader = (pdfDoc) => {
        // Top Left Header: SUMBARAN ART SOCIETY & Address (Matching Image 2)
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(14);
        pdfDoc.setTextColor(15, 23, 42);
        pdfDoc.text('SUMBARAN ART SOCIETY', 14, 14);

        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setFontSize(7.5);
        pdfDoc.setTextColor(71, 85, 105);
        pdfDoc.text('Address: 1414/1A, Trio Chambers, Nr. Renuka Swaroop Girls High School, Sadashiv Peth, Pune - 411030.', 14, 19);
        pdfDoc.text('Phone: +91 98765 43210  •  Email: support@sumbaranartsociety.com  •  Website: https://sumbaranartsociety.com', 14, 23.5);

        // Top Right Header Badge (Matching Image 2)
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(9.5);
        pdfDoc.setTextColor(15, 23, 42);
        pdfDoc.text('OFFICIAL WINNERS REPORT', 196, 14, { align: 'right' });

        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(71, 85, 105);
        const formattedDateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
        pdfDoc.text(`Generated: ${formattedDateStr}`, 196, 19, { align: 'right' });

        // Horizontal Line Divider across top (Matching Image 2)
        pdfDoc.setDrawColor(15, 23, 42);
        pdfDoc.setLineWidth(0.6);
        pdfDoc.line(14, 27, 196, 27);
      };

      const checkAddPage = (spaceNeeded = 25) => {
        if (y + spaceNeeded > 270) {
          doc.addPage();
          drawHeader(doc);
          y = 35;
          return true;
        }
        return false;
      };

      // Draw Top Header on Page 1
      drawHeader(doc);
      y = 35;

      if (isAll) {
        // Master Summary Box for All Events
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 18, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.rect(14, y, 182, 18, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text('CUMULATIVE WINNERS REPORT (ALL EVENTS)', 18, y + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(67, 56, 202);
        const totalWinnersCount = eventsToInclude.reduce((sum, eObj) => sum + (eObj.winners?.length || 0), 0);
        doc.text(`Total Events Included: ${eventsToInclude.length}   •   Total Declared Winners: ${totalWinnersCount}`, 18, y + 13);

        y += 24;
      }

      // Render Event Sections
      eventsToInclude.forEach((eObj, eventIdx) => {
        checkAddPage(40);

        // Event Box Header (Matching Image 2 Contest Box)
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 15, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.4);
        doc.rect(14, y, 182, 15, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('NAME OF CONTEST', 18, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        const contestTitleText = `${eventIdx + 1}. ${eObj.title || 'Untitled Contest'}`;
        doc.text(contestTitleText.length > 55 ? contestTitleText.substring(0, 52) + '...' : contestTitleText, 18, y + 11);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(67, 56, 202);
        doc.text(`${(eObj.winners || []).length} Winners Declared`, 190, y + 9, { align: 'right' });

        y += 20;

        // Table Header Row
        checkAddPage(15);
        doc.setFillColor(79, 70, 229);
        doc.rect(14, y, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('RANK', 18, y + 5.5);
        doc.text('WINNER NAME', 55, y + 5.5);
        doc.text('SUBMISSION TITLE', 115, y + 5.5);
        doc.text('SCORE', 172, y + 5.5);
        y += 8;

        const winnersList = eObj.winners || [];
        if (winnersList.length === 0) {
          checkAddPage(10);
          doc.setFillColor(255, 255, 255);
          doc.rect(14, y, 182, 9, 'F');
          doc.setDrawColor(241, 245, 249);
          doc.rect(14, y, 182, 9, 'S');
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(148, 163, 184);
          doc.text('No winners declared for this contest yet.', 18, y + 6);
          y += 12;
        } else {
          winnersList.forEach((win, idx) => {
            checkAddPage(11);
            doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
            doc.rect(14, y, 182, 10, 'F');
            doc.setDrawColor(241, 245, 249);
            doc.rect(14, y, 182, 10, 'S');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(79, 70, 229);
            doc.text(win.rank || `${idx + 1}${idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'} Place`, 18, y + 6.5);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text(win.userName || win.name || win.participantName || 'N/A', 55, y + 6.5);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const photoTitleStr = win.photoTitle || win.title || 'Untitled';
            doc.text(photoTitleStr.length > 30 ? photoTitleStr.substring(0, 28) + '...' : photoTitleStr, 115, y + 6.5);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(16, 185, 129);
            doc.text(win.score ? `${win.score}/100` : 'N/A', 172, y + 6.5);

            y += 10;
          });
          y += 6;
        }
      });

      // Add Page Numbers & Footer to all pages (Matching Image 2)
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(14, 280, 196, 280);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('Official Winner Rankings Report  •  Sumbaran Art Society', 14, 286);
        doc.text(`Page ${i} of ${pageCount}`, 196, 286, { align: 'right' });
      }

      const fileName = isAll ? `All_Events_Winners_Report.pdf` : `${(eventsToInclude[0]?.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}_Winners_Report.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating winners PDF:', err);
      alert('Could not generate Winners PDF: ' + err.message);
    }
  };
  
  // Selection/Modals
  const [selectedPhoto, setSelectedPhoto] = useState(null); // zoom / detail
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [assignJudgesPhoto, setAssignJudgesPhoto] = useState(null);
  const [selectedAssignJudges, setSelectedAssignJudges] = useState([]);

  // Winner rankings states
  const [eventToPublish, setEventToPublish] = useState(null);
  const [winnerAssignments, setWinnerAssignments] = useState([
    { rank: '1st Prize', reward: '₹50,000 Cash + Gold Trophy', submissionId: '', photoId: '', photographId: '', userName: '', photoTitle: '', fileUrl: '', score: 0 },
    { rank: '2nd Prize', reward: '₹30,000 Cash + Silver Trophy', submissionId: '', photoId: '', photographId: '', userName: '', photoTitle: '', fileUrl: '', score: 0 },
    { rank: '3rd Prize', reward: '₹20,000 Cash + Bronze Trophy', submissionId: '', photoId: '', photographId: '', userName: '', photoTitle: '', fileUrl: '', score: 0 }
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    totalSponsorship: 0,
    totalDonations: 0,
    totalFunding: 0,
    totalExpenses: 0,
    paidExpenses: 0,
    pendingExpenses: 0,
    netProfitLoss: 0
  });

  const fetchFinancialSummary = async () => {
    try {
      const activeId = selectedEventId || 'all';
      const isSpecificEvent = activeId !== 'all';
      const query = isSpecificEvent ? `?eventId=${activeId}` : '';
      const data = await apiFetch(`/api/expenses/summary${query}`);
      if (data.success && data.summary) {
        setFinancialSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching financial summary for dashboard:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const activeId = selectedEventId || 'all';
      const isSpecificEvent = activeId !== 'all';
      const eidParam = isSpecificEvent ? `&eventId=${activeId}` : '';
      const data = await apiFetch(`/api/admin/dashboard-stats?_t=${Date.now()}${eidParam}`);
      if (data.success) {
        setStats(data.stats);
        setCharts(data.charts);
      }
      await fetchFinancialSummary();
    } catch (e) {
      console.error(e);
      setError('Could not load overview statistics');
    }
  };

  const fetchParticipants = async () => {
    try {
      const activeId = selectedEventId || 'all';
      const isSpecificEvent = activeId !== 'all';
      const eidParam = isSpecificEvent ? `&eventId=${activeId}` : '';
      const url = `/api/admin/participants?search=${partSearch}&city=${partCity}&isSuspended=${partSuspended}${eidParam}`;
      const data = await apiFetch(url);
      if (data.success) {
        setParticipants(data.participants);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPhotographs = async () => {
    try {
      const activeId = selectedEventId || 'all';
      const isSpecificEvent = activeId !== 'all';
      const eidParam = isSpecificEvent ? `&eventId=${activeId}` : '';
      const url = `/api/admin/photographs?search=${photoSearch}&category=${photoCategory}&status=${photoStatus}&dslrStatus=${photoDslrStatus}${eidParam}`;
      const data = await apiFetch(url);
      if (data.success) {
        setPhotographs(data.photographs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const data = await apiFetch('/api/events/backups/list');
      if (data.success) {
        setBackups(data.backups || []);
      }
    } catch (e) {
      console.error('Error fetching event backups:', e.message);
    } finally {
      setLoadingBackups(false);
    }
  };

  const fetchJudgesAndEvents = async () => {
    try {
      const jData = await apiFetch('/api/admin/judges');
      if (jData.success) setJudges(jData.judges);

      const eData = await apiFetch('/api/events?includeDrafts=true');
      if (eData.success) setEvents(eData.events);

      const cData = await apiFetch('/api/categories');
      if (cData.success) setCategories(cData.categories);

      const ctData = await apiFetch('/api/contest-types');
      if (ctData.success) setContestTypes(ctData.contestTypes);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEventHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await apiFetch('/api/admin/events-history');
      if (data.success) {
        setEventHistory(data.history || []);
        if (data.history && data.history.length > 0) {
          setActiveHistoryEvent(data.history[0]);
          // Keep all panels closed by default when page loads
          setOpenHistoryEventIds(new Set());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        fetchJudgesAndEvents(),
        fetchParticipants(),
        fetchPhotographs(),
        fetchStats(),
        fetchBackups()
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchParticipants(),
      fetchPhotographs(),
      fetchJudgesAndEvents(),
      fetchBackups()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Re-fetch event-scoped or overall data when selectedEventId changes
  useEffect(() => {
    fetchStats();
    fetchParticipants();
    fetchPhotographs();
  }, [selectedEventId]);

  useEffect(() => {
    if (activeTab === 'event_history') {
      fetchEventHistory();
    }
  }, [activeTab]);

  // Watch filters
  useEffect(() => {
    fetchParticipants();
  }, [partSearch, partCity, partSuspended]);

  useEffect(() => {
    fetchPhotographs();
  }, [photoSearch, photoCategory, photoStatus, photoDslrStatus]);

  useEffect(() => {
    if (catLabelsMode === 'category') {
      if (categories.length > 0) {
        const activeCatId = selectedCatForDetails || categories[0]._id;
        if (!selectedCatForDetails) {
          handleSelectCatForDetails(activeCatId);
        }
      }
    } else {
      if (contestTypes.length > 0) {
        const activeCtId = selectedCtForDetails || contestTypes[0]._id;
        if (!selectedCtForDetails) {
          handleSelectCtForDetails(activeCtId);
        }
      }
    }
  }, [categories, selectedCatForDetails, selectedCtForDetails, contestTypes, catLabelsMode]);

  const handleSelectCatForDetails = (catId) => {
    setSelectedCatForDetails(catId);
    const cat = categories.find(c => c._id === catId);
    if (cat) {
      const mode = cat.customLabelsMode || 'category';
      setIsInheritFromCt(mode === 'contest_type');
      if (mode === 'contest_type') {
        const inheritedFrom = cat.customLabelsInheritedFrom || (cat.contestTypes && cat.contestTypes[0]) || '';
        const matchedCt = contestTypes.find(ct => ct.name === inheritedFrom);
        setCatLabelsLocal(matchedCt ? (matchedCt.customLabels || []) : []);
      } else {
        setCatLabelsLocal(cat.customLabels || []);
      }
    } else {
      setCatLabelsLocal([]);
      setIsInheritFromCt(false);
    }
  };

  const handleSelectCtForDetails = (ctId) => {
    setSelectedCtForDetails(ctId);
    const ct = contestTypes.find(c => c._id === ctId);
    if (ct) {
      setCatLabelsLocal(ct.customLabels || []);
    } else {
      setCatLabelsLocal([]);
    }
  };

  const handleToggleLabelsMode = (newMode) => {
    setCatLabelsMode(newMode);
    if (newMode === 'category') {
      if (categories.length > 0) {
        const catId = selectedCatForDetails || categories[0]._id;
        handleSelectCatForDetails(catId);
      } else {
        setSelectedCatForDetails('');
        setCatLabelsLocal([]);
      }
    } else {
      if (contestTypes.length > 0) {
        const ctId = selectedCtForDetails || contestTypes[0]._id;
        handleSelectCtForDetails(ctId);
      } else {
        setSelectedCtForDetails('');
        setCatLabelsLocal([]);
      }
    }
  };

  const handleToggleInheritFromCt = (checked) => {
    setIsInheritFromCt(checked);
    const activeCategoryObj = categories.find(c => c._id === selectedCatForDetails);
    if (checked) {
      const inheritedFrom = (activeCategoryObj?.contestTypes && activeCategoryObj.contestTypes[0]) || 'Photography';
      const matchedCt = contestTypes.find(ct => ct.name === inheritedFrom);
      setCatLabelsLocal(matchedCt ? (matchedCt.customLabels || []) : []);
    } else {
      setCatLabelsLocal(activeCategoryObj ? (activeCategoryObj.customLabels || []) : []);
    }
  };

  const handleChangeInheritedFrom = (ctName) => {
    setCatLabelsInheritedFrom(ctName);
    const matchedCt = contestTypes.find(ct => ct.name === ctName);
    setCatLabelsLocal(matchedCt ? (matchedCt.customLabels || []) : []);
  };

  const handleAddCatLabel = () => {
    setCatLabelsLocal([...catLabelsLocal, '']);
  };

  const handleEditCatLabel = (index, val) => {
    const updated = [...catLabelsLocal];
    updated[index] = val;
    setCatLabelsLocal(updated);
  };

  const handleDeleteCatLabel = (index) => {
    setCatLabelsLocal(catLabelsLocal.filter((_, idx) => idx !== index));
  };

  const handleReorderCatLabel = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === catLabelsLocal.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...catLabelsLocal];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCatLabelsLocal(updated);
  };

  // Contest Type labels helper functions
  const handleAddContestTypeLabel = (isEdit) => {
    if (isEdit) {
      setEditContestTypeLabels([...editContestTypeLabels, '']);
    } else {
      setNewContestTypeLabels([...newContestTypeLabels, '']);
    }
  };

  const handleEditContestTypeLabel = (isEdit, index, val) => {
    if (isEdit) {
      const updated = [...editContestTypeLabels];
      updated[index] = val;
      setEditContestTypeLabels(updated);
    } else {
      const updated = [...newContestTypeLabels];
      updated[index] = val;
      setNewContestTypeLabels(updated);
    }
  };

  const handleDeleteContestTypeLabel = (isEdit, index) => {
    if (isEdit) {
      setEditContestTypeLabels(editContestTypeLabels.filter((_, idx) => idx !== index));
    } else {
      setNewContestTypeLabels(newContestTypeLabels.filter((_, idx) => idx !== index));
    }
  };

  const handleReorderContestTypeLabel = (isEdit, index, direction) => {
    const list = isEdit ? editContestTypeLabels : newContestTypeLabels;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    if (isEdit) {
      setEditContestTypeLabels(updated);
    } else {
      setNewContestTypeLabels(updated);
    }
  };

  const handleSaveCategoryLabels = async () => {
    setIsSavingCatLabels(true);
    try {
      if (catLabelsMode === 'category') {
        if (!selectedCatForDetails) {
          alert('Please select a category first.');
          setIsSavingCatLabels(false);
          return;
        }
        const activeCategoryObj = categories.find(c => c._id === selectedCatForDetails);
        const inheritedFrom = (activeCategoryObj?.contestTypes && activeCategoryObj.contestTypes[0]) || 'Photography';
        
        const catRes = await apiFetch(`/api/categories/${selectedCatForDetails}`, {
          method: 'PUT',
          body: JSON.stringify({
            customLabelsMode: isInheritFromCt ? 'contest_type' : 'category',
            customLabelsInheritedFrom: inheritedFrom,
            customLabels: isInheritFromCt ? [] : catLabelsLocal.filter(l => l.trim() !== '')
          })
        });

        if (!catRes.success) {
          throw new Error(catRes.message || 'Failed to save category configuration.');
        }
      } else {
        if (!selectedCtForDetails) {
          alert('Please select a contest type first.');
          setIsSavingCatLabels(false);
          return;
        }
        const matchedCt = contestTypes.find(ct => ct._id === selectedCtForDetails);
        if (matchedCt) {
          const ctRes = await apiFetch(`/api/contest-types/${matchedCt._id}`, {
            method: 'PUT',
            body: JSON.stringify({
              customLabels: catLabelsLocal.filter(l => l.trim() !== '')
            })
          });
          if (!ctRes.success) {
            throw new Error(ctRes.message || 'Failed to save contest type labels.');
          }
        }
      }

      triggerSuccessModal('Configuration Saved', 'Field labels configuration saved successfully!');
      await fetchJudgesAndEvents();
    } catch (err) {
      console.error(err);
      alert('Error saving configuration: ' + err.message);
    } finally {
      setIsSavingCatLabels(false);
    }
  };

  // Actions
  const handleSuspendParticipant = async (id, isSuspended, name = '') => {
    if (isSuspended) {
      setSuspendTargetId(id);
      setSuspendTargetName(name);
      setSuspendRemarks('');
      setShowSuspendModal(true);
      return;
    }

    // Direct unsuspension execution
    try {
      const data = await apiFetch(`/api/admin/participants/${id}/suspend`, {
        method: 'PUT',
        body: JSON.stringify({ isSuspended: false, suspensionReason: '' })
      });
      if (data.success) {
        fetchParticipants();
        triggerSuccessModal('Participant Activated', 'The participant account has been successfully activated.');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const executeSuspendParticipant = async () => {
    if (!suspendTargetId) return;
    if (!suspendRemarks.trim()) {
      alert('Remarks are required to suspend.');
      return;
    }
    try {
      const data = await apiFetch(`/api/admin/participants/${suspendTargetId}/suspend`, {
        method: 'PUT',
        body: JSON.stringify({ isSuspended: true, suspensionReason: suspendRemarks.trim() })
      });
      if (data.success) {
        setShowSuspendModal(false);
        setSuspendTargetId(null);
        setSuspendTargetName('');
        setSuspendRemarks('');
        fetchParticipants();
        triggerSuccessModal('Participant Suspended', 'The participant account has been successfully suspended.');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRefundParticipant = async (id, name) => {
    setParticipantToRefundId(id);
    setParticipantToRefundName(name);
    setShowRefundModal(true);
  };

  const executeRefundParticipant = async () => {
    if (!participantToRefundId) return;
    setShowRefundModal(false);
    try {
      const data = await apiFetch(`/api/admin/participants/${participantToRefundId}/refund`, {
        method: 'POST'
      });
      if (data.success) {
        fetchParticipants();
        triggerSuccessModal('Payment Refunded', 'The participant payment has been successfully refunded and marked in the system.');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setParticipantToRefundId(null);
      setParticipantToRefundName('');
    }
  };

  const executeDeleteParticipant = async () => {
    if (!participantToDeleteId) return;
    setShowDeleteParticipantModal(false);
    try {
      const data = await apiFetch(`/api/admin/participants/${participantToDeleteId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        triggerSuccessModal('Participant Deleted', 'The participant account and all their photo submissions have been deleted successfully.');
        fetchParticipants();
        fetchPhotographs();
        fetchStats();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setParticipantToDeleteId(null);
      setParticipantToDeleteName('');
    }
  };

  const executeDeleteJudge = async () => {
    if (!judgeToDeleteId) return;
    setShowDeleteJudgeModal(false);
    try {
      const data = await apiFetch(`/api/admin/judges/${judgeToDeleteId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        triggerSuccessModal('Judge Deleted', 'The judge account has been permanently deleted and unassigned from all events.');
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setJudgeToDeleteId(null);
      setJudgeToDeleteName('');
    }
  };

  const handlePhotoStatusUpdate = async (submissionId, photoId, status, reason = '') => {
    try {
      const data = await apiFetch(`/api/admin/photographs/${submissionId}/${photoId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, rejectReason: reason })
      });
      if (data.success) {
        fetchPhotographs();
        fetchStats();
        setShowRejectModal(false);
        setRejectionReason('');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateJudge = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/admin/judges', {
        method: 'POST',
        body: JSON.stringify({
          name: newJudgeName,
          email: newJudgeEmail,
          password: newJudgePassword,
          mobile: newJudgeMobile,
          city: newJudgeCity
        })
      });
      if (data.success) {
        fetchJudgesAndEvents();
        setShowJudgeModal(false);
        setNewJudgeName('');
        setNewJudgeEmail('');
        setNewJudgePassword('');
        setNewJudgeMobile('');
        setNewJudgeCity('');
      }
    } catch (e) {
      alert(e.message);
    }
  };



  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (newCatTypes.length === 0) {
      alert('Please assign the category to at least one Contest Type.');
      return;
    }
    try {
      const data = await apiFetch('/api/categories', {
        body: JSON.stringify({ 
          name: newCatName, 
          description: newCatDesc,
          contestTypes: newCatTypes
        }),
        method: 'POST'
      });
      if (data.success) {
        const createdName = data.category?.name || newCatName;
        setNewCatName('');
        setNewCatDesc('');
        setNewCatTypes([]);
        fetchJudgesAndEvents();
        triggerSuccessModal('Category Created', `The category "${createdName}" has been created successfully.`);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (editCatTypes.length === 0) {
      alert('Please assign the category to at least one Contest Type.');
      return;
    }
    try {
      const data = await apiFetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          name: editCatName, 
          description: editCatDesc,
          contestTypes: editCatTypes
        })
      });
      if (data.success) {
        setEditingCategory(null);
        setEditCatName('');
        setEditCatDesc('');
        setEditCatTypes([]);
        triggerSuccessModal('Category Updated', 'The category and all its contest type associations have been updated.');
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEditCategoryClick = (c) => {
    setEditingCategory(c);
    setEditCatName(c.name || '');
    setEditCatDesc(c.description || '');
    setEditCatTypes(c.contestTypes || []);

    // Smooth scroll to category form container
    setTimeout(() => {
      const el = document.querySelector('.category-form-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const executeDeleteCategory = async () => {
    if (!catToDeleteId) return;
    setShowDeleteCatModal(false);
    try {
      const data = await apiFetch(`/api/categories/${catToDeleteId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        triggerSuccessModal('Category Deleted', 'The category has been deleted successfully.');
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setCatToDeleteId(null);
      setCatToDeleteName('');
    }
  };

  const handleCreateContestType = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/contest-types', {
        method: 'POST',
        body: JSON.stringify({ 
          name: newContestTypeName, 
          description: newContestTypeDesc,
          customLabels: []
        })
      });
      if (data.success) {
        setNewContestTypeName('');
        setNewContestTypeDesc('');
        setNewContestTypeLabels([]);
        triggerSuccessModal('Contest Type Created', `The contest type "${data.contestType.name}" has been created successfully.`);
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpdateContestType = async (e) => {
    e.preventDefault();
    if (!editingContestType) return;
    try {
      const data = await apiFetch(`/api/contest-types/${editingContestType._id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          name: editContestTypeName, 
          description: editContestTypeDesc
        })
      });
      if (data.success) {
        setEditingContestType(null);
        setEditContestTypeName('');
        setEditContestTypeDesc('');
        setEditContestTypeLabels([]);
        triggerSuccessModal('Contest Type Updated', `The contest type has been updated successfully.`);
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteContestType = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the contest type "${name}"? This will also remove its association from all categories.`)) return;
    try {
      const data = await apiFetch(`/api/contest-types/${id}`, {
        method: 'DELETE'
      });
      if (data.success) {
        triggerSuccessModal('Contest Type Deleted', `The contest type "${name}" has been deleted.`);
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEditContestTypeClick = (ct) => {
    setEditingContestType(ct);
    setEditContestTypeName(ct.name || '');
    setEditContestTypeDesc(ct.description || '');
    setEditContestTypeLabels(ct.customLabels || []);

    // Smooth scroll to the contest type form container
    setTimeout(() => {
      const el = document.querySelector('.contest-type-form-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleLoginBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('loginBg', file);

    setUploadingBg(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/events/upload-bg`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setLoginBgUrl(data.fileUrl);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading login background image');
    } finally {
      setUploadingBg(false);
    }
  };

  const handleEditLoginBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('loginBg', file);

    setUploadingEditBg(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/events/upload-bg`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setEditLoginBgUrl(data.fileUrl);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading login background image');
    } finally {
      setUploadingEditBg(false);
    }
  };

  const handleDownloadBackup = async (backup) => {
    const fileUrl = getBackendUrl(backup.backupPath);
    window.open(fileUrl, '_blank');

    try {
      const data = await apiFetch(`/api/events/backups/${backup._id}/downloaded`, {
        method: 'PUT'
      });
      if (data.success) {
        fetchBackups();
      }
    } catch (err) {
      console.error('Error marking backup downloaded:', err.message);
    }
  };

  const handlePurgeBackup = (backup) => {
    setPurgeBackupTarget(backup);
    setShowPurgeConfirmModal(true);
  };

  const executePurgeBackup = async () => {
    if (!purgeBackupTarget) return;
    setShowPurgeConfirmModal(false);
    try {
      const data = await apiFetch(`/api/events/backups/${purgeBackupTarget._id}/purge`, {
        method: 'DELETE'
      });
      if (data.success) {
        triggerSuccessModal('Contest Purged', 'The contest event and all associated details have been permanently deleted and purged from the portal.');
        fetchBackups();
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setPurgeBackupTarget(null);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const actualType = eventType;
      
      if (!selectedEventCategories || selectedEventCategories.length === 0) {
        alert('Please assign at least one category to this Contest Type.');
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (newEventStartDate < todayStr) {
        alert('Event start date cannot be a back-dated / past date.');
        return;
      }
      if (newEventDeadline < todayStr) {
        alert('Submission deadline cannot be a back-dated / past date.');
        return;
      }
      if (newEventDeadline < newEventStartDate) {
        alert('Submission deadline must be on or after the event start date.');
        return;
      }

      const data = await apiFetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title: newEventTitle,
          assignedCategories: selectedEventCategories,
          eventType: actualType || 'Photography',
          theme: newEventTheme,
          description: newEventDescription,
          venue: newEventVenue,
          rules: newEventRules.split('\n').filter(r => r.trim() !== ''),
          startDate: newEventStartDate,
          deadline: newEventDeadline,
          eventDate: hasExhibition && exhibitionFromDate 
            ? new Date(exhibitionFromDate) 
            : new Date(new Date(newEventDeadline).getTime() + 15 * 24 * 60 * 60 * 1000),
          hasExhibition,
          exhibitionFromDate: hasExhibition && exhibitionFromDate ? new Date(exhibitionFromDate) : null,
          exhibitionToDate: hasExhibition && exhibitionToDate ? new Date(exhibitionToDate) : null,
          loginBgUrl: loginBgUrl || null,
          prizes: [
            { rank: '1st Prize', reward: prize1Reward, description: 'Winner of the Championship Title' },
            { rank: '2nd Prize', reward: prize2Reward, description: 'Runner-up of the Championship' },
            { rank: '3rd Prize', reward: prize3Reward, description: 'Second Runner-up of the Championship' }
          ],
          faqs: [
            { question: `Is digital work allowed?`, answer: eventType === 'Photography' ? 'No. Only DSLR/Mirrorless photos are allowed.' : 'No. Only physical hand-made works are accepted.' },
            { question: 'What is the package fee?', answer: `We offer packages ranging from Starter to Pro options. View prices when starting your entry folder.` },
            { question: 'How will I receive my certificate?', answer: 'All valid participants can download a digital participation certificate directly from their dashboard after results are declared.' }
          ],
          terms: [
            'Participants retain copyright of their entries, but grant the organizer rights to showcase submissions on websites and promotional materials.',
            'Fees are non-refundable once payment is completed.',
            'The decision of the judging panel will be final and binding.'
          ],
          packages: newEventPackages.map((pkg, idx) => ({
            id: `pkg-${idx + 1}`,
            name: pkg.name,
            price: Number(pkg.price),
            maxPhotos: Number(pkg.maxPhotos)
          })),
          certificates: newEventCertificates
        })
      });
      if (data.success) {
        setCreatedEventTitle(newEventTitle);
        setShowEventSuccessModal(true);
        setNewEventTitle('');
        setNewEventTheme('');
        setNewEventDeadline('');
        setNewEventRules('');
        setEventType('Photography');
        setNewEventDescription('');
        setNewEventVenue('Bal-Gandharv Art Gallery, Jangali Mharaj Road Pune 411030');
        setHasExhibition(false);
        setExhibitionFromDate('');
        setExhibitionToDate('');
        setLoginBgUrl('');
        setNewEventCertificates({ firstPrize: '', secondPrize: '', thirdPrize: '', participation: '' });
        setPrize1Reward('₹50,000 Cash + Gold Trophy');
        setPrize2Reward('₹30,000 Cash + Silver Trophy');
        setPrize3Reward('₹20,000 Cash + Bronze Trophy');
        setNewEventPackages([
          { name: 'Starter', price: 200, maxPhotos: 1 },
          { name: 'Amateur', price: 300, maxPhotos: 2 },
          { name: 'Pro', price: 400, maxPhotos: 5 }
        ]);
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEditClick = (e) => {
    setEditingEventId(e._id);
    setEditEventTitle(e.title || '');
    setEditEventType(e.eventType || 'Photography');
    setEditEventTheme(e.theme || '');
    setEditEventDescription(e.description || '');
    setEditEventVenue(e.venue || '');
    setEditEventRules(e.rules ? e.rules.join('\n') : '');
    
    const sDate = e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : (e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : '');
    setEditEventStartDate(sDate);
    
    const dDate = e.deadline ? new Date(e.deadline).toISOString().split('T')[0] : '';
    setEditEventDeadline(dDate);
    setEditHasExhibition(!!e.hasExhibition);
    
    const fromD = e.exhibitionFromDate ? new Date(e.exhibitionFromDate).toISOString().split('T')[0] : '';
    setEditExhibitionFromDate(fromD);
    
    const toD = e.exhibitionToDate ? new Date(e.exhibitionToDate).toISOString().split('T')[0] : '';
    setEditExhibitionToDate(toD);
    setEditLoginBgUrl(e.loginBgUrl || '');
    
    const p1 = e.prizes && e.prizes.find(p => p.rank === '1st Prize');
    setEditPrize1Reward(p1 ? p1.reward : '');
    const p2 = e.prizes && e.prizes.find(p => p.rank === '2nd Prize');
    setEditPrize2Reward(p2 ? p2.reward : '');
    const p3 = e.prizes && e.prizes.find(p => p.rank === '3rd Prize');
    setEditPrize3Reward(p3 ? p3.reward : '');
    
    if (e.packages && e.packages.length > 0) {
      setEditEventPackages(e.packages.map(p => ({
        name: p.name,
        price: p.price,
        maxPhotos: p.maxPhotos
      })));
    } else {
      setEditEventPackages([
        { name: 'Starter', price: 200, maxPhotos: 1 },
        { name: 'Amateur', price: 300, maxPhotos: 2 },
        { name: 'Pro', price: 400, maxPhotos: 5 }
      ]);
    }
    setEditEventCertificates(e.certificates || { firstPrize: '', secondPrize: '', thirdPrize: '', participation: '' });
    
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const actualType = editEventType;
      
      if (!editEventCategories || editEventCategories.length === 0) {
        alert('Please assign at least one category to this Contest Type.');
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (editEventStartDate && editEventStartDate < todayStr) {
        alert('Event start date cannot be a back-dated / past date.');
        return;
      }
      if (editEventDeadline && editEventDeadline < todayStr) {
        alert('Submission deadline cannot be a back-dated / past date.');
        return;
      }
      if (editEventStartDate && editEventDeadline && editEventDeadline < editEventStartDate) {
        alert('Submission deadline must be on or after the event start date.');
        return;
      }

      const data = await apiFetch(`/api/events/${editingEventId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editEventTitle,
          assignedCategories: editEventCategories,
          eventType: actualType || 'Photography',
          theme: editEventTheme,
          description: editEventDescription,
          venue: editEventVenue,
          rules: editEventRules.split('\n').filter(r => r.trim() !== ''),
          startDate: editEventStartDate,
          deadline: editEventDeadline,
          eventDate: editHasExhibition && editExhibitionFromDate 
            ? new Date(editExhibitionFromDate) 
            : new Date(new Date(editEventDeadline).getTime() + 15 * 24 * 60 * 60 * 1000),
          hasExhibition: editHasExhibition,
          exhibitionFromDate: editHasExhibition && editExhibitionFromDate ? new Date(editExhibitionFromDate) : null,
          exhibitionToDate: editHasExhibition && editExhibitionToDate ? new Date(editExhibitionToDate) : null,
          loginBgUrl: editLoginBgUrl || null,
          prizes: [
            { rank: '1st Prize', reward: editPrize1Reward, description: 'Winner of the Championship Title' },
            { rank: '2nd Prize', reward: editPrize2Reward, description: 'Runner-up of the Championship' },
            { rank: '3rd Prize', reward: editPrize3Reward, description: 'Second Runner-up of the Championship' }
          ],
          packages: editEventPackages.map((pkg, idx) => ({
            id: `pkg-${idx + 1}`,
            name: pkg.name,
            price: Number(pkg.price),
            maxPhotos: Number(pkg.maxPhotos)
          })),
          certificates: editEventCertificates
        })
      });
      if (data.success) {
        triggerSuccessModal('Contest Updated', `The contest "${editEventTitle}" has been updated successfully.`);
        setShowEditModal(false);
        fetchJudgesAndEvents();
      } else {
        alert(data.message || 'Failed to update event');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating contest event: ' + err.message);
    }
  };

  const executeDeleteEvent = async () => {
    if (!eventToDeleteId) return;
    setShowDeleteEventModal(false);
    try {
      const data = await apiFetch(`/api/events/${eventToDeleteId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        triggerSuccessModal('Contest Deleted & Archived', 'The contest event has been successfully deleted. A complete ledger history and results snapshot PDF has been generated and archived.');
        fetchJudgesAndEvents();
        fetchBackups();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setEventToDeleteId(null);
      setEventToDeleteTitle('');
    }
  };

  const handleActivateEvent = (eventId) => {
    setActivateTargetId(eventId);
    setShowActivateConfirmModal(true);
  };

  const executeActivateEvent = async () => {
    if (!activateTargetId) return;
    try {
      const data = await apiFetch(`/api/events/${activateTargetId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Active' })
      });
      if (data.success) {
        triggerSuccessModal('Contest Activated', 'The contest event is now active and visible to all participants.');
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setShowActivateConfirmModal(false);
      setActivateTargetId(null);
    }
  };

  const handleSaveEventJudges = async () => {
    if (!selectedEventForJudges) return;
    try {
      const data = await apiFetch(`/api/events/${selectedEventForJudges._id}`, {
        method: 'PUT',
        body: JSON.stringify({ assignedJudges: selectedJudgesForEvent })
      });
      if (data.success) {
        triggerSuccessModal('Judges Updated', 'The assigned judges for this event have been updated successfully.');
        setShowAssignJudgesModal(false);
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handlePublishWinners = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch(`/api/events/${eventToPublish._id}/publish-winners`, {
        method: 'POST',
        body: JSON.stringify({ winners: winnerAssignments })
      });
      if (data.success) {
        triggerSuccessModal('Results Published', 'Contest completed successfully. Winners published. Personalized certificates generated and converted into PDF. Winners Circle has been updated successfully.');
        setEventToPublish(null);
        fetchJudgesAndEvents();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleExportCSV = (reportType, overrideEventId = '') => {
    const targetEventId = overrideEventId || selectedEventId || '';
    const token = localStorage.getItem('token');
    const baseUrl = getApiBaseUrl();
    const query = targetEventId ? `?eventId=${targetEventId}` : '';
    
    // Map reportType names to valid server routes
    let mappedType = reportType;
    if (reportType === 'financial') mappedType = 'revenue';
    if (reportType === 'photographs') mappedType = 'submissions';

    const path = `${baseUrl}/api/reports/${mappedType}${query}`;
    
    // Trigger download with headers
    fetch(path, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to export report: ${res.statusText}`);
        }
        return res.blob();
      })
    setEditPrize2Reward(p2 ? p2.reward : '');
    const p3 = e.prizes && e.prizes.find(p => p.rank === '3rd Prize');
    setEditPrize3Reward(p3 ? p3.reward : '');
    
    if (e.packages && e.packages.length > 0) {
      setEditEventPackages(e.packages.map(p => ({
        name: p.name,
        price: p.price,
        maxPhotos: p.maxPhotos
      })));
    } else {
      setEditEventPackages([
        { name: 'Starter', price: 200, maxPhotos: 1 },
        { name: 'Amateur', price: 300, maxPhotos: 2 },
        { name: 'Pro', price: 400, maxPhotos: 5 }
      ]);
    }
    setEditEventCertificates(e.certificates || { firstPrize: '', secondPrize: '', thirdPrize: '', participation: '' });
    
    setShowEditModal(true);
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#e3e7f0] dark:bg-slate-950 flex flex-col items-center justify-center">
        <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
          Loading Admin Control Panel...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden bg-[#f4f6fa] dark:bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-800 dark:text-slate-200">
      
      {/* ════════════════════ FIXED LEFT SIDEBAR (DESKTOP) ════════════════════ */}
      <aside className="hidden lg:flex w-64 bg-[#181a2e] dark:bg-[#111322] text-white flex-col justify-between shrink-0 px-4 py-6 shadow-xl border-r border-slate-800 z-30 h-full overflow-y-auto">
        <div className="flex flex-col gap-5">
          {/* Navigation Links (Starts directly at Top) */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'events', label: 'Create Event', icon: Calendar },
              { id: 'categories_config', label: 'Event Configuration', icon: Layers },
              { id: 'participants', label: 'Participants', icon: Users },
              { id: 'photographs', label: 'Submissions', icon: Camera },
              { id: 'judges', label: 'Judging', icon: Award },
              { id: 'reports', label: 'Analytics', icon: BarChart },
              { id: 'expenses', label: 'Expenses', icon: Wallet },
              { id: 'sponsorships', label: 'Sponsorships', icon: Building2 },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'event_history', label: 'Event History', icon: History }
            ].map(t => {
              const IconComponent = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id);
                    if (t.id === 'overview') setSelectedEventId('');
                    if (t.id === 'judges') setShowIncompleteGradingModal(true);
                    if (t.id === 'event_history') fetchEventHistory();
                  }}
                  className={`w-full h-10 flex items-center gap-3 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComponent size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
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
              {/* Drawer User Header (Matching Image 1) */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border-2 border-indigo-400/50 flex items-center justify-center font-black text-sm text-white shadow-md overflow-hidden shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-display font-bold text-sm text-white leading-tight">
                      {user?.name || "Amol Sathe"}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                      ADMIN
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
              <nav className="flex flex-col gap-1">
                {[
                  { id: 'event_info', label: 'Event Info', icon: Info, isExternal: true, path: '/' },
                  { id: 'gallery_results', label: 'Gallery & Results', icon: Award, isExternal: true, path: '/gallery' },
                  { id: 'contact_us', label: 'Contact Us', icon: Mail, isExternal: true, path: '/contact' },
                  { id: 'judges_portal', label: 'Judges Portal', icon: BookOpen, isExternal: true, path: '/judge/login' },
                  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'events', label: 'Create Event', icon: Calendar },
                  { id: 'categories_config', label: 'Event Configuration', icon: Layers },
                  { id: 'participants', label: 'Participants', icon: Users },
                  { id: 'photographs', label: 'Submissions', icon: Camera },
                  { id: 'judges', label: 'Judging', icon: Award },
                  { id: 'reports', label: 'Analytics', icon: BarChart },
                  { id: 'expenses', label: 'Expenses', icon: Wallet },
                  { id: 'sponsorships', label: 'Sponsorships', icon: Building2 },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'event_history', label: 'All Events History', icon: History },
                  { id: 'profile_settings', label: 'Profile Settings', icon: Sliders }
                ].map(t => {
                  const IconComponent = t.icon;
                  const isActive = !t.isExternal && activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (t.isExternal) {
                          navigate(t.path);
                          return;
                        }
                        setActiveTab(t.id);
                        if (t.id === 'overview') setSelectedEventId('');
                        if (t.id === 'judges') setShowIncompleteGradingModal(true);
                        if (t.id === 'event_history') fetchEventHistory();
                      }}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <IconComponent size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (logout) logout();
                    navigate('/login');
                  }}
                  className="w-full mt-3 py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* ════════════════════ SCROLLABLE RIGHT WORKSPACE ════════════════════ */}
      <main className={`flex-1 h-full px-4 sm:px-6 lg:px-8 py-5 min-w-0 text-left flex flex-col ${
        activeTab === 'participants' ? 'overflow-hidden' : 'overflow-y-auto'
      }`}>
        
        {/* TOP HEADER / SEARCH & USER PROFILE BAR */}
        <header className="shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div className="text-left">
            <h1 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-white leading-tight">
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'events' && 'Create Event'}
              {activeTab === 'photographs' && 'Submissions Management'}
              {activeTab === 'participants' && 'Registered Participants'}
              {activeTab === 'judges' && 'Judges & Results'}
              {activeTab === 'notifications' && 'Notification Management'}
              {activeTab === 'reports' && 'Reports & Analytics'}
              {activeTab === 'categories_config' && 'Event Configuration'}
              {activeTab === 'expenses' && 'Event Expenses'}
              {activeTab === 'sponsorships' && 'Donations & Sponsorships'}
              {activeTab === 'event_history' && 'Events History'}
              {activeTab === 'profile_settings' && 'Admin Settings'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 hidden sm:block">
              Welcome back, Admin {user?.name || "Amol Sathe"}!
            </p>
          </div>

          {/* Right Header Bar: Event Selector Dropdown, Today's Date Badge & Mobile Toggle Menu */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-between sm:justify-end">
            {!['events', 'categories', 'categories_config', 'event_history'].includes(activeTab) && (
              <div className="relative flex items-center shrink-0 flex-1 sm:flex-none sm:w-auto">
                <select
                  value={selectedEventId || 'all'}
                  onChange={(e) => setSelectedEventId(e.target.value === 'all' ? '' : e.target.value)}
                  className="w-full sm:w-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-xs py-2.5 pl-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs focus:outline-none focus:border-indigo-600 cursor-pointer appearance-none min-w-[200px] sm:min-w-[240px]"
                >
                  <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                    All Events (Combined Ledger)
                  </option>
                  {allEvents.map(ev => (
                    <option key={ev._id || ev.id} value={ev._id || ev.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                      {ev.title} {ev.status ? `(${ev.status})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3.5 text-slate-400 pointer-events-none" />
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-xs">
              <Calendar size={14} className="text-indigo-600" />
              <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Tabs Subnav with Left & Right Arrows (< lg) */}
        <div className="block lg:hidden mb-5 shrink-0">
          <ScrollableTabs
            items={[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'events', label: 'Create Event', icon: Calendar },
              { id: 'categories_config', label: 'Event Config', icon: Layers },
              { id: 'participants', label: 'Participants', icon: Users },
              { id: 'photographs', label: 'Submissions', icon: Camera },
              { id: 'judges', label: 'Judging', icon: Award },
              { id: 'reports', label: 'Analytics', icon: BarChart },
              { id: 'expenses', label: 'Expenses', icon: Wallet },
              { id: 'sponsorships', label: 'Sponsorships', icon: Building2 },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'event_history', label: 'History', icon: History }
            ]}
            activeId={activeTab}
            onSelect={(id) => {
              setActiveTab(id);
              if (id === 'overview') setSelectedEventId('');
              if (id === 'judges') setShowIncompleteGradingModal(true);
              if (id === 'event_history') fetchEventHistory();
            }}
          />
        </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Financial Card 1: Total Revenue */}
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
              <span className="text-[10px] sm:text-[11px] text-emerald-900 dark:text-emerald-300 font-extrabold uppercase tracking-wider">
                TOTAL REVENUE {selectedEventId ? '(SELECTED)' : '(CUMULATIVE)'}
              </span>
              <p className="font-display font-black text-xl sm:text-2xl text-emerald-950 dark:text-white">
                ₹{(financialSummary?.totalRevenue || stats?.totalRevenue || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-300/80">Successful payments volume</span>
            </div>

            {/* Financial Card 2: Donation & Sponsorship */}
            <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
              <span className="text-[10px] sm:text-[11px] text-purple-900 dark:text-purple-300 font-extrabold uppercase tracking-wider">
                DONATION & SPONSORSHIP {selectedEventId ? '(SELECTED)' : '(CUMULATIVE)'}
              </span>
              <p className="font-display font-black text-xl sm:text-2xl text-purple-950 dark:text-white">
                ₹{(financialSummary?.totalFunding || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] font-semibold text-purple-700/80 dark:text-purple-300/80">CSR, Corporate & Donor grants</span>
            </div>

            {/* Financial Card 3: Total Expenses */}
            <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
              <span className="text-[10px] sm:text-[11px] text-rose-900 dark:text-rose-300 font-extrabold uppercase tracking-wider">
                TOTAL EXPENSES {selectedEventId ? '(SELECTED)' : '(CUMULATIVE)'}
              </span>
              <p className="font-display font-black text-xl sm:text-2xl text-rose-950 dark:text-white">
                ₹{(financialSummary?.totalExpenses || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] font-semibold text-rose-700/80 dark:text-rose-300/80">Operational line items</span>
            </div>

            {/* Financial Card 4: Net Profit / Loss */}
            <div className={`border rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md ${
              (financialSummary?.netProfitLoss || 0) >= 0
                ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800'
                : 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800'
            }`}>
              <span className="text-[10px] sm:text-[11px] text-sky-900 dark:text-sky-300 font-extrabold uppercase tracking-wider">
                NET PROFIT / LOSS {selectedEventId ? '(SELECTED)' : '(CUMULATIVE)'}
              </span>
              <p className={`font-display font-black text-xl sm:text-2xl ${
                (financialSummary?.netProfitLoss || 0) >= 0 ? 'text-sky-950 dark:text-white' : 'text-red-950 dark:text-white'
              }`}>
                ₹{(financialSummary?.netProfitLoss || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] font-semibold text-sky-700/80 dark:text-sky-300/80">
                {(financialSummary?.netProfitLoss || 0) >= 0 ? 'Surplus balance' : 'Deficit shortfall'}
              </span>
            </div>
          </div>

          {/* Row 2: Operational & Payout Cards Grid - 4 Cards below in a row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Total Participants */}
            <div className="bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
              <span className="text-[10px] sm:text-[11px] text-sky-900 dark:text-sky-300 font-extrabold uppercase tracking-wider">TOTAL PARTICIPANTS</span>
              <p className="font-display font-black text-xl sm:text-2xl text-sky-950 dark:text-white">
                {stats?.totalParticipants || 0}
              </p>
              <span className="text-[10px] font-semibold text-sky-700/80 dark:text-sky-300/80">{stats?.todayRegistrations || 0} added today</span>
            </div>

            {/* Card 2: Active Entries */}
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
              <span className="text-[10px] sm:text-[11px] text-amber-900 dark:text-amber-300 font-extrabold uppercase tracking-wider">ACTIVE ENTRIES</span>
              <p className="font-display font-black text-xl sm:text-2xl text-amber-950 dark:text-white">
                {stats?.totalEntries || 0}
              </p>
              <span className="text-[10px] font-semibold text-amber-700/80 dark:text-amber-300/80">Locked submission folders</span>
            </div>

            {/* Card 3: Total Photographs / Videos Combined */}
            <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
              <span className="text-[10px] sm:text-[11px] text-purple-900 dark:text-purple-300 font-extrabold uppercase tracking-wider">
                TOTAL PHOTOGRAPHS / VIDEOS
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="font-display font-black text-xl sm:text-2xl text-purple-950 dark:text-white">
                  {(stats?.totalPhotos || 0) + (stats?.totalVideos || 0)}
                </p>
                <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 bg-purple-200/80 dark:bg-purple-900/60 px-2 py-0.5 rounded-lg border border-purple-300 dark:border-purple-700">
                  {stats?.totalPhotos || 0} Photos / {stats?.totalVideos || 0} Videos
                </span>
              </div>
              <span className="text-[10px] font-semibold text-purple-700/80 dark:text-purple-300/80">
                High-res images & video media assets
              </span>
            </div>

            {/* Card 4: Paid / Settled */}
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
              <span className="text-[10px] sm:text-[11px] text-emerald-900 dark:text-emerald-300 font-extrabold uppercase tracking-wider">
                PAID / SETTLED {selectedEventId ? '(SELECTED)' : '(CUMULATIVE)'}
              </span>
              <p className="font-display font-black text-xl sm:text-2xl text-emerald-950 dark:text-white">
                ₹{(financialSummary?.paidExpenses || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-300/80">Cleared vendor payouts</span>
            </div>
          </div>

          {/* Recharts Analytics Panel */}
          <StatsCharts 
            dailyStats={charts?.dailyStats || []} 
            categoryStats={charts?.categoryStats || []} 
            eventStats={charts?.eventStats || []}
            eventsList={charts?.eventsList || []}
            selectedEventId={selectedEventId}
            selectedEventTitle={selectedEvent?.title}
          />
        </div>
      )}

      {/* TAB 2: PARTICIPANTS */}
      {activeTab === 'participants' && (
        <div className="flex-1 min-h-0 flex flex-col glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm animate-in fade-in duration-200 overflow-hidden">
          
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-2">
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                placeholder="Search name, email, mobile..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <select
                value={partParticipantFilter}
                onChange={(e) => setPartParticipantFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none font-semibold cursor-pointer"
              >
                <option value="">All Participants</option>
                {[...new Set(participants.map(p => p.name))].map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              <select
                value={partCity}
                onChange={(e) => setPartCity(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <option value="">All Cities</option>
                {[...new Set(participants.map(p => p.city))].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={partPaymentFilter}
                onChange={(e) => setPartPaymentFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <option value="">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>

              <select
                value={partSuspended}
                onChange={(e) => setPartSuspended(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <option value="">All Accounts</option>
                <option value="false">Active</option>
                <option value="true">Suspended</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs z-10 shadow-2xs">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 pl-4 pr-4">Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Package</th>
                  <th className="py-3 px-4 text-center">Photos</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {participants
                  .filter(p => !partParticipantFilter || p.name === partParticipantFilter)
                  .filter(p => {
                    if (!partPaymentFilter) return true;
                    if (partPaymentFilter === 'Paid') return p.paymentStatus === 'Paid';
                    if (partPaymentFilter === 'Unpaid') return p.paymentStatus !== 'Paid';
                    return true;
                  })
                  .map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3.5 pr-4">
                       <div className="flex items-center gap-2">
                         <p className="font-semibold text-slate-900 dark:text-white">{p.name}</p>
                         {p.isSuspended && (
                           <span className="px-1.5 py-0.5 rounded font-bold text-[8px] bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 uppercase tracking-wider shrink-0">
                             Suspended
                           </span>
                         )}
                       </div>
                       <span className="text-[10px] text-slate-400 block">{p.email}</span>
                     </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{p.mobile}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{p.city}</td>
                    <td className="py-3.5 px-4 text-center text-indigo-600 dark:text-indigo-400 font-semibold">
                      {p.packageId === 'pkg-1' ? 'Starter' : p.packageId === 'pkg-2' ? 'Amateur' : p.packageId === 'pkg-3' ? 'Pro' : 'None'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">{p.photosCount}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        p.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                          : p.paymentStatus === 'Refunded'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                            : p.paymentStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600 dark:bg-red-950/20'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">
                      {p.lastLogin ? new Date(p.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-3.5 pl-4 pr-6 text-right">
                      <div className="flex justify-end items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedParticipant(p)}
                          className="min-w-9 min-h-9 p-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 rounded-xl cursor-pointer transition-colors shadow-2xs flex items-center justify-center shrink-0"
                          data-tooltip="Audit Profile Details"
                          title="Audit Profile Details"
                        >
                          <FileCheck size={18} className="shrink-0" />
                        </button>
                        <button
                          onClick={() => handleSuspendParticipant(p._id, !p.isSuspended, p.name)}
                          className={`min-w-9 min-h-9 p-2 rounded-xl border cursor-pointer transition-colors shadow-2xs flex items-center justify-center shrink-0 ${
                            p.isSuspended 
                              ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300' 
                              : 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                          }`}
                          data-tooltip={p.isSuspended ? 'Activate User' : 'Suspend User'}
                          title={p.isSuspended ? 'Activate User' : 'Suspend User'}
                        >
                          <Ban size={18} className="shrink-0" />
                        </button>
                        {(p.paymentStatus === 'Paid' || p.paymentStatus === 'Withdrawn') && (
                          <button
                            onClick={() => handleRefundParticipant(p._id, p.name)}
                            className="min-w-9 min-h-9 p-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 rounded-xl cursor-pointer transition-colors shadow-2xs flex items-center justify-center shrink-0"
                            data-tooltip="Refund & Credit Payment"
                            title="Refund & Credit Payment"
                          >
                            <RotateCcw size={18} className="shrink-0" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setParticipantToDeleteId(p._id);
                            setParticipantToDeleteName(p.name);
                            setShowDeleteParticipantModal(true);
                          }}
                          className="min-w-9 min-h-9 p-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 rounded-xl cursor-pointer transition-colors shadow-2xs flex items-center justify-center shrink-0"
                          data-tooltip="Delete User & Submissions"
                          title="Delete User & Submissions"
                        >
                          <Trash2 size={18} className="shrink-0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {participants.length === 0 && (
              <div className="text-center text-slate-400 py-12">No registered participants match this filter criteria.</div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: PHOTOGRAPHS APPROVAL & ASSIGNMENT */}
      {activeTab === 'photographs' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* Filters row */}
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={photoSearch}
                onChange={(e) => setPhotoSearch(e.target.value)}
                placeholder="Search title, participant, camera..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
              <select
                value={selectedParticipantFilter}
                onChange={(e) => setSelectedParticipantFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 sm:px-3 py-2 sm:py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] sm:text-xs focus:outline-none cursor-pointer font-semibold truncate"
              >
                <option value="">All Participants</option>
                {Array.from(new Set(participants.map(p => p.name).filter(Boolean))).sort().map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              {(() => {
                const activeEvent = events.find(e => e.status === 'Active') || events[0];
                return (
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value)}
                    className="w-full sm:w-auto px-2.5 sm:px-3 py-2 sm:py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] sm:text-xs focus:outline-none cursor-pointer font-semibold truncate"
                  >
                    <option value="">All Categories</option>
                    {categories
                      .filter(c => !activeEvent?.eventType || (c.contestTypes && c.contestTypes.includes(activeEvent.eventType)))
                      .map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))
                    }
                  </select>
                );
              })()}
            </div>
          </div>

          {(() => {
            const activeEvent = (selectedEventId && selectedEventId !== 'all') ? events.find(e => e._id === selectedEventId) : null;
            const filteredPhotos = photographs.filter(p => {
              if (selectedEventId && selectedEventId !== 'all' && String(p.eventId) !== String(selectedEventId)) {
                return false;
              }
              if (selectedParticipantFilter && p.participantName !== selectedParticipantFilter) {
                return false;
              }
              if (photoCategory && p.category !== photoCategory) {
                return false;
              }
              if (photoSearch) {
                const s = photoSearch.toLowerCase();
                const titleMatch = (p.title || '').toLowerCase().includes(s);
                const nameMatch = (p.participantName || '').toLowerCase().includes(s);
                const cameraMatch = (p.cameraBrand || p.cameraModel || '').toLowerCase().includes(s);
                if (!titleMatch && !nameMatch && !cameraMatch) return false;
              }
              return true;
            });

            const judgedPhotos = filteredPhotos.filter(p => p.scores && p.scores.length > 0);
            const approvedPhotos = judgedPhotos.filter(p => p.scores.every(s => (s.approvalStatus || 'Approved') === 'Approved'));
            const disapprovedPhotos = judgedPhotos.filter(p => p.scores.some(s => s.approvalStatus === 'Disapproved'));
            const pendingPhotos = filteredPhotos.filter(p => !p.scores || p.scores.length === 0);

            return (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {/* Card 1: Approved by Judges */}
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      APPROVED BY JUDGES
                    </span>
                    <p className="font-display font-black text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400">
                      {approvedPhotos.length}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-300/80">
                      Approved submission entries
                    </span>
                  </div>
                  
                  {/* Card 2: Disapproved by Judges */}
                  <div className="bg-red-50/70 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-red-800 dark:text-red-300">
                      DISAPPROVED BY JUDGES
                    </span>
                    <p className="font-display font-black text-xl sm:text-2xl text-red-600 dark:text-red-400">
                      {disapprovedPhotos.length}
                    </p>
                    <span className="text-[10px] font-semibold text-red-700/80 dark:text-red-300/80">
                      Disapproved submission entries
                    </span>
                  </div>

                  {/* Card 3: Pending Evaluation */}
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      PENDING EVALUATION
                    </span>
                    <p className="font-display font-black text-xl sm:text-2xl text-amber-600 dark:text-amber-400">
                      {pendingPhotos.length}
                    </p>
                    <span className="text-[10px] font-semibold text-amber-700/80 dark:text-amber-300/80">
                      Awaiting judge evaluation
                    </span>
                  </div>

                  {/* Card 4: Total Evaluated */}
                  <div className="bg-sky-50/70 dark:bg-sky-950/30 border-2 border-sky-300 dark:border-sky-700 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-sky-900 dark:text-sky-300">
                      TOTAL EVALUATED
                    </span>
                    <p className="font-display font-black text-xl sm:text-2xl text-sky-700 dark:text-sky-300">
                      {judgedPhotos.length}
                    </p>
                    <span className="text-[10px] font-semibold text-sky-700/80 dark:text-sky-300/80">
                      Scored by jury panel
                    </span>
                  </div>

                  {/* Card 5: TOTAL PHOTOGRAPHS / VIDEOS Card */}
                  <div className="bg-purple-50/70 dark:bg-purple-950/30 border-2 border-purple-300 dark:border-purple-700 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                      {(activeEvent && (activeEvent.mediaType === 'video' || String(activeEvent.eventType).toLowerCase().includes('video') || String(activeEvent.eventType).toLowerCase().includes('reel'))) ? 'TOTAL VIDEOS' : 'TOTAL PHOTOGRAPHS / VIDEOS'}
                    </span>
                    <p className="font-display font-black text-xl sm:text-2xl text-purple-600 dark:text-purple-400">
                      {filteredPhotos.length}
                    </p>
                    <span className="text-[10px] font-semibold text-purple-700/80 dark:text-purple-300/80">
                      {(activeEvent && (activeEvent.mediaType === 'video' || String(activeEvent.eventType).toLowerCase().includes('video') || String(activeEvent.eventType).toLowerCase().includes('reel'))) ? 'Short video assets' : 'Verified submission assets'}
                    </span>
                  </div>
                </div>

                {/* Approved photos section */}
                <div className="glass-panel border border-emerald-250 dark:border-emerald-900/40 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <ThumbsUp size={16} className="text-emerald-500" />
                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Approved by Judges ({approvedPhotos.length})</h3>
                  </div>
                  
                  {approvedPhotos.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                      {approvedPhotos.map((photo) => {
                        const avgScore = photo.scores.length > 0
                          ? (photo.scores.reduce((a, s) => a + (s.averageScore || 0), 0) / photo.scores.length).toFixed(1)
                          : '0.0';
                        return (
                          <div 
                            key={photo.photoId}
                            onClick={() => setSelectedPhoto(photo)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-zoom-in flex flex-col justify-between group"
                          >
                            <div className="w-full aspect-video bg-slate-950 relative overflow-hidden flex items-center justify-center">
                              {photo.mediaType === 'video' || photo.fileUrl?.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i) || photo.fileUrl?.includes('/video/upload/') ? (
                                <video 
                                  src={getBackendUrl(photo.fileUrl)} 
                                  autoPlay 
                                  loop 
                                  muted 
                                  playsInline 
                                  crossOrigin="anonymous"
                                  referrerPolicy="no-referrer"
                                  preload="metadata"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                />
                              ) : (
                                <img 
                                  src={getBackendUrl(photo.fileUrl)} 
                                  alt={photo.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  crossOrigin="anonymous"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                <Star size={8} fill="white" /> {avgScore}/10
                              </span>
                            </div>
                            <div className="p-3 flex flex-col gap-0.5 text-left">
                              <h4 className="font-display font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                {photo.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-semibold truncate">
                                By: {photo.participantName}
                              </p>
                              <p className="text-[9px] text-indigo-500 font-semibold truncate uppercase tracking-wider">
                                {photo.cameraModel}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-6 text-xs italic">No approved entries yet.</div>
                  )}
                </div>

                {/* Disapproved photos section */}
                {disapprovedPhotos.length > 0 && (
                  <div className="glass-panel border border-red-250 dark:border-red-900/40 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <ThumbsDown size={16} className="text-red-500" />
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Disapproved by Judges ({disapprovedPhotos.length})</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                      {disapprovedPhotos.map((photo) => {
                        const avgScore = photo.scores.length > 0
                          ? (photo.scores.reduce((a, s) => a + (s.averageScore || 0), 0) / photo.scores.length).toFixed(1)
                          : '0.0';
                        return (
                          <div 
                            key={photo.photoId}
                            onClick={() => setSelectedPhoto(photo)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-zoom-in flex flex-col justify-between group"
                          >
                            <div className="w-full aspect-video bg-slate-950 relative overflow-hidden flex items-center justify-center">
                              {photo.mediaType === 'video' || photo.fileUrl?.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i) || photo.fileUrl?.includes('/video/upload/') ? (
                                <video 
                                  src={getBackendUrl(photo.fileUrl)} 
                                  autoPlay 
                                  loop 
                                  muted 
                                  playsInline 
                                  crossOrigin="anonymous"
                                  referrerPolicy="no-referrer"
                                  preload="metadata"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                />
                              ) : (
                                <img 
                                  src={getBackendUrl(photo.fileUrl)} 
                                  alt={photo.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  crossOrigin="anonymous"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                Disapproved
                              </span>
                            </div>
                            <div className="p-3 flex flex-col gap-0.5 text-left">
                              <h4 className="font-display font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                {photo.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-semibold truncate">
                                By: {photo.participantName}
                              </p>
                              <p className="text-[9px] text-indigo-500 font-semibold truncate uppercase tracking-wider">
                                {photo.cameraModel}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pending Evaluation section */}
                {pendingPhotos.length > 0 && (
                  <div className="glass-panel border border-slate-250 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <Camera size={16} className="text-amber-500" />
                        <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Pending Evaluation ({pendingPhotos.length})</h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendJudgeReminder(pendingPhotos.length)}
                        disabled={sendingReminder || pendingPhotos.length === 0}
                        className="px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-sm hover:shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        title="Send evaluation reminder notification to assigned judge(s)"
                      >
                        <BellRing size={14} className={sendingReminder ? 'animate-bounce' : ''} />
                        <span>{sendingReminder ? 'Sending Reminder...' : 'Send Reminder'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                      {pendingPhotos.map((photo) => (
                        <div 
                          key={photo.photoId}
                          onClick={() => setSelectedPhoto(photo)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-zoom-in flex flex-col justify-between group"
                        >
                          <div className="w-full aspect-video bg-slate-950 relative overflow-hidden flex items-center justify-center">
                            {photo.mediaType === 'video' || photo.fileUrl?.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i) || photo.fileUrl?.includes('/video/upload/') ? (
                              <video 
                                src={getBackendUrl(photo.fileUrl)} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                preload="metadata"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                              />
                            ) : (
                              <img 
                                src={getBackendUrl(photo.fileUrl)} 
                                alt={photo.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                              Pending
                            </span>
                          </div>
                          <div className="p-3 flex flex-col gap-0.5 text-left">
                            <h4 className="font-display font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {photo.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold truncate">
                              By: {photo.participantName}
                            </p>
                            <p className="text-[9px] text-amber-500 font-semibold truncate uppercase tracking-wider">
                              {photo.cameraModel}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredPhotos.length === 0 && (
                  <div className="text-center text-slate-400 py-12 italic text-xs">No uploaded photographs match this query.</div>
                )}
              </>
            );
          })()}

        </div>
      )}

      {/* TAB: EVENT EXPENSES */}
      {activeTab === 'expenses' && (
        <AdminExpenses
          allEvents={allEvents}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
        />
      )}

      {/* TAB: DONATION & SPONSORSHIP */}
      {activeTab === 'sponsorships' && (
        <AdminSponsorships
          allEvents={allEvents}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
        />
      )}

      {/* TAB: REPORTS */}
      {activeTab === 'reports' && (
        <AdminReports
          allEvents={allEvents}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
        />
      )}

      {/* TAB 4: JUDGES AND COMPETITION RESULTS */}
      {activeTab === 'judges' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          
          {/* Left Column: Judges account creator & list */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Create Judge Account */}
            <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 pr-3">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Contest Judges</h3>
                <button
                  onClick={() => setShowJudgeModal(true)}
                  className="min-w-8 min-h-8 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer flex items-center justify-center transition-colors shadow-2xs shrink-0"
                  title="Create Judge Account"
                  data-tooltip="Create Judge Account"
                >
                  <Plus size={16} className="shrink-0" />
                </button>
              </div>

              {/* Judges List */}
              <div className="flex flex-col gap-3 mt-4">
                {judges.map(j => (
                  <div key={j._id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-905 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{j.name}</p>
                      <span className="text-[9px] text-slate-400">{j.email} • {j.city}</span>
                    </div>
                    <button
                      onClick={() => {
                        setJudgeToDeleteId(j._id);
                        setJudgeToDeleteName(j.name);
                        setShowDeleteJudgeModal(true);
                      }}
                      className="min-w-8 min-h-8 p-1.5 bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 rounded-xl cursor-pointer transition-colors border border-red-100 dark:border-red-900/30 flex items-center justify-center shrink-0"
                      data-tooltip="Delete Judge permanently"
                    >
                      <Trash2 size={16} className="shrink-0" />
                    </button>
                  </div>
                ))}
                {judges.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No judge accounts created yet.</p>
                )}
              </div>
            </div>

            {/* Results Exporter - Display selected event or all events */}
            <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Winner Rankings Export</h3>
                <p className="text-[11px] text-slate-400">Download official PDF reports for contest winner rankings</p>
              </div>

              <div className="flex flex-col gap-3">
                {(() => {
                  const targetEvent = events.find(e => e._id === selectedEventId);
                  const eventsToDisplay = targetEvent ? [targetEvent] : events;

                  if (eventsToDisplay.length === 0) {
                    return <p className="text-xs text-slate-400 text-center py-4">No events found.</p>;
                  }

                  return eventsToDisplay.map(e => (
                    <div key={e._id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs gap-2">
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="font-bold text-slate-900 dark:text-white truncate">{e.title}</span>
                        <span className="text-[10px] text-slate-400">{e.eventType || 'Contest'} • {e.status}</span>
                      </div>
                      {e.winnersPublished ? (
                        <button
                          onClick={() => downloadWinnersPDF(e)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold cursor-pointer text-xs shadow-xs transition-all shrink-0"
                          title="Download Event Winners PDF"
                        >
                          <Download size={13} />
                          Export Winners PDF
                        </button>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0">
                          Grades Pending
                        </span>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>

          </div>

          {/* Right Column: Leaderboard / Publish results */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                    Score Leaderboard & Results Declaration
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Manage judge assignments, review evaluation progress, and publish winners for the selected event</p>
                </div>
              </div>

              <div className="flex flex-col gap-6 mt-4">
                {/* Render contest cards: if All Events selected, render all Completed and Results Published events */}
                {(() => {
                  const isAllEvents = !selectedEventId || selectedEventId === 'all';
                  const eventsToDisplay = isAllEvents
                    ? events.filter(e => e.winnersPublished || e.status === 'Completed' || e.status === 'Results Published')
                    : (events.find(e => e._id === selectedEventId) ? [events.find(e => e._id === selectedEventId)] : []);

                  if (eventsToDisplay.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                        {isAllEvents ? 'No completed or results published events found.' : 'No assigned event found.'}
                      </div>
                    );
                  }

                  return eventsToDisplay.map(e => {
                  // Calculate rank averages for this event specifically (only paid ones)
                  const eventPhotos = photographs.filter(p => p.eventId === e._id);
                  const finalPhotos = eventPhotos;
                  const gradedPhotos = eventPhotos.filter(p => p.scores && p.scores.length > 0);

                  // Sort graded photos by score (total or average)
                  gradedPhotos.sort((a, b) => b.averageScore - a.averageScore);

                  const assignedJudges = e.assignedJudges || [];
                  const totalRequiredReviews = finalPhotos.length * assignedJudges.length;
                  let completedReviews = 0;
                  finalPhotos.forEach(p => {
                    p.scores.forEach(s => {
                      if (assignedJudges.includes(s.judgeId)) {
                        completedReviews++;
                      }
                    });
                  });

                  const confirmedJudgesList = e.confirmedJudges || [];
                  const allConfirmed = assignedJudges.every(jId => confirmedJudgesList.includes(jId));
                  const approvalsPending = assignedJudges.length === 0 || completedReviews < totalRequiredReviews || !allConfirmed;

                  const pendingJudges = [];
                  if (approvalsPending && assignedJudges.length > 0) {
                    assignedJudges.forEach(jId => {
                      const judgeObj = judges.find(j => j._id === jId);
                      if (judgeObj) {
                        let gradedCount = 0;
                        finalPhotos.forEach(p => {
                          if (p.scores.some(s => s.judgeId === jId)) {
                            gradedCount++;
                          }
                        });
                        
                        const isConfirmed = confirmedJudgesList.includes(jId);
                        if (gradedCount < finalPhotos.length) {
                          pendingJudges.push({
                            name: judgeObj.name,
                            statusText: `${finalPhotos.length - gradedCount} left`
                          });
                        } else if (!isConfirmed) {
                          pendingJudges.push({
                            name: judgeObj.name,
                            statusText: 'Awaiting Confirmation'
                          });
                        }
                      }
                    });
                  }

                  return (
                    <div key={e._id} className="flex flex-col gap-4 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm">{e.title}</h4>
                          <span className="text-[10px] text-slate-400">Deadline: {new Date(e.deadline).toLocaleDateString()}</span>
                        </div>
                        
                        {!e.winnersPublished ? (
                          <button
                            disabled={approvalsPending || finalPhotos.length === 0}
                            onClick={() => {
                              setEventToPublish(e);
                              // Seed top 3 photos from leaderboard
                              const updatedWinners = [...winnerAssignments];
                              for (let idx = 0; idx < 3; idx++) {
                                if (gradedPhotos[idx]) {
                                  updatedWinners[idx].submissionId = gradedPhotos[idx].submissionId;
                                  updatedWinners[idx].photoId = gradedPhotos[idx].photoId;
                                  updatedWinners[idx].photographId = gradedPhotos[idx].photoId;
                                  updatedWinners[idx].userName = gradedPhotos[idx].participantName;
                                  updatedWinners[idx].photoTitle = gradedPhotos[idx].title;
                                  updatedWinners[idx].fileUrl = gradedPhotos[idx].fileUrl;
                                  updatedWinners[idx].score = gradedPhotos[idx].averageScore;
                                }
                              }
                              setWinnerAssignments(updatedWinners);
                            }}
                            className={`font-bold text-xs py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
                              approvalsPending || finalPhotos.length === 0
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none dark:bg-slate-800"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                            }`}
                          >
                            Assign Winners & Publish
                          </button>
                        ) : (
                          <span className="text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 px-3 py-1 rounded font-bold">Results Published</span>
                        )}
                      </div>

                      {/* Assigned Judges display */}
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-2.5 rounded-xl text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Event Judges:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {assignedJudges.length > 0 ? (
                              assignedJudges.map(jId => {
                                const judgeObj = judges.find(j => j._id === jId);
                                return (
                                  <span key={jId} className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 px-2 py-0.5 rounded font-medium">
                                    {judgeObj ? judgeObj.name : 'Unknown Judge'}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-amber-600 italic">No judges assigned.</span>
                            )}
                          </div>
                        </div>
                        {e.status !== 'Completed' && (
                          <button
                            onClick={() => {
                              setSelectedEventForJudges(e);
                              setSelectedJudgesForEvent(e.assignedJudges || []);
                              setShowAssignJudgesModal(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] py-1.5 px-3 rounded-lg cursor-pointer transition-all font-semibold shadow-sm"
                          >
                            Assign Judges
                          </button>
                        )}
                      </div>

                      {/* Grading and Approval Progress */}
                      <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 rounded-xl">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Grading Progress:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {completedReviews} / {totalRequiredReviews} Reviews Completed
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${approvalsPending ? 'bg-amber-500' : 'bg-emerald-600'}`}
                            style={{ width: `${totalRequiredReviews > 0 ? (completedReviews / totalRequiredReviews) * 100 : 0}%` }}
                          ></div>
                        </div>
                        {approvalsPending && (
                          <div className="flex flex-col gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle size={12} className="shrink-0" />
                              <span>
                                {assignedJudges.length === 0 
                                  ? 'Please assign judges to this event to begin grading.' 
                                  : `Approvals Pending: All assigned judges must grade all ${finalPhotos.length} entries before results can be published.`}
                              </span>
                            </div>
                            {pendingJudges.length > 0 && (
                              <div className="pl-4.5 text-[9px] text-slate-500 dark:text-slate-400 font-semibold italic">
                                Pending review from: {pendingJudges.map(pj => `${pj.name} (${pj.statusText})`).join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                        {!approvalsPending && finalPhotos.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                            <Check size={12} className="shrink-0" />
                            <span>All judge approvals completed. Ready to publish results!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 5: CONTESTS AND CONFIGURATIONS - 6 CARDS STRUCTURE */}
      {activeTab === 'events' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          <form onSubmit={handleCreateEvent} className="flex flex-col gap-6">
            
            {/* CARD 1: Setup New Contest (Saved as Draft) */}
            <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800">
                Setup New Contest (Saved as Draft)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black font-semibold">Contest Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select Contest Type</option>
                    {contestTypes.map(ct => (
                      <option key={ct._id} value={ct.name}>{ct.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black font-semibold">Event Background (Image or Video for Login & Register)</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center px-3 py-2 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-xs cursor-pointer hover:border-indigo-600 transition-colors">
                      <span className="text-[11px] text-slate-500 truncate">
                        {uploadingBg ? 'Uploading Media...' : loginBgUrl ? `Event Background Uploaded (${loginBgUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) ? 'Video 🎥' : 'Image 📷'}) ✓` : 'Upload Event Background (Image or Short Video)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*,.mp4,.webm,.mov,.m4v"
                        onChange={handleLoginBgUpload}
                        className="hidden"
                        disabled={uploadingBg}
                      />
                    </label>
                    {loginBgUrl && (
                      <button
                        type="button"
                        onClick={() => setLoginBgUrl('')}
                        className="text-[10px] text-red-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Assignment Checkboxes */}
              <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 p-4 rounded-2xl text-left mt-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                    Assign Categories to this Contest Type <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({selectedEventCategories.length} selected - mandatory)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {categories.filter(c => c.contestTypes && c.contestTypes.includes(eventType)).map(cat => (
                    <label key={cat._id} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedEventCategories.includes(cat.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEventCategories([...selectedEventCategories, cat.name]);
                          } else {
                            setSelectedEventCategories(selectedEventCategories.filter(name => name !== cat.name));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-350 dark:border-slate-800 focus:ring-indigo-500 cursor-pointer"
                      />
                      {cat.name}
                    </label>
                  ))}
                  {categories.filter(c => c.contestTypes && c.contestTypes.includes(eventType)).length === 0 && (
                    <p className="text-xs text-amber-600 italic col-span-4 text-left">
                      No categories are currently assigned to "{eventType}". Please assign/create categories for this type in the "Categories" tab first.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black font-semibold">Contest Title</label>
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g. Monsoon Magic 2026"
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black font-semibold">Theme & Description (Text relevant to the contest/event)</label>
                  <textarea
                    value={newEventTheme}
                    onChange={(e) => setNewEventTheme(e.target.value)}
                    placeholder="The premier national photography competition designed exclusively for DSLR & Mirrorless camera enthusiasts. Show us your vision of nature, wildlife, and landscapes."
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-20 resize-none text-slate-900 dark:text-white placeholder:text-slate-400/70"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black font-semibold">
                    Event Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newEventStartDate}
                    onChange={(e) => setNewEventStartDate(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black font-semibold">
                    Submission Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={newEventStartDate || new Date().toISOString().split('T')[0]}
                    value={newEventDeadline}
                    onChange={(e) => setNewEventDeadline(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black font-semibold">Exhibition Venue</label>
                  <input
                    type="text"
                    value={newEventVenue}
                    onChange={(e) => setNewEventVenue(e.target.value)}
                    placeholder="e.g. Bal-Gandharv Art Gallery Pune"
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasExhibition}
                    onChange={(e) => setHasExhibition(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                  />
                  <span>Organizing physical exhibition at this venue?</span>
                </label>
                
                {hasExhibition && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-semibold">Exhibition Start Date (Optional)</label>
                      <input
                        type="date"
                        value={exhibitionFromDate}
                        onChange={(e) => setExhibitionFromDate(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-semibold">Exhibition End Date (Optional)</label>
                      <input
                        type="date"
                        value={exhibitionToDate}
                        onChange={(e) => setExhibitionToDate(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-black font-semibold">Detailed Contest Overview</label>
                <textarea
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Enter detailed contest overview, eligibility criteria, and submission guidelines..."
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-20 resize-none text-slate-900 dark:text-white placeholder:text-slate-400/70"
                  required
                />
              </div>
            </div>

            {/* CARD 2: Rewards & Prize Valuation */}
            <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800">
                Rewards & Prize Valuation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Rewards */}
                <div className="flex flex-col gap-2">
                  <h4 className="font-display font-semibold text-slate-700 dark:text-slate-300 text-xs">Prizes Breakdown</h4>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-3.5 flex-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-semibold">1st Prize Reward</label>
                      <input
                        type="text"
                        value={prize1Reward}
                        onChange={(e) => setPrize1Reward(e.target.value)}
                        placeholder="e.g. ₹25,000 + Gold Trophy + Winner Certificate"
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-semibold">2nd Prize Reward</label>
                      <input
                        type="text"
                        value={prize2Reward}
                        onChange={(e) => setPrize2Reward(e.target.value)}
                        placeholder="e.g. ₹15,000 + Silver Trophy + Winner Certificate"
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-semibold">3rd Prize Reward</label>
                      <input
                        type="text"
                        value={prize3Reward}
                        onChange={(e) => setPrize3Reward(e.target.value)}
                        placeholder="e.g. ₹10,000 + Bronze Trophy + Winner Certificate"
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side: Packages */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center h-4.5">
                    <h4 className="font-display font-semibold text-slate-700 dark:text-slate-300 text-xs">Package Entry Fees (INR)</h4>
                    <button
                      type="button"
                      onClick={() => setNewEventPackages([...newEventPackages, { name: '', price: 0, maxPhotos: 1 }])}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      + Add Package
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-4 flex-1">
                    {newEventPackages.map((pkg, idx) => (
                      <div key={idx} className={`flex flex-row gap-1.5 sm:gap-3 items-end ${idx > 0 ? 'border-t border-slate-200/50 dark:border-slate-800/40 pt-4' : ''}`}>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-semibold truncate">Package Name</label>
                          <input
                            type="text"
                            value={pkg.name}
                            onChange={(e) => {
                              const updated = [...newEventPackages];
                              updated[idx].name = e.target.value;
                              setNewEventPackages(updated);
                            }}
                            placeholder="e.g. Starter"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            required
                          />
                        </div>
                        
                        <div className="w-14 sm:w-24 flex flex-col gap-1 shrink-0">
                          <label className="text-[10px] text-slate-400 font-semibold truncate">Price <span className="hidden sm:inline">(₹)</span></label>
                          <input
                            type="number"
                            value={pkg.price || ''}
                            onChange={(e) => {
                              const updated = [...newEventPackages];
                              updated[idx].price = Number(e.target.value);
                              setNewEventPackages(updated);
                            }}
                            placeholder="Price"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            required
                          />
                        </div>

                        <div className="w-12 sm:w-20 flex flex-col gap-1 shrink-0">
                          <label className="text-[10px] text-slate-400 font-semibold truncate">Max <span className="hidden sm:inline">Uploads</span></label>
                          <input
                            type="number"
                            value={pkg.maxPhotos || ''}
                            onChange={(e) => {
                              const updated = [...newEventPackages];
                              updated[idx].maxPhotos = Number(e.target.value);
                              setNewEventPackages(updated);
                            }}
                            placeholder="Max"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            required
                          />
                        </div>

                        {newEventPackages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newEventPackages.filter((_, pIdx) => pIdx !== idx);
                              setNewEventPackages(updated);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors mb-0.5"
                            data-tooltip="Remove Package"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Event Certificate Templates (Linked to this Event) */}
            <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Award className="text-amber-500" size={18} />
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  Event Certificate Templates (Linked to this Event)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload separate certificate images for 1st Prize, 2nd Prize, 3rd Prize, and Participation. These templates will be assigned only to participants of this event.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-1">
                {[
                  { key: 'firstPrize', label: '1st Prize Certificate' },
                  { key: 'secondPrize', label: '2nd Prize Certificate' },
                  { key: 'thirdPrize', label: '3rd Prize Certificate' },
                  { key: 'participation', label: 'Participation Certificate' }
                ].map(({ key, label }) => {
                  const certs = newEventCertificates;
                  const uploading = uploadingCert[key];
                  const certUrl = certs[key];

                  return (
                    <div key={key} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label>
                      <label className="flex flex-col items-center justify-center px-2 py-3 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-xs cursor-pointer hover:border-indigo-600 transition-colors">
                        <span className="text-[11px] font-semibold text-slate-500 truncate text-center">
                          {uploading ? 'Uploading...' : certUrl ? 'Template Uploaded ✓' : 'Choose Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleCertificateFileUpload(key, e.target.files[0], false)}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {certUrl && (
                        <div className="flex items-center justify-between text-[10px] mt-1">
                          <span className="text-emerald-600 font-bold truncate">Uploaded ✓</span>
                          <button
                            type="button"
                            onClick={() => setNewEventCertificates(prev => ({ ...prev, [key]: '' }))}
                            className="text-red-500 hover:underline font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 4: Rules & Guidelines (One per line, auto-seeded) */}
            <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800">
                Rules & Guidelines (One per line, auto-seeded)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define guidelines and rules for this contest. Separate each rule on a new line.
              </p>
              <textarea
                value={newEventRules}
                onChange={(e) => setNewEventRules(e.target.value)}
                placeholder="1. Photographs must be taken using a DSLR camera.&#10;2. Basic color correction is permitted.&#10;3. Watermarks or signatures are strictly prohibited."
                className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs h-32 resize-none"
                required
              />
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6 rounded-2xl cursor-pointer shadow-md transition-all"
                >
                  Create Contest Draft
                </button>
              </div>
            </div>

          </form>

          {/* CARD 5: Active & Draft Contests */}
          <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800">
              Active & Draft Contests
            </h3>
            <div className="flex flex-col gap-3">
              {events.map(e => (
                <div key={e._id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="w-full">
                    <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm leading-snug">{e.title}</h4>
                    <div className="text-xs sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span><strong className="font-semibold text-slate-700 dark:text-slate-300">Submission Deadline:</strong> {e.deadline ? new Date(e.deadline).toLocaleDateString('en-IN') : 'N/A'}</span>
                      <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                      <span><strong className="font-semibold text-slate-700 dark:text-slate-300">Venue:</strong> {e.venue || 'N/A'}</span>
                      <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                      <span><strong className="font-semibold text-slate-700 dark:text-slate-300">Exhibition Date:</strong> {e.exhibitionFromDate ? new Date(e.exhibitionFromDate).toLocaleDateString('en-IN') : (e.exhibitionDate ? new Date(e.exhibitionDate).toLocaleDateString('en-IN') : (e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-IN') : 'N/A'))}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                    {e.status === 'Draft' ? (
                      <button
                        onClick={() => handleActivateEvent(e._id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3.5 rounded-xl cursor-pointer transition-all shadow-sm"
                      >
                        Activate
                      </button>
                    ) : (
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ${
                        e.status === 'Active' 
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {e.status}
                      </span>
                    )}
                    
                    <button
                      onClick={() => handleEditClick(e)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3.5 rounded-xl cursor-pointer transition-all shadow-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setEventToDeleteId(e._id);
                        setEventToDeleteTitle(e.title);
                        setShowDeleteEventModal(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/20 rounded-xl cursor-pointer transition-colors"
                      data-tooltip="Delete & Archive Contest"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No active or draft contests found.
                </p>
              )}
            </div>
          </div>

          {/* CARD 6: Deleted Contest Backups & Archives */}
          <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800">
              Deleted Contest Backups & Archives
            </h3>
            <div className="flex flex-col gap-3">
              {backups.map(b => (
                <div key={b._id} className="bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="w-full">
                    <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm leading-snug">{b.title}</h4>
                    <p className="text-xs sm:text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Type: {b.eventType} • Deleted: {new Date(b.deletedAt || b.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                    <button
                      onClick={() => handleDownloadBackup(b)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3.5 rounded-xl cursor-pointer transition-all shadow-sm"
                    >
                      Download PDF Backup
                    </button>
                    <button
                      onClick={() => handlePurgeBackup(b)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        b.downloaded 
                          ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40' 
                          : 'bg-slate-100 text-slate-350 cursor-not-allowed dark:bg-slate-800 dark:text-slate-650'
                      }`}
                      disabled={!b.downloaded}
                      data-tooltip={b.downloaded ? 'Permanently Purge from Database' : 'You must download the PDF backup before you can permanently purge this event'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {backups.length === 0 && (
                <div className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No deleted event archives or backups found.
                  </div>
                )}
              </div>
            </div>

        </div>
      )}

      {/* TAB 6: CATEGORIES CONFIGURATION */}
      {activeTab === 'categories_config' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Layers size={22} className="shrink-0" />
              </div>
              <div>
                <h2 className="font-display font-black text-xl text-slate-900 dark:text-white">
                  Contest Types, Categories & Details Configuration
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create and manage Contest Types, Categories, and Custom Details / Field Configurations for participant entries.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Contest Type and Category setup */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel contest-type-form-container border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-indigo-600 dark:text-indigo-400" />
                  {editingContestType ? 'Edit Contest Type' : 'Create Contest Type'}
                </div>
                {editingContestType && (
                  <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wider shrink-0">
                    Editing Mode
                  </span>
                )}
              </h3>

              {editingContestType ? (
                <form onSubmit={handleUpdateContestType} className="flex flex-col gap-4 mt-4 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-semibold">Select Contest Type to Modify</label>
                    <div className="flex gap-2">
                      <select
                        value={editingContestType._id}
                        onChange={(e) => {
                          const ct = contestTypes.find(t => t._id === e.target.value);
                          if (ct) {
                            handleEditContestTypeClick(ct);
                          }
                        }}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        {contestTypes.map(ct => (
                          <option key={ct._id} value={ct._id}>{ct.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteContestType(editingContestType._id, editingContestType.name)}
                        className="px-3 bg-red-50 hover:bg-red-100 text-red-550 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl cursor-pointer transition-colors border border-red-100/50 dark:border-red-950/30 flex items-center justify-center"
                        data-tooltip="Delete Selected Contest Type"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-semibold">Contest Type Name</label>
                    <input
                      type="text"
                      value={editContestTypeName}
                      onChange={(e) => setEditContestTypeName(e.target.value)}
                      placeholder="e.g. Dance"
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-semibold">Description</label>
                    <textarea
                      value={editContestTypeDesc}
                      onChange={(e) => setEditContestTypeDesc(e.target.value)}
                      placeholder="Brief description..."
                      rows={2}
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>



                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingContestType(null);
                        setEditContestTypeName('');
                        setEditContestTypeDesc('');
                      }}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateContestType} className="flex flex-col gap-4 mt-4 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-semibold">Contest Type Name</label>
                    <input
                      type="text"
                      value={newContestTypeName}
                      onChange={(e) => setNewContestTypeName(e.target.value)}
                      placeholder="e.g. Dance"
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-semibold">Description</label>
                    <textarea
                      value={newContestTypeDesc}
                      onChange={(e) => setNewContestTypeDesc(e.target.value)}
                      placeholder="Brief description..."
                      rows={2}
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>



                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer transition-colors"
                    >
                      Create Contest Type
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (contestTypes.length > 0) {
                          handleEditContestTypeClick(contestTypes[0]);
                        } else {
                          alert('No contest types registered to edit.');
                        }
                      }}
                      className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800"
                      data-tooltip="Edit Existing Contest Type"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
              <div className="glass-panel category-form-container border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
                    {editingCategory ? 'Edit Category' : 'Create Category'}
                  </div>
                  {editingCategory && (
                    <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wider shrink-0">
                      Editing Mode
                    </span>
                  )}
                </h3>

                {editingCategory ? (
                  <form onSubmit={handleUpdateCategory} className="flex flex-col gap-4 mt-4 text-left">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500 font-semibold">Select Category to Modify</label>
                      <div className="flex gap-2">
                        <select
                          value={editingCategory._id}
                          onChange={(e) => {
                            const cat = categories.find(c => c._id === e.target.value);
                            if (cat) {
                              handleEditCategoryClick(cat);
                            }
                          }}
                          className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setCatToDeleteId(editingCategory._id);
                            setCatToDeleteName(editingCategory.name);
                            setShowDeleteCatModal(true);
                          }}
                          className="px-3 bg-red-50 hover:bg-red-100 text-red-550 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl cursor-pointer transition-colors border border-red-100/50 dark:border-red-950/30 flex items-center justify-center"
                          data-tooltip="Delete Selected Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500 font-semibold">Category Name</label>
                      <input
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        placeholder="e.g. Sketching"
                        className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500 font-semibold">Description</label>
                      <textarea
                        value={editCatDesc}
                        onChange={(e) => setEditCatDesc(e.target.value)}
                        placeholder="Brief description..."
                        rows={3}
                        className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 resize-none"
                      />
                    </div>
                    
                    {/* Assigned Contest Types (Checkboxes) */}
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <label className="font-semibold text-slate-500">Assign to Contest Types</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {contestTypes.map(ct => (
                          <label key={ct._id} className="flex items-center gap-2 text-[10px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={editCatTypes.includes(ct.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditCatTypes([...editCatTypes, ct.name]);
                                } else {
                                  setEditCatTypes(editCatTypes.filter(t => t !== ct.name));
                                }
                              }}
                              className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-350 dark:border-slate-800 focus:ring-indigo-500 cursor-pointer"
                            />
                            {ct.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setEditCatName('');
                          setEditCatDesc('');
                          setEditCatTypes([]);
                        }}
                        className="w-1/3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCreateCategory} className="flex flex-col gap-4 mt-4 text-left">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500 font-semibold">Category Name</label>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Wildlife"
                        className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500 font-semibold">Description</label>
                      <textarea
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        placeholder="Brief description..."
                        rows={3}
                        className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 resize-none"
                      />
                    </div>
                    
                    {/* Assigned Contest Types (Checkboxes) */}
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <label className="font-semibold text-slate-500">Assign to Contest Types</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {contestTypes.map(ct => (
                          <label key={ct._id} className="flex items-center gap-2 text-[10px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={newCatTypes.includes(ct.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewCatTypes([...newCatTypes, ct.name]);
                                } else {
                                  setNewCatTypes(newCatTypes.filter(t => t !== ct.name));
                                }
                              }}
                              className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-350 dark:border-slate-800 focus:ring-indigo-500 cursor-pointer"
                            />
                            {ct.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer transition-colors"
                      >
                        Create Category
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (categories.length > 0) {
                            handleEditCategoryClick(categories[0]);
                          } else {
                            alert('No categories registered to edit.');
                          }
                        }}
                        className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800"
                        data-tooltip="Edit Existing Category"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* Right Column: Categories Explorer by Contest Type */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Contest Types Tabs Filter */}
              <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-left">
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Categories Ledger</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Filter and explore categories mapped to different contest platforms</p>
                </div>

                {/* Grid of Contest Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                  {contestTypes.map(ct => ct.name).map(typeTab => {
                    const filteredCats = categories.filter(c => {
                      const types = c.contestTypes || [];
                      return types.includes(typeTab);
                    });

                    return (
                      <div key={typeTab} className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{typeTab}</span>
                          <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold text-[10px] px-2 py-0.5 rounded-full">
                            {filteredCats.length} Categories
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 overflow-y-auto max-h-55 pr-1">
                          {filteredCats.map(c => (
                            <div key={c._id} className="flex justify-between items-start text-[11px] p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl hover:shadow-sm transition-shadow">
                              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
                                {c.description && <span className="text-[9px] text-slate-400 truncate">{c.description}</span>}
                                
                                <div className="flex flex-wrap gap-0.5 mt-1">
                                  {(c.contestTypes || ['Photography']).map(t => (
                                    <span key={t} className="px-1 py-0.2 rounded text-[7px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wide">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <button
                                  onClick={() => handleEditCategoryClick(c)}
                                  className="min-w-8 min-h-8 p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 dark:text-indigo-400 rounded-lg cursor-pointer transition-colors shadow-2xs border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shrink-0"
                                  data-tooltip="Edit Category"
                                >
                                  <Edit2 size={16} className="shrink-0" />
                                </button>
                                <button
                                  onClick={() => {
                                    setCatToDeleteId(c._id);
                                    setCatToDeleteName(c.name);
                                    setShowDeleteCatModal(true);
                                  }}
                                  className="min-w-8 min-h-8 p-1.5 bg-red-50 hover:bg-red-100 text-red-550 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-lg cursor-pointer transition-colors shadow-2xs border border-red-100/50 dark:border-red-950/30 flex items-center justify-center shrink-0"
                                  data-tooltip="Delete Category"
                                >
                                  <Trash2 size={16} className="shrink-0" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {filteredCats.length === 0 && (
                            <div className="text-center text-[10px] text-slate-400 py-6 italic">
                              No categories assigned.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>

        {/* Category Details Configuration Card (Full Width) */}
        <div className="mt-8 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5 text-left bg-white dark:bg-slate-900">
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Sliders size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>Category Details Configuration</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Configure dynamic custom field labels for entries in each category independently.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Selector and Local Editor */}
            <div className="flex flex-col gap-5">
              {/* Labels Mode Selector */}
              <div className="flex flex-col gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <label className="text-xs text-slate-500 font-semibold">Labels Management Level</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="catLabelsMode"
                      value="category"
                      checked={catLabelsMode === 'category'}
                      onChange={() => handleToggleLabelsMode('category')}
                      className="w-4 h-4 text-indigo-600 border-slate-350 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Category Level (Custom)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="catLabelsMode"
                      value="contest_type"
                      checked={catLabelsMode === 'contest_type'}
                      onChange={() => handleToggleLabelsMode('contest_type')}
                      className="w-4 h-4 text-indigo-600 border-slate-350 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Contest Type Level (Inherited)</span>
                  </label>
                </div>
              </div>

              {/* Conditional dropdowns based on Labels Level */}
              {catLabelsMode === 'category' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Select Category</label>
                  <select
                    value={selectedCatForDetails}
                    onChange={(e) => handleSelectCatForDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="">-- Choose Category to Manage Custom Labels --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Select Contest Type</label>
                  <select
                    value={selectedCtForDetails}
                    onChange={(e) => handleSelectCtForDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="">-- Choose Contest Type to Manage Labels --</option>
                    {contestTypes.map(ct => (
                      <option key={ct._id} value={ct._id}>{ct.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {((catLabelsMode === 'category' && selectedCatForDetails) || (catLabelsMode === 'contest_type' && selectedCtForDetails)) ? (
                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Category level specific inheritance checkbox */}
                  {catLabelsMode === 'category' && (() => {
                    const activeCatObj = categories.find(c => c._id === selectedCatForDetails);
                    return (
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <input
                          type="checkbox"
                          id="inheritFromCtCheckbox"
                          checked={isInheritFromCt}
                          onChange={(e) => handleToggleInheritFromCt(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-350 focus:ring-indigo-500 rounded cursor-pointer"
                        />
                        <label htmlFor="inheritFromCtCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                          Inherit labels from Contest Type Level (Inherited) instead of custom labels
                        </label>
                      </div>
                    );
                  })()}

                  {/* Editor Header with Add Label button */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {catLabelsMode === 'category' ? 'Configure Category Fields' : 'Configure Contest Type Fields'}
                      </span>
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold block mt-0.5 font-sans">
                        {catLabelsMode === 'category'
                          ? `Category: ${categories.find(c => c._id === selectedCatForDetails)?.name || ''}`
                          : `Contest Type: ${contestTypes.find(c => c._id === selectedCtForDetails)?.name || ''}`}
                      </span>
                    </div>
                    {/* Add Label button is disabled if Category is set to inherit */}
                    {!(catLabelsMode === 'category' && isInheritFromCt) && (
                      <button
                        type="button"
                        onClick={handleAddCatLabel}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Plus size={12} />
                        <span>Add Label</span>
                      </button>
                    )}
                  </div>

                  {/* List of labels */}
                  {catLabelsMode === 'category' && isInheritFromCt ? (
                    <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                      <p className="text-[11px] text-slate-500 font-semibold">
                        This category is configured to inherit fields from the Contest Type:{" "}
                        <strong className="text-indigo-600 dark:text-indigo-400">
                          {(() => {
                            const activeCatObj = categories.find(c => c._id === selectedCatForDetails);
                            return (activeCatObj?.contestTypes && activeCatObj.contestTypes[0]) || 'Photography';
                          })()}
                        </strong>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        To view or modify these labels, select "Contest Type Level (Inherited)" at the top.
                      </p>
                      
                      {/* Read only view of inherited labels */}
                      {catLabelsLocal.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                          {catLabelsLocal.map((lbl, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-850 rounded-lg text-[9px] font-bold text-slate-600 dark:text-slate-300">
                              {lbl}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : catLabelsLocal.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic text-center py-4 bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No custom fields configured yet. Add labels using the button above or quick-assign common ones from the right.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2.5 max-h-75 overflow-y-auto pr-1">
                      {catLabelsLocal.map((label, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={label}
                            onChange={(e) => handleEditCatLabel(idx, e.target.value)}
                            placeholder="e.g. Designer / Brand"
                            className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-semibold text-slate-850 dark:text-slate-100 focus:outline-none"
                          />
                          {/* Reordering Controls */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleReorderCatLabel(idx, 'up')}
                              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none rounded cursor-pointer animate-none"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === catLabelsLocal.length - 1}
                              onClick={() => handleReorderCatLabel(idx, 'down')}
                              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none rounded cursor-pointer animate-none"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                          {/* Delete Control */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCatLabel(idx)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl cursor-pointer transition-colors border border-red-100/30 dark:border-red-950/20"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSavingCatLabels}
                    onClick={handleSaveCategoryLabels}
                    className="w-fit px-8 py-2.5 rounded-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold  text-xs cursor-pointer transition-all shadow-md disabled:opacity-50"
                  >
                    {isSavingCatLabels ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-450 dark:text-slate-500 italic p-6 bg-slate-50/50 dark:bg-slate-950/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  {catLabelsMode === 'category'
                    ? 'Select a category above to configure custom field labels.'
                    : 'Select a contest type above to configure field labels.'}
                </div>
              )}
            </div>

            {/* Right Column: Predefined & Configured Custom Field Labels (Common Pool) */}
            <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-1 md:pt-0 self-start w-full">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Quick-Assign Common Field Labels</span>
                </span>
              </div>
              
              <>
                <p className="text-[10px] text-slate-400">
                  {catLabelsMode === 'category'
                    ? (selectedCatForDetails
                        ? (isInheritFromCt
                            ? "This category inherits fields from its contest type level. Switch to Contest Type Level mode above to assign fields."
                            : "Click any label below to add it to the active category's field list. Common labels can be assigned to multiple categories.")
                        : "These are common custom field labels available in the system. Select a category on the left to start assigning them.")
                    : (selectedCtForDetails
                        ? "Click any label below to add it to the active contest type's field list."
                        : "These are common custom field labels available in the system. Select a contest type on the left to start assigning them.")
                  }
                </p>
                
                <div className="flex flex-wrap gap-2 max-h-87.5 overflow-y-auto">
                  {(() => {
                    const PREDEFINED_LABELS = [
                      "Camera Brand",
                      "Camera Model",
                      "Lens Used",
                      "Capture Location",
                      "Video Resolution (1080p, 4K)",
                      "Frame Rate / FPS",
                      "Editing Software",
                      "Audio / Music Source",
                      "Medium / Paint Type",
                      "Surface / Canvas Material",
                      "Artwork Dimensions",
                      "Craft Materials Used",
                      "Theme / Concept Description",
                      "Designer / Brand",
                      "Garment Type",
                      "Fabric / Material",
                      "Color Palette"
                    ];
                    const existingLabels = categories.flatMap(c => c.customLabels || []);
                    const pool = [...new Set([...PREDEFINED_LABELS, ...existingLabels])];
                    return pool.map((lbl) => {
                      const activeSelected = catLabelsMode === 'category' ? selectedCatForDetails : selectedCtForDetails;
                      const isInheriting = catLabelsMode === 'category' && isInheritFromCt;
                      const isAssigned = activeSelected && catLabelsLocal.includes(lbl);
                      const isDisabled = !activeSelected || isInheriting || isAssigned;
                      return (
                        <button
                          key={lbl}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            if (activeSelected && !isAssigned && !isInheriting) {
                              setCatLabelsLocal([...catLabelsLocal, lbl]);
                            }
                          }}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all select-none ${
                            isDisabled
                              ? 'bg-slate-50 text-slate-400 border-slate-150 dark:bg-slate-950 dark:text-slate-600 dark:border-slate-855 cursor-not-allowed'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-100 hover:border-indigo-200 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30 cursor-pointer'
                          }`}
                        >
                          {lbl}
                        </button>
                      );
                    });
                  })()}
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    )}
      {/* TAB: CONTEST LEDGER & EVENTS HISTORY */}
      {activeTab === 'event_history' && (
        <div className="animate-in fade-in duration-200 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-2xl">
                <History size={20} />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Events History</h2>
                <p className="text-[10px] text-slate-400">Complete historical event records, approved/disapproved entries, judge remarks, contestant profiles, and financial ledger</p>
              </div>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history contests..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {historyLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <RefreshCw size={28} className="animate-spin text-indigo-600" />
              <span className="text-xs uppercase font-bold tracking-wider">Loading Contest Ledger History...</span>
            </div>
          ) : eventHistory.length === 0 ? (
            <div className="text-center text-slate-400 py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
              <History size={36} className="mx-auto mb-2 text-slate-350" />
              <p className="text-sm font-semibold">No historical contest records found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {eventHistory
                .filter(ev => ev.title.toLowerCase().includes(historySearch.toLowerCase()))
                .map(ev => {
                  const evId = ev.id || ev._id;
                  const isOpen = openHistoryEventIds.has(evId);
                  const activeSubTab = historyEventSubTabs[evId] || 'gallery';
                  const isVideoEvent = ev.mediaType === 'video' || String(ev.eventType).toLowerCase().includes('video') || String(ev.eventType).toLowerCase().includes('reel');

                  const evPhotos = ev.allPhotographs || [];
                  const disapprovedPhotos = evPhotos.filter(p => {
                    const st = (p.status || p.rawStatus || '').toLowerCase();
                    const isDis = st === 'rejected' || st === 'disapproved' || p.isApproved === false || p.approved === false;
                    if (isDis) return true;
                    if (Array.isArray(p.scores) && p.scores.some(sc => {
                      const scSt = (sc.approvalStatus || sc.status || '').toLowerCase();
                      return scSt === 'disapproved' || scSt === 'rejected';
                    })) return true;
                    if (p.score && typeof p.score === 'object') {
                      const scSt = (p.score.approvalStatus || p.score.status || '').toLowerCase();
                      if (scSt === 'disapproved' || scSt === 'rejected') return true;
                    }
                    return false;
                  });
                  const approvedPhotos = evPhotos.filter(p => !disapprovedPhotos.includes(p));

                  return (
                    <div key={evId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-all">
                      
                      {/* Accordion Panel Header - Single Open Behavior */}
                      <div
                        onClick={() => {
                          setOpenHistoryEventIds(prev => {
                            const next = new Set(prev);
                            if (next.has(evId)) {
                              next.delete(evId);
                            } else {
                              next.clear();
                              next.add(evId);
                            }
                            return next;
                          });
                        }}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 sm:px-6 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors select-none"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                            {ev.title}
                          </h3>
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {isVideoEvent ? 'SHORT VIDEO & REELS CONTEST' : 'PHOTOGRAPHY CONTEST'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap sm:flex-nowrap">
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
                              {ev.status || 'COMPLETED'}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-bold">
                            ({evPhotos.length} Uploaded)
                          </span>
                          <button
                            onClick={(evt) => {
                              evt.stopPropagation();
                              downloadEventPDF(ev);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-xl shadow-xs transition-all cursor-pointer"
                            title="Download Completed Event PDF"
                          >
                            <Download size={12} />
                            <span>PDF</span>
                          </button>
                          <button
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setEventToDeleteId(evId);
                              setEventToDeleteTitle(ev.title);
                              setShowDeleteEventModal(true);
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 rounded-lg cursor-pointer transition-colors"
                            title="Archive & Delete Contest"
                          >
                            <Trash2 size={14} />
                          </button>
                          {isOpen ? (
                            <ChevronUp size={20} className="text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown size={20} className="text-slate-400 shrink-0" />
                          )}
                        </div>
                      </div>

                      {/* Accordion Panel Body */}
                      {isOpen && (
                        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 flex flex-col gap-6">
                          
                          {/* Event Meta Details Banner (Deadline, Venue, Exhibition Date) */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs text-xs">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Clock size={15} className="text-amber-500 shrink-0" />
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Submission Deadline</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  {ev.deadline ? new Date(ev.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Building2 size={15} className="text-indigo-500 shrink-0" />
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Venue / Location</span>
                                <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-50 block">
                                  {ev.venue || 'Sumbaran Art Gallery, Pune'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Calendar size={15} className="text-emerald-500 shrink-0" />
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Exhibition Date</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  {ev.exhibitionDate ? new Date(ev.exhibitionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'To Be Announced'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Sub-Navigation Tabs Bar */}
                          <div className="flex justify-center w-full">
                            <div className="flex flex-wrap justify-center bg-slate-200/70 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 gap-1 text-xs font-bold">
                              <button
                                onClick={() => setHistoryEventSubTabs(prev => ({ ...prev, [evId]: 'gallery' }))}
                                className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                                  activeSubTab === 'gallery'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <Camera size={13} className="shrink-0" />
                                <span>Approved ({approvedPhotos.length})</span>
                              </button>

                              <button
                                onClick={() => setHistoryEventSubTabs(prev => ({ ...prev, [evId]: 'disapproved' }))}
                                className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                                  activeSubTab === 'disapproved'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <Flag size={13} className="shrink-0" />
                                <span>Disapproved ({disapprovedPhotos.length})</span>
                              </button>

                              <button
                                onClick={() => setHistoryEventSubTabs(prev => ({ ...prev, [evId]: 'winners' }))}
                                className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                                  activeSubTab === 'winners'
                                    ? 'bg-amber-600 text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <Award size={13} className="shrink-0" />
                                <span>Winners</span>
                              </button>

                              <button
                                onClick={() => setHistoryEventSubTabs(prev => ({ ...prev, [evId]: 'judges' }))}
                                className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                                  activeSubTab === 'judges'
                                    ? 'bg-slate-800 text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <Users size={13} className="shrink-0" />
                                <span>Judges ({ev.judgeDetails?.length || 0})</span>
                              </button>

                              <button
                                onClick={() => setHistoryEventSubTabs(prev => ({ ...prev, [evId]: 'participants' }))}
                                className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                                  activeSubTab === 'participants'
                                    ? 'bg-slate-800 text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <Users size={13} className="shrink-0" />
                                <span>Contestants ({ev.participantDetails?.length || 0})</span>
                              </button>

                              <button
                                onClick={() => setHistoryEventSubTabs(prev => ({ ...prev, [evId]: 'ledger' }))}
                                className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                                  activeSubTab === 'ledger'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <Wallet size={13} className="shrink-0" />
                                <span>Financial Ledger</span>
                              </button>
                            </div>
                          </div>

                          {/* SUB-TAB 1: APPROVED */}
                          {activeSubTab === 'gallery' && (
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
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
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

                                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center text-[9px] text-slate-450 uppercase tracking-wider font-bold">
                                          <span>Camera: {photo.cameraModel || photo.cameraBrand || 'N/A'}</span>
                                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                            Grade: {(() => {
                                              if (typeof photo.averageScore === 'number' && photo.averageScore > 0) {
                                                return photo.averageScore.toFixed(1);
                                              }
                                              if (Array.isArray(photo.scores) && photo.scores.length > 0) {
                                                const valid = photo.scores.map(s => typeof s.averageScore === 'number' ? s.averageScore : (typeof s.score === 'number' ? s.score : 0));
                                                const sum = valid.reduce((a, b) => a + b, 0);
                                                return valid.length > 0 ? (sum / valid.length).toFixed(1) : '0.0';
                                              }
                                              return '0.0';
                                            })()}/10
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* SUB-TAB 2: DISAPPROVED */}
                          {activeSubTab === 'disapproved' && (
                            <div>
                              {disapprovedPhotos.length === 0 ? (
                                <div className="text-center text-slate-400 py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                  <Flag size={32} className="mx-auto mb-2 text-slate-300" />
                                  <p className="text-xs font-semibold">No disapproved submissions found for this contest.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                  {disapprovedPhotos.map(photo => (
                                    <div
                                      key={photo.photoId}
                                      className="bg-white dark:bg-slate-900 border border-red-200/80 dark:border-red-900/30 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
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
                                            className="w-full h-full object-contain"
                                          />
                                        ) : photo.fileUrl ? (
                                          <img
                                            src={getBackendUrl(photo.fileUrl)}
                                            alt={photo.title}
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover opacity-85"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
                                            No Preview
                                          </div>
                                        )}
                                        <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                                          Disapproved
                                        </span>
                                      </div>

                                      <div className="p-4 flex flex-col gap-3 justify-between grow">
                                        <div>
                                          <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                                              {photo.title}
                                            </h3>
                                            <span className="text-[9px] bg-red-50 text-red-600 dark:bg-red-950/30 px-2 py-0.5 rounded font-bold shrink-0">
                                              {photo.category}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                            By {photo.participantName}
                                          </p>
                                        </div>

                                        {/* Judge Remarks Box */}
                                        <div className="bg-red-50/80 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/20 rounded-xl p-3 text-[10px] text-red-700 dark:text-red-300">
                                          <span className="font-bold uppercase tracking-wider block mb-1">Judge Remarks:</span>
                                          {photo.scores && photo.scores.some(s => s.remarks) ? (
                                            photo.scores.filter(s => s.remarks).map((s, idx) => (
                                              <p key={idx} className="italic leading-snug">"{s.remarks}" — <span className="font-semibold">{s.judgeName}</span></p>
                                            ))
                                          ) : (
                                            <p className="italic">Submission disapproved during judge review.</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* SUB-TAB 3: WINNERS - DIGITAL CERTIFICATE CREDENTIAL CARDS (Exact Layout matching Participant Portal) */}
                          {activeSubTab === 'winners' && (
                            <div>
                              {!ev.winnersPublished || !ev.winners || ev.winners.length === 0 ? (
                                <div className="text-center text-slate-400 py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                  <Award size={32} className="mx-auto mb-2 text-slate-300 animate-bounce" />
                                  <p className="text-xs font-semibold">Winners rankings have not been declared/published for this contest yet.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {ev.winners.map((win, idx) => {
                                    const rankLower = (win.rank || '').toLowerCase();
                                    const isFirst = rankLower.includes('1st') || rankLower.includes('first');
                                    const isSecond = rankLower.includes('2nd') || rankLower.includes('second');
                                    const certTemplateName = isFirst ? '1st-Prize.png' : isSecond ? '2nd-Prize.png' : '3rd-Prize.png';
                                    const customCertUrl = isFirst ? ev.certificates?.firstPrize : isSecond ? ev.certificates?.secondPrize : ev.certificates?.thirdPrize;
                                    const certImgSrc = getBackendUrl(customCertUrl || `/${certTemplateName}`);

                                    return (
                                      <div key={idx} className="bg-linear-to-br from-amber-500/5 via-amber-600/5 to-white dark:to-slate-900 border-2 border-amber-500/35 rounded-3xl p-5 flex flex-col justify-between items-start gap-4 shadow-md relative overflow-hidden">
                                        
                                        {/* Top Section: Badge & Image Thumbnail */}
                                        <div className="flex items-start gap-4 w-full">
                                          {/* Certificate Thumbnail Preview Frame */}
                                          <div
                                            className="shrink-0 w-24 aspect-[1/1.414] overflow-hidden rounded-xl border-2 border-amber-500/30 shadow-sm cursor-pointer relative select-none group"
                                            onClick={() => downloadEventPDF(ev)}
                                          >
                                            <img
                                              src={certImgSrc}
                                              alt="Certificate Thumbnail"
                                              className="w-full h-full object-cover filter blur-[0.3px] group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `/${certTemplateName}`;
                                              }}
                                              onContextMenu={e => e.preventDefault()}
                                            />
                                            <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center p-1 pointer-events-none">
                                              <div className="text-[5px] leading-tight font-black text-red-600/60 dark:text-red-500/50 uppercase tracking-tighter text-center select-none rotate-[-25deg] border border-dashed border-red-600/40 bg-white/90 dark:bg-slate-900/90 px-1 py-0.5 rounded shadow-xs">
                                                SAMPLE CERTIFICATE
                                                <br />
                                                NOT VALID FOR
                                                <br />
                                                PRINT OR DOWNLOAD
                                              </div>
                                            </div>
                                          </div>

                                          {/* Certificate Details */}
                                          <div className="flex-1 flex flex-col gap-1 text-left min-w-0">
                                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1 w-max truncate">
                                              🏆 {win.rank} (PREVIEW ONLY)
                                            </span>
                                            <h4 className="font-display font-black text-sm text-slate-900 dark:text-white mt-1 leading-tight line-clamp-2">
                                              {ev.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 mt-1 leading-tight font-semibold">
                                              Reward: <strong className="text-amber-600 font-bold">{win.reward || '₹20,000'}</strong>
                                            </p>
                                            <p className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">
                                              Winning Entry: <span className="italic font-bold text-indigo-600 dark:text-indigo-400">"{win.photoTitle || 'Untitled'}"</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                              Artist: <strong className="text-slate-900 dark:text-white font-bold">{win.userName}</strong>
                                            </p>
                                          </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-1.5 w-full mt-1">
                                          <button
                                            type="button"
                                            onClick={() => downloadEventPDF(ev)}
                                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                                          >
                                            <Eye size={13} />
                                            <span>View Preview (Locked)</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => downloadEventPDF(ev)}
                                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                                          >
                                            <Lock size={13} />
                                            <span>Download PDF</span>
                                            <Lock size={11} className="ml-auto opacity-70" />
                                          </button>
                                        </div>

                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* SUB-TAB 4: JUDGES */}
                          {activeSubTab === 'judges' && (
                            <div>
                              {!ev.judgeDetails || ev.judgeDetails.length === 0 ? (
                                <div className="text-center text-slate-400 py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                  <Users size={32} className="mx-auto mb-2 text-slate-300" />
                                  <p className="text-xs font-semibold">No judges assigned to this event.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {ev.judgeDetails.map(j => (
                                    <div key={j.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs shadow-2xs">
                                      <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{j.name}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold">{j.email} • {j.city}</p>
                                      </div>
                                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                        j.hasConfirmed 
                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                      }`}>
                                        {j.hasConfirmed ? 'Signed Off' : 'Pending'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* SUB-TAB 5: PARTICIPANTS DIRECTORY (ALL DETAILS) */}
                          {activeSubTab === 'participants' && (
                            <div>
                              {!ev.participantDetails || ev.participantDetails.length === 0 ? (
                                <div className="text-center text-slate-400 py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                  <Users size={32} className="mx-auto mb-2 text-slate-300" />
                                  <p className="text-xs font-semibold">No participants registered for this event.</p>
                                </div>
                              ) : (
                                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                        <th className="py-3 px-4">#</th>
                                        <th className="py-3 px-4">Participant Name</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Mobile Number</th>
                                        <th className="py-3 px-4">City</th>
                                        <th className="py-3 px-4 text-center">Uploaded</th>
                                        <th className="py-3 px-4 text-center">Submission Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {ev.participantDetails.map((p, pIdx) => (
                                        <tr key={p.userId || pIdx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                                          <td className="py-3 px-4 font-bold text-slate-400">{pIdx + 1}</td>
                                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                                          <td className="py-3 px-4 text-slate-500 font-medium">{p.email}</td>
                                          <td className="py-3 px-4 text-slate-500 font-mono">{p.mobile || 'N/A'}</td>
                                          <td className="py-3 px-4 text-slate-500 font-medium">{p.city || 'N/A'}</td>
                                          <td className="py-3 px-4 text-center font-extrabold text-indigo-600">{p.photosCount || 0}</td>
                                          <td className="py-3 px-4 text-center">
                                            <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                                              p.isFinalSubmitted 
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                              {p.isFinalSubmitted ? 'Finalized' : 'Draft'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          {/* SUB-TAB 6: FINANCIAL LEDGER (PROFIT & LOSS, EXPENSES, SPONSORSHIPS, REVENUE) */}
                          {activeSubTab === 'ledger' && (
                            <div className="flex flex-col gap-6">
                              {/* Financial Audit Cards */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-2xs">
                                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Registration Revenue</span>
                                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-1 block">
                                    ₹{(ev.totalRevenue || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-2xs">
                                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Sponsorships & Grants</span>
                                  <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-display mt-1 block">
                                    ₹{(ev.totalSponsorship || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-2xs">
                                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Expenses</span>
                                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-display mt-1 block">
                                    ₹{(ev.totalExpenses || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30 rounded-2xl text-center shadow-2xs">
                                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider">Net Profit / Loss</span>
                                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block font-display">
                                    ₹{(ev.netProfitLoss || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>

                              {/* Sponsorships & Donations Breakdown */}
                               {ev.sponsorshipDetails && ev.sponsorshipDetails.length > 0 && (
                                 <div>
                                   <h4 className="font-display font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                                     <span>Sponsorships & Donations ({ev.sponsorshipDetails.length})</span>
                                     <span className="text-purple-600 dark:text-purple-400 font-black text-xs">Total: ₹{(ev.totalSponsorship || 0).toLocaleString('en-IN')}</span>
                                   </h4>
                                   <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs">
                                     <table className="w-full text-left text-xs">
                                       <thead>
                                         <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                                           <th className="py-3 px-4">Sponsor / Donor</th>
                                           <th className="py-3 px-4">Type & Category</th>
                                           <th className="py-3 px-4">Supported Event</th>
                                           <th className="py-3 px-4 text-emerald-600 font-bold">Amount (₹)</th>
                                           <th className="py-3 px-4">Funding Date</th>
                                           <th className="py-3 px-4">Payment Info</th>
                                           <th className="py-3 px-4 text-center">Status</th>
                                           <th className="py-3 px-4 text-center">Document</th>
                                         </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                         {ev.sponsorshipDetails.map((sp, idx) => (
                                           <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                                             <td className="py-3.5 px-4">
                                               <p className="font-bold text-slate-900 dark:text-white text-xs">{sp.sponsorName}</p>
                                               {sp.orgName && <p className="text-[10px] text-slate-500">{sp.orgName}</p>}
                                               {sp.contactPerson && <p className="text-[10px] text-slate-400">Contact: {sp.contactPerson}</p>}
                                             </td>
                                             <td className="py-3.5 px-4">
                                               <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                 {sp.sponsorType || 'CSR Funding'}
                                               </span>
                                               <p className="text-[10px] text-slate-400 mt-1 font-semibold">{sp.category || 'CSR'}</p>
                                             </td>
                                             <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 max-w-xs leading-snug">
                                               {sp.supportedEvent || ev.title}
                                             </td>
                                             <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm font-display">
                                               ₹{(sp.amount || 0).toLocaleString('en-IN')}
                                             </td>
                                             <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                                               {sp.fundingDate ? new Date(sp.fundingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                             </td>
                                             <td className="py-3.5 px-4">
                                               <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{sp.paymentInfo || 'UPI'}</p>
                                               {sp.referenceId && <p className="text-[9px] font-mono text-slate-400">Ref: {sp.referenceId}</p>}
                                             </td>
                                             <td className="py-3.5 px-4 text-center">
                                               <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                 {sp.status || 'RECEIVED'}
                                               </span>
                                             </td>
                                             <td className="py-3.5 px-4 text-center text-slate-400 italic text-[10px]">
                                               {sp.documentUrl ? (
                                                 <a href={getBackendUrl(sp.documentUrl)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold">View</a>
                                               ) : 'None'}
                                             </td>
                                           </tr>
                                         ))}
                                       </tbody>
                                     </table>
                                   </div>
                                 </div>
                               )}

                              {/* Expenses Breakdown */}
                              {ev.expenseDetails && ev.expenseDetails.length > 0 && (
                                <div>
                                  <h4 className="font-display font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                    Operational Event Expenses ({ev.expenseDetails.length})
                                  </h4>
                                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                                          <th className="py-2.5 px-4">Expense Title</th>
                                          <th className="py-2.5 px-4">Category</th>
                                          <th className="py-2.5 px-4">Vendor / Paid To</th>
                                          <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {ev.expenseDetails.map((ex, idx) => (
                                          <tr key={idx}>
                                            <td className="py-2.5 px-4 font-bold">{ex.title}</td>
                                            <td className="py-2.5 px-4 text-slate-500">{ex.category}</td>
                                            <td className="py-2.5 px-4 font-medium">{ex.paidTo || '—'}</td>
                                            <td className="py-2.5 px-4 text-right font-bold text-rose-600 font-display">₹{(ex.amount || 0).toLocaleString('en-IN')}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Transactions List */}
                              <div>
                                <h4 className="font-display font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                  Revenue Payment Logs ({ev.paymentDetails?.length || 0})
                                </h4>
                                {!ev.paymentDetails || ev.paymentDetails.length === 0 ? (
                                  <div className="text-center text-slate-400 py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <Wallet size={32} className="mx-auto mb-2 text-slate-300" />
                                    <p className="text-xs font-semibold">No payment transactions recorded for this event.</p>
                                  </div>
                                ) : (
                                  <div className="max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                                    {ev.paymentDetails.map((pay, pIdx) => (
                                      <div key={pIdx} className="p-3.5 text-xs flex justify-between items-start">
                                        <div>
                                          <p className="font-bold text-slate-900 dark:text-white text-sm">{pay.userName}</p>
                                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">TXN: {pay.transactionId}</p>
                                          <p className="text-[10px] text-slate-400 mt-0.5">Date: {new Date(pay.paymentDate).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <div className="text-right">
                                          <span className="font-black text-emerald-600 dark:text-emerald-400 font-display block text-base">
                                            ₹{pay.amount}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">{pay.packageName}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
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
      )}

      {/* TAB 7: PROFILE SETTINGS */}
      {activeTab === 'profile_settings' && (
        <div className="max-7xl mx-auto animate-in fade-in duration-200 text-left">
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 bg-white dark:bg-slate-900">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Profile Settings</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage your administrator account credentials and personal details</p>
            </div>

            {profileError && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/20 p-3 rounded-xl text-xs text-red-600 dark:text-red-400">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Profile Photo Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md overflow-hidden border-2 border-indigo-500">
                  {user?.avatar ? (
                    <img
                      src={getBackendUrl(user.avatar)}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
                  )}
                </div>
                <label className="absolute inset-0 rounded-full bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={18} />
                  <span className="text-[9px] font-bold mt-0.5">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUploadAdmin}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">Profile Photo</h4>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Upload an administrator photo. This photo will appear in the blue circle avatar on your top navigation bar.
                </p>
                <label className="mt-1.5 inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
                  <Upload size={13} />
                  <span>{uploadingAvatar ? 'Uploading Photo...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUploadAdmin}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Administrator Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Event Administrator"
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Mobile Number</label>
                  <input
                    type="tel"
                    value={profileMobile}
                    onChange={handleAdminMobileChange}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="9876543210"
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="admin@contest.com"
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-3">Change Password</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-500">New Password</label>
                    <input
                      type="password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="••••••••"
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                      minLength={6}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-500">Confirm New Password</label>
                    <input
                      type="password"
                      value={profileConfirmPassword}
                      onChange={(e) => setProfileConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Leave blank if you do not want to change your password.</p>
              </div>

              <div className="flex justify-start mt-4">
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="w-fit px-8 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {profileSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 8: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-200 text-left flex flex-col gap-6">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Card: Dispatch Notification */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
                    <Send size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                      Dispatch Notification
                    </h3>
                    <p className="text-xs text-slate-400">
                      Compose message to send to target audience
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4 text-xs">
                  {/* Select Event Scope */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-300">
                      Scope / Event Selection
                    </label>
                    <select
                      value={broadcastEventId}
                      onChange={(e) => setBroadcastEventId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="">--Select--</option>
                      <option value="all">All Events</option>
                      {events.map(ev => (
                        <option key={ev._id} value={ev._id}>{ev.title} {ev.status ? `(${ev.status})` : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Audience */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-300">
                      Target Audience
                    </label>
                    <select
                      value={broadcastRecipient}
                      onChange={(e) => setBroadcastRecipient(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="Participant">Contestants Only (Participants)</option>
                      <option value="Judge">Judges Only</option>
                      <option value="Both">Both (Announce Globally)</option>
                    </select>
                  </div>

                  {/* Notification Message Text Area */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-600 dark:text-slate-300">
                        Notification Message
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {broadcastMessage.length}/500
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Type details about results, schedules, rule updates, or deadline changes..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={broadcastSubmitting || !broadcastMessage.trim()}
                    className="mt-2 w-auto self-start bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>{broadcastSubmitting ? 'Dispatching Message...' : 'Send Broadcast Notification'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* History Table Card */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl">
                      <History size={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                        Announcements History
                      </h3>
                      <p className="text-xs text-slate-400">
                        Review and manage past broadcast announcements
                      </p>
                    </div>
                  </div>

                  <select
                    value={broadcastFilter}
                    onChange={(e) => setBroadcastFilter(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Recipients</option>
                    <option value="Participant">Contestants Only</option>
                    <option value="Judge">Judges Only</option>
                    <option value="Both">Both Audience</option>
                  </select>
                </div>

                {(() => {
                  const filtered = broadcasts.filter(b => broadcastFilter === 'all' || b.recipientType === broadcastFilter);
                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
                        <Bell size={36} className="text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                        <p className="text-xs font-semibold">No notifications match this selection.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-3.5 max-h-120 overflow-y-auto pr-1">
                      {filtered.map((b) => (
                        <div
                          key={b._id}
                          className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 p-4 rounded-2xl flex items-start justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                        >
                          <div className="flex flex-col gap-2 grow text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                b.recipientType === 'Participant'
                                  ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-500/20'
                                  : b.recipientType === 'Judge'
                                  ? 'bg-teal-500/10 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20'
                              }`}>
                                Target: {b.recipientType === 'Both' ? 'Contestants & Judges' : b.recipientType === 'Participant' ? 'Contestants' : 'Judges'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(b.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {b.isArchived && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase font-black">
                                  Archived
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                              {b.message}
                            </p>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handleToggleArchiveBroadcast(b._id)}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                b.isArchived 
                                  ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-600 dark:bg-sky-950/30' 
                                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                              }`}
                              title={b.isArchived ? 'Activate Notification' : 'Archive Notification'}
                            >
                              <Archive size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteBroadcast(b._id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE JUDGE MODAL */}
      {showJudgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-display font-extrabold text-lg pb-3 border-b border-slate-150 text-slate-900 dark:text-white">Create Judge Account</h3>
            
            <form onSubmit={handleCreateJudge} className="flex flex-col gap-4 mt-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">Judge Name</label>
                <input
                  type="text"
                  value={newJudgeName}
                  onChange={(e) => setNewJudgeName(e.target.value)}
                  placeholder="e.g. Judge Arthur"
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">Email</label>
                <input
                  type="email"
                  value={newJudgeEmail}
                  onChange={(e) => setNewJudgeEmail(e.target.value)}
                  placeholder="judge@contest.com"
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">Mobile</label>
                <input
                  type="text"
                  value={newJudgeMobile}
                  onChange={(e) => setNewJudgeMobile(e.target.value)}
                  placeholder="9876543210"
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">Password</label>
                <input
                  type="password"
                  value={newJudgePassword}
                  onChange={(e) => setNewJudgePassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">City</label>
                <input
                  type="text"
                  value={newJudgeCity}
                  onChange={(e) => setNewJudgeCity(e.target.value)}
                  placeholder="Mumbai"
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJudgeModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl shadow transition-all cursor-pointer font-bold"
                >
                  Register Judge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-display font-extrabold text-lg pb-3 border-b border-slate-150 text-slate-900 dark:text-white">Reject Photograph Entry</h3>
            
            <div className="flex flex-col gap-4 mt-4 text-xs">
              <p className="text-slate-400">Please provide a constructive audit reason explaining why this photograph is being disqualified:</p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Detected smartphone capture metadata. Non-DSLR captures are prohibited."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-24 focus:outline-none focus:border-red-500"
                required
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handlePhotoStatusUpdate(selectedPhoto.submissionId, selectedPhoto.photoId, 'Rejected', rejectionReason)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl shadow transition-all cursor-pointer font-bold"
                >
                  Submit Disqualification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL / ZOOM VIEW MODAL */}
      {selectedPhoto && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto overflow-x-hidden">
          <div className="relative w-full max-w-5xl max-h-[92vh] md:h-[85vh] bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200 text-left my-auto overflow-y-auto md:overflow-hidden overflow-x-hidden">
            
            {/* Left Column: Image/Video Viewport */}
            <div className="w-full md:flex-1 bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative h-64 sm:h-80 md:h-full shrink-0 border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden">
              {selectedPhoto.mediaType === 'video' || selectedPhoto.fileUrl?.match(/\.(mp4|mov|webm|avi|mkv)$/i) ? (
                <video 
                  src={getBackendUrl(selectedPhoto.fileUrl)} 
                  controls
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  preload="metadata"
                  className="w-full h-full object-contain rounded-2xl shadow-lg border border-slate-800"
                />
              ) : (
                <img 
                  src={getBackendUrl(selectedPhoto.fileUrl)} 
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain rounded-2xl shadow-lg border border-slate-800"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* Right Column: Information Panel */}
            <div className="w-full md:w-96 max-w-full bg-slate-50 dark:bg-slate-900 flex flex-col justify-between shrink-0 md:h-full overflow-x-hidden overflow-visible md:overflow-y-auto">
              {/* Sidebar Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0 bg-white dark:bg-slate-950 sticky top-0 z-10">
                <div className="min-w-0 pr-2">
                  <h3 className="font-display font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider truncate">Photograph Inspection</h3>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Admin Read-Only Viewer</span>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sidebar Body */}
              <div className="p-5 sm:p-6 flex flex-col gap-4 text-xs grow overflow-x-hidden">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Title & Category</span>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white mt-0.5 wrap-break-word">{selectedPhoto.title}</h3>
                  <span className="bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-350 px-2 py-0.5 rounded font-bold text-[9px] inline-block mt-1">
                    {selectedPhoto.category}
                  </span>
                  {selectedPhoto.scores && selectedPhoto.scores.length > 0 && (
                    <span className={`px-2 py-0.5 rounded font-bold text-[9px] inline-block mt-1 ml-2 ${
                      selectedPhoto.scores.some(s => s.approvalStatus === 'Disapproved')
                        ? 'bg-red-500/10 text-red-500 font-extrabold'
                        : 'bg-emerald-500/10 text-emerald-500 font-extrabold'
                    }`}>
                      Average Grade: {
                        selectedPhoto.scores.some(s => s.approvalStatus === 'Disapproved')
                          ? '0.0/10'
                          : (selectedPhoto.scores.reduce((a, s) => a + (s.averageScore || 0), 0) / selectedPhoto.scores.length).toFixed(1) + '/10'
                      }
                    </span>
                  )}
                </div>
                
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Owner / Photographer</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-250 mt-0.5 wrap-break-word">{selectedPhoto.participantName}</p>
                  <p className="text-[10px] text-slate-400 break-all">{selectedPhoto.participantEmail}</p>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Story Details</span>
                  <p className="text-slate-500 leading-relaxed mt-0.5 wrap-break-word">{selectedPhoto.description || 'No description shared.'}</p>
                </div>

                {selectedPhoto.customFields && selectedPhoto.customFields.length > 0 ? (
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 min-w-0">
                    <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Category Specifications</span>
                    <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500">
                      {selectedPhoto.customFields.map((cf, idx) => (
                        <div key={idx} className="min-w-0">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold truncate">{cf.label}:</span>
                          <p className="font-bold text-slate-700 dark:text-slate-250 mt-0.5 wrap-break-word">{cf.value || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 min-w-0">
                    <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">EXIF Device Info</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                      <div className="min-w-0">
                        <span>Brand:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250 truncate">{selectedPhoto.cameraBrand}</p>
                      </div>
                      <div className="min-w-0">
                        <span>Model:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250 truncate">{selectedPhoto.cameraModel}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                      <div className="min-w-0">
                        <span>Lens:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250 truncate">{selectedPhoto.lensUsed || 'N/A'}</p>
                      </div>
                      <div className="min-w-0">
                        <span>Capture Date:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250 truncate">{selectedPhoto.dateCaptured ? new Date(selectedPhoto.dateCaptured).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                      <div className="min-w-0">
                        <span>Dimensions:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250 truncate">{selectedPhoto.width && selectedPhoto.height ? `${selectedPhoto.width}x${selectedPhoto.height}` : 'N/A'}</p>
                      </div>
                      <div className="min-w-0">
                        <span>Format:</span>
                        <p className="font-bold text-slate-700 dark:text-slate-250 truncate">{selectedPhoto.format || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 min-w-0">
                  <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Cloudinary & Security</span>
                  <p className="break-all">Cloudinary ID: <span className="font-mono text-slate-700 dark:text-slate-350 break-all">{selectedPhoto.cloudinaryPublicId || 'N/A'}</span></p>
                  <p className="break-all">Original File: <span className="font-mono text-slate-700 dark:text-slate-350 break-all">{selectedPhoto.originalFilename || 'N/A'}</span></p>
                  <p className="mt-1 flex items-center gap-1 flex-wrap">
                    DSLR Validation: 
                    <span className={`font-bold px-1.5 py-0.5 rounded ${
                      selectedPhoto.dslrValidationStatus === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : selectedPhoto.dslrValidationStatus === 'REJECTED'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {selectedPhoto.dslrValidationStatus}
                    </span>
                  </p>
                  {selectedPhoto.validationReason && (
                    <p className="italic text-slate-400 mt-0.5 wrap-break-word">"{selectedPhoto.validationReason}"</p>
                  )}
                </div>

                {/* ALWAYS VISIBLE JUDGE EVALUATIONS SECTION */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 min-w-0">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">
                      Judge Evaluations {selectedPhoto.scores?.length ? `(${selectedPhoto.scores.length})` : ''}
                    </span>
                    {selectedPhoto.scores && selectedPhoto.scores.length > 0 && (
                      <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        {selectedPhoto.scores.length} Evaluated
                      </span>
                    )}
                  </div>

                  {selectedPhoto.scores && selectedPhoto.scores.length > 0 ? (
                    <div className="flex flex-col gap-2.5 min-w-0">
                      {selectedPhoto.scores.map((score, sIdx) => (
                        <div key={sIdx} className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col gap-2 text-[10px] text-left min-w-0">
                          <div className="flex justify-between items-center w-full flex-wrap gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{score.judgeName || `Judge #${sIdx + 1}`}</span>
                            </div>
                            <span className={`font-black px-2.5 py-0.5 rounded-full text-[9px] shrink-0 ${
                              (score.approvalStatus || 'Approved') === 'Approved' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}>
                              {score.approvalStatus || 'Approved'} ({score.averageScore || 0}/10)
                            </span>
                          </div>

                          {/* Remarks Box */}
                          <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 min-w-0">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Evaluation Remarks:</span>
                            {score.remarks ? (
                              <p className="italic font-medium leading-relaxed wrap-break-word">"{score.remarks}"</p>
                            ) : (
                              <p className="italic text-slate-400 text-[9px]">No remarks submitted by judge.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-100/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center text-slate-400 italic text-[10px]">
                      No judge evaluations recorded yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARTICIPANT DETAIL INSPECTOR MODAL */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">Photographer Profile Audit</h3>
                <p className="text-xs text-slate-400">Detailed account, payment and entry records for {selectedParticipant.name}</p>
              </div>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-full cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs">
              {/* Profile and Entry Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Account Details */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-2">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px]">Account Profile</h4>
                  <div className="flex flex-col gap-1 text-slate-500">
                    <p>Name: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedParticipant.name}</span></p>
                    <p>Email: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParticipant.email}</span></p>
                    <p>Mobile: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParticipant.mobile}</span></p>
                    <p>City: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParticipant.city}</span></p>
                    <p>Registered: <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(selectedParticipant.createdAt).toLocaleString()}</span></p>
                    <p>Last Login: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParticipant.lastLogin ? new Date(selectedParticipant.lastLogin).toLocaleString() : 'Never'}</span></p>
                    <p>Account Status:
                      <span className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedParticipant.isSuspended
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/20'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                      }`}>
                        {selectedParticipant.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </p>
                    {selectedParticipant.isSuspended && selectedParticipant.suspensionReason && (
                      <div className="mt-1 p-2.5 bg-red-50/80 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/20 rounded-xl text-[10px] text-red-700 dark:text-red-300">
                        <span className="font-bold uppercase tracking-wider block mb-1">Suspension Reason:</span>
                        <p className="italic">"{selectedParticipant.suspensionReason}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Entry details */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-2">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px]">Contest Folder</h4>
                  <div className="flex flex-col gap-1 text-slate-500">
                    <p>Entry Number: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedParticipant.entryNumber}</span></p>
                    <p>Plan Selected: <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {selectedParticipant.packageId === 'pkg-1' ? 'Starter (1 Photo)' : selectedParticipant.packageId === 'pkg-2' ? 'Amateur (2 Photos)' : selectedParticipant.packageId === 'pkg-3' ? 'Pro (5 Photos)' : 'None'}
                    </span></p>
                    <p>Entry Amount: <span className="font-semibold text-slate-700 dark:text-slate-300">₹{selectedParticipant.amount}</span></p>
                    <p>Slots Limit: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParticipant.photoLimit} photos</span></p>
                    <p>Uploaded Count: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParticipant.photosCount} photos</span></p>
                    <p>Remaining Slots: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParticipant.remainingSlots}</span></p>
                    <p>Entry Status: 
                      <span className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedParticipant.entryStatus === 'Finalized' 
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20' 
                          : 'bg-slate-100 text-slate-650 dark:bg-slate-800'
                      }`}>
                        {selectedParticipant.entryStatus}
                      </span>
                    </p>
                  </div>
                </div>

                {/* 3. Payment Gateway Audits */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-2">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px]">Razorpay Gateway Audit</h4>
                  <div className="flex flex-col gap-1 text-slate-500">
                    <p>Payment Status:
                      <span className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedParticipant.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                          : selectedParticipant.paymentStatus === 'Refunded'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                            : selectedParticipant.paymentStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600 dark:bg-red-950/20'
                      }`}>
                        {selectedParticipant.paymentStatus}
                      </span>
                    </p>
                    <p>Razorpay Order ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-350 block truncate">{selectedParticipant.razorpayOrderId}</span></p>
                    <p>Razorpay Payment ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-350 block truncate">{selectedParticipant.razorpayPaymentId}</span></p>
                    <p>Payment Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParticipant.paymentDate ? new Date(selectedParticipant.paymentDate).toLocaleString() : 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Uploaded Photos / Videos Section */}
              <div>
                <h4 className="font-bold text-slate-750 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-3">
                  {selectedParticipant.eventTitle?.match(/video|reel|short|film|movie|clip/i) || selectedParticipant.eventType === 'video' ? 'Submitted Videos' : 'Submitted Photographs'} ({selectedParticipant.photosCount})
                </h4>
                
                {selectedParticipant.photographs && selectedParticipant.photographs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedParticipant.photographs.map(photo => (
                      <div key={photo.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex gap-3 p-3">
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
                            className="w-24 h-24 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-950"
                          />
                        ) : (
                          <img 
                            src={getBackendUrl(photo.fileUrl)} 
                            alt={photo.title}
                            className="w-24 h-24 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-800"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="flex flex-col gap-1 min-w-0">
                          <h5 className="font-bold text-slate-900 dark:text-white truncate">{photo.title}</h5>
                          <p className="text-[9px] text-slate-400">Filename: <span className="font-mono truncate block">{photo.originalFilename || 'N/A'}</span></p>
                          <p className="text-[9px] text-slate-500">Camera: <span className="font-semibold">{(() => {
                            const isInv = (s) => !s || s.trim() === '' || s.trim().toUpperCase() === 'UNKNOWN' || s.trim().toUpperCase() === 'N/A';
                            const b = isInv(photo.cameraBrand) ? '' : photo.cameraBrand.trim();
                            const m = isInv(photo.cameraModel) ? '' : photo.cameraModel.trim();
                            if (b && m) return `${b} ${m}`;
                            if (b) return b;
                            if (m) return m;
                            return 'N/A';
                          })()}</span></p>
                          <p className="text-[9px] text-slate-500">Lens: <span className="font-semibold">{photo.lensUsed || 'N/A'}</span></p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              photo.status === 'Approved' 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                                : photo.status === 'Rejected' 
                                  ? 'bg-red-50 text-red-600' 
                                  : 'bg-slate-100 text-slate-500'
                            }`}>
                              Audit: {photo.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              photo.dslrValidationStatus === 'VERIFIED' 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                                : photo.dslrValidationStatus === 'REJECTED' 
                                  ? 'bg-red-50 text-red-600' 
                                  : 'bg-amber-50 text-amber-650'
                            }`}>
                              EXIF: {photo.dslrValidationStatus}
                            </span>
                          </div>

                          {/* Judge Evaluation – Admin Read-Only */}
                          {photo.scores && photo.scores.length > 0 && (
                            <div className="mt-2 flex flex-col gap-1.5">
                              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Judge Evaluations</span>
                              {photo.scores.map((s, idx) => (
                                <div key={idx} className={`rounded-lg p-2 flex flex-col gap-1 border ${
                                  s.approvalStatus === 'Disapproved'
                                    ? 'bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/20'
                                    : 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/40 dark:border-emerald-900/20'
                                }`}>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[9px] font-semibold text-slate-700 dark:text-slate-300">{s.judgeName}</span>
                                    {s.approvalStatus === 'Disapproved' ? (
                                      <span className="text-[8px] bg-red-100 dark:bg-red-950/30 text-red-600 font-bold px-1.5 py-0.5 rounded-full">✗ Disapproved</span>
                                    ) : (
                                      <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">★ {s.averageScore?.toFixed(1)}/10</span>
                                    )}
                                  </div>
                                  {s.approvalStatus === 'Disapproved' && s.remarks && (
                                    <p className="text-[9px] italic text-red-600 dark:text-red-300 leading-snug bg-red-100/50 dark:bg-red-950/30 rounded p-1.5">"{s.remarks}"</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
                    <p className="text-xs text-slate-500 italic">No photographs uploaded yet.</p>
                 </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-right">
              <button
                onClick={() => setSelectedParticipant(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINNER ASSIGNMENTS MODAL */}
      {eventToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-display font-extrabold text-lg pb-3 border-b border-slate-150 text-slate-900 dark:text-white">Publish Winner Rankings</h3>
            
            <form onSubmit={handlePublishWinners} className="flex flex-col gap-4 mt-4 text-xs">
              <p className="text-slate-400">Map top judged entries to their respective rewards. This will close the contest registrations and declare scores publicly:</p>
              
              <div className="flex flex-col gap-4">
                {winnerAssignments.map((win, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="font-bold text-indigo-600 uppercase tracking-wide">{win.rank} ({win.reward})</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Select Photo Entry</label>
                        <select
                          value={`${win.submissionId}:${win.photoId}`}
                          onChange={(e) => {
                            const [subId, photoId] = e.target.value.split(':');
                            const photo = photographs.find(p => p.photoId === photoId);
                            const updated = [...winnerAssignments];
                            updated[idx].submissionId = subId;
                            updated[idx].photoId = photoId;
                            updated[idx].photographId = photoId;
                            updated[idx].userName = photo ? photo.participantName : '';
                            updated[idx].photoTitle = photo ? photo.title : '';
                            updated[idx].fileUrl = photo ? photo.fileUrl : '';
                            updated[idx].score = photo ? photo.averageScore : 0;
                            setWinnerAssignments(updated);
                          }}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          required
                        >
                          <option value="">-- Choose Photograph --</option>
                          {photographs
                            .filter(p => p.status !== 'Rejected' && p.scores?.length > 0 && p.paymentStatus !== 'Unpaid')
                            .map(p => (
                              <option key={p.photoId} value={`${p.submissionId}:${p.photoId}`}>
                                {p.title} - By {p.participantName} (Avg: {p.averageScore})
                              </option>
                            ))}
                        </select>
                      </div>
                      
                      <div className="flex flex-col justify-end text-[11px] font-semibold text-slate-700 dark:text-slate-200 p-2">
                        <p>Recipient: {win.userName || 'N/A'}</p>
                        <p className="mt-1">Average Grade: {win.score}/10</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setEventToPublish(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl shadow transition-all cursor-pointer font-bold"
                >
                  Publish Winners & End Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN JUDGES TO EVENT MODAL */}
      {showAssignJudgesModal && selectedEventForJudges && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Assign Judges to Event
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Selected judges will have access to see and grade all submissions for <strong>{selectedEventForJudges.title}</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {judges.map(j => {
                const isChecked = selectedJudgesForEvent.includes(j._id);
                return (
                  <label 
                    key={j._id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked 
                        ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/10 dark:border-indigo-900' 
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJudgesForEvent([...selectedJudgesForEvent, j._id]);
                        } else {
                          setSelectedJudgesForEvent(selectedJudgesForEvent.filter(id => id !== j._id));
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{j.name}</span>
                      <span className="text-[10px] text-slate-400">{j.email} • {j.city}</span>
                    </div>
                  </label>
                );
              })}
              {judges.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No judge accounts created yet. Please create judge accounts first.</p>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-150 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAssignJudgesModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl transition-all cursor-pointer font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEventJudges}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl shadow transition-all cursor-pointer font-bold text-xs"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEST CREATION SUCCESS MODAL */}
      {showEventSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl mb-2">
                <Check size={28} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Contest Draft Created
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The contest draft <strong>"{createdEventTitle}"</strong> has been successfully created. You can now assign judges to it or click "Activate" to publish it live for contestants.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowEventSuccessModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center"
            >
              Awesome, Understood
            </button>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                Edit Draft Contest
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="p-6 overflow-y-auto max-h-[80vh] flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Contest Title</label>
                  <input
                    type="text"
                    value={editEventTitle}
                    onChange={(e) => setEditEventTitle(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Contest Category Type</label>
                  <select
                    value={editEventType}
                    onChange={(e) => setEditEventType(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 font-bold cursor-pointer"
                  >
                    <option value="" disabled>Select Contest Type</option>
                    {contestTypes.map(ct => (
                      <option key={ct._id} value={ct.name}>{ct.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Event Image (Login & Register Background)</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-350 dark:border-slate-800 rounded-xl text-xs cursor-pointer hover:border-indigo-600 transition-colors">
                    <span className="text-[11px] text-slate-500 truncate">
                      {uploadingEditBg ? 'Uploading...' : editLoginBgUrl ? 'Event Image Uploaded ✓' : 'Upload Event Image (PNG/JPG)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditLoginBgUpload}
                      className="hidden"
                      disabled={uploadingEditBg}
                    />
                  </label>
                  {editLoginBgUrl && (
                    <button
                      type="button"
                      onClick={() => setEditLoginBgUrl('')}
                      className="text-[10px] text-red-500 hover:underline cursor-pointer font-semibold shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Category Assignment Checkboxes */}
              <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-4 rounded-2xl text-left">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 dark:text-slate-350">
                    Assign Categories to this Contest Type <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({editEventCategories.length} selected - mandatory)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {categories.filter(c => c.contestTypes && c.contestTypes.includes(editEventType)).map(cat => (
                    <label key={cat._id} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editEventCategories.includes(cat.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditEventCategories([...editEventCategories, cat.name]);
                          } else {
                            setEditEventCategories(editEventCategories.filter(name => name !== cat.name));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-350 dark:border-slate-800 focus:ring-indigo-500 cursor-pointer"
                      />
                      {cat.name}
                    </label>
                  ))}
                  {categories.filter(c => c.contestTypes && c.contestTypes.includes(editEventType)).length === 0 && (
                    <p className="text-xs text-amber-600 italic col-span-4 text-left">
                      No categories are currently assigned to "{editEventType}". Please assign/create categories for this type in the "Categories" tab first.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Contest Theme / Subtitle</label>
                <input
                  type="text"
                  value={editEventTheme}
                  onChange={(e) => setEditEventTheme(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Event Start Date</label>
                  <input
                    type="date"
                    value={editEventStartDate}
                    onChange={(e) => setEditEventStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Submission Deadline</label>
                  <input
                    type="date"
                    value={editEventDeadline}
                    onChange={(e) => setEditEventDeadline(e.target.value)}
                    min={editEventStartDate || new Date().toISOString().split('T')[0]}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Venue Location Address</label>
                <input
                  type="text"
                  value={editEventVenue}
                  onChange={(e) => setEditEventVenue(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Contest Description</label>
                <textarea
                  value={editEventDescription}
                  onChange={(e) => setEditEventDescription(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-20 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Rules & Guidelines (One per line)</label>
                <textarea
                  value={editEventRules}
                  onChange={(e) => setEditEventRules(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-24 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              {/* Exhibition Range */}
              <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editHasExhibition}
                    onChange={(e) => setEditHasExhibition(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Is there an Exhibition scheduled at the Venue?</span>
                </label>

                {editHasExhibition && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-500">Exhibition Start Date</span>
                      <input
                        type="date"
                        value={editExhibitionFromDate}
                        onChange={(e) => setEditExhibitionFromDate(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-500">Exhibition End Date</span>
                      <input
                        type="date"
                        value={editExhibitionToDate}
                        onChange={(e) => setEditExhibitionToDate(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-150 dark:border-slate-800 pt-4">
                
                {/* Left Side: Prizes Rewards */}
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-slate-850 dark:text-white">Prizes & Awards Configuration</span>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-4 flex-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-semibold">1st Prize Reward</span>
                      <input
                        type="text"
                        value={editPrize1Reward}
                        onChange={(e) => setEditPrize1Reward(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-semibold">2nd Prize Reward</span>
                      <input
                        type="text"
                        value={editPrize2Reward}
                        onChange={(e) => setEditPrize2Reward(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-semibold">3rd Prize Reward</span>
                      <input
                        type="text"
                        value={editPrize3Reward}
                        onChange={(e) => setEditPrize3Reward(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side: Packages config */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center h-4.5">
                    <span className="font-bold text-slate-850 dark:text-white">Submission Entry Packages Fees</span>
                    <button
                      type="button"
                      onClick={() => setEditEventPackages([...editEventPackages, { name: '', price: 0, maxPhotos: 1 }])}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      + Add Package
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-4 flex-1">
                    {editEventPackages.map((pkg, idx) => (
                      <div key={idx} className={`flex flex-row gap-1.5 sm:gap-3 items-end ${idx > 0 ? 'border-t border-slate-200/50 dark:border-slate-800/40 pt-4' : ''}`}>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-semibold truncate">Package Name</label>
                          <input
                            type="text"
                            value={pkg.name}
                            onChange={(e) => {
                              const newPkgs = [...editEventPackages];
                              newPkgs[idx].name = e.target.value;
                              setEditEventPackages(newPkgs);
                            }}
                            placeholder="e.g. Starter"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            required
                          />
                        </div>
                        
                        <div className="w-14 sm:w-24 flex flex-col gap-1 shrink-0">
                          <label className="text-[10px] text-slate-400 font-semibold truncate">Price <span className="hidden sm:inline">(₹)</span></label>
                          <input
                            type="number"
                            value={pkg.price || ''}
                            onChange={(e) => {
                              const newPkgs = [...editEventPackages];
                              newPkgs[idx].price = Number(e.target.value);
                              setEditEventPackages(newPkgs);
                            }}
                            placeholder="Price"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            required
                          />
                        </div>

                        <div className="w-12 sm:w-20 flex flex-col gap-1 shrink-0">
                          <label className="text-[10px] text-slate-400 font-semibold truncate">Max <span className="hidden sm:inline">Uploads</span></label>
                          <input
                            type="number"
                            value={pkg.maxPhotos || ''}
                            onChange={(e) => {
                              const newPkgs = [...editEventPackages];
                              newPkgs[idx].maxPhotos = Number(e.target.value);
                              setEditEventPackages(newPkgs);
                            }}
                            placeholder="Max"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            required
                          />
                        </div>

                        {editEventPackages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPkgs = editEventPackages.filter((_, pIdx) => pIdx !== idx);
                              setEditEventPackages(newPkgs);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors mb-0.5"
                            data-tooltip="Remove Package"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Event Certificate Templates Section (Edit Modal) */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl flex flex-col gap-3 mt-3">
                <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                  <Award className="text-amber-500" size={16} />
                  <h4 className="font-display font-extrabold text-xs text-slate-850 dark:text-white uppercase tracking-wider">
                    Event Certificate Templates (Linked to this Event)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Upload separate certificate images for 1st Prize, 2nd Prize, 3rd Prize, and Participation. These templates will be assigned only to participants of this event.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
                  {[
                    { key: 'firstPrize', label: '1st Prize Certificate' },
                    { key: 'secondPrize', label: '2nd Prize Certificate' },
                    { key: 'thirdPrize', label: '3rd Prize Certificate' },
                    { key: 'participation', label: 'Participation Certificate' }
                  ].map(({ key, label }) => {
                    const certs = editEventCertificates;
                    const uploading = uploadingEditCert[key];
                    const certUrl = certs[key];

                    return (
                      <div key={key} className="flex flex-col gap-1.5 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{label}</label>
                        <label className="flex flex-col items-center justify-center px-2 py-2.5 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-xs cursor-pointer hover:border-indigo-600 transition-colors">
                          <span className="text-[10px] font-semibold text-slate-500 truncate text-center">
                            {uploading ? 'Uploading...' : certUrl ? 'Template Uploaded ✓' : 'Choose Image'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleCertificateFileUpload(key, e.target.files[0], true)}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                        {certUrl && (
                          <div className="flex items-center justify-between text-[10px] mt-1">
                            <span className="text-emerald-600 font-bold truncate">Uploaded ✓</span>
                            <button
                              type="button"
                              onClick={() => setEditEventCertificates(prev => ({ ...prev, [key]: '' }))}
                              className="text-red-500 hover:underline font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 px-6 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVATE CONTEST CONFIRMATION MODAL */}
      {showActivateConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-2xl mb-2 animate-bounce">
                <Sparkles size={28} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Activate Contest
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to activate this contest? This will make it visible to all participants on the home page and enable registrations.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowActivateConfirmModal(false);
                  setActivateTargetId(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeActivateEvent}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center"
              >
                Yes, Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT PURGE CONFIRMATION MODAL */}
      {showPurgeConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl mb-2 animate-bounce">
                <AlertTriangle size={28} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Permanent Purge Warning
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you absolutely sure you want to PERMANENTLY PURGE <strong>"{purgeBackupTarget?.title}"</strong>? This will delete all submissions, payments, uploaded photographs, and judges evaluations from the database forever. This action CANNOT be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPurgeConfirmModal(false);
                  setPurgeBackupTarget(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePurgeBackup}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center"
              >
                Yes, Purge Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE EVENT CONFIRMATION MODAL */}
      {showDeleteEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl mb-2 animate-bounce">
                <AlertTriangle size={28} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Delete Contest Confirmation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete the event <strong>"{eventToDeleteTitle}"</strong>? This will permanently delete the event record, rules, and winner lists. Proceed?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteEventModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteEvent}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center"
              >
                Delete Contest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CATEGORY CONFIRMATION MODAL */}
      {showDeleteCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl mb-2 animate-bounce">
                <AlertTriangle size={28} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Delete Category Confirmation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete the category <strong>"{catToDeleteName}"</strong>? This will permanently delete the category. Proceed?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteCatModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs text-center font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteCategory}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND PAYMENT CONFIRMATION MODAL */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl mb-2">
                <RotateCcw size={30} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Confirm Refund Payment
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to refund the payment for participant <strong>"{participantToRefundName}"</strong>?
              </p>
              <div className="mt-1 w-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-4 text-left flex flex-col gap-1.5">
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  This will mark their entry as <strong>Refunded / Unpaid</strong> and credit back the amount to their respective bank account.
                </p>
                <p className="text-[10px] text-amber-700/80 dark:text-amber-400/70 pl-5">
                  This action is recorded in the audit log and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowRefundModal(false); setParticipantToRefundId(null); setParticipantToRefundName(''); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs text-center font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRefundParticipant}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center flex items-center justify-center gap-2"
              >
                <RotateCcw size={13} />
                Yes, Refund Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PARTICIPANT CONFIRMATION MODAL */}
      {showDeleteParticipantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl mb-2 animate-bounce">
                <AlertTriangle size={28} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Delete Participant Confirmation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete the participant <strong>"{participantToDeleteName}"</strong>? This deletes their account and all uploaded submissions permanently. Proceed?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteParticipantModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs text-center font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteParticipant}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center"
              >
                Delete Participant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE JUDGE CONFIRMATION MODAL */}
      {showDeleteJudgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl mb-2 animate-bounce">
                <AlertTriangle size={28} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Delete Judge Confirmation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete the judge <strong>"{judgeToDeleteName}"</strong>? This will permanently delete their account. Proceed?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteJudgeModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteJudge}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center"
              >
                Delete Judge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT HISTORY LEDGER MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-6xl h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                    Events History
                  </h3>
                  <p className="text-[10px] text-slate-400">Complete historical financial audits, judges sign-off status, and winner lists</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grow overflow-hidden flex flex-col md:flex-row min-h-0">
              
              {/* Left Column: Events List */}
              <div className="w-full md:w-1/3 border-r border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search contests by name..."
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                    <RefreshCw size={24} className="animate-spin text-indigo-600" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Loading history data...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {eventHistory
                      .filter(e => e.title.toLowerCase().includes(historySearch.toLowerCase()))
                      .map(e => (
                        <div
                          key={e.id}
                          onClick={() => setActiveHistoryEvent(e)}
                          className={`p-3 border rounded-2xl cursor-pointer transition-all text-xs ${
                            activeHistoryEvent?.id === e.id
                              ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10'
                              : 'border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                              {e.title}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                              e.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                              e.status === 'Closed' ? 'bg-red-50 text-red-600 dark:bg-red-950/20' :
                              e.status === 'Active' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {e.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2">
                            <span>Deadline: {new Date(e.deadline).toLocaleDateString()}</span>
                            <span>Created: {new Date(e.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}

                    {eventHistory.length === 0 && (
                      <div className="text-center text-slate-400 py-12 text-xs">No contests found.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Detail View */}
              <div className="grow overflow-y-auto p-6 bg-white dark:bg-slate-900">
                {activeHistoryEvent ? (
                  <div className="flex flex-col gap-6">
                    {/* Event Title & status */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-full">
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-display leading-snug">
                          {activeHistoryEvent.title}
                        </h4>
                        <p className="text-xs sm:text-[10px] text-slate-500 dark:text-slate-400 mt-1 sm:mt-0.5 leading-relaxed">Theme: {activeHistoryEvent.theme}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                          activeHistoryEvent.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                          activeHistoryEvent.status === 'Closed' ? 'bg-red-50 text-red-600 dark:bg-red-950/20' :
                          activeHistoryEvent.status === 'Active' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {activeHistoryEvent.status}
                        </span>
                        <button
                          onClick={() => {
                            setEventToDeleteId(activeHistoryEvent.id);
                            setEventToDeleteTitle(activeHistoryEvent.title);
                            setShowDeleteEventModal(true);
                            setShowHistoryModal(false);
                          }}
                          className="p-2.5 sm:p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 rounded-xl sm:rounded-lg cursor-pointer transition-colors"
                          data-tooltip="Archive & Delete Contest"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Quick stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-center">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Participants</span>
                        <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">
                          {activeHistoryEvent.participantsCount}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-center">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Total Photos</span>
                        <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">
                          {activeHistoryEvent.totalPhotos}
                        </span>
                        <span className="text-[8px] text-slate-400 mt-0.5 block">
                          {activeHistoryEvent.approvedPhotos} Approved • {activeHistoryEvent.rejectedPhotos} Rejected
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-center">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Total Payments</span>
                        <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">
                          {activeHistoryEvent.totalPaymentsCount}
                        </span>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl text-center">
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold block uppercase tracking-wider">Total Revenue</span>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block font-display">
                          ₹{activeHistoryEvent.totalRevenue?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Winners section */}
                    <div>
                      <h5 className="font-display font-extrabold text-slate-900 dark:text-white text-[11px] mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                        <Award size={13} className="text-indigo-600" />
                        Winners Circle
                      </h5>
                      {activeHistoryEvent.winnersPublished && activeHistoryEvent.winners?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {activeHistoryEvent.winners.map((win, index) => (
                            <div key={index} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col gap-1.5">
                              <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600">{win.rank}</span>
                              <p className="font-bold text-[11px] text-slate-900 dark:text-white line-clamp-1">{win.photoTitle || 'Untitled'}</p>
                              <div className="text-[9px] text-slate-400 flex flex-col gap-0.5">
                                <span>By: {win.userName}</span>
                                <span>Reward: {win.reward}</span>
                                <span className="font-bold text-slate-600 dark:text-slate-300">Grade: {win.score}/10</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                          Winners rankings have not been declared/published for this contest yet.
                        </div>
                      )}
                    </div>

                    {/* Judges Section */}
                    <div>
                      <h5 className="font-display font-extrabold text-slate-900 dark:text-white text-[11px] mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                        <Users size={13} className="text-indigo-600" />
                        Evaluation Judges Panel
                      </h5>
                      {activeHistoryEvent.judgeDetails?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeHistoryEvent.judgeDetails.map((j) => (
                            <div key={j.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-[11px] text-slate-900 dark:text-white">{j.name}</p>
                                <p className="text-[9px] text-slate-400">{j.email} • {j.city}</p>
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                j.hasConfirmed 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              }`}>
                                {j.hasConfirmed ? 'Signed Off' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                          No judges assigned to this event.
                        </div>
                      )}
                    </div>

                    {/* Split lists: Participants vs Payments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Participants List */}
                      <div>
                        <h5 className="font-display font-extrabold text-slate-900 dark:text-white text-[11px] mb-3 uppercase tracking-wide">
                          Contestants ({activeHistoryEvent.participantDetails?.length || 0})
                        </h5>
                        <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
                          {activeHistoryEvent.participantDetails?.map((p) => (
                            <div key={p.userId} className="p-2.5 flex justify-between items-center text-[10px] bg-slate-50/50 dark:bg-slate-950/30">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                                <p className="text-[9px] text-slate-400">{p.email}</p>
                              </div>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                p.isFinalSubmitted 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {p.isFinalSubmitted ? 'Finalized' : 'Draft'}
                              </span>
                            </div>
                          ))}
                          {(!activeHistoryEvent.participantDetails || activeHistoryEvent.participantDetails.length === 0) && (
                            <div className="text-[10px] text-slate-400 p-6 text-center">No participants registered yet.</div>
                          )}
                        </div>
                      </div>

                      {/* Payments List */}
                      <div>
                        <h5 className="font-display font-extrabold text-slate-900 dark:text-white text-[11px] mb-3 uppercase tracking-wide">
                          Revenue Transactions ({activeHistoryEvent.paymentDetails?.length || 0})
                        </h5>
                        <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
                          {activeHistoryEvent.paymentDetails?.map((pay, pIdx) => (
                            <div key={pIdx} className="p-2.5 text-[10px] bg-slate-50/50 dark:bg-slate-950/30 flex justify-between items-start">
                              <div>
                                <p className="font-bold text-slate-950 dark:text-white">{pay.userName}</p>
                                <p className="text-[8px] text-slate-400 font-mono mt-0.5">TXN: {pay.transactionId}</p>
                                <p className="text-[8px] text-slate-400 mt-0.5">Date: {new Date(pay.paymentDate).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-emerald-600 dark:text-emerald-400 font-display block">
                                  ₹{pay.amount}
                                </span>
                                <span className="text-[8px] text-slate-400 mt-0.5 block">{pay.packageName}</span>
                              </div>
                            </div>
                          ))}
                          {(!activeHistoryEvent.paymentDetails || activeHistoryEvent.paymentDetails.length === 0) && (
                            <div className="text-[10px] text-slate-400 p-6 text-center">No payment transactions processed yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                    <History size={36} className="text-slate-300 mb-2 animate-pulse" />
                    <p className="text-xs font-semibold">Select a contest from the left to view complete history details.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SUSPEND PARTICIPANT MODAL */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl mb-2 animate-bounce">
                <Ban size={28} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Suspend Participant Account
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are about to suspend the participant account of <strong>"{suspendTargetName}"</strong>. They will no longer be able to submit photos or pay, and their account will be set to read-only.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-semibold dark:text-slate-400">
                Suspension Explanation / Remarks (Required)
              </label>
              <textarea
                value={suspendRemarks}
                onChange={(e) => setSuspendRemarks(e.target.value)}
                placeholder="Explain the reason for suspending this participant..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 dark:text-white leading-relaxed resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendTargetId(null);
                  setSuspendTargetName('');
                  setSuspendRemarks('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!suspendRemarks.trim()}
                onClick={executeSuspendParticipant}
                className={`flex-1 font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center ${
                  suspendRemarks.trim()
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-850 dark:text-slate-600 cursor-not-allowed shadow-none'
                }`}
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERAL SUCCESS MESSAGE MODAL */}
      {showGeneralSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="text-center flex flex-col gap-2 items-center">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl mb-2">
                <Check size={28} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                {generalSuccessTitle}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {generalSuccessMsg}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGeneralSuccessModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs text-center"
            >
              Awesome, Understood
            </button>
          </div>
        </div>
      )}

      {/* INCOMPLETE GRADING PROGRESS MODAL POPUP (Appears when admin clicks on Judges & Results tab) */}
      {activeTab === 'judges' && showIncompleteGradingModal && (() => {
        const incompleteItems = events.filter(e => !e.winnersPublished && e.status !== 'Completed' && e.status !== 'Results Published' && !e.gradingConfirmed).map(e => {
          const eventPhotos = photographs.filter(p => p.eventId === e._id);
          const assignedJudges = e.assignedJudges || [];
          const totalRequiredReviews = eventPhotos.length * assignedJudges.length;
          let completedReviews = 0;
          eventPhotos.forEach(p => {
            (p.scores || []).forEach(s => {
              if (assignedJudges.includes(s.judgeId)) {
                completedReviews++;
              }
            });
          });

          const confirmedJudgesList = e.confirmedJudges || [];
          const allConfirmed = assignedJudges.length > 0 && assignedJudges.every(jId => confirmedJudgesList.includes(jId));
          const isIncomplete = !allConfirmed || (totalRequiredReviews > 0 && completedReviews < totalRequiredReviews);

          const pendingJudges = [];
          if (assignedJudges.length > 0) {
            assignedJudges.forEach(jId => {
              const judgeObj = judges.find(j => j._id === jId);
              if (judgeObj) {
                let gradedCount = 0;
                eventPhotos.forEach(p => {
                  if ((p.scores || []).some(s => s.judgeId === jId)) {
                    gradedCount++;
                  }
                });
                const isConfirmed = confirmedJudgesList.includes(jId);
                if (gradedCount < eventPhotos.length) {
                  pendingJudges.push({
                    name: judgeObj.name,
                    statusText: `${eventPhotos.length - gradedCount} left`
                  });
                } else if (!isConfirmed) {
                  pendingJudges.push({
                    name: judgeObj.name,
                    statusText: 'Awaiting Confirmation'
                  });
                }
              }
            });
          }

          return {
            event: e,
            isIncomplete,
            totalRequiredReviews,
            completedReviews,
            progressPercentage: totalRequiredReviews > 0 ? Math.round((completedReviews / totalRequiredReviews) * 100) : 0,
            pendingJudges
          };
        }).filter(item => item.isIncomplete);

        if (incompleteItems.length === 0) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 max-w-2xl w-full shadow-2xl flex flex-col gap-4 sm:gap-6 relative animate-in zoom-in-95 duration-200 my-auto max-h-[82vh] sm:max-h-[85vh]">
              {/* Close Button */}
              <button
                onClick={() => setShowIncompleteGradingModal(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4 pr-6">
                <div className="p-2.5 sm:p-3 bg-amber-500/10 text-amber-500 rounded-2xl shrink-0">
                  <Clock size={22} className="animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-widest block">
                    Grading Status Alert
                  </span>
                  <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    Incomplete Grading Progress Events ({incompleteItems.length})
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    The following assigned contests have pending photo evaluations or unconfirmed jury sign-offs:
                  </p>
                </div>
              </div>

              {/* List of Incomplete Events - Height reduced on mobile view to show 1 event details card at a time */}
              <div className="flex flex-col gap-3.5 max-h-[230px] sm:max-h-[55vh] overflow-y-auto pr-1">
                {incompleteItems.map(({ event: ev, totalRequiredReviews, completedReviews, progressPercentage, pendingJudges }) => (
                  <div
                    key={ev._id}
                    className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-3 text-left"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {ev.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Deadline: {ev.deadline ? new Date(ev.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
                        Grading Incomplete
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span>Grading Progress:</span>
                        <span>{completedReviews} / {totalRequiredReviews} Reviews ({progressPercentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Pending Judges list */}
                    {pendingJudges.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="font-bold text-slate-500">Pending Jury:</span>
                        {pendingJudges.map((pj, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/30 rounded-md font-semibold"
                          >
                            {pj.name} ({pj.statusText})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action: Select Event */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setSelectedEventId(ev._id);
                          setShowIncompleteGradingModal(false);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        Inspect & Manage Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Modal Footer */}
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowIncompleteGradingModal(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Acknowledge & Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Export Action Buttons Bar directly over copyright footer (Dashboard tab only) */}
      {activeTab === 'overview' && (
        <div className="mt-10 mb-4 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-3xl">
            <button
              onClick={() => handleExportCSV('participants')}
              className="w-full sm:w-auto bg-[#d97706] hover:bg-[#b45309] text-white font-black py-3 px-6 rounded-full text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 tracking-wide uppercase"
              title="Export Participants List Excel/CSV"
            >
              <Download size={15} className="text-white" />
              <span>Export Participants Excel/CSV</span>
            </button>

            <button
              onClick={() => handleExportCSV('financial')}
              className="w-full sm:w-auto bg-[#111625] hover:bg-slate-900 text-white font-black py-3 px-6 rounded-full text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 tracking-wide uppercase border border-slate-700/60"
              title="Export Revenue Ledger Excel/CSV"
            >
              <Download size={15} className="text-white" />
              <span>Export Revenue Ledger Excel/CSV</span>
            </button>

            <button
              onClick={() => handleExportCSV('photographs')}
              className="w-full sm:w-auto bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black py-3 px-6 rounded-full text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 tracking-wide uppercase"
              title="Export Photos Metadata Excel/CSV"
            >
              <Download size={15} className="text-white" />
              <span>Export Photos Metadata Excel/CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer inside right scrollable area */}
      <footer className="py-4 text-xs text-center text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
        <p>&copy; {new Date().getFullYear()} sumbaran Art Society. All rights reserved.</p>
      </footer>

      </main>
    </div>
  );
}
