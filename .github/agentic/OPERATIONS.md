# Piano A per i TM

Il Pianificatore usa `.github/workflows/piano.yml` e pubblica un commento validato sulla Issue. Implementatore, Tester, Revisore e CI sono ancora disabilitati dal prefisso `false &&`. I tre agenti gh-aw conservano `staged: true`; il TM trasferisce manualmente le loro proposte revisionate durante un futuro collaudo.

## Dal piano alla revisione

| Quando | Azione del TM | Risultato previsto dopo l’attivazione |
| --- | --- | --- |
| Issue aperta con `task-agente` | Assegna il TM, collega YouTrack/WP, allega gli estratti approvati, poi aggiungi `fase:piano`. | Il Pianificatore propone un commento con il piano o indica gli input mancanti. |
| Piano disponibile sulla Issue | Il TM assegnato legge il piano e pubblica un commento, ad esempio «Approvo il piano descritto in [link al commento] per questo task». Solo dopo aggiunge `fase:implementazione`. | L’Implementatore consulta il commento e propone una PR in bozza limitata all’ambito approvato. |
| PR in bozza nello stesso repository con titolo che inizia per `[Raduna] ` | Fornisci nella PR caso d’uso, Category Partition, frame con esiti e firme pubbliche, oppure indica i percorsi degli estratti approvati nel checkout. Aggiungi `fase:test`. | Una nuova esecuzione del Tester propone modifiche solo sotto `src/test/java/`. |
| Test disponibili sul branch | Verifica i risultati della CI sullo SHA corrente e passa la PR da bozza a pronta. | Il Revisore propone un commento alla transizione `ready_for_review` e ripete la revisione su `synchronize` se la PR è ancora pronta. |

L’approvazione sulla Issue è un controllo umano. GitHub registra il commento e l’aggiunta della label. Il workflow reagisce alla label applicata da un membro con accesso Write; il TM assegnato verifica il piano e l'approvazione. Il Pianificatore pubblica una sola versione iniziale per Issue. Se il piano cambia, il TM richiede una revisione umana; la ripianificazione automatica non è inclusa in questa migrazione.

Il Tester ricava ogni esito dal caso d’uso e lavora senza la conversazione dell’Implementatore. Il checkout resta leggibile: evitare i corpi dei metodi è un’istruzione di lavoro. Il filtro dei percorsi limita la proposta di pubblicazione. La revisione finale e l’approvazione della PR spettano a una persona diversa dall’autore. Il merge è umano e richiede CI positiva.

## Prima prova su GitHub

1. Collega al task YouTrack/WP il piano di questa migrazione e la sua approvazione del TM assegnato. Concorda con i PM budget e numero di prove. Verifica che `COPILOT_GITHUB_TOKEN` appartenga a un'identità con Copilot attivo e credenziale supportata; non stampare o copiare il token.
2. Porta la modifica revisionata sul branch predefinito. Accerta che `.github/workflows/piano.lock.yml` non sia più attivo e che non vi siano vecchie run del Pianificatore in corso o in coda. Implementatore, Tester e Revisore rimangono disabilitati.
3. Prepara una sola Issue di collaudo con `task-agente`, YouTrack/WP, TM, artefatti pertinenti e approvazioni verificabili. Aggiungi `fase:piano` e verifica sia la run sia il commento: un solo Pianificatore, contenuto coerente, nessuna PR o modifica ai file. Rimuovere e riapplicare la label dopo il commento non deve consumare un'altra chiamata AI.
4. Prova separatamente gli errori con input simulati e test locali: output invalido, secret sintetico, Issue cambiata, duplicato e mancanza di fonte approvata. La pubblicazione reale non va ripetuta per ottenere un job verde.

Il workflow usa Copilot CLI 1.0.114, un timeout di 15 minuti per il job e un limite soft di 100 AI credits per la singola invocazione. Questo limite è proposto e va confermato dai PM prima del collaudo; non sostituisce la quota o il budget dell'account. Le run indicano il risultato e gli skip; il consumo effettivo va verificato nella vista Copilot pertinente all'identità usata.

Per il ripristino, disabilita il nuovo trigger e riporta i due file da `legacy-piano/` in `.github/workflows/` in una modifica revisionata. Riattiva il vecchio lock solo dopo aver verificato che il nuovo non possa più partire. Non usare reset distruttivi né lasciare due Pianificatori attivi.

## Controlli locali

Per il Pianificatore controlla `piano.yml`, gli script in `planner/` e i relativi test. Per gli altri tre agenti, dopo modifiche ai sorgenti Markdown rigenera i lock con gh-aw v1.2.2. Conserva i loro permessi, limiti di rete, timeout, tetti di crediti e safe outputs.

```powershell
actionlint .github/workflows/piano.yml
node --test .github/agentic/planner/*.test.js
git diff --check
```

Su Windows, se actionlint è installato fuori dal PATH, usa il percorso dell'eseguibile. La build Maven applicativa non è pertinente a questa modifica della pipeline.
