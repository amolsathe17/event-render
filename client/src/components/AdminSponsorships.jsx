import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  X,
  FileSpreadsheet,
  Download,
  Printer
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
  const [noticeModalMessage, setNoticeModalMessage] = useState('');

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

  const handleExportCSV = (extension = 'csv') => {
    const listToExport = Array.isArray(sponsorships) ? sponsorships : [];
    if (listToExport.length === 0) {
      alert('No donation or sponsorship records available to export.');
      return;
    }

    const activeEv = allEvents.find(e => e._id === selectedEventId);
    const eventTitle = activeEv ? activeEv.title : 'All Events Combined';

    const headers = ['Sr No', 'Sponsor / Donor Name', 'Organization', 'Funding Type', 'Supported Event', 'Amount (INR)', 'Funding Date', 'Status'];
    const rows = listToExport.map((item, idx) => [
      idx + 1,
      `"${(item.sponsorName || item.name || '').replace(/"/g, '""')}"`,
      `"${(item.orgName || '—').replace(/"/g, '""')}"`,
      `"${(item.sponsorType || 'Sponsorship').replace(/"/g, '""')}"`,
      `"${(item.eventTitle || eventTitle).replace(/"/g, '""')}"`,
      Number(item.amount || 0),
      `"${item.fundingDate ? new Date(item.fundingDate).toLocaleDateString('en-IN') : 'N/A'}"`,
      `"${(item.status || 'Received').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `Donation_Sponsorship_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.${extension}`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    handleExportCSV('csv');
  };

  const getLogoBase64 = () => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = img.width;
      cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(cvs.toDataURL('image/jpeg'));
    };
    img.onerror = () => resolve('/sumbacontest.jpg');
    img.src = '/sumbacontest.jpg';
  });

  const generateOfficialAuditReport = async () => {
    const logoBase64 = await getLogoBase64();
    const listToPrint = Array.isArray(sponsorships) ? sponsorships : [];
    const activeEv = allEvents.find(e => e._id === selectedEventId);
    const eventTitle = activeEv ? activeEv.title : 'All Events Combined';
    const totalFunding = summary?.totalFunding || listToPrint.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const totalExpenses = summary?.totalExpenses || 0;
    const totalRevenue = summary?.totalRevenue || 0;
    const netProfitLoss = summary?.netProfitLoss || (totalRevenue + totalFunding - totalExpenses);
    const generatedDateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    const badgeBase = 'display: inline-block; vertical-align: middle; text-align: center; line-height: 1.3; box-sizing: border-box; font-family: "Segoe UI", Arial, sans-serif;';

    const rowsHtml = listToPrint.map((item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 10px; font-weight: bold; color: #64748b; text-align: left;">${idx + 1}</td>
        <td style="padding: 8px 10px; font-weight: bold; color: #0f172a; text-align: left;">${item.sponsorName || item.name || 'Sponsor Name'}</td>
        <td style="padding: 8px 10px; color: #334155; text-align: left;">${item.orgName || '—'}</td>
        <td style="padding: 8px 10px; font-weight: bold; color: #4338ca; text-align: left;">${item.sponsorType || 'Sponsorship'}</td>
        <td style="padding: 8px 10px; color: #475569; text-align: left;">${item.eventTitle || eventTitle}</td>
        <td style="padding: 8px 10px; text-align: right; font-weight: 900; color: #047857;">₹${(Number(item.amount) || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; text-align: center;">
          <span style="${badgeBase} background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 12px; font-size: 9px; font-weight: bold;">
            ${item.status || 'Received'}
          </span>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Audit Report - ${eventTitle}</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #fff; }
            .page-container { width: 210mm; min-height: 297mm; padding: 15px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; margin: 0 auto; background: #fff; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background-color: #f1f5f9; color: #0f172a; font-weight: 800; text-transform: uppercase; padding: 8px 10px; text-align: left; border-bottom: 2px solid #64748b; font-size: 10px; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div>
              <div style="width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="${logoBase64}" style="height: 44px; width: auto; object-fit: contain; display: block; border-radius: 4px;" alt="Sumbaran Art Society Logo" />
                  <div>
                    <h1 style="font-size: 18px; font-weight: 900; margin: 0; color: #0f172a; line-height: 1.2;">SUMBARAN ART SOCIETY</h1>
                    <p style="font-size: 9px; color: #475569; margin: 3px 0 0 0; line-height: 1.3;">Address: 1414/1A, Trio Chambers, Nr. Renuka Swaroop Girls High School, Sadashiv Peth, Pune - 411030.</p>
                    <p style="font-size: 9px; color: #475569; margin: 2px 0 0 0; line-height: 1.3;">Phone: +91 98765 43210 • Email: support@sumbaranartsociety.com • Website: https://sumbaranartsociety.com</p>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="${badgeBase} border: 2px solid #0f172a; color: #0f172a; padding: 5px 12px; border-radius: 6px; font-size: 9.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">OFFICIAL AUDIT REPORT</span>
                  <p style="font-size: 9px; color: #475569; margin: 6px 0 0 0; font-weight: 600; line-height: 1.2;">Generated: ${generatedDateStr}</p>
                </div>
              </div>

              <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; background-color: #f8fafc; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; line-height: 1.2;">NAME OF CONTEST</span>
                  <h2 style="font-size: 16px; font-weight: 900; color: #0f172a; margin: 2px 0 0 0; line-height: 1.2;">${eventTitle}</h2>
                  <p style="font-size: 11px; color: #4338ca; margin: 2px 0 0 0; font-weight: 800; line-height: 1.3;">Donation & Sponsorship Report</p>
                </div>
                <div style="text-align: right;">
                  <span style="${badgeBase} border: 1.5px solid #4338ca; color: #4338ca; background-color: #eef2ff; padding: 5px 14px; border-radius: 20px; font-size: 10px; font-weight: 800;">
                    ${listToPrint.length} records found
                  </span>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;">
                <div style="padding: 10px; background-color: #ecfdf5; border: 2px solid #6ee7b7; border-radius: 12px; text-align: left;">
                  <span style="font-size: 8px; font-weight: 800; color: #065f46; text-transform: uppercase;">REGISTRATION REVENUE</span>
                  <p style="font-size: 18px; font-weight: 900; color: #047857; margin: 3px 0 0 0;">₹${totalRevenue.toLocaleString('en-IN')}</p>
                  <span style="font-size: 8px; color: #047857; font-weight: 500;">Participant entry fees</span>
                </div>
                <div style="padding: 10px; background-color: #faf5ff; border: 2px solid #d8b4fe; border-radius: 12px; text-align: left;">
                  <span style="font-size: 8px; font-weight: 800; color: #6b21a8; text-transform: uppercase;">SPONSORSHIPS & GRANTS</span>
                  <p style="font-size: 18px; font-weight: 900; color: #7e22ce; margin: 3px 0 0 0;">₹${totalFunding.toLocaleString('en-IN')}</p>
                  <span style="font-size: 8px; color: #7e22ce; font-weight: 500;">Corporate, CSR & Donations</span>
                </div>
                <div style="padding: 10px; background-color: #fff1f2; border: 2px solid #fca5a5; border-radius: 12px; text-align: left;">
                  <span style="font-size: 8px; font-weight: 800; color: #9f1239; text-transform: uppercase;">TOTAL EXPENSES</span>
                  <p style="font-size: 18px; font-weight: 900; color: #be123c; margin: 3px 0 0 0;">₹${totalExpenses.toLocaleString('en-IN')}</p>
                  <span style="font-size: 8px; color: #be123c; font-weight: 500;">Operational line items</span>
                </div>
                <div style="padding: 10px; background-color: ${netProfitLoss >= 0 ? '#eef2ff' : '#fff1f2'}; border: 2px solid ${netProfitLoss >= 0 ? '#a5b4fc' : '#fca5a5'}; border-radius: 12px; text-align: left;">
                  <span style="font-size: 8px; font-weight: 800; color: ${netProfitLoss >= 0 ? '#3730a3' : '#9f1239'}; text-transform: uppercase;">NET PROFIT / LOSS</span>
                  <p style="font-size: 18px; font-weight: 900; color: ${netProfitLoss >= 0 ? '#4338ca' : '#be123c'}; margin: 3px 0 0 0;">₹${netProfitLoss.toLocaleString('en-IN')}</p>
                  <span style="font-size: 8px; color: ${netProfitLoss >= 0 ? '#4338ca' : '#be123c'}; font-weight: 500;">${netProfitLoss >= 0 ? 'Surplus balance' : 'Deficit shortfall'}</span>
                </div>
              </div>

              <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 12px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
                  <thead>
                    <tr style="background-color: #f1f5f9; color: #0f172a; font-weight: bold; border-bottom: 2px solid #64748b;">
                      <th style="padding: 8px 10px; text-align: left;">#</th>
                      <th style="padding: 8px 10px; text-align: left;">Sponsor / Donor Name</th>
                      <th style="padding: 8px 10px; text-align: left;">Organization</th>
                      <th style="padding: 8px 10px; text-align: left;">Funding Type</th>
                      <th style="padding: 8px 10px; text-align: left;">Supported Event</th>
                      <th style="padding: 8px 10px; text-align: right;">Amount (₹)</th>
                      <th style="padding: 8px 10px; text-align: center;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml || '<tr><td colspan="7" style="text-align: center; padding: 24px; color: #94a3b8;">No donation or sponsorship for this event.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>

            <div style="border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; color: #64748b; font-size: 9px; font-weight: 600;">
              <div style="vertical-align: middle; line-height: 1;">DSLR Photography Contest & Event Portal — Sumbaran Art Society Confidential Report</div>
              <div style="${badgeBase} background-color: #0f172a; color: #ffffff; padding: 5px 12px; border-radius: 6px; font-size: 9px; font-weight: 800;">
                Page 1 of 1
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow popups to print/export the donation and sponsorship report.');
      return;
    }
    const html = await generateOfficialAuditReport();
    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 500);
  };

  const handleExportPDF = async () => {
    const listToPrint = Array.isArray(sponsorships) ? sponsorships : [];
    if (listToPrint.length === 0) {
      alert('No donation or sponsorship records available to export.');
      return;
    }

    const activeEv = allEvents.find(e => e._id === selectedEventId);
    const eventTitle = activeEv ? activeEv.title : 'All Events Combined';
    const fileName = `Donation_Sponsorship_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

    try {
      const htmlContent = await generateOfficialAuditReport();
      const pageContainer = document.createElement('div');
      pageContainer.style.position = 'absolute';
      pageContainer.style.top = '-9999px';
      pageContainer.style.left = '-9999px';
      pageContainer.style.width = '210mm';
      pageContainer.style.backgroundColor = '#ffffff';
      pageContainer.innerHTML = htmlContent;
      document.body.appendChild(pageContainer);

      const elementToRender = pageContainer.querySelector('.page-container') || pageContainer;

      const canvas = await html2canvas(elementToRender, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(pageContainer);

      const doc = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate downloadable PDF. Triggering print fallback.');
      handlePrint();
    }
  };

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
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white">
          {selectedEventId && selectedEventId !== 'all' && activeEventObj ? `${activeEventObj.title} - Sponsorships & Donations` : 'All Events Sponsorships & Donations'}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
            title="Export Excel"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
            title="Export CSV"
          >
            <Download size={14} /> CSV
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
            title="Export PDF"
          >
            <FileText size={14} /> PDF
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
            title="Print Donation & Sponsorship Report"
          >
            <Printer size={14} /> Print
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Sponsorship / Donation</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards in 1 Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Total Sponsorship / Donations */}
        <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md text-left">
          <span className="text-[10px] sm:text-[11px] font-extrabold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
            TOTAL SPONSORSHIP / DONATIONS
          </span>
          <p className="font-display font-black text-xl sm:text-2xl text-purple-950 dark:text-white">
            ₹{(summary?.totalFunding !== undefined ? summary.totalFunding : ((summary?.totalSponsorship || 0) + (summary?.totalDonations || 0))).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] font-semibold text-purple-700/80 dark:text-purple-300/80">Corporate, CSR & Individual Grants</span>
        </div>

        {/* Card 2: Pending Funding */}
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md text-left">
          <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
            PENDING FUNDING
          </span>
          <p className="font-display font-black text-xl sm:text-2xl text-amber-950 dark:text-white">
            ₹{(summary?.pendingFunding || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] font-semibold text-amber-700/80 dark:text-amber-300/80">Committed / Unsettled Grants</span>
        </div>

        {/* Card 3: Total No. of Sponsors / Donors */}
        <div className="bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-1.5 shadow-2xs transition-all hover:shadow-md text-left">
          <span className="text-[10px] sm:text-[11px] font-extrabold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
            TOTAL NO. OF SPONSORS / DONORS
          </span>
          <p className="font-display font-black text-xl sm:text-2xl text-sky-950 dark:text-white">
            {(summary?.sponsorCount || 0) + (summary?.donorCount || 0)}
          </p>
          <span className="text-[10px] font-semibold text-sky-700/80 dark:text-sky-300/80">Corporate, CSR & Individual Partners</span>
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
          <table className="w-full text-left border-collapse min-w-225">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Fixed Header */}
            <div className="shrink-0 bg-white dark:bg-slate-900 px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 z-10">
              <div>
                <h2 className="font-display font-black text-xl text-slate-900 dark:text-white mb-1">
                  {editingRecord ? 'Edit Sponsorship / Donation Record' : 'Record New Sponsorship / Donation'}
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in complete details of financial support, donor/sponsor background, and agreement links.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">

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
        </div>
      )}
    </div>
  );
}
