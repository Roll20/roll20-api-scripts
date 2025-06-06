# COFantasy: Historique des changements (depuis la version 1.0)
## 3.15
### Capacités
* Implémentaion d'un prédicat pour Autorité naturelle.
* Armure de feu
* Au dessus de la mêlée.
* Transformation régénéatrice.
* Implémentation des capacité de forme animale.
* Vent des âmes de la Voie de Morn
* Phénix, de la Voie du guérisseur.
* Possibilité d'avoir un lien de sang vers plus d'un personnage
* Hémorragie de Pestrilax.
* Prise en compte de la capacité Tir double pour les attaques à 2 mains.
* Défi de la Voie du Duelliste
* Meilleure prise en charge de la spécialisation du guerrier.
* Implémentation de la version avancée du drain de force de Dominia.

### Autres améliorations
* Possibilité d'avoir des escaliers (ou portails) automatiques.
* Ajout d'options --finEtat et --finEffet pour les attaques.
* Prise en compte de decrcAttribute pour les actions montrées.
* Ajout d'un effet temporaire générique.
* Les cadavres réanimés sont considérés comme chair à canon du nécromancien s'il possède cette capacité.
* Ajout de la possibilité de drainer de la mana.
* Ajout du poison paralysant
* Ajout d'une option --depensePR pour les actions autres que les attaques
* Ajout d'une commande !cof-recupere-mana.
* Règle optionnelle pour faire récupérer des points de mana quand on dépense un point de récupération.
* Implémentation de prédicats pour les bonus en RD et aux caractéristiques.
* Prise en compte des émissaires du dragon pour les ancres.
* Amélioration de la gestion des utilisations de points de chance pour des attaques complexes.
* Réinitialisation des options d'attaque à la fin d'un combat
* Synchronisation des barres de tokens quand on le pose : Roll20 ne le fait plus correctement.
* Extension des mécanismes d'escaliers pour Invincible.
* Ajout d'un bonus magique pour absorber un coup ou un sort quand le bouclier est magique.
* Prise en charge de plusieurs casque à mettre depuis le statut

### Correction de bugs
* Correction d'un bug pour les conditions d'attaque sur les attributs.
* Correction pour les armes en main des mooks
* Ne pas demander qu'un PNJ ait un prédicat pour se battre à 2 armes sans malus.

## 3.14
### Capacités
* Général de la campagne Vengeance.
* Meilleure prise en charge de l'ambidextrie du voleur et du combat à deux armes amélioré.
* Massacrer la piétaille
* Ajout de la Voie de prestige du loup-garou.
* Amélioration de la prise en charge du rang 1 de la Voie du prédateur.
* Amélioration de la prise en chagre de la capacité Exemplaire du chevalier.
* Utilisation d'un prédicat pour As de la gachette.
* Amélioration de la prise en charge du tir double.

### Autres améliorations
* Amélioration de la présentation des armes à dégainer quand un personnage combat à deux armes.
* Les PNJ avec une seule arme visible la dégainent automatiquement quand on pose le token.

### Corrections de bugs
* Correction d'un bug qui faisait planter en cas d'interposition du golem.

## 3.13
### Capacités
* Support pour la démolition et les pièges explosifs.
* Amélioration du support des tirs de semonce.
* Attaque en meute pour un joueur gobelin.
* Attaque bondissante du druide
* Charge du barbare (avec le déplacement)
* Vitalité épique.
* Pluie de flèches de la Voie d'Arwendée.
* Rangs 1 à 4 de la Voie du guérisseur.
* Rangs 4 et 5 de la Voie télépathie
* Expertise (rang 1 de la Voie de prestige spécialisée)

### Autres améliorations
* Possibilité d'utiliser des prédicats comme valeurs limites des limitations par jour ou par combat.
* Possibilité de faire un déplacement automatique avant une attaque
* Possibilité que la peur paralyse.
* Ajout d'une commande !cof-clean-global-state.
* Ajout d'une action pour relacher une cible agrippée.
* Ajout d'une option --succes à !cof-jet
* Possibilité d'utiliser les options de triche avec les --if
* Ajout d'un prédicat pour les armes de l'été.
* Ajout d'un effet armeGlacee.
* Plus d'automatisation pour la perte de substance.
* Fin automatique de la rage du berserk quand un barbare tombe inconscient.
* Ajout d'un prédicat pour l'immnunité aux dégâts magiques.

### Corrections de bugs
* Correction d'un bug avec le lien épique.
* Activation correcte de l'attaque en traître.
* Activation de Ignorer la douleur sur les attaques automatiques.
* Dépense de mana quand on dépasse les limites journalières

## 3.12
### Capacités
* Meilleur support pour le bâton de mage du forgesort.
* Regard pétrifiant du basilic et de la méduse.
* Enkystement lointain.
* Voie de prestige du messager.
* Lycanthropie et Éventration de la Voie de la fusion lycanthropique.

### Autres améliorations
* ImplEmentation d'une RD spécifique contre les souffles de dragons
* Implémentation d'une protection contre les souffles de dragons qui divise les DM en cas d'echec au test de DEX et les annule sinon.
* Implémentation du bâton des runes mortes
* Prise en compte des options image, fx et targetFx pour !cof-lancer-sort.
* Implémentation des tremblements de terre d'Invincible.
* Prédicat "volant" pour éviter certains effets.
* Application du modificateur tempete aux save pour échapper à un effet ou un état.

## 3.11
### Capacités
* Ajout des derniers rangs de la voie du pacte vampirique
* Ajout d'une automatisation pour le déchaînement d'acier du barbare.
* Attaque violente de la campagne Invicible.
* Frappe des arcanes, de la Voie du guerrier-mage.
* Sang puissant (voie du pacte vampirique)
* Blessure sanglante (voie du pacte vampirique)

### Autres améliorations
* Possibilité de tenir certaines armes à une main quand agrandi.
* Prise en charge des armes batardes.
* Prédicat pour la vulnérabilité à des éléments.
* Prise en compte de l'option de jeu sans PR.
* Utilisation d'une section munitions sur la fiche.
* Ajout d'un prédicat bonusAttaqueMagique
* Prédicats pour les armes.
* Tentative pour un meilleur suivi de la lumière en cas de changement de carte.
* Meilleure prise en compte des créatures mortes qui régénèrent
* Nouvelle syntaxe pour les prédicats à valeur complexe.
* Referme les portes qu'on ouvre quand le jeu est en pause.
* Prise en compte des portes fermées.
* Ajout des armes vicieuses.

### Corrections de bugs
* Correction pour les options d'attaque --plus au sein d'un --if.

## 3.10
### Capacités
* Magie de combat de la Voie du guerrier-mage.
* Souffle de mort.
* Souffle de vie de la Voie de Morn
* Sort de secrets de l'au-delà.
* traits des créatures végétatives.
* prédicat pour le trait "Tout petit".
* Grande taille de la Voie des êtres féériques.
* Mur de vent
* Rage de Baphit (Invincible)

### Autres améliorations
* Possibilité de faire des ricochets avec une attaque d'arme de jet
* Possibilité d'affaiblir une caractéristique au hasard.
* Possibilité de mettre et enlever son casque depuis !cof-statut
* Utilisation de l'icone chef pour la capacité laissez-le moi.
* Ajout d'un icone pour l'état enflammé.
* Support des options de tempête de mana pour la conjuration de prédateurs et la conjuration d'armée.
* Permet aux joueurs de lancer l'initiative pour leur perso.

## 3.09
### Capacités
* Drain de force de Dominia (Invincible)

### Autres améliorations
* Prise en compte de l'option --saufAllies pour !cof-tenebres.
* Ajout d'une options pour des DM explosifs.
* Ajout de l'option --bonusContreArmure
* Changement des macros Monter et Descendre en icones.
* Changement de fonctionnement des auras, qui réagissent maintenant au déplacement

## 3.08
### Capacités
* Ajout de la Voie d'Arwendée. Attention sens affûtés ajoute maintenant automatiquement le bonus de DM aux arcs.
* Rang 3 de la Voie du familier fantastique.
* Prise en compte automatique du rang 1 de la Voie des runes.
* Automatisation d'un cas courant d'utilisation de la capacité Acrobaties.
* Ajout des 3 premiers rangs de la Voie du chasseur de corruption.
* Magie en armure et rituel assuré de la Voie du guerrier-mage.
* 3 premiers rangs du maître des poisons

### Corrections de bugs
* Mise à jour de la conjuration d'armée.
* Correction d'un crash avec des persos ayant un alias.

### Autres améliorations
* Utilisation d'un attribut entrerEnCombatAvec pour faire rentrer en combat plusieurs tokens en même temps.
* Amélioration des effets de peur.
* Plus d'affichage des actions de recharge des armes déjà chargées.
* Prise en charge des conditions hostiles et des conditions extrêmes.
* Prise en charge de la perte de substance d'Invincible.
* Prise en charge du poison affaiblissant

## 3.07
### Capacités
* Prédicat immuniteAucCritiques
* Amélioration de l'arme de prédilection
* Voie de l'alchimie (Terres d'Arran)
* Don de soin, de la Voie de Périndé

### Corrections de bugs
* Affichage des saves actifs seulement pour le mook concerné.
* Correction de l'affichage des DM contre les nuées.
* Prise en compte correcte du rayon des ténèbres.
* Protection contre les erreurs dans les murs de l'éclairage dynamique.
* Protection contre l'absence de créateur d'une rune.
* Liberté d'action immunise à la paralysie des goules.
* Correction d'un bug faisant appliquer certains effets 2 fois à la fin des tours.
* Prise en compte des immunités pour les états venant des attaques
* Affichage correct de l'arme en main pour les mooks
* On garde les attributs quand un mook invisible redevient visible
* Plus de message d'erreur quand on attend trop avant de sauvegarder un nouveau personnage.

### Autres améliorations
* Ajout de la gestion des RD aux armes bénies
* Ajout d'un prédicat immunite_destruction
* Possibilité d'utiliser !cof-echange-init sans argument.
* Affichage des messages de la cible quand un allié peut intercepter.
* Prise en compte de l'option --message pour !cof-tenebres
* Le token des ténèbres est laissé sous les autres tokens.
* Affichage d'un message au joueur qui fait le jet quand le MJ doit valider l'affichage.
* Si le statut d'un personnage est affiché pour le MJ, propose de supprimer les effets à durée indéterminée.
* Possibilité d'ajouter des effets spéciaux et du son à un !cof-set-state.
* Passage d'un certain nombres de prédicats concernant des armes dans le champ SPÉCIAL des armes concernées.

## 3.06
### Capacités
* Ajout des capacités de la Voie du drakonide.
* Meilleure prise en charge du coup de bouclier.

### Corrections de bugs
* frenesieMinotaure est bien un effet temporaire.

### Autres améliorations
* Ajout d'un bouton pour libérer un personnage étreint ou enveloppé.
* Possibilité de mettre un titre pour un effet de peur.
* Option pour des effets de disque qui ignorent les murs.
* Possibilité de laisser le MJ montrer le résultat d'un jet ou non.
* Implémentation d'un anneau de protection.
* Fonction de pause du jeu
* Utilisation de la possiblité de bloquer des tokens

## 3.05
### Capacités
* Sort de brumes.
* Support basique pour l'inspiration des Terres d'Arran.
* Esquive de la magie.
* Support basique pour la frénésie du minotaure.
* Armes naturelles du félis.
* Âme féline, du félis.
* Parade croisée de la Voie du combat à deux armes.
* Violence ciblée des demi-ogres.
* Sang-froid des demi-ogres.
* Amélioration de la prise en charge de la marche sylvestre.
* Explosion finale de la voie des créatures élémentaires

### Corrections de bugs
* Fix d'un problème lors du rechargement automatique des armes,
* Prise en compte des limites pour les provocations.
* Quand un familier aux PV liés meurt, son maître aussi.
* On ne peut plus drainer qu'un PV des cibles multiples.
* Correction de bugs sur le radar mental
* Correction d'un bug sur le pacifisme

### Autres améliorations
* Ajout d'un marker pour les chefs de groupe.
* Possibilité de retarder l'affichage de la mort
* Support pour les foudres du temps.
* Possibilité de renouveler les élixirs et les runes en dehors de la page des joueurs.
* Support pour les arcs composites façon Pathfinder.
* Possibilité de save par tour actif pour les effets temporaires.
* Possibilité d'indiquer des temps de recharge pour les effets.
* Option de magie en armure pour les attaques.
* Ajout d'une commande !cof-explosion
* Possibilité de différencier les saves pour les cibles au contact.
* Prise en compte des changements d'attributs d'armure de la version 5.01 de la fiche.

## 3.04
### Capacités
* Implémentation des rangs 1 et 4 de la voie du danseur de guerre
* Ajout de la botte secrète du voleur.
* Support pour le sort de sphère de feu (tiré de Pathfinder)
* Quelques améliorations pour le guetteur, de la Voie des animaux.
* Ajout de la ténacité de la Voie du héro.
* Ajout d'Épée céleste de la Voie de l'archange.
* Ajout de la paralysie des goules.
* Ajout des deux premiers rangs de la voie de l'archange.
* Simulacre de vie
* Ajout d'un visuel pour la prison végétale
* Meilleure automatisation de la capacité intercepter du chevalier.
* Réaction violente du demi-ogre.
* Ajout de la capacité Insignifiant de la voie du gnome.
* Implémentation de l'immunité à tout ce qui n'est pas magique.
* Support du sort d'animation des objets
* Ajout de l'effet fiévreux.
* Jets de dégâts séparés par cible pour la destruction des morts-vivants
* Ajout d'une option de malus de répétition pour la destruction des morts-vivants.
* Ajout du type d'ennemi juré gobelin
* Implémentation de base de la voie de l'expert du combat
* La Rune de Puissance du Forgesort maximise tous les dés mais doit s'utiliser avant le lancer des jets de dégâts
* Implémentation de Contrôle Sanguin (Voie du contrôle corporel, R4)
* Ajout de Meneur d'hommes (Voie du héros (prestige), R4)

### Corrections de bugs
* Correction d'un bug avec corps élémentaire.
* Correction du bonus de compétence appliqué en double en cas de majuscule.
* Correction du coût de pacte sanglant.
* Prise en compte de la liberté d'action pour le mot de pouvoir qui immobilise.
* Pas de DOT sur les personnages déjà morts.
* --demiAuto divise les dégâts par deux en cas d'échec, même si il n'y a pas de jet de sauvegarde.
* ne pas faire entrer en combat quand on fait un effet qui ne fait pas de DM ou qui n'est pas préjudiciable (conséquences sur pacifisme, sanctuaire, et).
* Prise en compte correcte des malus d'armure et de casques pour les compétences sur la fiche.

### Autres améliorations
* Possibilité d'immuniser à un effet temporaire particulier.
* Possibilité de faire des jets d'attaque contre des valeurs de caractéristiques
* Prise en compte d'un prédicat attaqueSournoise pour indiquer le nombre de dés des attaques sournoises.
* Si une arme est aussi une arme de jet, le script va automatiquement sélectionner la bonne attaque selon la distance de la cible.
* Ajout d'une option --saveDM pour éviter tous les dégâts d'une attaque.
* Prise en compte des options de sélections pour !cof-init.
* Option d'attaque --forceMinimum
* Prise en compte de --message pour !cof-animer-mort.
* Ajout d'une option --affaiblirCarac pour les attaques.
* Pour !cof-effet-temporaire, possibilité de prendre en compte la magie en armure.
* Passage de l'aura d'initiative dynamique au layer map, pour éviter les sélections involontaires.
* Ajout d'options pour des sons de réussite et échec critiques d'attaques par défaut.
* Ajout de modificateurs d'attaque +n pour les armes magiques.
* La durée restante des effets est affichée pour le MJ dans le statut des persos.
* !cof-effet-temp ne fait entrer en combat que si au moins une des cibles est effectivement affectée.
* --divisePortee permet de diviser la portée d'une attaque.
* Possibilité d'utiliser --effet etat sans argument de durée.
* Support pour les affaiblissements de caractéristiques
* Ajout d'une condition d'attaque typeCible
* Ajout d'un type de dégâts "énergie", pour des settings science fiction.
* Message plus explicite en cas d'expression de soins incorrecte.
* Modifie l'affichage des boutons de soins si plus disponibles
* Un peu plus de discrétion avec les messages sur les limites par jour ou par combat
* Passage en prédicats d'un grand nombre de capacités qui utilisaient encore des attributs.
* Meilleur support de Laissez-le-moi (Chevalier, Voie du Héros R3)

## 3.03
### Capacités
* Ajouts des capacités épiques d'Anathazerïn

### Corrections de bugs
* Correction de assome en assomme.

### Autres améliorations
* Ajout d'une option d'affichage pour que le MJ puisse prendre le temps de décrire une attaque avant de montrer le résultat aux joueurs.
* Passage de armeParDefaut en prédicat, et prise en compte de ce prédicat au moment de poser un token.

## 3.02
### Capacité
* Ajout des réaction allergiques pour les chiens gobelins
* Possibilité optionelle de lancer plus de soins légers en une journée que le rang dans la voie, en échange d'un coût en mana.

### Corrections de bugs
* Correction d'un crash en cas de #Attaque -1 et pas d'arme en main.
* Correction du prédicat increvable
* Prise en compte du type drain dans les attaques sur la fiche.

### Autres améliorations
* Ajout de la commande d'action !arme-en-main
* Possibilité de restreindre une attaque aux cibles qui ne sont pas au contact.
* Outil de conversion de Pathfinder vers COF
* Ajout d'un test de prédicat pour la cible d'une attaque
* Changement d'interface pour les montures : déplacer le cavalier ne fait plus descendre de monture.
* Options --degainer pour les effets de combat
* Option d'attaque aussiArmeDeJet, pour les armes qui peuvent être utilisées au contact ou lancées.
* Affichage du nombre d'armes de jets sur la fiche, plus besoin de munitions.
* Support de la ceinture de rage améliorée d'Anathazerïn

## 3.01
* Affichage des armes cochées au lieu des armes non cochées, qui doivent pouvoir exister pour garder des attaques avec des armes que le personnage a temporairement perdues.
* Passage d'une partie des attributs numériques qui ne dépendent pas des mooks en prédicats sur la fiche.

## 3.00
* Passage des listes d'actions sur la fiche
* Passage des attributs booléens qui ne dépendent pas des mooks en prédicats sur la fiche
* Ajout d'une fonction !cof-set-predicate pour modifier les prédicats depuis le chat.

## 2.18
### Capacités
* Ajout de la possibilité pour un siphon des âmes d'empêcher les autres siphons.

### Correction de bugs
* Prise en compte correcte des bonus de save contre les sorts.

### Autres amélioration
* Ajout d'un type drain.
* Attribut aucuneActionCombat pour les personnages qui n'agissent pas en combat
* Possibilité de préciser un pourcentage des dégâts transformés en soins avec l'option --vampirise.

## 2.17
### Capacités
* Support des effets des ondes corruptrices
* Support de la potion de sang de l'Arbre-Coeur
* Possibilité de changer la taille jusqu'à laquelle le fauchage est possible.
* Haches et marteaux des nains.
* Support de la capacité Agripper du démon de Noirbois.
* Support de la capacité Grosse tête du forgesort
* Capacité d'objet magique "Action libre"
* Saisir et broyer pour les chaoses.
* Amélioration de la prise en charge d'ombre mouvante.
* Ajout de la capacité Force d'âme du haut elfe.
* Ajout de la capacité Bûcheron
* Ajout des capacités Attaque sanglante et Flèche sanglante.
* Amélioration de la prise en compte des sens affûtés.
* Amélioration de la prise en charge du second souffle du guerrier.
* Ajout de l'effet noyade des plantes carnivores.
* Ajout de la capacité Gober de la Voie du prédateur.
* Meilleure prise en charge de la capacité Dévorer des prédateurs
* Ajout de la capacité Increvable de la Voie de l'humain.
* Ajout de la capacité Briseur d'os du barbare.
* Meilleure automatisation de l'Argument de taille du barbare.
* Châtiment du mâle du Xyrufa.
* Prise en compte de la rage dans la capacité Défier la mort du barbare.
* Prescience (Voie de la divination)
* Cône de froid (doc)
* Gros Monstre, grosse arme (Voie des armes à 2 mains)
* Hors de portée (shaman scorpion)
* Nuée de scorpions (shaman scorpion)
* Animation des Morts (Voie de l'outre-tombe)
* Etreinte (scorpions)
* Hémorragie (Voie du sang)
* Lien de sang (Voie du sang)
* Support complet de la Voie des armes à 2 mains (prestige)
* Support + documentation Voie du Chevalier Dragon (prestige)
* Support complet de la Voie du porteur de bouclier (prestige)

### Autres améliorations
* Ajout de fonctions pour aider en Noirbois.
* Quelques effets pour simuler la limitation Grande taille du minotaure.
* On n'affiche pas les attaques qui ne sont pas possibles (limites épuisées, condition --si non remplie, pas assez de mana).
* Ajout d'une option pour vérifier que les cibles d'une attaque peuvent tenir dans un disque d'un rayon donné.
* Ajout d'une option de limitation du montant des soins par jour.
* Label -2 pour l'arme en main gauche.
* Termine les effets dont on enlève le marker à la main.
* Utilisation des nom de caractéristiques au lieu de pictogrammes douteux pour les jets de caractéristiques et de compétences.
* Gestion des identités secrètes.
* Possibilité de passer des options aux effets à dégâts sur la durée.
* Un personnage invisible ne peut plus être vu des autres joueurs.
* Ajout d'une possibilité de synchronisation des tokens entre cartes.
* Une réussite critique à une feinte double les bonus de DM à l'attaque suivante.
* Ajout d'un attribut pour des modification de tous les tests d'un personnage (bonus ou malus)
* Tirage d'initiative aléatoire secret pour les tokens sur le layer MJ.
* Possibilité de rajouter des attributs à afficher dans le statut.
* Le script ne bloque plus que le déplacement des personnages immobilisés contrôlés par un joueur connecté.
* En cas d'échec critique d'une boule de feu qui cible une cible artificielle, la cible est déplacée aléatoirement de 15 m.
* Refactoring !cof-tenebres pour supporter les options de Mana (y compris Tempête de Mana)
* Séparation des options de blessure grave et de dommages importants

### Corrections de bugs
* Correction de bugs avec l'invisibilité.
* Amélioration de l'Action concertée.
* Correction d'un bug sur les bonus de compétences
* Correction de la prise en compte des familiers dans les aoe.

## 2.16
### Capacités
* Capacité de cyclone des élémentaires.
* Présence glaciale de la Voie du gel
* Charge fantastique du chevalier
* Project de la Voie du colosse.
* Ventre mou de la Voie du tueur de géants.
* Suggestion de la Voie de la séduction du barde
* Gestion du mot de pouvoir qui immobilise.
* Différence entre vitalité surnaturelle qui continue à la mort, comme celle des trolls et celle qui s'arrête à la mort.
* Support de la capacité Enchaînement du barbare.
* Ajout de l'attaque d'étreinte et immolation de certains démons gardiens
* Ajout de la capacité Hausser le ton de la Voie du champion
* Ajout de la capacité Liberté d'action du barde
* Implémentation des effets de Cercle de protection
* Ajout de la capacité Combat kinétique du Psionique
* Support du sort Armure d'eau
* Support de Moment de perfection (moine)
* Support d'Ensevelissement (nécromancien)
* Support d'Armée des Morts (nécromancien)
* Support d'Invocation d'un démon (nécromancien)

### Autres améliorations
* Joli coup permet d'ignorer les bonus de couvert.
* Implémentation de la règle de coups critiques étendus (dans les options, catégorie divers).
* Pas de dépense de mana si une autre contrainte de resource rend une action impossible.
* Prise en compte de l'option --secret pour !cof-bonus-couvert
* Armes avec bonus de DEF
* Possibilité d'afficher un message en cas de coup critique reçu.
* Ajout d'un effet temporaire effetRetarde
* Les aires d'effet en disque ne passent plus les murs.
* Ajout de RD aux éléments.
* Correction sur l'initiative entre PJs qui doivent comparer la sagesse
* Ajout de la possibilité de faire des attaques de d12 qui font des critiques
* Prise en compte des compétences sur la fiche
* Ajout d'une option de sélection alliesEnVue
* Prise en compte des immunités pour les effets temporaires.
* Attribut pour diviser par 2 les effets ou les dm d'un type donné
* Possibilité d'avoir des bonus aux saves contre un type donné.
* Ajout des immunités aux différents états.
* Ajout de la possibilité de sélectionner les tokens en vue d'un personnage.
* Ajout d'une interface de gestion de la bourse.
* Support de la pénombre
* Support pour les personnages invisibles en combat
* Meilleur support de la Prouesse du guerrier
* Meilleur support de la Parade de projectiles du moine
* Meilleur support du Tour de force
* Meilleur support du Pacte Sanglant 
* Permettre à un personnage d'être la Chair à canon de plusieurs autres
* Rework Animation des Morts : meilleur support et automatisation

### Corrections de bugs
* Correction des RD seulement contre perçant ou tranchant ou contondant.
* Compatibilité de --maxDmg avec --reroll1 et --explodeMax
* Crash de statut pour les personnages ayant un capitaine.
* Correction du test d'attaque opposée
* Calcul de score d'attaque corrigé pour les Terres d'Arran.
* Mise à jour de l'initiative quand on rengaine son arme à distance avec la voie du pistolero.
* Donne le droit au joueur qui doit faire une réaction à une attaque de ne pas réagir.
* Les créatures qui enveloppent ou étreignent leur cible la relachent quand elle meurt.
* Le script ne prenait pas en compte la sagesse de l'attaquant contre les créatures immunisées aux armes.
* Quand une créature peut résister avec SAG, INT ou CHA et qu'elle est sans esprit, alors on choisit cette caractéristique (car la réussite est alors automatique). Test un peu plus précoce pour la résistance à la peur.

## 2.15
### Capacités
* Gestion des capacités d'auras.
* Capacité "n'abandonne jamais", des guerriers maudits.
* Réduire la distance de la Voie du tueur de géants.
* Absorption d'énergie (spectre, vampire, sylvanien maudit)
* Projeter (voie du Cogneur rang 3)
* Second ennemi juré (voie du Traqueur rang 4)
* Injonction Mortelle (Magie Maléfique rang 3)

### Autres améliorations
* Ajout du fer froid.
* Reconnaissance des haches, et prise en compte des RD/hache.
* Possibilité d'utiliser directement le nom d'un état lorsqu'on veut appliquer cet état seulement un certain nombre de tours (avec --effet d'une attaque ou avec !cof-effet-temp).
* Il faut que le membre du groupe avec la capacité Sans peur soit sur la même page que l'allié pour lui faire bénéficier du bonus.
* Une attaque avec le label -1 utilise l'arme en main, si il y en a une.
* Prise en compte de l'immunité à l'asphyxie des démons.
* Utilisation des consommables sur la fiche pour les PNJs aussi.
* Si "Jet Secret" est configuré sur une fiche de PNJ, seul le total des jets d'attaques, de dommages, de caractéristiques et de sauvegardes sont affichés, sans les détails. Le MJ reçoit un whisper avec le détail du jet.
* Ajout d'une option pour gérer le Contrecoup de l'option Mana Totale + Coût aléatoire
* Ajout d'une option permettant l'affichage des coûts effectifs en PM au lancement du sort

### Corrections de bugs
* Correction d'un bug avec la forme d'arbre du druide.
* Dur à cuir et enragés ne mourraient pas si tapé plus d'une fois dans le tour.

## 2.14
### Autres améliorations
* Prise en compte de la chance pour les saves.
* Prise en compte de la chance pour les esquives acrobatiques et les absorptions au bouclier
* Utilisation de l'obglet des jets cachés des PNJs par le script
* Réorganisation des menus de règles optionnelles
* Suppression des options de génération d'attaques devenues obsolètes
* Implémentation d'une option pour Brûlure de Magie (COTA, applicable à COF)
* Implémentation d'une option de portée augmentée pour magie puissante (hors Tempête de Mana)
* Implémentation d'une option pour l'affichage des durées des effets
* Implémentation d'une option pour les armures/bouclier "de protection" (COF p. 203)

### Corrections de bugs
* Correction d'un bug sur le tour de force du barbare.
* Correction d'un crash lors de l'utilisation d'un point de chance sur une riposte.
* Correction d'un bug pour les conditions moins (comme moins FOR), quand l'attaquant est un PNJ et le défenseur un PJ.

## 2.13
### Corrections de bugs
* Mise à jour des attributs d'équipement divers

## 2.12
### Capacités
* Faucheuse de géants

### Autres améliorations
* Ajout des résistances permettant de diviser les dégâts d'un type donné.
* Utilisation des consommables sur la fiche pour les PJs (au lieu des attributs dose_ ou consommable_).
* Utilisation du token de la monture pour les personnages montés, dans les calculs de distance.

## 2.11
### Capacités
* Commandant de la voie du chef d'armée.

### Autres améliorations
* Ajout d'une commande pour centrer sa vue du jeu sur un token.
* Déplace la vue du joueur quand il emprunte un escalier.
* Prise en compte des fiches Terres d'Arran
* Possibilité de déplacer un personnage vers une autre carte.

### Corrections de bugs
* Prise en compte de la taille des cellules de la grille des cartes, car elle est utilisée en jeu pour mesurer les distances.

## 2.10
### Capacités
* Chair à canon de la voie du PNJ récurrent
* Nuée de criquets (Druide Prestige)
* Increvable (Rôdeur, Survie rang 4)
* Intervention divine du prêtre

### Autres améliorations
* Support du nouvel éclairage dynamique
* Une série de capacités sont à déclencher par les joueurs avant les jets de dégâts : Absorber un Coup, Absorber un Sort, Encaisser un Coup, Résistance à la Magie, Esquive Acrobatique, Esquive fatale, Parade Magistrale, Rune de Protection

## 2.09
### Capacités
* Vitalité surnaturelle du barbare
* Riposte du guerrier

### Autres améliorations
* Ajout d'une option --plusCrit aux attaques.
* Ajout d'une option --plageEchecCritique aux jets.
* Ajout d'une macro pour suivre un autre personnage
* Possibilité d'utiliser la défense et l'initiative d'un autre personnage.
* Possibilité de lier les PVs.
* Les effets temporaires lancés avec une option de mana disparaissent quand le lanceur meurt.

### Corrections de bugs
* Undo avant de faire le jet d'attaque pour l'esquive acrobatique
* Prise en compte correcte des caractéristiques de PNJs dans les jets.

## 2.08
### Capacités
* Petit veinard du halfelin.
* Mot de mort du nécromancien.
* Support pour l'étreinte des serpents.
* Support pour la capacité forêt vivante du druide.
* Ajout de la capacité botte mortelle du barde.
* Possibilité de spécifier le bonus apporté par une feinte.
* Support pour l'énergie de la mort, utilisée dans la campagne Vengeance.
* Adaptable de la Voie de l'humain
* Résistance à la magie du barbare

### Autres améliorations
* Ajout d'une option diviseDmg
* Ajout des options d'attaque à la liste du tour.
* Prise en compte des options d'attaque sur la fiche
* Utilisation des lignes d'attaques pour les PNJs créés par le script
* Ajout de possibilité de tempête de mana pour !cof-lancer-sort
* Ajout de !cof-set-attribute
* Possibilité d'accumuler les durées d'effets.
* Gestion de --secret pour les !cof-effet
* Ajout de l'option d'attaque --ifSaveFails
* Ajout des options d'avantage et désavantage cumulatives.
* Les armes à poudre font maintenant des DM explosifs par défaut.
* Gestion de l'arme en main gauche.
* Ajout d'un raccourci pour faire afficher toutes les action d'attaque visibles dur la fiche dans n'importe quelle liste d'actions.
* Ajout de la possibilité de mettre des options globales dans les listes d'action.
* Prise en compte des jets, attributs et inputs dans la partie options des lignes d'attaque, quand elles sont utilisées depuis un bouton (comme avec les listes d'action).
* Possibilité de ne pas appliquer l'usure pour un combat (!cof-usure-off)
* Ajout d'un effet retardé pour le cas où on doit compter des nombres de tours
* Ajout du bonus de couvert
* Attaques par défaut dans la liste d'actions, possibilité de se passer complètement des attributs pour les attaques (actif quand la version 3.3 de la fiche sera là.

### Corrections de bugs
* Évaluation plus précoce des conditions, permettant de mieux les prendre en compte
* Utilisation d'une valeur d'attaque plus cohérente pour les PNJ en cas d'attaque magique opposée.
* Prise en compte de la forêt vivante dans les jets sans difficulté explicite.
* Prise en compte correcte de l'armure des PNJ pour la main d'énergie.
* Correction d'un bug qui faisait planter en cas de save dans une attaque
* Correction de l'affichage en cas d'immunité à un type d'attaque
* Prise en compte correcte de l'attribut option_pm par défaut
* Garde le jet d'image décalée en mémoire pour le cas des capacité qui font relancer l'attaque.
* Prise en compte des réflexes félins (Voie du pourfendeur) dans l'initiative

## 2.07
### Autres améliorations
* Correction de l'affichage des armes dans le statut avec les nouvelles fiches
* Correction d'un bug quand il n'y avait aucun token actif dans le tour de combat
* Utilisation des options standard pour le mur de force

## 2.06
### Capacités
* Ajout de la capacité lien épique.

### Autres améliorations
* Amélioration de la gestion de l'attaque en meute des gobelins.
* Possibilité qu'une arme fasse de la lumière quand elle est dégainée.
* Extinction de la lumière quand l'effet d'arme enflammée prend fin
* Ajout d'une option pour modifier la portée d'une attaque.
* Ajout de la résistance à la magie (bonus aux tests pour résister à la magie)
* Intégration d'une table d'échecs critique, avec jets et effets pris en compte.

### Corrections de bugs
* Correction de bug d'affichage du nombre de soins restants.
* Les sortilèges ne sont plus affectés par les RD/tranchant. La destruction des mort-vivants devient un sortilege.
* Correction de bug sur les effets de peur qui ralentissent.

## 2.05
### Capacités
* Possibilité de spécifier une valeur (option --valeur) pour le rayon affaiblissant.
* Ajout de la capacité Peau d'acier du barbare.
* Ajout de la partie soins de la capacité guérison du prêtre.
* Ajout de la capacité Amitié de l'ensorceleur.
* Amélioration de l'automatisation de la capacité Ignorer la douleur du chevalier
* Ajout de la capacité Peau de pierre du magicien
* Enflammer une arme fait maintenant de la lumière.

### Autres améliorations
* Possibilité de spécifier une valeur à --ignoreRD
* Au changement de jour, affichage des effets à durée indéterminée encore actifs pour que le MJ puisse les supprimer si besoin.
* Possibilité d'utilise une table pour les échecs critiques.
* Création automatique d'un personnage cible
* Possibilité de changer l'aura d'initiative
* Application de la règle selon laquelle les dm de base d'une attaque ne peuvent être 0 (pour les gobelins ou personnages avec peu de force).
* Ajout des markers de statut personnalisés
* Amélioration de l'interface des attaques qui n'utilisent pas les champs d'attaque de la fiche
* Prise en compte de l'unité de mesure de la carte pour les distances de vision
* Possibilité de changer des difficultés de sauvegarde en fonction de la mana dépensée en tempête de mana intense.
* Amélioration des affichages de jets
* Standardisation de !cof-lancer-sorts et support dans les consommables

### Corrections de bugs
* Meilleur comportement des tokens de lumières quand on change de carte pour un même personnage.
* Correction d'un bug dans le renouvellement des élixirs qui empêchait de créer de nouveaux élixirs si le forgesort n'a aucun élixir sur lui à la tombée de la nuit.
* Les attaques à distance ne déclanchent plus l'effet aggriper.
* Prévention de crash en cas d'erreur interne de roll20.

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

