---
name: Raduna - Testing indipendente
on:
  pull_request:
    types: [labeled]
  reaction: none
  status-comment: false
if: "false && github.event_name == 'pull_request' && github.event.action == 'labeled' && github.event.label.name == 'fase:test' && github.event.pull_request.head.repo.full_name == github.repository"
engine: copilot
imports:
  - .github/agents/tester.agent.md
permissions:
  contents: read
  pull-requests: read
timeout-minutes: 10
max-ai-credits: 150
max-daily-ai-credits: 450
runtimes:
  java:
    version: "25"
network:
  allowed: [defaults, java]
tools:
  edit:
  bash: ["cat", "ls", "java -version", "sh ./mvnw -B -ntp test"]
safe-outputs:
  staged: true
  report-failed-jobs: false
  push-to-pull-request-branch:
    target: triggering
    max: 1
    required-title-prefix: "[Raduna] "
    required-labels: ["fase:test"]
    fallback-as-pull-request: false
    protected-files: blocked
    allowed-files:
      - src/test/java/**
---

Segui il profilo tester e AGENTS.md in questa nuova esecuzione. Usa gli estratti
approvati indicati dal TM nella PR o presenti nel checkout: caso d'uso, Category
Partition, frame e firme pubbliche. Evita la conversazione dell'implementatore,
il diff applicativo e i corpi dei metodi. Se mancano input o esiti, segnala
i frame interessati al TM nel riepilogo.

Scrivi un test per ogni frame assegnato in src/test/java/, identificandolo nel
test. Ricava gli esiti dal caso d'uso. Controlla il JDK con `java -version` ed
esegui i test di unità con `sh ./mvnw -B -ntp test`. Segnala i test di
integrazione in attesa della CI. Riporta frame, test, atteso, osservato e
controlli indisponibili. Proponi le modifiche tramite il safe output della PR.
