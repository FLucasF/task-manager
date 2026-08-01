import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateTaskRequest, Task } from '../types';

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => apiMock),
  },
}));

import { createTask, deleteTask, listTasks, toggleTask } from './tasks';

const task: Task = {
  id: 1,
  title: 'Testar API helper',
  completed: false,
  createdAt: '2026-08-01T18:45:00Z',
};

describe('task API helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists tasks', async () => {
    apiMock.get.mockResolvedValueOnce({ data: [task] });

    await expect(listTasks()).resolves.toEqual([task]);
    expect(apiMock.get).toHaveBeenCalledWith('/api/tasks');
  });

  it('creates a task', async () => {
    const request: CreateTaskRequest = { title: 'Testar API helper' };
    apiMock.post.mockResolvedValueOnce({ data: task });

    await expect(createTask(request)).resolves.toEqual(task);
    expect(apiMock.post).toHaveBeenCalledWith('/api/tasks', request);
  });

  it('toggles a task', async () => {
    const completedTask = { ...task, completed: true };
    apiMock.patch.mockResolvedValueOnce({ data: completedTask });

    await expect(toggleTask(1)).resolves.toEqual(completedTask);
    expect(apiMock.patch).toHaveBeenCalledWith('/api/tasks/1/toggle');
  });

  it('deletes a task', async () => {
    apiMock.delete.mockResolvedValueOnce({ data: undefined });

    await expect(deleteTask(1)).resolves.toBeUndefined();
    expect(apiMock.delete).toHaveBeenCalledWith('/api/tasks/1');
  });

  it('propagates request errors', async () => {
    const error = new Error('API unavailable');
    apiMock.get.mockRejectedValueOnce(error);

    await expect(listTasks()).rejects.toBe(error);
  });
});
