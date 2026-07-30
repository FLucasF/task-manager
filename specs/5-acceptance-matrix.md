# Acceptance Matrix - Task Manager

## Objetivo

Definir a cobertura minima de aceite do Task Manager e manter rastreabilidade entre
`openapi.yaml`, as especificacoes do projeto e os testes automatizados. Cada criterio
possui um nivel de teste principal e, quando necessario, um nivel complementar.

## Niveis de Teste

| Nivel | Ferramenta principal | Responsabilidade |
|---|---|---|
| Unitario | JUnit 5, Mockito e AssertJ | Regras de dominio e comportamento isolado de handlers |
| Integracao | Spring Boot, MockMvc e H2 | Contrato HTTP, serializacao, persistencia e ProblemDetails |
| Componente | Vitest e React Testing Library | Estados visiveis, eventos e acessibilidade no DOM |
| E2E | Playwright | Jornadas reais no navegador com frontend e backend integrados |

## API e Persistencia

| ID | Criterio de aceite | Fonte | Nivel principal | Evidencia esperada |
|---|---|---|---|---|
| AC-API-01 | `GET /api/tasks` retorna `200` e uma lista de tarefas no schema `Task`. | `openapi.yaml` | Integracao | `TaskControllerIT` valida JSON e registros persistidos no H2. |
| AC-API-02 | `POST /api/tasks` com titulo valido retorna `201`, `completed=false`, `createdAt` e persiste a tarefa. | `openapi.yaml` | Integracao | `TaskControllerIT` valida resposta e consulta o H2. |
| AC-API-03 | `POST /api/tasks` rejeita titulo vazio, em branco, menor que 3 ou maior que 100 caracteres com `400`. | `openapi.yaml` | Integracao | Testes parametrizados validam limites e ausencia de persistencia. |
| AC-API-04 | `PATCH /api/tasks/{id}/toggle` retorna `200` e alterna o valor persistido de `completed`. | `openapi.yaml` | Integracao | `TaskControllerIT` valida resposta e estado posterior no H2. |
| AC-API-05 | Toggle de id inexistente retorna `404`. | `openapi.yaml` | Integracao | MockMvc valida status e corpo ProblemDetails. |
| AC-API-06 | `DELETE /api/tasks/{id}` existente retorna `204`, sem corpo, e remove o registro. | `openapi.yaml` | Integracao | MockMvc e repository confirmam a exclusao. |
| AC-API-07 | Exclusao de id inexistente retorna `404`. | `openapi.yaml` | Integracao | MockMvc valida status e corpo ProblemDetails. |
| AC-API-08 | Falha inesperada retorna `500` sem expor detalhes internos. | `openapi.yaml` | Unitario + Integracao | Handler e teste HTTP controlado validam a resposta sanitizada. |
| AC-API-09 | Respostas `400`, `404` e `500` usam `application/problem+json` e incluem `status`, `title`, `detail` e `instance`. | `openapi.yaml` | Integracao | MockMvc valida media type e todos os campos obrigatorios. |
| AC-API-10 | Erros de validacao incluem `invalidParams` identificando `title`. | `openapi.yaml` | Integracao | MockMvc valida nome do campo e motivo da invalidade. |

## Regras de Dominio

| ID | Criterio de aceite | Fonte | Nivel principal | Evidencia esperada |
|---|---|---|---|---|
| AC-DOM-01 | Criacao valida envia uma entidade ao repository e retorna DTO com `completed=false`. | `specs/3-testing-strategy.md` | Unitario | `TaskServiceTest.shouldCreateTaskWhenTitleIsValid`. |
| AC-DOM-02 | Titulo menor que 3 caracteres e rejeitado antes de chamar `save`. | `specs/3-testing-strategy.md` | Unitario | Teste verifica a excecao e `never().save(...)`. |
| AC-DOM-03 | Toggle de tarefa existente inverte `completed` e persiste a alteracao. | `specs/3-testing-strategy.md` | Unitario | Teste verifica resultado e interacao com o repository. |
| AC-DOM-04 | Exclusao inexistente lanca `ResourceNotFoundException` e nao chama `delete`. | `specs/3-testing-strategy.md` | Unitario | Teste verifica a excecao e ausencia da exclusao. |

## Estados da Interface

| ID | Criterio de aceite | Fonte | Nivel principal | Evidencia esperada |
|---|---|---|---|---|
| AC-UI-01 | Fetch inicial exibe skeletons no formato dos cards e os remove apos a resposta. | `specs/4-ui-ux-spec.md` | Componente | RTL controla a promise da API e consulta o estado de loading. |
| AC-UI-02 | Resposta com tarefas renderiza lista semantica, titulo e estado de conclusao. | `specs/4-ui-ux-spec.md` | Componente | RTL consulta lista, itens e checkbox por role. |
| AC-UI-03 | Lista vazia exibe `Tudo limpo por aqui!` e o texto de apoio definido. | `specs/4-ui-ux-spec.md` | Componente | RTL simula resposta vazia e valida o conteudo. |
| AC-UI-04 | Envio valido cria a tarefa e atualiza a lista. | `openapi.yaml` e `specs/4-ui-ux-spec.md` | Componente + E2E | RTL valida a chamada; Playwright confirma o fluxo integrado. |
| AC-UI-05 | Input e botao ficam desabilitados durante envio e nao permitem submit duplicado. | `specs/4-ui-ux-spec.md` | Componente | `userEvent` valida atributos e quantidade de chamadas. |
| AC-UI-06 | Titulo invalido apresenta erro associado ao input com `role="alert"` e `aria-invalid`. | `openapi.yaml` e `specs/4-ui-ux-spec.md` | Componente | RTL valida mensagem, associacao acessivel e correcao do valor. |
| AC-UI-07 | Usuario pode alternar uma tarefa e percebe o estado concluido atualizado. | `specs/4-ui-ux-spec.md` | Componente + E2E | RTL valida callback/checkbox; Playwright valida estado integrado. |
| AC-UI-08 | Usuario pode excluir uma tarefa e o item deixa de aparecer. | `specs/4-ui-ux-spec.md` | Componente + E2E | RTL valida callback; Playwright valida remocao integrada. |
| AC-UI-09 | Falha de API exibe toast nao bloqueante, permite descarte e desaparece entre 4 e 6 segundos. | `specs/4-ui-ux-spec.md` | Componente | RTL usa timers falsos para exibicao, descarte e auto-dismiss. |

## Acessibilidade

| ID | Criterio de aceite | Fonte | Nivel principal | Evidencia esperada |
|---|---|---|---|---|
| AC-A11Y-01 | Tela usa `main`, secoes nomeadas, formulario e lista semantica com artigos por tarefa. | `specs/4-ui-ux-spec.md` | Componente | RTL consulta landmarks e elementos por role. |
| AC-A11Y-02 | Campo de titulo possui `label` associado por `htmlFor/id`. | `specs/4-ui-ux-spec.md` | Componente | `getByLabelText` encontra e opera o input. |
| AC-A11Y-03 | Botao icon-only de exclusao possui nome acessivel `Excluir tarefa`. | `specs/4-ui-ux-spec.md` | Componente | `getByRole('button', { name: /excluir tarefa/i })`. |
| AC-A11Y-04 | Toasts usam `role` e `aria-live` adequados a erros e informacoes. | `specs/4-ui-ux-spec.md` | Componente | RTL inspeciona a live region e seu nome acessivel. |
| AC-A11Y-05 | Todos os controles sao operaveis por teclado e exibem foco visivel de 2px. | `specs/4-ui-ux-spec.md` | Componente + E2E | RTL valida classes/estado; Playwright percorre o fluxo com Tab, Enter e Space. |
| AC-A11Y-06 | Texto e controles atendem contraste WCAG 2.1 AA e alvos interativos tem no minimo 44px. | `specs/4-ui-ux-spec.md` | Componente + E2E | Auditoria automatizada e verificacao de estilos/computed layout. |
| AC-A11Y-07 | Animacoes respeitam `prefers-reduced-motion`. | `specs/4-ui-ux-spec.md` | Componente + E2E | Teste de CSS e contexto Playwright com movimento reduzido. |

## Jornadas E2E

| ID | Criterio de aceite | Fonte | Nivel principal | Evidencia esperada |
|---|---|---|---|---|
| AC-E2E-01 | Em desktop, usuario adiciona, conclui e exclui uma tarefa. | `specs/3-testing-strategy.md` | E2E | Playwright usa `TaskPage` com backend real ou ambiente controlado equivalente. |
| AC-E2E-02 | A jornada principal passa em viewport mobile sem sobreposicao ou perda de controles. | `specs/4-ui-ux-spec.md` | E2E | Mesmo fluxo executado em um projeto mobile do Playwright. |
| AC-E2E-03 | Titulo menor que 3 caracteres nao e criado e apresenta feedback acessivel. | `openapi.yaml` | E2E | Playwright valida permanencia na tela, erro e ausencia do item. |
| AC-E2E-04 | Falha de rede ou resposta `500` apresenta toast e mantem a tela utilizavel. | `openapi.yaml` e `specs/4-ui-ux-spec.md` | E2E | Playwright intercepta a chamada e valida resiliencia da interface. |

## Gate de Aceite

O aceite final exige:

- todos os criterios obrigatorios implementados e rastreados por teste;
- `mvn test` aprovado em `backend/`;
- `npm test -- --run`, `npm run lint` e `npm run build` aprovados em `frontend/`;
- jornada Playwright aprovada em pelo menos um viewport desktop e um mobile;
- nenhuma regressao no contrato canonico `openapi.yaml`.
