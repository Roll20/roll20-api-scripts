const TRANSLATION = {
  titles: {
    ready: 'Hexploration est prêt.',
    settings: "Paramètres d'Hexploration",
    languages: 'Choisissez une langue',
    pageSettings: 'Paramètres de la page : {page}',
    status: "État d'Hexploration : {page}",
    help: "Commandes d'Hexploration",
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
    resetPage: 'Réinitialiser la page',
    mark: "Marquer l'emplacement",
    unmark: 'Démarquer',
    name: "Nommer l'hexagone",
    settings: 'Paramètres',
    pageSettings: 'Paramètres de la page',
    status: 'Statut',
    rescan: 'Nouvelle analyse',
    calibrate: 'Calibrer',
    calibrateReset: 'Réinitialiser le calibrage',
    help: 'Aide',
    change: 'Modifier',
    menu: 'Menu',
    clearOverrides: 'Effacer les remplacements',
    confirmReset: 'Oui, supprimer tous les hexagones',
  },
  prompts: {
    name: 'Nom du lieu (laissez vide pour effacer)',
  },
  values: {
    on: 'Activé',
    off: 'Désactivé',
    none: 'Aucun',
    hexLayer: {
      auto: 'Auto (premier plan si disponible)',
      foreground: 'calque de premier plan',
      objects: 'calque des jetons',
    },
    revealBy: {
      players: 'Jetons de joueur',
      characters: 'Jetons de personnage',
      all: 'Tous les jetons',
    },
    revealMode: {
      clear: 'Effacer',
      glimpse: 'Aperçu',
    },
    announce: {
      all: 'Tout le monde',
      gm: 'MJ uniquement',
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
      label: 'Calque des hexagones',
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
      desc: 'Couleur des étiquettes de nom réservées au MJ sur les hexagones nommés.',
    },
    glimpseColor: {
      label: "Couleur d'aperçu",
      desc: 'Couleur que prennent les hexagones aperçus (mode de révélation Aperçu). Utilisez une couleur rgba() transparente.',
    },
    strokeWidth: {
      label: 'Largeur de la bordure',
      desc: 'Largeur du contour des nouveaux hexagones, en pixels (0 à 20).',
    },
    maxDistance: {
      label: 'Distance de révélation des hexagones',
      desc: "Enregistrée sur les hexagones au moment où ils sont remplis, donc réglez-la avant de remplir : la modifier ensuite n'affecte pas les hexagones déjà présents sur la carte. Un jeton doit se trouver à ce nombre d'hexagones au plus pour les révéler, aussi loin qu'il puisse voir ; avec 0, ils ne sont révélés qu'en y entrant. Utilisez-la pour des montagnes ou des forêts. Laissez vide pour ne fixer aucune limite.",
    },
    revealDistance: {
      label: 'Distance de vue',
      desc: "Combien d'hexagones autour d'un jeton en mouvement sont révélés (0 à 20). 0 révèle uniquement les hexagones traversés par le jeton.",
    },
    lineOfSight: {
      label: 'Ligne de vue',
      desc: "Lorsque cette option est activée, les hexagones qui restent couverts, comme des montagnes remplies avec une Distance de révélation des hexagones, cachent les hexagones situés derrière eux. Elle n'a d'effet qu'avec une Distance de vue de 2 ou plus.",
    },
    revealPath: {
      label: 'Révéler le long du chemin',
      desc: "Lorsque cette option est activée, chaque hexagone traversé par un jeton lorsqu'il est déplacé (y compris les points de passage) est révélé, pas seulement l'endroit où il s'arrête.",
    },
    revealBy: {
      label: 'Jetons révélateurs',
      desc: "Quels jetons sur la couche de jetons révèlent des hexagones : jetons contrôlés par un joueur, jetons qui représentent n'importe quel personnage ou chaque jeton.",
    },
    revealMode: {
      label: 'Mode de révélation',
      desc: "Effacer supprime les hexagones à portée de vue. Aperçu les rend plutôt transparents ; ils sont supprimés lorsqu'un jeton y entre.",
    },
    announce: {
      label: 'Annoncer les découvertes',
      desc: "Qui voit le message de discussion lorsqu'un emplacement nommé est découvert.",
    },
    pingDiscoveries: {
      label: 'Pinger les découvertes',
      desc: "Lorsque cette option est activée, les joueurs reçoivent un ping vers un emplacement nommé lorsqu'il est découvert.",
    },
    hideCoveredTokens: {
      label: 'Masquer les jetons couverts',
      desc: "Roll20 dessine des noms, des barres et des auras au-dessus des hexagones. Lorsque cette option est activée, les jetons situés sous un hexagone couvert ont leur nom visible par les joueurs, leurs barres et leurs auras désactivés, puis réactivés lorsqu'ils sont découverts.",
    },
  },
  status: {
    engine: 'Moteur de jeu',
    grid: 'Grille',
    layer: 'Calque des hexagones',
    hexes: 'Hexagones',
    named: 'Hexagones nommés',
    icons: "Jetons d'emplacement",
    glimpsed: 'Hexagones aperçus',
    pending: 'Emplacements en attente de remplissage',
    calibrated: 'Calibré',
    overrides: 'Remplacements de page',
    undo: 'Annulation disponible',
  },
  messages: {
    filled:
      'Remplissage terminé. Hexagones dessinés : {created}. Restylés : {restyled}. Emplacements cachés : {icons}.',
    revealed: 'Hexagones révélés : {count}.',
    revealedPage: 'Chaque hexagone de la page révélé ({count}).',
    confirmReset:
      'Supprimer chaque hexagone de "{page}" ({count}) ? Les jetons d\'emplacement reviennent sur le calque des jetons. Annuler le remplissage ne pourra pas revenir sur cette action.',
    resetPage: 'Hexagones supprimés de la page : {count}.',
    undone:
      'Dernier remplissage annulé. Hexagones supprimés : {removed}. Hexagones restylés restaurés : {restored}.',
    named: 'Hexagones nommés "{name}" : {count}.',
    unnamed: 'Noms effacés : {count}.',
    marked:
      'Emplacements cachés dans les hexagones existants : {attached}. En attente du prochain remplissage qui les couvre : {pending}.',
    unmarked: 'Jetons qui ne sont plus des emplacements : {count}.',
    settingChanged: '{setting} défini sur {value}.',
    rescanned:
      "Nouvelle analyse terminée. Conservés : {kept}. Adoptés : {adopted}. Reclassés : {moved}. Manquants et oubliés : {dropped}. Libellés réassociés : {labels}. Jetons d'emplacement réassociés : {icons}.",
    calibrated:
      'Grille calibrée (pas de colonne {colStep}px, pas de ligne {rowStep}px). Nouvelle analyse : conservé {kept}, reclassé {moved}, adopté {adopted}.',
    calibrationReset:
      'Calibrage supprimé. Nouvelle analyse : conservé {kept}, reclassé {moved}, adopté {adopted}.',
    journalRebuilt: 'Les documents « {help} » et « {deck} » ont été reconstruits.',
    migrated:
      "Vos cartes hexagonales Hexploration 1.x ont été mises à niveau. Si ce jeu a été copié à partir d'un jeu Legacy, lancez une nouvelle analyse sur chaque page de carte hexagonale.",
    pruned:
      "Hexagones enregistrés qui n'existent plus et ont été oubliés : {dropped}. Si ce jeu ou cette page a été copié, lancez une nouvelle analyse sur la page pour récupérer ses hexagones.",
    readyHint:
      'Tapez !hexploration pour afficher le menu, ou ouvrez le document "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Ce jeu ne prend pas en charge le dessin sur la couche de premier plan, les hexagones ont donc été dessinés sur la couche de jetons.',
    someFailed:
      "Hexagones qui n'ont pas pu être dessinés : {count}. Consultez la console API pour plus de détails.",
  },
  errors: {
    noPage: 'Impossible de trouver la page sur laquelle travailler.',
    notHex: "Cette page n'utilise pas de grille hexagonale.",
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
      "Les deux jetons doivent être dans la même ligne (Hex V) ou dans la même colonne (Hex H), à au moins un hexagone l'un de l'autre.",
    unexpected: 'Les détails se trouvent dans le journal de la console API.',
  },
  help: {
    menu: 'Afficher le menu.',
    fill: 'Couvrez les formes dessinées sélectionnées avec des hexagones.',
    fillInverse: "Couvrez toute la page sauf à l'intérieur des formes sélectionnées.",
    undo: "Annulez le dernier remplissage, remplissage inversé ou masquage, et restaurez les formes qu'il a utilisées.",
    reveal:
      'Révélez les hexagones sélectionnés et les hexagones sous les formes et les jetons sélectionnés.',
    revealPage: 'Révélez chaque hexagone de la page sans annonce.',
    conceal:
      'Couvrez à nouveau la zone sous les formes et les jetons sélectionnés avec des hexagones.',
    explore: "Révélez autour des jetons sélectionnés comme s'ils venaient de s'y déplacer.",
    resetPage: 'Supprimez tous les hexagones de la page (avec confirmation).',
    name: "Nommez les hexagones sélectionnés ou les hexagones sous les jetons sélectionnés. Laissez le nom vide pour l'effacer.",
    mark: 'Transformez les jetons sélectionnés en emplacements cachés.',
    unmark: "Empêchez les jetons sélectionnés d'être des emplacements cachés.",
    set: 'Modifiez un paramètre ou affichez tous les paramètres.',
    pageSet: 'Remplacer un paramètre de révélation sur la page actuelle uniquement.',
    pageClear: 'Supprimez les remplacements de la page actuelle.',
    rescan:
      'Reconstruisez la liste des hexagones de la page, par exemple après avoir copié une page ou un jeu.',
    calibrate:
      'Alignez la grille hexagonale avec un ou deux jetons sélectionnés accrochés aux centres des hexagones.',
    calibrateReset: 'Supprimez le calibrage de la page actuelle.',
    status: 'Montre ce que Hexploration sait de la page actuelle.',
    journal: 'Reconstruisez les documents Help et Command Deck.',
    help: 'Montrez cette liste.',
    handout: 'Les instructions complètes se trouvent dans le document « {name} ».',
  },
  deck: {
    drawDesc:
      "Dessinez des formes autour d'une zone, sélectionnez-les, puis remplissez. Annuler le remplissage annule le dernier remplissage.",
    revealDesc:
      "Sélectionnez des hexagones, des formes ou des jetons pour les révéler ou les recouvrir. Explorer révèle les alentours des jetons sélectionnés comme s'ils venaient de s'y déplacer.",
    locationsDesc:
      "Sélectionnez les jetons pour les cacher en tant qu'emplacements sous les hexagones. Sélectionnez des hexagones ou des jetons pour nommer un hexagone.",
    toolsDesc:
      'Paramètres, remplacements de page, statut, nouvelle analyse des pages copiées et calibrage de la grille.',
    footer: 'Consultez le document « {help} » pour obtenir des instructions complètes.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Exploration hexagone par hexagone pour Roll20',
    footer: 'Utilisez le document "{deck}" pour les contrôles en un clic.',
    overview: {
      heading: "Vue d'ensemble",
      body: "Hexploration recouvre une carte hexagonale d'hexagones opaques. Au fur et à mesure que le groupe se déplace, les hexagones qu'il traverse (et, si vous le souhaitez, les hexagones qui l'entourent) sont supprimés, de sorte que la carte est découverte un hexagone à la fois. Les emplacements cachés peuvent être placés sous les hexagones et sont annoncés lorsqu'ils sont trouvés. Il fonctionne dans les jeux Jumpgate et Legacy, sur les grilles Hex (V) et Hex (H) de n'importe quelle taille.",
      demo: 'Regardez une courte démo (à partir de la version 1)',
    },
    quickStart: {
      heading: 'Démarrage rapide',
      steps: [
        'Ouvrez une page dont la grille est définie sur Hex (V) ou Hex (H).',
        'Dessinez une ou plusieurs formes (polygone, rectangle, ellipse ou à main levée) autour de la zone à masquer.',
        'Sélectionnez les formes et cliquez sur Remplir dans le Command Deck (ou tapez !hexploration fill). Les formes sont remplacées par des hexagones.',
        "Facultatif : avant de remplir, sélectionnez les jetons pour les lieux importants et cliquez sur Marquer l'emplacement. Ils sont cachés sous les hexagones et annoncés dès leur découverte.",
        "Déplacez un jeton de joueur. Chaque hexagone qu'il traverse, ainsi que les hexagones situés dans sa Distance de vue, sont révélés.",
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
        'Seuls les jetons sur le calque des jetons révèlent des hexagones. Les jetons concernés sont définis par Jetons révélateurs : les jetons de joueur par défaut, afin que le MJ puisse déplacer des monstres sans découvrir la carte.',
        "Un jeton révèle chaque hexagone qu'il couvre (les gros jetons en couvrent plusieurs) et, avec Révéler le long du chemin activé, chaque hexagone du trajet le long duquel il a été déplacé, y compris les points de passage.",
        "La Distance de vue révèle les hexagones autour de chacun de ces hexagones, en commençant par les plus proches. Avec Ligne de vue activée, un hexagone n'est pas révélé tant qu'un hexagone couvert se trouve entre lui et le jeton. Les hexagones les plus proches sont généralement révélés en premier, donc en terrain dégagé la Ligne de vue ne change rien : elle ne compte qu'avec une Distance de vue de 2 ou plus et des hexagones qui restent couverts, comme un terrain rempli avec une Distance de révélation des hexagones.",
        "La Distance de révélation des hexagones est enregistrée sur chaque hexagone au moment où il est rempli, donc réglez-la avant de remplir ; la modifier ensuite n'affecte pas les hexagones déjà présents sur la carte. Un jeton doit se trouver à ce nombre d'hexagones au plus pour les révéler, aussi loin qu'il puisse voir, et avec 0 ils ne sont révélés qu'en y entrant. Pour une chaîne de montagnes : réglez la Distance de révélation des hexagones sur 0, remplissez les montagnes, remettez-la sans limite, puis remplissez les terres au-delà. Avec une Distance de vue de 3 et la Ligne de vue activée, le groupe voit le terrain dégagé autour de lui, mais pas les montagnes ni ce qui se trouve derrière. Chaque hexagone de montagne est révélé lorsqu'un jeton y pénètre.",
        "En mode Aperçu, les hexagones visibles deviennent transparents au lieu de disparaître et sont supprimés lorsqu'un jeton y pénètre. Les hexagones aperçus ne bloquent pas la Ligne de vue.",
        "Roll20 dessine les noms, les barres et les auras des jetons au-dessus des hexagones. Avec Masquer les jetons couverts activé, un jeton sous un hexagone couvert voit son nom, ses barres et ses auras visibles par les joueurs désactivés jusqu'à ce qu'il soit découvert, afin que les monstres cachés ne se trahissent pas. Si vous en réactivez un pendant que le jeton est couvert, il reste masqué et sera activé lorsque le jeton sera découvert.",
        "L'API ne signale pas les mouvements effectués par d'autres mods. Les mouvements TokenMod sont récupérés automatiquement ; pour les autres mods, sélectionnez les jetons et cliquez sur Explorer, ou appelez Hexploration.revealAround(token) depuis votre propre mod.",
      ],
    },
    locations: {
      heading: 'Hexagones nommés et emplacements',
      points: [
        "Marquer l'emplacement transforme les jetons sélectionnés en emplacements cachés. Un jeton déjà sous un hexagone est caché immédiatement ; sinon, il est caché par le prochain remplissage qui le recouvre.",
        'Les jetons avec le marqueur de statut tour blanche sont également traités comme des emplacements lorsque vous remplissez, comme dans la version 1.',
        "Les jetons d'emplacement cachés sont déplacés vers le calque MJ. Lorsque leur hexagone est révélé, ils retournent sur le calque des jetons avec leur nom affiché et leur découverte est annoncée.",
        "Nommer l'hexagone donne un nom à un hexagone sans jeton. Le nom est montré au MJ sous forme d'étiquette sur le calque MJ et annoncé lorsque l'hexagone est révélé. Jumpgate dessine le calque MJ sous le calque de premier plan, donc dans Jumpgate les étiquettes ne sont visibles que si Calque des hexagones est réglé sur le calque des jetons.",
        "Annoncer les découvertes détermine si tout le monde, seulement le MJ ou personne ne voit l'annonce. Pinger les découvertes déplace aussi la vue des joueurs vers l'emplacement.",
      ],
    },
    settings: {
      heading: 'Paramètres',
      intro:
        'Modifiez les paramètres avec !hexploration set (ou le bouton Paramètres). Calque des hexagones, Jetons révélateurs et Langue peuvent aussi être définis sur la page de paramètres du mod.',
      colKey: 'Clé',
      colName: 'Paramètre',
      colDesc: 'Description',
      perPage: '(Peut être défini par page.)',
    },
    jumpgate: {
      heading: 'Jumpgate et Legacy',
      points: [
        "Hexploration détermine quel moteur le jeu utilise et dessine le type de forme correspondant. Les formes dessinées dans l'un ou l'autre éditeur peuvent être remplies.",
        "Avec Calque des hexagones réglé sur Auto, les hexagones sont dessinés sur le calque de premier plan, au-dessus des jetons, afin que les joueurs ne puissent pas voir ce qu'il y a en dessous. Si le calque de premier plan n'est pas disponible, le calque des jetons est utilisé à la place.",
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
        'La version 1 permettait à tout jeton représentant un personnage de révéler des hexagones. Réglez Jetons révélateurs sur Jetons de personnage pour conserver ce comportement.',
      ],
      colV1: 'Commande version 1',
      colV2: 'Commande version 2',
    },
    troubleshooting: {
      heading: 'Dépannage',
      points: [
        'Rien ne se passe quand un jeton se déplace : vérifiez que le jeton est sur le calque des jetons et correspond à Jetons révélateurs, et que la page contient des hexagones (!hexploration status).',
        'Les hexagones sont décalés par rapport à la grille : utilisez Calibrer, puis vérifiez avec un jeton sur quelques hexagones répartis sur la carte.',
        "Les hexagones ne sont plus révélés après la copie d'une page ou d'un jeu : lancez une nouvelle analyse de la page.",
        "Remplir indique que la zone ne contient aucun centre d'hexagone : la forme doit contenir le centre d'au moins un hexagone.",
        "Pour toute autre chose, consultez le journal de la console API et incluez ses messages lorsque vous demandez de l'aide.",
      ],
    },
    languages: {
      heading: 'Langues',
      body: 'Choisissez une langue avec !hexploration set language. Langues disponibles :',
      colLanguage: 'Langue',
      colNative: "Nom d'origine",
      colCode: 'Code',
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
