import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
} from 'react';
import {
  Task,
  Filters,
  SortConfig,
  ViewType,
  Status,
  EMPTY_FILTERS,
  PRIORITY_ORDER,
} from '../types';
import { generateTasks } from '../data/generator';

export interface AppState {
  tasks: Task[];
  view: ViewType;
  filters: Filters;
  sort: SortConfig;
  draggedTaskId: string | null;
}

export type AppAction =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; payload: SortConfig }
  | { type: 'MOVE_TASK'; payload: { taskId: string; status: Status } }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: Status } }
  | { type: 'SET_DRAGGED'; payload: string | null };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: EMPTY_FILTERS };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'MOVE_TASK':
      return {
        ...state,
        draggedTaskId: null,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.taskId ? { ...t, status: action.payload.status } : t
        ),
      };
    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.taskId ? { ...t, status: action.payload.status } : t
        ),
      };
    case 'SET_DRAGGED':
      return { ...state, draggedTaskId: action.payload };
    default:
      return state;
  }
}

function applyFilters(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter((t) => {
    if (filters.status.length && !filters.status.includes(t.status)) return false;
    if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
    if (filters.assignee.length && !filters.assignee.includes(t.assigneeId)) return false;
    if (filters.dueDateFrom && t.dueDate < filters.dueDateFrom) return false;
    if (filters.dueDateTo && t.dueDate > filters.dueDateTo) return false;
    return true;
  });
}

function applySort(tasks: Task[], sort: SortConfig): Task[] {
  return [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sort.field === 'title') cmp = a.title.localeCompare(b.title);
    else if (sort.field === 'priority')
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    else if (sort.field === 'dueDate') cmp = a.dueDate.localeCompare(b.dueDate);
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  filteredTasks: Task[];
  sortedTasks: Task[];
  hasActiveFilters: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    tasks: generateTasks(500),
    view: 'kanban' as ViewType,
    filters: EMPTY_FILTERS,
    sort: { field: 'dueDate', direction: 'asc' } as SortConfig,
    draggedTaskId: null,
  }));

  const filteredTasks = useMemo(
    () => applyFilters(state.tasks, state.filters),
    [state.tasks, state.filters]
  );

  const sortedTasks = useMemo(
    () => applySort(filteredTasks, state.sort),
    [filteredTasks, state.sort]
  );

  const hasActiveFilters = useMemo(() => {
    const f = state.filters;
    return (
      f.status.length > 0 ||
      f.priority.length > 0 ||
      f.assignee.length > 0 ||
      !!f.dueDateFrom ||
      !!f.dueDateTo
    );
  }, [state.filters]);

  return (
    <AppContext.Provider value={{ state, dispatch, filteredTasks, sortedTasks, hasActiveFilters }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
