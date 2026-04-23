'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  SimulationState,
  Thread,
  Task,
  LogEntry,
  SchedulerAlgorithm,
  SyncType,
  SyncResource,
  Metrics,
} from '@/types';
import { buildThreadPool, generateTask, createThread } from '@/utils/threadEngine';
import { getNextTask } from '@/utils/scheduler';
import { buildMetricsSnapshot, appendMetricsHistory } from '@/utils/metrics';

// ─── Constants ─────────────────────────────────────────────────────────────
const TICK_MS = 250;           // simulation tick interval
const TASKS_PER_TICK = 0.4;   // avg tasks added per tick (probabilistic)
const MAX_LOGS = 500;
const MAX_QUEUE = 30;
const SEMAPHORE_SLOTS = 3;

// ─── Helpers ───────────────────────────────────────────────────────────────
function makeLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeLog(
  level: LogEntry['level'],
  message: string,
  threadId: number | null = null,
  tick = 0
): LogEntry {
  return { id: makeLogId(), timestamp: tick, threadId, message, level };
}

function buildInitialSyncResource(type: SyncType): SyncResource {
  return {
    type,
    maxSlots: type === 'mutex' ? 1 : SEMAPHORE_SLOTS,
    occupiedSlots: 0,
    waitingThreadIds: [],
    holdingThreadIds: [],
  };
}

function buildInitialMetrics(): Metrics {
  return {
    tasksExecuted: 0,
    avgLatency: 0,
    activeThreads: 0,
    queueDepth: 0,
    cpuUsage: 0,
    throughput: 0,
    timestamp: 0,
  };
}

function buildInitialState(threadCount: number, syncType: SyncType, algorithm: SchedulerAlgorithm): SimulationState {
  return {
    threads: buildThreadPool(threadCount),
    taskQueue: [],
    completedTasks: [],
    syncResource: buildInitialSyncResource(syncType),
    metrics: buildInitialMetrics(),
    metricsHistory: [],
    logs: [makeLog('system', '⚡ ThreadSphere initialized. Click Simulate to begin.', null, 0)],
    isRunning: false,
    isPaused: false,
    schedulerAlgorithm: algorithm,
    syncType,
    taskCounter: 0,
    threadCount,
    tick: 0,
  };
}

// ─── Main Hook ─────────────────────────────────────────────────────────────
export function useThreadEngine() {
  const [state, setState] = useState<SimulationState>(() =>
    buildInitialState(4, 'mutex', 'FIFO')
  );

  // Use a ref for the interval so we can clear it without deps issues
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Tick Logic ────────────────────────────────────────────────────────
  const runTick = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || prev.isPaused) return prev;

      let threads = [...prev.threads];
      let taskQueue = [...prev.taskQueue];
      const completedTasks = [...prev.completedTasks];
      const newLogs: LogEntry[] = [];
      let { taskCounter, tick } = prev;
      let syncResource = { ...prev.syncResource, waitingThreadIds: [...prev.syncResource.waitingThreadIds], holdingThreadIds: [...prev.syncResource.holdingThreadIds] };

      tick += 1;

      // ── 1. Generate new tasks probabilistically ────────────────────
      if (taskQueue.filter((t) => t.status === 'queued').length < MAX_QUEUE) {
        const tasksToAdd = Math.random() < TASKS_PER_TICK ? 1 : 0;
        for (let i = 0; i < tasksToAdd; i++) {
          taskCounter += 1;
          const task = generateTask(taskCounter, tick);
          taskQueue.push(task);
          newLogs.push(makeLog('info', `Task #${task.id} [${task.priority}] queued (priority ${task.priorityValue})`, null, tick));
        }
      }

      // ── 2. Advance running tasks (decrement ticks remaining) ───────
      threads = threads.map((thread) => {
        if (thread.status !== 'running') return thread;
        const taskIdx = taskQueue.findIndex((t) => t.id === thread.currentTaskId && t.status === 'running');
        if (taskIdx === -1) return thread;
        const task = taskQueue[taskIdx];
        const newTicks = task.ticksRemaining - 1;

        if (newTicks <= 0) {
          // Task complete
          const latency = tick - (task.startTime ?? tick);
          completedTasks.push({ ...task, status: 'completed', completionTime: tick, ticksRemaining: 0 });
          taskQueue[taskIdx] = { ...task, status: 'completed', completionTime: tick, ticksRemaining: 0 };

          // Release sync slot if held
          let updatedSync = syncResource;
          if (thread.holdingSyncSlot) {
            updatedSync = {
              ...syncResource,
              occupiedSlots: Math.max(0, syncResource.occupiedSlots - 1),
              holdingThreadIds: syncResource.holdingThreadIds.filter((id) => id !== thread.id),
            };
            syncResource = updatedSync;
          }

          newLogs.push(makeLog('success', `[${thread.name}] completed Task #${task.id} in ${latency} ticks`, thread.id, tick));
          return {
            ...thread,
            status: 'idle',
            currentTaskId: null,
            tasksCompleted: thread.tasksCompleted + 1,
            totalLatency: thread.totalLatency + latency,
            holdingSyncSlot: false,
            waitingSyncQueue: false,
          };
        }

        taskQueue[taskIdx] = { ...task, ticksRemaining: newTicks };
        return thread;
      });

      // ── 3. Release waiting threads if sync slots freed ─────────────
      // (handled below when assigning)

      // ── 4. Assign tasks to idle threads ───────────────────────────
      for (let i = 0; i < threads.length; i++) {
        if (threads[i].status !== 'idle') continue;

        const thread = threads[i];

        // Check sync resource availability
        const canAcquireSync = syncResource.occupiedSlots < syncResource.maxSlots;

        if (!canAcquireSync) {
          // Put thread in waiting state for sync
          if (!syncResource.waitingThreadIds.includes(thread.id)) {
            syncResource = {
              ...syncResource,
              waitingThreadIds: [...syncResource.waitingThreadIds, thread.id],
            };
            threads[i] = { ...thread, status: 'waiting', waitingSyncQueue: true };
            newLogs.push(makeLog('warn', `[${thread.name}] waiting on ${syncResource.type}`, thread.id, tick));
          }
          continue;
        }

        // Remove from waiting if it was there
        if (syncResource.waitingThreadIds.includes(thread.id)) {
          syncResource = {
            ...syncResource,
            waitingThreadIds: syncResource.waitingThreadIds.filter((id) => id !== thread.id),
          };
        }

        const nextTask = getNextTask(taskQueue, prev.schedulerAlgorithm);
        if (!nextTask) continue;

        // Acquire sync slot
        syncResource = {
          ...syncResource,
          occupiedSlots: syncResource.occupiedSlots + 1,
          holdingThreadIds: [...syncResource.holdingThreadIds, thread.id],
        };

        const taskIdx = taskQueue.findIndex((t) => t.id === nextTask.id);
        taskQueue[taskIdx] = {
          ...nextTask,
          status: 'running',
          startTime: tick,
          assignedThreadId: thread.id,
        };

        threads[i] = {
          ...thread,
          status: 'running',
          currentTaskId: nextTask.id,
          holdingSyncSlot: true,
          waitingSyncQueue: false,
        };

        newLogs.push(
          makeLog('info', `[${thread.name}] picked Task #${nextTask.id} [${nextTask.priority}]`, thread.id, tick)
        );
      }

      // ── 5. Build metrics ────────────────────────────────────────────
      const metrics = buildMetricsSnapshot(threads, taskQueue, completedTasks, tick);
      const metricsHistory = appendMetricsHistory(prev.metricsHistory, metrics);

      // ── 6. Merge logs (cap at MAX_LOGS) ────────────────────────────
      const allLogs = [...prev.logs, ...newLogs];
      const logs = allLogs.length > MAX_LOGS ? allLogs.slice(allLogs.length - MAX_LOGS) : allLogs;

      return {
        ...prev,
        threads,
        taskQueue,
        completedTasks,
        syncResource,
        metrics,
        metricsHistory,
        logs,
        taskCounter,
        tick,
      };
    });
  }, []);

  // ── Interval management ───────────────────────────────────────────────
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(runTick, TICK_MS);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, state.isPaused, runTick]);

  // ── Control Actions ───────────────────────────────────────────────────
  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      logs: [
        ...prev.logs,
        makeLog('system', `▶ Simulation started — ${prev.threadCount} threads, ${prev.schedulerAlgorithm} scheduler`, null, prev.tick),
      ],
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
      logs: [
        ...prev.logs,
        makeLog('warn', prev.isPaused ? '▶ Simulation resumed.' : '⏸ Simulation paused.', null, prev.tick),
      ],
    }));
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => buildInitialState(prev.threadCount, prev.syncType, prev.schedulerAlgorithm));
  }, []);

  const setThreadCount = useCallback((count: number) => {
    setState((prev) => {
      // Keep existing threads where possible; add/remove to reach new count
      const existing = prev.threads.slice(0, count);
      const additional = count > prev.threads.length
        ? Array.from({ length: count - prev.threads.length }, (_, i) =>
            createThread(prev.threads.length + i + 1)
          )
        : [];
      const threads = [...existing, ...additional];
      return {
        ...prev,
        threads,
        threadCount: count,
        logs: [
          ...prev.logs,
          makeLog('system', `⚙ Thread count changed to ${count}`, null, prev.tick),
        ],
      };
    });
  }, []);

  const setAlgorithm = useCallback((algorithm: SchedulerAlgorithm) => {
    setState((prev) => ({
      ...prev,
      schedulerAlgorithm: algorithm,
      logs: [
        ...prev.logs,
        makeLog('system', `🔀 Scheduler switched to ${algorithm}`, null, prev.tick),
      ],
    }));
  }, []);

  const setSyncType = useCallback((syncType: SyncType) => {
    setState((prev) => ({
      ...prev,
      syncType,
      syncResource: buildInitialSyncResource(syncType),
      logs: [
        ...prev.logs,
        makeLog('system', `🔒 Sync primitive switched to ${syncType} (max=${syncType === 'mutex' ? 1 : SEMAPHORE_SLOTS})`, null, prev.tick),
      ],
    }));
  }, []);

  return {
    state,
    start,
    pause,
    reset,
    setThreadCount,
    setAlgorithm,
    setSyncType,
  };
}
