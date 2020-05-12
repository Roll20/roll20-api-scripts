# COFantasy: Historique des changements (depuis la version 1.0)
## 2.05
### Autres améliorations
* Standardisation de !cof-lancer-sorts et support dans les consommables

## 2.04
### Capacités
* restriction des capacités de la voie de la mort aux cibles vivantes seulement.

### Autres améliorations
* Passage de la RD sur la fiche

## 2.03
### Capacités
* Amélioration du renouvellement des élixirs sur un forgesort.
* Rang 4 de la voie du bouclier du guerrier
* Meilleure interface des runes du forgesort, avec implementation du rang 4, et  renouvellement automatique des runes selon le choix des forgesorts.

### Autres améliorations
* Prise en charge des spécificités de l'épieu.
* Prévention de crash de la sandbox.
* Ajout de l'option --son pour !cof-rage-du-berserk
* Ajout de l'attaque de groupe, avec possibilité d'action spécifique détectée par le script.
* Ajout d'une option pour rajouter les attaques risquees et assurees a toutes les actions
* Ajout de la condition echecCritique pour --si et --if
* Ajout d'une option --image pour !cof-effet-temp et !cof-soins
* Nouvelle façon de souligner le personnage dont c'est le tour. Pour revenir à l'ancien système, utiliser !cof-options.
* Affichage des icones correspondant aux états dans la fonction statut.

### Corrections de bugs
* Plus de demande de mana si l'option de jeu mana est désactivé pour les fiches.
* possibilité d'utiliser !cof-jouer-son dans les actions du tour
* meilleure gestion de l'affichage du marqueur d'initiative pour les personnages sur une monture.
* Correction d'un bug qui empêchait les écuyer de soigner (et l'undo de certains repos).
* double escape des ':' dans les boutons (sinon, pas de lien)
* Correction d'un buf sur les effets génériques avec saveParTour

## 2.02
### Capacités
* Ajout des rangs 4 et 5 de la Voie de la résistance du guerrier.
* Ajout des rangs 4 et 5 de la Voie de la précisison de l'arquebusier.
* Amélioration de la prise en charge de la capacité Esquive du voleur.
* Ajout du rang 2 de la Voie du tueur.

### Autres améliorations
* Possibilité de changer les états directement depuis le token
* Ajout de conditions sur un attribut de cible quelconque pour l'attaque
* Possibilité d'arrêter tous les sons.

### Corrections de bugs
* Correction d'un bug sur les runes de protections
* Protection contre les macros et abilities de nom vide.
* Immunité à la surprise permet bien de ne pas faire le test.
* Utilisation d'un attribut mortVivant au lieu de mort-vivant.

## 2.01
### Capacités
* Ajout du rang 3 de la Voie du tueur.

### Autres améliorations
* Ajout d'une commande !cof-jouer-son
* bloque les personnages sous prison végétale.
* Possibilité d'ajouter des contraintes (comme --dose) au fonctions de repos.
* La capacité nature nourricière génère des consommanbles.
* prise en compte de l'option --attaqueMentale pour les créatures sans esprit.
* Ajout d'options de son sur les effets et le rechargement
* Possibilité d'afficher des images et de jouer des sons selon le résultat d'une attaque.

### Corrections de bugs
* Factorisation et amélioration des significations des options de sons et d'images d'attaques.
* Correction d'un bug pour les effets d'attaque conditionnels.
* Amélioration du parsing de handout pour les compétences en équipes.
* Correction d'un bug avec la tempete de mana qui pouvait faire affecter la cible plus le lanceur de l'effet du sort.

## 2.0
### Capacités
* Ajout de la capacité "Attaque en meute" des Gobelins
* Amélioration de la prise en compte du bonus d'init grâce aux familiers
* Ajout de l'esquive acrobatique du barde
* Ajout de l'ouverture mortelle du voleur
* Ajout de l'immunité à la surprise du voleur
* Changement des bonus d'interchangeable, qui rendaient les combats trop longs. Il y a une option pour revenir aux bonus d'origine.
* Ajout de la capacité "Foudres divines" du prêtre
* Ajout de la capacité "Furie berserk" du barbare
* Ajout de la capacité "Même pas mal" du barbare
* Ajout de la vulnérabilité aux critiques (pour les seigneurs de l'hiver)
* La capacité tir fatal peut maintenant être appliquée à d'autres catégories d'armes que l'arc.
* L'option --argent devient --armeDArgent. Cela permet d'utiliser --argent pour les armes en argent ordinaires.

### Autres améliorations
* Ajout de l'option d'attaque assurée et de l'option attaque risquée
* Affichage de la défense dans le statut, quand elle ne correspond pas à la défense affichée sur la fiche.
* Simplification du nommage des escaliers.
* Possibilité d'ajouter un message en argument de !cof-soins
* Ajout d'un icone pour les tokens affectés par saignement ou asphyxie
* Utilisation d'un dé explosif pour l'initiative variable
* Suite à une précision de Kegron sur les forums BBE, les attaques réussies font toujours au moins 1 DM.
* Si un personnage est monté sur une monture, assouplissement des conditions pour toucher au contact (on considère le token de la monture)
* On peut maintenant donner des arguments aux macros dans les listes d'actions
* !cof-jet --secret, lorsqu'il est employé par un joueur, envoie maintenant le résultat du jet à toutes les personnes qui contrôlent le personnage et au MJ.
* gestion du sort sixième sens
* gestion du niveau d'ébriété.
* ajout d'une option d'affichage pour ne pas montrer la DEF des adversaires.
* Les messages de dégâts d'effets temporaires indiquent le numéro de mob quand la cible n'est pas un personnage unique.
* Ajout de l'effet temporarire affaibli (affaibliTemp)
* Ajout d'un effet temporaire armesEnflammees pour enflammer toutes les armes portées par un personnage
* Ajout d'une option pour multiplier les dm d'un autre type que le principal en cas de critique.
* Rattrapage et message d'erreur en cas d'expression de dégâts mal formés.
* Mise à jour automatique des macros de jeu (par défaut)
* Gestion des directions d'escaliers
* La fiche peut désormais changer d'affichage si le script est utilisé dans la partie.
* Ajout d'une liste d'actions par défaut (si #Actions# n'est pas définie), et qui consiste en toutes les abilities du personnage.
* Possibilité de commenter une ligne de #Actions#, en la faisant commencer par //.
* Nouveau type de dégât, --argent.
* Les montures de l'attaquant et de sa cible ne sont plus considérées comme des obstacles lors des attaques à distance.

### Corrections de bugs
* Correction d'un bug qui empechait l'affichage du résultat d'un tour de force.
* Trouve les points de chance quand ils sont à la valeur par défaut
* Correction d'un bug qui faisait planter le sort de commeil
* Plus d'affichage de dégâts chaque tour sur les personnages morts
* En interne, modCarac accepte des id de personnage, ce qui fixe certains bugs avec des capacités de chevaliers.
* Prise en compte correcte du niveau de voie du métal ou de la valeur de la capacité forgeron

## 1.11
### Capacités
* Ajout d'une option pour que les créations d'élixirs soient considérées comme des sorts (avec éventuellement un coût en mana)
* Animer un cadavre, rang 2 de la voie de la magie maléfique.
* Agripper, rang 2 de la voie des créature volantes
* Destruction des mort-vivants peut maintenant utiliser les options de tempête de mana
* Mur de force utilise maintenant une image par défaut.
* Ajout de la capacité vitalité surnaturelle des créatures magiques.
* Ajout de l'aspect du démon

### Corrections de bugs
* Correction d'un bug qui faisait planter l'API quand il n'y avait pas de coût en mana pour certains sorts (comme destruction des morts vivants)
* Correction d'un bug de !cof-degainer causant un crash.
* Correction d'un bug de !cof-ignorer-la-douleur : ne reconnaissait plus les attaques
* Correction de bug (crash) avec les attaques magiques de certaines capacités
* Changement du nom de macro "Jets GM" en "Jets-GM"
* Correction d'un bug dans les macros de soin quand la cible a des DMs temporaires sur la barre 2
* Correction d'un bug de siphon des âmes
* Dans les listes d'actions, remplace les macros correctement même si un nom de macro est préfixe d'un autre.
* !cof-effet-temp met bien l'état associé quand on utilise paralyseTemp ou etourdiTemp

### Autres améliorations
* Affichage du nombre de soins restants dans le statut
* ajout d'explications aux jets de caractéristiques
* ajout d'une option --secret à !cof-attack

## 1.10

### Capacités
* Ajout de la capacité corps élémentaire de la voie de l'élémentaire
* Ajout de la capacité Riposte du champion
* Ajout de la capacité Seul contre tous du chevalier
* Ajout de l'enveloppement du cube gelatineux

### Autres améliorations
* Possibilité d'enduire des munitions de poison

## 1.09

### Capacités
* Ajout d'une option pour faciliter l'usage des lames jumelles du samouraï
* Ajout de la capacité Kiai du samouraï
* Ajout de la capacité Tir fatal du samouraï
* Ajout de la suggestion du psionique
* Ajout de l'aura de feu de l'élémentaire de feu
* Ajout de l'attaque étourdissante du psionique
* Ajout de controle du métabolisme du psionique
* Ajout de la surpuissance physique de l'invocateur

## Correction de bugs
* Correction d'un bug avec l'effet de peur des attaques, maintenant la résistance se fait avec le meilleur de FOR et SAG.
* Correction d'un bug avec les manoeuvres quand un des opposants n'a pas d'arme précise en main
* La macro Attaque est maintenant visible des joueurs
* Correction d'un bug qui faisait planter l'API en cas d'attaque d'un personnage de niveau jamais modifié.

## Autres améliorations
* Ajout de l'option de mana totale (pour la tempête de mana)
* Possibilités d'utiliser des fx créés par le MJ.

## 1.08

### Capacités
* Ajout de la conjuration d'armée de l'invocateur
* Ajout de la capacité Frappe lourde du chevalier
* Ajout de la capacité vampirisation de la Voie de la magie maléfique

### Autres améliorations
* Plus d'affichages de jets de dé (pour les soins de groupe, baies, fortifiants, ...)
* Compatibilité avec les fiches de PNJ (version 2.1 des fiches)

### Correction de bug
* L'angle des cônes est maintenant correctement calculé (il était 2 fois trop grand avant)
* Les options --equipe lisent maintenant correctement les handouts
* Correction d'un bug qui empêchait d'inactiver l'initiative variable

## 1.07

### Capacités
* Ajout du défi du samouraï
* Ajout de la monture loyale du samouraï
* Ajout du radar mental du psionique
* Ajout de la capacité Bouclier psi du psionique
* Ajout de la capacité Proprioception du psionique
* Ajout de la capacité Défense intuitive du psionique
* Ajout du champ de protection du psionique

### Autres améliorations
* Ajout d'une option pour ajouter 1d6 à l'initiative au début du combat
* Les options de script sont maintenant accessibles avec la commande !cof-options. Les options sont persistantes pour une même partie.

## 1.06
### Capacités
* Le fortifiant du forgefort affecte maintenant la commande !cof-jet
* Absorber un coup ou un sort est maintenant disponible sur l'affichage des attaques qui portent sur un guerrier en position.
* Prise en charge du sort de lumière du magicien
* Rang 1 de la voie de la magie de guérison

### Correction de bugs
* Amélioration de la compatibilité avec les autres scripts
* Le copy-paste de mobs devrait maintenant ne plus rajouter de numéros
* !cof-lancer-sort n'envoie plus de message en double au GM
* Undo devenu possible pour !cof-dmg appliqué à un token lié
* Plus de message d'erreur dans le log quand on utilise un tableau au lieu d'un label pour une attaque

### Autres améliorations
* Ajout de la commande !cof-manoeuvre pour faire des manoeuvres risquées
* Ajout d'une commande pour les tests d'attaque au contact opposée
* Ajout de la gestion des torches
* Ajout d'un effet au feu grégeois

## 1.05
### Capacités
* Conjuration de prédateurs de l'invocateur
* Cibles multiples (pour les nuées)
* Frénésie (pour les hommes-rats)
* Capacité enrager de la voie du Cogneur
* Capacité grenaille de l'arquebusier
* Mise à jour de la capacité forme d'arbre, suites aux indications de Kegron : la forme d'arbre a maintenant niveau * 5 PV.
* Prise en compte des effets de protection contre les souffles et les dégâts de zone.

### Correction de bug
* undo d'une diminution de PV sur un token lié remet maintenant correctement les PVs de tous les tokens liés au même personnage.

### Autres améliorations
* Ajout de l'état encombré, qui impose des d12 pour les tests de DEX.
* Le script ne devrait plus être sensible à la casse des attributs de fiche.
* !cof-set-macros pour créer automatiquement les macros quand on commence une partie (ou pour mettre à jour vos macros).
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

