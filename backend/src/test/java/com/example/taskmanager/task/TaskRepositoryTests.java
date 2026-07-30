package com.example.taskmanager.task;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class TaskRepositoryTests {

  @Autowired
  private TaskRepository taskRepository;

  @Test
  void shouldSaveAndFindTaskInH2() {
    var savedTask = taskRepository.saveAndFlush(new Task("Testar repository com H2"));

    var persistedTask = taskRepository.findById(savedTask.getId());

    assertThat(savedTask.getId()).isPositive();
    assertThat(persistedTask).isPresent();
    assertThat(persistedTask.orElseThrow().getTitle()).isEqualTo("Testar repository com H2");
  }

  @Test
  void shouldDeleteTaskFromH2() {
    var savedTask = taskRepository.saveAndFlush(new Task("Excluir tarefa persistida"));

    taskRepository.deleteById(savedTask.getId());
    taskRepository.flush();

    assertThat(taskRepository.findById(savedTask.getId())).isEmpty();
  }
}
