import { useTasks } from '../hooks/useTasks';

export function TaskContainer() {
  const { tasks, loading, error } = useTasks();

  return (
    <section className="app-panel" aria-labelledby="task-manager-title">
      <h1 id="task-manager-title">Task Manager</h1>
      {loading && <p>Carregando tarefas da API...</p>}
      {Boolean(error) && (
        <p role="alert">Nao foi possivel conectar ao backend em /api/tasks.</p>
      )}
      {!loading && !error && (
        <>
          <p>Frontend conectado ao backend: {tasks.length} tarefa(s) carregada(s).</p>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <span>{task.title}</span>
                <strong>{task.completed ? 'Concluida' : 'Pendente'}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
