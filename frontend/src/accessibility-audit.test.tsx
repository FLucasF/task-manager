import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { listTasks } from './features/tasks/api/tasks';

vi.mock('./features/tasks/api/tasks', () => ({
  listTasks: vi.fn(),
  createTask: vi.fn(),
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockedListTasks = vi.mocked(listTasks);

async function runDomAudit(container: HTMLElement) {
  return axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });
}

describe('WCAG accessibility audit', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('has no detectable violations in the loaded task interface', async () => {
    mockedListTasks.mockResolvedValueOnce([
      {
        id: 1,
        title: 'Auditar acessibilidade',
        completed: false,
        createdAt: '2026-08-01T21:00:00Z',
      },
    ]);

    const { container } = render(<App />);
    await screen.findByText('Auditar acessibilidade');

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByLabelText('Titulo da tarefa')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Marcar "Auditar acessibilidade" como concluida' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir tarefa' })).toBeInTheDocument();

    const results = await runDomAudit(container);
    expect(results.violations).toEqual([]);
  });

  it('keeps the API error notification accessible', async () => {
    mockedListTasks.mockRejectedValueOnce(new Error('API unavailable'));

    const { container } = render(<App />);
    const toast = await screen.findByRole('alert');

    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByRole('button', { name: 'Fechar notificacao' })).toBeInTheDocument();

    const results = await runDomAudit(container);
    expect(results.violations).toEqual([]);
  });
});
