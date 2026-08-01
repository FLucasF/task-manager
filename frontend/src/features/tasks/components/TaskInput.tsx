import { useState, type FormEvent } from 'react';

type TaskInputProps = {
  onSubmit: (title: string) => void;
  disabled?: boolean;
  error?: string | null;
};

const TITLE_ERROR = 'O titulo deve ter entre 3 e 100 caracteres.';

export function TaskInput({ onSubmit, disabled = false, error = null }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const displayedError = validationError ?? error;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    if (normalizedTitle.length < 3 || normalizedTitle.length > 100) {
      setValidationError(TITLE_ERROR);
      return;
    }

    setValidationError(null);
    onSubmit(normalizedTitle);
    setTitle('');
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
      <label className="text-sm font-medium text-app-textPrimary" htmlFor="task-title">
        Titulo da tarefa
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="task-title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setValidationError(null);
          }}
          placeholder="Ex.: Revisar contrato OpenAPI"
          required
          minLength={3}
          maxLength={100}
          disabled={disabled}
          aria-invalid={Boolean(displayedError)}
          aria-describedby={displayedError ? 'task-title-error' : undefined}
          className={`min-h-11 flex-1 rounded-md border bg-app-surfaceElevated px-4 py-2 text-app-textPrimary placeholder:text-app-textMuted disabled:cursor-not-allowed disabled:opacity-50 ${
            displayedError ? 'border-app-danger' : 'border-app-border'
          }`}
        />
        <button
          type="submit"
          disabled={disabled}
          className="min-h-11 rounded-md bg-app-accent px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Adicionar
        </button>
      </div>
      {displayedError && (
        <p id="task-title-error" role="alert" className="text-sm text-app-danger">
          {displayedError}
        </p>
      )}
    </form>
  );
}
