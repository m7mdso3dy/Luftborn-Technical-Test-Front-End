export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type ChangeType = 'positive' | 'negative' | 'neutral';

export interface Statistic {
  id: string;
  title: string;
  icon: 'tasks' | 'completed' | 'in_progress' | 'overdue';
  value: number;
  change: string;
  changeLabel: string;
  changeType: ChangeType;
  color: string;
}

export interface StatisticsResponse {
  statistics: Statistic[];
  lastUpdated: string;
}

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO 8601 date (date-only or full); used for overdue / display logic when set. */
  dueAt?: string;
  dueDate: string;
  isOverdue: boolean;
  overdueBy?: string;
  completedAt: string;
  assignee: Assignee;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  tasks: Task[];
  meta: {
    totalCount: number;
    lastUpdated: string;
  };
}
