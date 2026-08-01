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
