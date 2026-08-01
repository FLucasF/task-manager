const SKELETON_ITEMS = [1, 2, 3];

export function TaskSkeletonList() {
  return (
    <div role="status" aria-label="Carregando tarefas">
      <span className="sr-only">Carregando tarefas</span>
      <div aria-hidden="true" className="flex flex-col gap-3">
        {SKELETON_ITEMS.map((item) => (
          <article
            key={item}
            data-testid="task-skeleton"
            className="rounded-md border border-app-border bg-app-surface p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 motion-safe:animate-pulse rounded bg-[#2E2E2E]" />
              <div className="h-4 flex-1 motion-safe:animate-pulse rounded bg-[#2E2E2E]" />
              <div className="h-11 w-11 motion-safe:animate-pulse rounded-md bg-[#242424]" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
