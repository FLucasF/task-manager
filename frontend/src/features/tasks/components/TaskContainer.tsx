import { useTasks } from '../hooks/useTasks';
import { TaskEmptyState } from './TaskEmptyState';
import { TaskErrorToast } from './TaskErrorToast';
import { TaskInput } from './TaskInput';
import { TaskItem } from './TaskItem';
import { TaskSkeletonList } from './TaskSkeletonList';

export function TaskContainer() {
  const { tasks, loading, creating, error, createTask, toggleTask, deleteTask, clearError } =
    useTasks();

  function handleCreateTask(title: string) {
    void createTask({ title }).catch(() => undefined);
  }

  function handleToggleTask(id: number) {
    void toggleTask(id).catch(() => undefined);
  }

  function handleDeleteTask(id: number) {
    void deleteTask(id).catch(() => undefined);
  }

  return (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="task-form-title"
        className="rounded-lg border border-app-border bg-app-surface p-4 md:p-6"
      >
        <h1 id="task-form-title" className="mb-6 text-2xl font-semibold leading-tight md:text-3xl">
          Task Manager
        </h1>
        <TaskInput onSubmit={handleCreateTask} disabled={loading || creating} />
      </section>

      <section aria-labelledby="task-list-title" className="flex flex-col gap-4">
        <h2 id="task-list-title" className="text-lg font-semibold leading-snug md:text-xl">
          Lista de tarefas
        </h2>
        {loading && <TaskSkeletonList />}
        {!loading && !error && tasks.length === 0 && <TaskEmptyState />}
        {!loading && tasks.length > 0 && (
          <ul className="flex list-none flex-col gap-3 p-0">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskItem
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
      {Boolean(error) && (
        <TaskErrorToast
          message="Nao foi possivel concluir a operacao. Tente novamente."
          onDismiss={clearError}
        />
      )}
    </div>
  );
}
