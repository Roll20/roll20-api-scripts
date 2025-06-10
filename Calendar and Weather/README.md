# Calendar and Weather Mod

## English

This mod is fully customizable. You can generate a report in chat with the current date, season, weather, and moon phases.

### Configuration

#### Weather Parameters

To change the weather settings, edit the `WeatherConfig` object in the script:

- **Wind strength**: Change the values in `windForce`.
- **Precipitation strength**: Change the values in `precipitationStrength`.
- For each climate (`climates`), you can modify:
  - **Humidity**: `humidity`
  - **Wind direction probability**: `windChances`
  - **Temperature ranges for each season**: `temperature`
  - **Weather probabilities**: `precipitation`

#### Calendar Parameters

To customize the calendar, edit the `CalendarConfig` object:

- **Day names**: Change or add/remove days in `days`.
- **Month names and lengths**: Change or add/remove months in `months`.
- **Season months**: Change which months belong to each season in `seasons` (months are zero-indexed: first month = 0).

#### Moon Parameters

Edit the `MoonConfig` object to change:

- **Moon names**
- **Cycle length**
- **Phase names** (in order)
- You can add or remove moons, following the format.

---

## Français

Ce mod est entièrement personnalisable. Il permet de générer un rapport dans le chat avec la date, la saison, la météo et les phases de la lune.

### Configuration

#### Paramètres de la météo

Pour modifier la météo, éditez l'objet `WeatherConfig` dans le script :

- **Force du vent** : Modifiez les valeurs dans `windForce`.
- **Force des précipitations** : Modifiez les valeurs dans `precipitationStrength`.
- Pour chaque climat (`climates`), vous pouvez modifier :
  - **Humidité** : `humidity`
  - **Probabilité de direction du vent** : `windChances`
  - **Plages de températures par saison** : `temperature`
  - **Probabilités de météo** : `precipitation`

#### Paramètres du calendrier

Pour personnaliser le calendrier, éditez l'objet `CalendarConfig` :

- **Noms des jours** : Modifiez, ajoutez ou retirez des jours dans `days`.
- **Noms et durées des mois** : Modifiez, ajoutez ou retirez des mois dans `months`.
- **Mois des saisons** : Modifiez les mois associés à chaque saison dans `seasons` (les mois commencent à 0).

#### Paramètres de la lune

Modifiez l'objet `MoonConfig` pour changer :

- **Noms des lunes**
- **Durée du cycle**
- **Noms des phases** (dans l'ordre)
- Vous pouvez ajouter ou retirer des lunes en respectant le format.

---

## Command List / Liste des commandes

**EN:** All commands are accessible from the GM menu.

**FR :** Toutes les commandes sont accessibles depuis le menu MJ.

| Commande / Command        | Description (EN)                         | Description (FR)                        |
|---------------------------|------------------------------------------|-----------------------------------------|
| `!weather menu`           | Show the GM main menu                    | Affiche le menu principal MJ            |
| `!weather report`         | Show the full weather report to the GM   | Affiche le rapport météo au MJ          |
| `!weather showplayers`    | Show the weather report to all players   | Affiche la météo à tous les joueurs     |
| `!weather menu-date`      | Show the date settings menu              | Affiche le menu de réglage de la date   |
| `!weather menu-manual`    | Show the manual weather menu             | Affiche le menu météo manuel            |
| `!weather menu-profiles`  | Show the profiles menu                   | Affiche le menu des profils             |
| `!weather next`           | Advance the calendar by one day          | Avance le calendrier d'un jour          |
| `!weather lang en/fr`     | Change the language                      | Change la langue                        |
| `!weather save <name>`    | Save the current weather profile         | Sauvegarde le profil météo actuel       |
| `!weather load <name>`    | Load a saved weather profile             | Charge un profil météo                  |
| `!weather export <name>`  | Export a profile to a handout            | Exporte un profil dans un handout       |
| `!weather import <name>`  | Import a profile from a handout          | Importe un profil depuis un handout     |

**EN:** To import a profile, use only the profile name you chose (for example: `weather1`).  
**Do not** include the `WeatherProfile_` prefix from the handout name.

**FR :** Pour importer un profil, indiquez uniquement le nom du profil que vous avez choisi (par exemple : `meteo1`).  
**N’ajoutez pas** le préfixe `WeatherProfile_` du nom du handout.
