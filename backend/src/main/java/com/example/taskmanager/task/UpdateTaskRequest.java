package com.example.taskmanager.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTaskRequest(
    @NotBlank
    @Size(min = 3, max = 100)
    String title) {
}
