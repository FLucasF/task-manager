# Stack

## Arquitetura

O projeto esta organizado como uma aplicacao Full Stack com separacao fisica entre backend e frontend na raiz:

- `backend/`: API REST com Spring Boot.
- `frontend/`: aplicacao web React criada com Vite e TypeScript.

## Backend

- Java 21
- Spring Boot 4.1.0
- Spring Web
- Spring Validation
- Maven

O backend expoe recursos sob `/api` e libera CORS conforme `CORS_ALLOWED_ORIGINS`/`app.cors.allowed-origins`.

## Frontend

- React 19
- Vite 7
- TypeScript
- Axios para chamadas HTTP
- Vitest e Testing Library para testes de componentes
- Playwright para testes end-to-end
- Proxy Vite de `/api` para `VITE_BACKEND_PROXY_TARGET` em desenvolvimento

## Contrato de API

O contrato REST canonico da To-Do List esta documentado em `openapi.yaml` na raiz do projeto.

## Especificacoes do Projeto

As especificacoes de arquitetura, testes e UI/UX ficam centralizadas em `specs/`:

- `specs/1-architecture-spec.md`
- `specs/3-testing-strategy.md`
- `specs/4-ui-ux-spec.md`
