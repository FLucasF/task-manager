import './App.css';
import { TaskContainer } from './features/tasks/components/TaskContainer';

function App() {
  return (
    <main className="app-shell min-h-screen bg-app-background font-sans text-app-textPrimary">
      <TaskContainer />
    </main>
  );
}

export default App;
