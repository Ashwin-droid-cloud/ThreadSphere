'use client';

import React, { useState } from 'react';
import { GitBranch, Cpu, Activity, Terminal, Lock, ChevronRight, Info } from 'lucide-react';
import { useThreadEngine } from '@/hooks/useThreadEngine';
import ControlPanel from '@/components/ControlPanel';
import ThreadPoolVisualizer from '@/components/ThreadPoolVisualizer';
import MetricsDashboard from '@/components/MetricsDashboard';
import LogConsole from '@/components/LogConsole';
import SchedulerPanel from '@/components/SchedulerPanel';
import SyncVisualizer from '@/components/SyncVisualizer';

// ─── Tab system for the right panel ─────────────────────────────────────────
type RightTab = 'scheduler' | 'sync';

export default function ThreadSpherePage() {
  const { state, start, pause, reset, setThreadCount, setAlgorithm, setSyncType } =
    useThreadEngine();

  const [rightTab, setRightTab] = useState<RightTab>('scheduler');
  const [showInfo, setShowInfo] = useState(false);

  const activeCount = state.threads.filter((t) => t.status === 'running').length;
  const waitingCount = state.threads.filter((t) => t.status === 'waiting').length;

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* ── Top Nav Bar ─────────────────────────────────────────────────── */}
      <header className="h-11 bg-white border-b border-border flex items-center px-4 gap-4 flex-shrink-0 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-fg flex items-center justify-center">
            <Cpu size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold font-mono text-fg">ThreadSphere</span>
          <span className="text-xs text-fg-muted font-mono">/</span>
          <span className="text-xs text-fg-muted font-mono">simulation</span>
        </div>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-fg-subtle">
          <ChevronRight size={11} />
          <span>thread_pool</span>
          <ChevronRight size={11} />
          <span className="text-fg-muted">{state.schedulerAlgorithm.toLowerCase()}_scheduler</span>
          <ChevronRight size={11} />
          <span className="text-fg-muted">{state.syncType}</span>
        </div>

        {/* Status pills */}
        <div className="ml-auto flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-[10px] font-mono rounded-full px-2 py-0.5 border ${
            state.isRunning && !state.isPaused
              ? 'bg-success-subtle border-success-muted text-success-fg'
              : state.isPaused
              ? 'bg-attention-subtle border-attention-muted text-attention-fg'
              : 'bg-canvas border-border text-fg-subtle'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              state.isRunning && !state.isPaused ? 'bg-success-emphasis animate-pulse'
              : state.isPaused ? 'bg-attention-emphasis'
              : 'bg-fg-subtle'
            }`} />
            {state.isRunning && !state.isPaused ? 'running' : state.isPaused ? 'paused' : 'idle'}
          </span>

          <span className="text-[10px] font-mono text-fg-subtle border border-border rounded-full px-2 py-0.5 hidden md:inline">
            tick {state.tick}
          </span>

          <span className="text-[10px] font-mono text-fg-subtle border border-border rounded-full px-2 py-0.5 hidden md:inline">
            {activeCount} active · {waitingCount} waiting
          </span>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 rounded hover:bg-canvas text-fg-subtle hover:text-fg transition-colors"
            title="Show info"
          >
            <Info size={14} />
          </button>
        </div>
      </header>

      {/* Info banner */}
      {showInfo && (
        <div className="bg-accent-subtle border-b border-accent-muted px-4 py-2 text-xs font-mono text-accent-fg flex items-center gap-2">
          <Info size={12} />
          <span>
            <strong>ThreadSphere</strong> simulates a thread pool with configurable threads, FIFO/Priority scheduling, Mutex/Semaphore sync primitives, and live metrics.
            Click <strong>Simulate</strong> to start.
          </span>
          <button onClick={() => setShowInfo(false)} className="ml-auto text-fg-subtle hover:text-fg">✕</button>
        </div>
      )}

      {/* ── Secondary Tab Bar ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border flex items-center px-4 gap-0 flex-shrink-0 overflow-x-auto">
        {[
          { id: 'metrics', label: 'metrics', icon: <Activity size={11} /> },
          { id: 'threads', label: 'threads', icon: <Cpu size={11} /> },
          { id: 'logs', label: 'logs', icon: <Terminal size={11} /> },
        ].map((tab) => (
          <div key={tab.id} className="flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-mono text-fg-muted border-b-2 border-accent-fg">
            {tab.icon}
            <span>{tab.label}</span>
          </div>
        ))}
      </div>

      {/* ── Main 3-column Layout ─────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT SIDEBAR: Controls ──────────────────────────────────────── */}
        <aside className="w-72 flex-shrink-0 border-r border-border bg-white overflow-y-auto p-4 space-y-4">
          {/* Sidebar file-tree header */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-fg-subtle pb-2 border-b border-border">
            <GitBranch size={11} />
            <span>EXPLORER</span>
          </div>

          {/* File tree mockup */}
          <div className="space-y-0.5 text-[11px] font-mono">
            {[
              { name: 'thread_pool', icon: '📁', active: true },
              { name: '  ├ control_panel', icon: '⚙️', active: false },
              { name: '  ├ scheduler', icon: '📋', active: false },
              { name: '  └ sync_primitives', icon: '🔒', active: false },
              { name: 'metrics', icon: '📊', active: false },
              { name: 'logs', icon: '📄', active: false },
            ].map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-default ${
                  item.active ? 'bg-accent-subtle text-accent-fg' : 'text-fg-muted hover:bg-canvas'
                }`}
              >
                <span className="text-[10px]">{item.icon}</span>
                <span className="whitespace-pre">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <ControlPanel
              state={state}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onThreadCountChange={setThreadCount}
              onAlgorithmChange={setAlgorithm}
              onSyncTypeChange={setSyncType}
            />
          </div>
        </aside>

        {/* ── CENTER: Main content area ────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 min-w-0">
          {/* ── Metrics Dashboard ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-fg-muted">
              <Activity size={12} className="text-fg-subtle" />
              <span>metrics.dashboard</span>
              <span className="text-fg-subtle ml-auto">
                {state.metricsHistory.length} snapshots
              </span>
            </div>
            <MetricsDashboard
              metrics={state.metrics}
              metricsHistory={state.metricsHistory}
              threads={state.threads}
            />
          </section>

          {/* ── Thread Pool ─────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-fg-muted">
              <Cpu size={12} className="text-fg-subtle" />
              <span>thread_pool.state</span>
            </div>
            <ThreadPoolVisualizer threads={state.threads} />
          </section>

          {/* ── Log Console ─────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-fg-muted">
              <Terminal size={12} className="text-fg-subtle" />
              <span>log.stream</span>
            </div>
            <LogConsole logs={state.logs} />
          </section>
        </main>

        {/* ── RIGHT SIDEBAR: Scheduler + Sync ─────────────────────────────── */}
        <aside className="w-80 flex-shrink-0 border-l border-border bg-white overflow-y-auto flex flex-col">
          {/* Tab bar */}
          <div className="flex border-b border-border flex-shrink-0">
            {[
              { id: 'scheduler' as RightTab, label: 'Scheduler', icon: <GitBranch size={11} /> },
              { id: 'sync' as RightTab, label: 'Sync', icon: <Lock size={11} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-mono transition-colors border-b-2 ${
                  rightTab === tab.id
                    ? 'border-accent-fg text-accent-fg bg-accent-subtle'
                    : 'border-transparent text-fg-muted hover:bg-canvas'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {rightTab === 'scheduler' ? (
              <SchedulerPanel
                taskQueue={state.taskQueue}
                schedulerAlgorithm={state.schedulerAlgorithm}
                onAlgorithmChange={setAlgorithm}
                tick={state.tick}
              />
            ) : (
              <SyncVisualizer
                syncResource={state.syncResource}
                threads={state.threads}
                onSyncTypeChange={setSyncType}
              />
            )}
          </div>

          {/* Bottom stats */}
          <div className="border-t border-border p-3 grid grid-cols-2 gap-2 flex-shrink-0 bg-canvas">
            <div className="text-center">
              <div className="text-base font-mono font-bold text-fg tabular-nums">{state.completedTasks.length}</div>
              <div className="text-[9px] font-mono text-fg-subtle">completed</div>
            </div>
            <div className="text-center">
              <div className="text-base font-mono font-bold text-fg tabular-nums">{state.taskCounter}</div>
              <div className="text-[9px] font-mono text-fg-subtle">total tasks</div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────────── */}
      <footer className="h-6 bg-accent-emphasis flex items-center px-4 gap-4 flex-shrink-0">
        <span className="text-[10px] font-mono text-white/80">ThreadSphere v1.0</span>
        <span className="text-[10px] font-mono text-white/60">|</span>
        <span className="text-[10px] font-mono text-white/80">
          {state.schedulerAlgorithm} · {state.syncType}
        </span>
        <span className="text-[10px] font-mono text-white/60">|</span>
        <span className="text-[10px] font-mono text-white/80">
          {state.threads.length} threads · tick {state.tick}
        </span>
        <span className="ml-auto text-[10px] font-mono text-white/60">
          {state.metrics.cpuUsage.toFixed(1)}% CPU
        </span>
      </footer>
    </div>
  );
}
