---
name: task-delivery-flow
description: Executar o ciclo completo de implementação e entrega das tasks deste projeto. Usar sempre que Codex for iniciar, continuar, implementar ou encerrar uma task do implementation-plan.md, incluindo verificação do merge anterior, criação da branch feature/task-{numero}-{slug}, testes proporcionais ao backend ou frontend alterado, commit, push, Pull Request para develop e espera obrigatória pelo merge.
---

# Task Delivery Flow

Seguir esta ordem sem pular etapas. Considerar a task entregue somente depois de testes aprovados, commit, push e Pull Request aberto contra `develop`.

## 1. Verificar a task anterior

1. Identificar no `implementation-plan.md` a task atual e a task imediatamente anterior.
2. Executar `git fetch origin --prune`.
3. Confirmar no GitHub que o PR da task anterior foi mesclado em `develop` e confirmar que o commit está contido em `origin/develop`.
4. Se o merge não estiver concluído ou não puder ser comprovado:
   - informar qual PR ou task continua pendente;
   - não criar branch;
   - não alterar arquivos;
   - não iniciar a próxima task;
   - aguardar o usuário concluir o merge.
5. Se o merge estiver concluído, sincronizar a branch local `develop` com `origin/develop` usando fast-forward e continuar.

Não confiar apenas no estado local ou em uma confirmação antiga. Verificar novamente o remoto no início de cada task.

## 2. Criar a branch da task

Criar a branch a partir do `develop` atualizado no formato:

```text
feature/task-{numero}-{slug}
```

Exemplo:

```text
feature/task-1-openapi-contract
```

Usar o número da task atual e um slug curto, em inglês, derivado do seu objetivo. Usar sempre o prefixo `feature/`, inclusive para entregas auxiliares solicitadas durante o fluxo. Não usar prefixos como `chore/`, `fix/` ou `docs/`. Não reutilizar a branch da task anterior e não misturar duas tasks na mesma branch.

## 3. Implementar somente a task atual

1. Ler os artefatos indicados pela task antes de editar.
2. Manter as mudanças restritas ao escopo da task.
3. Atualizar apenas o item correspondente no `implementation-plan.md` quando a implementação e os testes estiverem concluídos.
4. Não iniciar itens seguintes do plano.

## 4. Testar antes da entrega

Executar os gates imediatamente antes do commit:

- Se alterar backend, executar `mvn test` em `backend/`.
- Se alterar frontend, executar `npm test -- --run`, `npm run lint` e `npm run build` em `frontend/`.
- Se alterar backend e frontend, executar todos os gates dos dois lados.
- Se o escopo exigir teste adicional específico, executá-lo junto da suíte correspondente.

Não commitar nem fazer push enquanto algum gate falhar. Corrigir a falha e repetir a suíte completa afetada. Não declarar sucesso com teste ignorado, não executado ou inconclusivo.

## 5. Fazer entrega atômica

Depois dos testes aprovados, executar o fechamento como um único ciclo, sem parar após o commit:

1. Revisar `git status`, o diff e os arquivos da task.
2. Garantir que não existam mudanças não relacionadas no commit.
3. Criar o commit da task com uma mensagem que inclua seu número.
4. Acionar ou delegar imediatamente ao `@devops`, única autoridade de push e PR segundo a Constitution.
5. Fazer push da branch `feature/task-{numero}-{slug}`.
6. Abrir um Pull Request dessa branch para `develop`.
7. Informar ao usuário o link do PR, o commit e o resultado dos testes.

Não apresentar a task como concluída se houver apenas commit local. Commit, push e solicitação de merge fazem parte da mesma entrega.

## 6. Aguardar o merge

Depois de abrir o PR:

1. Não fazer o merge em nome do usuário.
2. Não iniciar a próxima task.
3. Informar que o fluxo está aguardando o merge em `develop`.
4. Na próxima solicitação para continuar, voltar obrigatoriamente à etapa 1 e comprovar o merge no remoto.

## Relatório de encerramento

Sempre informar:

- task e branch;
- commit;
- comandos de teste executados e resultados;
- URL do Pull Request;
- estado `aguardando merge`.
