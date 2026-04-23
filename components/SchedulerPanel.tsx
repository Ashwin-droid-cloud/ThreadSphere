'use client';

import React from 'react';
import { GitBranch, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import type { Task, SchedulerAlgorithm } from '@/types';
import { getSortedQueue } from '@/utils/scheduler';

interface SchedulerPanelProps {
  taskQueue: Task[];
  schedulerAlgorithm: SchedulerAlgorithm;
  onAlgorithmChange: (a: SchedulerAlgorithm) => void;
  tick: number;
}

const PRIORITY_CONFIG = {
  high: { badge: 'bg-danger-subtle border-danger-muted text-danger-fg', dot: 'bg-danger-fg', sort: 3 },
  medium: { badge: 'bg-attention-subtle border-attention-muted text-attention-fg', dot: 'bg-attention-fg', sort: 2 },
  low: { badge: 'bg-canvas border-border text-fg-muted', dot: 'bg-fg-subtle', sort: 1 },
};

export default function SchedulerPanel({
  taskQueue,
  schedulerAlgorithm,
  onAlgorithmChange,
  tick,
}: SchedulerPanelProps) {
  const sortedQueue = getSortedQueue(taskQueue, schedulerAlgorithm);
  const runningTasks = taskQueue.filter((t) => t.status === 'running');

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas">
        <div className="flex items-center gap-2 text-xs font-mono text-fg-muted">
          <GitBranch size={13} className="text-fg-subtle" />
          <span>scheduler.queue</span>
        </div>
        <div className="flex rounded border border-border overflow-hidden text-[10px] font-mono">
          {(['FIFO', 'Priority'] as SchedulerAlgorithm[]).map((algo) => (
            <button
              key={algo}
              onClick={() => onAlgorithmChange(algo)}
              className={`px-2 py-1 transition-all ${
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

      <div className="p-4 space-y-4">
        {/* Algorithm description */}
        <div className="rounded-md bg-canvas border border-border-subtle p-3 text-[11px] font-mono text-fg-muted">
          {schedulerAlgorithm === 'FIFO' ? (
            <span className="flex items-center gap-1.5">
              <Clock size={11} className="text-accent-fg" />
              <strong className="text-fg">FIFO</strong> — tasks dispatched in arrival order (earliest first)
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <ArrowUp size={11} className="text-danger-fg" />
              <strong className="text-fg">Priority</strong> — highest priority value dispatched first; ties broken by arrival time
            </span>
          )}
        </div>

        {/* Running tasks */}
        {runningTasks.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-fg-subtle uppercase tracking-widest mb-2">Running ({runningTasks.length})</p>
            <div className="space-y-1">
              {runningTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 rounded bg-success-subtle border border-success-muted px-2 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-emphasis animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-mono text-success-fg">Task #{task.id}</span>
                  <span className={`ml-auto text-[9px] font-mono border rounded px-1 py-0.5 ${PRIORITY_CONFIG[task.priority].badge}`}>
                    {task.priority}
                  </span>
                  <span className="text-[9px] font-mono text-fg-subtle">T-{task.assignedThreadId}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Queued tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono text-fg-subtle uppercase tracking-widest">
              Queue ({sortedQueue.length})
            </p>
            <div className="flex items-center gap-1 text-[10px] text-fg-subtle font-mono">
              {schedulerAlgorithm === 'FIFO' ? (
                <><ArrowDown size={10} /> arrival order</>
              ) : (
                <><ArrowUp size={10} /> priority order</>
              )}
            </div>
          </div>

          <div className="space-y-0.5 max-h-52 overflow-y-auto">
            {sortedQueue.length === 0 ? (
              <div className="text-center py-6 text-[11px] font-mono text-fg-subtle">
                Queue empty
              </div>
            ) : (
              sortedQueue.map((task, idx) => {
                const pCfg = PRIORITY_CONFIG[task.priority];
                const waitTime = tick - task.arrivalTime;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 rounded px-2 py-1.5 border border-canvas-inset hover:bg-canvas transition-colors"
                  >
                    {/* Position */}
                    <span className="text-[9px] font-mono text-fg-subtle w-4 text-right flex-shrink-0">{idx + 1}</span>
                    {/* Priority dot */}
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pCfg.dot}`} />
                    {/* Task id */}
                    <span className="text-[10px] font-mono text-fg flex-1">Task #{task.id}</span>
                    {/* Priority badge */}
                    <span className={`text-[9px] font-mono border rounded px-1 py-0.5 ${pCfg.badge}`}>
                      {task.priority} ({task.priorityValue})
                    </span>
                    {/* Wait time */}
                    <span className="text-[9px] font-mono text-fg-subtle w-12 text-right">
                      +{waitTime}t
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
