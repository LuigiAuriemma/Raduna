
# Istruzioni condivise per gli agenti AI — Raduna

Le presenti istruzioni si applicano all'intero repository Raduna e sono indipendenti dallo strumento AI utilizzato.

Gli agenti AI supportano le attività del team, ma non sostituiscono le responsabilità, le decisioni e le approvazioni dei membri umani.

## 1. Contesto del progetto

Raduna è un progetto universitario sviluppato nell'ambito del corso di Gestione dei Progetti Software.

Il team C16 è composto da:
- 2 Project Manager (PM), responsabili della pianificazione, del coordinamento, del monitoraggio e della supervisione del progetto.
- 6 Team Members (TM), responsabili delle attività di analisi, progettazione, implementazione e verifica assegnate.

Le funzionalità, gli attori e il comportamento del sistema devono essere ricavati dalla documentazione di progetto pertinente e approvata.

Non assumere che una funzionalità sia prevista soltanto perché menzionata in una proposta, in un documento preliminare o in una conversazione.

<!-- TODO [PM]: Completare il contesto con una descrizione del
     prodotto Raduna, i suoi obiettivi, gli utenti e le principali
     funzionalità, utilizzando esclusivamente il RAD approvato.
     Non introdurre informazioni non ancora confermate. -->

## 2. Documenti di riferimento

I principali riferimenti del progetto sono:

- `docs/rad/`: Requirements Analysis Document (RAD), requisiti, casi d'uso ed eventuali allegati.
- `docs/sdd/`: Software Design Document (SDD), architettura, progettazione e relativi modelli.
- `docs/modelli/`: eventuali modelli mantenuti separatamente dai documenti principali.
- `docs/test/`: documentazione relativa alla pianificazione, alla progettazione e ai risultati dei test.

Prima di iniziare un task, identificare i documenti pertinenti e verificare che siano disponibili nel repository.

La presenza di un documento nel repository non ne implica automaticamente l'approvazione.

Utilizzare le versioni esplicitamente indicate nell'Issue o identificate come approvate secondo le convenzioni del progetto.

Se le versioni sono contrastanti, mancanti o non chiaramente approvate, segnalare il problema e richiedere chiarimenti prima di assumere decisioni che dipendono da tali informazioni.

Non modificare autonomamente una specifica approvata per adattarla al codice implementato.

<!-- TODO [PM]: Definire il criterio formale per identificare i
     documenti approvati e le relative versioni.
     Stabilire come distinguere documenti preliminari, in revisione
     e approvati, e come tracciare le successive modifiche. -->

<!-- TODO [PM/TM]: Inserire i percorsi esatti dei file RAD, SDD
     e dei documenti di test quando saranno presenti nel repository.
     Specificare quali versioni costituiscono il riferimento
     ufficiale per gli agenti. -->

## 3. Organizzazione del repository

La struttura iniziale comprende:

- `README.md`: presentazione generale del progetto.
- `AGENTS.md`: istruzioni condivise per gli agenti AI.
- `docs/rad/`: documentazione di analisi dei requisiti.
- `docs/sdd/`: documentazione di progettazione.
- `docs/modelli/`: eventuali modelli separati.
- `docs/test/`: documentazione dei test.
- `.github/ISSUE_TEMPLATE/`: modelli per la creazione delle Issue.
- `.github/workflows/`: workflow di GitHub Actions.

La struttura del codice applicativo dovrà rispettare le decisioni architetturali approvate.

Non introdurre arbitrariamente nuovi componenti, package, moduli o riorganizzazioni del progetto.

<!-- TODO [PM/TM]: Decidere se mantenere docs/modelli/ oppure
     collocare i diagrammi UML direttamente nelle rispettive
     sezioni o cartelle RAD e SDD.
     Evitare duplicazioni e versioni discordanti degli stessi
     modelli. -->

<!-- TODO [TM]: Aggiornare questa sezione quando sarà definita
     e realizzata la struttura effettiva del codice sorgente,
     dei test automatizzati e degli eventuali file di
     configurazione applicativa. -->

## 4. Stack tecnologico e comandi

Lo stack tecnologico, le dipendenze e i comandi di compilazione, esecuzione e test devono essere ricavati dalla configurazione effettiva del progetto e dalle decisioni approvate.

Fino alla loro definizione:
- Non presumere linguaggi, framework, database o versioni.
- Non introdurre dipendenze non richieste.
- Non inventare comandi di compilazione o di test.
- Non dichiarare come superati controlli che non sono stati eseguiti.
- Segnalare eventuali limitazioni dell'ambiente di esecuzione.

<!-- TODO [TM]: Documentare lo stack tecnologico effettivamente
     adottato, includendo linguaggi, versioni, framework, database
     e dipendenze principali.
     Verificare la coerenza con l'SDD approvato. -->

<!-- TODO [TM]: Specificare i comandi effettivi per:
     - Installazione delle dipendenze.
     - Compilazione del progetto.
     - Avvio dell'applicazione.
     - Esecuzione dei test automatizzati.
     - Eventuali verifiche statiche.
     Indicare inoltre i prerequisiti dell'ambiente. -->

## 5. Convenzioni di sviluppo

Gli agenti devono rispettare le convenzioni di sviluppo già adottate dal progetto.

In assenza di indicazioni:
- Seguire lo stile prevalente nel codice esistente.
- Utilizzare nomi comprensibili e coerenti con il dominio.
- Evitare modifiche puramente estetiche non pertinenti al task.
- Non introdurre nuove convenzioni senza una decisione condivisa.
- Mantenere le modifiche circoscritte e facilmente revisionabili.

<!-- TODO [PM/TM]: Definire e documentare le convenzioni relative a:
     - Nomenclatura di classi, metodi, variabili e package.
     - Organizzazione del codice.
     - Stile e formattazione.
     - Nomenclatura dei branch.
     - Formato dei commit.
     - Collegamento tra Issue, branch, commit e Pull Request. -->

## 6. Regole operative

### 6.1 Sempre

- Analizzare l'Issue prima di iniziare il lavoro.
- Identificare obiettivi, ambito e criteri di accettazione del task.
- Consultare RAD, SDD e gli altri documenti pertinenti e approvati.
- Rispettare i requisiti e le decisioni architetturali esistenti.
- Limitare le modifiche all'ambito autorizzato.
- Verificare la coerenza tra implementazione, modelli UML e test.
- Scrivere o aggiornare i test pertinenti quando richiesto dal task e tecnicamente possibile.
- Segnalare ambiguità, incongruenze, limitazioni e verifiche non eseguite.
- Presentare modifiche comprensibili, motivate e verificabili.
- Rispettare le procedure di revisione e approvazione del repository.

Se emerge un'incongruenza tra implementazione e documentazione approvata, segnalarla senza modificare arbitrariamente le specifiche di riferimento.

### 6.2 Chiedere prima

Richiedere chiarimenti o approvazione quando l'attività comporta:

- Modifiche ai requisiti approvati.
- Modifiche sostanziali all'architettura o ai modelli di riferimento.
- Introduzione di dipendenze o tecnologie non previste.
- Estensione significativa dell'ambito dell'Issue.
- Risoluzione di contraddizioni tra specifiche autorevoli.
- Modifiche a documenti ufficiali al di fuori dell'ambito autorizzato.
- Operazioni potenzialmente distruttive o difficilmente reversibili.

Quando una decisione necessaria non può essere ottenuta durante l'esecuzione, dichiarare il blocco e non procedere sulla base di supposizioni.

<!-- TODO [PM]: Definire chi è autorizzato ad approvare modifiche
     ai requisiti, alle decisioni architetturali, alle dipendenze
     e all'ambito dei task.
     Chiarire quando è sufficiente il coinvolgimento dei TM e
     quando è necessaria una decisione dei PM. -->

### 6.3 Mai

- Inventare requisiti, funzionalità o decisioni architetturali.
- Modificare arbitrariamente specifiche approvate.
- Inserire credenziali, token o altri segreti nel repository.
- Alterare o rimuovere test soltanto per nascondere errori.
- Dichiarare eseguiti test o controlli non realmente effettuati.
- Eseguire modifiche distruttive non richieste.
- Effettuare push diretti sul branch principale.
- Eseguire autonomamente il merge sul branch principale.
- Aggirare le verifiche o le approvazioni richieste dal processo.

## 7. Gestione delle Issue e delle Pull Request

Ogni task deve essere associato a una Issue o a un riferimento di lavoro esplicitamente identificabile.

Prima dell'implementazione:

1. Leggere la descrizione dell'attività.
2. Identificare i requisiti e i casi d'uso coinvolti.
3. Consultare i documenti e i modelli pertinenti.
4. Verificare che l'ambito e i criteri di accettazione siano chiari.
5. Segnalare le informazioni essenziali mancanti.

Durante l'implementazione:

1. Limitare le modifiche all'ambito previsto.
2. Rispettare le specifiche di riferimento.
3. Applicare le convenzioni di sviluppo.
4. Eseguire le verifiche pertinenti disponibili.
5. Documentare gli impedimenti e le eventuali deviazioni autorizzate.

Al termine, presentare le modifiche tramite Pull Request secondo il processo previsto dal repository.

La Pull Request deve rendere identificabili:
- L'Issue di riferimento.
- Le principali modifiche introdotte.
- I requisiti e i modelli considerati.
- I test eseguiti e i relativi risultati.
- Eventuali limitazioni o problemi irrisolti.
- Eventuali decisioni ancora in attesa di approvazione.

<!-- TODO [PM/TM]: Definire il contenuto obbligatorio delle Issue,
     includendo identificativo del caso d'uso, riferimenti ai
     documenti, ambito e criteri di accettazione.
     Valutare l'inserimento dei test frame pertinenti della
     Category Partition. -->

<!-- TODO [PM]: Definire il processo di revisione delle PR:
     - Chi deve revisionare le modifiche.
     - Quali approvazioni sono necessarie.
     - Quali controlli automatici devono essere superati.
     - Chi è autorizzato a effettuare il merge.
     Allineare queste regole a CODEOWNERS e alle protezioni
     del branch principale configurate su GitHub. -->

## 8. Criteri di completamento del task

Un task può essere dichiarato pronto per la revisione quando:

- Le modifiche richieste dall'Issue sono state realizzate oppure gli impedimenti sono esplicitamente dichiarati.
- Sono stati verificati i criteri di accettazione applicabili.
- È stata controllata la coerenza con le specifiche approvate.
- Sono stati eseguiti i test pertinenti disponibili, riportandone i risultati.
- Non sono state introdotte modifiche estranee all'ambito autorizzato, salvo quelle esplicitamente motivate.
- Le limitazioni note sono state dichiarate.
- La Pull Request contiene le informazioni necessarie alla revisione.

Non dichiarare un task completamente verificato se mancano controlli essenziali.

<!-- TODO [PM/TM]: Definire criteri di completamento verificabili,
     specificando:
     - Test richiesti per tipologia di task.
     - Eventuali test frame della Category Partition da coprire.
     - Verifiche di coerenza con RAD e SDD.
     - Condizioni per considerare una PR pronta alla revisione.
     - Gestione di test falliti, non eseguibili o non disponibili. -->

Il completamento del lavoro da parte dell'agente non equivale all'approvazione finale.

La revisione, l'accettazione e l'integrazione definitiva delle modifiche rimangono sotto responsabilità umana.
