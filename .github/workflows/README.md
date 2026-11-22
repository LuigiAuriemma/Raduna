# Workflow GitHub Actions

I quattro agenti e la CI Maven sono configurati e disabilitati fino al collaudo. **Il check CI saltato lascia il merge in attesa di verifica.** Per autorizzare il merge servono l’esecuzione positiva di `Maven verify (JDK 25)` sulla revisione corrente della PR e l’approvazione umana.

| Sorgente | Attivazione prevista dopo il collaudo |
| --- | --- |
| `piano.md` | Il TM aggiunge `fase:piano` a una Issue aperta con `task-agente`. |
| `implementa.md` | Il TM assegnato approva il piano in un commento sulla Issue, poi aggiunge `fase:implementazione`. |
| `test.md` | Con `fase:test` sulla PR, il Tester avvia una sessione separata e usa il Maven Wrapper con JDK 25 per i test di unità. |
| `revisione.md` | Il Revisore interviene su `ready_for_review` e sui successivi `synchronize` mentre la PR è pronta. Sono ammesse solo PR dello stesso repository. |
| `ci.yml` | Su apertura, riapertura, aggiornamento o passaggio a pronta della PR, la CI verifica Docker ed esegue `sh ./mvnw -B -ntp clean verify`, inclusi i test di integrazione disponibili. |

I quattro agenti usano la concorrenza predefinita di gh-aw e producono anteprime con `staged: true`. Dopo una modifica ai sorgenti Markdown, rigenera i lock con `gh aw compile` e controllali con `gh aw lint`. Per la sequenza di prova e le responsabilità del TM consulta la [guida operativa](../agentic/OPERATIONS.md).
