import axios from 'axios';
import { apiBaseUrl } from '../../../config';
import type { CreateTaskRequest, Task, UpdateTaskRequest } from '../types';

const api = axios.create({
  baseURL: apiBaseUrl || undefined,
});

export async function listTasks(): Promise<Task[]> {
  const response = await api.get<Task[]>('/api/tasks');
  return response.data;
}

export async function createTask(request: CreateTaskRequest): Promise<Task> {
  const response = await api.post<Task>('/api/tasks', request);
  return response.data;
}

export async function toggleTask(id: number): Promise<Task> {
  const response = await api.patch<Task>(`/api/tasks/${id}/toggle`);
  return response.data;
}

export async function updateTask(id: number, request: UpdateTaskRequest): Promise<Task> {
  const response = await api.put<Task>(`/api/tasks/${id}`, request);
  return response.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/api/tasks/${id}`);
}
