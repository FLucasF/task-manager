package com.example.taskmanager.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

  private static ValidatorFactory validatorFactory;
  private static Validator validator;

  @Mock
  private TaskRepository taskRepository;

  private TaskService taskService;

  @BeforeAll
  static void createValidator() {
    validatorFactory = Validation.buildDefaultValidatorFactory();
    validator = validatorFactory.getValidator();
  }

  @AfterAll
  static void closeValidator() {
    validatorFactory.close();
  }

  @BeforeEach
  void setUp() {
    taskService = new TaskService(taskRepository, validator);
  }

  @Test
  void shouldListTasks() {
    var createdAt = Instant.parse("2026-07-29T20:15:00Z");
    when(taskRepository.findAll()).thenReturn(List.of(
        new Task(1L, "Listar tarefas", false, createdAt)));

    var tasks = taskService.list();

    assertThat(tasks).containsExactly(
        new TaskResponse(1L, "Listar tarefas", false, createdAt));
  }

  @Test
  void shouldCreateTaskWhenTitleIsValid() {
    var createdAt = Instant.parse("2026-07-29T20:15:00Z");
    var savedTask = new Task(1L, "Criar tarefa valida", false, createdAt);
    var taskCaptor = ArgumentCaptor.forClass(Task.class);
    when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

    var result = taskService.create(new CreateTaskRequest("Criar tarefa valida"));

    assertThat(result).isEqualTo(
        new TaskResponse(1L, "Criar tarefa valida", false, createdAt));
    verify(taskRepository).save(taskCaptor.capture());
    assertThat(taskCaptor.getValue().getTitle()).isEqualTo("Criar tarefa valida");
    assertThat(taskCaptor.getValue().isCompleted()).isFalse();
    assertThat(taskCaptor.getValue().getCreatedAt()).isNotNull();
  }

  @Test
  void shouldRejectCreateTaskWhenTitleHasLessThanThreeCharacters() {
    var request = new CreateTaskRequest("Ir");

    assertThatThrownBy(() -> taskService.create(request))
        .isInstanceOf(ConstraintViolationException.class);
    verify(taskRepository, never()).save(any(Task.class));
  }

  @Test
  void shouldToggleCompletedStatusWhenTaskExists() {
    var task = new Task(
        1L,
        "Alternar tarefa",
        false,
        Instant.parse("2026-07-29T20:15:00Z"));
    when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
    when(taskRepository.save(task)).thenReturn(task);

    var result = taskService.toggle(1L);

    assertThat(result.completed()).isTrue();
    verify(taskRepository).save(task);
  }

  @Test
  void shouldUpdateTitleAndPreserveTaskStateWhenTaskExists() {
    var createdAt = Instant.parse("2026-07-29T20:15:00Z");
    var task = new Task(1L, "Titulo original", true, createdAt);
    when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
    when(taskRepository.save(task)).thenReturn(task);

    var result = taskService.update(1L, new UpdateTaskRequest("Titulo atualizado"));

    assertThat(result).isEqualTo(
        new TaskResponse(1L, "Titulo atualizado", true, createdAt));
    assertThat(task.getTitle()).isEqualTo("Titulo atualizado");
    assertThat(task.isCompleted()).isTrue();
    assertThat(task.getCreatedAt()).isEqualTo(createdAt);
    verify(taskRepository).save(task);
  }

  @Test
  void shouldRejectUpdateWhenTitleIsInvalid() {
    var request = new UpdateTaskRequest("Ir");

    assertThatThrownBy(() -> taskService.update(1L, request))
        .isInstanceOf(ConstraintViolationException.class);
    verify(taskRepository, never()).findById(any());
    verify(taskRepository, never()).save(any(Task.class));
  }

  @Test
  void shouldThrowResourceNotFoundExceptionWhenUpdatingMissingTask() {
    when(taskRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> taskService.update(
        99L,
        new UpdateTaskRequest("Titulo atualizado")))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessage("Task with id 99 was not found.");
    verify(taskRepository, never()).save(any(Task.class));
  }

  @Test
  void shouldThrowResourceNotFoundExceptionWhenDeletingMissingTask() {
    when(taskRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> taskService.delete(99L))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessage("Task with id 99 was not found.");
    verify(taskRepository, never()).delete(any(Task.class));
  }

  @Test
  void shouldDeleteTaskWhenTaskExists() {
    var task = new Task(
        1L,
        "Excluir tarefa",
        false,
        Instant.parse("2026-07-29T20:15:00Z"));
    when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

    taskService.delete(1L);

    verify(taskRepository).delete(task);
  }
}
