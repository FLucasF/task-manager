import { TaskContainer } from './features/tasks/components/TaskContainer';

function App() {
  return (
    <main className="min-h-screen bg-app-background px-4 py-6 font-sans text-app-textPrimary md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-2xl">
        <TaskContainer />
      </div>
    </main>
  );
}

export default App;
