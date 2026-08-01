import { expect, type Locator, type Page } from '@playwright/test';

export class TaskPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly addButton: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel(/titulo/i);
    this.addButton = page.getByRole('button', { name: /adicionar/i });
    this.errorToast = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async addTask(title: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.addButton.click();
  }

  taskItem(title: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  async toggleTask(title: string): Promise<void> {
    await this.taskItem(title).getByRole('checkbox').click();
  }

  async deleteTask(title: string): Promise<void> {
    await this.taskItem(title).getByRole('button', { name: /excluir/i }).click();
  }

  async expectTaskVisible(title: string): Promise<void> {
    await expect(this.taskItem(title)).toBeVisible();
  }

  async expectTaskCompleted(title: string): Promise<void> {
    await expect(this.taskItem(title).getByRole('checkbox')).toBeChecked();
  }

  async expectTaskHidden(title: string): Promise<void> {
    await expect(this.taskItem(title)).toHaveCount(0);
  }

  async expectApiErrorVisible(): Promise<void> {
    await expect(this.errorToast).toContainText(
      'Nao foi possivel concluir a operacao. Tente novamente.',
    );
  }

  async expectTitleValidationError(): Promise<void> {
    await expect(this.page.getByRole('alert')).toContainText(
      'O titulo deve ter entre 3 e 100 caracteres.',
    );
    await expect(this.titleInput).toHaveAttribute('aria-invalid', 'true');
  }
}
