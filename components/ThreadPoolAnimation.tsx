'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import type { ThreadPoolAnimationProps, AnimState, AnimThread, AnimTask } from './animation/types';
import { ThreadCard } from './animation/ThreadCard';
import { TaskQueue, CompletedTasks } from './animation/TaskVisuals';
import { SyncPanel, CpuGauge, FlowArrow } from './animation/SyncVisuals';
import { SyncDetailsTable } from './animation/SyncTable';

const THREAD_COLORS = [
  '#0969da', '#1a7f37', '#8250df', '#9a6700', '#cf222e',
  '#0a5d6b', '#b35900', '#5a32a3', '#0f7e5a', '#bc4c00',
  '#125fd7', '#2da44e', '#9a3fcf', '#cf9600', '#d93f0b', '#0756c8',
];

const PRIORITIES: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

function makeThread(id: number): AnimThread {
  return {
    id, name: `Thread-${id}`, color: THREAD_COLORS[(id - 1) % THREAD_COLORS.length],
    status: 'idle', taskId: null, progress: 0, lockHeld: false,
    waitTime: 0, tasksCompleted: 0, visible: false,
  };
}

function makeTask(id: number): AnimTask {
  return {
    id, priority: PRIORITIES[Math.floor(Math.random() * 3)],
    status: 'queued', assignedThread: null, visible: false,
  };
}

export default function ThreadPoolAnimation({ threadCount, syncType, onClose }: ThreadPoolAnimationProps) {
  const maxSlots = syncType === 'mutex' ? 1 : 3;
  const [state, setState] = useState<AnimState>({
    phase: 'init', threads: Array.from({ length: threadCount }, (_, i) => makeThread(i + 1)),
    taskQueue: Array.from({ length: 8 }, (_, i) => makeTask(i + 1)),
    completedTasks: [], syncType, lockSlots: maxSlots, occupiedSlots: 0,
    cpuUsage: 0, tick: 0, logs: ['⚡ Synchronization animation started'],
  });

  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  // Phase 1: Spawn threads one by one
  useEffect(() => {
    const t1 = setTimeout(() => {
      setState(s => ({ ...s, phase: 'threads', logs: [...s.logs, '🧵 Creating thread pool...'] }));
      for (let i = 0; i < threadCount; i++) {
        const t = setTimeout(() => {
          setState(s => {
            const threads = s.threads.map((th, idx) =>
              idx === i ? { ...th, visible: true } : th
            );
            return { ...s, threads, logs: [...s.logs, `✅ ${threads[i].name} created`] };
          });
        }, (i + 1) * 500);
        timerRef.current.push(t);
      }
    }, 600);
    timerRef.current.push(t1);
    return clearTimers;
  }, [threadCount, clearTimers]);

  // Phase 2: Show sync mechanism
  useEffect(() => {
    const delay = 600 + (threadCount + 1) * 500 + 400;
    const t = setTimeout(() => {
      setState(s => ({
        ...s, phase: 'sync',
        logs: [...s.logs, `🔒 ${syncType === 'mutex' ? 'Mutex' : 'Semaphore'} initialized (${maxSlots} slot${maxSlots > 1 ? 's' : ''})`],
      }));
    }, delay);
    timerRef.current.push(t);
  }, [threadCount, syncType, maxSlots]);

  // Phase 3: Show task queue
  useEffect(() => {
    const delay = 600 + (threadCount + 1) * 500 + 1500;
    const t = setTimeout(() => {
      setState(s => ({ ...s, phase: 'tasks', logs: [...s.logs, '📋 Filling task queue...'] }));
      for (let i = 0; i < 8; i++) {
        const tt = setTimeout(() => {
          setState(s => {
            const taskQueue = s.taskQueue.map((task, idx) =>
              idx === i ? { ...task, visible: true } : task
            );
            return { ...s, taskQueue, logs: [...s.logs, `📌 Task #${i + 1} [${taskQueue[i].priority}] queued`] };
          });
        }, (i + 1) * 250);
        timerRef.current.push(tt);
      }
    }, delay);
    timerRef.current.push(t);
  }, [threadCount]);

  // Phase 4: Execute — assign tasks to threads, show locks, progress, completion
  useEffect(() => {
    const delay = 600 + (threadCount + 1) * 500 + 1500 + 8 * 250 + 800;
    const t = setTimeout(() => {
      setState(s => ({
        ...s, phase: 'execute',
        logs: [...s.logs, '▶ Execution started — threads picking tasks from queue'],
      }));

      let tick = 0;
      intervalRef.current = setInterval(() => {
        tick++;
        setState(s => {
          if (s.phase === 'done') return s;

          let threads = [...s.threads];
          let taskQueue = [...s.taskQueue];
          let completedTasks = [...s.completedTasks];
          let occupied = s.occupiedSlots;
          let cpu = s.cpuUsage;
          const logs = [...s.logs];

          // Advance running threads
          threads = threads.map(th => {
            if (th.status !== 'running') return th;
            const newProgress = Math.min(100, th.progress + 15 + Math.random() * 10);
            if (newProgress >= 100) {
              // Complete task
              const task = taskQueue.find(t => t.id === th.taskId);
              if (task) {
                taskQueue = taskQueue.map(t => t.id === task.id ? { ...t, status: 'completed' as const } : t);
                completedTasks = [...completedTasks, { ...task, status: 'completed' as const, visible: true }];
              }
              occupied = Math.max(0, occupied - 1);
              logs.push(`✅ [${th.name}] completed Task #${th.taskId} — lock released`);
              return { ...th, status: 'idle' as const, taskId: null, progress: 0, lockHeld: false, tasksCompleted: th.tasksCompleted + 1 };
            }
            return { ...th, progress: newProgress };
          });

          // Assign queued tasks to idle threads
          const queuedTasks = taskQueue.filter(t => t.status === 'queued' && t.visible);
          for (const th of threads) {
            if (th.status !== 'idle' || !th.visible) continue;
            if (queuedTasks.length === 0) break;
            const canAcquire = occupied < s.lockSlots;
            if (!canAcquire) {
              if (th.status === 'idle') {
                const idx = threads.indexOf(th);
                threads[idx] = { ...th, status: 'waiting' as const, waitTime: th.waitTime + 1 };
                if (th.waitTime === 0) logs.push(`⏳ [${th.name}] waiting on ${s.syncType}`);
              }
              continue;
            }
            const nextTask = queuedTasks.shift()!;
            taskQueue = taskQueue.map(t => t.id === nextTask.id ? { ...t, status: 'running' as const, assignedThread: th.id } : t);
            occupied++;
            const idx = threads.indexOf(th);
            threads[idx] = { ...th, status: 'running' as const, taskId: nextTask.id, progress: 0, lockHeld: true, waitTime: 0 };
            logs.push(`🔒 [${th.name}] acquired ${s.syncType} → executing Task #${nextTask.id}`);
          }

          // Update waiting threads that can now acquire
          threads = threads.map(th => {
            if (th.status !== 'waiting') return th;
            if (occupied < s.lockSlots) {
              const nextTask = taskQueue.find(t => t.status === 'queued' && t.visible);
              if (nextTask) {
                taskQueue = taskQueue.map(t => t.id === nextTask.id ? { ...t, status: 'running' as const, assignedThread: th.id } : t);
                occupied++;
                logs.push(`🔓 [${th.name}] acquired ${s.syncType} → executing Task #${nextTask.id}`);
                return { ...th, status: 'running' as const, taskId: nextTask.id, progress: 0, lockHeld: true, waitTime: 0 };
              }
            }
            return { ...th, waitTime: th.waitTime + 1 };
          });

          // CPU usage
          const activeCount = threads.filter(t => t.status === 'running').length;
          cpu = Math.min(100, (activeCount / threads.length) * 100 + Math.random() * 15);

          // Check if all done
          const allCompleted = taskQueue.every(t => t.status === 'completed' || !t.visible);
          const noneRunning = threads.every(t => t.status !== 'running');
          const phase = (allCompleted && noneRunning && completedTasks.length > 0) ? 'done' as const : 'execute' as const;

          if (phase === 'done') {
            logs.push('🎉 All tasks completed! Thread pool synchronization finished.');
          }

          return {
            ...s, threads, taskQueue, completedTasks,
            occupiedSlots: occupied, cpuUsage: cpu,
            tick: s.tick + 1, logs: logs.slice(-30), phase,
          };
        });
      }, 800);
    }, delay);
    timerRef.current.push(t);
  }, [threadCount, syncType, maxSlots]);

  // Cleanup on unmount
  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div className="fixed inset-0 z-50 animate-overlay-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full h-full overflow-y-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-done-emphasis flex items-center justify-center">
              <span className="text-white text-sm">⚡</span>
            </div>
            <div>
              <h2 className="text-base font-mono font-bold text-white">Thread Pool Synchronization</h2>
              <p className="text-[10px] font-mono text-white/60">
                {threadCount} threads · {syncType} · {state.phase}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono px-2 py-1 rounded-full border ${
              state.phase === 'done'
                ? 'bg-success-subtle border-success-muted text-success-fg'
                : 'bg-accent-subtle border-accent-muted text-accent-fg'
            }`}>
              {state.phase === 'done' ? '✓ Complete' : `Phase: ${state.phase}`}
            </span>
            <button onClick={() => { clearTimers(); onClose(); }}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Main animation area */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_200px] gap-4">
          <div className="space-y-3">
            {/* Task Queue */}
            {(state.phase === 'tasks' || state.phase === 'execute' || state.phase === 'done') && (
              <TaskQueue tasks={state.taskQueue} />
            )}

            {/* Flow arrow down */}
            {(state.phase === 'execute' || state.phase === 'done') && <FlowArrow direction="down" />}

            {/* Thread Pool + Sync Panel */}
            <div className="flex flex-wrap items-start gap-4 justify-center">
              {/* Thread Pool */}
              <div className="flex-1 min-w-[300px]">
                <h3 className="text-xs font-mono font-bold text-white mb-3 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-done-fg" />Thread Pool
                </h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {state.threads.map((th, i) => (
                    <ThreadCard key={th.id} thread={th} index={i} />
                  ))}
                </div>
              </div>

              {/* Sync Mechanism */}
              {(state.phase === 'sync' || state.phase === 'tasks' || state.phase === 'execute' || state.phase === 'done') && (
                <div className="flex flex-col items-center gap-3">
                  <SyncPanel syncType={syncType} slots={maxSlots} occupied={state.occupiedSlots} />
                </div>
              )}
            </div>

            {/* Flow arrow down */}
            {(state.phase === 'execute' || state.phase === 'done') && <FlowArrow direction="down" />}

            {/* Completed Tasks */}
            {(state.phase === 'execute' || state.phase === 'done') && (
              <CompletedTasks tasks={state.completedTasks} />
            )}

            {/* Details Table */}
            {state.threads.some(t => t.visible) && (
              <SyncDetailsTable state={state} />
            )}

            {/* Log stream */}
            <div className="bg-[#1e1e2e]/95 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success-emphasis animate-pulse" />
                <span className="text-[10px] font-mono text-white/60">sync.log</span>
              </div>
              <div className="p-3 max-h-[140px] overflow-y-auto font-mono text-[10px] space-y-0.5">
                {state.logs.map((log, i) => (
                  <div key={i} className={`text-white/80 ${i === state.logs.length - 1 ? 'animate-fade-in' : ''}`}>
                    <span className="text-white/40 mr-2">{String(i).padStart(3, '0')}</span>{log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side — CPU Gauge */}
          <div className="hidden xl:flex flex-col items-center gap-4 sticky top-4">
            <CpuGauge usage={state.cpuUsage} />
            <div className="bg-white/90 rounded-xl border border-border p-3 text-center w-full">
              <div className="text-lg font-mono font-bold text-fg">{state.completedTasks.length}</div>
              <div className="text-[9px] font-mono text-fg-subtle">Tasks Done</div>
            </div>
            <div className="bg-white/90 rounded-xl border border-border p-3 text-center w-full">
              <div className="text-lg font-mono font-bold text-fg">{state.tick}</div>
              <div className="text-[9px] font-mono text-fg-subtle">Tick</div>
            </div>
            <div className="bg-white/90 rounded-xl border border-border p-3 text-center w-full">
              <div className="text-lg font-mono font-bold text-fg">
                {state.threads.filter(t => t.status === 'running').length}/{threadCount}
              </div>
              <div className="text-[9px] font-mono text-fg-subtle">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
