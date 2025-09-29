export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assignee?: string;
  priority: number;
  estimate?: number;
  due?: string;
  status: string;
  dependencies?: string;
  kpiLinks?: string;
  riskFlags?: string;
  aiReasoning?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    description?: string;
  };
  subtasks: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  taskId: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}