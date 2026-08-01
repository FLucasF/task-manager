import './App.css';
import { useTasks } from './features/tasks/hooks/useTasks';

function App() {
  const { tasks, loading, error } = useTasks();

  return (
    <main className="app-shell min-h-screen bg-app-background font-sans text-app-textPrimary">
      <section className="app-panel">
        <h1>Task Manager</h1>
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
    </main>
  );
}

export default App;
