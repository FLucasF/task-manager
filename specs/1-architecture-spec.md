# Task Manager Architecture Specification

## Backend: Spring Boot 4.1.x + Java 21

The backend version must follow `backend/pom.xml`; the current canonical baseline is Spring Boot `4.1.0` with Java `21`.

### Layered Architecture

- **Controller (REST):** exposes HTTP endpoints, validates request boundaries, delegates business operations to services, and returns DTOs or RFC 7807 error responses.
- **Service (Business Rules):** owns use cases and domain rules, coordinates repositories and mappers, and keeps controllers free from business logic.
- **Repository (Data Access):** uses Spring Data JPA repositories for persistence concerns and isolates database access from service logic.
- **DTO (Data Transfer):** defines request and response contracts so the JPA entity `Task` is not exposed directly through REST controllers.

### Applied Design Patterns

- **DTO Pattern:** controllers must receive and return DTOs instead of exposing the `Task` JPA entity.
- **Global Exception Handler:** use `@ControllerAdvice` to centralize exception handling and return errors using RFC 7807 Problem Details.
- **Mapper Pattern:** convert between `Task` and `TaskDTO` through a dedicated mapper, implemented either as static mapping methods or with MapStruct.

### SOLID Principles

- **Single Responsibility Principle:** each layer has one clear responsibility: HTTP boundary, business rules, persistence, or data transfer.
- **Dependency Inversion Principle:** dependencies are injected through constructors, allowing services and controllers to depend on abstractions/contracts instead of creating collaborators directly.

## Frontend: React 19 + Vite 7 + TypeScript

### Feature-Based Structure

- Organize task-related code under `/src/features/tasks`.
- Keep task API access, hooks, containers, presentational components, and feature-specific types close to the feature they support.

### Applied Design Patterns

- **Custom Hooks Pattern:** encapsulate Axios calls and task state logic in a `useTasks()` hook.
- **Container / Presentational Pattern:** separate stateful orchestration components from visual components.
- **Presentational Components:** `TaskItem` and `TaskInput` should remain focused on rendering and user interaction props, without owning API orchestration.

### Expected Frontend Responsibilities

- Use TypeScript interfaces/types for task DTOs and component props.
- Keep Axios communication behind feature-level API helpers or the `useTasks()` hook.
- Let containers coordinate loading, errors, mutations, and data refresh while presentational components stay reusable and easy to test.
