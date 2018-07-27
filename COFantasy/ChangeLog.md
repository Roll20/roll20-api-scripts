# COFantasy: Historique des changements (depuis la version 1.0)
## 1.05
### Capacités
* Capacité enrager de la voie du Cogneur
* Capacité grenaille de l'arquebusier
* Mise à jour de la capacité forme d'arbre, suites aux indications de Kegron : la forme d'arbre a maintenant niveau * 5 PV.
* Prise en compte des effets de protection contre les souffles et les dégâts de zone.

### Correction de bug
* undo d'une diminution de PV sur un token lié remet maintenant correctement les PVs de tous les tokens liés au même personnage.

### Autres améliorations
* Il est maintenant possible d'utiliser tir double avec 2 armes différentes.
* Encaisser un coup est maintenant proposé en bouton à cliquer en cas d'attaque réussie.

## 1.04
### Nouvelles capacités
* Runes de puissance du forgesort

### Autres améliorations
* Ajout de l'option --maxDmg pour les attaques et !cof-dmg
* Il est maintenant possible d'ouvrir des listes d'actions indépendantes des #Actions#, et ces listes peuvent aussi contenir une référence à une autre liste.
* Suite à une précision de Kegron, les critiques (hors 20) qui ne passent pas la DEF de la cible devienent une réussite normale
* Prise en compte d'un attribute armeParDefaut pour définir quelle arme un personnage donné a en main (ou pas).
* Correction d'un bug quand HealthColors n'était actif.
* Possibilité d'avoir des macros ou ability ayant plusieurs lignes dans les #Actions#

## 1.03
* En cas de save par tour d'un dotGen, affiche le nom du dotGen plutôt que dotGen(nom)
* Capacité clignotement du Barghest
* Ajout d'actions pour se libérer des états préjudiciables
* Nouvelle option d'attaque --allonge
* Ajout de l'état immobilisé
* !cof-tour-suivant : permet à un joueur de passer au tour suivant si il contrôle le token dont c'est le tour.
* Gestion des personnages immobilisés : par défaut, le script empêche maintenant les joueurs de les bouger.
* Appels à HealthColors lors des changements de valeur des barres
* Ajout de la possibilité d'ajouter une ligne de texte dans la fenêtre d'attaque (option --message).
* Ajout de conditions complexes (et possiblement imbriquées) pour les options d'attaque. Cela rend les options --etatsi et --psi inutiles : à la place on peut écrire --if cond --plus ... --endif.

## 1.02
* Ajout de la possibilité de spécifier un save d'effet temporaire de la forme --save carac seuil demiDuree, pour que le save ne fasse que diviser par 2 la durée de l'effet.

## 1.01
### Nouvelles capacités
* Gland de pouvoir (Druide)
* Attaque en traître (Voleur)

### Corrections de bugs
* La création d'elixirs fonctionne maintenant correctement avec des tokens ayant des espaces dans leur nom

### Autres améliorations
* Possibilité de mettre fin à un effet temporaire avec la commande !cof-effet-temp effet 0.
* Changement des commandes pour le passage des nuits. Les commandes !cof-nuit et !cof-jour sont remplacées par !cof-nouveau-jour.
* Ajout de la possibilité de spécifier une image spécifique à un personnage pour le token en forme d'arbre.

## 1.0
### Nouvelles capacités
* Forme d'arbre (Druide)
* Mutation protectrice (Invocateur)
* Mutation offensive (Invocateur)
* Chef né (Samouraï)
* Attaque paralysante (Voleur)
* Rang 1 des créatures élémentaires (immunité à un type, et souffle)

### Autres améliorations
* Ajout des options --fx et --targetFx pour les soins
* Amélioration de l'affichage pour !cof-jet (en particulier, la fenêtre est maintenant chuchotée à la personne qui fait le jet).
* Gestion automatique des boucliers selon qu'on dégaine ou rengaine des armes à 2 mains.
* Ajout de l'ability #Actions#, qui fonctionne comme #TurnAction#, mais affiche toujours par défaut les actions de défense et d'attente.

