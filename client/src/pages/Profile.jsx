import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle2, ShieldAlert, Check, Upload } from 'lucide-react';
import { getBackendUrl } from '../utils/url';

export default function Profile() {
  const { user, updateProfile, logout, apiFetch, refreshUser } = useAuth();
  const navigate = useNavigate();
  const profilePhotoInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [city, setCity] = useState(user?.city || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile photo must be less than 5 MB.');
      return;
    }

    setUploadingAvatar(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const data = await apiFetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData
      });

      if (data.success) {
        setSuccess('Profile photo updated successfully!');
        if (refreshUser) await refreshUser();
      }
    } catch (err) {
      setError(err.message || 'Failed to upload profile photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      setError('Please fill in all required fields');
      return;
    }

    if (mobile.replace(/\D/g, '').length !== 10) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }

    if (password.trim() !== '' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await updateProfile({
        name,
        mobile,
        city: city || 'Not specified',
        password: password || undefined
      });

      if (data.success) {
        if (password.trim() !== '') {
          setShowSuccessModal(true);
          setPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 3000);
        } else {
          setSuccess('Profile updated successfully!');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-left animate-in fade-in duration-200">
      
      {/* HEADER / TITLE TOOLBAR (Matching media_1788337965160.png) */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Participant Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Welcome back, {user?.name || "Participant"}!
          </p>
        </div>

        {/* Current Session Badge (Hidden on Mobile) */}
        <div className="hidden sm:flex h-11 items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-xs font-extrabold text-slate-600 dark:text-slate-300 shadow-2xs shrink-0">
          <Calendar size={15} className="text-indigo-500 shrink-0" />
          <span>Current Session: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </header>

      {/* Main Container Card (Matching media_1788337965160.png) */}
      <div className="bg-[#f4f3ff] dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-8">
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Profile Photo Upload Banner Box (Matching media_1788337965160.png) */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden border-2 border-indigo-500 shrink-0">
                {user?.avatar ? (
                  <img
                    src={getBackendUrl(user.avatar)}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <div>
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Profile Photo
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md leading-relaxed">
                  Upload a participant profile photo. This photo will appear in your top navigation bar and contest scorecards.
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={profilePhotoInputRef}
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => profilePhotoInputRef.current && profilePhotoInputRef.current.click()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6 rounded-full transition-all shadow-md cursor-pointer shrink-0 self-start sm:self-center flex items-center gap-2"
            >
              <Upload size={14} />
              <span>{uploadingAvatar ? 'Uploading...' : 'Upload Photo'}</span>
            </button>
          </div>

          {/* Form Fields: Row 1 (3 Columns matching media_1788337965160.png) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Participant Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Participant Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Participant Name"
                className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white shadow-2xs outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Column 2: Mobile Number */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="10-digit Mobile Number"
                className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white shadow-2xs outline-none focus:ring-2 focus:ring-indigo-500"
                required
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

          {/* Form Fields: Row 2 (2 Columns matching media_1788337965160.png) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: New Password (Optional) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                New Password (Optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white shadow-2xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Right-Aligned Save Button (Matching media_1788337965160.png) */}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Success Redirect Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-4 items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center">
              <Check size={24} className="stroke-[3]" />
            </div>
            <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white mt-2">
              Password Updated Successfully!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your security details have changed. You are being logged out and redirected to the login page.
            </p>
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mt-2"></div>
          </div>
        </div>
      )}
    </div>
  );
}
