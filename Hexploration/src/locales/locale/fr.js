const TRANSLATION = {
  titles: {
    ready: "L'exploration est prête.",
    settings: "Paramètres d'exploration",
    languages: 'Choisissez une langue',
    pageSettings: 'Paramètres de la page : {page}',
    status: "Statut d'exploration : {page}",
    help: "Commandes d'exploration",
    confirm: 'Veuillez confirmer',
  },
  discovery: {
    title: 'Emplacement découvert',
  },
  menu: {
    draw: 'Dessiner',
    reveal: 'Révéler et masquer',
    locations: 'Emplacements',
    tools: 'Outils',
    layerInUse: 'De nouveaux hexagones sont dessinés sur le {layer}.',
    pageSettingsHelp:
      "Ces paramètres s'appliquent uniquement à cette page. Les paramètres marqués ★ remplacent les paramètres globaux.",
  },
  buttons: {
    fill: 'Remplir',
    fillInverse: 'Remplissage inversé',
    undo: 'Annuler le remplissage',
    reveal: 'Révéler',
    conceal: 'Cacher',
    explore: 'Explorer',
    revealPage: 'Révéler la page',
    resetPage: 'Page de réinitialisation',
    mark: "Marquer l'emplacement",
    unmark: 'Décocher',
    name: 'Nom Hex',
    settings: 'Paramètres',
    pageSettings: 'Paramètres des pages',
    status: 'Statut',
    rescan: 'Nouvelle analyse',
    calibrate: 'Étalonner',
    calibrateReset: "Réinitialiser l'étalonnage",
    help: 'Aide',
    change: 'Changement',
    menu: 'Menu',
    clearOverrides: 'Effacer les remplacements',
    confirmReset: 'Oui, supprimer tous les hexagones',
  },
  prompts: {
    name: 'Nom du lieu (laissez vide pour effacer)',
  },
  values: {
    on: 'Sur',
    off: 'Désactivé',
    none: 'Aucun',
    hexLayer: {
      auto: 'Auto (premier plan si disponible)',
      foreground: 'calque de premier plan',
      objects: 'couche de jetons',
    },
    revealBy: {
      players: 'Jetons de joueur',
      characters: 'Jetons de personnage',
      all: 'Tous les jetons',
    },
    revealMode: {
      clear: 'Clair',
      glimpse: 'Aperçu',
    },
    announce: {
      all: 'Tout le monde',
      gm: 'GM uniquement',
      off: 'Désactivé',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Remplir',
      fillInverse: 'Remplissage inversé',
      conceal: 'Cacher',
    },
  },
  settings: {
    language: {
      label: 'Langue',
      desc: 'Langue des menus, des messages et des documents.',
    },
    hexLayer: {
      label: 'Couche hexagonale',
      desc: 'Où de nouveaux hexagones sont dessinés. Auto essaie la couche de premier plan (au-dessus des jetons) et revient à la couche de jetons si le jeu ne la prend pas en charge.',
    },
    fillColor: {
      label: 'Couleur de remplissage',
      desc: 'Couleur des nouveaux hexagones. Utilisez rgba() pour les hexagones transparents, par exemple rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Couleur de la bordure',
      desc: 'Couleur du contour des nouveaux hexagones.',
    },
    labelColor: {
      label: "Couleur de l'étiquette",
      desc: 'Couleur des étiquettes de nom réservées aux GM sur les hexs nommés.',
    },
    glimpseColor: {
      label: 'Aperçu de la couleur',
      desc: "Les hexagones de couleur changent lorsqu'ils sont aperçus (mode de révélation d'aperçu). Utilisez une couleur rgba() transparente.",
    },
    strokeWidth: {
      label: 'Largeur de la bordure',
      desc: 'Largeur du contour des nouveaux hexs, en pixels (0 à 20).',
    },
    maxDistance: {
      label: 'Distance de révélation hexagonale',
      desc: "Appliqué aux hexagones au fur et à mesure qu'ils sont dessinés : un jeton doit se trouver dans ce nombre d'hexagones pour les révéler, aussi loin qu'il puisse voir. Laissez vide sans limite.",
    },
    revealDistance: {
      label: 'Distance de vue',
      desc: "Combien d'hexagones autour d'un jeton en mouvement sont révélés (0 à 20). 0 révèle uniquement les hexagones traversés par le jeton.",
    },
    lineOfSight: {
      label: 'Ligne de vue',
      desc: "Lorsque cette option est activée, un hexagone n'est révélé que si aucun hexagone couvert ne se trouve entre lui et le jeton.",
    },
    revealPath: {
      label: 'Révéler le long du chemin',
      desc: "Lorsque cette option est activée, chaque hexagone traversé par un jeton lorsqu'il est déplacé (y compris les waypoints) est révélé, pas seulement l'endroit où il s'arrête.",
    },
    revealBy: {
      label: 'Des jetons qui révèlent',
      desc: "Quels jetons sur la couche de jetons révèlent des hexagones : jetons contrôlés par un joueur, jetons qui représentent n'importe quel personnage ou chaque jeton.",
    },
    revealMode: {
      label: 'Mode Révéler',
      desc: "Effacer supprime les hexagones en vue. Un aperçu les rend transparents à la place ; ils sont supprimés lorsqu'un jeton y pénètre.",
    },
    announce: {
      label: 'Annoncer des découvertes',
      desc: "Qui voit le message de discussion lorsqu'un emplacement nommé est découvert.",
    },
    pingDiscoveries: {
      label: 'Découvertes Ping',
      desc: "Lorsque cette option est activée, les joueurs reçoivent un ping vers un emplacement nommé lorsqu'il est découvert.",
    },
    hideCoveredTokens: {
      label: 'Masquer les jetons couverts',
      desc: "Roll20 dessine des noms, des barres et des auras au-dessus des hexagones. Lorsqu'ils sont activés, les jetons situés sous un hexagone couvert ont leur nom visible par le joueur, leurs barres et leurs auras éteints, et réactivés lorsqu'ils sont découverts.",
    },
  },
  status: {
    engine: 'Moteur de jeu',
    grid: 'Grille',
    layer: 'Couche hexagonale',
    hexes: 'Hexagones',
    named: 'Hexs nommés',
    icons: 'Jetons de localisation',
    glimpsed: 'Hexs aperçus',
    pending: "Emplacements en attente d'un remplissage",
    calibrated: 'Calibré',
    overrides: 'Remplacements de page',
    undo: 'Annuler disponible',
  },
  messages: {
    filled:
      'Remplissez terminé. Hexs tirés : {created}. Restylé : {restyled}. Emplacements masqués : {icons}.',
    revealed: 'Hexs révélés : {count}.',
    revealedPage: 'Chaque hexagone de la page révélé ({count}).',
    confirmReset:
      'Supprimer chaque hexagone de "{page}" ({count}) ? Les jetons d\'emplacement reviennent à la couche de jetons. L\'annulation ne peut pas inverser cette situation.',
    resetPage: 'Hexs supprimés de la page : {count}.',
    undone:
      'Dernier remplissage annulé. Hexs supprimés : {removed}. Hexs relookés restaurés : {restored}.',
    named: 'Hexs nommés "{name}" : {count}.',
    unnamed: 'Noms effacés : {count}.',
    marked:
      'Emplacements cachés dans les hexs existants : {attached}. En attente du prochain remplissage qui les couvre : {pending}.',
    unmarked: 'Jetons qui ne sont plus des emplacements : {count}.',
    settingChanged: '{setting} défini sur {value}.',
    rescanned:
      'Nouvelle analyse terminée. Conservé : {kept}. Adopté : {adopted}. Re-déposé : {moved}. Manquant et oublié : {dropped}. Libellés réassociés : {labels}. Jetons de localisation réassociés : {icons}.',
    calibrated:
      'Grille calibrée (pas de colonne {colStep}px, pas de ligne {rowStep}px). Nouvelle analyse : conservé {kept}, reclassé {moved}, adopté {adopted}.',
    calibrationReset:
      'Calibrage supprimé. Nouvelle analyse : conservé {kept}, reclassé {moved}, adopté {adopted}.',
    journalRebuilt: 'Les documents « {help} » et « {deck} » ont été reconstruits.',
    migrated:
      "Vos cartes hexagonales Hexploration 1.x ont été mises à niveau. Si ce jeu a été copié à partir d'un jeu Legacy, lancez une nouvelle analyse sur chaque page de carte hexagonale.",
    pruned:
      "Hexs enregistrés qui n'existent plus et ont été oubliés : {dropped}. Si ce jeu ou cette page a été copié, lancez une nouvelle analyse sur la page pour récupérer ses hexagones.",
    readyHint:
      'Tapez !hexploration pour le menu ou ouvrez le document « Hexploration - Command Deck ».',
  },
  warnings: {
    foregroundUnavailable:
      'Ce jeu ne prend pas en charge le dessin sur la couche de premier plan, les hexagones ont donc été dessinés sur la couche de jetons.',
    someFailed:
      "Hexs qui n'ont pas pu être tirés : {count}. Consultez la console API pour plus de détails.",
  },
  errors: {
    noPage: 'Impossible de trouver la page sur laquelle travailler.',
    notHex: "Cette page n'utilise pas de grille hexadécimale.",
    noPolygons: 'Sélectionnez une ou plusieurs formes dessinées à remplir.',
    emptyArea: "La zone sélectionnée ne contient aucun centre d'hexagone.",
    tooMany: "Cela créerait trop d'hexagones en une seule fois ({count}).",
    nothingToConceal: 'Sélectionnez des formes dessinées ou des jetons à masquer.',
    nothingToReveal: 'Sélectionnez des hexagones, des formes dessinées ou des jetons à révéler.',
    noTokens: "Sélectionnez d'abord un ou plusieurs jetons.",
    noHexes:
      "Sélectionnez d'abord un ou plusieurs hexagones (ou des jetons placés sur des hexagones).",
    nothingToUndo: "Il n'y a aucun remplissage à défaire.",
    unknownCommand: 'Commande inconnue : {command}',
    unknownSetting: 'Paramètre inconnu : {key}',
    unknownPageSetting: 'Paramètres pouvant être définis par page : {keys}',
    invalidValue: '"{value}" n\'est pas une valeur valide pour {key}.',
    calibrateNeedsTokens: 'Sélectionnez un ou deux jetons accrochés aux centres des hexagones.',
    calibrateFailed: 'Ces jetons ne peuvent pas être utilisés pour calibrer.',
    unexpected: "Un problème s'est produit : {message}",
  },
  hints: {
    noPage:
      'Ouvrez la page sur laquelle vous souhaitez travailler ou sélectionnez quelque chose dessus.',
    notHex: 'Définissez la grille de la page sur Hex (V) ou Hex (H) dans Paramètres de page.',
    noPolygons:
      'Dessinez un polygone, un rectangle, une ellipse ou une forme à main levée autour de la zone, sélectionnez-le, puis réessayez.',
    emptyArea: 'Dessinez une forme plus grande ou vérifiez les paramètres de la grille de la page.',
    tooMany: 'Remplissez une zone plus petite ou divisez la zone en plusieurs formes.',
    noHexes:
      'Les hexagones sont au premier plan ou sur la couche de jetons ; passez à ce calque pour les sélectionner.',
    unknownCommand: 'Tapez !hexploration help pour lister les commandes.',
    unknownSetting: 'Tapez !hexploration set pour voir tous les paramètres.',
    calibrateNeedsTokens:
      "Placez un jeton au centre d'un hexagone et sélectionnez-le. Sélectionnez un deuxième jeton accroché à un hexagone voisin dans la même ligne (Hex V) ou colonne (Hex H) pour corriger également la taille de l'hexagone.",
    calibrateFailed:
      "Deux jetons doivent être dans la même ligne (Hex V) ou dans la même colonne (Hex H), à au moins un hex l'un de l'autre.",
    unexpected: 'Les détails se trouvent dans le journal de la console API.',
  },
  help: {
    menu: 'Afficher le menu.',
    fill: 'Couvrez les formes dessinées sélectionnées avec des hexagones.',
    fillInverse: "Couvrez toute la page sauf à l'intérieur des formes sélectionnées.",
    undo: 'Annulez le dernier remplissage, inversez le remplissage ou masquez-le et restaurez les formes utilisées.',
    reveal:
      'Révélez les hexagones sélectionnés et les hexagones sous les formes et les jetons sélectionnés.',
    revealPage: 'Révélez chaque hexagone de la page sans annonce.',
    conceal:
      'Couvrez à nouveau la zone sous les formes et les jetons sélectionnés avec des hexagones.',
    explore: "Révélez autour des jetons sélectionnés comme s'ils venaient de s'y déplacer.",
    resetPage: 'Supprimez tous les hexagones de la page (demande en premier).',
    name: "Nommez les hexagones sélectionnés ou les hexagones sous les jetons sélectionnés. Laissez le nom vide pour l'effacer.",
    mark: 'Transformez les jetons sélectionnés en emplacements cachés.',
    unmark: "Empêchez les jetons sélectionnés d'être des emplacements cachés.",
    set: 'Modifiez un paramètre ou affichez tous les paramètres.',
    pageSet: 'Remplacer un paramètre de révélation sur la page actuelle uniquement.',
    pageClear: 'Supprimez les remplacements de la page actuelle.',
    rescan:
      'Reconstruisez la liste hexadécimale de la page, par exemple après avoir copié une page ou un jeu.',
    calibrate:
      'Alignez la grille hexagonale avec un ou deux jetons sélectionnés accrochés aux centres des hexagones.',
    calibrateReset: 'Supprimez le calibrage de la page actuelle.',
    status: 'Montre ce que Hexploration sait de la page actuelle.',
    journal: "Reconstruisez les documents d'aide et de commande.",
    help: 'Montrez cette liste.',
    handout: 'Les instructions complètes se trouvent dans le document « {name} ».',
  },
  deck: {
    subtitle: 'Pont de commandement',
    drawDesc:
      "Dessinez des formes autour d'une zone, sélectionnez-les, puis remplissez-les. Annuler annule le dernier remplissage.",
    revealDesc:
      "Sélectionnez des hexagones, des formes ou des jetons pour les révéler ou les recouvrir à nouveau. L'exploration révèle les jetons sélectionnés comme s'ils avaient bougé.",
    locationsDesc:
      "Sélectionnez les jetons pour les cacher en tant qu'emplacements sous les hexagones. Sélectionnez des hexagones ou des jetons pour nommer un hexagone.",
    toolsDesc:
      'Paramètres, remplacements de pages, statut, nouvelle numérisation des pages copiées et calibrage de la grille.',
    footer: 'Consultez le document « {help} » pour obtenir des instructions complètes.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Exploration hex par hex pour Roll20',
    footer: 'Utilisez le document "{deck}" pour les contrôles en un clic.',
    overview: {
      heading: 'Aperçu',
      body: "L'hexploration couvre une carte d'hexagones avec des hexagones opaques. Au fur et à mesure que le groupe se déplace, les hexagones qu'il traverse (et, si vous le souhaitez, les hexagones qui l'entourent) sont supprimés, de sorte que la carte est découverte un hexagone à la fois. Les emplacements cachés peuvent être placés sous les hexagones et sont annoncés lorsqu'ils sont trouvés. Il fonctionne dans les jeux Jumpgate et Legacy, sur les grilles Hex (V) et Hex (H) de n'importe quelle taille.",
      demo: 'Regardez une courte démo (à partir de la version 1)',
    },
    quickStart: {
      heading: 'Démarrage rapide',
      steps: [
        'Ouvrez une page dont la grille est définie sur Hex (V) ou Hex (H).',
        'Dessinez une ou plusieurs formes (polygone, rectangle, ellipse ou à main levée) autour de la zone à masquer.',
        'Sélectionnez les formes et cliquez sur Remplir dans le jeu de commandes (ou tapez !hexploration fill). Les formes sont remplacées par des hexagones.',
        "Facultatif : avant de remplir, sélectionnez les jetons pour les lieux importants et cliquez sur Marquer l'emplacement. Ils sont cachés sous les hexagones et annoncés dès leur découverte.",
        "Déplacez un jeton de joueur. Chaque hex qu'il traverse, ainsi que les hexs situés à sa distance de vue, sont révélés.",
      ],
    },
    commands: {
      heading: 'Commandes',
      intro:
        'Seuls les MJ peuvent utiliser ces commandes. La plupart agissent sur les objets sélectionnés ; le reste agit sur la page que vous consultez.',
      colCommand: 'Commande',
      colDesc: 'Ce que ça fait',
    },
    revealing: {
      heading: 'Comment fonctionne la révélation',
      points: [
        'Seuls les jetons sur la couche de jetons révèlent des hexagones. Le nombre de jetons est défini par Tokens That Reveal : les jetons de joueur par défaut, afin que le MJ puisse déplacer les monstres sans découvrir la carte.',
        "Un jeton révèle chaque hex qu'il couvre (les gros jetons en couvrent plusieurs) et, avec Révéler le long du chemin activé, chaque hex de la route qu'il a parcouru, y compris les waypoints.",
        'Sight Distance révèle les hexs autour de chacun de ces hexs. Avec la Ligne de Vue activée, un hex n’est révélé que si aucun hex couvert ne se trouve entre les deux.',
        "La distance de révélation des hexs est stockée sur les hexs au fur et à mesure qu'ils sont dessinés. Ces hexagones ne sont révélés qu’à partir d’un certain nombre d’hexagones, quelle que soit la distance que peut voir un jeton. Utilisez-le pour les montagnes ou les forêts qui cachent ce qui se trouve derrière elles.",
        "En mode Aperçu, les hexagones visibles deviennent transparents au lieu de disparaître et sont supprimés lorsqu'un jeton y pénètre.",
        "L'API ne signale pas les mouvements effectués par d'autres mods. Les mouvements TokenMod sont récupérés automatiquement ; pour les autres mods, sélectionnez les jetons et cliquez sur Explorer, ou appelez Hexploration.revealAround(token) depuis votre propre mod.",
        "L'API ne signale pas les mouvements effectués par d'autres mods. Les mouvements TokenMod sont récupérés automatiquement ; pour les autres mods, sélectionnez les jetons et cliquez sur Explorer, ou appelez Hexploration.revealAround(token) depuis votre propre mod.",
      ],
    },
    locations: {
      heading: 'Hexs et emplacements nommés',
      points: [
        'Mark Location transforme les jetons sélectionnés en emplacements cachés. Un jeton déjà sous un hexagone est immédiatement caché ; sinon, il est masqué par le prochain remplissage qui le recouvre.',
        'Les jetons avec le marqueur de statut tour blanche sont également traités comme des emplacements lorsque vous remplissez, comme dans la version 1.',
        "Les jetons d'emplacement cachés sont déplacés vers la couche GM. Lorsque leur hexagone est révélé, ils retournent à la couche de jetons avec leur nom affiché et leur découverte est annoncée.",
        "Name Hex donne un nom à un hexagone sans jeton. Le nom est montré au MJ sous forme d'étiquette sur la couche GM et annoncé lorsque l'hex est révélé.",
        "Annoncer les découvertes choisit si tout le monde, uniquement le MJ ou personne ne voit l'annonce. Ping Discoveries déplace également la vue des joueurs vers l’emplacement.",
      ],
    },
    settings: {
      heading: 'Paramètres',
      intro:
        'Modifiez les paramètres avec !hexploration set (ou le bouton Paramètres). La couche hexadécimale, les jetons révélés et la langue peuvent également être définis sur la page des paramètres du mod.',
      colKey: 'Clé',
      colName: 'Paramètre',
      colDesc: 'Description',
      perPage: '(Peut être défini par page.)',
    },
    jumpgate: {
      heading: 'Jumpgate et héritage',
      points: [
        "Hexploration détermine quel moteur le jeu utilise et dessine le type de forme correspondant. Les formes dessinées dans l'un ou l'autre éditeur peuvent être remplies.",
        "Avec Hex Layer réglé sur Auto, les hexagones sont dessinés sur la couche de premier plan, au-dessus des jetons, afin que les joueurs ne puissent pas voir ce qu'il y a en dessous. Si la couche de premier plan n'est pas disponible, la couche de jetons est utilisée à la place.",
        "Jumpgate dessine des hexagones mathématiquement réguliers, qui ont une forme légèrement différente des hexagones Legacy. Si les hexagones ne s’alignent pas avec la grille d’une page, placez un jeton au centre d’un hexagone, sélectionnez-le et cliquez sur Calibrer. Sélectionnez deux jetons dans des hexagones voisins de la même ligne (Hex V) ou colonne (Hex H) pour corriger également la taille de l'hexagone.",
        "Lorsqu'une page ou un jeu est copié, ses hexagones obtiennent de nouveaux identifiants. Exécutez une nouvelle analyse sur la page pour les récupérer, ainsi que leurs étiquettes de nom et leurs jetons de localisation.",
      ],
    },
    upgrading: {
      heading: 'Mise à niveau à partir de la version 1',
      points: [
        "La version 2 n'a plus besoin de PathMath, MatrixMath, Vector Math ou HTML Builder. Vous pouvez les supprimer à moins qu'un autre mod ne les utilise.",
        'Les cartes hexagonales, les noms, les jetons de localisation et les paramètres existants sont automatiquement mis à niveau au premier démarrage.',
        'Les commandes de la version 1, dont la macro Hexploration_menu, fonctionnent toujours.',
        "La version 1 permettait à n'importe quel jeton représentant un personnage de révéler des hexagones. Définissez les jetons qui révèlent des jetons de personnage pour conserver ce comportement.",
      ],
      colV1: 'Commande version 1',
      colV2: 'Commande version 2',
    },
    troubleshooting: {
      heading: 'Dépannage',
      points: [
        "Rien ne se passe lorsqu'un jeton bouge : vérifiez que le jeton est sur la couche de jetons et correspond aux jetons qui révèlent, et que la page a des hexagones (!hétat d'exploration).",
        'Les hexs sont décalés par rapport à la grille : utilisez Calibrer, puis vérifiez avec un jeton sur quelques hexs de la carte.',
        "Les hexagones ont cessé de s'afficher après la copie d'une page ou d'un jeu : lancez une nouvelle analyse de la page.",
        "Fill indique que la zone n'a pas de centre d'hexagone : la forme doit contenir le centre d'au moins un hexagone.",
        "Pour toute autre chose, consultez le journal de la console API et incluez ses messages lorsque vous demandez de l'aide.",
      ],
    },
    languages: {
      heading: 'Langues',
      body: 'Choisissez une langue avec !hexploration set language. Langues disponibles :',
    },
    credits: {
      heading: 'Crédits',
      original: 'Mod original par',
      maintainer: 'Version 2 maintenue par',
      marketplace: "Les packs artistiques d'Ada sur le Marketplace Roll20",
      support:
        'Si vous trouvez un bug ou avez une idée, publiez-le sur le forum Roll20 Mod ou ouvrez un problème sur GitHub et incluez tous les messages du journal de la console API.',
    },
  },
};

export default TRANSLATION;
