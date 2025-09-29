import { create } from 'zustand';

// 定义数据类型
interface Strategy {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  kpis: Kpi[];
  initiatives: Initiative[];
}

interface Initiative {
  id: string;
  name: string;
  description?: string;
  strategyId: string;
  createdAt: string;
  updatedAt: string;
  strategy?: Strategy;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
  description?: string;
  initiativeId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  initiative?: Initiative;
  tasks: Task[];
}

interface Task {
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
  project?: Project;
  subtasks: Subtask[];
}

interface CalendarBlock {
  id: string;
  taskId: string;
  userId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  priority: number;
  progress: number;
  isRecurring: boolean;
  recurringRule?: string;
  aiReasoning?: string;
  conflictLevel: string;
  conflictInfo?: string;
  createdAt: string;
  updatedAt: string;
  task?: Task;
}

interface Subtask {
  id: string;
  title: string;
  description?: string;
  taskId: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Kpi {
  id: string;
  name: string;
  target: number;
  current: number;
  strategyId: string;
  createdAt: string;
  updatedAt: string;
  strategy?: Strategy;
}

interface StoreState {
  // 数据状态
  strategies: Strategy[];
  initiatives: Initiative[];
  projects: Project[];
  tasks: Task[];
  kpis: Kpi[];
  calendarBlocks: CalendarBlock[];

  // 加载状态
  loading: boolean;
  error: string | null;

  // 操作方法
  setStrategies: (strategies: Strategy[]) => void;
  addStrategy: (strategy: Strategy) => void;
  updateStrategy: (id: string, strategy: Partial<Strategy>) => void;
  deleteStrategy: (id: string) => void;

  setInitiatives: (initiatives: Initiative[]) => void;
  addInitiative: (initiative: Initiative) => void;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  setKpis: (kpis: Kpi[]) => void;
  addKpi: (kpi: Kpi) => void;
  updateKpi: (id: string, kpi: Partial<Kpi>) => void;
  deleteKpi: (id: string) => void;

  setCalendarBlocks: (blocks: CalendarBlock[]) => void;
  addCalendarBlock: (block: CalendarBlock) => void;
  updateCalendarBlock: (id: string, block: Partial<CalendarBlock>) => void;
  deleteCalendarBlock: (id: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStore = create<StoreState>((set) => ({
  // 初始状态
  strategies: [],
  initiatives: [],
  projects: [],
  tasks: [],
  kpis: [],
  calendarBlocks: [],
  loading: false,
  error: null,

  // 操作方法
  setStrategies: (strategies) => set({ strategies }),
  addStrategy: (strategy) => set((state) => ({
    strategies: [...state.strategies, strategy]
  })),
  updateStrategy: (id, updates) => set((state) => ({
    strategies: state.strategies.map(s =>
      s.id === id ? { ...s, ...updates } : s
    )
  })),
  deleteStrategy: (id) => set((state) => ({
    strategies: state.strategies.filter(s => s.id !== id)
  })),

  setInitiatives: (initiatives) => set({ initiatives }),
  addInitiative: (initiative) => set((state) => ({
    initiatives: [...state.initiatives, initiative]
  })),

  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === id ? { ...t, ...updates } : t
    )
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),

  setKpis: (kpis) => set({ kpis }),
  addKpi: (kpi) => set((state) => ({
    kpis: [...state.kpis, kpi]
  })),
  updateKpi: (id, updates) => set((state) => ({
    kpis: state.kpis.map(k =>
      k.id === id ? { ...k, ...updates } : k
    )
  })),
  deleteKpi: (id) => set((state) => ({
    kpis: state.kpis.filter(k => k.id !== id)
  })),

  setCalendarBlocks: (blocks) => set({ calendarBlocks: blocks }),
  addCalendarBlock: (block) => set((state) => ({
    calendarBlocks: [...state.calendarBlocks, block]
  })),
  updateCalendarBlock: (id, updates) => set((state) => ({
    calendarBlocks: state.calendarBlocks.map(b =>
      b.id === id ? { ...b, ...updates } : b
    )
  })),
  deleteCalendarBlock: (id) => set((state) => ({
    calendarBlocks: state.calendarBlocks.filter(b => b.id !== id)
  })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));