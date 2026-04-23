'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Activity, Zap, Clock, Layers, CheckCircle } from 'lucide-react';
import type { Metrics, Thread } from '@/types';

interface MetricsDashboardProps {
  metrics: Metrics;
  metricsHistory: Metrics[];
  threads: Thread[];
}

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
}

function StatCard({ label, value, unit, icon, color, subtext }: StatCardProps) {
  return (
    <div className={`bg-white border border-border rounded-lg p-4 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono text-fg-subtle uppercase tracking-widest">{label}</span>
        <span className="text-fg-subtle">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-mono font-bold text-fg tabular-nums">{value}</span>
        {unit && <span className="text-xs font-mono text-fg-muted">{unit}</span>}
      </div>
      {subtext && <p className="text-[10px] font-mono text-fg-subtle mt-1">{subtext}</p>}
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string | number;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-md shadow-md px-3 py-2 text-xs font-mono">
      <p className="text-fg-subtle mb-1">tick {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function MetricsDashboard({
  metrics,
  metricsHistory,
  threads,
}: MetricsDashboardProps) {
  // Per-thread bar data
  const threadBarData = threads.map((t) => ({
    name: `T-${t.id}`,
    tasks: t.tasksCompleted,
    avg: t.tasksCompleted > 0 ? Math.round(t.totalLatency / t.tasksCompleted) : 0,
  }));

  const chartData = metricsHistory.map((m, i) => ({
    tick: m.timestamp,
    cpu: m.cpuUsage,
    active: m.activeThreads,
    queue: m.queueDepth,
    executed: m.tasksExecuted,
    idx: i,
  }));

  return (
    <div className="space-y-4">
      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Tasks Executed"
          value={metrics.tasksExecuted}
          icon={<CheckCircle size={14} />}
          color="border-l-2 border-l-success-emphasis"
          subtext="total completed"
        />
        <StatCard
          label="Avg Latency"
          value={metrics.avgLatency.toFixed(1)}
          unit="ticks"
          icon={<Clock size={14} />}
          color="border-l-2 border-l-accent-emphasis"
          subtext="per task"
        />
        <StatCard
          label="Active Threads"
          value={metrics.activeThreads}
          unit={`/ ${threads.length}`}
          icon={<Zap size={14} />}
          color="border-l-2 border-l-attention-emphasis"
          subtext="running now"
        />
        <StatCard
          label="Queue Depth"
          value={metrics.queueDepth}
          unit="tasks"
          icon={<Layers size={14} />}
          color="border-l-2 border-l-done-fg"
          subtext="waiting"
        />
        <StatCard
          label="CPU Usage"
          value={metrics.cpuUsage.toFixed(1)}
          unit="%"
          icon={<Activity size={14} />}
          color={`border-l-2 ${metrics.cpuUsage > 80 ? 'border-l-danger-emphasis' : 'border-l-success-emphasis'}`}
          subtext="simulated"
        />
      </div>

      {/* ── CPU + Active Threads Chart ──────────────────────────── */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-canvas text-xs font-mono text-fg-muted">
          <Activity size={13} className="text-fg-subtle" />
          <span>metrics.cpu_and_threads</span>
          <div className="ml-auto flex gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-blue-500 inline-block rounded" />
              <span className="text-[10px] text-fg-subtle">CPU %</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-green-500 inline-block rounded" />
              <span className="text-[10px] text-fg-subtle">Active threads</span>
            </span>
          </div>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0969da" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0969da" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a7f37" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a7f37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eaeef2" />
              <XAxis dataKey="tick" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#0969da" strokeWidth={1.5} fill="url(#cpuGrad)" dot={false} isAnimationActive={true} />
              <Area type="monotone" dataKey="active" name="Active threads" stroke="#1a7f37" strokeWidth={1.5} fill="url(#activeGrad)" dot={false} isAnimationActive={true} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Queue Depth + Per-Thread Tasks ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Queue depth over time */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-canvas text-xs font-mono text-fg-muted">
            <Layers size={13} className="text-fg-subtle" />
            <span>metrics.queue_depth</span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeef2" />
                <XAxis dataKey="tick" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="queue" name="Queue depth" stroke="#8250df" strokeWidth={1.5} dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-thread task count */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-canvas text-xs font-mono text-fg-muted">
            <Zap size={13} className="text-fg-subtle" />
            <span>metrics.per_thread_tasks</span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={threadBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeef2" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tasks" name="Tasks" fill="#0969da" radius={[2, 2, 0, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
