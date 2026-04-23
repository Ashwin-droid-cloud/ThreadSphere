import type { Task, SchedulerAlgorithm } from '@/types';

/**
 * FIFO: returns the task that arrived earliest (lowest id / arrivalTime).
 */
function fifoSelect(queue: Task[]): Task | null {
  if (queue.length === 0) return null;
  return queue.reduce((earliest, t) =>
    t.arrivalTime < earliest.arrivalTime ? t : earliest
  );
}

/**
 * Priority: returns the task with the highest priorityValue (1–10).
 * Ties broken by arrivalTime (earlier wins).
 */
function prioritySelect(queue: Task[]): Task | null {
  if (queue.length === 0) return null;
  return queue.reduce((best, t) => {
    if (t.priorityValue > best.priorityValue) return t;
    if (t.priorityValue === best.priorityValue && t.arrivalTime < best.arrivalTime) return t;
    return best;
  });
}

/**
 * Main scheduler entry — picks the next queued task from the queue.
 */
export function getNextTask(
  queue: Task[],
  algorithm: SchedulerAlgorithm
): Task | null {
  const queued = queue.filter((t) => t.status === 'queued');
  if (algorithm === 'FIFO') return fifoSelect(queued);
  return prioritySelect(queued);
}

/**
 * Reorder the visible task queue for display purposes.
 */
export function getSortedQueue(queue: Task[], algorithm: SchedulerAlgorithm): Task[] {
  const queued = queue.filter((t) => t.status === 'queued');
  if (algorithm === 'FIFO') {
    return [...queued].sort((a, b) => a.arrivalTime - b.arrivalTime);
  }
  return [...queued].sort((a, b) => {
    if (b.priorityValue !== a.priorityValue) return b.priorityValue - a.priorityValue;
    return a.arrivalTime - b.arrivalTime;
  });
}
