import { expect, test } from '@playwright/test';
import { TaskPage } from './pages/TaskPage';

test('should reject a title with less than three characters', async ({ page }) => {
  let createRequests = 0;

  await page.route((url) => url.pathname === '/api/tasks', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, json: [] });
      return;
    }

    createRequests += 1;
    await route.fulfill({ status: 400 });
  });

  const taskPage = new TaskPage(page);
  const invalidTitle = 'Ir';
  await taskPage.goto();

  await taskPage.addTask(invalidTitle);

  await taskPage.expectTitleValidationError();
  await taskPage.expectTaskHidden(invalidTitle);
  await expect(taskPage.titleInput).toHaveValue(invalidTitle);
  expect(createRequests).toBe(0);
});
