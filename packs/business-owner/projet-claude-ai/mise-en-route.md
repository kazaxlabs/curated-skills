# Mise en route

Ce document est le point de départ de votre projet « Mise en route » dans claude.ai. Il dit dans quel ordre faire les
étapes de mise en place de votre entreprise, ce que chacune débloque et ce qu'il vous faut pour la faire. Quand vous
êtes prêt, écrivez « prochaine étape » dans le projet : Claude vous donne le texte de l'étape suivante, à coller dans
Claude dans Chrome.

## 1. Préparer le projet (une seule fois)

Les noms des menus peuvent être en anglais ou changer un peu. Si un écran ne correspond pas, demandez à Claude.

1. **Créer le projet.** Dans claude.ai, ouvrez « Projets », puis « Nouveau projet ». Nommez-le « Mise en route ».
2. **Instructions du projet.** Dans le projet, choisissez « Définir les instructions du projet » (Set project
   instructions). Collez tout le contenu du fichier `instructions-agent.md`, puis enregistrez.
3. **Fichiers du projet.** Dans la zone des connaissances du projet (le bouton « + »), ajoutez :
   - ce fichier, `mise-en-route.md`;
   - les huit étapes du dossier `playbooks/`;
   - votre `profil-entreprise.md`, dès qu'il existe (section 2).
4. **Compétences.** Dans les paramètres, activez l'exécution de code (« Code execution and file creation ») si elle est
   éteinte. Ensuite, dans Personnaliser › Compétences (Customize › Skills), téléversez chaque fichier ZIP que votre
   conseiller vous a remis, un à la fois. Les compétences en français apparaissent dans la liste.
5. **Préférences de votre profil.** Dans les paramètres de votre profil (vos initiales, en bas à gauche), collez le
   contenu de `preferences-profil.md` dans le champ des instructions pour Claude. Elles s'appliquent à toutes vos
   conversations, dans le projet ou non.
6. **Claude dans Chrome.** Dans le navigateur Chrome sur votre ordinateur, ajoutez l'extension Claude depuis le Chrome
   Web Store, connectez-vous et épinglez-la. Elle s'ouvre dans un panneau sur le côté. Elle ne fonctionne pas sur
   téléphone.

Sources consultées le 2026-11-11 : [projets](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects),
[compétences](https://support.claude.com/en/articles/12512180-using-skills-in-claude),
[préférences](https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features),
[Claude dans Chrome](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome).

## 2. Première conversation : votre profil d'entreprise

Dans le projet, écrivez « Fais mon profil d'entreprise ». Claude vous pose ses questions : vos services, le territoire
que vous servez, vos clients, vos offres et vos fourchettes de prix, votre façon de parler, vos limites de conformité,
et les comptes que vous détenez (les noms seulement, jamais de mot de passe). À la fin, il vous remet le fichier
`profil-entreprise.md`. Ajoutez-le aux fichiers du projet. Toutes les étapes suivantes s'en servent.

## 3. L'ordre des étapes

L'ordre ci-dessous est celui par défaut. Votre conseiller peut le changer. Une étape qui ne vous concerne pas (par
exemple, pas de publicité Meta) se saute.

| # | Étape | Ce que ça débloque | Ce qu'il vous faut |
| --- | --- | --- | --- |
| 1 | `acces-equipe.md` | Vous savez qui a accès à quoi; vos associés ont leur propre accès; la connexion en deux étapes est vérifiée. | Vos connexions à chaque compte; le nom et le courriel de travail de vos associés. |
| 2 | `conformite-quebec.md` | Une liste de vérification remplie (Loi 25, consentements, courriels et textos, commerce itinérant) et vos questions pour l'avocat. | Vos réponses; votre site; un avocat. |
| 3 | `courriel-domaine-dns.md` | Votre site envoie ses courriels à votre nom de domaine, sans tomber dans les indésirables. | Votre nom de domaine; votre hébergeur DNS; un compte chez le fournisseur de courriel (Brevo par défaut). |
| 4 | `protection-site-web.md` | Vos formulaires bloquent les robots; la phrase de votre politique de confidentialité est prête pour l'avocat. | Un compte Cloudflare; la liste des adresses de votre site (votre conseiller). |
| 5 | `presence-google.md` | Statistiques de visites, fiche d'établissement Google validée, plan du site envoyé à Google. | Votre compte Google d'entreprise; votre site en ligne. |
| 6 | `alertes-texto.md` | Vous et votre équipe recevez un texto à chaque nouvelle demande. | Une pièce d'identité et une carte de paiement (vous); les numéros de cellulaire de l'équipe. |
| 7 | `publicite-meta-prospects.md` | Les demandes de vos publicités Facebook et Instagram arrivent avec les autres; vous voyez ce que coûte chaque demande. | Votre accès administrateur Meta Business; Google Cloud pour les clés; le feu vert du conseiller pour le test (phase 8). |
| 8 | `espace-de-travail.md` | Claude Code depuis votre téléphone ou votre ordinateur, avec la mémoire de votre entreprise. | Un forfait Claude payant qui inclut Claude Code; un compte GitHub. À faire quand vous voulez. |

## 4. « Prochaine étape »

**Pour vous.** Écrivez « prochaine étape » dans une conversation du projet. Claude vous donne le texte de l'étape à
faire, déjà rempli avec les renseignements de votre profil. Copiez ce texte, ouvrez Claude dans Chrome (le panneau de
côté), collez-le et répondez à ses questions. À la fin de chaque phase, Claude dans Chrome affiche un bloc
« RAPPORT » : collez-le dans la même conversation du projet. Gardez une seule conversation pour toute la mise en
route, pour que Claude voie où vous en êtes.

**Pour Claude, dans le projet.** Quand le propriétaire écrit « prochaine étape » :
1. Cherchez dans la conversation les blocs RAPPORT déjà collés. Une étape est faite quand son dernier RAPPORT y est
   (RAPPORT FINAL, ou le dernier RAPPORT de phase du playbook). Si vous n'en trouvez aucun, montrez la liste de la
   section 3 et demandez quelles étapes sont faites.
2. Si un RAPPORT montre une étape bloquée ou en attente (par exemple une validation de Google en cours), dites-le
   d'abord, avec ce que le propriétaire doit faire.
3. Prenez la première étape non faite, dans l'ordre de la section 3, en sautant celles que le propriétaire a écartées.
4. Ouvrez ce playbook dans les fichiers du projet. Remplissez chaque `[À REMPLIR]` du tableau « Fixed facts » à partir
   de `profil-entreprise.md`. Ne devinez rien : ce qui n'y est pas reste `[À REMPLIR]`. Si `profil-entreprise.md`
   manque, proposez d'abord de le faire (section 2).
5. Donnez au propriétaire, dans un seul bloc à copier, tout le texte du playbook qui suit la première ligne `---`, avec
   les valeurs remplies.
6. Sous le bloc, en français : le nom de l'étape, ce qu'elle débloque, ce qu'il lui faut, la liste des valeurs encore
   `[À REMPLIR]` (Claude dans Chrome les lui demandera), puis : « Ouvrez Claude dans Chrome, collez ce texte et
   répondez à ses questions. »
7. Ne lancez aucune action vous-même. Le playbook se fait dans Chrome, avec le propriétaire.

## 5. Ce que vous faites toujours vous-même

- Vous connecter, choisir vos mots de passe, entrer vos codes.
- Copier une clé ou un jeton directement de l'écran du fournisseur vers l'endroit sécurisé prévu. Jamais dans une
  conversation, un courriel ou un texto, même pour votre conseiller.
- Payer, choisir un forfait, acheter un numéro.
- Accepter des conditions et répondre aux fenêtres d'autorisation.
- Faire les vérifications d'identité ou d'entreprise.
- Vos documents juridiques (politique de confidentialité, contrats, avis), avec votre avocat.

## 6. Si quelque chose bloque

Si un écran ne ressemble pas à ce que Claude attend, il s'arrête et vous décrit ce qu'il voit. Collez le RAPPORT dans
le projet et, si vous avez un conseiller, envoyez-le-lui. Au besoin, une capture d'écran aide, à condition qu'aucune
clé, aucun mot de passe et aucun code n'y soit visible.
