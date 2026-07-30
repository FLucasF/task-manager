package com.example.taskmanager.task;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;

class TaskMapperTests {

  @Test
  void shouldMapCreateRequestToNewTask() {
    var request = new CreateTaskRequest("Mapear request para entidade");

    var task = TaskMapper.toEntity(request);

    assertThat(task.getId()).isNull();
    assertThat(task.getTitle()).isEqualTo("Mapear request para entidade");
    assertThat(task.isCompleted()).isFalse();
    assertThat(task.getCreatedAt()).isNotNull();
  }

  @Test
  void shouldMapTaskToResponse() {
    var createdAt = Instant.parse("2026-07-29T20:15:00Z");
    var task = new Task(42L, "Mapear entidade para response", true, createdAt);

    var response = TaskMapper.toResponse(task);

    assertThat(response.id()).isEqualTo(42L);
    assertThat(response.title()).isEqualTo("Mapear entidade para response");
    assertThat(response.completed()).isTrue();
    assertThat(response.createdAt()).isEqualTo(createdAt);
  }
}
