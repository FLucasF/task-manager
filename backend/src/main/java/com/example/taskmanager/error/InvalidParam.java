package com.example.taskmanager.error;

public record InvalidParam(
    String name,
    String reason) {
}
