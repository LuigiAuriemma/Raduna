# Guida operativa per TM: dalla Issue al merge

Questa guida serve ai Team Member (TM) per completare un'attivita assegnata dai Project Manager (PM), dall'apertura o assegnazione della Issue fino al merge in `main`.

## Regola principale

Agenti e workflow possono preparare il lavoro, ma approvano soltanto i controlli tecnici.

Decisioni umane necessarie:

- approvazione del piano;
- richiesta di correzioni;
- review della Pull Request;
- merge in `main`;
- accettazione finale del risultato.

Non usare i commenti dell'AI come approvazioni personali.

## 1. Ricezione della Issue

La Issue deve avere:

- titolo con prefisso `[TASK]`;
- label `task-agente`;
- almeno un assegnatario TM o PM con accesso GitHub `Write`;
- tutti i campi del template compilati;
- criteri di accettazione osservabili;
- test previsti o la motivazione che i test applicativi siano N/A.

Prima di continuare, verificare anche:

- che il task appartenga a `src/`, `README.md` o documentazione ordinaria `docs/`;
- che POM, workflow, test, segreti e modelli siano protetti;
- che mancanze di RAD/SDD/Test Frame siano dichiarate, non inventate.

Se la Issue manca di una assegnazione o di `task-agente`, fermare l'avvio automatico e chiedere al PM di correggerla.

## 2. Avvio del Pianificatore

Il TM assegnato applica alla Issue la label:

```text
fase:piano
```

Si avvia il workflow **Pianificatore**. Attendere il commento della Issue che comincia con:

```text
## Piano proposto dal Pianificatore AI
```

Il Pianificatore:

- legge la Issue e gli artefatti disponibili;
- propone file, classi, metodi e test;
- indica rischi e riferimenti mancanti;
- non modifica il repository;
- non crea commit o Pull Request;
- non dichiara test superati.

## 3. Controllo e approvazione del piano

Leggere il piano con attenzione. Verificare almeno:

- file davvero necessari;
- assenza di modifiche fuori ambito;
- coerenza con i criteri di accettazione;
- test previsti;
- dipendenze o decisioni mancante;
- nessun riferimento RAD/SDD inventato.

Se il piano va bene:

1. applicare alla Issue la label `fase:implementazione`;
2. aggiungere il commento esplicito:

```text
AUTORIZZA PIANO: approvo il piano proposto.
```

Il commento deve essere scritto da un assegnatario della Issue con accesso `Write`.

Se il piano va corretto:

```text
RICHIESTA REVISIONE PIANO: descrivere cosa va cambiato e perche.
```

Non applicare `fase:implementazione` finche le richieste di revisione non sono state risolte.

## 4. Implementatore

Applicando `fase:implementazione`, si avvia il workflow **Implementatore**.

Nello stato attuale del repository, l'Implementatore puo modificare:

- `src/`;
- `README.md`;
- documentazione ordinaria in `docs/`;
- esclusivamente entro il piano approvato.

Non puo modificare:

- `.github/`;
- `AGENTS.md`;
- POM o dipendenze;
- test applicativi;
- workflow;
- RAD/SDD/PDF;
- `.env`, segreti o dati personali;
- file fuori dall'ambito approvato.

Al termine, il workflow crea un branch:

```text
agent/issue-<numero>-implementazione
```

e una Draft PR verso `main`.

Il branch deve contenere nel body della PR:

```text
Closes #<numero>
Autorizzante: @<utente>
Responsabili assegnati: @<tm>
```

Se il workflow crea il branch ma non crea la PR, il proprietario della repository deve abilitare in GitHub:

```text
Settings -> Actions -> General -> Allow GitHub Actions to create and approve pull requests
```

## 5. Correzione della Draft PR

Se il codice o la documentazione necessita una correzione entro il piano approvato, commentare sulla **PR**:

```text
RICHIESTA CORREZIONE: descrivere il problema, il comportamento atteso e il limite da rispettare.
```

Il commento deve essere inviato sulla PR, non sulla Issue.

L'autore della richiesta deve essere:

- un assegnatario della Issue; oppure
- un revisore autorizzato con accesso `Write`;
- diverso dai vincoli di review indipendente, se applicati.

Il workflow **Correzione AI** puo modificare soltanto aree applicative/documentali consentite e non puo modificare test o dipendenze non approvate.

Il commit corretto rende necessaria una nuova esecuzione di Tester e CI sul nuovo SHA.

## 6. Tester indipendente

Quando la Draft PR esiste, un TM assegnato applica alla PR la label:

```text
fase:test
```

Il workflow **Tester indipendente**:

- controlla la Issue collegata;
- usa i Test Frame o i requisiti autorizzati;
- crea o verifica test JUnit o altri test eseguibili;
- non modifica il codice applicativo;
- non modifica POM o dipendenze;
- esegue Maven e registra il risultato;
- pubblica il report sullo SHA esaminato.

Non togliere o indebolire asserzioni per ottenere un esito verde.

Se il Tester fallisce:

1. leggere il report e il log Maven;
2. distinguere test errato, configurazione errata e bug applicativo;
3. chiedere una correzione entro il piano;
4. rieseguire CI e Tester sul nuovo commit.

Un test applicativo fallito non viene superato da una discussione o da un'approvazione.

## 7. Revisore AI

Solo dopo il Tester superato, portare la PR da **Draft** a **Ready for review**.

Questo avvia il workflow **Revisore**.

Il Revisore AI legge:

- Issue;
- PR;
- diff;
- modelli disponibili;
- test e report.

Pubblica il commento:

```text
## Revisione AI - PR #<numero>
```

Il commento contiene:

```text
ESITO_REVISIONE: PASS
```

oppure:

```text
ESITO_REVISIONE: CHANGES_REQUESTED
```

La riga deve riferirsi allo SHA finale esaminato.

Il Revisore AI non modifica la PR e non decide il merge al posto delle persone.

### Politica attuale della governance

Il verdetto del Revisore AI è informativo:

- `CHANGES_REQUESTED` resta visibile nel report;
- `CHANGES_REQUESTED` non blocca da solo il governance-gate;
- il revisore umano decide se correggere oppure accettare il rilievo;
- restano obbligatori report Tester, report Revisore AI, CI e review umana indipendente.

## 8. Review umana indipendente

La revisione umana non e un semplice commento.

Aprire la PR e cliccare:

```text
Submit review
```

Scegliere:

- `Approve`, se il lavoro puo essere accettato;
- `Request changes`, se serve una correzione;
- `Comment`, se si vuole solo discutere senza approvare.

La review deve essere:

- sullo SHA finale;
- diversa dall'autore della PR;
- diversa dagli assegnatari della Issue;
- effettuata da un utente con accesso `Write`, `Maintain` o `Admin`.

Un nuovo commit sulla PR invalida o rende non sufficiente una review relativa al commit precedente.

## 9. Governance-gate

Il check **governance-gate** viene avviato quando viene inviata o rimossa una review.

Verifica:

- PR aperta e non Draft;
- destinazione `main`;
- branch interno alla repository;
- Issue collegata;
- assegnatari coerenti;
- autorizzante presente;
- report Tester superato sullo SHA;
- run Tester riuscita sul branch;
- report Revisore AI sullo SHA;
- run Revisore riuscita sullo SHA;
- review umana indipendente valida;
- CI e CODEOWNERS soddisfatti dalle protezioni della repository.

Non fare merge mentre il gate e rosso o mentre un required check e in corso.

Attendere che GitHub segnali il merge come disponibile.

## 10. Merge in main

Il merge resta umano.

Una persona autorizzata deve:

1. verificare che la PR sia pronta;
2. confermare che i check siano verdi;
3. verificare che la review indipendente sia sullo SHA finale;
4. completare il merge in `main`.

Se esistono conflitti o il branch e cambiato, aggiornare la PR e ripetere Tester, Revisore e review sul nuovo SHA.

Non usare comandi Git per forzare il merge o aggirare i Ruleset.

## 11. Dopo il merge

Dopo il merge:

- verificare che la Issue collegata si chiuda;
- registrare eventuali modifica manuali nella tracciabilita;
- completare YouTrack e Matrice solo se la responsabilita e assegnata al TM/PM;
- registrare l'accettazione del deliverable;
- non dichiarare completato il lavoro prima della verifica umana finale.

## Cosa significa CODEOWNERS

Il file [CODEOWNERS](../.github/CODEOWNERS) dice a GitHub quali persone o team devono essere aggiunti come owner/reviewer per i file modificati.

Non assegna permessi, non approva automaticamente e non permette il merge.

Esempio:

- modifica sotto `docs/` -> richiede reviewer dei team indicati;
- modifica sotto `.github/` -> richiede reviewer di governance;
- modifica di README o codice -> segue i proprietari configurati.

I team devono esistere in GitHub e avere accesso almeno `Write`.

Un review richiesto da CODEOWNERS vale per la protezione della PR solo se la persona effettivamente approva. Non equivale al Revisore AI ne al governance-gate.

Nel repository attuale sono referenziati team pensati per il progetto `NeighborCare`; prima del collaudo Raduna devono esistere realmente su GitHub e avere i membri corretti.

## Comandi rapidi Windows

Dal repository locale:

```powershell
git status
git switch main
git pull --ff-only
.\mvnw.cmd clean verify
```

Non usare questi comandi per fare push diretto su `main`.

## Errori da evitare

1. Scrivere da soli `ESITO_REVISIONE: PASS` o `CHANGES_REQUESTED`.
2. Applicare `fase:implementazione` senza piano approvato.
3. Considerare una PR Draft come pronta per il merge.
4. Applicare `fase:test` sul commit sbagliato.
5. Creare o modificare test per ottenere verde.
6. Usare `Approve` senza essere revisore indipendente.
7. Mergeare quando il required check e rosso, in corso o assente.
8. Modificare POM, `.github/`, segreti o test fuori ambito.
9. Confondere CODEOWNERS, revisore AI, review umana e governance-gate.

**Assunzioni e riferimenti da completare**

Questa guida descrive i workflow effettivamente presenti nel repository. Richiede gli eventuali team CODEOWNERS reali, permessi GitHub `Write`, nome esatto delle Issue, matrici e collegamenti YouTrack/Drive esterni gestiti dai PM/TM. Nessun requisito RAD/SDD/UC ufficiale e stato individuato nei file disponibili.
