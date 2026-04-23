import type { Thread, Task, Metrics } from '@/types';

/**
 * Compute a simulated CPU usage percentage based on active/total threads
 * and queue depth, with some jitter for realism.
 */
export function computeCpuUsage(
  threads: Thread[],
  queueDepth: number
): number {
  const activeCount = threads.filter((t) => t.status === 'running').length;
  const base = threads.length === 0 ? 0 : (activeCount / threads.length) * 100;
  const queuePressure = Math.min(queueDepth * 2, 20);
  const jitter = (Math.random() - 0.5) * 6;
  return Math.min(100, Math.max(0, base + queuePressure + jitter));
}

/**
 * Build a full Metrics snapshot from current simulation state.
 */
export function buildMetricsSnapshot(
  threads: Thread[],
  taskQueue: Task[],
  completedTasks: Task[],
  tick: number
): Metrics {
  const activeThreads = threads.filter((t) => t.status === 'running').length;
  const queueDepth = taskQueue.filter((t) => t.status === 'queued').length;

  const totalLatency = completedTasks.reduce((sum, t) => {
    const latency = (t.completionTime ?? tick) - (t.startTime ?? tick);
    return sum + latency;
  }, 0);
  const avgLatency = completedTasks.length > 0 ? totalLatency / completedTasks.length : 0;
  const cpuUsage = computeCpuUsage(threads, queueDepth);

  return {
    tasksExecuted: completedTasks.length,
    avgLatency: Math.round(avgLatency * 100) / 100,
    activeThreads,
    queueDepth,
    cpuUsage: Math.round(cpuUsage * 10) / 10,
    throughput: completedTasks.length,
    timestamp: tick,
  };
}

/**
 * Keep metrics history capped at the last N snapshots.
 */
export function appendMetricsHistory(
  history: Metrics[],
  snapshot: Metrics,
  maxLength = 40
): Metrics[] {
  const updated = [...history, snapshot];
  return updated.length > maxLength ? updated.slice(updated.length - maxLength) : updated;
}
