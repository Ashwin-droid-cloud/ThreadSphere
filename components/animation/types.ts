import type { SyncType } from '@/types';

export type AnimPhase = 'init' | 'threads' | 'sync' | 'tasks' | 'execute' | 'done';

export interface AnimThread {
  id: number;
  name: string;
  color: string;
  status: 'idle' | 'running' | 'waiting' | 'completed';
  taskId: number | null;
  progress: number;
  lockHeld: boolean;
  waitTime: number;
  tasksCompleted: number;
  visible: boolean;
}

export interface AnimTask {
  id: number;
  priority: 'low' | 'medium' | 'high';
  status: 'queued' | 'moving' | 'running' | 'completed';
  assignedThread: number | null;
  visible: boolean;
}

export interface AnimState {
  phase: AnimPhase;
  threads: AnimThread[];
  taskQueue: AnimTask[];
  completedTasks: AnimTask[];
  syncType: SyncType;
  lockSlots: number;
  occupiedSlots: number;
  cpuUsage: number;
  tick: number;
  logs: string[];
}

export interface ThreadPoolAnimationProps {
  threadCount: number;
  syncType: SyncType;
  onClose: () => void;
}
