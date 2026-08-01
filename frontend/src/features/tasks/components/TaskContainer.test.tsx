import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTask, deleteTask, listTasks, toggleTask } from '../api/tasks';
import type { Task } from '../types';
import { TaskContainer } from './TaskContainer';

vi.mock('../api/tasks', () => ({
  listTasks: vi.fn(),
  createTask: vi.fn(),
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockedListTasks = vi.mocked(listTasks);
const mockedCreateTask = vi.mocked(createTask);
const mockedToggleTask = vi.mocked(toggleTask);
const mockedDeleteTask = vi.mocked(deleteTask);

const task: Task = {
  id: 1,
  title: 'Compor a lista no container',
  completed: false,
  createdAt: '2026-08-01T19:30:00Z',
};

describe('TaskContainer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads tasks on mount and renders the task list', async () => {
    mockedListTasks.mockResolvedValueOnce([task]);

    render(<TaskContainer />);

    expect(screen.getByRole('region', { name: 'Task Manager' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Lista de tarefas' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Carregando tarefas' })).toBeInTheDocument();
    expect(screen.getAllByTestId('task-skeleton')).toHaveLength(3);
    expect(screen.getAllByTestId('task-skeleton')[0]).toHaveClass(
      'border-app-border',
      'bg-app-surface',
      'p-4',
    );
    expect(await screen.findByText('Compor a lista no container')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByRole('article', { name: task.title })).toHaveClass('bg-app-surface');
    expect(screen.queryByRole('status', { name: 'Carregando tarefas' })).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('task-skeleton')).toHaveLength(0);
  });

  it('connects create, toggle and delete actions to the task hook', async () => {
    const user = userEvent.setup();
    const createdTask = { ...task, id: 2, title: 'Nova tarefa integrada' };
    const completedTask = { ...task, completed: true };
    mockedListTasks.mockResolvedValueOnce([task]);
    mockedCreateTask.mockResolvedValueOnce(createdTask);
    mockedToggleTask.mockResolvedValueOnce(completedTask);
    mockedDeleteTask.mockResolvedValueOnce();

    render(<TaskContainer />);
    await screen.findByText(task.title);

    await user.type(screen.getByLabelText('Titulo da tarefa'), createdTask.title);
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(await screen.findByText(createdTask.title)).toBeInTheDocument();
    expect(mockedCreateTask).toHaveBeenCalledWith({ title: createdTask.title });

    await user.click(
      screen.getByRole('checkbox', { name: `Marcar "${task.title}" como concluida` }),
    );
    expect(
      await screen.findByRole('checkbox', { name: `Marcar "${task.title}" como pendente` }),
    ).toBeChecked();
    expect(mockedToggleTask).toHaveBeenCalledWith(task.id);

    const taskArticle = screen.getByRole('article', { name: task.title });
    await user.click(within(taskArticle).getByRole('button', { name: 'Excluir tarefa' }));
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: task.title })).not.toBeInTheDocument(),
    );
    expect(mockedDeleteTask).toHaveBeenCalledWith(task.id);
  });

  it('renders the empty state when the API returns no tasks', async () => {
    mockedListTasks.mockResolvedValueOnce([]);

    render(<TaskContainer />);

    expect(screen.getByRole('status', { name: 'Carregando tarefas' })).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Tudo limpo por aqui!' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Adicione uma nova tarefa para comecar a organizar seu dia.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('task-empty-state').querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('task-skeleton')).toHaveLength(0);
  });
});
