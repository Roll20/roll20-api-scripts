const TRANSLATION = {
  titles: {
    ready: 'La concentration est prête.',
    menu: 'Paramètres de concentration',
    help: 'Commandes de concentration',
    status: 'Qui se concentre',
    advantage: 'Avantage sur les économies de concentration',
    reset: 'Réinitialiser la concentration',
    concentration: 'Concentration',
    save: 'Économie de concentration',
    check: 'Vérification des concentrations',
  },
  messages: {
    migrated:
      "Mis à jour à partir de la version 1.0. Vos paramètres et votre liste d'avantages ont été conservés et vos anciennes macros fonctionnent toujours.",
    reconciled:
      'Rattrapé par la carte : jetons de concentration trouvés {added}, anciennes entrées supprimées {dropped}.',
    readyHint: 'Tapez {command} pour les paramètres ou ouvrez le document Command Deck.',
    settingChanged: '{setting} est désormais {value}.',
    confirmReset:
      'Remettre chaque paramètre à sa valeur par défaut et effacer la liste des avantages ? Les marqueurs de concentration restent sur la carte.',
    reset: 'Paramètres remis à leurs valeurs par défaut.',
    journal: 'Documents reconstruits : {help} et {deck}.',
  },
  notices: {
    started: '{name} se concentre désormais sur {spell}.',
    startedNoSpell: '{name} se concentre maintenant.',
    switched: '{name} cesse de se concentrer sur {old} et se concentre désormais sur {spell}.',
    switchedNoSpell: '{name} se concentre maintenant.',
    ended: '{name} ne se concentre plus sur {spell}.',
    endedNoSpell: '{name} ne se concentre plus.',
    lost: '{name} perd sa concentration sur {spell}.',
    lostNoSpell: '{name} perd sa concentration.',
    kept: '{name} continue de se concentrer sur {spell}.',
    keptNoSpell: '{name} continue de se concentrer.',
    zeroHp: '{name} tombe à 0 point de vie et perd sa concentration sur {spell}.',
    zeroHpNoSpell: '{name} tombe à 0 point de vie et perd sa concentration.',
    checkNeeded:
      '{name} doit réussir un jet de sauvegarde de Constitution pour continuer à se concentrer : {dc}.',
  },
  save: {
    dc: 'CC',
    dcValue: 'DC {dc}',
    modifier: 'Modificateur',
    roll: 'Rouler',
    advantageRoll: '{first} et {second} (avantage)',
    success: 'Succès',
    failure: 'Échec',
  },
  menu: {
    concentratingCount: 'Je me concentre maintenant : {count}',
    settings: 'Paramètres',
    footer:
      'Tapez {command} pour revenir ici. Chaque bouton se trouve également dans le document « {deck} ».',
  },
  status: {
    none: "Personne n'est concentré.",
  },
  advantage: {
    intro:
      "Les personnages réglés sur On lancent leurs sauvegardes de concentration avec avantage, comme avec le don War Caster. Cela s'applique aux sauvegardes automatiques.",
    none: "Il n'y a aucun personnage dans ce jeu.",
  },
  buttons: {
    roll: 'Rouler',
    advantage: 'Avantage',
    status: 'Statut',
    advantageMenu: 'Menu Avantage',
    help: 'Aide',
    reset: 'Réinitialiser',
    confirmReset: 'Réinitialiser les paramètres',
    end: 'Fin',
    menu: 'Menu',
    concentrate: 'Concentrez-vous sur…',
    toggle: 'Basculer',
    journal: 'Reconstruire les documents',
  },
  prompts: {
    spell: 'Épeler',
  },
  values: {
    on: 'Sur',
    off: 'Désactivé',
    bar: 'Barre {bar}',
    unnamed: 'Anonyme',
    sendTo: {
      everyone: 'Tout le monde',
      character: 'Personnage',
      gm: 'Directeur général',
    },
    supportMode: {
      basic: 'Basique',
      detailed: 'Détaillé',
    },
  },
  settings: {
    language: {
      label: 'Langue',
      desc: 'La langue des messages de discussion et des documents.',
    },
    command: {
      label: 'Commande',
      desc: 'La commande de chat, sans le "!". Les macros de la version 1.0 utilisent la concentration.',
    },
    statusmarker: {
      label: "Marqueur d'état",
      desc: 'Le marqueur symbolique qui montre la concentration. Des marqueurs de jetons personnalisés peuvent être utilisés.',
    },
    bar: {
      label: 'Barre HP',
      desc: 'La barre de jetons qui contient les points de vie. Les dégâts qui lui sont causés nécessitent une sauvegarde de concentration.',
    },
    send_reminder_to: {
      label: 'Envoyer un rappel à',
      desc: 'Qui voit les messages de concentration et sauvegarde : tout le monde, le MJ ou les joueurs du personnage (le MJ en obtient une copie).',
    },
    auto_add_concentration_marker: {
      label: 'Ajout automatique de con. Marqueur',
      desc: "Ajoutez le marqueur lorsqu'un sort de concentration est lancé depuis une feuille.",
      hint: 'Feuilles D&D 5e 2014 (OGL) et 2024.',
    },
    auto_roll_save: {
      label: 'Sauvegarde automatique du rouleau',
      desc: "Lancez la sauvegarde dès qu'un jeton de concentration subit des dégâts. Lorsqu'il est désactivé, le rappel comporte des boutons Roll et Advantage.",
    },
    show_roll_button: {
      label: 'Bouton de rouleau',
      desc: 'Ajoutez les boutons Roll et Advantage au rappel lorsque la fonction Auto Roll Save est désactivée.',
    },
    end_at_zero: {
      label: 'Terminer à 0 HP',
      desc: "Mettez fin à la concentration sans sauvegarde lorsqu'un jeton tombe à 0 point de vie.",
    },
    bonus_attribute: {
      label: 'Attribut bonus',
      desc: "L'attribut de feuille ajouté à la concentration enregistre. constitution_save_mod fonctionne sur les feuilles D&D 5e 2014 et 2024.",
    },
    debug: {
      label: 'Mode débogage',
      desc: "Rédigez des notes sur la détection orthographique et enregistrez-les sur la console API, pour les demandes d'assistance.",
    },
    support_mode: {
      label: "Mode d'assistance",
      desc: "Combien d'écritures en mode débogage : basique (court) ou détaillé.",
    },
  },
  help: {
    menu: 'Sans rien sélectionné (GM) : ouvrez les paramètres. Avec jetons sélectionnés : début ou fin de la concentration.',
    toggle:
      'Commencez à vous concentrer sur un sort avec les jetons sélectionnés. Nommez un sort différent à changer ; exécutez-le à nouveau pour terminer.',
    end: 'Terminez la concentration pour les jetons sélectionnés.',
    status: 'Liste qui se concentre, avec les boutons Fin.',
    config: 'Modifiez un paramètre, par exemple config auto_roll_save|false.',
    advantageMenu:
      'Choisissez quels personnages lancent des sauvegardes de concentration avec avantage.',
    toggleAdvantage: "Activez ou désactivez l'avantage pour un personnage.",
    roll: 'Lancez une sauvegarde à partir du bouton Roll ou Advantage d’un rappel.',
    journal: "Reconstruisez les documents d'aide et de commande.",
    reset: 'Remettez chaque paramètre à sa valeur par défaut.',
    help: 'Montrez cette liste.',
    footer:
      'Les instructions complètes se trouvent dans le document « {help} » ; les boutons se trouvent dans le document « {deck} ».',
    playerFooter: "Sélectionnez d'abord votre jeton.",
  },
  errors: {
    noSelection: "Sélectionnez d'abord un jeton.",
    notYours: 'Vous ne pouvez modifier la concentration que pour les jetons que vous contrôlez.',
    gmOnly: 'Seul le MJ peut utiliser cette commande.',
    notConcentrating: 'Ce jeton ne se concentre pas.',
    unknownSetting: 'Il n\'existe aucun paramètre appelé "{key}".',
    badSettingValue: '"{value}" n\'est pas une valeur valide pour {key}.',
    rollExpired: 'Ce bouton a expiré.',
    unknownCharacter: "Ce personnage n'existe plus.",
    internal: "Quelque chose s'est mal passé. La console API contient les détails.",
  },
  hints: {
    noSelection: 'Sélectionnez le jeton du lanceur, puis exécutez à nouveau la commande.',
    rollExpired:
      'Les boutons fonctionnent une fois et pendant 10 minutes. Endommagez à nouveau le jeton pour en obtenir un nouveau.',
    unknownSetting: 'Tapez la commande sans rien sélectionné pour voir les paramètres.',
  },
  warnings: {
    unknownMarker:
      'Le marqueur de statut « {marker} » ne fait pas partie des marqueurs de ce jeu. Choisissez-en un autre dans les paramètres.',
  },
  deck: {
    subtitle: 'Pont de commandement',
    selected: 'Jetons sélectionnés',
    selectedDesc: 'Sélectionnez d’abord le jeton du lanceur.',
    table: 'Le tableau',
    tableDesc: 'Voyez qui se concentre et qui a l’avantage sur ses sauvegardes.',
    tools: 'Outils',
    toolsDesc: 'Paramètres, la liste des commandes et les documents.',
    footer: 'Les instructions complètes se trouvent dans le document « {help} ».',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Marqueurs de concentration, rappels et sauvegardes pour D&D 5e',
    overview: {
      heading: 'Aperçu',
      body: 'La concentration permet de savoir qui se concentre sur quel sort. Il place un marqueur sur le jeton du lanceur, lance (ou demande) une sauvegarde de Constitution lorsque ce jeton subit des dégâts et indique à la table quand la concentration se termine.',
    },
    quickStart: {
      heading: 'Démarrage rapide',
      steps: [
        'Sélectionnez le jeton du lanceur et tapez !concentration suivi du sort, par exemple !concentration Bless.',
        'Modifiez les points de vie du jeton dans sa bulle de barre. Une sauvegarde est lancée à un DD de 10, ou à la moitié des dégâts si ce chiffre est plus élevé.',
        'Exécutez à nouveau la même commande ou retirez le marqueur pour mettre fin à la concentration.',
        'Tapez !concentration sans rien sélectionné pour ouvrir les paramètres.',
      ],
    },
    concentrating: {
      heading: 'Se concentrer',
      points: [
        "Nommer un sort différent change la concentration, comme le fait le lancement d'un nouveau sort de concentration.",
        'Placer le marqueur sur un jeton à la main démarre la concentration sans sort ; le retirer ou supprimer le jeton y met fin.',
        "Un nouveau jeton lié d'un personnage concentré obtient le marqueur, et un jeton collé qui porte le marqueur est suivi.",
        "Les jetons d'un personnage avec une barre de points de vie liée partagent la concentration. Les jetons non liés, comme un groupe de gobelins d'une seule feuille, se concentrent sur eux-mêmes.",
        'Tout le monde voit un message lorsque la concentration commence, change ou se termine, sauf indication contraire de Send Reminder To.',
      ],
    },
    saves: {
      heading: "La concentration permet d'économiser",
      points: [
        "Le DD est de 10 ou la moitié des dégâts subis, selon le montant le plus élevé, jusqu'à DD 30.",
        'Le modificateur vient de l’Attribut Bonus sur la fiche du personnage ; une valeur manquante compte pour 0.',
        "Auto Roll Enregistrez les rouleaux en même temps. Lorsqu'il est désactivé, le rappel comporte des boutons Roll et Advantage pour le joueur ou le MJ.",
        'Une sauvegarde ratée met fin à la concentration. Avec Fin à 0 HP activé, tomber à 0 point de vie met fin sans sauvegarde.',
        'Le menu Avantage donne un avantage au personnage sur les sauvegardes automatiques, comme le fait le don War Caster.',
      ],
    },
    automatic: {
      heading: 'Sorts lancés depuis une feuille',
      points: [
        "Avec ajout automatique de con. Marqueur activé, lancer un sort de concentration à partir d'une feuille D&D 5e 2014 (OGL) ou 2024 ajoute le marqueur.",
        "Les jetons du lanceur de sorts sur la page qu'il consulte sont marqués ; s'il n'y en a pas, les jetons sur n'importe quelle page le sont.",
        'Seules les cartes du MJ, d’un autre Mod ou d’un des joueurs du personnage comptent. Relancer le même sort ne change rien.',
        'Une carte D&D 2024 qui ne mentionne que la concentration dans son texte, comme le don War Caster, peut démarrer la concentration mais ne remplace jamais un sort.',
        "Les feuilles D&D 2024 peuvent nécessiter le serveur API expérimentale. Activez le mode débogage pour voir pourquoi un sort a été ou n'a pas été détecté.",
      ],
    },
    players: {
      heading: 'Joueurs',
      points: [
        "Les joueurs peuvent démarrer et terminer la concentration des jetons qu'ils contrôlent et utiliser les boutons Roll et Advantage sur leurs propres sauvegardes.",
        'Avec Envoyer un rappel pour être réglé sur Personnage, les messages sont chuchotés aux joueurs du personnage et au MJ.',
      ],
    },
    commands: {
      heading: 'Commandes',
      intro: "D'autres mods, tels que les ScriptCards, peuvent également envoyer ces commandes.",
      colCommand: 'Commande',
      colDesc: 'Ce que ça fait',
    },
    settings: {
      heading: 'Paramètres',
      intro:
        'Modifiez les paramètres avec les boutons de la carte des paramètres ou avec config <key>|<value>. Certains peuvent également être définis sur la page du Mod.',
      colKey: 'Clé',
      colName: 'Nom',
      colDesc: 'Ce que ça fait',
    },
    upgrading: {
      heading: 'Mise à niveau à partir de la version 1.0',
      points: [
        'Les paramètres, la liste des avantages et chaque commande continuent de fonctionner.',
        'Les messages indiquent désormais quand la concentration se termine et sur quel sort.',
        'Les jetons qui portent déjà le marqueur sont récupérés au démarrage.',
      ],
    },
    troubleshooting: {
      heading: 'Dépannage',
      points: [
        "Pas de sauvegarde lorsque les points de vie chutent : vérifiez que le jeton porte le marqueur et que la barre HP est bien la barre que vous avez modifiée. Les modifications apportées par d'autres mods via l'API ne déclenchent pas d'événements, elles ne sont donc pas visibles.",
        'Le modificateur est 0 : vérifiez l’attribut bonus par rapport à la feuille du personnage.',
        'Les sorts lancés depuis la feuille ne sont pas détectés : activez le mode débogage, lancez à nouveau le sort et lisez la console API.',
        'Deux personnages partagent un nom : la détection utilise la première correspondance. Donnez aux personnages des noms uniques.',
      ],
    },
    languages: {
      heading: 'Langues',
      body: 'La concentration est traduite dans les langues ci-dessous. Choisissez-en un avec le paramètre Langue.',
      colCode: 'Code',
      colName: 'Langue',
      colNative: 'Nom natif',
    },
    credits: {
      heading: 'Crédits',
      original: 'Mod original par',
      maintainer: 'Entretenu par',
      support: 'Signalez des bugs et des idées sur le forum Roll20 Mod ou sur GitHub.',
    },
    footer: 'Les boutons pour chaque action se trouvent dans le document « {deck} ».',
  },
};

export default TRANSLATION;
