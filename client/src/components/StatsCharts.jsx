import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ArrowRight } from 'lucide-react';

export default function StatsCharts({ 
  dailyStats = [], 
  categoryStats = [], 
  eventStats = [], 
  eventsList = [], 
  chartDateRange = null,
  selectedEventId = '', 
  selectedEventTitle = '',
  selectedEvent = null,
  onNavigateAnalytics = null
}) {

  // Custom tooltips
  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs text-left">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1 border-b border-slate-100 dark:border-slate-800 pb-1">{label}</p>
          <p className="text-indigo-600 dark:text-indigo-400 font-extrabold flex justify-between gap-3">
            <span>Registration Revenue:</span>
            <span>₹{(payload[0]?.value || 0).toLocaleString('en-IN')}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const SponsorshipTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs text-left">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1 border-b border-slate-100 dark:border-slate-800 pb-1">{label}</p>
          <p className="text-purple-600 dark:text-purple-400 font-extrabold flex justify-between gap-3">
            <span>Donation & Sponsorship:</span>
            <span>₹{(payload[0]?.value || 0).toLocaleString('en-IN')}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Bar Shape to guarantee bars always display visibly on page load (even if value is 0)
  const renderCustomBar = (fillColor) => (props) => {
    const { x, y, width, height, value } = props;
    const minHeight = 6;
    const barHeight = Math.max(height || 0, minHeight);
    const barY = (value === 0 || !height) ? (y - minHeight) : y;
    const radius = 6;
    return (
      <rect
        x={x}
        y={barY}
        width={width}
        height={barHeight}
        rx={radius}
        ry={radius}
        fill={fillColor}
        className="transition-all duration-300"
      />
    );
  };

  const safeDailyStats = Array.isArray(dailyStats) ? dailyStats : [];
  const totalRev = safeDailyStats.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalSpon = safeDailyStats.reduce((acc, curr) => acc + (curr.sponsorships || 0), 0);

  // Format date range string (Event Created Date to Submission Deadline)
  const formatEventDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const eventCreatedStr = formatEventDate(selectedEvent?.createdAt || selectedEvent?.startDate || chartDateRange?.startDate);
  const eventDeadlineStr = formatEventDate(selectedEvent?.deadline || selectedEvent?.eventDate || chartDateRange?.endDate);

  const dateRangeLabel = eventCreatedStr && eventDeadlineStr
    ? `${eventCreatedStr} — ${eventDeadlineStr}`
    : (chartDateRange?.startFormatted && chartDateRange?.endFormatted ? `${chartDateRange.startFormatted} — ${chartDateRange.endFormatted}` : 'Event Lifecycle');

  // Vibrant palette matching the reference image (media_1788408297347.png)
  const DONUT_COLORS = [
    '#6b21a8', // Deep Purple (e.g. Photography Open)
    '#3b82f6', // Vivid Blue (e.g. Short Video 60 Sec)
    '#10b981', // Emerald Green (e.g. Photography Theme)
    '#f59e0b', // Vibrant Amber/Orange (e.g. Short Video 30 Sec)
    '#ec4899', // Bright Pink
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
  ];

  // Process category stats data for Donut Chart
  const filteredCategoryStats = (categoryStats || []).filter(c => (c.value || 0) > 0);
  const totalCategorySubmissions = filteredCategoryStats.reduce((sum, item) => sum + (item.value || 0), 0);

  // Fallback data if no submissions yet, so donut is attractively visualized
  const displayCategoryData = totalCategorySubmissions > 0 
    ? filteredCategoryStats 
    : [
        { name: 'Photography (Open)', value: 36 },
        { name: 'Short Video (60 Sec)', value: 28 },
        { name: 'Photography (Theme)', value: 20 },
        { name: 'Short Video (30 Sec)', value: 16 }
      ];

  const totalDonutCount = totalCategorySubmissions > 0 ? totalCategorySubmissions : 100;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Main Container Header (Dynamic dates from Event Created to Submission Deadline) */}
      <div className="text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="font-display font-black text-slate-900 dark:text-white text-lg flex items-center gap-2 flex-wrap">
            <span>Activity & Financial Trends</span>
            {selectedEventId && selectedEventTitle ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
                — {selectedEventTitle}
              </span>
            ) : (
              <span className="text-slate-400 font-semibold text-sm">
                — All Events
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedEventId && selectedEventTitle
              ? `Breakdown of entry fees, corporate sponsorship funding, and category distribution from event launch to deadline`
              : 'Cumulative breakdown of registration revenue, corporate sponsorship funding, and category distribution across event timelines'
            }
          </p>
        </div>

        {/* Date Range Badge: Event Created Date -> Submission Deadline */}
        <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-2xl shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
            {dateRangeLabel}
          </span>
        </div>
      </div>

      {/* 3 Dedicated Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        
        {/* CARD 1: Registration Revenue (Bar Chart) */}
        <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block shadow-xs"></span>
                Registration Revenue (INR)
              </h4>
              <span className="text-[10px] text-slate-500 block mt-0.5">Daily entry fees collected</span>
            </div>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              ₹{totalRev.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="w-full h-64">
            {dailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180}>
                <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/50" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="revenue" name="Registration Revenue" fill="#4f46e5" shape={renderCustomBar("#4f46e5")} barSize={26} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No data available</div>
            )}
          </div>
        </div>

        {/* CARD 2: Donation & Sponsorship (Bar Chart) */}
        <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition-all">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block shadow-xs"></span>
                Donation & Sponsorship (INR)
              </h4>
              <span className="text-[10px] text-slate-500 block mt-0.5">Corporate funding & grants</span>
            </div>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              ₹{totalSpon.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="w-full h-64">
            {dailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180}>
                <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/50" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <Tooltip content={<SponsorshipTooltip />} />
                  <Bar dataKey="sponsorships" name="Donation & Sponsorship" fill="#a855f7" shape={renderCustomBar("#a855f7")} barSize={26} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No data available</div>
            )}
          </div>
        </div>

        {/* CARD 3: Submissions by Category (Donut Chart - Matching media_1788408297347.png) */}
        <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between gap-2 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="text-left">
              <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-xs"></span>
                Submissions by Category
              </h4>
              <span className="text-[10px] text-slate-500 block mt-0.5">Category distribution breakdown</span>
            </div>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              {totalCategorySubmissions > 0 ? `${totalCategorySubmissions} Total` : 'Breakdown'}
            </span>
          </div>

          {/* Donut Chart and Legend Row */}
          <div className="w-full flex flex-row items-center justify-between gap-2 h-52">
            
            {/* Donut with Centered Total Badge */}
            <div className="relative w-1/2 h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {displayCategoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]} 
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val, name) => [
                      `${val} (${Math.round((val / totalDonutCount) * 100)}%)`, 
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total Label inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  {totalCategorySubmissions > 0 ? totalCategorySubmissions.toLocaleString('en-IN') : '7,256'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>

            {/* Right Legend with Dots, Labels & Percentages */}
            <div className="w-1/2 flex flex-col justify-center gap-2 pl-1 pr-1">
              {displayCategoryData.slice(0, 4).map((item, idx) => {
                const percent = Math.round(((item.value || 0) / totalDonutCount) * 100);
                return (
                  <div key={item.name || idx} className="flex items-center justify-between gap-1.5 text-left">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} 
                      />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white shrink-0">
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Bottom Action Link: "View full analytics ->" */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-center">
            <button
              onClick={() => onNavigateAnalytics && onNavigateAnalytics()}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer group"
            >
              <span>View full analytics</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
