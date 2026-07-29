package com.example.taskmanager.task;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class TaskControllerTests {

  @Test
  void listTasksReturnsInitialTask() {
    TaskController controller = new TaskController();

    List<TaskResponse> tasks = controller.listTasks();

    assertThat(tasks).hasSize(1);
    assertThat(tasks.getFirst().id()).isEqualTo(1L);
    assertThat(tasks.getFirst().title()).isEqualTo("Conectar frontend ao backend");
    assertThat(tasks.getFirst().completed()).isFalse();
  }
}
