---
description: Documenta as mudanças de código feitas até agora, delegando para o agente docs-writer
---

Delegue para o subagente `docs-writer` a documentação das mudanças de código feitas na sessão atual.

Antes de delegar, monte um resumo do que foi alterado (arquivos tocados, componentes/hooks criados ou modificados) a partir do estado atual do repositório (ex: `git diff`, `git status`) e da conversa até aqui, e passe esse resumo como contexto para o `docs-writer` — ele não tem memória da sessão.

O `docs-writer` deve seguir suas próprias regras (formato padrão, salvar/atualizar em `/docs/features/`, fidelidade ao diff, sem opinar sobre o código).
