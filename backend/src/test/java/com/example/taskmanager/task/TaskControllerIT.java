package com.example.taskmanager.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private TaskRepository taskRepository;

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @BeforeEach
  void setUp() {
    taskRepository.deleteAll();
  }

  @Test
  void shouldListPersistedTasks() throws Exception {
    var createdAt = Instant.parse("2026-07-29T18:30:00Z");
    var task = taskRepository.saveAndFlush(
        new Task(null, "Revisar contrato OpenAPI", false, createdAt));

    mockMvc.perform(get("/api/tasks"))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$[0].id").value(task.getId()))
        .andExpect(jsonPath("$[0].title").value("Revisar contrato OpenAPI"))
        .andExpect(jsonPath("$[0].completed").value(false))
        .andExpect(jsonPath("$[0].createdAt").value("2026-07-29T18:30:00Z"));
  }

  @Test
  void shouldCreateAndPersistTask() throws Exception {
    var request = new CreateTaskRequest("Criar tarefa pela API");

    mockMvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.id").isNumber())
        .andExpect(jsonPath("$.title").value("Criar tarefa pela API"))
        .andExpect(jsonPath("$.completed").value(false))
        .andExpect(jsonPath("$.createdAt").isNotEmpty());

    assertThat(taskRepository.findAll())
        .singleElement()
        .satisfies(task -> {
          assertThat(task.getTitle()).isEqualTo("Criar tarefa pela API");
          assertThat(task.isCompleted()).isFalse();
          assertThat(task.getCreatedAt()).isNotNull();
        });
  }

  @Test
  void shouldToggleAndPersistCompletedStatus() throws Exception {
    var task = taskRepository.saveAndFlush(new Task("Alternar tarefa pela API"));

    mockMvc.perform(patch("/api/tasks/{id}/toggle", task.getId()))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.id").value(task.getId()))
        .andExpect(jsonPath("$.title").value("Alternar tarefa pela API"))
        .andExpect(jsonPath("$.completed").value(true))
        .andExpect(jsonPath("$.createdAt").isNotEmpty());

    assertThat(taskRepository.findById(task.getId()))
        .get()
        .extracting(Task::isCompleted)
        .isEqualTo(true);
  }

  @Test
  void shouldDeletePersistedTask() throws Exception {
    var task = taskRepository.saveAndFlush(new Task("Excluir tarefa pela API"));

    mockMvc.perform(delete("/api/tasks/{id}", task.getId()))
        .andExpect(status().isNoContent())
        .andExpect(content().string(""));

    assertThat(taskRepository.findById(task.getId())).isEmpty();
  }

  @Test
  void shouldRejectInvalidTaskRequest() throws Exception {
    mockMvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"title":"Ir"}
                """))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.status").value(400));

    assertThat(taskRepository.count()).isZero();
  }

  @Test
  void shouldReturnNotFoundWhenTogglingMissingTask() throws Exception {
    mockMvc.perform(patch("/api/tasks/{id}/toggle", 999L))
        .andExpect(status().isNotFound())
        .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.status").value(404));
  }

  @Test
  void shouldReturnNotFoundWhenDeletingMissingTask() throws Exception {
    mockMvc.perform(delete("/api/tasks/{id}", 999L))
        .andExpect(status().isNotFound())
        .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.status").value(404));
  }

  @Test
  @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
  void shouldReturnInternalServerErrorForUnexpectedFailure() throws Exception {
    jdbcTemplate.execute("drop table tasks");

    mockMvc.perform(get("/api/tasks"))
        .andExpect(status().isInternalServerError())
        .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.status").value(500))
        .andExpect(jsonPath("$.detail").value(
            "An unexpected error occurred while processing the request."));
  }
}
