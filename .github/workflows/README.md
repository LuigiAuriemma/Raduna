# Workflow GitHub Actions

Il Pianificatore usa GitHub Actions e Copilot CLI. Implementatore, Tester, Revisore e CI Maven restano disabilitati dal prefisso `false &&`. **Il check CI saltato lascia il merge in attesa di verifica.** Per autorizzare il merge servono l’esecuzione positiva di `Maven verify (JDK 25)` sulla revisione corrente della PR e l’approvazione umana.

| Sorgente | Attivazione prevista dopo il collaudo |
| --- | --- |
| `piano.yml` | Un membro con accesso Write aggiunge `fase:piano` a una Issue aperta con `task-agente`; il piano viene pubblicato sulla Issue e richiede l'approvazione del TM assegnato. |
| `implementa.md` | Il TM assegnato approva il piano in un commento sulla Issue, poi aggiunge `fase:implementazione`. |
| `test.md` | Con `fase:test` sulla PR, il Tester avvia una sessione separata e usa il Maven Wrapper con JDK 25 per i test di unità. |
| `revisione.md` | Il Revisore interviene su `ready_for_review` e sui successivi `synchronize` mentre la PR è pronta. Sono ammesse solo PR dello stesso repository. |
| `ci.yml` | Su apertura, riapertura, aggiornamento o passaggio a pronta della PR, la CI verifica Docker ed esegue `sh ./mvnw -B -ntp clean verify`, inclusi i test di integrazione disponibili. |

I tre agenti rimasti su gh-aw usano la concorrenza predefinita e producono anteprime con `staged: true`. Il Pianificatore pubblica un commento dopo la validazione deterministica; i suoi vecchi file gh-aw sono archiviati in `../agentic/legacy-piano/`. Dopo una modifica ai tre sorgenti Markdown attivi, rigenera i rispettivi lock con `gh aw compile` e controllali con `gh aw lint`. Per il collaudo e le responsabilità del TM consulta la [guida operativa](../agentic/OPERATIONS.md).
