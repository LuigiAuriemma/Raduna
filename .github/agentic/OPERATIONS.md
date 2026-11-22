# Piano A per i TM

I quattro agenti Copilot e il job CI sono disabilitati dal prefisso `false &&` nelle condizioni. I safe outputs sono in modalità `staged`: le proposte di commento, PR e aggiornamento del branch sono visibili nel riepilogo della run. Durante il collaudo il TM trasferisce manualmente le proposte revisionate che servono alla fase successiva.

## Dal piano alla revisione

| Quando | Azione del TM | Risultato previsto dopo l’attivazione |
| --- | --- | --- |
| Issue aperta con `task-agente` | Assegna il TM, collega YouTrack/WP, allega gli estratti approvati, poi aggiungi `fase:piano`. | Il Pianificatore propone un commento con il piano o indica gli input mancanti. |
| Piano disponibile sulla Issue | Il TM assegnato legge il piano e pubblica un commento, ad esempio «Approvo il piano descritto in [link al commento] per questo task». Solo dopo aggiunge `fase:implementazione`. | L’Implementatore consulta il commento e propone una PR in bozza limitata all’ambito approvato. |
| PR in bozza nello stesso repository con titolo che inizia per `[Raduna] ` | Fornisci nella PR caso d’uso, Category Partition, frame con esiti e firme pubbliche, oppure indica i percorsi degli estratti approvati nel checkout. Aggiungi `fase:test`. | Una nuova esecuzione del Tester propone modifiche solo sotto `src/test/java/`. |
| Test disponibili sul branch | Verifica i risultati della CI sullo SHA corrente e passa la PR da bozza a pronta. | Il Revisore propone un commento alla transizione `ready_for_review` e ripete la revisione su `synchronize` se la PR è ancora pronta. |

L’approvazione sulla Issue è un controllo umano. GitHub registra il commento e l’aggiunta della label. Il workflow reagisce alla label e affida al TM la verifica dell’autore, del contenuto e dell’ordine dei due eventi. Non esiste un’autorizzazione crittograficamente verificata. Quando il piano cambia, pubblica la revisione come nuovo commento e ripeti approvazione e applicazione della label.

Il Tester ricava ogni esito dal caso d’uso e lavora senza la conversazione dell’Implementatore. Il checkout resta leggibile: evitare i corpi dei metodi è un’istruzione di lavoro. Il filtro dei percorsi limita la proposta di pubblicazione. La revisione finale e l’approvazione della PR spettano a una persona diversa dall’autore. Il merge è umano e richiede CI positiva.

## Prima prova su GitHub

1. Usa un repository di prova concordato con Actions e Issues attivi. Porta sul branch predefinito i quattro sorgenti Markdown e i lock compilati, i profili, il lock delle azioni, la CI e i modelli di Issue e PR. Crea le label `task-agente`, `fase:piano`, `fase:implementazione` e `fase:test`.
2. Con i blocchi ancora presenti, verifica dagli eventi che nessun job AI o Maven parta. Per provare la CI abilita il solo job in `ci.yml` e apri o aggiorna una PR di prova. Il runner deve disporre di Docker per i test MySQL. Controlla l’esito effettivo di Maven e configura la protezione del branch con il check CI e almeno una revisione umana.
3. Prima della prova con Copilot, concorda il budget con i PM e configura il secret Actions `COPILOT_GITHUB_TOKEN` con accesso a Copilot per l’identità di prova. Prepara una Issue con specifiche accessibili e frame approvati. Abilita inizialmente il solo Pianificatore togliendo il prefisso dalla sua condizione, rigenera il lock e porta la modifica revisionata sul branch predefinito. Mantieni `staged: true`.
4. Aggiungi `fase:piano` e verifica l’anteprima. Per provare le fasi successive, abilita ciascun workflow allo stesso modo e segui la tabella. In staged il TM copia il piano sulla Issue e prepara una PR di prova nello stesso repository. La pubblicazione automatica e l’innesco della CI da eventuali futuri aggiornamenti bot richiedono un collaudo distinto.

## Controlli locali

Modifica i sorgenti Markdown. Rigenera sempre i quattro `.lock.yml` con gh-aw (versione usata per questa configurazione: v1.2.2). Le condizioni filtrano evento, label e repository secondo la fase. Conserva permessi di lettura dell’agente, limiti di rete, concorrenza predefinita di gh-aw, timeout, tetti di crediti per run e per giorno e safe outputs con destinazioni limitate.

```powershell
gh aw compile
gh aw lint
.\mvnw.cmd -B -ntp clean verify
git diff --check
```

Su Windows, se actionlint è installato fuori dal PATH, aggiungi la sua directory al PATH della sessione prima del lint. La build locale genera `target/raduna.jar`. Il rapporto JaCoCo richiede dati di esecuzione dei test.
