# Registre des décisions

Les décisions réglées sur l'entreprise, une entrée par décision, la plus récente en bas.
Les décisions propres à un projet vont dans `projets/<nom>/registre-des-decisions.md`.

- L'agent ajoute une entrée dès qu'une question est réglée, sans demander.
- Avant de rouvrir une question, il vérifie ici si elle est déjà réglée.
- On n'efface jamais une entrée. Pour changer d'avis, on ajoute une nouvelle décision qui indique celle qu'elle
  remplace.
- Jamais de secret ni de nom de client : un client se nomme par son numéro de dossier.

Format d'une entrée :

```
## D-0001 : <titre court>
- Date : AAAA-MM-JJ
- Décision : <ce qui est décidé>
- Raison : <pourquoi>
- Options écartées : <les autres choix et pourquoi ils ont été écartés>
- Décidé par : <qui>
- À revoir le : AAAA-MM-JJ (ou « sans objet »)
- Remplace : D-00xx (ou « aucune »)
```

## Décisions
