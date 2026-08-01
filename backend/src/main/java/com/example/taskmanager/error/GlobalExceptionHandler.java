package com.example.taskmanager.error;

import com.example.taskmanager.task.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);
  private static final URI VALIDATION_ERROR_TYPE = URI.create(
      "https://api.task-manager.local/problems/validation-error");
  private static final URI TASK_NOT_FOUND_TYPE = URI.create(
      "https://api.task-manager.local/problems/task-not-found");
  private static final URI INTERNAL_SERVER_ERROR_TYPE = URI.create(
      "https://api.task-manager.local/problems/internal-server-error");

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ProblemDetail> handleMethodArgumentNotValid(
      MethodArgumentNotValidException exception,
      HttpServletRequest request) {
    var invalidParams = exception.getBindingResult().getFieldErrors().stream()
        .map(error -> new InvalidParam(error.getField(), error.getDefaultMessage()))
        .toList();
    var problem = createProblem(
        HttpStatus.BAD_REQUEST,
        VALIDATION_ERROR_TYPE,
        "Validation failed",
        "The request body contains invalid fields.",
        request);
    problem.setProperty("invalidParams", invalidParams);

    return response(problem);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ProblemDetail> handleConstraintViolation(
      ConstraintViolationException exception,
      HttpServletRequest request) {
    var invalidParams = exception.getConstraintViolations().stream()
        .map(violation -> new InvalidParam(
            lastPathSegment(violation.getPropertyPath().toString()),
            violation.getMessage()))
        .toList();
    var problem = createProblem(
        HttpStatus.BAD_REQUEST,
        VALIDATION_ERROR_TYPE,
        "Validation failed",
        "The request contains invalid values.",
        request);
    problem.setProperty("invalidParams", invalidParams);

    return response(problem);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ProblemDetail> handleResourceNotFound(
      ResourceNotFoundException exception,
      HttpServletRequest request) {
    var problem = createProblem(
        HttpStatus.NOT_FOUND,
        TASK_NOT_FOUND_TYPE,
        "Task not found",
        exception.getMessage(),
        request);

    return response(problem);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ProblemDetail> handleUnexpectedException(
      Exception exception,
      HttpServletRequest request) {
    LOGGER.error("Unexpected error while processing {}", request.getRequestURI(), exception);
    var problem = createProblem(
        HttpStatus.INTERNAL_SERVER_ERROR,
        INTERNAL_SERVER_ERROR_TYPE,
        "Internal server error",
        "An unexpected error occurred while processing the request.",
        request);

    return response(problem);
  }

  private ProblemDetail createProblem(
      HttpStatus status,
      URI type,
      String title,
      String detail,
      HttpServletRequest request) {
    var problem = ProblemDetail.forStatusAndDetail(status, detail);
    problem.setType(type);
    problem.setTitle(title);
    problem.setInstance(URI.create(request.getRequestURI()));
    problem.setProperty("timestamp", Instant.now());
    return problem;
  }

  private ResponseEntity<ProblemDetail> response(ProblemDetail problem) {
    return ResponseEntity.status(problem.getStatus())
        .contentType(MediaType.APPLICATION_PROBLEM_JSON)
        .body(problem);
  }

  private String lastPathSegment(String path) {
    var separatorIndex = path.lastIndexOf('.');
    return separatorIndex >= 0 ? path.substring(separatorIndex + 1) : path;
  }
}
