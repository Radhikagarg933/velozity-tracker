import { useEffect } from 'react';
import { Filters, Status, Priority, STATUSES, PRIORITIES, ViewType } from '../types';
import { useApp } from '../context/AppContext';

function parseArray<T extends string>(
  raw: string | null,
  allowed: readonly T[]
): T[] {
  if (!raw) return [];
  return raw
    .split(',')
    .filter((v): v is T => allowed.includes(v as T));
}

export function filtersToParams(filters: Filters, view: ViewType): URLSearchParams {
  const p = new URLSearchParams();
  p.set('view', view);
  if (filters.status.length) p.set('status', filters.status.join(','));
  if (filters.priority.length) p.set('priority', filters.priority.join(','));
  if (filters.assignee.length) p.set('assignee', filters.assignee.join(','));
  if (filters.dueDateFrom) p.set('from', filters.dueDateFrom);
  if (filters.dueDateTo) p.set('to', filters.dueDateTo);
  return p;
}

function readFiltersFromURL(): { filters: Partial<Filters>; view: ViewType | null } {
  const p = new URLSearchParams(window.location.search);
  const filters: Partial<Filters> = {
    status: parseArray(p.get('status'), STATUSES),
    priority: parseArray(p.get('priority'), PRIORITIES),
    assignee: p.get('assignee')?.split(',').filter(Boolean) ?? [],
    dueDateFrom: p.get('from') ?? '',
    dueDateTo: p.get('to') ?? '',
  };
  const viewParam = p.get('view');
  const view: ViewType | null =
    viewParam === 'kanban' || viewParam === 'list' || viewParam === 'timeline'
      ? viewParam
      : null;
  return { filters, view };
}

export function useUrlFilters() {
  const { state, dispatch } = useApp();

  // On mount — read URL and hydrate state
  useEffect(() => {
    const { filters, view } = readFiltersFromURL();
    dispatch({ type: 'SET_FILTERS', payload: filters });
    if (view) dispatch({ type: 'SET_VIEW', payload: view });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with state changes
  useEffect(() => {
    const params = filtersToParams(state.filters, state.view);
    const search = params.toString();
    const url = search ? `?${search}` : window.location.pathname;
    window.history.replaceState({}, '', url);
  }, [state.filters, state.view]);

  // Browser back/forward button support
  useEffect(() => {
    const onPopState = () => {
      const { filters, view } = readFiltersFromURL();
      dispatch({ type: 'SET_FILTERS', payload: filters });
      if (view) dispatch({ type: 'SET_VIEW', payload: view });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
