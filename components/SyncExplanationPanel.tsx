'use client';

import React from 'react';
import { Info, Lock, Users, Zap } from 'lucide-react';

interface SyncExplanationPanelProps {
  syncType: 'mutex' | 'semaphore';
}

export default function SyncExplanationPanel({ syncType }: SyncExplanationPanelProps) {
  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-canvas text-xs font-mono text-fg-muted">
        <Info size={13} className="text-fg-subtle" />
        <span>synchronization.guide</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Concept Overview */}
        <div>
          <p className="text-[11px] font-mono text-fg-subtle uppercase tracking-widest mb-2">What is Synchronization?</p>
          <p className="text-[10px] font-mono text-fg-muted leading-relaxed">
            Synchronization ensures multiple threads safely access shared resources without data corruption. When threads need to access the same resource, they must coordinate their access using primitives like mutexes or semaphores.
          </p>
        </div>

        {/* Current Primitive */}
        <div className="rounded-md bg-canvas border border-border-subtle p-3">
          <div className="flex items-center gap-2 mb-2">
            {syncType === 'mutex' ? (
              <Lock size={12} className="text-fg-muted" />
            ) : (
              <Users size={12} className="text-fg-muted" />
            )}
            <p className="text-[10px] font-mono font-semibold text-fg">
              {syncType === 'mutex' ? 'Mutex (Binary Lock)' : 'Semaphore (Counting Lock)'}
            </p>
          </div>
          <p className="text-[9px] font-mono text-fg-muted leading-relaxed">
            {syncType === 'mutex'
              ? 'A mutex allows only ONE thread to access the resource at a time. Other threads must wait in a queue. This ensures exclusive access.'
              : 'A semaphore allows UP TO 3 threads to access the resource simultaneously. A counter tracks available slots. This allows controlled concurrent access.'}
          </p>
        </div>

        {/* How It Works */}
        <div>
          <p className="text-[11px] font-mono text-fg-subtle uppercase tracking-widest mb-2">How It Works</p>
          <div className="space-y-2">
            <div className="flex gap-2 text-[9px] font-mono">
              <span className="text-done-fg font-semibold flex-shrink-0">1.</span>
              <span className="text-fg-muted">Thread tries to acquire the lock</span>
            </div>
            <div className="flex gap-2 text-[9px] font-mono">
              <span className="text-done-fg font-semibold flex-shrink-0">2.</span>
              <span className="text-fg-muted">{syncType === 'mutex' ? 'If available, thread gets exclusive access' : 'If slot available, thread acquires it'}</span>
            </div>
            <div className="flex gap-2 text-[9px] font-mono">
              <span className="text-done-fg font-semibold flex-shrink-0">3.</span>
              <span className="text-fg-muted">Other threads wait in queue or sleep</span>
            </div>
            <div className="flex gap-2 text-[9px] font-mono">
              <span className="text-done-fg font-semibold flex-shrink-0">4.</span>
              <span className="text-fg-muted">Thread completes work and releases lock</span>
            </div>
            <div className="flex gap-2 text-[9px] font-mono">
              <span className="text-done-fg font-semibold flex-shrink-0">5.</span>
              <span className="text-fg-muted">Next waiting thread acquires the lock</span>
            </div>
          </div>
        </div>

        {/* Key Concepts */}
        <div>
          <p className="text-[11px] font-mono text-fg-subtle uppercase tracking-widest mb-2">Key Concepts</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-attention-fg font-semibold text-[9px] flex-shrink-0">🔒</span>
              <div className="text-[9px] font-mono text-fg-muted">
                <span className="font-semibold text-fg">Critical Section:</span> Code that accesses shared resources
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-success-fg font-semibold text-[9px] flex-shrink-0">✓</span>
              <div className="text-[9px] font-mono text-fg-muted">
                <span className="font-semibold text-fg">Atomicity:</span> Operations complete without interruption
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-fg font-semibold text-[9px] flex-shrink-0">⏳</span>
              <div className="text-[9px] font-mono text-fg-muted">
                <span className="font-semibold text-fg">Race Condition:</span> When timing causes incorrect behavior
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-warning-fg font-semibold text-[9px] flex-shrink-0">🔄</span>
              <div className="text-[9px] font-mono text-fg-muted">
                <span className="font-semibold text-fg">Deadlock:</span> Threads wait forever for unavailable locks
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="rounded-md bg-success-subtle/20 border border-success-muted/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={12} className="text-success-fg" />
            <p className="text-[10px] font-mono font-semibold text-success-fg">Benefits of Proper Synchronization</p>
          </div>
          <ul className="space-y-1 text-[9px] font-mono text-success-fg">
            <li>✓ Prevents data corruption from race conditions</li>
            <li>✓ Allows safe concurrent execution</li>
            <li>✓ Ensures consistent system state</li>
            <li>✓ Enables predictable multi-threaded behavior</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
