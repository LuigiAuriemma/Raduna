# Raduna

Progetto universitario del team C16 per il corso di Gestione dei Progetti Software.

## Prodotto

- Descrizione e obiettivi del prodotto: **Da definire**.
- Funzionalità e requisiti approvati: **Da definire**.
- Il progetto usa Java 25 LTS e Spring Boot con Spring MVC, Thymeleaf, Spring JDBC e Spring Security. Maven gestisce la build, MySQL i dati e Tomcat incorporato esegue l'applicazione web.

Si adotta una release stabile di Spring Boot con le dipendenze compatibili gestite dal suo parent Maven. Versioni di riferimento verificate il **22 novembre 2026**:

Il Pianificatore Actions usa Copilot CLI **1.0.114** e Node 22 in un'immagine con digest fissato; versione e compatibilità della CLI verificate il **23 novembre 2026** sulla [release ufficiale](https://github.com/github/copilot-cli/releases/tag/v1.0.114) e sulla [guida di installazione](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli). Il collaudo con l'identità Copilot del team resta da eseguire.

| Tecnologia | Versione stabile | Fonte ufficiale |
| --- | --- | --- |
| Java SE / JDK | 25 LTS, con aggiornamenti della serie 25 | [Oracle](https://www.oracle.com/java/technologies/downloads/) |
| Spring Boot | 4.2.0 | [Spring Boot](https://docs.spring.io/spring-boot/system-requirements.html) |
| Maven | 3.10.2 | [Apache Maven](https://maven.apache.org/download.cgi) |
| MySQL Community Server | 26.10.0 | [MySQL](https://dev.mysql.com/downloads/mysql/) |
| Spring MVC, Thymeleaf, Spring JDBC, Spring Security, Tomcat, driver MySQL, JUnit, Mockito, Testcontainers | Gestite dal parent Spring Boot 4.2.0 | [Dipendenze gestite](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html) |
| JaCoCo | 0.8.16 | [JaCoCo](https://www.jacoco.org/jacoco/) |

Il `pom.xml` genera un JAR eseguibile con Tomcat incorporato. Il package iniziale è `it.unisa.c16.raduna`.
I nomi e le responsabilità delle classi di dominio saranno ricavati dai modelli approvati.
Le scelte tecniche concordate devono essere recepite nell'SDD e nell'ODD.

## Preparazione di un nuovo ambiente

### Prerequisiti e clone

Installare [Git](https://git-scm.com/downloads), un **JDK 25 LTS aggiornato** (per esempio Eclipse Temurin) e MySQL Community Server. Non bastano una JRE o MySQL Workbench senza il server. Non occorre installare Maven o Tomcat separatamente.

Su Windows usare PowerShell; su Linux/macOS usare una shell POSIX. Verificare:

```text
git --version
java -version
javac -version
```

Java e javac devono appartenere alla serie 25. Se necessario impostare `JAVA_HOME` sulla cartella del JDK e aggiungere la sua sottocartella `bin` al `PATH`, seguendo le istruzioni del distributore per il proprio sistema. Non copiare percorsi di un altro computer.

```text
git clone https://github.com/LuigiAuriemma/Raduna.git
cd Raduna
```

Usare il branch o commit indicato dal TM. Il clone è sufficiente soltanto dopo che POM, sorgenti e file di questa procedura sono stati approvati e pubblicati nel repository: i file non tracciati sul PC di un membro non vengono clonati.

#### JDK 25 LTS su macOS

In **Informazioni su questo Mac** controllare il processore: Apple Silicon (chip Apple) richiede **ARM64 / aarch64**, Intel richiede **x64 / x86_64**. Da [Eclipse Temurin](https://adoptium.net/temurin/releases/?version=25&os=mac) selezionare Java **25 LTS**, macOS, tipo **JDK** e l'architettura del Mac; scaricare l'aggiornamento disponibile della serie 25 in formato `.pkg`. Aprire il pacchetto e completare la [procedura ufficiale di installazione](https://adoptium.net/installation/macOS).

Nel Terminale elencare i JDK riconosciuti da macOS:

```sh
/usr/libexec/java_home -V
```

Se Java 25 non è quello selezionato, oppure `JAVA_HOME` indica un altro JDK, eseguire nella sessione usata per Raduna:

```sh
export JAVA_HOME="$(/usr/libexec/java_home -v 25)"
export PATH="$JAVA_HOME/bin:$PATH"
java -version
javac -version
```

Controllare prima che l'elenco contenga un JDK 25 dell'architettura corretta; se manca, completare l'installazione. Entrambi i comandi devono riportare la serie **25**. Gli export valgono per il terminale corrente; per renderli persistenti aggiungerli al file di inizializzazione della propria shell (per esempio `~/.zshrc` con zsh), poi aprire un nuovo terminale. Un IDE già aperto può richiedere di selezionare separatamente il JDK 25.

### Maven Wrapper

Il repository include [Apache Maven Wrapper](https://maven.apache.org/tools/wrapper/) **3.3.4**, modalità ufficiale predefinita `only-script`, configurato per **Maven 3.10.2**. Non contiene un JAR del Wrapper. Il primo utilizzo scarica Maven tramite HTTPS e controlla il checksum `distributionSha256Sum` prima di estrarlo; gli utilizzi successivi riusano la distribuzione nella cache utente `.m2/wrapper/dists`.

Il checksum SHA-256 versionato è stato calcolato sull'archivio ZIP dopo il confronto con il [checksum SHA-512 ufficiale Apache](https://downloads.apache.org/maven/maven-3/3.10.2/binaries/apache-maven-3.10.2-bin.zip.sha512). In caso di aggiornamento vanno verificati e aggiornati insieme URL e checksum. Non rimuovere il controllo per aggirare un errore.

Su Windows sono necessari PowerShell e accesso HTTPS. Su Linux/macOS servono una shell POSIX, `curl` o `wget`, **`unzip`** e `sha256sum` o `shasum`. Con il checksum del file ZIP è necessario `unzip`: il fallback del Wrapper a `.tar.gz` scaricherebbe un archivio con checksum diverso. Installare questi strumenti tramite il gestore del sistema se mancanti.

Verificare il Wrapper dalla radice:

| Sistema | Comando |
| --- | --- |
| Windows / PowerShell | `.\mvnw.cmd --version` |
| Linux/macOS | `sh ./mvnw --version` |

Il comando POSIX usa esplicitamente `sh`, quindi funziona anche se il checkout non conserva il bit eseguibile. Se il file è eseguibile si può usare anche `./mvnw`. Le terminazioni sono definite in `.gitattributes`.

L'output deve riportare Maven 3.10.2 e Java 25. Il primo utilizzo richiede rete verso Maven Central anche per dipendenze e plugin. Il Wrapper non installa il JDK. Un Maven 3.10.2 già installato rimane utilizzabile con gli equivalenti comandi `mvn`.

### Database MySQL locale

Installare e avviare MySQL secondo le [istruzioni ufficiali](https://dev.mysql.com/doc/refman/en/installing.html) per il proprio sistema. Il nome del servizio Windows o del servizio Linux dipende dall'installazione: non assumere un nome specifico. Usare inizialmente la porta 3306, oppure annotare quella scelta e adeguare l'URL JDBC.

La tabella delle versioni indica il riferimento disponibile, non la versione provata sul singolo computer. Annotare la versione server con `SELECT VERSION();`: la versione del driver Connector/J incluso nell'applicazione è distinta. Non è necessario installare il driver manualmente.

#### Installazione e avvio su macOS

1. Aprire i [download ufficiali di MySQL Community Server](https://dev.mysql.com/downloads/mysql/), selezionare macOS e il pacchetto **DMG Archive** compatibile con la propria versione di macOS e architettura: **ARM, 64-bit** per Apple Silicon oppure **x86, 64-bit** per Intel.
2. Aprire il `.dmg`, avviare il `.pkg` e seguire l'[installazione ufficiale](https://dev.mysql.com/doc/refman/en/macos-installation-pkg.html), includendo MySQL Server, il pannello MySQL e il supporto launchd. Configurare la password amministrativa locale quando richiesto.
3. Se il server non è già avviato, aprire il [pannello MySQL](https://dev.mysql.com/doc/refman/en/macos-installation-prefpane.html) nelle Impostazioni di Sistema (Preferenze di Sistema nelle versioni precedenti) e usare il pulsante di avvio del server. Il pannello mostra lo stato e permette di abilitare l'avvio automatico.

Nel Terminale individuare il client:

```sh
command -v mysql
ls -l /usr/local/mysql/bin/mysql
```

Con il pacchetto ufficiale il percorso abituale è `/usr/local/mysql/bin/mysql`, tramite il collegamento alla directory della versione installata. Se il primo comando non trova il client ma il secondo sì, usarne il percorso completo oppure aggiungere nella sessione:

```sh
export PATH="/usr/local/mysql/bin:$PATH"
```

Se il percorso manca, controllare la destinazione scelta nell'installer. Non serve Homebrew. Verificare la raggiungibilità del server con una query tramite TCP, usando l'account amministrativo configurato:

```sh
mysql --protocol=TCP -h localhost -P 3306 -u root -p -e "SELECT VERSION(), 1;"
```

Se si usa il percorso completo, sostituire solo `mysql` con `/usr/local/mysql/bin/mysql`. Adeguare account e porta all'installazione. Il risultato deve contenere la versione server e il valore `1`: il solo stato nel pannello o `mysql --version` non dimostra la riuscita della connessione.

#### Provisioning e verifica dell'account applicativo

Aprire il client MySQL con un amministratore **locale**, per esempio `mysql -u root -p` se l'installazione usa tale account. `-p` chiede la password senza scriverla nel comando. Se `mysql` non è nel `PATH`, usare il percorso del client della propria installazione oppure l'editor SQL di Workbench. Non condividere la password amministrativa e non usarla nelle variabili dell'applicazione.

Eseguire nel client SQL:

```sql
SELECT VERSION();
CREATE DATABASE IF NOT EXISTS raduna;
CREATE USER 'raduna_app'@'localhost' IDENTIFIED BY '<PASSWORD_LOCALE_DA_SCEGLIERE>';
GRANT SELECT, INSERT, UPDATE, DELETE ON raduna.* TO 'raduna_app'@'localhost';
SHOW GRANTS FOR 'raduna_app'@'localhost';
```

Sostituire il segnaposto prima dell'esecuzione con una password scelta localmente, usando l'escaping SQL previsto dal client se necessario; non salvare il comando compilato nel repository. Questi sono comandi di provisioning, da eseguire una volta: se l'utente esiste già, verificarne identità e privilegi prima di riutilizzarlo. Non eliminarlo né sovrascriverne la password alla cieca.

L'account applicativo ha soltanto privilegi sui dati del database `raduna`, senza privilegi globali o di creazione delle tabelle. Lo scheletro attuale non contiene tabelle e non esegue operazioni di dominio; i privilegi andranno riesaminati con i DAO approvati. Non vengono introdotti schemi o migrazioni.

Verificare separatamente l'account applicativo, usando lo stesso host e porta dell'URL JDBC:

```text
mysql --protocol=TCP -h localhost -P 3306 -u raduna_app -p raduna
```

```sql
SELECT CURRENT_USER(), DATABASE(), VERSION();
SELECT 1;
```

Su macOS e altri sistemi Unix, il client con `localhost` può usare un socket locale e ignorare la porta. L'opzione `--protocol=TCP` forza invece la [connessione TCP](https://dev.mysql.com/doc/refman/en/connecting.html). Usare lo stesso host e la stessa porta di `RADUNA_DB_URL`: il comando sopra corrisponde a `jdbc:mysql://localhost:3306/raduna`; se si modifica l'URL, adeguare anche il test.

Il database deve essere `raduna` e l'ultima query deve restituire `1`. Questa verifica controlla l'accesso dal client MySQL, non il DataSource Spring Boot.

### Variabili d'ambiente

`application.properties` legge `RADUNA_DB_URL`, `RADUNA_DB_USERNAME` e `RADUNA_DB_PASSWORD`. Impostarle nella **stessa sessione** da cui si avvia l'applicazione; una nuova shell o un IDE già aperto non eredita automaticamente le variabili impostate altrove. Spring Boot non carica automaticamente un file `.env` in questo progetto.

Windows / PowerShell (la password è richiesta senza eco):

```powershell
$env:RADUNA_DB_URL = 'jdbc:mysql://localhost:3306/raduna'
$env:RADUNA_DB_USERNAME = 'raduna_app'
$radunaPassword = Read-Host 'Password MySQL di raduna_app' -AsSecureString
$radunaCredential = [System.Management.Automation.PSCredential]::new('raduna_app', $radunaPassword)
$env:RADUNA_DB_PASSWORD = $radunaCredential.GetNetworkCredential().Password
Remove-Variable radunaPassword, radunaCredential
```

Linux/macOS / shell POSIX (la lettura avviene in un sottoprocesso, che ripristina l'eco anche in caso di interruzione):

```sh
export RADUNA_DB_URL='jdbc:mysql://localhost:3306/raduna'
export RADUNA_DB_USERNAME='raduna_app'
RADUNA_DB_PASSWORD=$(
  raduna_echo=$(stty -g) || exit 1
  trap 'stty "$raduna_echo"; printf "\n" >&2' EXIT
  trap 'exit 1' HUP INT TERM
  printf 'Password MySQL di raduna_app: ' >&2
  stty -echo
  IFS= read -r raduna_password || exit 1
  printf '%s' "$raduna_password"
) && export RADUNA_DB_PASSWORD
```

Non inserire password nell'URL JDBC, negli argomenti Java/Maven o nei file versionati. Le variabili del processo sono utilizzate dall'applicazione; chiudere la sessione al termine oppure rimuovere la password con `Remove-Item Env:RADUNA_DB_PASSWORD` su PowerShell o `unset RADUNA_DB_PASSWORD` su POSIX.

## Build e test

Eseguire dalla radice del progetto:

| Operazione | Windows / PowerShell | Linux/macOS |
| --- | --- | --- |
| Compilazione | `.\mvnw.cmd compile` | `sh ./mvnw compile` |
| Test unitari | `.\mvnw.cmd test` | `sh ./mvnw test` |
| Verifica e packaging | `.\mvnw.cmd clean verify` | `sh ./mvnw clean verify` |

`test` usa JUnit e Mockito con i nomi standard di Surefire (per esempio `NomeTest.java`). `clean verify` include Failsafe per i test di integrazione (per esempio `NomeIT.java`) e genera `target/raduna.jar`.

**Attualmente non ci sono test automatici:** `BUILD SUCCESS` dimostra la build dello scheletro, non la correttezza di funzionalità o della connessione MySQL. La compilazione dello scheletro non richiede MySQL in esecuzione o credenziali. JaCoCo genera `target/site/jacoco/index.html` nella fase `verify` soltanto quando sono disponibili dati di copertura; `test` da solo non genera il rapporto HTML.

JUnit, Mockito e Testcontainers sono già previsti. I futuri test MySQL con Testcontainers richiederanno un runtime Docker compatibile; questa prima fase non introduce container né nuovi test di integrazione. Gli esiti dei test di comportamento dovranno derivare dai casi d'uso e dai test frame approvati.

## Avvio locale e smoke test

Con MySQL avviato e le tre variabili configurate, scegliere **uno** dei seguenti metodi:

| Metodo | Windows / PowerShell | Linux/macOS |
| --- | --- | --- |
| Maven Wrapper | `.\mvnw.cmd spring-boot:run` | `sh ./mvnw spring-boot:run` |
| JAR dopo `clean verify` | `java -jar target/raduna.jar` | `java -jar target/raduna.jar` |

1. Attendere il messaggio di avvio completato e Tomcat sulla porta 8080, senza errori di avvio.
2. Aprire `http://localhost:8080/login`: deve apparire il modulo di accesso.
3. Inserire l'utente tecnico **`user`** e la password temporanea stampata **localmente** nel log di quell'avvio. Non allegare il log contenente la password a Issue o PR.
4. Dopo l'accesso, la richiesta di `/` può terminare con **HTTP 404**: attualmente non ci sono controller o una homepage. Non è una prova di errore di autenticazione né di malfunzionamento MySQL.
5. Arrestare l'applicazione con `Ctrl+C`.

L'autenticazione generata da Spring Security è **temporanea e riservata allo sviluppo locale**; cambia al riavvio e non rappresenta login e ruoli del prodotto. Questi saranno implementati secondo le specifiche approvate. Non usare questa configurazione come autenticazione di produzione.

Il login e l'avvio del server non dimostrano una query attraverso il DataSource Spring. Tale verifica e il collaudo su un secondo computer con clone pulito restano da eseguire; non è previsto un endpoint di salute applicativo in questa fase.

### Stato delle verifiche macOS

**Verifica statica documentale del 22 novembre 2026:** istruzioni confrontate con `pom.xml` (Java 25, Spring Boot 4.2.0), script e proprietà del Maven Wrapper (3.3.4, Maven 3.10.2) e `application.properties` (`RADUNA_DB_URL`, `RADUNA_DB_USERNAME`, `RADUNA_DB_PASSWORD`). I comandi POSIX di build, test e avvio già riportati si applicano sia a Intel sia ad Apple Silicon, con JDK e server MySQL della rispettiva architettura. Il Wrapper usa gli strumenti POSIX indicati sopra, incluso `shasum` come alternativa a `sha256sum`.

**Collaudo effettivo su macOS non ancora eseguito:** restano da provare su Mac Intel e Apple Silicon installazione e selezione del JDK, avvio e accesso TCP a MySQL, download del Wrapper, build, test e avvio dell'applicazione con le variabili configurate. La verifica statica non certifica questi esiti né la connessione tramite il DataSource Spring.

### Risoluzione dei problemi

| Sintomo | Controllo o azione |
| --- | --- |
| `java`/`javac` non trovati, `release version 25 not supported` | Installare il JDK 25 e controllare `JAVA_HOME`, `PATH` e la versione Java riportata dal Wrapper. Riaprire il terminale dopo modifiche persistenti. |
| Wrapper non presente nel clone | Controllare il commit ricevuto dal TM: i file locali non tracciati non sono distribuiti da Git. |
| `Permission denied` su `mvnw` | Usare `sh ./mvnw`; verificare terminazioni LF e disponibilità degli strumenti POSIX elencati sopra. |
| Download fallito, proxy o errore TLS | Verificare accesso HTTPS a Maven Central, proxy e certificati del JDK/sistema. Non disabilitare TLS o checksum; non salvare credenziali del proxy nel repository. |
| Checksum Maven non valido | Verificare URL e checksum con le fonti Apache; controllare proxy e download. Su POSIX verificare prima che `unzip` sia installato. Non cancellare il checksum dalla configurazione. |
| Cache Maven non scrivibile / `Accesso negato` | Controllare la directory utente usata dal processo e i permessi della cache `.m2`. Non servono percorsi specifici del PC del PM né Maven eseguito abitualmente come amministratore. |
| Variabili mancanti / errore URL JDBC | Impostare tutte e tre le variabili nella sessione di avvio, verificando i nomi senza stampare la password. |
| `Communications link failure` / connessione rifiutata | Controllare che MySQL sia avviato, host e porta coincidano con l'URL e il client MySQL riesca a collegarsi. |
| `Unknown database 'raduna'` | Creare il database sul server effettivamente indicato nell'URL. |
| `Access denied for user` | Provare l'account dedicato dal client, controllare password, host dell'account e `SHOW GRANTS` con l'amministratore locale. Non sostituirlo con root nell'applicazione. |
| Errore di autenticazione TLS/RSA del driver MySQL | Verificare con la documentazione MySQL la configurazione TLS e dell'account; non aggiungere automaticamente parametri che disabilitano la sicurezza all'URL JDBC. |
| Porta 8080 occupata | Arrestare la propria precedente istanza o avviare il JAR con `java -jar target/raduna.jar --server.port=8081`, adeguando l'URL del browser. |
| Login rifiutato | Usare `user` e la password generata dall'istanza attualmente in esecuzione; le credenziali MySQL sono diverse. |
| 404 dopo il login / rapporto JaCoCo assente | Sono compatibili rispettivamente con homepage non implementata e assenza di test/dati di copertura. Non equivalgono a test applicativi superati. |

## Team C16

Il team è composto da 8 persone:

- **2 Project Manager (PM)**: pianificazione, supervisione e verifica dei deliverable.
- **6 Team Members (TM)**: sviluppo software e relativa documentazione.

## Struttura del repository

```text
Raduna/
├── README.md
├── AGENTS.md
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .mvn/wrapper/maven-wrapper.properties
├── .gitattributes
├── .gitignore
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── templates/
│   │       └── static/
│   └── test/java/
├── docs/
│   ├── rad/
│   ├── sdd/
│   ├── modelli/
│   └── test/
└── .github/
    ├── agents/
    ├── workflows/
    └── ISSUE_TEMPLATE/
```

- `AGENTS.md`: istruzioni condivise per gli agenti AI che operano sul repository.
- `mvnw`, `mvnw.cmd`, `.mvn/wrapper/`: Maven Wrapper ufficiale con versione e checksum della distribuzione fissati.
- `.gitattributes`: terminazioni degli script; `.gitignore`: artefatti generati, file locali e configurazioni sensibili.
- `docs/rad/`: Requirements Analysis Document (RAD).
- `docs/sdd/`: Software Design Document (SDD).
- `docs/modelli/`: modelli UML.
- `docs/test/`: documentazione di test.
- `src/main/java/`: codice applicativo Java.
- `src/main/resources/`: configurazione, template Thymeleaf e risorse statiche.
- `src/test/java/`: codice dei test automatici Java.
- `.github/workflows/`: spazio riservato ai futuri workflow GitHub Actions.
- `.github/ISSUE_TEMPLATE/`: spazio riservato ai futuri template delle issue.
- `.github/agents/`: profili Copilot per pianificazione, implementazione, test e revisione.

Le cartelle ancora vuote contengono un file `.gitkeep` per essere conservate in Git.
Il punto di avvio Spring Boot è in `src/main/java/it/unisa/c16/raduna/RadunaApplication.java`.

## Collaborazione

La pipeline condivisa usa GitHub Copilot Student con i ruoli definiti in `.github/agents/`.
Il flusso concordato comprende piano, approvazione umana, implementazione, test indipendenti, CI e revisione umana.
I workflow di CI e le protezioni GitHub devono ancora essere configurati. Il merge e l'accettazione restano sotto responsabilità umana.
