import { useCallback, useEffect, useState } from 'react';
import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  listTasks,
  toggleTask as toggleTaskRequest,
} from '../api/tasks';
import type { CreateTaskRequest, Task } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let isMounted = true;

    listTasks()
      .then((items) => {
        if (isMounted) {
          setTasks(items);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setError(requestError);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createTask = useCallback(async (request: CreateTaskRequest) => {
    setError(null);

    try {
      const createdTask = await createTaskRequest(request);
      setTasks((currentTasks) => [...currentTasks, createdTask]);
      return createdTask;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    }
  }, []);

  const toggleTask = useCallback(async (id: number) => {
    setError(null);

    try {
      const updatedTask = await toggleTaskRequest(id);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === id ? updatedTask : task)),
      );
      return updatedTask;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setError(null);

    try {
      await deleteTaskRequest(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    toggleTask,
    deleteTask,
  };
}
