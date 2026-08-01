import { createRequire } from 'node:module';
import { expect, test, type Page } from '@playwright/test';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');

const task = {
  id: 1,
  title: 'Auditar acessibilidade',
  completed: false,
  createdAt: '2026-08-01T21:00:00Z',
};

async function mockTaskList(page: Page) {
  let currentTask: typeof task | null = task;

  await page.route((url) => url.pathname.startsWith('/api/tasks'), async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (request.method() === 'GET' && pathname === '/api/tasks') {
      await route.fulfill({ status: 200, json: currentTask ? [currentTask] : [] });
      return;
    }

    if (request.method() === 'PATCH' && pathname === `/api/tasks/${task.id}/toggle`) {
      if (!currentTask) {
        await route.fulfill({ status: 404 });
        return;
      }
      currentTask = { ...currentTask, completed: !currentTask.completed };
      await route.fulfill({ status: 200, json: currentTask });
      return;
    }

    if (request.method() === 'DELETE' && pathname === `/api/tasks/${task.id}`) {
      currentTask = null;
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fulfill({ status: 404 });
  });
}

test('passes an axe audit and supports keyboard focus in the main flow', async ({ page }) => {
  await mockTaskList(page);
  await page.goto('/');
  await expect(page.getByText(task.title)).toBeVisible();

  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => {
    const axe = (
      window as typeof window & {
        axe: { run: () => Promise<{ violations: Array<{ id: string }> }> };
      }
    ).axe;

    return (await axe.run()).violations.map(({ id }) => id);
  });
  expect(violations).toEqual([]);

  const titleInput = page.getByLabel('Titulo da tarefa');
  const addButton = page.getByRole('button', { name: 'Adicionar' });
  const checkbox = page.getByRole('checkbox');
  const deleteButton = page.getByRole('button', { name: 'Excluir tarefa' });

  await page.keyboard.press('Tab');
  await expect(titleInput).toBeFocused();
  await expect(titleInput).not.toHaveCSS('box-shadow', 'none');

  await page.keyboard.press('Tab');
  await expect(addButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toContainText(
    'O titulo deve ter entre 3 e 100 caracteres.',
  );

  await page.keyboard.press('Tab');
  await expect(checkbox).toBeFocused();
  await page.keyboard.press('Space');
  await expect(checkbox).toBeChecked();

  await page.keyboard.press('Tab');
  await expect(deleteButton).toBeFocused();

  const touchTargets = await page.locator('input, button').evaluateAll((controls) =>
    controls.map((control) => {
      const target =
        control instanceof HTMLInputElement && control.type === 'checkbox'
          ? control.closest('label') ?? control
          : control;
      const bounds = target.getBoundingClientRect();
      return { width: bounds.width, height: bounds.height };
    }),
  );

  for (const target of touchTargets) {
    expect(target.width).toBeGreaterThanOrEqual(44);
    expect(target.height).toBeGreaterThanOrEqual(44);
  }

  await page.keyboard.press('Enter');
  await expect(page.getByText(task.title)).toHaveCount(0);
});

test('reduces animation and transition durations when requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockTaskList(page);
  await page.goto('/');

  const prefersReducedMotion = await page.evaluate(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const transitionDuration = await page
    .getByRole('button', { name: 'Adicionar' })
    .evaluate((button) => Number.parseFloat(getComputedStyle(button).transitionDuration));

  expect(prefersReducedMotion).toBe(true);
  expect(transitionDuration).toBeLessThanOrEqual(0.001);
});
