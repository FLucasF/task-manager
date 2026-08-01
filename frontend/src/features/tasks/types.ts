export type Task = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type CreateTaskRequest = {
  title: string;
};

export type InvalidParam = {
  name: string;
  reason: string;
};

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  invalidParams?: InvalidParam[];
  timestamp?: string;
  [extension: string]: unknown;
};
