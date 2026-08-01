import { useEffect, useState } from 'react';
import './App.css';
import { listTasks, type Task } from './api/tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let isMounted = true;

    listTasks()
      .then((items) => {
        if (isMounted) {
          setTasks(items);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-shell min-h-screen bg-[#121212]">
      <section className="app-panel">
        <h1>Task Manager</h1>
        {status === 'loading' && <p>Carregando tarefas da API...</p>}
        {status === 'error' && (
          <p role="alert">Nao foi possivel conectar ao backend em /api/tasks.</p>
        )}
        {status === 'ready' && (
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
