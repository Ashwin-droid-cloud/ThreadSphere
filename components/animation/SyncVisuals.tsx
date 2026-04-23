'use client';
import React from 'react';
import type { SyncType } from '@/types';

export function SyncPanel({ syncType, slots, occupied }: { syncType: SyncType; slots: number; occupied: number }) {
  const isMutex = syncType === 'mutex';
  return (
    <div className="flex flex-col items-center p-4 bg-white/90 rounded-xl border-2 border-done-muted shadow-sm">
      <h3 className="text-xs font-mono font-bold text-done-fg mb-2 uppercase tracking-widest">
        {isMutex ? '🔒 Mutex Lock' : '🚦 Semaphore'}
      </h3>
      <p className="text-[10px] font-mono text-fg-muted mb-3">
        {isMutex ? 'Exclusive Access — 1 thread at a time' : `Counting Lock — up to ${slots} concurrent`}
      </p>
      <div className="flex gap-2">
        {Array.from({ length: slots }).map((_, i) => {
          const isOccupied = i < occupied;
          return (
            <div
              key={i}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-500 ${
                isOccupied
                  ? 'border-danger-fg bg-danger-subtle animate-lock-acquire'
                  : 'border-dashed border-border bg-canvas-subtle'
              }`}
            >
              {isOccupied ? (
                <span className="text-sm">🔒</span>
              ) : (
                <span className="text-sm">🔓</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="w-full h-1.5 bg-canvas-inset rounded-full overflow-hidden" style={{ width: 120 }}>
          <div
            className="h-full rounded-full bg-done-emphasis transition-all duration-500"
            style={{ width: slots > 0 ? `${(occupied / slots) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-[9px] font-mono text-fg-subtle">{occupied}/{slots}</span>
      </div>
    </div>
  );
}

export function CpuGauge({ usage }: { usage: number }) {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (usage / 100) * circ;
  const color = usage > 80 ? '#cf222e' : usage > 50 ? '#9a6700' : '#1a7f37';
  return (
    <div className="flex flex-col items-center p-3 bg-white/90 rounded-xl border border-border shadow-sm">
      <h3 className="text-[10px] font-mono font-bold text-fg mb-2 uppercase tracking-widest">CPU Utilisation</h3>
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e1e4e8" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-mono font-bold" style={{ color }}>{Math.round(usage)}%</span>
          <span className="text-[8px] font-mono text-fg-subtle">usage</span>
        </div>
      </div>
      <p className="text-[9px] font-mono text-fg-muted mt-1">Maximizing CPU</p>
    </div>
  );
}

export function FlowArrow({ direction }: { direction: 'down' | 'up' }) {
  return (
    <div className="flex justify-center py-1">
      <svg width="24" height="36" viewBox="0 0 24 36">
        <line
          x1="12" y1={direction === 'down' ? 0 : 36}
          x2="12" y2={direction === 'down' ? 28 : 8}
          stroke="#0969da" strokeWidth="2" strokeDasharray="5 3"
          className="animate-dash-flow"
        />
        <polygon
          points={direction === 'down' ? '6,28 12,36 18,28' : '6,8 12,0 18,8'}
          fill="#0969da"
        />
      </svg>
    </div>
  );
}
