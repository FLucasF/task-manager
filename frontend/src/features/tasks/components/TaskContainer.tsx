import { useTasks } from '../hooks/useTasks';
import { TaskInput } from './TaskInput';
import { TaskItem } from './TaskItem';
import { TaskSkeletonList } from './TaskSkeletonList';

export function TaskContainer() {
  const { tasks, loading, error, createTask, toggleTask, deleteTask } = useTasks();

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
        <TaskInput onSubmit={handleCreateTask} disabled={loading} />
      </section>

      <section aria-labelledby="task-list-title" className="flex flex-col gap-4">
        <h2 id="task-list-title" className="text-lg font-semibold leading-snug md:text-xl">
          Lista de tarefas
        </h2>
        {loading && <TaskSkeletonList />}
        {Boolean(error) && (
          <p role="alert" className="rounded-md bg-app-dangerSurface p-4 text-app-danger">
            Nao foi possivel concluir a operacao. Tente novamente.
          </p>
        )}
        {!loading && (
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
    </div>
  );
}
