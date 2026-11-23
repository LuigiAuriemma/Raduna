---
name: Raduna - Controllo modelli e piano
on:
  issues:
    types: [labeled]
  reaction: none
  status-comment: false
# Blocco locale intenzionale: budget e attivazione devono essere approvati dal PM.
if: "github.event_name == 'issues' && github.event.action == 'labeled' && github.event.label.name == 'fase:piano' && github.event.issue.state == 'open' && contains(github.event.issue.labels.*.name, 'task-agente')"
engine: copilot 
model: auto 
imports:
  - .github/agents/pianificatore.agent.md
permissions:
  contents: read
  issues: read
timeout-minutes: 8
# Proposta in AI credits (non token, richieste premium o euro): non approvata.
max-ai-credits: 100
max-daily-ai-credits: 200
network:
  allowed: [defaults]
tools:
  github:
    toolsets: [repos, issues]
    read-only: true
  bash: ["cat", "ls", "rg"]
safe-outputs:
  staged: true
  report-failed-jobs: false
  add-comment:
    max: 1
    target: triggering
---

Segui il profilo pianificatore e AGENTS.md. Leggi la Issue e gli estratti
approvati. Confronta flussi ed eccezioni con il sequence diagram, messaggi con
firme, dipendenze con il component diagram e ogni frame con un esito specificato.
Se una fonte manca o è incoerente, indica nel commento la decisione richiesta.

Proponi un commento con obiettivo, YouTrack/WP, requisito e caso d'uso, versioni
e approvazioni dei modelli, file e metodi interessati, frame ed esiti, criteri
di accettazione, controlli, tempo e tentativi. Il TM assegnato approva il piano
in un commento sulla Issue prima di aggiungere la label di implementazione.
