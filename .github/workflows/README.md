# Workflow di Raduna

| Workflow | Evento e consegna |
| --- | --- |
| `piano.yml` | Label `fase:piano` o richiesta del TM `Rivedi il piano:` sulla Issue. Pubblica il piano versionato. |
| `implementa.yml` | Il TM assegnato applica `fase:implementazione` dopo il piano: approva e avvia l'Implementatore, che crea la Draft PR e richiama la revisione. |
| `revisione.yml` | Chiamato dopo l'implementazione o su richiesta `Rivedi il codice:` del TM. Commenta PR e Issue sullo SHA esaminato. |
| `test.yml` | `fase:test` sulla Issue dopo la revisione. Aggiunge i nuovi test alla Draft PR e richiama la CI. |
| `ci.yml` | Verifica Maven sul commit dei test e sugli aggiornamenti successivi della PR. |
| `esito-ci.yml` | Aggiorna la Issue con l'esito della CI avviata da una modifica umana alla PR. |
| `genera-agente.yml` | Esegue Copilot CLI per Implementatore, Revisore e Tester in un job di lettura isolato dalla pubblicazione. |

Per i comandi del TM e il collaudo consultare la [guida operativa](../agentic/OPERATIONS.md).
