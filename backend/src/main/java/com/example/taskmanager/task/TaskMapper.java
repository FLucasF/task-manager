package com.example.taskmanager.task;

public final class TaskMapper {

  private TaskMapper() {
  }

  public static Task toEntity(CreateTaskRequest request) {
    return new Task(request.title());
  }

  public static TaskResponse toResponse(Task task) {
    return new TaskResponse(
        task.getId(),
        task.getTitle(),
        task.isCompleted(),
        task.getCreatedAt());
  }
}
