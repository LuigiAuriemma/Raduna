# Documentazione di test

**Già stabilito.** Questa cartella raccoglie la documentazione di test di Raduna. Il team la usa per descrivere le verifiche previste e consultare l'esito di quelle svolte sui requisiti approvati.

**Per GitHub Copilot.** Mantenere la documentazione di test coerente con i requisiti approvati, l'implementazione e i modelli UML. Segnalare eventuali lacune o incongruenze secondo [AGENTS.md](../../AGENTS.md).

**Indicazione proposta.** Conservare qui, quando utili, piani di test, descrizioni dei casi di test e riepiloghi degli esiti. Collegare i casi di test ai requisiti che verificano.

**Stato attuale.** Sono presenti questo README e il segnaposto in `src/test/java/`, ma non test automatici applicativi, Category Partition, test frame o esiti documentati. Per gli artefatti necessari mancanti occorre chiedere il riferimento e la versione approvata; la sola presenza nel repository non implica approvazione.

**Strumenti concordati.** JUnit e Mockito per i test di unità, Testcontainers con MySQL per quelli di integrazione e JaCoCo per misurare la copertura. Il codice dei test è destinato a `src/test/java/`. Privilegiare Maven Wrapper: su Windows `.\mvnw.cmd test` esegue i test di unità e `.\mvnw.cmd clean verify` include quelli di integrazione; su POSIX usare `sh ./mvnw test` e `sh ./mvnw clean verify`. JaCoCo genera il rapporto nella fase `verify` quando sono presenti dati di copertura; `test` da solo non genera il rapporto HTML. I test Testcontainers richiedono Docker. I comandi completi sono nel [README generale](../../README.md).
