import { useState, useEffect, useRef } from 'react';
import { CollabUser } from '../types';

const COLLAB_POOL: CollabUser[] = [
  { id: 'cu1', name: 'Tom Baker', color: '#3b82f6', initials: 'TB', currentTaskId: null },
  { id: 'cu2', name: 'Lisa Park', color: '#ec4899', initials: 'LP', currentTaskId: null },
  { id: 'cu3', name: 'Ravi Kumar', color: '#10b981', initials: 'RK', currentTaskId: null },
];

const MOVE_INTERVAL_MS = 2500;

export function useCollaboration(taskIds: string[]) {
  const taskIdsRef = useRef<string[]>(taskIds);
  taskIdsRef.current = taskIds;

  const [collabUsers, setCollabUsers] = useState<CollabUser[]>(() =>
    COLLAB_POOL.map((u) => ({ ...u }))
  );

  // Assign each user to a random task whenever taskIds first become available
  const initialised = useRef(false);
  useEffect(() => {
    if (taskIds.length === 0) return;
    if (initialised.current) return;
    initialised.current = true;

    setCollabUsers((prev) =>
      prev.map((u) => ({
        ...u,
        currentTaskId: taskIds[Math.floor(Math.random() * taskIds.length)],
      }))
    );
  }, [taskIds]);

  // Periodically move a random user to a different random task
  useEffect(() => {
    const interval = setInterval(() => {
      const ids = taskIdsRef.current;
      if (ids.length === 0) return;

      setCollabUsers((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const newTaskId = ids[Math.floor(Math.random() * ids.length)];
        return prev.map((u, i) =>
          i === idx ? { ...u, currentTaskId: newTaskId } : u
        );
      });
    }, MOVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return { collabUsers };
}
