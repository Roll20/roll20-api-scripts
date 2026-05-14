const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "uchvácený",
      verb: "uchvátí",
    },
    Restrained: {
      past: "omezený",
      verb: "omezí",
    },
    Prone: {
      past: "sražený k zemi",
      verb: "srazí",
      suffix: "k zemi",
    },
    Poisoned: {
      past: "otrávený",
      verb: "otráví",
    },
    Stunned: {
      past: "omráčený",
      verb: "omráčí",
    },
    Blinded: {
      past: "oslepený",
      verb: "oslepí",
    },
    Charmed: {
      past: "okouzlený",
      verb: "okouzlí",
    },
    Frightened: {
      past: "vystrašený",
      verb: "vystraší",
    },
    Incapacitated: {
      past: "vyřazený",
      verb: "vyřadí",
    },
    Invisible: {
      past: "neviditelný",
      verb: "učiní",
      suffix: "neviditelným",
    },
    Paralyzed: {
      past: "paralyzovaný",
      verb: "paralyzuje",
    },
    Petrified: {
      past: "zkamenělý",
      verb: "zkamení",
    },
    Unconscious: {
      past: "v bezvědomí",
      verb: "uvede",
      suffix: "do bezvědomí",
    },
    Spell: {
      past: "ovlivněný kouzlem",
      verb: "sesílá kouzlo na",
    },
    Ability: {
      past: "ovlivněný schopností",
      verb: "použije schopnost na",
    },
    Advantage: {
      past: "má výhodu",
      verb: "udělí výhodu",
      noBy: true,
    },
    Disadvantage: {
      past: "má nevýhodu",
      verb: "udělí nevýhodu",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Uchvácený",
    Restrained: "Omezený",
    Prone: "Sražený",
    Poisoned: "Otrávený",
    Stunned: "Omráčený",
    Blinded: "Oslepený",
    Charmed: "Okouzlený",
    Frightened: "Vystrašený",
    Incapacitated: "Vyřazený",
    Invisible: "Neviditelný",
    Paralyzed: "Paralyzovaný",
    Petrified: "Zkamenělý",
    Unconscious: "V bezvědomí",
    Spell: "Kouzlo",
    Ability: "Schopnost",
    Advantage: "Výhoda",
    Disadvantage: "Nevýhoda",
    Other: "Jiné",
  },
  templates: {
    display: {
      custom: "{emoji} {target} ovlivněný {effect} ({source})",
      advantage: "{emoji} {source} má výhodu proti {target}{subject}",
      disadvantage: "{emoji} {source} má nevýhodu proti {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} je {past}",
      standard: "{emoji} {target} {past} od {source}",
    },
    apply: {
      custom: "{source} uplatní {effect} na {target}.",
      advantage: "{source} má výhodu proti {target}{subject}.",
      disadvantage: "{source} má nevýhodu proti {target}{subject}.",
      self: "{target} je {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} již není ovlivněný {effect}.",
      advantage: "{source} již nemá výhodu proti {target}{subject}.",
      disadvantage: "{source} již nemá nevýhodu proti {target}{subject}.",
      noBy: "{target} již není {past}.",
      self: "{target} již není {past}.",
      standard: "{target} již není {past} od {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Vybrat stav",
      selectSource: "Vybrat zdrojový žeton",
      selectTarget: "Vybrat cílový žeton",
      selectSubject: "Vybrat subjekt",
      selectDuration: "Vybrat trvání",
      confirmTargetTitle: "Potvrdit seznam cílů",
      applyEffectTitle: "Uplatnit efekt {condition}",
      noTokens: "Na aktivní stránce nebyly nalezeny žádné pojmenované žetony.",
      confirmIntro: "Následující žetony obdrží stav:",
      confirmBtn: "Potvrdit seznam cílů",
      enterDetails: "Zadat podrobnosti efektu",
      noneBtn: "Žádný",
      noneOrSourceBtn: "Žádný nebo použít na zdroj",
      subjectDesc: "Vyberte, kdo nebo co efekt způsobuje.",
      sourceDesc: "Vyberte bytost, která stav nebo efekt vytváří.",
      targetDesc: "Vyberte bytost, která stav nebo efekt obdrží.",
      otherText: "Vlastní text stavu",
      effectDetails: "Podrobnosti {condition}",
    },
    col: {
      players: "Hráči",
      npcs: "Nestvůry",
      conditions: "Stavy",
      customEffects: "Vlastní efekty",
      permanentTurnEnd: "Trvalý / Konec tahu",
      rounds: "Kola",
      command: "Příkaz",
      result: "Výsledek",
      field: "Pole",
      value: "Hodnota",
      option: "Možnost",
      condition: "Stav",
      marker: "Značka",
      item: "Položka",
      removed: "Odstraněno",
      details: "Podrobnosti",
      description: "Popis",
      scenario: "Scénář",
    },
    dur: {
      untilRemoved: "Do odebrání",
      endOfTargetTurn: "Konec příštího tahu cíle",
      endOfSourceTurn: "Konec příštího tahu zdroje",
      round1: "1 kolo",
      round2: "2 kola",
      round3: "3 kola",
      round10: "10 kol",
      custom: "Vlastní",
      customPrompt: "Počet kol",
      untilRemovedDisplay: "Do odebrání",
      turnsRemaining: "Zbývá {n} konec (konců) tahu",
    },
    btn: {
      openWizard: "Otevřít průvodce",
      openMultiTarget: "Otevřít průvodce více cílů",
      openRemovalList: "Otevřít seznam odebrání",
      showConfig: "Zobrazit konfiguraci",
      runCleanup: "Spustit vyčištění",
      reinstallMacro: "Přeinstalovat makro",
      reinstallHandout: "Přeinstalovat příručku",
      showHelp: "Zobrazit nápovědu",
      reorderConditions: "Přeuspořádat řádky stavů",
    },
    title: {
      menu: "Nabídka",
      removalMenu: "Odebrání stavů",
      config: "Konfigurace",
      configTracker: "Konfigurace Condition Trackeru",
      help: "Nápověda",
      applied: "Uplatněno",
      removed: "Stav odebrán",
      cleanup: "Vyčištění dokončeno",
      macroReinstalled: "Makro přeinstalováno",
      handoutReinstalled: "Příručka přeinstalována",
      warning: "Varování",
      error: "Chyba",
      turnOrder: "Pořadí tahů",
      noConditions: "Žádné stavy",
      tokenMoved: "Žeton přesunut",
      markedDead: "Označen jako mrtvý",
      zeroHp: "{name} — 0 životů",
      moveToken: "{name} — Přesunout žeton?",
      scriptReady: "Skript připraven",
      conditionReorder: "Pořadí tahů změněno",
    },
    heading: {
      quickActions: "Rychlé akce",
      settings: "Nastavení",
      markerMappings: "Mapování značek",
      result: "Výsledek",
      info: "Informace",
      commandOptions: "Možnosti příkazů",
      promptUi: "Rozhraní průvodce",
      examples: "Příklady",
      summary: "Souhrn",
    },
    msg: {
      noActive: "Nejsou sledovány žádné aktivní stavy.",
      configReset: "Konfigurace obnovena na výchozí hodnoty modulu.",
      unknownConfig:
        "Neznámá možnost konfigurace. Použijte --config pro zobrazení podporovaných nastavení.",
      macroReinstalled:
        "Makra {wizard} a {multiTarget} byla přeinstalována pro všechny aktuální hráče s GM rolí.",
      handoutReinstalled: "Pomocná příručka {handout} byla přeinstalována.",
      duplicate:
        "Tato přesná kombinace zdroje, subjektu, cíle, stavu a vlastního textu je již aktivní.",
      noTargets: "Pro hromadné uplatnění nebyly zadány žádné cílové žetony.",
      noSelection:
        "Před použitím --multi-target vyberte alespoň jeden žeton na hrací ploše.",
      invalidIds: "V aktuálním výběru nebyla nalezena žádná platná ID žetonů.",
      reSelectTokens:
        "Žádný z původně vybraných žetonů nebylo možné nalézt. Vyberte žetony znovu a zkuste to znovu.",
      conditionNotFound: "ID stavu nebylo nalezeno.",
      gmOnly: "Příkazy Condition Trackeru jsou určeny pouze pro GM.",
      commandFailed:
        "Příkaz nebylo možné bezpečně dokončit. Zkontrolujte konzoli API.",
      sourceTokenNotFound: "Zdrojový žeton nebylo možné nalézt.",
      targetTokenNotFound: "Cílový žeton nebylo možné nalézt.",
      subjectTokenNotFound: "Žeton subjektu nebylo možné nalézt.",
      invalidCondition:
        "Stav musí být jedním z předdefinovaných stavů nebo Jiné.",
      subjectOnlyCustom:
        "--subject je platný pouze pro Kouzlo, Schopnost, Výhodu, Nevýhodu a Jiné.",
      subjectBypassInvalid:
        "--subjectPromptBypass očekává true nebo false, pokud je zadána hodnota.",
      customDetailsRequired:
        "Podrobnosti {condition} jsou povinné. Použijte --other pro jejich zadání.",
      markerConfigFormat:
        "Formát konfigurace značky: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Konfigurace značky vyžaduje předdefinovaný název stavu.",
      markerNameRequired: "Konfigurace značky vyžaduje neprázdný název značky.",
      markerSet: "Značka {condition} nastavena na {marker}.",
      healthBarSet: "Lišta zdraví nastavena na {bar}.",
      boolSet: "{key} nastaveno na {value}.",
      expectedBoolean: "Očekáváno true nebo false.",
      invalidHealthBar:
        "Lišta zdraví musí být bar1_value, bar2_value nebo bar3_value.",
      markersDisabled: "Značky jsou zakázány.",
      noMarkerConfigured: "Pro tento stav není nakonfigurována žádná značka.",
      markerApplied: "Značka uplatněna: {marker}",
      markerPresent: "Značka již přítomna: {marker}",
      langSet: "Jazyk nastaven na {locale}.",
      invalidLocale: "Neplatný jazyk. Podporované jazyky: {locales}.",
      otherDurationRequiresRounds:
        "Jiné trvání vyžaduje číselný počet kol, například --duration 5 rounds.",
      invalidDuration:
        "Trvání musí být Do odebrání, možnost konce tahu nebo kladný počet kol.",
      zeroHpNoConditions: "{name} dosáhl 0 životů a nemá žádné aktivní stavy.",
      zeroHpConditions: "{name} dosáhl 0 životů. Vyberte stavy k odebrání:",
      removeAllBtn: "Odebrat všechny stavy pro {name}",
      markIncapacitated: "Označit jako vyřazeného",
      removeFromTurnOrder: "Odebrat z pořadí tahů",
      alreadyIncapacitated: "{name} je již vyřazený.",
      tokenRemovedFromTurn: "{name} byl odebrán z pořadí tahů.",
      tokenNotInTurn: "{name} nebyl nalezen v pořadí tahů.",
      moveTokenPrompt:
        "Přesunout {name} na vrstvu mapy, aby zůstal viditelný, ale nerušil ostatní žetony?",
      moveTokenBtn: "Přesunout {name} na vrstvu mapy",
      tokenMoved: "{name} byl přesunut na vrstvu mapy.",
      tokenNotFound: "Žeton nenalezen.",
      noActiveConditions: "{name} nemá žádné aktivní stavy k odebrání.",
      deadNoConditions:
        "{name} byl označen jako mrtvý. Nebyly aktivní žádné stavy.",
      scriptReady: "{name} je aktivní a používáte verzi {version}.",
      reachedZeroHp: "{name} dosáhl 0 životů",
      manuallyRemoved: "bylo ručně odebráno",
      durationExpired: "trvání vypršelo",
      markedAsDead: "{name} byl označen jako mrtvý",
      conditionReorder:
        "Pořadí tahů se změnilo a {count} sledovaný (sledovaných) řádek stavů může být mimo pořadí. Klikněte níže pro jejich obnovení za přiřazené žetony.",
      conditionsReordered:
        "Řádky stavů byly přesunuty za jejich přiřazené žetony.",
    },
    removal: {
      conditionField: "Stav",
      reasonField: "Důvod",
      turnRowField: "Řádek sledování tahů",
      markerField: "Značka",
      notConfigured: "Nenakonfigurováno",
      markerRemoved: "Odebráno ({marker})",
      markerRetained: "Zachováno ({marker})",
      rowRemoved: "Odebráno",
      rowMissing: "Již chybí",
      manualReason: "Ruční odebrání",
    },
    cleanup: {
      orphaned: "Osiřelé záznamy stavů",
      stale: "Zastaralé záznamy stavů",
      orphanedRows: "Osiřelé řádky sledování tahů",
      unusedMarkers: "Nepoužívané značky",
    },
    apply: {
      turnAppended:
        "Cíl nebyl v pořadí tahů; řádek stavu byl připojen na konec.",
      turnInserted: "Řádek stavu vložen pod žeton cíle.",
    },
  },
  handout: {
    versionLabel: "Verze",
    subtitle: "Správce stavových efektů pro D&D 5e",
    footerNote:
      "Tato příručka je automaticky vytvářena a aktualizována při každém načtení skriptu.",
    overview: {
      heading: "Přehled",
      body: "Condition Tracker spravuje stavy D&D 5e a vlastní efekty jako pojmenované řádky ve sledovači tahů Roll20. Uplatňujte stavy na žetony, sledujte doby trvání podle iniciativního pořadí a automaticky odstraňujte vypršelé efekty na konci tahu. Všechny příkazy jsou určeny pouze pro GM a lze je spouštět z chatu nebo prostřednictvím nainstalovaných maker.",
    },
    quickStart: {
      heading: "Rychlý start",
      colCommand: "Příkaz",
      colDesc: "Popis",
      rows: [
        [
          "!condition-tracker --prompt",
          "Průvodce krok za krokem — interaktivně vyberte stav, žetony a dobu trvání. Dostupné také jako makro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Uplatnit jeden stav na více žetonů současně. Dostupné také jako makro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Otevřít hlavní nabídku správy s tlačítky pro uplatnění, prohlížení nebo odebrání stavů.",
        ],
      ],
    },
    commandsRef: {
      heading: "Přehled příkazů",
      colFlag: "Přepínač",
      colDesc: "Popis",
      rows: [
        ["--prompt", "Interaktivní průvodce krok za krokem"],
        ["--multi-target", "Uplatnit stav na více cílových žetonů najednou"],
        [
          "--menu",
          "Zobrazit hlavní nabídku (přidat remove pro nabídku odebrání)",
        ],
        [
          "--source X --target Y --condition Z",
          "Uplatnit stav přímo bez průvodce",
        ],
        [
          "--duration &lt;hodnota&gt;",
          "Trvání pro přímé uplatnění (např. 2 rounds)",
        ],
        [
          "--other &lt;text&gt;",
          "Vlastní text pro typy efektů Kouzlo / Schopnost / Jiné",
        ],
        [
          "--remove &lt;ID stavu&gt;",
          "Odebrat konkrétní stav podle jeho jedinečného ID",
        ],
        [
          "--config &lt;možnost&gt; &lt;hodnota&gt;",
          "Upravit nastavení konfigurace (viz sekce Konfigurace níže)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Přepsat subjectPromptBypass pouze pro tento příkaz (podporuje také --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Sladit stav — odebrat osiřelé stavy a řádky sledování tahů",
        ],
        [
          "--reorder-conditions",
          "Ručně přemístit řádky podmínek za přiřazené tokeny v pořadí kol",
        ],
        ["--reinstall-macro", "Znovu vytvořit nebo aktualizovat makra GM"],
        [
          "--reinstall-handout",
          "Znovu vytvořit nebo aktualizovat lokalizovanou pomocnou příručku",
        ],
        [
          "--lang &lt;jazyk&gt;",
          "Výstup zpráv tohoto příkazu v dalším jazyce (dvojjazyčný režim)",
        ],
        ["--help", "Zobrazit stručnou nápovědní kartu v chatu"],
      ],
    },
    standardConditions: {
      heading: "Standardní stavy (D&amp;D 5e)",
      colCondition: "Stav",
    },
    customEffects: {
      heading: "Vlastní typy efektů",
      colType: "Typ",
      colNotes: "Poznámky",
      rows: [
        [
          "🔮 Kouzlo",
          "Sledování pojmenovaného kouzlového efektu — budete vyzváni k zadání názvu kouzla",
        ],
        [
          "🎯 Schopnost",
          "Sledování pojmenované schopnosti třídy nebo rasy — budete vyzváni k zadání názvu",
        ],
        [
          "🍀 Výhoda",
          "Zaznamenat výhodu udělenou od jednoho žetonu druhému; seskupeno se zdrojem v iniciativě",
        ],
        [
          "⬇️ Nevýhoda",
          "Zaznamenat uloženou nevýhodu; seskupeno se zdrojem v iniciativě",
        ],
        ["📝 Jiné", "Volný vlastní popisek — budete vyzváni k zadání popisu"],
      ],
    },
    durationOptions: {
      heading: "Možnosti trvání",
      intro:
        "Zbývající počet je zobrazen ve sloupci pr sledovače tahů a snižuje se, když skončí tah kotevního žetonu.",
      colOption: "Možnost",
      colBehaviour: "Chování",
      rows: [
        [
          "Do odebrání",
          "Trvalé — musí být odebrán ručně přes nabídku nebo --remove",
        ],
        [
          "Konec příštího tahu cíle",
          "Vyprší na konci příštího tahu cílového žetonu v iniciativě",
        ],
        [
          "Konec příštího tahu zdroje",
          "Vyprší na konci příštího tahu zdrojového žetonu v iniciativě",
        ],
        [
          "1 / 2 / 3 / 10 kol",
          "Pevný odpočet; jedno snížení za konec tahu kotevního žetonu",
        ],
      ],
    },
    configuration: {
      heading: "Konfigurace",
      intro:
        "Použijte !condition-tracker --config &lt;možnost&gt; &lt;hodnota&gt; nebo tlačítko Konfigurace v hlavní nabídce.",
      colOption: "Možnost",
      colValues: "Hodnoty",
      colDesc: "Popis",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Uplatnit stavové značky Roll20 na žetony při přidání stavu",
        ],
        [
          "useIcons",
          "true / false",
          "Zobrazovat krátké kódy ikon (např. [G]) místo emoji v řádcích sledovače tahů",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Přeskočit volitelný krok výběru subjektu pro efekty Kouzlo / Schopnost / Jiné",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Sledovaná lišta; když klesne na 0, GM je vyzván k vyčištění stavů",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Výstupní jazyk pro chatové zprávy a pomocnou příručku",
        ],
        [
          "marker",
          "&lt;Stav&gt;=&lt;název značky&gt;",
          "Přepsat stavovou značku použitou pro konkrétní stav (např. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Výchozí stavové značky",
      colCondition: "Stav",
      colMarker: "Název značky",
    },
    availableLocales: {
      heading: "Dostupné překlady",
      intro:
        "Použijte možnost konfigurace jazyka k nastavení chatových zpráv a pomocné příručky na jakýkoliv podporovaný jazyk. Pro en, zh a pt jsou také přijímány krátké aliasy.",
      colLocale: "Locale",
      colLanguage: "Jazyk",
      colFile: "Soubor překladu",
    },
  },
};

export default TRANSLATION;
