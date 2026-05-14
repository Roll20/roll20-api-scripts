const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "agrippé",
      verb: "agrippe",
    },
    Restrained: {
      past: "entravé",
      verb: "entrave",
    },
    Prone: {
      past: "mis à terre",
      verb: "met",
      suffix: "à terre",
    },
    Poisoned: {
      past: "empoisonné",
      verb: "empoisonne",
    },
    Stunned: {
      past: "étourdi",
      verb: "étourdit",
    },
    Blinded: {
      past: "aveuglé",
      verb: "aveugle",
    },
    Charmed: {
      past: "charmé",
      verb: "charme",
    },
    Frightened: {
      past: "effrayé",
      verb: "effraie",
    },
    Incapacitated: {
      past: "incapacité",
      verb: "incapacite",
    },
    Invisible: {
      past: "invisible",
      verb: "rend",
      suffix: "invisible",
    },
    Paralyzed: {
      past: "paralysé",
      verb: "paralyse",
    },
    Petrified: {
      past: "pétrifié",
      verb: "pétrifie",
    },
    Unconscious: {
      past: "inconscient",
      verb: "rend",
      suffix: "inconscient",
    },
    Spell: {
      past: "affecté par un sort",
      verb: "lance un sort sur",
    },
    Ability: {
      past: "affecté par une capacité",
      verb: "utilise une capacité sur",
    },
    Advantage: {
      past: "a l’avantage",
      verb: "accorde l’avantage à",
      noBy: true,
    },
    Disadvantage: {
      past: "a le désavantage",
      verb: "impose le désavantage à",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Agrippé",
    Restrained: "Entravé",
    Prone: "À terre",
    Poisoned: "Empoisonné",
    Stunned: "Étourdi",
    Blinded: "Aveuglé",
    Charmed: "Charmé",
    Frightened: "Effrayé",
    Incapacitated: "Incapacité",
    Invisible: "Invisible",
    Paralyzed: "Paralysé",
    Petrified: "Pétrifié",
    Unconscious: "Inconscient",
    Spell: "Sort",
    Ability: "Capacité",
    Advantage: "Avantage",
    Disadvantage: "Désavantage",
    Other: "Autre",
  },
  templates: {
    display: {
      custom: "{emoji} {target} affecté par {effect} ({source})",
      advantage: "{emoji} {source} a l’avantage contre {target}{subject}",
      disadvantage:
        "{emoji} {source} a le désavantage contre {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} est {past}",
      standard: "{emoji} {target} {past} par {source}",
    },
    apply: {
      custom: "{source} applique {effect} à {target}.",
      advantage: "{source} a l’avantage contre {target}{subject}.",
      disadvantage: "{source} a le désavantage contre {target}{subject}.",
      self: "{target} est {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} n’est plus affecté par {effect}.",
      advantage: "{source} n’a plus l’avantage contre {target}{subject}.",
      disadvantage:
        "{source} n’a plus le désavantage contre {target}{subject}.",
      noBy: "{target} n’est plus {past}.",
      self: "{target} n’est plus {past}.",
      standard: "{target} n’est plus {past} par {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Sélectionner une condition",
      selectSource: "Sélectionner le jeton source",
      selectTarget: "Sélectionner le jeton cible",
      selectSubject: "Sélectionner le sujet",
      selectDuration: "Sélectionner la durée",
      confirmTargetTitle: "Confirmer la liste de cibles",
      applyEffectTitle: "Appliquer l’effet {condition}",
      noTokens: "Aucun jeton nommé trouvé sur la page active.",
      confirmIntro: "Les jetons suivants recevront la condition :",
      confirmBtn: "Confirmer la liste de cibles",
      enterDetails: "Saisir les détails de l’effet",
      noneBtn: "Aucun",
      noneOrSourceBtn: "Aucun ou appliquer à la source",
      subjectDesc: "Sélectionnez qui ou quoi délivre l’effet.",
      sourceDesc:
        "Sélectionnez la créature qui crée ou génère la condition ou l’effet.",
      targetDesc:
        "Sélectionnez la créature qui recevra la condition ou l’effet.",
      otherText: "Texte de condition personnalisé",
      effectDetails: "Détails de {condition}",
    },
    col: {
      players: "Joueurs",
      npcs: "PNJ",
      conditions: "Conditions",
      customEffects: "Effets personnalisés",
      permanentTurnEnd: "Permanent / Fin de tour",
      rounds: "Rounds",
      command: "Commande",
      result: "Résultat",
      field: "Champ",
      value: "Valeur",
      option: "Option",
      condition: "Condition",
      marker: "Marqueur",
      item: "Élément",
      removed: "Supprimé",
      details: "Détails",
      description: "Description",
      scenario: "Scénario",
    },
    dur: {
      untilRemoved: "Jusqu’à suppression",
      endOfTargetTurn: "Fin du prochain tour de la cible",
      endOfSourceTurn: "Fin du prochain tour de la source",
      round1: "1 round",
      round2: "2 rounds",
      round3: "3 rounds",
      round10: "10 rounds",
      custom: "Personnalisé",
      customPrompt: "Nombre de rounds",
      untilRemovedDisplay: "Jusqu’à suppression",
      turnsRemaining: "{n} fin(s) de tour restante(s)",
    },
    btn: {
      openWizard: "Ouvrir l’assistant",
      openMultiTarget: "Ouvrir l’assistant multi-cibles",
      openRemovalList: "Ouvrir la liste de suppression",
      showConfig: "Afficher la configuration",
      runCleanup: "Lancer le nettoyage",
      reinstallMacro: "Réinstaller la macro",
      reinstallHandout: "Réinstaller le livret",
      showHelp: "Afficher l’aide",
      reorderConditions: "Réorganiser les lignes de condition",
    },
    title: {
      menu: "Menu",
      removalMenu: "Suppression — Condition Tracker",
      config: "Configuration",
      configTracker: "Configuration — Condition Tracker",
      help: "Aide",
      applied: "Appliqué",
      removed: "Condition supprimée",
      cleanup: "Nettoyage terminé",
      macroReinstalled: "Macro réinstallée",
      handoutReinstalled: "Livret réinstallé",
      warning: "Avertissement",
      error: "Erreur",
      turnOrder: "Ordre d’initiative",
      noConditions: "Aucune condition",
      tokenMoved: "Jeton déplacé",
      markedDead: "Marqué comme mort",
      zeroHp: "{name} — 0 PV",
      moveToken: "{name} — Déplacer le jeton ?",
      scriptReady: "Script prêt",
      conditionReorder: "Ordre de tour modifié",
    },
    heading: {
      quickActions: "Actions rapides",
      settings: "Paramètres",
      markerMappings: "Correspondances des marqueurs",
      result: "Résultat",
      info: "Informations",
      commandOptions: "Options de commande",
      promptUi: "Interface de l’assistant",
      examples: "Exemples",
      summary: "Résumé",
    },
    msg: {
      noActive: "Aucune condition active n’est suivie.",
      configReset: "Configuration réinitialisée aux valeurs par défaut.",
      unknownConfig:
        "Option de configuration inconnue. Utilisez --config pour voir les paramètres disponibles.",
      macroReinstalled:
        "Les macros {wizard} et {multiTarget} ont été réinstallées pour tous les MJ actifs.",
      handoutReinstalled: "Le livret d’aide {handout} a été réinstallé.",
      duplicate:
        "Cette combinaison source, sujet, cible, condition et texte personnalisé est déjà active.",
      noTargets: "Aucun jeton cible spécifié pour l’application multi-cibles.",
      noSelection:
        "Sélectionnez au moins un jeton sur le plateau avant d’utiliser --multi-target.",
      invalidIds:
        "Aucun identifiant de jeton valide trouvé dans la sélection actuelle.",
      reSelectTokens:
        "Aucun des jetons initialement sélectionnés n’a pu être trouvé. Veuillez resélectionner les jetons et réessayer.",
      conditionNotFound: "Identifiant de condition introuvable.",
      gmOnly: "Les commandes de Condition Tracker sont réservées au MJ.",
      commandFailed:
        "La commande n’a pas pu être exécutée. Vérifiez la console API pour plus de détails.",
      sourceTokenNotFound: "Le jeton source est introuvable.",
      targetTokenNotFound: "Le jeton cible est introuvable.",
      subjectTokenNotFound: "Le jeton sujet est introuvable.",
      invalidCondition:
        "La condition doit être une condition prédéfinie ou Autre.",
      subjectOnlyCustom:
        "--subject est uniquement valide pour Sort, Capacité, Avantage, Désavantage et Autre.",
      subjectBypassInvalid:
        "--subjectPromptBypass attend true ou false si une valeur est fournie.",
      customDetailsRequired:
        "Les détails de {condition} sont requis. Utilisez --other pour les fournir.",
      markerConfigFormat:
        "Format de configuration du marqueur : --config marker Grappled=grab",
      markerPredefinedRequired:
        "La configuration du marqueur requiert un nom de condition prédéfini.",
      markerNameRequired:
        "La configuration du marqueur requiert un nom de marqueur non vide.",
      markerSet: "Marqueur de {condition} défini sur {marker}.",
      healthBarSet: "Barre de santé définie sur {bar}.",
      boolSet: "{key} défini sur {value}.",
      expectedBoolean: "true ou false est attendu.",
      invalidHealthBar:
        "La barre de santé doit être bar1_value, bar2_value ou bar3_value.",
      markersDisabled: "Les marqueurs sont désactivés.",
      noMarkerConfigured:
        "Aucun marqueur n’est configuré pour cette condition.",
      markerApplied: "Marqueur appliqué : {marker}",
      markerPresent: "Marqueur déjà présent : {marker}",
      langSet: "Langue définie sur {locale}.",
      invalidLocale: "Locale invalide. Locales disponibles : {locales}.",
      otherDurationRequiresRounds:
        "La durée Autre requiert un nombre de rounds, par exemple --duration 5 rounds.",
      invalidDuration:
        "La durée doit être Jusqu’à suppression, une option de fin de tour ou un nombre de rounds positif.",
      zeroHpNoConditions:
        "{name} a atteint 0 PV et n’a aucune condition active.",
      zeroHpConditions:
        "{name} a atteint 0 PV. Choisissez les conditions à supprimer :",
      removeAllBtn: "Supprimer toutes les conditions de {name}",
      markIncapacitated: "Marquer comme Incapacité",
      removeFromTurnOrder: "Retirer de l’ordre d’initiative",
      alreadyIncapacitated: "{name} est déjà Incapacité.",
      tokenRemovedFromTurn: "{name} a été retiré de l’ordre d’initiative.",
      tokenNotInTurn: "{name} n’a pas été trouvé dans l’ordre d’initiative.",
      moveTokenPrompt:
        "Déplacer {name} vers le calque carte pour qu’il reste visible sans interférer avec les autres jetons ?",
      moveTokenBtn: "Déplacer {name} vers le calque carte",
      tokenMoved: "{name} a été déplacé vers le calque carte.",
      tokenNotFound: "Jeton introuvable.",
      noActiveConditions: "{name} n’a aucune condition active à supprimer.",
      deadNoConditions:
        "{name} a été marqué comme mort. Aucune condition n’était active.",
      scriptReady: "{name} est actif et vous utilisez la version {version}.",
      reachedZeroHp: "{name} a atteint 0 PV",
      manuallyRemoved: "suppression manuelle",
      durationExpired: "sa durée a expiré",
      markedAsDead: "{name} a été marqué comme mort",
      conditionReorder:
        "L'ordre de tour a changé et {count} ligne(s) de condition suivie(s) peut être mal placée. Cliquez ci-dessous pour les restaurer après leurs tokens assignés.",
      conditionsReordered:
        "Les lignes de condition ont été repositionnées après leurs tokens assignés.",
    },
    removal: {
      conditionField: "Condition",
      reasonField: "Raison",
      turnRowField: "Ligne d’initiative",
      markerField: "Marqueur",
      notConfigured: "Non configuré",
      markerRemoved: "Supprimé ({marker})",
      markerRetained: "Conservé ({marker})",
      rowRemoved: "Supprimé",
      rowMissing: "Déjà absent",
      manualReason: "Suppression manuelle",
    },
    cleanup: {
      orphaned: "Entrées de condition orphelines",
      stale: "Entrées de condition obsolètes",
      orphanedRows: "Lignes d’initiative orphelines",
      unusedMarkers: "Marqueurs inutilisés",
    },
    apply: {
      turnAppended:
        "La cible n’était pas dans l’ordre d’initiative ; la ligne de condition a été ajoutée.",
      turnInserted: "Ligne de condition insérée sous le jeton cible.",
    },
  },
  handout: {
    versionLabel: "Version",
    subtitle: "Gestionnaire d’états D&D 5e",
    footerNote:
      "Ce livret est créé et mis à jour automatiquement à chaque chargement du script.",
    overview: {
      heading: "Présentation",
      body: "Condition Tracker gère les conditions de statut D&D 5e et les effets personnalisés sous forme de lignes dans le suivi d’initiative Roll20. Appliquez des conditions aux jetons, suivez les durées par ordre d’initiative et supprimez automatiquement les effets expirés à la fin d’un tour. Toutes les commandes sont réservées au MJ.",
    },
    quickStart: {
      heading: "Démarrage rapide",
      colCommand: "Commande",
      colDesc: "Description",
      rows: [
        [
          "!condition-tracker --prompt",
          "Assistant pas à pas — choisissez condition, jetons et durée de façon interactive. Disponible aussi via la macro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Appliquer une condition à plusieurs jetons simultanément. Disponible aussi via la macro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Ouvrir le menu principal pour appliquer, consulter ou supprimer des conditions.",
        ],
      ],
    },
    commandsRef: {
      heading: "Référence des commandes",
      colFlag: "Option",
      colDesc: "Description",
      rows: [
        ["--prompt", "Interface de l’assistant pas à pas"],
        ["--multi-target", "Appliquer une condition à plusieurs jetons cibles"],
        [
          "--menu",
          "Afficher le menu principal (ajouter remove pour le menu de suppression)",
        ],
        [
          "--source X --target Y --condition Z",
          "Appliquer une condition directement sans l’assistant",
        ],
        [
          "--duration &lt;valeur&gt;",
          "Durée pour une application directe (ex. 2 rounds)",
        ],
        [
          "--other &lt;texte&gt;",
          "Texte personnalisé pour les types Sort / Capacité / Autre",
        ],
        [
          "--remove &lt;id-condition&gt;",
          "Supprimer une condition spécifique par son identifiant unique",
        ],
        [
          "--config &lt;option&gt; &lt;valeur&gt;",
          "Modifier les paramètres de configuration",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Remplacer subjectPromptBypass pour cette commande uniquement (prend aussi en charge --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Nettoyer l’état — supprimer les conditions et lignes orphelines",
        ],
        [
          "--reorder-conditions",
          "Repositionner manuellement les lignes de condition après leurs jetons assignés dans l’ordre d’initiative",
        ],
        ["--reinstall-macro", "Recréer ou mettre à jour les macros MJ"],
        [
          "--reinstall-handout",
          "Recréer ou mettre à jour le livret d’aide localisé",
        ],
        [
          "--lang &lt;locale&gt;",
          "Afficher les messages de cette commande dans une locale supplémentaire (mode bilingue)",
        ],
        ["--help", "Afficher une carte d’aide rapide dans le chat"],
      ],
    },
    standardConditions: {
      heading: "Conditions standard (D&D 5e)",
      colCondition: "Condition",
    },
    customEffects: {
      heading: "Types d’effets personnalisés",
      colType: "Type",
      colNotes: "Notes",
      rows: [
        [
          "🔮 Sort",
          "Suivre un effet de sort nommé — vous serez invité à saisir le nom du sort",
        ],
        [
          "🎯 Capacité",
          "Suivre une capacité de classe ou raciale — vous serez invité à saisir le nom",
        ],
        [
          "🍀 Avantage",
          "Enregistrer un avantage accordé d’un jeton à un autre ; groupé avec la source dans l’initiative",
        ],
        [
          "⬇️ Désavantage",
          "Enregistrer un désavantage imposé ; groupé avec la source dans l’initiative",
        ],
        [
          "📝 Autre",
          "Étiquette personnalisée libre — vous serez invité à saisir une description",
        ],
      ],
    },
    durationOptions: {
      heading: "Options de durée",
      intro:
        "Le compteur restant est affiché dans la colonne pr du suivi d’initiative et décrémente à la fin du tour du jeton ancre.",
      colOption: "Option",
      colBehaviour: "Comportement",
      rows: [
        [
          "Jusqu’à suppression",
          "Permanent — doit être supprimé manuellement via le menu ou --remove",
        ],
        [
          "Fin du prochain tour de la cible",
          "Expire à la fin du prochain tour du jeton cible dans l’initiative",
        ],
        [
          "Fin du prochain tour de la source",
          "Expire à la fin du prochain tour du jeton source dans l’initiative",
        ],
        [
          "1 / 2 / 3 / 10 rounds",
          "Compte à rebours fixe ; un décrément par fin de tour du jeton ancre",
        ],
      ],
    },
    configuration: {
      heading: "Configuration",
      intro:
        "Utilisez !condition-tracker --config &lt;option&gt; &lt;valeur&gt; ou le bouton Config dans le menu principal.",
      colOption: "Option",
      colValues: "Valeurs",
      colDesc: "Description",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Appliquer des marqueurs de statut Roll20 aux jetons lors de l’ajout d’une condition",
        ],
        [
          "useIcons",
          "true / false",
          "Afficher des codes d’icônes courts (ex. [G]) dans les lignes du suivi d’initiative",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Ignorer l’étape sujet optionnelle pour les effets Sort / Capacité / Autre",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Barre à surveiller ; quand elle atteint 0 le MJ est invité à nettoyer les conditions",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Langue des messages de chat et du livret d’aide",
        ],
        [
          "marker",
          "&lt;Condition&gt;=&lt;nom du marqueur&gt;",
          "Remplacer le marqueur utilisé pour une condition spécifique (ex. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Marqueurs de statut par défaut",
      colCondition: "Condition",
      colMarker: "Nom du marqueur",
    },
    availableLocales: {
      heading: "Traductions disponibles",
      intro:
        "Utilisez l'option de configuration language pour définir les messages de chat et le livret d'aide sur n'importe quelle locale prise en charge. Les alias courts sont également acceptés pour en, zh et pt.",
      colLocale: "Locale",
      colLanguage: "Langue",
      colFile: "Fichier de traduction",
    },
  },
};

export default TRANSLATION;
