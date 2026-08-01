# Implementation Plan - Task Manager Full Stack

## Escopo e Regras

- [ ] Implementar o To-Do List Full Stack do zero funcional, alinhado ao contrato canonico `openapi.yaml`.
- [ ] Manter `openapi.yaml` como fonte da verdade para endpoints, DTOs, validacoes e ProblemDetails.
- [ ] Usar `specs/1-architecture-spec.md`, `specs/3-testing-strategy.md` e `specs/4-ui-ux-spec.md` como documentacao complementar de arquitetura, testes e UI/UX.
- [ ] Executar a ordem backend obrigatoria antes dos testes: Entity -> Repository -> Service -> Controller/DTOs -> Exception Handler -> Testes.
- [ ] Preparar Tailwind no frontend antes de criar componentes React.
- [ ] Separar responsabilidades entre `dev` e `qa`.
- [ ] Incluir cobertura de testes em cada tarefa implementavel.
- [ ] Nao iniciar implementacao sem aprovacao explicita deste plano.

## Fase 0 - Alinhamento Inicial

- [x] `dev` - Confirmar que `openapi.yaml` da raiz e o unico contrato OpenAPI canonico do projeto.
  - Cobertura de teste: validar parsing YAML e conferir `CreateTaskRequest.title` com `minLength: 3`, `maxLength: 100` e `application/problem+json`.

- [x] `dev` - Confirmar que as specs seguem o stack canonico do projeto: React 19, Vite 7, Java 21 e Spring Boot 4.1.x.
  - Cobertura de teste: nenhuma automatizada; evidencia por checklist no PR.

- [x] `qa` - Definir matriz minima de aceite com endpoints, estados UI, acessibilidade e fluxos E2E.
  - Cobertura de teste: matriz deve mapear cada criterio para unitario, integracao, componente ou E2E.

## Fase 1 - Backend Base e Camadas

- [x] `dev` - Ajustar dependencias Maven para suportar Spring Data JPA, H2 em testes/desenvolvimento e Bean Validation, preservando Java 21 e Spring Boot 4.1.x.
  - Cobertura de teste: `mvn test` deve subir o contexto Spring sem falhas.

- [x] `dev` - Criar Entity JPA `Task` com `id`, `title`, `completed`, `createdAt`.
  - Cobertura de teste: cobrir persistencia real em H2 via teste de integracao repository ou por `TaskControllerIT`.

- [x] `dev` - Aplicar validacoes de dominio/DTO para `title`: obrigatorio, `@NotBlank`, `@Size(min = 3, max = 100)`.
  - Cobertura de teste: `TaskServiceTest` para titulo menor que 3; `TaskControllerIT` para HTTP 400 e ProblemDetails.

- [x] `dev` - Criar `TaskRepository extends JpaRepository<Task, Long>`.
  - Cobertura de teste: validar save/find/delete em H2 indiretamente nos testes de integracao.

- [x] `dev` - Criar DTOs de entrada e saida: `CreateTaskRequest`, `TaskResponse`.
  - Cobertura de teste: validar serializacao JSON nos testes MockMvc.

- [x] `dev` - Criar mapper dedicado para conversao `Task` -> `TaskResponse` e request -> entity, usando mapper estatico ou classe dedicada.
  - Cobertura de teste: cobrir mapeamento por testes unitarios de service ou teste especifico de mapper se houver logica nao trivial.

- [x] `dev` - Criar `TaskService` com injecao por construtor e regras de listagem, criacao, toggle e delecao.
  - Cobertura de teste: `TaskServiceTest` com Mockito cobrindo sucesso na criacao, rejeicao de titulo curto, toggle completed e erro de delecao inexistente.

- [x] `dev` - Criar `ResourceNotFoundException` para recursos inexistentes.
  - Cobertura de teste: `TaskServiceTest` e `TaskControllerIT` para 404.

## Fase 2 - Backend REST e Erros RFC 7807

- [x] `dev` - Refatorar `TaskController` para depender de `TaskService` e expor somente DTOs.
  - Cobertura de teste: `TaskControllerIT` para `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/{id}/toggle` e `DELETE /api/tasks/{id}`.

- [x] `dev` - Implementar `GlobalExceptionHandler` com `@ControllerAdvice` retornando ProblemDetails para 400, 404 e 500.
  - Cobertura de teste: MockMvc validando `Content-Type: application/problem+json`, `status`, `title`, `detail`, `instance` e `invalidParams` quando aplicavel.

- [x] `dev` - Garantir codigos HTTP do contrato: 201 criacao, 200 listagem/toggle, 204 delecao, 400 validacao, 404 inexistente, 500 erro inesperado.
  - Cobertura de teste: `TaskControllerIT` cobrindo todos os codigos obrigatorios.

- [x] `qa` - Criar ou revisar `TaskControllerIT` com `@SpringBootTest`, `@AutoConfigureMockMvc` e H2 real.
  - Cobertura de teste: persistencia real na base em memoria para criar, listar, alternar e excluir.

- [x] `qa` - Criar ou revisar `TaskServiceTest` com JUnit 5, Mockito, AssertJ e padrao AAA.
  - Cobertura de teste: quatro cenarios obrigatorios definidos em `specs/3-testing-strategy.md`.

## Fase 3 - Frontend Setup e Arquitetura

- [x] `dev` - Instalar no `/frontend` as dependencias `tailwindcss`, `postcss` e `autoprefixer`.
  - Cobertura de teste: `npm run build` deve compilar CSS sem erros.

- [x] `dev` - Criar `tailwind.config.js`, `postcss.config.js` e integrar diretivas Tailwind no CSS global.
  - Cobertura de teste: build deve reconhecer classes Tailwind e preservar background `#121212`.

- [x] `dev` - Configurar tema Tailwind com tokens exigidos: `app.background: #121212`, superficies, textos, accent, danger e fonte sans.
  - Cobertura de teste: teste de componente ou snapshot leve pode validar classes principais no container raiz.

- [x] `dev` - Reorganizar frontend por feature em `/src/features/tasks`.
  - Cobertura de teste: imports resolvidos por `npm run build` e testes existentes atualizados.

- [x] `dev` - Criar tipos TypeScript alinhados ao OpenAPI: `Task`, `CreateTaskRequest`, `ProblemDetails`.
  - Cobertura de teste: typecheck via `npm run build`.

- [x] `dev` - Criar API helper com Axios para list, create, toggle e delete.
  - Cobertura de teste: mock de Axios ou MSW para sucesso e erro, se infraestrutura for adicionada; caso contrario cobrir via hook.

- [x] `dev` - Criar hook `useTasks()` encapsulando fetch inicial, loading, erro, create, toggle e delete.
  - Cobertura de teste: teste unitario/hook ou componente container validando loading, sucesso e erro de API.

## Fase 4 - Frontend UI, UX e A11y

- [x] `dev` - Criar container de tarefas responsavel por estado, chamadas do hook e composicao visual.
  - Cobertura de teste: componente/container com fetch inicial e renderizacao de lista.

- [x] `dev` - Criar `TaskInput` presentational com label associado por `htmlFor/id`, validacao visual e estados disabled/error.
  - Cobertura de teste: Vitest + RTL para renderizacao, `userEvent`, disabled e `role="alert"`.

- [x] `dev` - Criar `TaskItem` presentational usando `<article>`, checkbox/botao acessiveis e `aria-label="Excluir tarefa"` no botao icon-only.
  - Cobertura de teste: RTL validando titulo, checkbox, toggle, delete e nome acessivel.

- [x] `dev` - Implementar layout semantico com `<main>`, `<section>`, lista semantica e cards com superficies dark.
  - Cobertura de teste: RTL usando queries por role e checagem de landmarks principais.

- [ ] `dev` - Implementar Skeleton Loaders no formato dos cards para fetch inicial, sem spinner fullscreen.
  - Cobertura de teste: RTL validando skeleton durante loading e ausencia apos carregamento.

- [ ] `dev` - Implementar Empty State com icone/ilustracao sutil, titulo `Tudo limpo por aqui!` e texto de apoio.
  - Cobertura de teste: RTL validando estado vazio quando API retorna lista vazia.

- [ ] `dev` - Implementar Toast/Snackbar para erros de API com auto-dismiss, descarte manual, vermelho suave e `aria-live`.
  - Cobertura de teste: RTL com timers falsos para exibicao, descarte manual e auto-dismiss.

- [ ] `dev` - Garantir foco por teclado com `focus-visible` ring de 2px, estados hover/active/disabled e `prefers-reduced-motion`.
  - Cobertura de teste: axe/manual checklist para a11y; Playwright pode validar navegacao por Tab no fluxo principal.

- [ ] `qa` - Executar checklist de acessibilidade WCAG 2.1 AA para contraste, labels, botoes icon-only, live regions e reduced motion.
  - Cobertura de teste: relatorio QA anexado ao PR; automatizar com Testing Library e Playwright onde praticavel.

## Fase 5 - E2E e Qualidade Integrada

- [ ] `qa` - Criar Page Object `frontend/tests/e2e/pages/TaskPage.ts`.
  - Cobertura de teste: POM deve expor `goto`, `addTask`, `toggleTask`, `deleteTask`, `expectTaskVisible`, `expectTaskCompleted` e `expectTaskHidden`.

- [ ] `qa` - Criar teste Playwright da jornada completa: adicionar tarefa -> marcar concluida -> excluir.
  - Cobertura de teste: E2E validando UI integrada com backend real ou ambiente controlado equivalente.

- [ ] `qa` - Cobrir erros de API no frontend.
  - Cobertura de teste: componente/hook para toast de erro; opcional E2E interceptando falha de rede.

- [ ] `qa` - Cobrir validacao de titulo menor que 3 caracteres ponta a ponta.
  - Cobertura de teste: componente valida estado de erro; integracao backend valida HTTP 400 ProblemDetails.

- [ ] `qa` - Rodar suite backend completa.
  - Cobertura de teste: `mvn test` no `/backend`.

- [ ] `qa` - Rodar suite frontend completa.
  - Cobertura de teste: `npm test` ou comando equivalente de Vitest no `/frontend`.

- [ ] `qa` - Rodar build frontend.
  - Cobertura de teste: `npm run build` no `/frontend`.

- [ ] `qa` - Rodar E2E Playwright.
  - Cobertura de teste: `npx playwright test` no `/frontend`, com backend disponivel.

## Fase 6 - Criterios de Aceite Final

- [ ] `dev` - Confirmar que nenhum controller expoe entidade JPA diretamente.
  - Cobertura de teste: revisao de codigo.

- [ ] `dev` - Confirmar que dependencias sao injetadas por construtor.
  - Cobertura de teste: revisao de codigo e compilacao.

- [ ] `dev` - Confirmar que `CreateTaskRequest.title` segue `@NotBlank` e `@Size(min = 3, max = 100)`.
  - Cobertura de teste: unitario service e integracao controller.

- [ ] `qa` - Confirmar que ProblemDetails cobre 400, 404 e 500 conforme OpenAPI.
  - Cobertura de teste: MockMvc para 400/404; teste controlado ou handler unitario para 500.

- [ ] `qa` - Confirmar que UI usa dark mode com background principal exatamente `#121212`.
  - Cobertura de teste: inspeção visual e, se viavel, teste DOM/style.

- [ ] `qa` - Confirmar que a jornada principal passa em desktop e mobile.
  - Cobertura de teste: Playwright em pelo menos um viewport desktop e um mobile.

- [ ] `qa` - Confirmar cobertura minima por camada antes do aceite: service unitario, controller integracao, componentes frontend e E2E principal.
  - Cobertura de teste: checklist final com comandos executados e resultado.
