export interface Strategy {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Initiative {
  id: string;
  name: string;
  description?: string;
  strategyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  initiativeId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assignee?: string;
  priority: number;
  estimate?: number;
  due?: Date;
  status: string;
  dependencies?: string;
  kpiLinks?: string;
  riskFlags?: string;
  aiReasoning?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  taskId: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Kpi {
  id: string;
  name: string;
  target: number;
  current: number;
  strategyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceRisk {
  id: string;
  entityType: string;
  entityId: string;
  sensitiveWords?: string;
  riskLevel: string;
  suggestions?: string;
  createdAt: Date;
}

export interface AIPriorityRequest {
  taskId: string;
  kpiWeights: Record<string, number>;
  urgency: number;
  effort: number;
  risk: number;
  dependencyCriticality: number;
}

export interface AIPriorityResponse {
  priority: number;
  reasoning: string;
  confidence: number;
}

export interface AISchedulingRequest {
  taskId: string;
  estimate: number;
  dependencies: string[];
  hardDeadline?: Date;
  teamCalendar?: string[];
  prayerWeekendRules?: boolean;
}

export interface AISchedulingResponse {
  recommendedStart: Date;
  recommendedEnd: Date;
  conflicts: string[];
  suggestions: string[];
}