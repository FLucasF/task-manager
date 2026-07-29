# UI/UX Specification - Task Manager

## Objetivo

Definir instrucoes rigorosas para construcao da interface React 19 + Vite 7 + TypeScript do Task Manager, com foco em dark mode elegante, consistencia visual via Tailwind CSS, micro-interacoes previsiveis, baixa carga cognitiva e acessibilidade WCAG 2.1 nivel AA.

## 0. Pre-requisito de Setup Frontend

Antes de gerar ou implementar componentes React, o projeto `/frontend` deve ser preparado para Tailwind CSS. A especificacao visual abaixo depende desse setup e nao deve ser aplicada como classes soltas sem configuracao.

Dependencias obrigatorias de desenvolvimento:

```bash
npm install -D tailwindcss postcss autoprefixer
```

Arquivos obrigatorios em `/frontend`:

- `tailwind.config.js`
- `postcss.config.js`
- arquivo CSS global com `@tailwind base;`, `@tailwind components;` e `@tailwind utilities;`

Configuracao minima exigida para `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          background: '#121212',
          surface: '#1A1A1A',
          surfaceElevated: '#202020',
          surfaceHover: '#262626',
          border: '#333333',
          textPrimary: '#F5F5F5',
          textSecondary: '#C7C7C7',
          textMuted: '#9CA3AF',
          accent: '#60A5FA',
          accentHover: '#93C5FD',
          accentActive: '#3B82F6',
          danger: '#F87171',
          dangerSurface: '#3A1D1D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

Configuracao minima exigida para `postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

O elemento raiz da aplicacao deve aplicar o fundo `#121212`, preferencialmente via token Tailwind `bg-app-background`.

## 1. Design Tokens & Fundamentos Visuais

### Cores e Contraste

A aplicacao deve usar dark mode como experiencia principal.

Tokens obrigatorios:

```ts
export const colors = {
  background: '#121212',
  surface: '#1A1A1A',
  surfaceElevated: '#202020',
  surfaceHover: '#262626',
  border: '#333333',
  textPrimary: '#F5F5F5',
  textSecondary: '#C7C7C7',
  textMuted: '#9CA3AF',
  iconDefault: '#E5E7EB',
  accent: '#60A5FA',
  accentHover: '#93C5FD',
  accentActive: '#3B82F6',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  dangerSurface: '#3A1D1D',
};
```

Regras:

- O background principal da aplicacao deve ser exatamente `#121212`.
- Cards de tarefas devem usar superficies mais claras que o background, preferencialmente `#1A1A1A` ou `#202020`.
- Bordas devem ser discretas e usar `#333333` ou equivalente com contraste sutil.
- Texto e icones devem respeitar WCAG 2.1 AA, com contraste minimo de `4.5:1` para texto normal.
- Texto primario deve usar `#F5F5F5`; texto secundario deve usar `#C7C7C7`.
- Nao usar texto cinza muito escuro sobre `#121212`; qualquer texto funcional deve permanecer legivel.
- Cores semanticas devem comunicar estado sem depender apenas de cor. Sempre combinar cor com texto, icone ou atributo acessivel.

### Tipografia

Fonte recomendada:

- `Inter`, com fallback para `Roboto`, `system-ui`, `sans-serif`.

Escala tipografica:

```ts
export const typography = {
  title: 'text-2xl md:text-3xl font-semibold leading-tight',
  sectionTitle: 'text-lg md:text-xl font-semibold leading-snug',
  body: 'text-base leading-6',
  bodySmall: 'text-sm leading-5',
  caption: 'text-xs leading-4',
};
```

Regras:

- Usar uma escala fluida e responsiva, sem escalar fonte diretamente com largura da viewport.
- Evitar `letter-spacing` negativo.
- Manter hierarquia clara entre titulo da tela, secoes, labels, texto de apoio e metadados.
- Labels devem ser visiveis ou acessivelmente disponiveis; placeholders nao substituem labels.

### Espacamento e Grid

Sistema obrigatorio:

- Usar 8pt grid system em todos os espacamentos.
- Em Tailwind CSS, preferir classes baseadas em multiplos de 2, pois `2 = 8px`, `4 = 16px`, `6 = 24px`, `8 = 32px`.

Regras:

- Gaps internos de cards: `gap-3` ou `gap-4`.
- Padding de cards: `p-4` em mobile e `p-5` em desktop.
- Espacamento entre tarefas: `space-y-3` ou `gap-3`.
- Container principal: padding minimo `px-4 py-6`, aumentando para `md:px-6 md:py-8`.
- Componentes interativos devem ter area minima de toque de `44px x 44px`.

## 2. Engenharia de Micro-interacoes e Estados

### Tokens de Estado

Botoes e inputs devem implementar estados visuais consistentes.

```ts
export const interaction = {
  transition: 'transition-colors duration-150 ease-out',
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
};
```

### Botoes

Estados obrigatorios:

- `default`: cor semantica clara, texto com contraste AA.
- `hover`: superficie ou cor levemente mais clara.
- `active`: feedback visual imediato com cor mais intensa ou leve transformacao.
- `disabled`: opacidade reduzida, `cursor-not-allowed`, sem disparar acao.

Exemplo Tailwind:

```tsx
className="
  min-h-11 rounded-md bg-blue-400 px-4 py-2 text-sm font-medium text-black
  transition-colors duration-150 ease-out
  hover:bg-blue-300 active:bg-blue-500
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
  focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]
  disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none
"
```

### Inputs

Estados obrigatorios:

- `default`: superficie elevada, borda visivel e texto claro.
- `hover`: borda levemente mais clara.
- `active/focus`: anel de foco claro de 2px.
- `disabled`: opacidade reduzida, `cursor-not-allowed`.
- `error`: borda e mensagem semantica em vermelho suave.

O foco via teclado deve usar `:focus-visible` com outline/ring de `2px`, garantindo orientacao clara para usuarios que navegam via Tab.

## 3. Gestao de Carga Cognitiva e Estados de Dados

### Loading State - Perceived Performance

Spinners genericos em tela cheia sao proibidos.

Durante o fetch inicial, a tela deve exibir Skeleton Loaders pulsantes no formato exato dos cards de tarefas.

Requisitos do skeleton:

- Deve ocupar a mesma largura e altura aproximada do card real.
- Deve simular checkbox/status, titulo e acoes do card.
- Deve usar tons entre `#1A1A1A`, `#242424` e `#2E2E2E`.
- Deve usar animacao `pulse`, respeitando `prefers-reduced-motion`.
- Deve evitar layout shift quando os dados reais carregarem.

Exemplo esperado:

```tsx
<article aria-hidden="true" className="rounded-md border border-[#333333] bg-[#1A1A1A] p-4">
  <div className="flex items-center gap-3">
    <div className="h-5 w-5 animate-pulse rounded bg-[#2E2E2E]" />
    <div className="h-4 flex-1 animate-pulse rounded bg-[#2E2E2E]" />
    <div className="h-9 w-9 animate-pulse rounded-md bg-[#242424]" />
  </div>
</article>
```

### Empty State

O estado vazio nao deve ser apenas texto.

Requisitos:

- Layout centralizado dentro da area da lista.
- Icone ou ilustracao sutil de caixa vazia.
- Titulo claro: `Tudo limpo por aqui!`
- Texto de apoio guiando o usuario para adicionar uma nova tarefa.
- Contraste AA para titulo e texto.
- Nao usar ilustracoes visualmente pesadas ou decoracao que dispute atencao com o formulario.

Conteudo recomendado:

- Titulo: `Tudo limpo por aqui!`
- Apoio: `Adicione uma nova tarefa para comecar a organizar seu dia.`

### Error State & Resiliencia

Falhas de API devem ser comunicadas por Toasts ou Snackbars nao intrusivos no canto da tela.

Requisitos:

- Posicao: canto inferior direito em desktop; parte inferior central em mobile.
- Cor semantica: vermelho suave, como `#F87171`, com superficie escura `#3A1D1D`.
- Deve desaparecer automaticamente apos um intervalo razoavel, entre 4 e 6 segundos.
- Deve ter botao de descarte manual.
- Deve usar texto claro, objetivo e acionavel.
- Nao deve bloquear a tela inteira.
- Deve manter foco e navegacao da interface principal preservados.

Exemplo de mensagem:

- `Nao foi possivel salvar a tarefa. Tente novamente.`

## 4. Acessibilidade e Semantica Rigorosa

### Estrutura Semantica

HTML semantico e obrigatorio:

- Usar `<main>` para o conteudo principal da aplicacao.
- Usar `<section>` para agrupar formulario, lista e estados de dados.
- Usar `<article>` para cada tarefa renderizada na lista.
- Usar `<form>` para a criacao de tarefas.
- Usar lista semantica quando aplicavel: `<ul>` e `<li>`.

Estrutura recomendada:

```tsx
<main>
  <section aria-labelledby="task-form-title">
    <h1 id="task-form-title">Minhas tarefas</h1>
    <form>{/* input e botao */}</form>
  </section>

  <section aria-labelledby="task-list-title">
    <h2 id="task-list-title">Lista de tarefas</h2>
    <ul>
      <li>
        <article>{/* conteudo da tarefa */}</article>
      </li>
    </ul>
  </section>
</main>
```

### Formularios

Regras:

- Inputs devem ter `label` associado por `htmlFor/id`.
- Mensagens de erro devem ter `role="alert"` ou ser associadas ao input via `aria-describedby`.
- Campos invalidos devem usar `aria-invalid="true"`.
- Placeholder pode dar exemplo, mas nunca substituir o label.

Exemplo:

```tsx
<label htmlFor="task-title">Titulo da tarefa</label>
<input
  id="task-title"
  name="title"
  aria-invalid={Boolean(error)}
  aria-describedby={error ? 'task-title-error' : undefined}
/>
{error ? <p id="task-title-error" role="alert">{error}</p> : null}
```

### Botoes e Icones

Regras:

- Botoes apenas com icones devem ter nome acessivel.
- O botao de excluir tarefa deve usar exatamente `aria-label="Excluir tarefa"` quando nao houver texto visivel.
- Icones decorativos devem usar `aria-hidden="true"`.
- Nao usar `div` clicavel no lugar de `<button>`.
- Botoes devem ser acionaveis por teclado com Enter e Space.

Exemplo:

```tsx
<button type="button" aria-label="Excluir tarefa">
  <Trash2 aria-hidden="true" />
</button>
```

### Regioes de Notificacao

Toasts e Snackbars devem ser anunciados por leitores de tela.

Regras:

- Usar `aria-live="polite"` para sucesso e informacoes nao criticas.
- Usar `aria-live="assertive"` para erros que exigem conhecimento imediato.
- Usar `role="status"` para mensagens informativas.
- Usar `role="alert"` para erros.
- Evitar mover foco automaticamente para o Toast, exceto em erros bloqueantes.

Exemplo:

```tsx
<div role="alert" aria-live="assertive">
  Nao foi possivel salvar a tarefa. Tente novamente.
</div>
```

### Movimento e Animacoes

Animacoes de adicao, conclusao e delecao de tarefas devem respeitar a preferencia do sistema operacional.

Regras:

- Usar `prefers-reduced-motion` para reduzir ou remover transicoes.
- Animacoes devem ser curtas, entre 120ms e 200ms.
- Nao animar propriedades que prejudiquem performance quando houver alternativa com `opacity` ou `transform`.
- Usuarios com reducao de movimento ativada devem receber mudancas instantaneas ou transicoes quase imperceptiveis.

Exemplo CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Checklist de Aceitacao

- Background principal usa exatamente `#121212`.
- Cards usam superficies cinza sutilmente mais claras para hierarquia.
- Texto e icones atingem contraste WCAG 2.1 AA minimo de `4.5:1`.
- Layout usa Tailwind CSS com espacamento baseado em 8pt grid system.
- Botoes e inputs possuem estados `default`, `hover`, `active`, `disabled` e `focus-visible`.
- Foco de teclado tem ring claro de `2px`.
- Fetch inicial usa Skeleton Loaders no formato dos cards.
- Empty State tem icone/ilustracao, titulo `Tudo limpo por aqui!` e texto de apoio.
- Falhas de API usam Toast/Snackbar nao intrusivo com descarte manual e auto-dismiss.
- Interface usa `<main>`, `<section>`, `<article>`, `<form>` e lista semantica quando aplicavel.
- Inputs possuem `label` associado por `htmlFor/id`.
- Botao icon-only de exclusao usa `aria-label="Excluir tarefa"`.
- Toasts usam `aria-live` e `role` adequados.
- Animacoes respeitam `prefers-reduced-motion`.
