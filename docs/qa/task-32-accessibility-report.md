# Relatorio QA - Task 32: Acessibilidade WCAG 2.1 AA

- Data: 2026-08-01
- Branch: `feature/task-32-accessibility-audit`
- Escopo: contraste, labels, botoes icon-only, live regions, navegacao por teclado, alvos interativos e reduced motion
- Veredito de `@qa`: **PASS**

## Matriz de verificacao

| Area | Criterio | Evidencia | Resultado |
|---|---|---|---|
| Contraste | WCAG 1.4.3 e 1.4.11 | Razoes calculadas por token, teste Vitest e axe em Firefox | PASS |
| Labels e erros | WCAG 1.3.1, 3.3.1 e 3.3.2 | `htmlFor/id`, `aria-invalid`, `aria-describedby`, `role="alert"` e RTL | PASS |
| Botoes icon-only | WCAG 4.1.2 | Nomes acessiveis nos botoes Excluir e Fechar; SVGs decorativos ocultos | PASS |
| Live regions | WCAG 4.1.3 | Loading com `role="status"`; toast com `role="alert"` e `aria-live="assertive"` | PASS |
| Teclado e foco | WCAG 2.1.1 e 2.4.7 | Controles nativos, rings de 2px, RTL com `userEvent.tab` e sequencia de Tab no Playwright | PASS |
| Alvos interativos | AC-A11Y-06 | Input e botoes com no minimo 44px; checkbox com label clicavel de 44x44; layout calculado no Playwright | PASS |
| Movimento reduzido | AC-A11Y-07 | Regra CSS global, `motion-safe` no skeleton e duracao computada com Playwright | PASS |

## Contraste

| Primeiro plano | Fundo | Razao |
|---|---|---:|
| `textPrimary #F5F5F5` | `background #121212` | 17,18:1 |
| `textPrimary #F5F5F5` | `surface #1A1A1A` | 15,96:1 |
| `textSecondary #C7C7C7` | `surface #1A1A1A` | 10,30:1 |
| `textMuted #9CA3AF` | `surfaceElevated #202020` | 6,42:1 |
| `danger #F87171` | `dangerSurface #3A1D1D` | 5,53:1 |
| `accent #60A5FA` | preto | 8,26:1 |
| `accentHover #93C5FD` | `background #121212` | 10,39:1 |
| `controlBorder #737373` | `surfaceElevated #202020` | 3,44:1 |
| `controlBorder #737373` | `surface #1A1A1A` | 3,67:1 |

A borda normal do campo recebeu o token dedicado `controlBorder`; o token canonico
`border #333333` continua sendo usado nas bordas decorativas dos cards. Assim, a
identificacao visual do controle supera o minimo de 3:1 sem tornar todas as bordas da
interface mais proeminentes.

## Automacao executada

- `npm test -- --run`: 10 arquivos e 35 testes aprovados.
- `npm run lint`: aprovado sem erros.
- `npm run build`: aprovado.
- `npm run test:e2e -- --workers=1 --reporter=line`: 3 testes Firefox aprovados.
- Axe em JSDOM: nenhum problema detectavel nos estados carregado e de erro; contraste
  desabilitado apenas nessa execucao por limitacao do JSDOM e coberto separadamente.
- Axe em Firefox: nenhuma violacao, com a regra de contraste habilitada.
- Playwright: validou Tab no fluxo principal, foco visivel, dimensoes dos alvos e
  `prefers-reduced-motion` por estilo computado.

## Risco residual e continuidade

Nao restou bloqueante para a Task 32. As jornadas integradas com Enter/Space, desktop e
mobile continuam pertencendo a Fase 5, junto da criacao do Page Object e da cobertura
E2E completa; nenhum desses itens foi antecipado nesta entrega.
