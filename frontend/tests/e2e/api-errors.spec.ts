import { expect, test } from '@playwright/test';
import { TaskPage } from './pages/TaskPage';

test('should show a non-blocking toast when the API returns an error', async ({ page }) => {
  await page.route((url) => url.pathname === '/api/tasks', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/problem+json',
      json: {
        type: 'https://api.task-manager.local/problems/internal-server-error',
        title: 'Internal server error',
        status: 500,
        detail: 'An unexpected error occurred while processing the request.',
        instance: '/api/tasks',
      },
    });
  });

  const taskPage = new TaskPage(page);
  await taskPage.goto();

  await taskPage.expectApiErrorVisible();
  await expect(taskPage.titleInput).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Task Manager' })).toBeVisible();
});

test('should preserve inline editing when the update API returns an error', async ({ page }) => {
  const task = {
    id: 1,
    title: 'Titulo antes da falha',
    completed: false,
    createdAt: '2026-08-01T21:00:00Z',
  };
  const attemptedTitle = 'Titulo preservado para nova tentativa';

  await page.route((url) => url.pathname.startsWith('/api/tasks'), async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (request.method() === 'GET' && pathname === '/api/tasks') {
      await route.fulfill({ status: 200, json: [task] });
      return;
    }

    if (request.method() === 'PUT' && pathname === `/api/tasks/${task.id}`) {
      await route.fulfill({
        status: 500,
        contentType: 'application/problem+json',
        json: {
          type: 'https://api.task-manager.local/problems/internal-server-error',
          title: 'Internal server error',
          status: 500,
          detail: 'An unexpected error occurred while processing the request.',
          instance: `/api/tasks/${task.id}`,
        },
      });
      return;
    }

    await route.fulfill({ status: 404 });
  });

  const taskPage = new TaskPage(page);
  await taskPage.goto();
  await taskPage.expectTaskVisible(task.title);
  await taskPage.editTask(task.title, attemptedTitle);

  await taskPage.expectApiErrorVisible();
  const editInput = page.getByLabel(`Editar titulo da tarefa "${task.title}"`);
  await expect(editInput).toBeEnabled();
  await expect(editInput).toHaveValue(attemptedTitle);
});
