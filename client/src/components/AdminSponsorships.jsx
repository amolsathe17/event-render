import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBackendUrl } from '../utils/url';
import {
  Building2,
  DollarSign,
  Plus,
  Search,
  Calendar,
  FileText,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  ExternalLink,
  Upload,
  UserCheck,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';

const SPONSOR_TYPES = [
  'Corporate',
  'CSR Funding',
  'Government',
  'Government Scheme',
  'Educational Institute',
  'NGO',
  'Trust / Foundation',
  'Individual',
  'Other'
];

const PAYMENT_MODES = [
  'Bank Transfer',
  'UPI',
  'Cheque',
  'Demand Draft',
  'Cash',
  'Online Gateway',
  'Other'
];

const STATUS_OPTIONS = [
  'Received',
  'Pending',
  'Partially Received',
  'Approved'
];

export default function AdminSponsorships({ allEvents = [], selectedEventId = 'all', setSelectedEventId }) {
  const { apiFetch } = useAuth();
  const backendUrl = getBackendUrl();

  const [sponsorships, setSponsorships] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sponsorName: '',
    orgName: '',
    sponsorType: 'Corporate',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    amount: '',
    fundingDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    transactionId: '',
    purpose: '',
    eventId: selectedEventId || 'all',
    category: 'General Sponsorship',
    status: 'Received',
    documentUrl: '',
    notes: ''
  });

  const fetchSponsorships = async () => {
    const activeId = selectedEventId || 'all';
    try {
      const query = new URLSearchParams();
      if (activeId && activeId !== 'all') query.append('eventId', activeId);
      if (search) query.append('search', search);
      if (typeFilter) query.append('sponsorType', typeFilter);
      if (statusFilter) query.append('status', statusFilter);

      const res = await apiFetch(`/api/sponsorships?${query.toString()}`);
      if (res.success) {
        setSponsorships(res.sponsorships || []);
      }
    } catch (err) {
      console.error('Error fetching sponsorships:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    const activeId = selectedEventId || 'all';
    try {
      const query = activeId && activeId !== 'all' ? `?eventId=${activeId}` : '';
      const res = await apiFetch(`/api/sponsorships/summary${query}`);
      if (res.success) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Error fetching sponsorship summary:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSponsorships();
    fetchSummary();
  }, [selectedEventId, search, typeFilter, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormData({
      sponsorName: '',
      orgName: '',
      sponsorType: 'Corporate',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      amount: '',
      fundingDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Bank Transfer',
      transactionId: '',
      purpose: '',
      eventId: selectedEventId || 'all',
      category: 'General Sponsorship',
      status: 'Received',
      documentUrl: '',
      notes: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (rec) => {
    setEditingRecord(rec);
    setFormData({
      sponsorName: rec.sponsorName || '',
      orgName: rec.orgName || '',
      sponsorType: rec.sponsorType || 'Corporate',
      contactPerson: rec.contactPerson || '',
      email: rec.email || '',
      phone: rec.phone || '',
      address: rec.address || '',
      amount: rec.amount || '',
      fundingDate: rec.fundingDate ? new Date(rec.fundingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMode: rec.paymentMode || 'Bank Transfer',
      transactionId: rec.transactionId || '',
      purpose: rec.purpose || '',
      eventId: rec.eventId || 'all',
      category: rec.category || 'General Sponsorship',
      status: rec.status || 'Received',
      documentUrl: rec.documentUrl || '',
      notes: rec.notes || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('Document file size must be less than 15 MB.');
      return;
    }

    setUploadingDoc(true);
    setError('');

    try {
      const dataForm = new FormData();
      dataForm.append('document', file);

      const res = await apiFetch('/api/sponsorships/upload-document', {
        method: 'POST',
        body: dataForm
      });

      if (res.success && res.fileUrl) {
        setFormData(prev => ({ ...prev, documentUrl: res.fileUrl }));
      } else {
        setError(res.message || 'Failed to upload agreement document.');
      }
    } catch (err) {
      console.error('Document upload error:', err);
      setError(err.message || 'Error uploading document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sponsorName || !formData.amount) {
      setError('Sponsor / Donor Name and Amount are required.');
      return;
    }

    try {
      const url = editingRecord ? `/api/sponsorships/${editingRecord._id}` : '/api/sponsorships';
      const method = editingRecord ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.success) {
        setShowModal(false);
        fetchSponsorships();
        fetchSummary();
      } else {
        setError(res.message || 'Failed to save record.');
      }
    } catch (err) {
      console.error('Error saving sponsorship record:', err);
      setError(err.message || 'Server error saving record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sponsorship/donation record?')) return;
    try {
      const res = await apiFetch(`/api/sponsorships/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchSponsorships();
        fetchSummary();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete record.');
    }
  };

  const activeEventObj = allEvents.find(e => e._id === selectedEventId);
  const activeEventTitle = activeEventObj ? activeEventObj.title : 'All Events Combined';

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
                Financial Support & Grants
              </span>
              {selectedEventId && selectedEventId !== 'all' && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold">
                  {activeEventTitle}
                </span>
              )}
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Donation & Sponsorship Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track and manage corporate sponsorships, CSR funding, government schemes, institutional grants, foundation support, and individual donations event-wise.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer border border-indigo-400/30"
          >
            <Plus size={18} />
            <span>Add Sponsorship / Donation</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards in 1 Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Sponsorship / Donations */}
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
              TOTAL SPONSORSHIP / DONATIONS
            </span>
            <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-3">
            <p className="font-display font-black text-2xl text-indigo-700 dark:text-indigo-300">
              ₹{(summary?.totalFunding !== undefined ? summary.totalFunding : ((summary?.totalSponsorship || 0) + (summary?.totalDonations || 0))).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] font-semibold text-indigo-600/80 dark:text-indigo-400/80">Corporate, CSR & Individual Grants</span>
          </div>
        </div>

        {/* Card 2: Pending Funding */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              PENDING FUNDING
            </span>
            <Clock size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-3">
            <p className="font-display font-black text-2xl text-amber-700 dark:text-amber-400">
              ₹{(summary?.pendingFunding || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] font-semibold text-amber-600/80 dark:text-amber-400/80">Committed / Unsettled Grants</span>
          </div>
        </div>

        {/* Card 3: Total No. of Sponsors / Donors */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-slate-900 border border-purple-200 dark:border-purple-800/60 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-purple-900 dark:text-purple-300 uppercase tracking-wider">
              TOTAL NO. OF SPONSORS / DONORS
            </span>
            <Building2 size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-3">
            <p className="font-display font-black text-2xl text-purple-700 dark:text-purple-300">
              {(summary?.sponsorCount || 0) + (summary?.donorCount || 0)}
            </p>
            <span className="text-[10px] font-semibold text-purple-600/80 dark:text-purple-400/80">Corporate, CSR & Individual Partners</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sponsor, org, contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Sponsor Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="">All Sponsor Types</option>
            {SPONSOR_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Funding Records Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Sponsor / Donor</th>
                <th className="py-3.5 px-4">Type & Category</th>
                <th className="py-3.5 px-4">Supported Event</th>
                <th className="py-3.5 px-4">Amount (₹)</th>
                <th className="py-3.5 px-4">Funding Date</th>
                <th className="py-3.5 px-4">Payment Info</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Document</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    Loading sponsorship & donation records...
                  </td>
                </tr>
              ) : sponsorships.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    No sponsorship or donation records found.
                  </td>
                </tr>
              ) : (
                sponsorships.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Sponsor / Donor */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{rec.sponsorName}</div>
                      {rec.orgName && <div className="text-[11px] text-slate-500 font-medium">{rec.orgName}</div>}
                      {rec.contactPerson && <div className="text-[10px] text-slate-400">Contact: {rec.contactPerson}</div>}
                    </td>

                    {/* Type & Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {rec.sponsorType}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">{rec.category || 'General'}</div>
                    </td>

                    {/* Supported Event */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {rec.eventTitle || 'All Events Combined'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div className="font-display font-black text-sm text-emerald-600 dark:text-emerald-400">
                        ₹{(rec.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Funding Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {rec.fundingDate ? new Date(rec.fundingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>

                    {/* Payment Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{rec.paymentMode}</div>
                      {rec.transactionId && <div className="text-[10px] text-slate-400 font-mono">Ref: {rec.transactionId}</div>}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        rec.status === 'Received' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' :
                        rec.status === 'Approved' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300' :
                        rec.status === 'Partially Received' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      }`}>
                        {rec.status}
                      </span>
                    </td>

                    {/* Document */}
                    <td className="py-3.5 px-4 text-center">
                      {rec.documentUrl ? (
                        <a
                          href={`${backendUrl}${rec.documentUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
                        >
                          <FileText size={13} />
                          <span>View Doc</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(rec)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(rec._id)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white mb-1">
              {editingRecord ? 'Edit Sponsorship / Donation Record' : 'Record New Sponsorship / Donation'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Fill in complete details of financial support, donor/sponsor background, and agreement links.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sponsor / Donor Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sponsor / Donor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp / Dr. Ramesh Sharma"
                    value={formData.sponsorName}
                    onChange={e => setFormData({ ...formData, sponsorName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Organization / Institute Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization / Institute Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Trusts / Dept of Culture"
                    value={formData.orgName}
                    onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Sponsor Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sponsor Type *
                  </label>
                  <select
                    value={formData.sponsorType}
                    onChange={e => setFormData({ ...formData, sponsorType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {SPONSOR_TYPES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(so => (
                      <option key={so} value={so}>{so}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supported Event */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supported Event *
                  </label>
                  <select
                    value={formData.eventId}
                    onChange={e => setFormData({ ...formData, eventId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="all">All Events Combined</option>
                    {allEvents.map(ev => (
                      <option key={ev._id} value={ev._id}>{ev.title}</option>
                    ))}
                  </select>
                </div>

                {/* Sponsorship Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sponsorship Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Title Sponsor, Gold Partner, CSR Grant"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Funding Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Funding Date
                  </label>
                  <input
                    type="date"
                    value={formData.fundingDate}
                    onChange={e => setFormData({ ...formData, fundingDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formData.paymentMode}
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {PAYMENT_MODES.map(pm => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>

                {/* Ref / UTR Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction / Ref #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR12938402"
                    value={formData.transactionId}
                    onChange={e => setFormData({ ...formData, transactionId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supporting Document / Agreement
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                    onChange={handleDocumentUpload}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {uploadingDoc && <span className="text-xs text-indigo-500 font-semibold animate-pulse">Uploading...</span>}
                  {formData.documentUrl && (
                    <a
                      href={`${backendUrl}${formData.documentUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline flex items-center gap-1"
                    >
                      <CheckCircle size={14} /> Attached
                    </a>
                  )}
                </div>
              </div>

              {/* Purpose & Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sponsorship Purpose / Allocation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Details regarding purpose or fund utilization..."
                  value={formData.purpose}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingRecord ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
