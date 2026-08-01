import { useEffect } from 'react';

type TaskErrorToastProps = {
  message: string;
  onDismiss: () => void;
  duration?: number;
};

export function TaskErrorToast({
  message,
  onDismiss,
  duration = 5000,
}: TaskErrorToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-md border border-app-danger bg-app-dangerSurface p-4 text-app-textPrimary shadow-lg sm:left-auto sm:right-4 sm:mx-0"
    >
      <p className="flex-1 text-sm leading-5">{message}</p>
      <button
        type="button"
        aria-label="Fechar notificacao"
        onClick={onDismiss}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-app-danger transition-colors duration-150 ease-out hover:bg-app-surfaceHover active:bg-app-surfaceElevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accentHover focus-visible:ring-offset-2 focus-visible:ring-offset-app-background"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        </svg>
      </button>
    </div>
  );
}
