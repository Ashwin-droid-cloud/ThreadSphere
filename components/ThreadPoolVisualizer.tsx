'use client';

import React from 'react';
import { Cpu } from 'lucide-react';
import type { Thread } from '@/types';

interface ThreadPoolVisualizerProps {
  threads: Thread[];
}

const STATUS_CONFIG = {
  idle: {
    bg: 'bg-canvas border-border',
    dot: 'bg-fg-subtle',
    label: 'idle',
    labelClass: 'text-fg-subtle',
    ring: '',
  },
  running: {
    bg: 'bg-success-subtle border-success-muted',
    dot: 'bg-success-emphasis animate-pulse',
    label: 'running',
    labelClass: 'text-success-fg',
    ring: 'ring-1 ring-success-muted',
  },
  blocked: {
    bg: 'bg-danger-subtle border-danger-muted',
    dot: 'bg-danger-emphasis animate-pulse',
    label: 'blocked',
    labelClass: 'text-danger-fg',
    ring: 'ring-1 ring-danger-muted',
  },
  waiting: {
    bg: 'bg-attention-subtle border-attention-muted',
    dot: 'bg-attention-emphasis animate-pulse-slow',
    label: 'waiting',
    labelClass: 'text-attention-fg',
    ring: 'ring-1 ring-attention-muted',
  },
};

export default function ThreadPoolVisualizer({ threads }: ThreadPoolVisualizerProps) {
  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas">
        <div className="flex items-center gap-2 text-xs font-mono text-fg-muted">
          <Cpu size={13} className="text-fg-subtle" />
          <span>thread_pool.visualizer</span>
        </div>
        <span className="text-[10px] font-mono text-fg-subtle bg-canvas-inset border border-border rounded px-1.5 py-0.5">
          {threads.length} threads
        </span>
      </div>

      <div className="p-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 pb-3 border-b border-border-subtle">
          {(['idle', 'running', 'waiting', 'blocked'] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
              <span className="text-[10px] font-mono text-fg-subtle capitalize">{s}</span>
            </div>
          ))}
        </div>

        {/* Thread Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {threads.map((thread) => {
            const cfg = STATUS_CONFIG[thread.status];
            return (
              <div
                key={thread.id}
                className={`relative rounded-md border p-3 transition-all duration-300 ${cfg.bg} ${cfg.ring}`}
              >
                {/* Thread name */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-semibold text-fg">{thread.name}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                </div>

                {/* Status badge */}
                <div className={`text-[10px] font-mono ${cfg.labelClass} mb-2`}>
                  {cfg.label}
                </div>

                {/* Current task */}
                {thread.currentTaskId !== null ? (
                  <div className="text-[10px] font-mono text-fg-muted bg-white border border-border rounded px-1.5 py-0.5">
                    Task #{thread.currentTaskId}
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-fg-subtle">—</div>
                )}

                {/* Stats row */}
                <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between">
                  <span className="text-[9px] font-mono text-fg-subtle">done: {thread.tasksCompleted}</span>
                  <span className="text-[9px] font-mono text-fg-subtle">
                    avg: {thread.tasksCompleted > 0
                      ? (thread.totalLatency / thread.tasksCompleted).toFixed(1)
                      : '–'} ticks
                  </span>
                </div>

                {/* Sync indicator */}
                {thread.holdingSyncSlot && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-done-fg" title="Holding sync slot" />
                )}
                {thread.waitingSyncQueue && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-attention-emphasis" title="Waiting on sync" />
                )}
              </div>
            );
          })}
        </div>

        {threads.length === 0 && (
          <div className="text-center text-xs font-mono text-fg-subtle py-8">
            No threads — adjust the slider above
          </div>
        )}
      </div>
    </div>
  );
}
