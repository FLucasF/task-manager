import axios from 'axios';
import { apiBaseUrl } from '../../../config';
import type { Task } from '../types';

const api = axios.create({
  baseURL: apiBaseUrl || undefined,
});

export async function listTasks(): Promise<Task[]> {
  const response = await api.get<Task[]>('/api/tasks');
  return response.data;
}
