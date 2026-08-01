import { render, screen } from '@testing-library/react';
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

describe('TaskItem', () => {
  it('renders the title and accessible controls', () => {
    render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />);

    expect(
      screen.getByRole('article', { name: 'Revisar acessibilidade' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Revisar acessibilidade')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Marcar "Revisar acessibilidade" como concluida',
      }),
    ).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Excluir tarefa' })).toBeInTheDocument();
  });

  it('reflects the completed state and calls onToggle with the task id', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TaskItem task={{ ...task, completed: true }} onToggle={onToggle} onDelete={vi.fn()} />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: 'Marcar "Revisar acessibilidade" como pendente',
    });
    expect(checkbox).toBeChecked();
    expect(screen.getByText('Revisar acessibilidade')).toHaveClass('line-through');

    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith(task.id);
  });

  it('calls onDelete with the task id from the icon-only button', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole('button', { name: 'Excluir tarefa' }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(task.id);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
