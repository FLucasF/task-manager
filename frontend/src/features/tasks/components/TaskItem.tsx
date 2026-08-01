import type { Task } from '../types';

type TaskItemProps = {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
};

export function TaskItem({ task, onToggle, onDelete, disabled = false }: TaskItemProps) {
  const titleId = `task-title-${task.id}`;
  const toggleLabel = task.completed
    ? `Marcar "${task.title}" como pendente`
    : `Marcar "${task.title}" como concluida`;

  return (
    <article
      aria-labelledby={titleId}
      className="flex items-center gap-3 rounded-md border border-app-border bg-app-surface p-4"
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        disabled={disabled}
        aria-label={toggleLabel}
        className="h-5 w-5 accent-app-accent disabled:cursor-not-allowed disabled:opacity-50"
      />
      <span
        id={titleId}
        className={`flex-1 text-app-textPrimary ${task.completed ? 'line-through' : ''}`}
      >
        {task.title}
      </span>
      <button
        type="button"
        aria-label="Excluir tarefa"
        onClick={() => onDelete(task.id)}
        disabled={disabled}
        className="flex h-11 w-11 items-center justify-center rounded-md text-app-danger disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      </button>
    </article>
  );
}
