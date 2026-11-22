---
name: Raduna - Implementazione approvata
on:
  issues:
    types: [labeled]
  reaction: none
  status-comment: false
if: "false && github.event_name == 'issues' && github.event.action == 'labeled' && github.event.label.name == 'fase:implementazione' && github.event.issue.state == 'open' && contains(github.event.issue.labels.*.name, 'task-agente')"
engine: copilot
imports:
  - .github/agents/implementatore.agent.md
permissions:
  contents: read
  issues: read
  pull-requests: read
timeout-minutes: 15
max-ai-credits: 200
max-daily-ai-credits: 600
network:
  allowed: [defaults, java]
tools:
  github:
    toolsets: [repos, issues, pull_requests]
    read-only: true
  edit:
  bash: ["cat", "ls", "rg", "git status", "git diff", "sh ./mvnw -B -ntp compile", "sh ./mvnw -B -ntp test"]
safe-outputs:
  staged: true
  report-failed-jobs: false
  create-pull-request:
    draft: true
    max: 1
    title-prefix: "[Raduna] "
    fallback-as-issue: false
    auto-close-issue: false
    protected-files: blocked
    patch-format: am
    stacked: false
    allowed-files:
      - src/main/java/**
      - src/main/resources/templates/**
      - src/main/resources/static/**
    max-patch-files: 20
    max-patch-size: 256
---

Segui il profilo implementatore e AGENTS.md. Leggi la Issue, il piano indicato
dal TM assegnato e il suo commento di approvazione. Se manca un riferimento,
il piano è cambiato o l'ambito è ambiguo, fermati e indica la decisione necessaria.

Implementa solo i file e i metodi approvati, secondo i modelli citati. Lascia
al Tester i test assegnati. Proponi una PR in bozza con i link a Issue, piano,
approvazione e YouTrack, gli ID di requisito e caso d'uso, i controlli eseguiti,
gli esiti e le limitazioni. Consegna tramite il safe output configurato.
