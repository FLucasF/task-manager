import { test, type Page } from '@playwright/test';
import type { CreateTaskRequest, Task } from '../../src/features/tasks/types';
import { TaskPage } from './pages/TaskPage';

async function useControlledTaskApi(page: Page): Promise<void> {
  let tasks: Task[] = [];
  let nextId = 1;

  await page.route((url) => url.pathname.startsWith('/api/tasks'), async (route) => {
    const request = route.request();
    const method = request.method();
    const pathname = new URL(request.url()).pathname;

    if (method === 'GET' && pathname === '/api/tasks') {
      await route.fulfill({ status: 200, json: tasks });
      return;
    }

    if (method === 'POST' && pathname === '/api/tasks') {
      const { title } = request.postDataJSON() as CreateTaskRequest;
      const createdTask: Task = {
        id: nextId++,
        title,
        completed: false,
        createdAt: '2026-08-01T21:00:00Z',
      };
      tasks = [...tasks, createdTask];
      await route.fulfill({ status: 201, json: createdTask });
      return;
    }

    const toggleMatch = pathname.match(/^\/api\/tasks\/(\d+)\/toggle$/);
    if (method === 'PATCH' && toggleMatch) {
      const id = Number(toggleMatch[1]);
      const task = tasks.find((item) => item.id === id);
      if (!task) {
        await route.fulfill({ status: 404 });
        return;
      }

      const updatedTask = { ...task, completed: !task.completed };
      tasks = tasks.map((item) => (item.id === id ? updatedTask : item));
      await route.fulfill({ status: 200, json: updatedTask });
      return;
    }

    const deleteMatch = pathname.match(/^\/api\/tasks\/(\d+)$/);
    if (method === 'DELETE' && deleteMatch) {
      const id = Number(deleteMatch[1]);
      tasks = tasks.filter((item) => item.id !== id);
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fulfill({ status: 404 });
  });
}

test('should add complete and delete a task', async ({ page }) => {
  const taskPage = new TaskPage(page);
  const title = 'Revisar contrato OpenAPI';
  await useControlledTaskApi(page);

  await taskPage.goto();
  await taskPage.addTask(title);
  await taskPage.expectTaskVisible(title);
  await taskPage.toggleTask(title);
  await taskPage.expectTaskCompleted(title);
  await taskPage.deleteTask(title);
  await taskPage.expectTaskHidden(title);
});
