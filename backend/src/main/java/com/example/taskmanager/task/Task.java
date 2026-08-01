package com.example.taskmanager.task;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

@Entity
@Table(name = "tasks")
public class Task {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Size(min = 3, max = 100)
  @Column(nullable = false, length = 100)
  private String title;

  @Column(nullable = false)
  private boolean completed;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  protected Task() {
  }

  public Task(String title) {
    this(null, title, false, Instant.now());
  }

  public Task(Long id, String title, boolean completed, Instant createdAt) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.createdAt = createdAt;
  }

  public Long getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public boolean isCompleted() {
    return completed;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void toggleCompleted() {
    completed = !completed;
  }

  public void updateTitle(String title) {
    this.title = title;
  }
}
