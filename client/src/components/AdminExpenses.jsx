import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  IndianRupee,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  Upload,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  PieChart as PieChartIcon,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  FileSpreadsheet,
  Download,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBackendUrl } from '../utils/url';

const CATEGORY_PIE_COLORS = [
  '#4f46e5', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#0ea5e9', // Sky
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#eab308'  // Yellow
];

export const EXPENSE_CATEGORIES = {
  'Event Venue Expenses': [
    'Venue/Hall Rental',
    'Stage and Decoration',
    'Seating Arrangements',
    'Electricity/Generator',
    'Cleaning and Maintenance',
    'Security'
  ],
  'Participant-Related Expenses': [
    'Participant Kits',
    'ID Cards/Badges',
    'Certificates',
    'Trophies and Medals',
    'Welcome Kits',
    'Refreshments/Food'
  ],
  'Judges & Staff Expenses': [
    'Judge Fees',
    'Staff Salaries/Allowances',
    'Travel Expenses',
    'Accommodation',
    'Food and Refreshments'
  ],
  'Photography / Video Expenses': [
    'Professional Photographers',
    'Videographers',
    'Cameras and Equipment',
    'Lighting Equipment',
    'Photo/Video Editing',
    'Storage and Backup'
  ],
  'Marketing & Promotion': [
    'Social Media Advertising',
    'Google/Facebook/Instagram Ads',
    'Posters and Banners',
    'Printing',
    'Influencer/Promotional Activities',
    'Website Promotion'
  ],
  'Technology Expenses': [
    'Website Hosting',
    'Domain',
    'Database/Server',
    'Cloud Storage',
    'Email/SMS/OTP Services',
    'Payment Gateway Charges',
    'Software Subscriptions'
  ],
  'Awards & Prizes': [
    'Cash Prizes',
    'Trophies',
    'Medals',
    'Certificates',
    'Gift Vouchers or Sponsored Prizes'
  ],
  'Travel & Accommodation': [
    'Guest Travel',
    'Judge Travel',
    'Hotel/Accommodation',
    'Local Transportation',
    'Airport/Station Pickup'
  ],
  'Food & Hospitality': [
    'Lunch/Dinner',
    'Snacks',
    'Tea/Coffee',
    'Drinking Water',
    'VIP Hospitality'
  ],
  'Administrative Expenses': [
    'Printing and Stationery',
    'Registration Desk',
    'Staff ID Cards',
    'Documentation',
    'Courier/Postage',
    'Bank/Payment Charges'
  ],
  'Miscellaneous / Emergency': [
    'Last-Minute Purchases',
    'Equipment Repair',
    'Additional Transportation',
    'Emergency Arrangements',
    'Other Unexpected Expenses'
  ]
};

export default function AdminExpenses({ allEvents = [], selectedEventId = '', setSelectedEventId }) {
  const { apiFetch } = useAuth();
  const backendUrl = getBackendUrl();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    eventId: '',
    category: 'Event Venue Expenses',
    subcategory: 'Venue/Hall Rental',
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidTo: '',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    receiptUrl: '',
    notes: ''
  });

  const fetchExpenses = async () => {
    const activeId = selectedEventId || 'all';
    try {
      const query = new URLSearchParams();
      if (activeId && activeId !== 'all') query.append('eventId', activeId);
      if (search) query.append('search', search);
      if (categoryFilter) query.append('category', categoryFilter);
      if (statusFilter) query.append('paymentStatus', statusFilter);

      const res = await apiFetch(`/api/expenses?${query.toString()}`);
      if (res.success) {
        setExpenses(res.expenses || []);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    const activeId = selectedEventId || 'all';
    try {
      const query = activeId && activeId !== 'all' ? `?eventId=${activeId}` : '';
      const res = await apiFetch(`/api/expenses/summary${query}`);
      if (res.success) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Error fetching expense summary:', err);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchExpenses(), fetchSummary()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [selectedEventId, search, categoryFilter, statusFilter]);

  const handleExportCSV = (extension = 'csv') => {
    const listToExport = Array.isArray(expenses) ? expenses : [];
    if (listToExport.length === 0) {
      alert('No expense records available to export.');
      return;
    }

    const activeEv = allEvents.find(e => e._id === selectedEventId);
    const eventTitle = activeEv ? activeEv.title : 'All Events Combined';

    const headers = ['Sr No', 'Expense Item Name', 'Category', 'Sub-Category', 'Amount (INR)', 'Vendor / Paid To', 'Payment Status', 'Logged Date'];
    const rows = listToExport.map((exp, idx) => [
      idx + 1,
      `"${(exp.title || exp.name || '').replace(/"/g, '""')}"`,
      `"${(exp.category || '').replace(/"/g, '""')}"`,
      `"${(exp.subcategory || exp.subCategory || '').replace(/"/g, '""')}"`,
      Number(exp.amount || 0),
      `"${(exp.paidTo || exp.vendor || 'Vendor Payout').replace(/"/g, '""')}"`,
      `"${(exp.paymentStatus || exp.status || 'Paid').replace(/"/g, '""')}"`,
      `"${exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : (exp.createdAt ? new Date(exp.createdAt).toLocaleDateString('en-IN') : 'N/A')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `Event_Expenses_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.${extension}`;
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
    const listToPrint = Array.isArray(expenses) ? expenses : [];
    const activeEv = allEvents.find(e => e._id === selectedEventId);
    const eventTitle = activeEv ? activeEv.title : 'All Events Combined';
    const totalExpenses = summary?.totalExpenses || listToPrint.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const totalFunding = summary?.totalFunding || 0;
    const totalRevenue = summary?.totalRevenue || 0;
    const netProfitLoss = summary?.netProfitLoss || (totalRevenue + totalFunding - totalExpenses);
    const generatedDateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    const badgeBase = 'display: inline-block; vertical-align: middle; text-align: center; line-height: 1.3; box-sizing: border-box; font-family: "Segoe UI", Arial, sans-serif;';

    const rowsHtml = listToPrint.map((exp, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 10px; font-weight: bold; color: #64748b; text-align: left;">${idx + 1}</td>
        <td style="padding: 8px 10px; font-weight: bold; color: #0f172a; text-align: left;">${exp.title || exp.name || 'Expense Item'}</td>
        <td style="padding: 8px 10px; color: #334155; text-align: left;">${exp.category || 'General'}</td>
        <td style="padding: 8px 10px; color: #475569; text-align: left;">${exp.subcategory || exp.subCategory || '—'}</td>
        <td style="padding: 8px 10px; color: #475569; text-align: left;">${exp.paidTo || exp.vendor || 'Vendor Payout'}</td>
        <td style="padding: 8px 10px; text-align: right; font-weight: 900; color: #e11d48;">₹${(Number(exp.amount) || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; text-align: center;">
          <span style="${badgeBase} background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 12px; font-size: 9px; font-weight: bold;">
            ${exp.paymentStatus || exp.status || 'Paid'}
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
                  <p style="font-size: 11px; color: #4338ca; margin: 2px 0 0 0; font-weight: 800; line-height: 1.3;">Event Expenses & Outflows Report</p>
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
                      <th style="padding: 8px 10px; text-align: left;">Record Title / Description</th>
                      <th style="padding: 8px 10px; text-align: left;">Category / Module</th>
                      <th style="padding: 8px 10px; text-align: left;">Sub-Category</th>
                      <th style="padding: 8px 10px; text-align: left;">Vendor / Paid To</th>
                      <th style="padding: 8px 10px; text-align: right;">Amount (₹)</th>
                      <th style="padding: 8px 10px; text-align: center;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml || '<tr><td colspan="7" style="text-align: center; padding: 24px; color: #94a3b8;">No expense records logged for this event.</td></tr>'}
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
      alert('Please allow popups to print/export the expenses report.');
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
    const listToPrint = Array.isArray(expenses) ? expenses : [];
    if (listToPrint.length === 0) {
      alert('No expense records available to export.');
      return;
    }

    const activeEv = allEvents.find(e => e._id === selectedEventId);
    const eventTitle = activeEv ? activeEv.title : 'All Events Combined';
    const fileName = `Event_Expenses_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

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
    setEditingExpense(null);
    const initialCategory = 'Event Venue Expenses';
    setFormData({
      eventId: selectedEventId || (allEvents[0]?._id || ''),
      category: initialCategory,
      subcategory: EXPENSE_CATEGORIES[initialCategory][0],
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paidTo: '',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      receiptUrl: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    const cat = expense.category || 'Event Venue Expenses';
    const subcats = EXPENSE_CATEGORIES[cat] || [];
    setFormData({
      eventId: expense.eventId?._id || expense.eventId || selectedEventId || (allEvents[0]?._id || ''),
      category: cat,
      subcategory: expense.subcategory || subcats[0] || '',
      name: expense.name || '',
      amount: expense.amount || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paidTo: expense.paidTo || '',
      paymentMethod: expense.paymentMethod || 'UPI',
      paymentStatus: expense.paymentStatus || 'Paid',
      receiptUrl: expense.receiptUrl || '',
      notes: expense.notes || ''
    });
    setShowModal(true);
  };

  const handleCategoryChange = (newCat) => {
    const subcats = EXPENSE_CATEGORIES[newCat] || [];
    setFormData(prev => ({
      ...prev,
      category: newCat,
      subcategory: subcats[0] || ''
    }));
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('receipt', file);

    setUploadingReceipt(true);
    try {
      const token = localStorage.getItem('token');
      const apiBase = backendUrl;
      const response = await fetch(`${apiBase}/api/expenses/upload-receipt`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });
      const result = await response.json();
      if (result.success && result.fileUrl) {
        setFormData(prev => ({ ...prev, receiptUrl: result.fileUrl }));
      } else {
        alert(result.message || 'Failed to upload receipt file');
      }
    } catch (err) {
      console.error('Receipt upload error:', err);
      alert('Error uploading receipt: ' + err.message);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetEventId = formData.eventId || selectedEventId || (allEvents[0]?._id || '');
    if (!targetEventId || !formData.category || !formData.name || !formData.amount) {
      alert('Please fill in all required fields (Category, Name, Amount)');
      return;
    }

    const payload = {
      ...formData,
      eventId: targetEventId
    };

    try {
      if (editingExpense) {
        const res = await apiFetch(`/api/expenses/${editingExpense._id}`, {
          method: 'PUT',
          body: payload
        });
        if (res.success) {
          setShowModal(false);
          refreshData();
        } else {
          alert(res.message || 'Failed to update expense');
        }
      } else {
        const res = await apiFetch('/api/expenses', {
          method: 'POST',
          body: payload
        });
        if (res.success) {
          setShowModal(false);
          refreshData();
        } else {
          alert(res.message || 'Failed to create expense');
        }
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('Error saving expense: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await apiFetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.success) {
        refreshData();
      } else {
        alert(res.message || 'Failed to delete expense');
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Error deleting expense: ' + err.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      const res = await apiFetch(`/api/expenses/${id}/status`, {
        method: 'PATCH',
        body: { paymentStatus: newStatus }
      });
      if (res.success) {
        refreshData();
      } else {
        alert(res.message || 'Failed to toggle payment status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const activeEvent = allEvents.find(e => String(e._id) === String(selectedEventId));
  const activeEventTitle = activeEvent?.title;

  const rawBg = activeEvent
    ? (activeEvent.loginBgUrl || activeEvent.imageUrl || activeEvent.image || activeEvent.coverImage)
    : null;

  let bgMediaUrl = '/hero-bg.jpg';
  let isVideoBg = false;

  if (selectedEventId && rawBg) {
    if (rawBg.startsWith('http://') || rawBg.startsWith('https://')) {
      bgMediaUrl = rawBg;
    } else if (rawBg.startsWith('/')) {
      bgMediaUrl = rawBg.startsWith('/uploads') ? `${backendUrl}${rawBg}` : rawBg;
    } else {
      bgMediaUrl = `${backendUrl}/${rawBg}`;
    }
    isVideoBg = Boolean(rawBg.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i));
  } else {
    bgMediaUrl = '/hero-bg.jpg';
  }

  const CustomCategoryPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0];
      const sliceColor = dataItem.color || '#4f46e5';
      return (
        <div 
          className="p-3.5 rounded-2xl shadow-2xl text-xs text-left z-50 min-w-44 border-l-4 border-slate-700 text-white"
          style={{ borderLeftColor: sliceColor, backgroundColor: '#0f172a', opacity: 1 }}
        >
          <p className="font-black text-white text-xs border-b border-slate-800 pb-1 mb-1.5">{dataItem.name}</p>
          <p className="font-black text-emerald-400 text-sm">
            Total Spent: ₹{(dataItem.value || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-300 font-bold mt-1">
            {dataItem.payload.count} item records ({dataItem.payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const pieChartData = summary?.categoryBreakdown
    ? summary.categoryBreakdown.map(cat => ({
        name: cat.category,
        value: cat.total,
        count: cat.count,
        percentage: summary.totalExpenses ? Math.round((cat.total / summary.totalExpenses) * 100) : 0
      }))
    : [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 text-left">
      
      {/* Top Header Card / Banner with Background Video / Image Overlay */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 text-white bg-slate-950">
        
        {/* Background Media (Video or Image) with reduced opacity */}
        {isVideoBg ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            src={bgMediaUrl}
            className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
          />
        ) : (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 pointer-events-none"
            style={{ backgroundImage: `url('${bgMediaUrl}')` }}
          />
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-950/75 to-indigo-950/80 backdrop-blur-[1px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs">
              {selectedEventId ? 'Event Expenses' : 'Combined All-Events Ledger'}
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white drop-shadow-md">
            {selectedEventId ? (activeEventTitle || 'Selected Event Expenses') : 'All Events Financial Summary & Expenses'}
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed drop-shadow-xs">
            Manage operational line-item budgets, vendor payouts, participant kit costs, venue rentals, and track Net Profit/Loss calculations.
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-end gap-2.5 self-start sm:self-center shrink-0">
          {/* Top Row: Export Action Buttons (Excel, CSV, PDF, Print) */}
          <div className="flex flex-wrap items-center justify-end gap-2">
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
              title="Print Event Expenses Report"
            >
              <Printer size={14} /> Print
            </button>
          </div>

          {/* Bottom Row: Add New Expense Button (Right Aligned Under Export Group) */}
          <div className="flex justify-end w-full">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-2xl text-xs shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 border border-emerald-400/30"
            >
              <Plus size={16} /> Add New Expense
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards Grid - 4 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Expenses */}
        <div className="bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-700 rounded-2xl p-5 text-left flex flex-col gap-1.5 shadow-xs transition-all hover:shadow-sm">
          <span className="text-[10px] text-rose-900/80 dark:text-rose-300 font-extrabold uppercase tracking-wider">Total Expenses</span>
          <p className="font-display font-black text-2xl sm:text-3xl text-rose-600 dark:text-rose-400">
            ₹{(summary?.totalExpenses || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-medium">{summary?.expenseCount || 0} line item records</span>
        </div>

        {/* Card 2: Paid Expenses */}
        <div className="bg-teal-50/70 dark:bg-teal-950/30 border-2 border-teal-300 dark:border-teal-700 rounded-2xl p-5 text-left flex flex-col gap-1.5 shadow-xs transition-all hover:shadow-sm">
          <span className="text-[10px] text-teal-900/80 dark:text-teal-300 font-extrabold uppercase tracking-wider">Paid Expenses</span>
          <p className="font-display font-black text-2xl sm:text-3xl text-teal-600 dark:text-teal-400">
            ₹{(summary?.paidExpenses || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-teal-600/70 dark:text-teal-400/70 font-medium">Cleared vendor payouts</span>
        </div>

        {/* Card 3: Pending Expenses */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-5 text-left flex flex-col gap-1.5 shadow-xs transition-all hover:shadow-sm">
          <span className="text-[10px] text-amber-900/80 dark:text-amber-300 font-extrabold uppercase tracking-wider">Pending Expenses</span>
          <p className="font-display font-black text-2xl sm:text-3xl text-amber-600 dark:text-amber-500">
            ₹{(summary?.pendingExpenses || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-medium">Unsettled accounts</span>
        </div>

        {/* Card 4: Sponsorship & Grants Funding Support */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border-2 border-indigo-300 dark:border-indigo-700 rounded-2xl p-5 text-left flex flex-col gap-1.5 shadow-xs transition-all hover:shadow-sm">
          <span className="text-[10px] text-indigo-900/80 dark:text-indigo-300 font-extrabold uppercase tracking-wider">Funding Support</span>
          <p className="font-display font-black text-2xl sm:text-3xl text-indigo-600 dark:text-indigo-400">
            ₹{(summary?.totalFunding || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 font-medium">Sponsorships, CSR & Donations</span>
        </div>
      </div>

      {/* All Events Financial Table (Displayed when no specific event is selected) */}
      {!selectedEventId && summary?.eventWiseFinancials && summary.eventWiseFinancials.length > 0 && (
        <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-base">
                Event-Wise Financial Performance Comparison
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed comparison of revenue, total expenses, paid, pending, and net margin across all contests
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4 text-right">Revenue (₹)</th>
                  <th className="py-3 px-4 text-right">Total Expenses (₹)</th>
                  <th className="py-3 px-4 text-right">Paid (₹)</th>
                  <th className="py-3 px-4 text-right">Pending (₹)</th>
                  <th className="py-3 px-4 text-right">Net Profit / Loss</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summary.eventWiseFinancials.map((evItem) => {
                  const isProfit = evItem.netProfitLoss >= 0;
                  return (
                    <tr key={evItem.eventId} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {evItem.title}
                        <span className="block text-[10px] font-normal text-slate-400">{evItem.status} • {evItem.expenseCount} expenses</span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{evItem.revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                        ₹{evItem.expenses.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-teal-600 dark:text-teal-400">
                        ₹{evItem.paid.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-amber-600 dark:text-amber-500">
                        ₹{evItem.pending.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 ${
                          isProfit ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        }`}>
                          {isProfit ? '+' : ''}₹{evItem.netProfitLoss.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEventId(evItem.eventId)}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold text-[11px] cursor-pointer"
                        >
                          View Expenses
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Breakdown & Pie Chart Card */}
      {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 && (
        <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3.5 min-h-[420px] lg:h-100 overflow-visible lg:overflow-hidden">
          
          {/* Fixed Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 shrink-0">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-base">
                Expenses Category Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual pie chart distribution and itemized spent capital across operational categories
              </p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
              <span>Highest Category:</span>
              <strong className="text-indigo-900 dark:text-white font-black">{summary.highestCategory}</strong>
            </div>
          </div>

          {/* Fixed Pie Chart (Left) + Scrollable Breakdown Grid (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0">
            
            {/* Left: Recharts Interactive Donut Pie Chart (Full Height on Mobile & Desktop) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl relative h-64 sm:h-72 lg:h-full shrink-0 min-h-[240px]">
              <div className="w-full h-full min-h-[220px] max-h-65 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_PIE_COLORS[index % CATEGORY_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      wrapperStyle={{ zIndex: 1000, opacity: 1, pointerEvents: 'none' }} 
                      content={<CustomCategoryPieTooltip />} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Center Donut Indicator */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Total Expenses</span>
                <span className="font-display font-black text-lg text-slate-900 dark:text-white">
                  ₹{(summary.totalExpenses || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                  {pieChartData.length} Categories
                </span>
              </div>
            </div>

            {/* Right: Itemized Category Cards Grid */}
            <div className="lg:col-span-7 h-full overflow-y-auto pr-1.5 custom-scrollbar max-h-80 lg:max-h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                {summary.categoryBreakdown.map((catItem, idx) => {
                  const pct = summary.totalExpenses ? Math.round((catItem.total / summary.totalExpenses) * 100) : 0;
                  const catColor = CATEGORY_PIE_COLORS[idx % CATEGORY_PIE_COLORS.length];
                  return (
                    <div key={idx} className="p-4 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 truncate max-w-44">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                          <span className="font-bold text-slate-900 dark:text-white text-xs truncate">{catItem.category}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg">
                          {pct}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="font-display font-black text-lg text-slate-900 dark:text-white">
                          ₹{catItem.total.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500">{catItem.count} items</span>
                      </div>

                      {/* Colored Progress Bar matching Pie Slice Color */}
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: catColor }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-200/50 dark:border-slate-800/60 pt-1 mt-1">
                        <span>Paid: <strong className="text-teal-600 dark:text-teal-400 font-bold">₹{catItem.paid.toLocaleString('en-IN')}</strong></span>
                        <span>Pending: <strong className="text-amber-600 dark:text-amber-500 font-bold">₹{catItem.pending.toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main Expenses Table Section */}
      <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4 h-100 overflow-hidden">
        
        {/* Table Filters Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search expense name, vendor, notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {Object.keys(EXPENSE_CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="">Paid / Unpaid</option>
              <option value="Paid">Paid Only</option>
              <option value="Pending">Pending Only</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-semibold self-end lg:self-auto">
            Showing <strong>{expenses.length}</strong> expense records
          </div>
        </div>

        {/* Expenses List Table with Vertical Scroll */}
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 border border-slate-200/80 dark:border-slate-800 rounded-2xl custom-scrollbar">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-950">
              <tr className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Paid To & Method</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Receipt</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm">No expenses found</p>
                    <p className="text-xs mt-1">Click "+ Add New Expense" to create a new budget entry.</p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {exp.name}
                      </div>
                      {exp.subcategory && (
                        <div className="text-[10px] text-slate-500 font-medium">{exp.subcategory}</div>
                      )}
                      {!selectedEventId && exp.eventId?.title && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 rounded-md text-[9px] font-bold">
                          {exp.eventId.title}
                        </span>
                      )}
                      {exp.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-xs">{exp.notes}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {exp.paidTo || '—'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {exp.paymentMethod || 'UPI'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-display font-black text-slate-900 dark:text-white text-sm">
                      ₹{(exp.amount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {exp.receiptUrl ? (
                        <a
                          href={`${backendUrl}${exp.receiptUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-xl"
                        >
                          <Eye size={12} /> View
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(exp._id, exp.paymentStatus)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black cursor-pointer transition-all border ${
                          exp.paymentStatus === 'Paid'
                            ? 'bg-teal-500/10 text-teal-600 border-teal-500/30 hover:bg-teal-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                        title="Click to toggle Paid/Pending"
                      >
                        {exp.paymentStatus}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(exp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer"
                          title="Edit Expense"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 size={14} />
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

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h3 className="font-display font-black text-slate-900 dark:text-white text-lg sm:text-xl">
                {editingExpense ? 'Edit Expense Record' : 'Add New Event Expense'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              
              {/* Category & Subcategory Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Expense Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    required
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                  >
                    {Object.keys(EXPENSE_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Subcategory</label>
                  <select
                    value={formData.subcategory}
                    onChange={e => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                  >
                    {(EXPENSE_CATEGORIES[formData.category] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expense Name & Amount Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Expense Name / Item *</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall Rental Deposit, Stage Lighting"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 15000"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              </div>

              {/* Date & Paid To Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Expense Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Paid To (Vendor / Staff)</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Decorators Ltd."
                    value={formData.paidTo}
                    onChange={e => setFormData(prev => ({ ...prev, paidTo: e.target.value }))}
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              {/* Payment Method & Payment Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={e => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Receipt Upload Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold">Receipt / Invoice Document</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleReceiptUpload}
                    id="receipt-file-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="receipt-file-input"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Upload size={14} />
                    {uploadingReceipt ? 'Uploading Receipt...' : 'Choose File'}
                  </label>
                  {formData.receiptUrl && (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle2 size={16} /> Receipt Attached
                      <a
                        href={`${backendUrl}${formData.receiptUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline font-semibold text-[11px]"
                      >
                        Preview
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold">Notes / Description</label>
                <textarea
                  rows="2"
                  placeholder="Additional details regarding invoice number, vendor terms, etc."
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end items-center gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {editingExpense ? 'Save Changes' : 'Add Expense Entry'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
