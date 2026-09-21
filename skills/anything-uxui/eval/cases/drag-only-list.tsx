// Task list with drag-to-reorder.
import { useState } from 'react';

type Task = { id: string; title: string };

export function TaskOrder({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState(initial);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function move(fromId: string, toIndex: number) {
    setTasks((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((t) => t.id === fromId);
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map((task, index) => (
        <li
          key={task.id}
          draggable
          onDragStart={() => setDraggingId(task.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (draggingId) move(draggingId, index);
            setDraggingId(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minHeight: 44,
            padding: '0 12px',
            border: '1px solid #e5e7eb',
            cursor: 'grab',
            opacity: draggingId === task.id ? 0.5 : 1,
          }}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <circle cx="6" cy="4" r="1.2" /><circle cx="10" cy="4" r="1.2" />
            <circle cx="6" cy="8" r="1.2" /><circle cx="10" cy="8" r="1.2" />
            <circle cx="6" cy="12" r="1.2" /><circle cx="10" cy="12" r="1.2" />
          </svg>
          <span>{task.title}</span>
        </li>
      ))}
    </ul>
  );
}
