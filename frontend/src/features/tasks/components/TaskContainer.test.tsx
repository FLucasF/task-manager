import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listTasks } from '../api/tasks';
import { TaskContainer } from './TaskContainer';

vi.mock('../api/tasks', () => ({
  listTasks: vi.fn(),
  createTask: vi.fn(),
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockedListTasks = vi.mocked(listTasks);

describe('TaskContainer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads tasks on mount and renders the task list', async () => {
    mockedListTasks.mockResolvedValueOnce([
      {
        id: 1,
        title: 'Compor a lista no container',
        completed: false,
        createdAt: '2026-08-01T19:30:00Z',
      },
    ]);

    render(<TaskContainer />);

    expect(screen.getByText('Carregando tarefas da API...')).toBeInTheDocument();
    expect(await screen.findByText('Compor a lista no container')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.queryByText('Carregando tarefas da API...')).not.toBeInTheDocument();
  });
});
