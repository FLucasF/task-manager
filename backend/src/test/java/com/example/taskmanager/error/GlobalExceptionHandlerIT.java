package com.example.taskmanager.error;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.taskmanager.task.ResourceNotFoundException;
import com.example.taskmanager.task.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class GlobalExceptionHandlerIT {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private TaskService taskService;

  @Test
  void shouldReturnProblemDetailsForInvalidRequest() throws Exception {
    mockMvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"title":"Ir"}
                """))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.type").value(
            "https://api.task-manager.local/problems/validation-error"))
        .andExpect(jsonPath("$.title").value("Validation failed"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.detail").value("The request body contains invalid fields."))
        .andExpect(jsonPath("$.instance").value("/api/tasks"))
        .andExpect(jsonPath("$.invalidParams[0].name").value("title"))
        .andExpect(jsonPath("$.invalidParams[0].reason", containsString("between 3 and 100")))
        .andExpect(jsonPath("$.timestamp").isNotEmpty());
  }

  @Test
  void shouldReturnProblemDetailsWhenTaskDoesNotExist() throws Exception {
    when(taskService.toggle(99L))
        .thenThrow(new ResourceNotFoundException("Task with id 99 was not found."));

    mockMvc.perform(patch("/api/tasks/{id}/toggle", 99L))
        .andExpect(status().isNotFound())
        .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.type").value(
            "https://api.task-manager.local/problems/task-not-found"))
        .andExpect(jsonPath("$.title").value("Task not found"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.detail").value("Task with id 99 was not found."))
        .andExpect(jsonPath("$.instance").value("/api/tasks/99/toggle"))
        .andExpect(jsonPath("$.timestamp").isNotEmpty());
  }

  @Test
  void shouldReturnSanitizedProblemDetailsForUnexpectedError() throws Exception {
    when(taskService.list()).thenThrow(new IllegalStateException("Sensitive database details"));

    mockMvc.perform(get("/api/tasks"))
        .andExpect(status().isInternalServerError())
        .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.type").value(
            "https://api.task-manager.local/problems/internal-server-error"))
        .andExpect(jsonPath("$.title").value("Internal server error"))
        .andExpect(jsonPath("$.status").value(500))
        .andExpect(jsonPath("$.detail").value(
            "An unexpected error occurred while processing the request."))
        .andExpect(jsonPath("$.instance").value("/api/tasks"))
        .andExpect(jsonPath("$.timestamp").isNotEmpty())
        .andExpect(content().string(not(containsString("Sensitive database details"))));
  }
}
