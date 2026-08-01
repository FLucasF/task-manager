import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  listTasks,
  toggleTask as toggleTaskRequest,
} from '../api/tasks';
import type { Task } from '../types';
import { useTasks } from './useTasks';

vi.mock('../api/tasks', () => ({
  listTasks: vi.fn(),
  createTask: vi.fn(),
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockedListTasks = vi.mocked(listTasks);
const mockedCreateTask = vi.mocked(createTaskRequest);
const mockedToggleTask = vi.mocked(toggleTaskRequest);
const mockedDeleteTask = vi.mocked(deleteTaskRequest);

const task: Task = {
  id: 1,
  title: 'Testar hook de tarefas',
  completed: false,
  createdAt: '2026-08-01T19:15:00Z',
};

describe('useTasks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads tasks on mount', async () => {
    mockedListTasks.mockResolvedValueOnce([task]);

    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toEqual([task]);
    expect(result.current.error).toBeNull();
  });

  it('stores errors from the initial request', async () => {
    const error = new Error('API unavailable');
    mockedListTasks.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toBe(error);

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });

  it('creates, toggles and deletes tasks', async () => {
    const completedTask = { ...task, completed: true };
    mockedListTasks.mockResolvedValueOnce([]);
    mockedCreateTask.mockResolvedValueOnce(task);
    mockedToggleTask.mockResolvedValueOnce(completedTask);
    mockedDeleteTask.mockResolvedValueOnce();

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTask({ title: task.title });
    });
    expect(result.current.tasks).toEqual([task]);

    await act(async () => {
      await result.current.toggleTask(task.id);
    });
    expect(result.current.tasks).toEqual([completedTask]);

    await act(async () => {
      await result.current.deleteTask(task.id);
    });
    expect(result.current.tasks).toEqual([]);
  });

  it('stores mutation errors without changing the current tasks', async () => {
    const createError = new Error('Create failed');
    const toggleError = new Error('Toggle failed');
    const deleteError = new Error('Delete failed');
    mockedListTasks.mockResolvedValueOnce([task]);
    mockedCreateTask.mockRejectedValueOnce(createError);
    mockedToggleTask.mockRejectedValueOnce(toggleError);
    mockedDeleteTask.mockRejectedValueOnce(deleteError);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(result.current.createTask({ title: 'Nova tarefa' })).rejects.toBe(createError);
    });
    expect(result.current.error).toBe(createError);
    expect(result.current.tasks).toEqual([task]);

    await act(async () => {
      await expect(result.current.toggleTask(task.id)).rejects.toBe(toggleError);
    });
    expect(result.current.error).toBe(toggleError);
    expect(result.current.tasks).toEqual([task]);

    await act(async () => {
      await expect(result.current.deleteTask(task.id)).rejects.toBe(deleteError);
    });
    expect(result.current.error).toBe(deleteError);
    expect(result.current.tasks).toEqual([task]);
  });
});
