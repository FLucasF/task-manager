package com.example.taskmanager.task;

import java.time.Instant;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

  @GetMapping
  public List<TaskResponse> listTasks() {
    return List.of(
        new TaskResponse(1L, "Conectar frontend ao backend", false, Instant.parse("2026-07-28T21:00:00Z")));
  }
}
