package com.example.taskmanager.task;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class TaskPersistenceTests {

  @Autowired
  private EntityManager entityManager;

  @Test
  void shouldPersistTaskWithDefaultsInH2() {
    var task = new Task("Persistir tarefa no H2");

    entityManager.persist(task);
    entityManager.flush();
    var taskId = task.getId();
    entityManager.clear();

    var persistedTask = entityManager.find(Task.class, taskId);

    assertThat(taskId).isPositive();
    assertThat(persistedTask).isNotNull();
    assertThat(persistedTask.getTitle()).isEqualTo("Persistir tarefa no H2");
    assertThat(persistedTask.isCompleted()).isFalse();
    assertThat(persistedTask.getCreatedAt()).isNotNull();
  }
}
