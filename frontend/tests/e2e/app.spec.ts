import { expect, test } from '@playwright/test';

test('shows the task manager shell', async ({ page }) => {
  await page.route('**/api/tasks', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: '[]' });
  });
  await page.goto('/');

  const main = page.getByRole('main');

  await expect(page.getByRole('heading', { name: 'Task Manager' })).toBeVisible();
  await expect(main).toHaveCSS('background-color', 'rgb(18, 18, 18)');
});
