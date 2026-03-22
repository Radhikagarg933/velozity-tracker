import React, { useMemo } from 'react';
import { useApp } from './context/AppContext';
import { useUrlFilters } from './hooks/useUrlFilters';
import { useCollaboration } from './hooks/useCollaboration';
import { Header } from './components/Header/Header';
import { FilterBar } from './components/FilterBar/FilterBar';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { ListView } from './components/List/ListView';
import { TimelineView } from './components/Timeline/TimelineView';

function AppInner() {
  const { state, filteredTasks } = useApp();

  useUrlFilters();

  const taskIds = useMemo(() => filteredTasks.map((t) => t.id), [filteredTasks]);
  const { collabUsers } = useCollaboration(taskIds);

  return (
    <div className="h-screen flex flex-col bg-base-950 overflow-hidden">
      <Header collabUsers={collabUsers} />
      <FilterBar />
      <main className="flex-1 overflow-hidden">
        {state.view === 'kanban' && <KanbanBoard collabUsers={collabUsers} />}
        {state.view === 'list' && <ListView collabUsers={collabUsers} />}
        {state.view === 'timeline' && <TimelineView collabUsers={collabUsers} />}
      </main>
    </div>
  );
}

export default function App() {
  return <AppInner />;
}
