'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Settings, Zap } from 'lucide-react';
import type { SimulationState, SchedulerAlgorithm, SyncType } from '@/types';

interface ControlPanelProps {
  state: SimulationState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onThreadCountChange: (n: number) => void;
  onAlgorithmChange: (a: SchedulerAlgorithm) => void;
  onSyncTypeChange: (s: SyncType) => void;
  onSyncAnimate: () => void;
}

export default function ControlPanel({
  state,
  onStart,
  onPause,
  onReset,
  onThreadCountChange,
  onAlgorithmChange,
  onSyncTypeChange,
  onSyncAnimate,
}: ControlPanelProps) {
  const { isRunning, isPaused, schedulerAlgorithm, syncType, threadCount } = state;

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-canvas text-xs font-mono text-fg-muted">
        <Settings size={13} className="text-fg-subtle" />
        <span>simulation.controls</span>
      </div>

      <div className="p-4 space-y-5">
        {/* ── Simulation Buttons ────────────────────────────── */}
        <div>
          <p className="text-[11px] font-mono text-fg-subtle uppercase tracking-widest mb-2">Engine Controls</p>
          <div className="flex gap-2 flex-wrap">
            {/* Simulate / Resume */}
            <button
              id="btn-simulate"
              onClick={onStart}
              disabled={isRunning && !isPaused}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border transition-all
                         bg-success-subtle border-success-muted text-success-fg
                         hover:bg-success-muted disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Play size={12} fill="currentColor" />
              {isRunning && !isPaused ? 'Running…' : isRunning && isPaused ? 'Resume' : 'Simulate'}
            </button>

            {/* Pause */}
            <button
              id="btn-pause"
              onClick={onPause}
              disabled={!isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border transition-all
                         bg-attention-subtle border-attention-muted text-attention-fg
                         hover:bg-attention-muted disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Pause size={12} fill="currentColor" />
              {isPaused ? 'Paused' : 'Pause'}
            </button>

            {/* Reset */}
            <button
              id="btn-reset"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border transition-all
                         bg-danger-subtle border-danger-muted text-danger-fg
                         hover:bg-danger-muted active:scale-95"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          {/* Synchronize Thread Pool Button */}
          <button
            id="btn-sync-animate"
            onClick={onSyncAnimate}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono rounded-md border transition-all
                       bg-done-subtle border-done-muted text-done-fg
                       hover:bg-done-emphasis hover:text-white hover:border-done-emphasis active:scale-95"
          >
            <Zap size={13} fill="currentColor" />
            Synchronize using Thread Pool
          </button>
        </div>

        {/* ── Thread Count Slider ───────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-mono text-fg-subtle uppercase tracking-widest">Thread Pool</p>
            <span className="text-[11px] font-mono font-semibold text-accent-fg bg-accent-subtle border border-accent-muted rounded px-1.5 py-0.5">
              {threadCount} threads
            </span>
          </div>
          <input
            id="slider-threads"
            type="range"
            min={1}
            max={16}
            value={threadCount}
            onChange={(e) => onThreadCountChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-accent-fg bg-canvas-inset"
          />
          <div className="flex justify-between text-[10px] text-fg-subtle font-mono mt-1">
            <span>1</span>
            <span>4</span>
            <span>8</span>
            <span>12</span>
            <span>16</span>
          </div>
        </div>

        {/* ── Scheduler Algorithm ───────────────────────────── */}
        <div>
          <p className="text-[11px] font-mono text-fg-subtle uppercase tracking-widest mb-2">Scheduler Algorithm</p>
          <div className="flex rounded-md border border-border overflow-hidden text-xs font-mono">
            {(['FIFO', 'Priority'] as SchedulerAlgorithm[]).map((algo) => (
              <button
                key={algo}
                id={`algo-${algo.toLowerCase()}`}
                onClick={() => onAlgorithmChange(algo)}
                className={`flex-1 py-1.5 text-center transition-all ${
                  schedulerAlgorithm === algo
                    ? 'bg-fg text-fg-onEmphasis'
                    : 'bg-white text-fg-muted hover:bg-canvas'
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sync Primitive ────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-mono text-fg-subtle uppercase tracking-widest mb-2">Sync Primitive</p>
          <div className="flex rounded-md border border-border overflow-hidden text-xs font-mono">
            {(['mutex', 'semaphore'] as SyncType[]).map((s) => (
              <button
                key={s}
                id={`sync-${s}`}
                onClick={() => onSyncTypeChange(s)}
                className={`flex-1 py-1.5 capitalize text-center transition-all ${
                  syncType === s
                    ? 'bg-done-emphasis text-white'
                    : 'bg-white text-fg-muted hover:bg-canvas'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-fg-subtle font-mono mt-1">
            {syncType === 'mutex'
              ? 'Mutex: exclusive access (1 slot)'
              : 'Semaphore: limited access (3 slots)'}
          </p>
        </div>

        {/* ── Status Indicator ─────────────────────────────── */}
        <div className="flex items-center gap-2 pt-1">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning && !isPaused
                ? 'bg-success-emphasis animate-pulse'
                : isPaused
                ? 'bg-attention-emphasis animate-pulse'
                : 'bg-fg-subtle'
            }`}
          />
          <span className="text-[11px] font-mono text-fg-muted">
            {isRunning && !isPaused ? 'Simulation running' : isPaused ? 'Simulation paused' : 'Idle — ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
