import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  Users,
  CreditCard,
  Camera,
  Award,
  Trophy,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Bell,
  UserCheck,
  RotateCcw,
  Activity,
  BarChart,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { getBackendUrl } from '../utils/url';

export const REPORT_TYPES = [
  { id: 'overview', label: 'Synopsis', icon: BarChart },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'revenue', label: 'Payments & Revenue', icon: CreditCard },
  { id: 'winners', label: 'Results & Winners', icon: Trophy },
  { id: 'expenses', label: 'Expenses', icon: IndianRupee },
  { id: 'profit_loss', label: 'Profit & Loss', icon: TrendingUp },
  { id: 'refunds', label: 'Refunds & Cancellations', icon: RotateCcw }
];

export default function AdminReports({ allEvents = [], selectedEventId = '', setSelectedEventId }) {
  const { apiFetch } = useAuth();
  const backendUrl = getBackendUrl();

  const [activeReport, setActiveReport] = useState('overview');

  // Common Controls State
  const [filterEventId, setFilterEventId] = useState(selectedEventId || '');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [reportData, setReportData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync prop selectedEventId to local filterEventId
  useEffect(() => {
    setFilterEventId(selectedEventId || '');
  }, [selectedEventId]);

  // Fetch data for the active report
  const fetchReportData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterEventId) query.append('eventId', filterEventId);
      if (fromDate) query.append('fromDate', fromDate);
      if (toDate) query.append('toDate', toDate);
      if (searchQuery) query.append('search', searchQuery);

      // Always fetch Financial Summary (Cumulative for All Events or Scoped for Selected Event)
      const summaryRes = await apiFetch(`/api/expenses/summary${filterEventId ? `?eventId=${filterEventId}` : ''}`);
      if (summaryRes.success && summaryRes.summary) {
        setSummaryData(summaryRes.summary);
      }

      if (activeReport === 'participants') {
        const res = await apiFetch(`/api/reports/data/participants?${query.toString()}`);
        if (res.success) setReportData(res.data || []);
      } else if (activeReport === 'revenue') {
        const res = await apiFetch(`/api/reports/data/revenue?${query.toString()}`);
        if (res.success) setReportData(res.data || []);
      } else if (activeReport === 'media') {
        const res = await apiFetch(`/api/reports/data/media?${query.toString()}`);
        if (res.success) setReportData(res.data || []);
      } else if (activeReport === 'expenses') {
        const res = await apiFetch(`/api/expenses?${query.toString()}`);
        if (res.success) setReportData(res.expenses || []);
      } else if (activeReport === 'profit_loss') {
        const res = await apiFetch(`/api/reports/data/profit_loss?${query.toString()}`);
        if (res.success) setReportData(res.data || []);
      } else if (activeReport === 'overview') {
        const res = await apiFetch(`/api/reports/data/participants?${query.toString()}`);
        if (res.success) setReportData(res.data || []);
      } else {
        // Fallback demo/live endpoint handling
        const res = await apiFetch(`/api/reports/data/${activeReport}?${query.toString()}`);
        if (res.success) {
          setReportData(res.data || []);
        }
      }
    } catch (err) {
      console.error(`Error fetching report data for ${activeReport}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeReport, filterEventId, fromDate, toDate, searchQuery]);

  const reportCardRef = useRef(null);

  // Authenticated Export CSV / Excel Handler
  const handleExportCSV = async (fileExtension = 'csv') => {
    try {
      let endpoint = '';
      const evQuery = filterEventId ? `?eventId=${filterEventId}` : '';
      if (activeReport === 'participants') {
        endpoint = `/api/reports/participants${evQuery}`;
      } else if (activeReport === 'revenue' || activeReport === 'profit_loss') {
        endpoint = `/api/reports/revenue${evQuery}`;
      } else if (activeReport === 'media') {
        endpoint = `/api/reports/submissions${evQuery}`;
      } else if (activeReport === 'winners' && filterEventId) {
        endpoint = `/api/reports/winners/${filterEventId}`;
      } else {
        endpoint = `/api/reports/participants${evQuery}`;
      }

      const token = localStorage.getItem('token') || '';
      const fullUrl = `${backendUrl}${endpoint}`;
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export error:', errorText);
        alert('Failed to export report: ' + (errorText || response.statusText));
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const fileName = `${activeReport}-report-${filterEventId || 'all'}.${fileExtension}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export CSV error:', err);
      alert('Error downloading export file: ' + err.message);
    }
  };

  // Export Excel Handler
  const handleExportExcel = () => {
    handleExportCSV('csv');
  };

  // Shared helper function to build exact report pages HTML for PDF Export and Print
  const buildReportPagesHTML = async () => {
    const activeObj = REPORT_TYPES.find(r => r.id === activeReport);
    const reportTitle = `${activeObj?.label || 'System'} Report`;
    const eventObj = allEvents.find(e => String(e._id) === String(filterEventId));
    const eventTitle = eventObj ? eventObj.title : 'All Events Combined';

    // Load Sumbaran Art Society logo as Base64 for synchronous rendering
    const logoBase64 = await new Promise((resolve) => {
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

    const totalRecords = Array.isArray(reportData) ? reportData.length : 0;
    const recordsPerPage = 22;
    const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));

    const generatedDateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const thL = 'padding: 10px 12px; text-align: left; vertical-align: middle; line-height: 1.2;';
    const thC = 'padding: 10px 12px; text-align: center; vertical-align: middle; line-height: 1.2;';
    const thR = 'padding: 10px 12px; text-align: right; vertical-align: middle; line-height: 1.2;';

    const getHeaderHtml = (reportType) => {
      switch (reportType) {
        case 'participants':
          return `<th style="${thL}">#</th><th style="${thL}">Participant Full Name</th><th style="${thL}">Email Address</th><th style="${thL}">City / Location</th><th style="${thC}">Registration Date</th><th style="${thC}">Account Status</th>`;
        case 'revenue':
          return `<th style="${thL}">#</th><th style="${thL}">Transaction ID / Invoice</th><th style="${thL}">Package Name</th><th style="${thL}">Participant / Payer</th><th style="${thR}">Total Paid (₹)</th><th style="${thC}">Payment Status</th>`;
        case 'winners':
          return `<th style="${thL}">#</th><th style="${thL}">Rank & Winner Name</th><th style="${thL}">Contest Event Title</th><th style="${thL}">Prize Reward</th><th style="${thR}">Jury Score</th><th style="${thC}">Status</th>`;
        case 'expenses':
          return `<th style="${thL}">#</th><th style="${thL}">Expense Title</th><th style="${thL}">Category</th><th style="${thL}">Paid To / Vendor</th><th style="${thR}">Amount (₹)</th><th style="${thC}">Payout Status</th>`;
        case 'profit_loss':
          return `<th style="${thL}">#</th><th style="${thL}">Financial Line Item / Description</th><th style="${thL}">Financial Type & Category</th><th style="${thL}">Payer / Vendor / Event Ref</th><th style="${thR}">Net Amount (₹)</th><th style="${thC}">Status</th>`;
        case 'refunds':
          return `<th style="${thL}">#</th><th style="${thL}">Refund Transaction ID</th><th style="${thL}">Participant Name</th><th style="${thL}">Refund Reason / Category</th><th style="${thR}">Refund Amount (₹)</th><th style="${thC}">Refund Status</th>`;
        case 'overview':
        default:
          return `<th style="${thL}">#</th><th style="${thL}">Record Title / Description</th><th style="${thL}">Category / Module</th><th style="${thL}">Reference / Email</th><th style="${thR}">Amount / Score</th><th style="${thC}">Status</th>`;
      }
    };

    const badgeBase = 'display: inline-flex; align-items: center; justify-content: center; text-align: center; line-height: 1; vertical-align: middle; box-sizing: border-box;';

    const getRowHtml = (item, globalIdx, reportType) => {
      const num = globalIdx + 1;
      const bL = 'border-bottom: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; vertical-align: middle; line-height: 1.2;';
      const bC = 'border-bottom: 1px solid #e2e8f0; padding: 8px 12px; text-align: center; vertical-align: middle; line-height: 1.2;';
      const bR = 'border-bottom: 1px solid #e2e8f0; padding: 8px 12px; text-align: right; vertical-align: middle; line-height: 1.2;';

      switch (reportType) {
        case 'participants':
          return `<tr><td style="${bL} font-weight: bold; color: #64748b;">${num}</td><td style="${bL} font-weight: bold; color: #0f172a;">${item.name || 'Participant'}</td><td style="${bL} color: #334155;">${item.email || '—'}</td><td style="${bL} color: #475569;">${item.category || 'Participant'}</td><td style="${bC} color: #475569;">${item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '—'}</td><td style="${bC}"><span style="${badgeBase} background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold;">${item.status || 'Verified'}</span></td></tr>`;
        case 'revenue':
          return `<tr><td style="${bL} font-weight: bold; color: #64748b;">${num}</td><td style="${bL} font-family: monospace; font-weight: bold; color: #4338ca;">${item.transactionId || item._id}</td><td style="${bL} font-weight: bold; color: #0f172a;">${item.category || 'Package Entry'}</td><td style="${bL} color: #334155;">${item.name || item.email}</td><td style="${bR} font-weight: 900; color: #047857;">₹${(Number(item.amount) || 0).toLocaleString('en-IN')}</td><td style="${bC}"><span style="${badgeBase} background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold;">${item.status || 'Success'}</span></td></tr>`;
        case 'winners':
          return `<tr><td style="${bL} font-weight: bold; color: #64748b;">${num}</td><td style="${bL} font-weight: bold; color: #0f172a;">🏆 ${item.name}</td><td style="${bL} color: #334155;">${item.email}</td><td style="${bL} font-weight: bold; color: #b45309;">${item.category || 'Trophy & Prize'}</td><td style="${bR} font-weight: 900; color: #4338ca;">${item.score ? `${item.score}/10` : 'Declared'}</td><td style="${bC}"><span style="${badgeBase} background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold;">${item.status || 'Winner'}</span></td></tr>`;
        case 'expenses':
          return `<tr><td style="${bL} font-weight: bold; color: #64748b;">${num}</td><td style="${bL} font-weight: bold; color: #0f172a;">${item.name || item.title}</td><td style="${bL} color: #334155;">${item.category || 'Expense'}</td><td style="${bL} color: #475569;">${item.email || item.paidTo || 'Vendor Payout'}</td><td style="${bR} font-weight: 900; color: #be123c;">₹${(Number(item.amount) || 0).toLocaleString('en-IN')}</td><td style="${bC}"><span style="${badgeBase} background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold;">${item.paymentStatus || item.status || 'Paid'}</span></td></tr>`;
        case 'profit_loss':
          const isInc = item.amount > 0 || item.status === 'Paid In';
          return `<tr><td style="${bL} font-weight: bold; color: #64748b;">${num}</td><td style="${bL} font-weight: bold; color: #0f172a;">${item.name || 'Line Item Entry'}</td><td style="${bL}"><span style="${badgeBase} background-color: ${isInc ? '#e0e7ff' : '#ffedd5'}; color: ${isInc ? '#3730a3' : '#9a3412'}; border: 1px solid ${isInc ? '#818cf8' : '#fb923c'}; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 900;">${isInc ? '▲ Revenue Income' : '▼ Expense Outflow'}</span></td><td style="${bL} color: #475569;">${item.email || '—'}</td><td style="${bR} font-weight: 900; color: ${isInc ? '#4338ca' : '#b45309'};">${typeof item.amount === 'number' ? `${item.amount >= 0 ? '+₹' : '-₹'}${Math.abs(item.amount).toLocaleString('en-IN')}` : '—'}</td><td style="${bC}"><span style="${badgeBase} background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold;">${item.status || 'Logged'}</span></td></tr>`;
        case 'refunds':
          return `<tr><td style="${bL} font-weight: bold; color: #64748b;">${num}</td><td style="${bL} font-family: monospace; font-weight: bold; color: #4338ca;">${item.transactionId || item._id}</td><td style="${bL} font-weight: bold; color: #0f172a;">${item.name}</td><td style="${bL} color: #334155;">${item.category || 'Registration Refund'}</td><td style="${bR} font-weight: 900; color: #be123c;">₹${(Number(item.amount) || 0).toLocaleString('en-IN')}</td><td style="${bC}"><span style="${badgeBase} background-color: #fff1f2; color: #be123c; border: 1px solid #fca5a5; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold;">${item.status || 'Refunded'}</span></td></tr>`;
        case 'overview':
        default:
          return `<tr><td style="${bL} font-weight: bold; color: #64748b;">${num}</td><td style="${bL} font-weight: bold; color: #0f172a;">${item.name || item.userName || 'Record Entry'}</td><td style="${bL} color: #334155;">${item.category || 'General'}</td><td style="${bL} color: #475569;">${item.email || '—'}</td><td style="${bR} font-weight: 900; color: #0f172a;">${item.amount ? `₹${item.amount.toLocaleString('en-IN')}` : (item.score || '—')}</td><td style="${bC}"><span style="${badgeBase} background-color: #eef2ff; color: #4338ca; border: 1px solid #a5b4fc; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold;">${item.status || 'Logged'}</span></td></tr>`;
      }
    };

    const pagesData = [];

    for (let p = 0; p < totalPages; p++) {
      const startIndex = p * recordsPerPage;
      const pageRows = reportData.slice(startIndex, startIndex + recordsPerPage);

      const pageContentHTML = `
        <div class="print-page" style="width: 1050px; min-height: 1420px; background-color: #ffffff; color: #000000; font-family: system-ui, -apple-system, sans-serif; padding: 36px 40px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; page-break-inside: avoid; margin: 0 auto 20px auto;">
          <div>
            <!-- Top Header (Printed on EVERY page!) -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; background-color: #ffffff; color: #000000;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <img src="${logoBase64}" style="height: 64px; width: auto; object-fit: contain; border-radius: 6px;" alt="Sumbaran Art Society Logo" />
                <div>
                  <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: 0.5px;">SUMBARAN ART SOCIETY</h1>
                  <p style="font-size: 11px; color: #334155; margin: 4px 0 2px 0; font-weight: 600;">
                    Address: 1414/1A, Trio Chambers, Nr. Renuka Swaroop Girls High School, Sadashiv Peth, Pune - 411030.
                  </p>
                  <p style="font-size: 10px; color: #475569; margin: 0; font-weight: 500;">
                    Phone: +91 98765 43210 • Email: support@sumbaranartsociety.com • Website: https://sumbaranartsociety.com
                  </p>
                </div>
              </div>
              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                <span style="${badgeBase} border: 2px solid #0f172a; color: #0f172a; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase;">
                  OFFICIAL AUDIT REPORT
                </span>
                <p style="font-size: 10px; color: #475569; margin: 6px 0 0 0; font-weight: 600;">
                  Generated: ${generatedDateStr}
                </p>
              </div>
            </div>

            <!-- Contest Name & Subtitle Box -->
            <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 18px; margin-bottom: 18px; background-color: #f8fafc; color: #000000; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Name of Contest</span>
                <h2 style="font-size: 17px; font-weight: 900; color: #0f172a; margin: 2px 0 2px 0;">${eventTitle}</h2>
                <p style="font-size: 11px; color: #4338ca; margin: 0; font-weight: 800;">
                  ${reportTitle} ${p > 0 ? `(Page ${p + 1} Continuation)` : ''} ${fromDate ? `• From: ${fromDate}` : ''} ${toDate ? `• To: ${toDate}` : ''} ${searchQuery ? `• Search: "${searchQuery}"` : ''}
                </p>
              </div>
              <div style="text-align: right;">
                <span style="${badgeBase} border: 1px solid #4338ca; color: #4338ca; background-color: #eef2ff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800;">
                  ${totalRecords} records found
                </span>
              </div>
            </div>

            <!-- Executive Financial Summary Cards (Rendered on Page 1) -->
            ${p === 0 && summaryData ? `
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="padding: 12px; background-color: #ecfdf5; border: 2px solid #6ee7b7; border-radius: 12px; text-align: left;">
                  <span style="font-size: 9px; font-weight: 800; color: #065f46; text-transform: uppercase;">TOTAL REVENUE</span>
                  <p style="font-size: 20px; font-weight: 900; color: #047857; margin: 4px 0 0 0;">₹${(summaryData.totalRevenue || 0).toLocaleString('en-IN')}</p>
                  <span style="font-size: 9px; color: #047857; font-weight: 500;">Successful payments volume</span>
                </div>
                <div style="padding: 12px; background-color: #fff1f2; border: 2px solid #fca5a5; border-radius: 12px; text-align: left;">
                  <span style="font-size: 9px; font-weight: 800; color: #9f1239; text-transform: uppercase;">TOTAL EXPENSES</span>
                  <p style="font-size: 20px; font-weight: 900; color: #be123c; margin: 4px 0 0 0;">₹${(summaryData.totalExpenses || 0).toLocaleString('en-IN')}</p>
                  <span style="font-size: 9px; color: #be123c; font-weight: 500;">Operational line items</span>
                </div>
                <div style="padding: 12px; background-color: ${(summaryData.netProfitLoss || 0) >= 0 ? '#eef2ff' : '#fef2f2'}; border: 2px solid ${(summaryData.netProfitLoss || 0) >= 0 ? '#a5b4fc' : '#fca5a5'}; border-radius: 12px; text-align: left;">
                  <span style="font-size: 9px; font-weight: 800; color: #3730a3; text-transform: uppercase;">NET PROFIT / LOSS</span>
                  <p style="font-size: 20px; font-weight: 900; color: ${(summaryData.netProfitLoss || 0) >= 0 ? '#4338ca' : '#dc2626'}; margin: 4px 0 0 0;">₹${(summaryData.netProfitLoss || 0).toLocaleString('en-IN')}</p>
                  <span style="font-size: 9px; color: #475569; font-weight: 500;">${(summaryData.netProfitLoss || 0) >= 0 ? 'Surplus balance' : 'Deficit shortfall'}</span>
                </div>
                <div style="padding: 12px; background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; text-align: left;">
                  <span style="font-size: 9px; font-weight: 800; color: #166534; text-transform: uppercase;">PAID / SETTLED</span>
                  <p style="font-size: 20px; font-weight: 900; color: #15803d; margin: 4px 0 0 0;">₹${(summaryData.paidExpenses || 0).toLocaleString('en-IN')}</p>
                  <span style="font-size: 9px; color: #15803d; font-weight: 500;">Cleared vendor payouts</span>
                </div>
              </div>
            ` : ''}

            <!-- Table Batch for Page p -->
            <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 12px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
                <thead>
                  <tr style="background-color: #f1f5f9; color: #0f172a; font-weight: bold; border-bottom: 2px solid #64748b;">
                    ${getHeaderHtml(activeReport)}
                  </tr>
                </thead>
                <tbody>
                  ${pageRows.length === 0 ? `
                    <tr>
                      <td colSpan="6" style="padding: 32px; text-align: center; vertical-align: middle; color: #94a3b8; font-weight: bold;">
                        No matching report records logged for this query filter.
                      </td>
                    </tr>
                  ` : pageRows.map((item, idx) => getRowHtml(item, startIndex + idx, activeReport)).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer (Printed on EVERY page!) -->
          <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; color: #64748b; font-size: 10px; font-weight: 600;">
            <div style="vertical-align: middle; line-height: 1;">DSLR Photography Contest & Event Portal — Sumbaran Art Society Confidential Report</div>
            <div style="${badgeBase} background-color: #0f172a; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-weight: 800;">
              Page ${p + 1} of ${totalPages}
            </div>
          </div>
        </div>
      `;

      pagesData.push(pageContentHTML);
    }

    const fileName = `${activeReport}-report-${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;
    return { totalPages, pagesData, fileName };
  };

  // PDF Export Handler with Multi-Page Batching, Header on Every Page, Page X of Y Footer, Top Margins & Zero Record Repetition
  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const { totalPages, pagesData, fileName } = await buildReportPagesHTML();
      const doc = new jsPDF('p', 'mm', 'a4'); // portrait

      for (let p = 0; p < totalPages; p++) {
        const pageContainer = document.createElement('div');
        pageContainer.style.position = 'absolute';
        pageContainer.style.top = '-9999px';
        pageContainer.style.left = '-9999px';
        pageContainer.innerHTML = pagesData[p];
        document.body.appendChild(pageContainer);

        const canvas = await html2canvas(pageContainer.firstElementChild, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(pageContainer);

        if (p > 0) doc.addPage();
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }

      doc.save(fileName);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      alert(`Error generating PDF report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Print Handler: Opens structured multi-page report in a new browser window and triggers print dialog
  const handlePrint = async () => {
    setLoading(true);
    try {
      const { pagesData } = await buildReportPagesHTML();
      
      const printWin = window.open('', '_blank', 'width=1100,height=850');
      if (!printWin) {
        alert('Please allow popup windows to print the report in a new window.');
        return;
      }

      printWin.document.open();
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sumbaran Art Society Official Audit Report</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 24px;
                background-color: #f1f5f9;
                font-family: system-ui, -apple-system, sans-serif;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-page {
                box-sizing: border-box;
                page-break-after: always;
                page-break-inside: avoid;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
              }
              @media print {
                body {
                  padding: 0;
                  background-color: #ffffff;
                }
                .print-page {
                  box-shadow: none;
                  margin: 0 auto !important;
                }
              }
            </style>
          </head>
          <body>
            ${pagesData.join('')}
          </body>
        </html>
      `);
      printWin.document.close();

      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 500);
    } catch (err) {
      console.error('Error opening print window:', err);
      alert(`Error opening print window: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render customized headers per report type
  const renderTableHeaders = () => {
    switch (activeReport) {
      case 'participants':
        return (
          <>
            <th className="py-3 px-4">#</th>
            <th className="py-3 px-4">Participant Full Name</th>
            <th className="py-3 px-4">Email Address</th>
            <th className="py-3 px-4">City / Location</th>
            <th className="py-3 px-4 text-center">Registration Date</th>
            <th className="py-3 px-4 text-center">Account Status</th>
          </>
        );
      case 'revenue':
        return (
          <>
            <th className="py-3 px-4">#</th>
            <th className="py-3 px-4">Transaction ID / Invoice</th>
            <th className="py-3 px-4">Package Name</th>
            <th className="py-3 px-4">Participant / Payer</th>
            <th className="py-3 px-4 text-right">Total Paid (₹)</th>
            <th className="py-3 px-4 text-center">Payment Status</th>
          </>
        );
      case 'winners':
        return (
          <>
            <th className="py-3 px-4">#</th>
            <th className="py-3 px-4">Rank & Winner Name</th>
            <th className="py-3 px-4">Contest Event Title</th>
            <th className="py-3 px-4">Prize Reward</th>
            <th className="py-3 px-4 text-right">Jury Score</th>
            <th className="py-3 px-4 text-center">Status</th>
          </>
        );
      case 'expenses':
        return (
          <>
            <th className="py-3 px-4">#</th>
            <th className="py-3 px-4">Expense Title</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Paid To / Vendor</th>
            <th className="py-3 px-4 text-right">Amount (₹)</th>
            <th className="py-3 px-4 text-center">Payout Status</th>
          </>
        );
      case 'profit_loss':
        return (
          <>
            <th className="py-3 px-4">#</th>
            <th className="py-3 px-4">Financial Line Item / Description</th>
            <th className="py-3 px-4">Financial Type & Category</th>
            <th className="py-3 px-4">Payer / Vendor / Event Ref</th>
            <th className="py-3 px-4 text-right">Net Amount (₹)</th>
            <th className="py-3 px-4 text-center">Status</th>
          </>
        );
      case 'refunds':
        return (
          <>
            <th className="py-3 px-4">#</th>
            <th className="py-3 px-4">Refund Transaction ID</th>
            <th className="py-3 px-4">Participant Name</th>
            <th className="py-3 px-4">Refund Reason / Category</th>
            <th className="py-3 px-4 text-right">Refund Amount (₹)</th>
            <th className="py-3 px-4 text-center">Refund Status</th>
          </>
        );
      case 'overview':
      default:
        return (
          <>
            <th className="py-3 px-4">#</th>
            <th className="py-3 px-4">Record Title / Description</th>
            <th className="py-3 px-4">Category / Module</th>
            <th className="py-3 px-4">Reference / Email</th>
            <th className="py-3 px-4 text-right">Amount / Score</th>
            <th className="py-3 px-4 text-center">Status</th>
          </>
        );
    }
  };

  // Helper to render customized row cells per report type
  const renderTableRow = (item, idx) => {
    switch (activeReport) {
      case 'participants':
        return (
          <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
            <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.name || 'Participant'}</td>
            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">{item.email}</td>
            <td className="py-3 px-4 text-slate-500 font-medium">{item.category || 'City N/A'}</td>
            <td className="py-3 px-4 text-center text-slate-500 font-medium">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '—'}
            </td>
            <td className="py-3 px-4 text-center">
              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${
                item.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200' :
                item.status === 'Suspended' ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200' :
                'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200'
              }`}>
                {item.status || 'Pending'}
              </span>
            </td>
          </tr>
        );
      case 'revenue':
        return (
          <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
            <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
            <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.transactionId || item.email || item._id}</td>
            <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-bold">{item.category || 'Package Entry'}</td>
            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{item.name}</td>
            <td className="py-3 px-4 text-right font-display font-black text-sm text-emerald-600 dark:text-emerald-400">
              ₹{(Number(item.amount) || 0).toLocaleString('en-IN')}
            </td>
            <td className="py-3 px-4 text-center">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 rounded-xl text-[10px] font-extrabold">
                {item.status || 'Success'}
              </span>
            </td>
          </tr>
        );
      case 'winners':
        return (
          <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
            <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500 shrink-0" />
              {item.name}
            </td>
            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">{item.email}</td>
            <td className="py-3 px-4 text-amber-700 dark:text-amber-400 font-bold">{item.category || 'Trophy & Certificate'}</td>
            <td className="py-3 px-4 text-right font-display font-black text-sm text-indigo-600 dark:text-indigo-400">
              {item.score ? `${item.score}/10` : 'Declared'}
            </td>
            <td className="py-3 px-4 text-center">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 rounded-xl text-[10px] font-extrabold">
                {item.status || 'Winner'}
              </span>
            </td>
          </tr>
        );
      case 'expenses':
        return (
          <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
            <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.name || item.title}</td>
            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">{item.category}</td>
            <td className="py-3 px-4 text-slate-500 font-medium">{item.email || item.paidTo || 'Vendor Payout'}</td>
            <td className="py-3 px-4 text-right font-display font-black text-sm text-rose-600 dark:text-rose-400">
              ₹{(Number(item.amount) || 0).toLocaleString('en-IN')}
            </td>
            <td className="py-3 px-4 text-center">
              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${
                item.paymentStatus === 'Paid' || item.status === 'Paid' || item.status === 'Paid Out'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200'
              }`}>
                {item.paymentStatus || item.status || 'Logged'}
              </span>
            </td>
          </tr>
        );
      case 'profit_loss':
        const isIncome = item.amount > 0 || item.status === 'Paid In';
        return (
          <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
            <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.name || 'Line Item Entry'}</td>
            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">
              <span className={`income-badge inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                isIncome
                  ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700'
                  : 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-700'
              }`}>
                {isIncome ? '▲ Revenue Income' : '▼ Expense Outflow'}
              </span>
            </td>
            <td className="py-3 px-4 text-slate-500 font-medium">{item.email || '—'}</td>
            <td className={`py-3 px-4 text-right font-display font-black text-sm ${isIncome ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {typeof item.amount === 'number' ? `${item.amount >= 0 ? '+₹' : '-₹'}${Math.abs(item.amount).toLocaleString('en-IN')}` : '—'}
            </td>
            <td className="py-3 px-4 text-center">
              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${
                item.status === 'Paid In' || item.status === 'Paid Out' || item.status === 'Success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200'
              }`}>
                {item.status || 'Logged'}
              </span>
            </td>
          </tr>
        );
      case 'refunds':
        return (
          <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
            <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
            <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{item.transactionId || item._id}</td>
            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{item.category || 'Participant Refund'}</td>
            <td className="py-3 px-4 text-right font-display font-black text-sm text-rose-600 dark:text-rose-400">
              ₹{(Number(item.amount) || 0).toLocaleString('en-IN')}
            </td>
            <td className="py-3 px-4 text-center">
              <span className="px-2.5 py-1 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 rounded-xl text-[10px] font-extrabold">
                {item.status || 'Refunded'}
              </span>
            </td>
          </tr>
        );
      case 'overview':
      default:
        return (
          <tr key={item._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
            <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.name || item.userName || 'Record Entry'}</td>
            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">{item.category || 'General'}</td>
            <td className="py-3 px-4 text-slate-500 font-medium">{item.email || '—'}</td>
            <td className="py-3 px-4 text-right font-display font-black text-slate-900 dark:text-white">
              {item.amount ? `₹${item.amount.toLocaleString('en-IN')}` : (item.score || '—')}
            </td>
            <td className="py-3 px-4 text-center">
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded-xl text-[10px] font-bold">
                {item.status || 'Logged'}
              </span>
            </td>
          </tr>
        );
    }
  };

  const activeReportObj = REPORT_TYPES.find(r => r.id === activeReport);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 text-left">
      
      {/* Top Header Banner with Dynamic Photography & Report Overlay Background */}
      <div className="relative overflow-hidden bg-slate-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-indigo-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Background Image Layer */}
        <img
          src="/hero-bg.jpg"
          alt="Reports & Analytics Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 pointer-events-none transition-transform duration-700"
        />
        
        {/* Dark Gradient Overlay for optimal text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-indigo-950/80 pointer-events-none" />
        
        {/* Ambient Glow accents */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-emerald-600/15 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
            Reports & Analytics Hub
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl mt-1 text-white drop-shadow-xs">
            {activeReportObj?.label} Report
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-medium max-w-xl">
            Comprehensive audit reports, financial ledgers, participant stats, winners, and system export logs.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
            title="Export Excel"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
            title="Export CSV"
          >
            <Download size={14} /> CSV
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
            title="Export PDF"
          >
            <FileText size={14} /> PDF
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
            title="Print Report"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Common Controls Toolbar on Every Report (Prominent Yellow Card) */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/80 rounded-3xl p-3.5 sm:p-4 shadow-sm print:hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3 w-full">
          
          {/* 1. Search Input - FULL WIDTH AT TOP ON MOBILE */}
          <div className="relative w-full lg:flex-1 lg:min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400" />
            <input
              type="text"
              placeholder="Search keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-bold shadow-xs placeholder-slate-400"
            />
          </div>

          {/* 2 & 3. Date Pickers (From Date, To Date) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0 w-full lg:w-auto">
            {/* From Date Picker */}
            <div className="flex items-center gap-1 min-w-0 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 px-2 sm:px-3 py-1.5 rounded-2xl shadow-xs">
              <span className="text-[10px] sm:text-xs font-black text-amber-950 dark:text-amber-300 shrink-0">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full bg-transparent text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer min-w-0"
              />
            </div>

            {/* To Date Picker */}
            <div className="flex items-center gap-1 min-w-0 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 px-2 sm:px-3 py-1.5 rounded-2xl shadow-xs">
              <span className="text-[10px] sm:text-xs font-black text-amber-950 dark:text-amber-300 shrink-0">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full bg-transparent text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer min-w-0"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Sub-Reports Navigation Tabs: Mobile Dropdown View (< sm) vs Desktop Buttons (>= sm) */}
      <div className="w-full print:hidden">
        {/* Mobile Dropdown Menu (< sm) */}
        <div className="block sm:hidden w-full">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">
            Select Report Tab:
          </label>
          <div className="relative w-full">
            <select
              value={activeReport}
              onChange={e => setActiveReport(e.target.value)}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border-2 border-indigo-500/50 dark:border-indigo-700 rounded-2xl text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer shadow-xs focus:ring-2 focus:ring-indigo-500 appearance-none pr-9"
            >
              {REPORT_TYPES.map(rpt => (
                <option key={rpt.id} value={rpt.id}>
                  {rpt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600 dark:text-indigo-400 font-black text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Desktop Horizontal Tabs (>= sm) */}
        <div className="hidden sm:block w-full overflow-x-auto">
          <div className="flex bg-white/90 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs min-w-max overflow-x-auto gap-1">
            {REPORT_TYPES.map(rpt => (
              <button
                key={rpt.id}
                onClick={() => setActiveReport(rpt.id)}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-display text-xs font-bold transition-all cursor-pointer ${
                  activeReport === rpt.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <rpt.icon size={14} />
                {rpt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Report Render Content Card (700px height on mobile, 500px on desktop) */}
      <div ref={reportCardRef} className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm h-[700px] sm:h-[500px] overflow-y-auto flex flex-col gap-4">
        
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Loading {activeReportObj?.label} report data...
          </div>
        ) : (
          <>
            {/* Report Header Info */}
            <div id="report-card-header" className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                {/* Selected Event Name displayed over Report Title in Blue color */}
                <div className="text-blue-600 dark:text-blue-400 font-extrabold text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5 mb-0.5">
                  <span>Event:</span>
                  <span>{allEvents.find(e => e._id === filterEventId)?.title || 'All Events Combined'}</span>
                </div>

                <h3 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-lg">
                  {activeReportObj?.label} Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {filterEventId ? `Scoped to selected event` : `Across all events combined`}
                </p>
              </div>

              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-extrabold">
                {Array.isArray(reportData) ? `${reportData.length} records found` : 'Executive Statement'}
              </span>
            </div>

            {/* Executive Financial Summary Cards (Rendered for ALL Report Tabs) */}
            {summaryData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-2">
                {/* Total Revenue Card */}
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col gap-1 text-left">
                  <span className="text-[10px] text-emerald-900 dark:text-emerald-300 font-extrabold uppercase tracking-wider">
                    Total Revenue {filterEventId ? '(Selected Event)' : '(Cumulative)'}
                  </span>
                  <p className="font-display font-black text-2xl text-emerald-600 dark:text-emerald-400">
                    ₹{(summaryData.totalRevenue || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-medium">Successful payments volume</span>
                </div>

                {/* Total Expenses Card */}
                <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-700 rounded-2xl flex flex-col gap-1 text-left">
                  <span className="text-[10px] text-rose-900 dark:text-rose-300 font-extrabold uppercase tracking-wider">
                    Total Expenses {filterEventId ? '(Selected Event)' : '(Cumulative)'}
                  </span>
                  <p className="font-display font-black text-2xl text-rose-600 dark:text-rose-400">
                    ₹{(summaryData.totalExpenses || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-medium">Operational line items</span>
                </div>

                {/* Net Profit / Loss Card */}
                <div className={`p-4 border-2 rounded-2xl flex flex-col gap-1 text-left ${
                  (summaryData.netProfitLoss || 0) >= 0
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700'
                    : 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-700'
                }`}>
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider">
                    Net Profit / Loss {filterEventId ? '(Selected Event)' : '(Cumulative)'}
                  </span>
                  <p className={`font-display font-black text-2xl ${
                    (summaryData.netProfitLoss || 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    ₹{(summaryData.netProfitLoss || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {(summaryData.netProfitLoss || 0) >= 0 ? 'Surplus balance' : 'Deficit shortfall'}
                  </span>
                </div>

                {/* Paid / Settled Expenses Card */}
                <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 border-2 border-teal-300 dark:border-teal-700 rounded-2xl flex flex-col gap-1 text-left">
                  <span className="text-[10px] text-teal-900 dark:text-teal-300 font-extrabold uppercase tracking-wider">
                    Paid / Settled {filterEventId ? '(Selected Event)' : '(Cumulative)'}
                  </span>
                  <p className="font-display font-black text-2xl text-teal-600 dark:text-teal-400">
                    ₹{(summaryData.paidExpenses || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-teal-600/70 dark:text-teal-400/70 font-medium">Cleared vendor payouts</span>
                </div>
              </div>
            )}

            {/* Dynamic Data Table with Custom Headings for All Reports */}
            <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                    {renderTableHeaders()}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {!Array.isArray(reportData) || reportData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <AlertCircle size={28} className="mx-auto mb-2 opacity-50" />
                        <p className="font-bold text-xs">No matching report records logged for this query filter.</p>
                      </td>
                    </tr>
                  ) : (
                    reportData.map((item, idx) => renderTableRow(item, idx))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
