---
name: Raduna - Revisione indipendente
on:
  pull_request:
    types: [ready_for_review, synchronize]
  reaction: none
  status-comment: false
if: "false && github.event_name == 'pull_request' && github.event.pull_request.draft == false && github.event.pull_request.head.repo.full_name == github.repository"
engine: copilot
imports:
  - .github/agents/revisore.agent.md
permissions:
  contents: read
  issues: read
  pull-requests: read
timeout-minutes: 8
max-ai-credits: 100
max-daily-ai-credits: 300
network:
  allowed: [defaults]
tools:
  github:
    toolsets: [repos, issues, pull_requests]
    read-only: true
  bash: ["cat", "ls", "rg", "git diff", "git status"]
safe-outputs:
  staged: true
  report-failed-jobs: false
  add-comment:
    max: 1
    target: triggering
---

Esegui il profilo revisore importato e AGENTS.md in questa sessione indipendente.
Parti dai file del diff e dallo SHA della PR; confronta piano approvato,
commento di approvazione del TM sulla Issue e versioni dei modelli. Non consultare conversazioni
dell'implementatore. Leggi i risultati CI senza eseguire il codice della PR.
Non modificare file e non eseguire build, script o Maven provenienti dalla PR.

Per ogni incongruenza indica gravità, file/riga, previsione del modello,
comportamento osservato e impatto. Riporta frame scoperti, controlli disattivati,
dipendenze nuove, input e frame usati dal Tester e controlli indisponibili.
Se piano, approvazione o specifiche non sono verificabili, segnala BLOCCATO.
Proponi solo un commento staged sulla PR, indirizzato a un revisore umano
diverso dall'autore. Non approvare, non risolvere thread, non effettuare merge.
