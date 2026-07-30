package com.example.taskmanager.task;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class TaskValidationTests {

  @Autowired
  private Validator validator;

  @ParameterizedTest
  @MethodSource("invalidTitles")
  void shouldRejectInvalidTitleInDomainAndRequest(String title) {
    var taskViolations = validator.validate(new Task(title));
    var requestViolations = validator.validate(new CreateTaskRequest(title));

    assertThat(taskViolations).anyMatch(TaskValidationTests::isTitleViolation);
    assertThat(requestViolations).anyMatch(TaskValidationTests::isTitleViolation);
  }

  @Test
  void shouldAcceptValidTitleInDomainAndRequest() {
    var title = "Revisar contrato OpenAPI";

    assertThat(validator.validate(new Task(title))).isEmpty();
    assertThat(validator.validate(new CreateTaskRequest(title))).isEmpty();
  }

  private static Stream<String> invalidTitles() {
    return Stream.of(null, "", "   ", "Ir", "a".repeat(101));
  }

  private static boolean isTitleViolation(ConstraintViolation<?> violation) {
    return violation.getPropertyPath().toString().equals("title");
  }
}
