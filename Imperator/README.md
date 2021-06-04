Imperator
=========

Un script permettant de comptabiliser correctement le nombre de réussites sur un jet de compétences pour le JdR Imperator.

Ce script doit être utilisé avec la fiche Roll20 Imperator qui contient tous les appels au script déjà programmés. Le script utilise lui-même un rolltemplate défini dans la fiche de personnage, il ne pourrait donc fonctionner sans.

Instructions
============
Si vous souhaitez utiliser le script à partir du chat, saisissez

`!dImperator>{difficulte}_{comp}-{compV}_{carac}-{caracV}_{modifDes}_{malus}`

* `difficulte` : difficulté du jet.
* `comp` : nom de la compétence.
* `compV` : valeur de la compétence.
* `carac` : nom de la caractéristique.
* `caracV` : valeur de la caractéristique.
* `modifDes` : modificateur au nombre de dés.
* `malus` : malus au nombre de dés (valeur positive).

Par exemple, pour un jet de *Pugilat* à 2, avec 3 en *Corpus*, avec un malus de 1 lié à une blessure légère, de difficulté moyenne (5) :

`!dImperator>5_Pugilat-2_Corpus-3_0_1`

Aide en jeu
===========

Pour afficher cette même aide en jeu, saisissez `!imperator --help`.

Attention
=========

Les noms de compétence et caractéristique ne doivent contenir ni trait d'union (`-`), ni tiret bas (`_`). Le secript utilise ces caractères pour séparer les valeurs entre elles. Les espaces en revanche peuvent être utilisés.