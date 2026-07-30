package com.example.taskmanager.task;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
class TaskDtoJsonTests {

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  void shouldSerializeTaskResponseToContractJson() {
    var response = new TaskResponse(
        42L,
        "Validar serializacao JSON",
        true,
        Instant.parse("2026-07-29T20:15:00Z"));

    var json = objectMapper.valueToTree(response);

    assertThat(json.size()).isEqualTo(4);
    assertThat(json.get("id").asLong()).isEqualTo(42L);
    assertThat(json.get("title").stringValue()).isEqualTo("Validar serializacao JSON");
    assertThat(json.get("completed").asBoolean()).isTrue();
    assertThat(json.get("createdAt").stringValue()).isEqualTo("2026-07-29T20:15:00Z");
  }

  @Test
  void shouldDeserializeCreateTaskRequestFromContractJson() {
    var request = objectMapper.readValue(
        """
        {"title":"Criar DTO de entrada"}
        """,
        CreateTaskRequest.class);

    assertThat(request.title()).isEqualTo("Criar DTO de entrada");
  }
}
