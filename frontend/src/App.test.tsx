import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { listTasks } from './features/tasks/api/tasks';

vi.mock('./features/tasks/api/tasks', () => ({
  listTasks: vi.fn(),
  createTask: vi.fn(),
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockedListTasks = vi.mocked(listTasks);

describe('App', () => {
  beforeEach(() => {
    mockedListTasks.mockResolvedValue([
      {
        id: 1,
        title: 'Conectar frontend ao backend',
        completed: false,
        createdAt: '2026-07-28T21:00:00Z',
      },
    ]);
  });

  it('renders tasks from the API', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /task manager/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(await screen.findByText('Conectar frontend ao backend')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Lista de tarefas' })).toBeInTheDocument();
  });

  it('applies the main Tailwind theme classes to the application container', async () => {
    render(<App />);

    expect(screen.getByRole('main')).toHaveClass(
      'bg-app-background',
      'font-sans',
      'text-app-textPrimary',
    );
    expect(await screen.findByText('Conectar frontend ao backend')).toBeInTheDocument();
  });
});
