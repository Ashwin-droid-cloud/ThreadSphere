// ─── Thread Types ──────────────────────────────────────────────────────────
export type ThreadStatus = 'idle' | 'running' | 'blocked' | 'waiting';
export type SchedulerAlgorithm = 'FIFO' | 'Priority';
export type SyncType = 'mutex' | 'semaphore';
export type TaskPriority = 'low' | 'medium' | 'high';
export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'system';

export interface Thread {
  id: number;
  name: string;
  status: ThreadStatus;
  currentTaskId: number | null;
  tasksCompleted: number;
  totalLatency: number;
  holdingSyncSlot: boolean;
  waitingSyncQueue: boolean;
  color: string;
}

// ─── Task Types ────────────────────────────────────────────────────────────
export interface Task {
  id: number;
  priority: TaskPriority;
  priorityValue: number; // 1–10
  arrivalTime: number;
  startTime: number | null;
  completionTime: number | null;
  executionDuration: number; // ms (simulated ticks)
  ticksRemaining: number;
  assignedThreadId: number | null;
  status: 'queued' | 'running' | 'completed';
}

// ─── Sync Resource ─────────────────────────────────────────────────────────
export interface SyncResource {
  type: SyncType;
  maxSlots: number;
  occupiedSlots: number;
  waitingThreadIds: number[];
  holdingThreadIds: number[];
}

// ─── Metrics ───────────────────────────────────────────────────────────────
export interface Metrics {
  tasksExecuted: number;
  avgLatency: number;
  activeThreads: number;
  queueDepth: number;
  cpuUsage: number;
  throughput: number;
  timestamp: number;
}

// ─── Log ───────────────────────────────────────────────────────────────────
export interface LogEntry {
  id: string;
  timestamp: number;
  threadId: number | null;
  message: string;
  level: LogLevel;
}

// ─── Full Simulation State ─────────────────────────────────────────────────
export interface SimulationState {
  threads: Thread[];
  taskQueue: Task[];
  completedTasks: Task[];
  syncResource: SyncResource;
  metrics: Metrics;
  metricsHistory: Metrics[];
  logs: LogEntry[];
  isRunning: boolean;
  isPaused: boolean;
  schedulerAlgorithm: SchedulerAlgorithm;
  syncType: SyncType;
  taskCounter: number;
  threadCount: number;
  tick: number;
}

// ─── Control Actions ───────────────────────────────────────────────────────
export type SimulationAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SET_THREAD_COUNT'; count: number }
  | { type: 'SET_ALGORITHM'; algorithm: SchedulerAlgorithm }
  | { type: 'SET_SYNC_TYPE'; syncType: SyncType }
  | { type: 'TICK' };
