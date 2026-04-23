'use client';
import React from 'react';
import type { AnimTask } from './types';

const PRIO_COLORS = { high: '#cf222e', medium: '#9a6700', low: '#8c959f' };

export function TaskCircle({ task, index, section }: { task: AnimTask; index: number; section: 'queue' | 'completed' }) {
  if (!task.visible) return null;
  const color = PRIO_COLORS[task.priority];
  return (
    <div
      className={`flex flex-col items-center ${section === 'queue' ? 'animate-task-slide' : 'animate-task-complete'}`}
      style={{ animationDelay: `${index * 200}ms`, animationFillMode: 'both' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-mono font-bold shadow-sm border-2"
        style={{
          backgroundColor: section === 'completed' ? '#d4a72c30' : color + '20',
          borderColor: section === 'completed' ? '#d4a72c' : color,
          color: section === 'completed' ? '#9a6700' : color,
        }}
      >
        {task.id}
      </div>
      <span className="text-[8px] font-mono mt-0.5" style={{ color }}>{task.priority}</span>
    </div>
  );
}

export function TaskQueue({ tasks }: { tasks: AnimTask[] }) {
  const visible = tasks.filter(t => t.visible && t.status === 'queued');
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xs font-mono font-bold text-fg mb-3 uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-fg" />Task Queue
      </h3>
      <div className="relative flex items-center gap-2 px-4 py-3 bg-white/80 rounded-xl border border-border shadow-sm min-h-[60px] min-w-[200px]">
        {visible.length > 3 && (
          <span className="text-fg-subtle font-mono text-lg mr-1">···</span>
        )}
        {visible.slice(-6).map((t, i) => (
          <TaskCircle key={t.id} task={t} index={i} section="queue" />
        ))}
        {visible.length === 0 && <span className="text-[10px] font-mono text-fg-subtle">Empty</span>}
      </div>
    </div>
  );
}

export function CompletedTasks({ tasks }: { tasks: AnimTask[] }) {
  const visible = tasks.filter(t => t.visible);
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xs font-mono font-bold text-fg mb-3 uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success-fg" />Completed Tasks
      </h3>
      <div className="relative flex items-center gap-2 px-4 py-3 bg-white/80 rounded-xl border border-success-muted shadow-sm min-h-[60px] min-w-[200px]">
        {visible.length > 3 && (
          <span className="text-fg-subtle font-mono text-lg mr-1">···</span>
        )}
        {visible.slice(-6).map((t, i) => (
          <TaskCircle key={t.id} task={t} index={i} section="completed" />
        ))}
        {visible.length === 0 && <span className="text-[10px] font-mono text-fg-subtle">Waiting…</span>}
      </div>
    </div>
  );
}
