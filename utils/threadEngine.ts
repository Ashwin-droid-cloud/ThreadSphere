import type { Thread, Task, TaskPriority } from '@/types';

const THREAD_COLORS = [
  '#0969da', '#1a7f37', '#8250df', '#9a6700', '#cf222e',
  '#0a5d6b', '#b35900', '#5a32a3', '#0f7e5a', '#bc4c00',
  '#125fd7', '#2da44e', '#9a3fcf', '#cf9600', '#d93f0b',
  '#0756c8',
];

/**
 * Create a fresh thread object.
 */
export function createThread(id: number): Thread {
  return {
    id,
    name: `Thread-${id}`,
    status: 'idle',
    currentTaskId: null,
    tasksCompleted: 0,
    totalLatency: 0,
    holdingSyncSlot: false,
    waitingSyncQueue: false,
    color: THREAD_COLORS[(id - 1) % THREAD_COLORS.length],
  };
}

/**
 * Build initial thread pool.
 */
export function buildThreadPool(count: number): Thread[] {
  return Array.from({ length: count }, (_, i) => createThread(i + 1));
}

/**
 * Generate a new task with randomised properties.
 */
export function generateTask(id: number, tick: number): Task {
  const priorities: TaskPriority[] = ['low', 'medium', 'high'];
  const priority = priorities[Math.floor(Math.random() * 3)];
  const priorityValue =
    priority === 'high' ? 7 + Math.floor(Math.random() * 4)
    : priority === 'medium' ? 4 + Math.floor(Math.random() * 3)
    : 1 + Math.floor(Math.random() * 3);

  // execution duration: 2–10 ticks
  const executionDuration = 2 + Math.floor(Math.random() * 9);

  return {
    id,
    priority,
    priorityValue,
    arrivalTime: tick,
    startTime: null,
    completionTime: null,
    executionDuration,
    ticksRemaining: executionDuration,
    assignedThreadId: null,
    status: 'queued',
  };
}

/**
 * Assign a task to a thread (mutates copies, caller must spread).
 */
export function assignTaskToThread(
  thread: Thread,
  task: Task,
  tick: number
): { thread: Thread; task: Task } {
  return {
    thread: { ...thread, status: 'running', currentTaskId: task.id },
    task: {
      ...task,
      status: 'running',
      startTime: tick,
      assignedThreadId: thread.id,
      ticksRemaining: task.executionDuration,
    },
  };
}

/**
 * Complete a task on a thread.
 */
export function completeTask(
  thread: Thread,
  task: Task,
  tick: number
): { thread: Thread; task: Task } {
  const latency = tick - (task.startTime ?? tick);
  return {
    thread: {
      ...thread,
      status: 'idle',
      currentTaskId: null,
      tasksCompleted: thread.tasksCompleted + 1,
      totalLatency: thread.totalLatency + latency,
    },
    task: {
      ...task,
      status: 'completed',
      completionTime: tick,
    },
  };
}
