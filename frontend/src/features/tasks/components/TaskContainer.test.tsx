import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTask, deleteTask, listTasks, toggleTask, updateTask } from '../api/tasks';
import type { Task } from '../types';
import { TaskContainer } from './TaskContainer';

vi.mock('../api/tasks', () => ({
  listTasks: vi.fn(),
  createTask: vi.fn(),
  toggleTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockedListTasks = vi.mocked(listTasks);
const mockedCreateTask = vi.mocked(createTask);
const mockedToggleTask = vi.mocked(toggleTask);
const mockedUpdateTask = vi.mocked(updateTask);
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

  it('connects create, update, toggle and delete actions to the task hook', async () => {
    const user = userEvent.setup();
    const createdTask = { ...task, id: 2, title: 'Nova tarefa integrada' };
    const updatedTask = { ...task, title: 'Tarefa editada no container' };
    const completedTask = { ...updatedTask, completed: true };
    mockedListTasks.mockResolvedValueOnce([task]);
    mockedCreateTask.mockResolvedValueOnce(createdTask);
    mockedUpdateTask.mockResolvedValueOnce(updatedTask);
    mockedToggleTask.mockResolvedValueOnce(completedTask);
    mockedDeleteTask.mockResolvedValueOnce();

    render(<TaskContainer />);
    await screen.findByText(task.title);

    await user.type(screen.getByLabelText('Titulo da tarefa'), createdTask.title);
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(await screen.findByText(createdTask.title)).toBeInTheDocument();
    expect(mockedCreateTask).toHaveBeenCalledWith({ title: createdTask.title });

    const originalArticle = screen.getByRole('article', { name: task.title });
    await user.click(within(originalArticle).getByRole('button', { name: 'Editar tarefa' }));
    const editInput = screen.getByLabelText(`Editar titulo da tarefa "${task.title}"`);
    await user.clear(editInput);
    await user.type(editInput, updatedTask.title);
    await user.click(screen.getByRole('button', { name: 'Salvar edicao' }));
    expect(await screen.findByText(updatedTask.title)).toBeInTheDocument();
    expect(mockedUpdateTask).toHaveBeenCalledWith(task.id, { title: updatedTask.title });

    await user.click(
      screen.getByRole('checkbox', { name: `Marcar "${updatedTask.title}" como concluida` }),
    );
    expect(
      await screen.findByRole('checkbox', { name: `Marcar "${updatedTask.title}" como pendente` }),
    ).toBeChecked();
    expect(mockedToggleTask).toHaveBeenCalledWith(task.id);

    const taskArticle = screen.getByRole('article', { name: updatedTask.title });
    await user.click(within(taskArticle).getByRole('button', { name: 'Excluir tarefa' }));
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: updatedTask.title })).not.toBeInTheDocument(),
    );
    expect(mockedDeleteTask).toHaveBeenCalledWith(task.id);
  });

  it('disables task creation while the request is pending and prevents duplicate submits', async () => {
    const user = userEvent.setup();
    const createdTask = { ...task, id: 2, title: 'Criacao sem duplicidade' };
    let resolveCreate!: (value: Task) => void;
    const pendingCreate = new Promise<Task>((resolve) => {
      resolveCreate = resolve;
    });
    mockedListTasks.mockResolvedValueOnce([]);
    mockedCreateTask.mockReturnValueOnce(pendingCreate);

    render(<TaskContainer />);
    await screen.findByRole('heading', { name: 'Tudo limpo por aqui!' });

    const titleInput = screen.getByLabelText('Titulo da tarefa');
    const addButton = screen.getByRole('button', { name: 'Adicionar' });
    await user.type(titleInput, createdTask.title);
    await user.click(addButton);

    expect(titleInput).toBeDisabled();
    expect(addButton).toBeDisabled();
    await user.click(addButton);
    expect(mockedCreateTask).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCreate(createdTask);
      await pendingCreate;
    });

    expect(await screen.findByText(createdTask.title)).toBeInTheDocument();
    expect(titleInput).toBeEnabled();
    expect(addButton).toBeEnabled();
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

  it('keeps the interface available while reporting API errors in a toast', async () => {
    mockedListTasks.mockRejectedValueOnce(new Error('API unavailable'));

    render(<TaskContainer />);

    const toast = await screen.findByRole('alert');
    expect(toast).toHaveTextContent('Nao foi possivel concluir a operacao. Tente novamente.');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByLabelText('Titulo da tarefa')).toBeEnabled();
    expect(screen.queryByTestId('task-empty-state')).not.toBeInTheDocument();
  });
});
