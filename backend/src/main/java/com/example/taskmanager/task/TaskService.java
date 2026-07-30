package com.example.taskmanager.task;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TaskService {

  private final TaskRepository taskRepository;
  private final Validator validator;

  public TaskService(TaskRepository taskRepository, Validator validator) {
    this.taskRepository = taskRepository;
    this.validator = validator;
  }

  public List<TaskResponse> list() {
    return taskRepository.findAll().stream()
        .map(TaskMapper::toResponse)
        .toList();
  }

  @Transactional
  public TaskResponse create(CreateTaskRequest request) {
    var violations = validator.validate(request);
    if (!violations.isEmpty()) {
      throw new ConstraintViolationException(violations);
    }

    var task = TaskMapper.toEntity(request);
    return TaskMapper.toResponse(taskRepository.save(task));
  }

  @Transactional
  public TaskResponse toggle(Long id) {
    var task = findById(id);
    task.toggleCompleted();
    return TaskMapper.toResponse(taskRepository.save(task));
  }

  @Transactional
  public void delete(Long id) {
    taskRepository.delete(findById(id));
  }

  private Task findById(Long id) {
    return taskRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Task with id " + id + " was not found."));
  }
}
