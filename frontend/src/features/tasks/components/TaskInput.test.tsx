import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskInput } from './TaskInput';

describe('TaskInput', () => {
  it('renders an accessible title field and submit button', () => {
    render(<TaskInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText('Titulo da tarefa');

    expect(input).toHaveAttribute('id', 'task-title');
    expect(input).toHaveAttribute('minlength', '3');
    expect(input).toHaveAttribute('maxlength', '100');
    expect(input).toBeRequired();
    expect(input).toHaveClass('border-app-controlBorder');
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
  });

  it('submits the normalized title with userEvent', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Titulo da tarefa'), '  Revisar contrato OpenAPI  ');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith('Revisar contrato OpenAPI');
    expect(screen.getByLabelText('Titulo da tarefa')).toHaveValue('');
  });

  it('exposes visible focus styles in keyboard tab order', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={vi.fn()} />);

    const input = screen.getByLabelText('Titulo da tarefa');
    const button = screen.getByRole('button', { name: 'Adicionar' });

    await user.tab();
    expect(input).toHaveFocus();
    expect(input).toHaveClass('hover:border-app-textMuted', 'focus-visible:ring-2');

    await user.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveClass(
      'hover:bg-app-accentHover',
      'active:bg-app-accentActive',
      'focus-visible:ring-2',
    );
  });

  it('prevents interaction while disabled', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} disabled />);

    const input = screen.getByLabelText('Titulo da tarefa');
    const button = screen.getByRole('button', { name: 'Adicionar' });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    await user.type(input, 'Nova tarefa');
    await user.click(button);
    expect(input).toHaveValue('');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows accessible external and validation errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(
      <TaskInput onSubmit={onSubmit} error="Nao foi possivel adicionar a tarefa." />,
    );

    const input = screen.getByLabelText('Titulo da tarefa');
    expect(screen.getByRole('alert')).toHaveTextContent('Nao foi possivel adicionar a tarefa.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'task-title-error');
    expect(input).toHaveClass('border-app-danger');

    rerender(<TaskInput onSubmit={onSubmit} />);
    await user.type(input, 'Ir');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O titulo deve ter entre 3 e 100 caracteres.',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
