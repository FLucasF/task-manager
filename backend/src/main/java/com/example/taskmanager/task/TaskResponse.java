package com.example.taskmanager.task;

import java.time.Instant;

public record TaskResponse(
    Long id,
    String title,
    boolean completed,
    Instant createdAt) {
}
