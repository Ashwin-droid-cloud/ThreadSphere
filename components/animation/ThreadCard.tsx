'use client';
import React from 'react';
import type { AnimThread } from './types';

const COLORS: Record<string, string> = {
  idle: '#8c959f', running: '#1a7f37', waiting: '#9a6700', completed: '#0969da',
};

export function ThreadCard({ thread, index }: { thread: AnimThread; index: number }) {
  if (!thread.visible) return null;
  const statusColor = COLORS[thread.status] || COLORS.idle;
  return (
    <div
      className="relative flex flex-col items-center p-3 rounded-xl border-2 bg-white shadow-sm min-w-[100px] animate-thread-spawn"
      style={{
        animationDelay: `${index * 400}ms`,
        borderColor: statusColor + '60',
        animationFillMode: 'both',
      }}
    >
      {thread.status === 'running' && (
        <div className="absolute inset-0 rounded-xl animate-glow-ring" style={{ borderColor: thread.color }} />
      )}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold font-mono mb-1.5"
        style={{ backgroundColor: thread.color }}
      >
        T{thread.id}
      </div>
      <span className="text-[10px] font-mono font-semibold text-fg">{thread.name}</span>
      <span
        className="text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: statusColor + '20', color: statusColor }}
      >
        {thread.status}
      </span>
      {thread.taskId !== null && (
        <span className="text-[9px] font-mono text-fg-muted mt-1">Task #{thread.taskId}</span>
      )}
      {thread.status === 'running' && (
        <div className="w-full h-1 bg-canvas-inset rounded-full mt-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${thread.progress}%`, backgroundColor: thread.color }}
          />
        </div>
      )}
      {thread.lockHeld && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-danger-fg flex items-center justify-center">
          <span className="text-[8px] text-white">🔒</span>
        </div>
      )}
    </div>
  );
}
