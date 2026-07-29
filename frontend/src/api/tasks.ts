import axios from 'axios';
import { apiBaseUrl } from '../config';

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
};

const api = axios.create({
  baseURL: apiBaseUrl || undefined,
});

export async function listTasks(): Promise<Task[]> {
  const response = await api.get<Task[]>('/api/tasks');
  return response.data;
}
