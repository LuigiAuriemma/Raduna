# Progettazione del software (SDD)

**Già stabilito.** Questa cartella è destinata al Software Design Document (SDD). Attualmente contiene soltanto questo README: SDD, ODD e diagrammi non sono presenti nel repository; per consultarli occorre il riferimento esterno alla versione approvata. La presenza di un documento non ne implica l'approvazione. Il team consulta il SDD approvato per orientare l'implementazione e verificare che questa rispecchi le decisioni di progettazione.

**Per GitHub Copilot.** Attenersi alle decisioni approvate e segnalare eventuali incongruenze tra SDD, implementazione, modelli UML e test. Le istruzioni condivise sono in [AGENTS.md](../../AGENTS.md).

**Indicazione proposta.** Collegare dal SDD i [modelli UML](../modelli/) pertinenti, quando disponibili, per facilitarne la consultazione.

**Scelte tecniche concordate da recepire nell'SDD/ODD.** Applicazione unica con Java 25 LTS, Spring Boot, Spring MVC, Thymeleaf, Spring JDBC, Spring Security e MySQL. I livelli restano Interface, Control, Service e Storage. Il POM genera un JAR con Tomcat incorporato. Privilegiare Maven Wrapper per i comandi. Le versioni e i comandi sono nel [README generale](../../README.md).
