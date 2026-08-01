import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskErrorToast } from './TaskErrorToast';

const message = 'Nao foi possivel salvar a tarefa. Tente novamente.';

describe('TaskErrorToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders an assertive, non-blocking error notification', () => {
    render(<TaskErrorToast message={message} onDismiss={vi.fn()} />);

    const toast = screen.getByRole('alert');
    expect(toast).toHaveTextContent(message);
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveClass('fixed', 'bg-app-dangerSurface', 'text-app-textPrimary');
    expect(screen.getByRole('button', { name: 'Fechar notificacao' })).toHaveClass(
      'hover:bg-app-surfaceHover',
      'active:bg-app-surfaceElevated',
      'focus-visible:ring-2',
    );
  });

  it('supports manual dismissal', () => {
    const onDismiss = vi.fn();
    render(<TaskErrorToast message={message} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar notificacao' }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('dismisses automatically after five seconds', () => {
    const onDismiss = vi.fn();
    render(<TaskErrorToast message={message} onDismiss={onDismiss} />);

    act(() => vi.advanceTimersByTime(4999));
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
