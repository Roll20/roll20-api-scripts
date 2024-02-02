# COGCrew 

_Un script MOD Roll20 pour la fiche de personnage Chroniques Oubliées Galactiques_

## Usage

Ce script permet de mettre à jour automatiquement les bonus d'équipage sur une fiche de vaisseau spatial ou de mécha.

Pour que ce script fonctionne, vous devez configurer votre campagne COG comme suit :
- Les noms des personnages dans les champs des postes d'équipage doivent correspondre exactement aux noms sur les fiches de personnages
- Sur la fiche du vaisseau ou du mecha, dans l'onglet _**Configuration**_, vous devez cocher la case <kbd>Utiliser COGCrew</kbd>

QUand la fiche de vaisseau ou de mecha est ouverte, le script ira chercher les valeurs des caractéristiques des membres d'équipage sur les fiches de personnage.
Pour rappel :
- Pour le pilote, le script va chercher sa valeur de **DEX** ainsi que le rang dans la voie nommée _Pilotage_
- Pour les canonniers, le script va chercher leurs valeurs de **DEX** ainsi que leur rang dans la voie nommée _Armes lourdes_
- Pour l'ingénieur, le script va chercher sa valeur d'**INT** ainsi que son rang dans la voie nommée _Moteurs_
- Pour les opérateurs ordinateur (ORD) et senseurs (SEN), le script va chercher sa valeur d'**INT** ainsi que son rang dans la voie nommée _Electronique_


### Current version : 1.00

## Change Log

### 2023-07-16 - Version 1.00

- First version
