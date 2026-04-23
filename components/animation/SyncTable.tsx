'use client';
import React from 'react';
import type { AnimThread, AnimState } from './types';

export function SyncDetailsTable({ state }: { state: AnimState }) {
  const visibleThreads = state.threads.filter(t => t.visible);
  return (
    <div className="bg-white/95 rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-canvas flex items-center gap-2">
        <span className="text-[10px] font-mono font-bold text-fg uppercase tracking-widest">
          📊 Thread & Process Synchronization Details
        </span>
        <span className="ml-auto text-[9px] font-mono text-fg-subtle">tick {state.tick}</span>
      </div>
      <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
        <table className="w-full text-[10px] font-mono border-collapse">
          <thead>
            <tr className="bg-canvas-subtle text-fg-subtle">
              <th className="text-left px-3 py-1.5 border-b border-border">Thread</th>
              <th className="text-left px-3 py-1.5 border-b border-border">Status</th>
              <th className="text-left px-3 py-1.5 border-b border-border">Task</th>
              <th className="text-left px-3 py-1.5 border-b border-border">Sync State</th>
              <th className="text-left px-3 py-1.5 border-b border-border">Lock</th>
              <th className="text-right px-3 py-1.5 border-b border-border">Wait(t)</th>
              <th className="text-right px-3 py-1.5 border-b border-border">Done</th>
              <th className="text-left px-3 py-1.5 border-b border-border">Progress</th>
            </tr>
          </thead>
          <tbody>
            {visibleThreads.map((t, i) => (
              <tr
                key={t.id}
                className="border-b border-canvas-subtle hover:bg-canvas transition-colors animate-table-row-in"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <td className="px-3 py-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </span>
                </td>
                <td className="px-3 py-1.5">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-3 py-1.5 text-fg-muted">
                  {t.taskId !== null ? `#${t.taskId}` : '—'}
                </td>
                <td className="px-3 py-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                    t.lockHeld ? 'bg-danger-subtle text-danger-fg border border-danger-muted'
                    : t.status === 'waiting' ? 'bg-attention-subtle text-attention-fg border border-attention-muted'
                    : 'bg-canvas text-fg-subtle border border-border'
                  }`}>
                    {t.lockHeld ? `${state.syncType} acquired` : t.status === 'waiting' ? 'waiting' : 'released'}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-center">
                  {t.lockHeld ? '🔒' : '🔓'}
                </td>
                <td className="px-3 py-1.5 text-right text-fg-muted">{t.waitTime}t</td>
                <td className="px-3 py-1.5 text-right font-semibold">{t.tasksCompleted}</td>
                <td className="px-3 py-1.5">
                  <div className="w-16 h-1 bg-canvas-inset rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${t.progress}%`, backgroundColor: t.color }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    idle: 'bg-canvas text-fg-subtle border-border',
    running: 'bg-success-subtle text-success-fg border-success-muted',
    waiting: 'bg-attention-subtle text-attention-fg border-attention-muted',
    completed: 'bg-accent-subtle text-accent-fg border-accent-muted',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded border text-[9px] ${styles[status] || styles.idle}`}>
      {status}
    </span>
  );
}
