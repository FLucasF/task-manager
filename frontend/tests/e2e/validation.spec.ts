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

test('should reject an invalid title while editing without calling the API', async ({ page }) => {
  const task = {
    id: 1,
    title: 'Titulo valido existente',
    completed: false,
    createdAt: '2026-08-01T21:00:00Z',
  };
  let updateRequests = 0;

  await page.route((url) => url.pathname.startsWith('/api/tasks'), async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, json: [task] });
      return;
    }

    if (route.request().method() === 'PUT') {
      updateRequests += 1;
    }
    await route.fulfill({ status: 400 });
  });

  const taskPage = new TaskPage(page);
  await taskPage.goto();
  await taskPage.expectTaskVisible(task.title);
  await taskPage.editTask(task.title, 'Ir');

  const editInput = page.getByLabel(`Editar titulo da tarefa "${task.title}"`);
  await expect(page.getByRole('alert')).toContainText(
    'O titulo deve ter entre 3 e 100 caracteres.',
  );
  await expect(editInput).toHaveAttribute('aria-invalid', 'true');
  await expect(editInput).toHaveValue('Ir');
  expect(updateRequests).toBe(0);
});
