'use client';

import React from 'react';
import { Lock, Users } from 'lucide-react';
import type { SyncResource, Thread, SyncType } from '@/types';

interface SyncVisualizerProps {
  syncResource: SyncResource;
  threads: Thread[];
  onSyncTypeChange: (s: SyncType) => void;
}

export default function SyncVisualizer({ syncResource, threads, onSyncTypeChange }: SyncVisualizerProps) {
  const { type, maxSlots, occupiedSlots, holdingThreadIds, waitingThreadIds } = syncResource;

  const holdingThreads = threads.filter((t) => holdingThreadIds.includes(t.id));
  const waitingThreads = threads.filter((t) => waitingThreadIds.includes(t.id));
  const freeSlots = maxSlots - occupiedSlots;

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas">
        <div className="flex items-center gap-2 text-xs font-mono text-fg-muted">
          <Lock size={13} className="text-fg-subtle" />
          <span>sync.{type}</span>
        </div>
        <div className="flex rounded border border-border overflow-hidden text-[10px] font-mono">
          {(['mutex', 'semaphore'] as SyncType[]).map((s) => (
            <button
              key={s}
              onClick={() => onSyncTypeChange(s)}
              className={`px-2 py-1 capitalize transition-all ${
                type === s
                  ? 'bg-done-emphasis text-white'
                  : 'bg-white text-fg-muted hover:bg-canvas'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Resource Slot Visual */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono text-fg-subtle uppercase tracking-widest">
              Resource Slots
            </p>
            <span className="text-[10px] font-mono text-fg-muted">
              {occupiedSlots}/{maxSlots} occupied
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: maxSlots }).map((_, i) => {
              const holderId = holdingThreadIds[i];
              const thread = holderId ? threads.find((t) => t.id === holderId) : null;
              const isOccupied = i < occupiedSlots;

              return (
                <div
                  key={i}
                  className={`relative flex-1 min-w-[60px] rounded-lg border-2 p-3 text-center transition-all duration-300 ${
                    isOccupied
                      ? 'border-done-fg bg-done-muted'
                      : 'border-dashed border-border bg-canvas-subtle'
                  }`}
                >
                  {isOccupied ? (
                    <>
                      <Lock size={14} className="text-done-fg mx-auto mb-1" />
                      {thread ? (
                        <div className="text-[9px] font-mono text-done-fg font-semibold">
                          {thread.name}
                        </div>
                      ) : (
                        <div className="text-[9px] font-mono text-done-fg">locked</div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-border-muted mx-auto mb-1" />
                      <div className="text-[9px] font-mono text-fg-subtle">free</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full h-1.5 bg-canvas-inset rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-done-emphasis"
              style={{ width: maxSlots > 0 ? `${(occupiedSlots / maxSlots) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-[9px] font-mono text-fg-subtle mt-1">
            {freeSlots} slot{freeSlots !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Holding threads */}
        {holdingThreads.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-fg-subtle uppercase tracking-widest mb-2 flex items-center gap-1">
              <Lock size={9} /> Holding Lock
            </p>
            <div className="space-y-1">
              {holdingThreads.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded bg-done-muted border border-done-muted px-2 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-done-fg flex-shrink-0" />
                  <span className="text-[10px] font-mono text-done-fg font-medium">{t.name}</span>
                  <span className="ml-auto text-[9px] font-mono text-fg-subtle">Task #{t.currentTaskId}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waiting threads */}
        {waitingThreads.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-fg-subtle uppercase tracking-widest mb-2 flex items-center gap-1">
              <Users size={9} /> Waiting Queue ({waitingThreads.length})
            </p>
            <div className="space-y-1">
              {waitingThreads.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded bg-attention-subtle border border-attention-muted px-2 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-attention-emphasis animate-pulse-slow flex-shrink-0" />
                  <span className="text-[10px] font-mono text-attention-fg">{t.name}</span>
                  <span className="ml-auto text-[9px] font-mono text-fg-subtle">waiting…</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {holdingThreads.length === 0 && waitingThreads.length === 0 && (
          <div className="text-center py-2 text-[11px] font-mono text-fg-subtle">
            No threads accessing resource
          </div>
        )}

        {/* Type description */}
        <div className="rounded-md bg-canvas border border-border-subtle p-3 text-[10px] font-mono text-fg-muted">
          {type === 'mutex' ? (
            <><span className="font-semibold text-fg">Mutex</span> — binary lock, exclusive access (1 thread at a time)</>
          ) : (
            <><span className="font-semibold text-fg">Semaphore</span> — counting lock, up to {maxSlots} concurrent threads</>
          )}
        </div>
      </div>
    </div>
  );
}
