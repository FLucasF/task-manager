import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Task } from '../types';
import { TaskItem } from './TaskItem';

const task: Task = {
  id: 42,
  title: 'Revisar acessibilidade',
  completed: false,
  createdAt: '2026-08-01T19:50:00Z',
};

function renderTaskItem({
  item = task,
  onToggle = vi.fn(),
  onUpdate = vi.fn().mockResolvedValue(undefined),
  onDelete = vi.fn(),
  disabled = false,
}: {
  item?: Task;
  onToggle?: (id: number) => void;
  onUpdate?: (id: number, title: string) => Promise<void>;
  onDelete?: (id: number) => void;
  disabled?: boolean;
} = {}) {
  return render(
    <TaskItem
      task={item}
      onToggle={onToggle}
      onUpdate={onUpdate}
      onDelete={onDelete}
      disabled={disabled}
    />,
  );
}

describe('TaskItem', () => {
  it('renders the title and accessible controls', () => {
    renderTaskItem();

    expect(
      screen.getByRole('article', { name: 'Revisar acessibilidade' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Revisar acessibilidade')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Marcar "Revisar acessibilidade" como concluida',
      }),
    ).not.toBeChecked();
    expect(screen.getByRole('checkbox').closest('label')).toHaveClass('h-11', 'w-11');
    expect(screen.getByRole('button', { name: 'Editar tarefa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir tarefa' })).toBeInTheDocument();
  });

  it('reflects the completed state and calls onToggle with the task id', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderTaskItem({ item: { ...task, completed: true }, onToggle });

    const checkbox = screen.getByRole('checkbox', {
      name: 'Marcar "Revisar acessibilidade" como pendente',
    });
    expect(checkbox).toBeChecked();
    expect(screen.getByText('Revisar acessibilidade')).toHaveClass('line-through');

    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith(task.id);
  });

  it('edits the title inline and submits the normalized value with Enter', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderTaskItem({ onUpdate });

    await user.click(screen.getByRole('button', { name: 'Editar tarefa' }));
    const editInput = screen.getByLabelText(
      'Editar titulo da tarefa "Revisar acessibilidade"',
    );
    expect(editInput).toHaveFocus();
    expect(editInput).toHaveValue(task.title);
    expect(screen.getByRole('checkbox')).toBeDisabled();

    await user.clear(editInput);
    await user.type(editInput, '  Titulo editado  {Enter}');

    await waitFor(() => expect(onUpdate).toHaveBeenCalledOnce());
    expect(onUpdate).toHaveBeenCalledWith(task.id, 'Titulo editado');
    await waitFor(() => expect(editInput).not.toBeInTheDocument());
  });

  it('cancels editing with Escape without calling onUpdate', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderTaskItem({ onUpdate });

    await user.click(screen.getByRole('button', { name: 'Editar tarefa' }));
    const editInput = screen.getByLabelText(/editar titulo da tarefa/i);
    await user.clear(editInput);
    await user.type(editInput, 'Alteracao descartada{Escape}');

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/editar titulo da tarefa/i)).not.toBeInTheDocument();
    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar tarefa' })).toHaveFocus();
  });

  it('rejects an invalid edited title with accessible feedback', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderTaskItem({ onUpdate });

    await user.click(screen.getByRole('button', { name: 'Editar tarefa' }));
    const editInput = screen.getByLabelText(/editar titulo da tarefa/i);
    await user.clear(editInput);
    await user.type(editInput, 'Ir');
    await user.click(screen.getByRole('button', { name: 'Salvar edicao' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O titulo deve ter entre 3 e 100 caracteres.',
    );
    expect(editInput).toHaveAttribute('aria-invalid', 'true');
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('prevents duplicate updates while the request is pending', async () => {
    const user = userEvent.setup();
    let resolveUpdate!: () => void;
    const pendingUpdate = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });
    const onUpdate = vi.fn().mockReturnValue(pendingUpdate);
    renderTaskItem({ onUpdate });

    await user.click(screen.getByRole('button', { name: 'Editar tarefa' }));
    const editInput = screen.getByLabelText(/editar titulo da tarefa/i);
    await user.clear(editInput);
    await user.type(editInput, 'Titulo pendente');
    await user.click(screen.getByRole('button', { name: 'Salvar edicao' }));

    const saveButton = screen.getByRole('button', { name: 'Salvar edicao' });
    expect(editInput).toBeDisabled();
    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar edicao' })).toBeDisabled();
    await user.click(saveButton);
    expect(onUpdate).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveUpdate();
      await pendingUpdate;
    });
    expect(screen.queryByLabelText(/editar titulo da tarefa/i)).not.toBeInTheDocument();
  });

  it('keeps editing available when the update fails', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockRejectedValue(new Error('Update failed'));
    renderTaskItem({ onUpdate });

    await user.click(screen.getByRole('button', { name: 'Editar tarefa' }));
    const editInput = screen.getByLabelText(/editar titulo da tarefa/i);
    await user.clear(editInput);
    await user.type(editInput, 'Titulo que falhou');
    await user.click(screen.getByRole('button', { name: 'Salvar edicao' }));

    await waitFor(() => expect(editInput).toBeEnabled());
    expect(editInput).toHaveValue('Titulo que falhou');
    expect(screen.getByRole('button', { name: 'Salvar edicao' })).toBeEnabled();
  });

  it('calls onDelete with the task id from the icon-only button', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const { container } = renderTaskItem({ onDelete });

    await user.click(screen.getByRole('button', { name: 'Excluir tarefa' }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(task.id);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports keyboard focus and disabled interaction states', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderTaskItem({ onUpdate });

    const checkbox = screen.getByRole('checkbox');
    const editButton = screen.getByRole('button', { name: 'Editar tarefa' });
    const deleteButton = screen.getByRole('button', { name: 'Excluir tarefa' });

    await user.tab();
    expect(checkbox).toHaveFocus();
    expect(checkbox).toHaveClass('focus-visible:ring-2');

    await user.tab();
    expect(editButton).toHaveFocus();
    expect(editButton).toHaveClass('focus-visible:ring-2');

    await user.tab();
    expect(deleteButton).toHaveFocus();
    expect(deleteButton).toHaveClass(
      'hover:bg-app-dangerSurface',
      'active:bg-app-surfaceElevated',
      'focus-visible:ring-2',
    );

    rerender(
      <TaskItem
        task={task}
        onToggle={vi.fn()}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
        disabled
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Editar tarefa' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Excluir tarefa' })).toBeDisabled();
  });
});
