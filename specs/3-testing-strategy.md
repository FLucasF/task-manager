# Testing Strategy - Task Manager

## Objetivo

Definir diretrizes e padroes de teste para garantir confiabilidade do backend Spring Boot 4.1.x/Java 21 e do frontend React 19/Vite 7/TypeScript. A versao exata do Spring Boot deve seguir `backend/pom.xml`. A estrategia cobre testes unitarios, integracao, componentes e E2E.

## Principios Gerais

- Priorizar testes deterministas, independentes e executaveis em pipeline CI.
- Nomear testes pelo comportamento esperado, usando formato `should...when...`.
- Validar casos de sucesso, falhas de validacao e erros de dominio.
- Manter fixtures pequenas, explicitas e proximas dos testes.
- Usar o padrao Arrange-Act-Assert (AAA) para legibilidade.

## Backend

### Ordem Obrigatoria de Criacao das Camadas

Antes de gerar qualquer teste Mockito ou MockMvc, o backend deve conter as camadas previstas pela arquitetura de producao:

1. Entity
   - Criar a entidade JPA `Task`.
   - Campos minimos: `id`, `title`, `completed`, `createdAt`.
   - Aplicar validacoes compativeis com o contrato OpenAPI: `title` obrigatorio, nao branco, minimo de 3 e maximo de 100 caracteres.

2. Repository
   - Criar `TaskRepository` como interface Spring Data JPA.
   - O repository deve ser a unica dependencia de persistencia usada diretamente pelo service.

3. Service
   - Criar `TaskService` com injecao por construtor de `TaskRepository`.
   - Concentrar no service as regras de criacao, listagem, toggle e delecao.
   - Lancar `ResourceNotFoundException` quando uma tarefa por id nao existir.

4. Controller e DTOs
   - O controller deve depender de `TaskService`.
   - O controller deve receber e retornar DTOs, sem expor a entidade JPA diretamente.
   - O `GlobalExceptionHandler` deve converter erros em ProblemDetails.

Os testes abaixo so devem ser gerados depois dessas camadas existirem. Caso o backend ainda contenha apenas controller/DTO, a primeira tarefa de implementacao deve ser criar Entity, Repository e Service antes da suite de testes.

### Testes Unitarios - Mockito

Ferramentas:

- JUnit 5
- Mockito
- AssertJ

Escopo:

- Testar regras de negocio do `TaskService` sem subir o contexto Spring.
- Mockar dependencias externas ao service, principalmente `TaskRepository`.
- Verificar interacoes relevantes com `verify(...)` apenas quando fizer parte do comportamento.

Padrao AAA:

```java
@Test
void shouldCreateTaskWhenTitleIsValid() {
    // Arrange
    var request = new CreateTaskRequest("Revisar contrato OpenAPI");
    var savedTask = new Task(1L, "Revisar contrato OpenAPI", false, Instant.now());
    when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

    // Act
    var result = taskService.create(request);

    // Assert
    assertThat(result.id()).isEqualTo(1L);
    assertThat(result.title()).isEqualTo("Revisar contrato OpenAPI");
    assertThat(result.completed()).isFalse();
    verify(taskRepository).save(any(Task.class));
}
```

#### Cenarios Obrigatorios - `TaskServiceTest`

1. `shouldCreateTaskWhenTitleIsValid`
   - Dado um `CreateTaskRequest` com titulo valido.
   - Quando `TaskService.create(...)` for executado.
   - Entao deve salvar a entidade e retornar DTO com `completed = false`.

2. `shouldRejectCreateTaskWhenTitleHasLessThanThreeCharacters`
   - Dado um titulo com menos de 3 caracteres, como `"Ir"`.
   - Quando `TaskService.create(...)` for executado.
   - Entao deve lancar excecao de validacao ou dominio.
   - Entao nao deve chamar `taskRepository.save(...)`.

3. `shouldToggleCompletedStatusWhenTaskExists`
   - Dado uma tarefa existente com `completed = false`.
   - Quando `TaskService.toggle(id)` for executado.
   - Entao deve alternar para `completed = true`.
   - Entao deve persistir a alteracao.

4. `shouldThrowResourceNotFoundExceptionWhenDeletingMissingTask`
   - Dado um id inexistente.
   - Quando `TaskService.delete(id)` for executado.
   - Entao deve lancar `ResourceNotFoundException`.
   - Entao nao deve chamar `taskRepository.delete(...)`.

### Testes de Integracao - MockMvc + H2

Ferramentas:

- `@SpringBootTest`
- `@AutoConfigureMockMvc`
- MockMvc
- Banco H2 em memoria
- ObjectMapper

Escopo:

- Validar o fluxo HTTP real do controller ate a camada de persistencia.
- Usar H2 para confirmar persistencia real na base em memoria.
- Nao mockar `TaskService` nem `TaskRepository` nos testes de integracao.

Configuracao esperada:

```java
@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerIT {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired TaskRepository taskRepository;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
    }
}
```

#### Cenarios Obrigatorios - `TaskControllerIT`

1. Criacao com sucesso
   - `POST /api/tasks`
   - Body: `{ "title": "Revisar contrato OpenAPI" }`
   - Esperado: HTTP `201`
   - Validar JSON com `id`, `title`, `completed = false`, `createdAt`.
   - Validar registro salvo no H2 via `taskRepository.findAll()`.

2. Listagem com sucesso
   - Dado tarefas previamente persistidas no H2.
   - `GET /api/tasks`
   - Esperado: HTTP `200`
   - Validar array JSON e campos principais.

3. Validacao de request invalido
   - `POST /api/tasks`
   - Body com `title` em branco ou menor que 3 caracteres.
   - Esperado: HTTP `400`
   - Validar resposta `application/problem+json`.
   - Validar `status = 400`, `title` e detalhe de validacao.

4. Toggle de tarefa existente
   - Dado uma tarefa persistida com `completed = false`.
   - `PATCH /api/tasks/{id}/toggle`
   - Esperado: HTTP `200`
   - Validar `completed = true` no JSON.
   - Validar persistencia alterada no H2.

5. Toggle de tarefa inexistente
   - `PATCH /api/tasks/999/toggle`
   - Esperado: HTTP `404`
   - Validar resposta `application/problem+json`.

6. Exclusao com sucesso
   - Dado uma tarefa persistida.
   - `DELETE /api/tasks/{id}`
   - Esperado: HTTP `204`
   - Validar que o registro nao existe mais no H2.

7. Exclusao de tarefa inexistente
   - `DELETE /api/tasks/999`
   - Esperado: HTTP `404`
   - Validar resposta `application/problem+json`.

## Frontend

### Testes de Componente - Vitest + React Testing Library

Ferramentas:

- Vitest
- React Testing Library
- `@testing-library/user-event`
- `@testing-library/jest-dom`

Escopo:

- Testar comportamento visivel ao usuario.
- Evitar testar detalhes internos de implementacao.
- Preferir queries acessiveis: `getByRole`, `getByLabelText`, `findByText`.

#### Cenarios Obrigatorios

1. Renderizacao do formulario
   - Renderizar `TaskInput`.
   - Validar input de titulo e botao de envio.
   - Validar labels acessiveis.

2. Simulacao de eventos com `userEvent`
   - Digitar um titulo valido.
   - Clicar no botao de adicionar.
   - Validar chamada do callback `onSubmit` com o titulo informado.

3. Estado desabilitado
   - Renderizar componente com `disabled` ou `isSubmitting`.
   - Validar input e botao desabilitados.
   - Validar que o submit nao e disparado enquanto desabilitado.

4. Estado de erro
   - Renderizar componente com mensagem de erro.
   - Validar que a mensagem aparece com papel acessivel, como `role="alert"`.
   - Validar que o usuario consegue corrigir o input e tentar novamente.

Exemplo de estilo:

```tsx
it('should submit title when form is filled', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<TaskInput onSubmit={onSubmit} disabled={false} error={null} />);

  await user.type(screen.getByLabelText(/titulo/i), 'Revisar contrato OpenAPI');
  await user.click(screen.getByRole('button', { name: /adicionar/i }));

  expect(onSubmit).toHaveBeenCalledWith('Revisar contrato OpenAPI');
});
```

## E2E - Playwright

Padrao:

- Usar Page Object Model (POM).
- Centralizar seletores e acoes da pagina em `TaskPage.ts`.
- Testes E2E devem validar a jornada completa sem depender de detalhes internos do React.

### Page Object Obrigatorio - `TaskPage.ts`

Local sugerido:

- `frontend/tests/e2e/pages/TaskPage.ts`

Responsabilidades:

- Navegar para a tela principal.
- Adicionar tarefa.
- Marcar tarefa como concluida.
- Excluir tarefa.
- Consultar estado visual da lista.

Contrato sugerido:

```ts
import { expect, type Locator, type Page } from '@playwright/test';

export class TaskPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel(/titulo/i);
    this.addButton = page.getByRole('button', { name: /adicionar/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTask(title: string) {
    await this.titleInput.fill(title);
    await this.addButton.click();
  }

  taskItem(title: string) {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  async toggleTask(title: string) {
    await this.taskItem(title).getByRole('checkbox').click();
  }

  async deleteTask(title: string) {
    await this.taskItem(title).getByRole('button', { name: /excluir/i }).click();
  }

  async expectTaskVisible(title: string) {
    await expect(this.taskItem(title)).toBeVisible();
  }

  async expectTaskCompleted(title: string) {
    await expect(this.taskItem(title).getByRole('checkbox')).toBeChecked();
  }

  async expectTaskHidden(title: string) {
    await expect(this.taskItem(title)).toHaveCount(0);
  }
}
```

### Jornada E2E Obrigatoria

Arquivo sugerido:

- `frontend/tests/e2e/tasks.spec.ts`

Fluxo:

1. Acessar a aplicacao.
2. Adicionar tarefa com titulo realista: `"Revisar contrato OpenAPI"`.
3. Validar que a tarefa aparece na lista.
4. Marcar a tarefa como concluida.
5. Validar estado visual de concluida.
6. Excluir a tarefa.
7. Validar que a tarefa nao aparece mais na lista.

Exemplo:

```ts
import { test } from '@playwright/test';
import { TaskPage } from './pages/TaskPage';

test('should add complete and delete a task', async ({ page }) => {
  const taskPage = new TaskPage(page);
  const title = 'Revisar contrato OpenAPI';

  await taskPage.goto();
  await taskPage.addTask(title);
  await taskPage.expectTaskVisible(title);
  await taskPage.toggleTask(title);
  await taskPage.expectTaskCompleted(title);
  await taskPage.deleteTask(title);
  await taskPage.expectTaskHidden(title);
});
```

## Criterios de Qualidade

- Backend unitario cobre regras do `TaskService`.
- Backend integracao cobre controller, validacao, ProblemDetails e persistencia H2.
- Frontend componente cobre formulario, eventos, disabled e erro.
- E2E cobre a jornada principal de usuario com POM.
- Todos os testes devem ser executaveis localmente e no CI sem depender de dados externos.
