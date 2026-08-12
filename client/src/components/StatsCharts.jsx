import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const EVENT_COLORS = [
  '#4f46e5', // Indigo
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#0ea5e9', // Sky
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#3b82f6'  // Blue
];

export default function StatsCharts({ dailyStats = [], categoryStats = [], eventStats = [], eventsList = [] }) {
  const [chartMode, setChartMode] = useState('cumulative'); // 'cumulative', 'separate', 'event_comparison'

  const events = eventsList.length > 0
    ? eventsList
    : (eventStats.length > 0 ? eventStats.map(e => ({ id: e.eventId, title: e.title })) : []);

  // Custom tooltips for nice styling
  const CustomComposedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs max-w-xs text-left">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">{label}</p>
          <div className="flex flex-col gap-1">
            <p className="text-indigo-600 dark:text-indigo-400 font-extrabold flex justify-between">
              <span>Cumulative Revenue:</span>
              <span>₹{(dataItem.revenue || 0).toLocaleString()}</span>
            </p>
            <p className="text-amber-500 dark:text-amber-400 font-bold flex justify-between">
              <span>Registrations:</span>
              <span>{dataItem.registrations || 0}</span>
            </p>
            {events.length > 0 && (
              <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-0.5 text-[10px]">
                <span className="font-semibold text-slate-400 uppercase">Per-Event Breakdown:</span>
                {events.map((ev, i) => {
                  const evRev = dataItem[ev.title] || 0;
                  return (
                    <div key={i} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="truncate max-w-36">{ev.title}:</span>
                      <span className="font-bold">₹{evRev.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomEventComparisonTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs text-left">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-extrabold">
            Total Revenue: ₹{(payload[0]?.value || 0).toLocaleString()}
          </p>
          {payload[1] && (
            <p className="text-indigo-500 font-bold">
              Submissions: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Registrations & Revenue Line/Bar Chart - Full Width */}
      <div className="w-full bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xs">
        
        {/* Card Header & Segmented Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-left">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
              Registration & Revenue Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {chartMode === 'cumulative' && 'Cumulative total revenue volume & participant signups across all events over the last 7 days'}
              {chartMode === 'separate' && 'Separate event-wise daily revenue breakdown & cumulative participant registrations'}
              {chartMode === 'event_comparison' && 'Total revenue & submissions comparison across individual assigned contests'}
            </p>
          </div>

          {/* Toggle Control */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0 self-start sm:self-auto text-xs font-bold gap-1">
            <button
              onClick={() => setChartMode('cumulative')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartMode === 'cumulative'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Cumulative Total
            </button>
            <button
              onClick={() => setChartMode('separate')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartMode === 'separate'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Per-Event Breakdown
            </button>
            {eventStats.length > 0 && (
              <button
                onClick={() => setChartMode('event_comparison')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  chartMode === 'event_comparison'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Event Ledger Comparison
              </button>
            )}
          </div>
        </div>

        {/* Chart Render Area */}
        <div className="w-full h-80">
          {chartMode === 'cumulative' && dailyStats.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dailyStats}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/50" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomComposedTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Bar 
                  yAxisId="left" 
                  name="Cumulative Revenue (INR)" 
                  dataKey="revenue" 
                  fill="#4f46e5" 
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  name="Registrations" 
                  dataKey="registrations" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {chartMode === 'separate' && dailyStats.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dailyStats}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/50" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomComposedTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                {events.map((ev, idx) => (
                  <Bar
                    key={ev.id || idx}
                    yAxisId="left"
                    name={`${ev.title}`}
                    dataKey={ev.title}
                    stackId="a"
                    fill={EVENT_COLORS[idx % EVENT_COLORS.length]}
                    radius={idx === events.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  name="Registrations" 
                  dataKey="registrations" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {chartMode === 'event_comparison' && eventStats.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={eventStats}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/50" />
                <XAxis 
                  dataKey="title" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomEventComparisonTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Bar 
                  yAxisId="left" 
                  name="Event Total Revenue (INR)" 
                  dataKey="revenue" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  barSize={36}
                />
                <Bar 
                  yAxisId="right" 
                  name="Submissions Count" 
                  dataKey="submissions" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
