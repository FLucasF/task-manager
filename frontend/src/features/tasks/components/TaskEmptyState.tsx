export function TaskEmptyState() {
  return (
    <div
      data-testid="task-empty-state"
      className="flex flex-col items-center rounded-md border border-dashed border-app-border bg-app-surface px-4 py-8 text-center"
    >
      <div
        aria-hidden="true"
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-app-surfaceElevated text-app-textMuted"
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7.5 7 3h10l3 4.5V20H4Z" />
          <path d="M4 8h5l1.5 2h3L15 8h5" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-app-textPrimary">Tudo limpo por aqui!</h3>
      <p className="mt-2 max-w-sm text-sm leading-5 text-app-textSecondary">
        Adicione uma nova tarefa para comecar a organizar seu dia.
      </p>
    </div>
  );
}
