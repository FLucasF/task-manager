import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { Task } from '../types';

type TaskItemProps = {
  task: Task;
  onToggle: (id: number) => void;
  onUpdate: (id: number, title: string) => Promise<void>;
  onDelete: (id: number) => void;
  disabled?: boolean;
};

const TITLE_ERROR = 'O titulo deve ter entre 3 e 100 caracteres.';

export function TaskItem({ task, onToggle, onUpdate, onDelete, disabled = false }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const restoreEditFocusRef = useRef(false);
  const titleId = `task-title-${task.id}`;
  const editInputId = `task-title-edit-${task.id}`;
  const editErrorId = `task-title-edit-error-${task.id}`;
  const toggleLabel = task.completed
    ? `Marcar "${task.title}" como pendente`
    : `Marcar "${task.title}" como concluida`;

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    } else if (restoreEditFocusRef.current) {
      restoreEditFocusRef.current = false;
      editButtonRef.current?.focus();
    }
  }, [isEditing]);

  function startEditing() {
    setDraftTitle(task.title);
    setValidationError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    if (saving) {
      return;
    }
    setDraftTitle(task.title);
    setValidationError(null);
    restoreEditFocusRef.current = true;
    setIsEditing(false);
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = draftTitle.trim();
    if (normalizedTitle.length < 3 || normalizedTitle.length > 100) {
      setValidationError(TITLE_ERROR);
      return;
    }

    setValidationError(null);
    setSaving(true);
    try {
      await onUpdate(task.id, normalizedTitle);
      setIsEditing(false);
    } catch {
      // The shared task error toast reports the failure while the editor stays open.
    } finally {
      setSaving(false);
    }
  }

  return (
    <article
      aria-labelledby={isEditing ? undefined : titleId}
      aria-label={isEditing ? `Editando tarefa "${task.title}"` : undefined}
      className="flex items-center gap-3 rounded-md border border-app-border bg-app-surface p-4 transition-colors duration-150 ease-out hover:bg-app-surfaceHover"
    >
      <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          disabled={disabled || isEditing}
          aria-label={toggleLabel}
          className="h-5 w-5 accent-app-accent transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accentHover focus-visible:ring-offset-2 focus-visible:ring-offset-app-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
      {isEditing ? (
        <form className="flex min-w-0 flex-1 flex-col gap-2" onSubmit={handleUpdate} noValidate>
          <label className="sr-only" htmlFor={editInputId}>
            Editar titulo da tarefa "{task.title}"
          </label>
          <div className="flex min-w-0 gap-2">
            <input
              ref={editInputRef}
              id={editInputId}
              type="text"
              value={draftTitle}
              onChange={(event) => {
                setDraftTitle(event.target.value);
                setValidationError(null);
              }}
              onKeyDown={handleEditKeyDown}
              minLength={3}
              maxLength={100}
              required
              disabled={saving}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? editErrorId : undefined}
              className={`min-h-11 min-w-0 flex-1 rounded-md border bg-app-surfaceElevated px-3 py-2 text-app-textPrimary transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accentHover focus-visible:ring-offset-2 focus-visible:ring-offset-app-background disabled:cursor-not-allowed disabled:opacity-50 ${
                validationError ? 'border-app-danger' : 'border-app-controlBorder'
              }`}
            />
            <button
              type="submit"
              aria-label="Salvar edicao"
              disabled={saving}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-app-accent text-black transition-colors duration-150 ease-out hover:bg-app-accentHover active:bg-app-accentActive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accentHover focus-visible:ring-offset-2 focus-visible:ring-offset-app-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Cancelar edicao"
              onClick={cancelEditing}
              disabled={saving}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-app-textSecondary transition-colors duration-150 ease-out hover:bg-app-surfaceHover active:bg-app-surfaceElevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accentHover focus-visible:ring-offset-2 focus-visible:ring-offset-app-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="m6 6 12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>
          {validationError && (
            <p id={editErrorId} role="alert" className="text-sm text-app-danger">
              {validationError}
            </p>
          )}
        </form>
      ) : (
        <>
          <span
            id={titleId}
            className={`min-w-0 flex-1 break-words text-app-textPrimary ${
              task.completed ? 'line-through' : ''
            }`}
          >
            {task.title}
          </span>
          <button
            ref={editButtonRef}
            type="button"
            aria-label="Editar tarefa"
            onClick={startEditing}
            disabled={disabled}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-app-accent transition-colors duration-150 ease-out hover:bg-app-surfaceHover active:bg-app-surfaceElevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accentHover focus-visible:ring-offset-2 focus-visible:ring-offset-app-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Excluir tarefa"
            onClick={() => onDelete(task.id)}
            disabled={disabled}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-app-danger transition-colors duration-150 ease-out hover:bg-app-dangerSurface active:bg-app-surfaceElevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accentHover focus-visible:ring-offset-2 focus-visible:ring-offset-app-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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
        </>
      )}
    </article>
  );
}
