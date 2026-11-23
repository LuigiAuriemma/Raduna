# Pipeline Raduna per TM e PM

La Issue definisce il task e raccoglie piano e revisioni, approvazione del TM, Draft PR, revisione, test e ultimo esito CI. I collegamenti YouTrack e Work Package disponibili si completano prima dell'accettazione.

1. Apri la Issue con `task-agente`, assegna il TM in **Assignees** e indica comportamento richiesto, criteri di accettazione e fonti disponibili. Aggiungi YouTrack/WP e frame quando esistono. Applica `fase:piano`. Il Pianificatore pubblica il piano o richiede gli input che possono cambiare sostanzialmente comportamento, ambito o architettura.
2. Per cambiare il piano, il TM assegnato commenta **Rivedi il piano: seguito dalle modifiche richieste** mentre la Issue è ancora in fase piano. Il bot pubblica una nuova versione con il collegamento al feedback. Se serve correggere i dati della Issue, aggiorna il corpo prima di chiedere la revisione.
3. Il TM assegnato con accesso Write verifica il piano corrente e applica `fase:implementazione` dopo il piano: la label è la sua approvazione e avvia l'Implementatore. Il piano indica l'ambito e i file inizialmente previsti; piccoli adeguamenti tecnici necessari sono ammessi entro il piano e motivati nella PR.
4. L'Implementatore crea il branch `raduna/issue-N` e una Draft PR verso il branch predefinito. Il Revisore parte nella stessa esecuzione e pubblica sulla PR e sulla Issue il rapporto riferito al commit esaminato. Il TM può correggere il codice dal proprio IDE sul branch della PR. Dopo ulteriori commit può chiedere una nuova revisione commentando `Rivedi il codice: motivo` sulla Issue.
5. Quando è soddisfatto, il TM aggiunge **fase:test sulla Issue**. Il Tester usa le specifiche della Issue, i documenti nel checkout e gli eventuali estratti e firme pubbliche sotto `## Input per il Tester` nella Draft PR. Riceve un contesto separato dai sorgenti applicativi e dal diff. Propone nuovi file Java sotto `src/test/java/`; il workflow li registra sullo stesso branch e pubblica il rapporto.
6. Subito dopo il commit dei test parte `sh ./mvnw -B -ntp clean verify` con JDK 25 e Docker. Il job CI lavora sullo SHA consegnato dal Tester. I push successivi del TM sulla PR rieseguono la CI. Il commento **CI Maven** della Issue riporta esito, SHA e link ai log. Un risultato di una revisione precedente non vale per il nuovo commit.
7. Il TM confronta lo SHA verificato con quello della Draft PR e controlla i rapporti. Quando è soddisfatto usa **Ready for review** e richiede la revisione umana dei PM sulla stessa PR. Revisione umana, merge e accettazione restano sotto il controllo del team.

## Attivazione e diagnosi

Per il collaudo sul branch predefinito servono Actions e Issues attivi, le tre label di fase, `task-agente`, l'accesso Copilot Student previsto dal progetto e il secret Actions `COPILOT_GITHUB_TOKEN`. Per aprire la Draft PR con il token automatico, GitHub deve consentire alle Actions di creare pull request nel repository. Verificare le policy effettive se la creazione restituisce 403. Il PAT Copilot serve solo alla generazione.

La CLI 1.0.114 usa il certificato del runner e il modello auto. I limiti soft per singola invocazione sono 100 crediti per piano/revisore, 200 per implementatore e 150 per tester. Concordare con i PM il budget complessivo e le prove autorizzate. I flag CLI non impongono una quota giornaliera. I report mostrano separatamente la proposta del Tester e l'esito effettivo di Maven.

I job di generazione producono un risultato strutturato. Prima della scrittura gli script controllano nuovamente fase, approvazione, branch, commit e percorsi. La prima consegna ammette al massimo 20 file ordinari, modificati o creati dall'Implementatore, oppure nuovi test del Tester. I blocchi richiedono una decisione del TM sulla Issue. Un rilancio può recuperare un commit già preparato senza sovrascrivere i commit del TM.

Controlli locali dalla radice:

```powershell
node --test .github/agentic/planner/planner.test.js .github/agentic/delivery/delivery.test.js
actionlint
git diff --check
```

Per la prima prova controllare entrambe le destinazioni dei rapporti (Issue e PR), il collegamento al piano corretto e l'esito Maven sul commit dei test. Per ripristinare gh-aw sostituire i workflow interessati in una sola modifica revisionata, usando i sorgenti e i lock conservati in `legacy-piano/` e `legacy-agenti/`. Verificare prima le run ancora attive e i trigger dei lock archiviati.
