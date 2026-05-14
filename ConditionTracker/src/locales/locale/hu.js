const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "megragadva",
      verb: "megragadja",
    },
    Restrained: {
      past: "lefogva",
      verb: "lefogja",
    },
    Prone: {
      past: "földre döntve",
      verb: "földre dönti",
    },
    Poisoned: {
      past: "megmérgezve",
      verb: "megmérgezi",
    },
    Stunned: {
      past: "kábult",
      verb: "elkábítja",
    },
    Blinded: {
      past: "megvakítva",
      verb: "megvakítja",
    },
    Charmed: {
      past: "elbájolva",
      verb: "elbájolja",
    },
    Frightened: {
      past: "megrémülve",
      verb: "megrémíti",
    },
    Incapacitated: {
      past: "cselekvőképtelen",
      verb: "cselekvőképtelenné teszi",
    },
    Invisible: {
      past: "láthatatlan",
      verb: "láthatatlanná teszi",
    },
    Paralyzed: {
      past: "megbénítva",
      verb: "megbénítja",
    },
    Petrified: {
      past: "kővé dermedve",
      verb: "kővé dermeszti",
    },
    Unconscious: {
      past: "eszméletlen",
      verb: "eszméletlenné teszi",
    },
    Spell: {
      past: "varázslat hatása alatt",
      verb: "varázslatot mond",
    },
    Ability: {
      past: "képesség hatása alatt",
      verb: "képességet használ",
    },
    Advantage: {
      past: "előnye van",
      verb: "előnyt ad",
      noBy: true,
    },
    Disadvantage: {
      past: "hátránya van",
      verb: "hátrányt ad",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Megragadva",
    Restrained: "Lefogva",
    Prone: "Földön",
    Poisoned: "Mérgezett",
    Stunned: "Kábult",
    Blinded: "Vak",
    Charmed: "Elbájolt",
    Frightened: "Rémült",
    Incapacitated: "Cselekvőképtelen",
    Invisible: "Láthatatlan",
    Paralyzed: "Bénult",
    Petrified: "Megkövült",
    Unconscious: "Eszméletlen",
    Spell: "Varázslat",
    Ability: "Képesség",
    Advantage: "Előny",
    Disadvantage: "Hátrány",
    Other: "Egyéb",
  },
  templates: {
    display: {
      custom: "{emoji} {target} {effect} hatása alatt ({source})",
      advantage: "{emoji} {source} előnnyel támad {target}{subject} ellen",
      disadvantage: "{emoji} {source} hátránnyal támad {target}{subject} ellen",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} {past}",
      standard: "{emoji} {target} {past} — {source}",
    },
    apply: {
      custom: "{source} alkalmazza a(z) {effect} hatást {target} célpontra.",
      advantage: "{source} előnnyel támad {target}{subject} ellen.",
      disadvantage: "{source} hátránnyal támad {target}{subject} ellen.",
      self: "{target} {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} már nem áll {effect} hatása alatt.",
      advantage:
        "{source} már nem rendelkezik előnnyel {target}{subject} ellen.",
      disadvantage:
        "{source} már nem rendelkezik hátránnyal {target}{subject} ellen.",
      noBy: "{target} már nem {past}.",
      self: "{target} már nem {past}.",
      standard: "{target} már nem {past} — {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Állapot kiválasztása",
      selectSource: "Forrás token kiválasztása",
      selectTarget: "Célpont token kiválasztása",
      selectSubject: "Alany kiválasztása",
      selectDuration: "Időtartam kiválasztása",
      confirmTargetTitle: "Célpontlista megerősítése",
      applyEffectTitle: "{condition} hatás alkalmazása",
      noTokens: "Nem található nevesített token az aktív oldalon.",
      confirmIntro: "A következő tokenek kapják meg az állapotot:",
      confirmBtn: "Célpontlista megerősítése",
      enterDetails: "Hatás részleteinek megadása",
      noneBtn: "Egyik sem",
      noneOrSourceBtn: "Egyik sem vagy alkalmazás a forrásra",
      subjectDesc: "Válassza ki, ki vagy mi hozza létre a hatást.",
      sourceDesc:
        "Válassza ki azt a lényt, amely létrehozza vagy előidézi az állapotot vagy hatást.",
      targetDesc:
        "Válassza ki azt a lényt, amely megkapja az állapotot vagy hatást.",
      otherText: "Egyéni állapotszöveg",
      effectDetails: "{condition} részletei",
    },
    col: {
      players: "Játékosok",
      npcs: "NJK-k",
      conditions: "Állapotok",
      customEffects: "Egyéni hatások",
      permanentTurnEnd: "Állandó / Kör vége",
      rounds: "Körök",
      command: "Parancs",
      result: "Eredmény",
      field: "Mező",
      value: "Érték",
      option: "Beállítás",
      condition: "Állapot",
      marker: "Jelölő",
      item: "Elem",
      removed: "Eltávolítva",
      details: "Részletek",
      description: "Leírás",
      scenario: "Forgatókönyv",
    },
    dur: {
      untilRemoved: "Eltávolításig",
      endOfTargetTurn: "A célpont következő körének végén",
      endOfSourceTurn: "A forrás következő körének végén",
      round1: "1 kör",
      round2: "2 kör",
      round3: "3 kör",
      round10: "10 kör",
      custom: "Egyéni",
      customPrompt: "Körök száma",
      untilRemovedDisplay: "Eltávolításig",
      turnsRemaining: "{n} fennmaradó körjegy",
    },
    btn: {
      openWizard: "Varázsló megnyitása",
      openMultiTarget: "Többcélpontos varázsló megnyitása",
      openRemovalList: "Eltávolítási lista megnyitása",
      showConfig: "Beállítások megjelenítése",
      runCleanup: "Tisztítás futtatása",
      reinstallMacro: "Makró újratelepítése",
      reinstallHandout: "Handout újratelepítése",
      showHelp: "Súgó megjelenítése",
      reorderConditions: "Állapotsorok átrendezése",
    },
    title: {
      menu: "Menü",
      removalMenu: "Condition Tracker — eltávolítás",
      config: "Beállítások",
      configTracker: "Condition Tracker — beállítások",
      help: "Súgó",
      applied: "Alkalmazva",
      removed: "Állapot eltávolítva",
      cleanup: "Tisztítás kész",
      macroReinstalled: "Makró újratelepítve",
      handoutReinstalled: "Handout újratelepítve",
      warning: "Figyelmeztetés",
      error: "Hiba",
      turnOrder: "Körsorend",
      noConditions: "Nincsenek állapotok",
      tokenMoved: "Token áthelyezve",
      markedDead: "Halottnak jelölve",
      zeroHp: "{name} — 0 ÉP",
      moveToken: "{name} — token áthelyezése?",
      scriptReady: "Szkript kész",
      conditionReorder: "Körsorend megváltozott",
    },
    heading: {
      quickActions: "Gyorsműveletek",
      settings: "Beállítások",
      markerMappings: "Jelölő-hozzárendelések",
      result: "Eredmény",
      info: "Információ",
      commandOptions: "Parancsbeállítások",
      promptUi: "Varázsló felülete",
      examples: "Példák",
      summary: "Összefoglalás",
    },
    msg: {
      noActive: "Nincs aktív követett állapot.",
      configReset: "A beállítások visszaálltak az alapértelmezett értékekre.",
      unknownConfig:
        "Ismeretlen beállítási lehetőség. Használja a --config parancsot a támogatott beállítások megtekintéséhez.",
      macroReinstalled:
        "A(z) {wizard} és {multiTarget} makrók újra lettek telepítve az összes jelenlegi GM-játékos számára.",
      handoutReinstalled: "A(z) {handout} súgó-handout újra lett telepítve.",
      duplicate:
        "Pontosan ugyanez a forrás, alany, célpont, állapot és egyéni szöveg már aktív.",
      noTargets:
        "Nem adtak meg célpont tokeneket a többcélpontos alkalmazáshoz.",
      noSelection:
        "Jelöljön ki legalább egy tokent a táblán a --multi-target használata előtt.",
      invalidIds:
        "Nem találhatók érvényes token-azonosítók a jelenlegi kijelölésben.",
      reSelectTokens:
        "Az eredetileg kijelölt tokenek egyike sem található. Jelölje ki újra a tokeneket, és próbálja újra.",
      conditionNotFound: "Az állapot azonosítója nem található.",
      gmOnly: "A Condition Tracker parancsai csak a GM számára érhetők el.",
      commandFailed:
        "A parancs nem hajtható végre biztonságosan. Ellenőrizze az API-konzolt a részletekért.",
      sourceTokenNotFound: "A forrás token nem található.",
      targetTokenNotFound: "A célpont token nem található.",
      subjectTokenNotFound: "Az alany token nem található.",
      invalidCondition:
        "Az állapotnak az előre meghatározott állapotok egyikének vagy az Egyébnek kell lennie.",
      subjectOnlyCustom:
        "A --subject csak Varázslat, Képesség, Előny, Hátrány és Egyéb esetén érvényes.",
      subjectBypassInvalid:
        "A --subjectPromptBypass értékként true vagy false értéket vár.",
      customDetailsRequired:
        "A(z) {condition} részletei kötelezők. Adja meg őket a --other kapcsolóval.",
      markerConfigFormat:
        "Jelölő-beállítás formátuma: --config marker Grappled=grab",
      markerPredefinedRequired:
        "A jelölő konfigurálásához előre meghatározott állapotnév szükséges.",
      markerNameRequired:
        "A jelölő konfigurálásához nem üres jelölőnév szükséges.",
      markerSet: "A(z) {condition} jelölője {marker} értékre állítva.",
      healthBarSet: "Az életerő sáv {bar} értékre állítva.",
      boolSet: "A(z) {key} {value} értékre állítva.",
      expectedBoolean: "True vagy false értéket várunk.",
      invalidHealthBar:
        "Az életerő sávnak bar1_value, bar2_value vagy bar3_value értékűnek kell lennie.",
      markersDisabled: "A jelölők le vannak tiltva.",
      noMarkerConfigured: "Ehhez az állapothoz nincs jelölő konfigurálva.",
      markerApplied: "Jelölő alkalmazva: {marker}",
      markerPresent: "A jelölő már jelen van: {marker}",
      langSet: "A nyelv {locale} értékre állítva.",
      invalidLocale: "Érvénytelen locale. Támogatott locale-k: {locales}.",
      otherDurationRequiresRounds:
        "Az egyéni időtartamhoz numerikus körmegjelölés szükséges, például --duration 5 rounds.",
      invalidDuration:
        "Az időtartamnak Eltávolításig, kör-végi beállítás vagy pozitív körszám kell lennie.",
      zeroHpNoConditions: "{name} 0 ÉP-re jutott, és nincs aktív állapota.",
      zeroHpConditions:
        "{name} 0 ÉP-re jutott. Válassza ki az eltávolítandó állapotokat:",
      removeAllBtn: "Minden állapot eltávolítása ({name})",
      markIncapacitated: "Megjelölés cselekvőképtelenként",
      removeFromTurnOrder: "Eltávolítás a körsorendből",
      alreadyIncapacitated: "{name} már cselekvőképtelen.",
      tokenRemovedFromTurn: "{name} eltávolítva a körsorendből.",
      tokenNotInTurn: "{name} nem található a körsorendben.",
      moveTokenPrompt:
        "{name} áthelyezése a térképrétegre, hogy látható maradjon, de ne zavarja a többi tokent?",
      moveTokenBtn: "{name} áthelyezése a térképrétegre",
      tokenMoved: "{name} áthelyezve a térképrétegre.",
      tokenNotFound: "A token nem található.",
      noActiveConditions:
        "{name}-nek nincsenek aktív állapotai az eltávolításhoz.",
      deadNoConditions:
        "{name} halottnak lett jelölve. Nem volt aktív állapot.",
      scriptReady: "{name} aktív, és a(z) {version} verziót használja.",
      reachedZeroHp: "{name} elérte a 0 ÉP-t",
      manuallyRemoved: "kézzel eltávolítva",
      durationExpired: "az időtartam lejárt",
      markedAsDead: "{name} halottnak lett jelölve",
      conditionReorder:
        "A körsorend megváltozott, és {count} követett állapotsor lehet rossz helyen. Kattintson alább a visszaállításhoz a hozzárendelt tokenek után.",
      conditionsReordered:
        "Az állapotsorok vissza lettek helyezve a hozzárendelt tokenek mögé.",
    },
    removal: {
      conditionField: "Állapot",
      reasonField: "Ok",
      turnRowField: "Turn Tracker sor",
      markerField: "Jelölő",
      notConfigured: "Nincs konfigurálva",
      markerRemoved: "Eltávolítva ({marker})",
      markerRetained: "Megőrizve ({marker})",
      rowRemoved: "Eltávolítva",
      rowMissing: "Már hiányzik",
      manualReason: "Kézi eltávolítás",
    },
    cleanup: {
      orphaned: "Árva állapotbejegyzések",
      stale: "Elavult állapotbejegyzések",
      orphanedRows: "Árva Turn Tracker sorok",
      unusedMarkers: "Nem használt jelölők",
    },
    apply: {
      turnAppended:
        "A célpont nem volt a körsorendben; az állapotsor hozzáfűzve a végéhez.",
      turnInserted: "Az állapotsor a célpont token alá lett illesztve.",
    },
  },
  handout: {
    versionLabel: "Verzió",
    subtitle: "D&D 5e állapothatás-kezelő",
    footerNote:
      "Ez a handout automatikusan létrejön és frissül minden alkalommal, amikor a szkript betöltődik.",
    overview: {
      heading: "Áttekintés",
      body: "A Condition Tracker D&D 5e állapotokat és egyéni hatásokat kezel megnevezett sorokként a Roll20 Turn Trackerben. Alkalmazzon állapotokat tokenekre, kövesse nyomon az időtartamokat iniciativa-sorrend szerint, és automatikusan távolítsa el a lejárt hatásokat a kör végén. Minden parancs csak a GM számára érhető el, és chatből vagy a telepített makrók révén indítható.",
    },
    quickStart: {
      heading: "Gyors kezdés",
      colCommand: "Parancs",
      colDesc: "Leírás",
      rows: [
        [
          "!condition-tracker --prompt",
          "Lépésről lépésre haladó varázsló — válasszon állapotot, tokeneket és időtartamot interaktívan. Elérhető ConditionTrackerWizard makróként is.",
        ],
        [
          "!condition-tracker --multi-target",
          "Egy állapot alkalmazása több tokenre egyszerre. Elérhető ConditionTrackerMultiTarget makróként is.",
        ],
        [
          "!condition-tracker --menu",
          "A fő kezelési menü megnyitása gombokkal az állapotok alkalmazásához, megtekintéséhez vagy eltávolításához.",
        ],
      ],
    },
    commandsRef: {
      heading: "Parancsreferencia",
      colFlag: "Kapcsoló",
      colDesc: "Leírás",
      rows: [
        ["--prompt", "Interaktív lépésről lépésre haladó varázsló"],
        [
          "--multi-target",
          "Állapot alkalmazása több célpont tokenre egyszerre",
        ],
        ["--menu", "Főmenü megjelenítése (add remove az eltávolítási menühöz)"],
        [
          "--source X --target Y --condition Z",
          "Állapot közvetlen alkalmazása varázsló nélkül",
        ],
        [
          "--duration &lt;érték&gt;",
          "Időtartam közvetlen alkalmazáshoz (pl. 2 rounds)",
        ],
        [
          "--other &lt;szöveg&gt;",
          "Egyéni szöveg Varázslat / Képesség / Egyéb hatástípusokhoz",
        ],
        [
          "--remove &lt;condition-id&gt;",
          "Adott állapot eltávolítása az egyedi azonosítójával",
        ],
        [
          "--config &lt;option&gt; &lt;value&gt;",
          "Konfigurációs beállítások módosítása (lásd lent a Beállítások részt)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "A subjectPromptBypass felülbírálása csak erre a parancsra (a --subject-prompt-bypass is támogatott)",
        ],
        [
          "--cleanup",
          "Állapot egyeztetése — árva állapotok és Turn Tracker sorok eltávolítása",
        ],
        [
          "--reorder-conditions",
          "Feltétel sorok kézi átrendezése a hozzárendelt tokenek mögé a körsorrendben",
        ],
        ["--reinstall-macro", "GM makrók újralétrehozása vagy frissítése"],
        [
          "--reinstall-handout",
          "A lokalizált súgó-handout újralétrehozása vagy frissítése",
        ],
        [
          "--lang &lt;locale&gt;",
          "A parancs üzeneteinek kimenete egy további locale-n (kétnyelvű mód)",
        ],
        ["--help", "Rövid súgókártya megjelenítése a chatben"],
      ],
    },
    standardConditions: {
      heading: "Szabványos állapotok (D&amp;D 5e)",
      colCondition: "Állapot",
    },
    customEffects: {
      heading: "Egyéni hatástípusok",
      colType: "Típus",
      colNotes: "Megjegyzések",
      rows: [
        [
          "🔮 Varázslat",
          "Nevesített varázslat-hatás követése — a varázslat neve bekérésre kerül",
        ],
        [
          "🎯 Képesség",
          "Nevesített osztály- vagy fajképesség követése — a képesség neve bekérésre kerül",
        ],
        [
          "🍀 Előny",
          "Az egyik tokenről a másikra adott előny rögzítése; az iniciativában a forrással csoportosítva",
        ],
        [
          "⬇️ Hátrány",
          "Kirótt hátrány rögzítése; az iniciativában a forrással csoportosítva",
        ],
        ["📝 Egyéb", "Szabad formátumú egyéni címke — leírás bekérésre kerül"],
      ],
    },
    durationOptions: {
      heading: "Időtartam-beállítások",
      intro:
        "A fennmaradó számláló a Turn Tracker pr oszlopában jelenik meg, és csökken, amikor a horgony token köre véget ér.",
      colOption: "Beállítás",
      colBehaviour: "Viselkedés",
      rows: [
        [
          "Eltávolításig",
          "Állandó — kézzel kell eltávolítani a menü vagy a --remove parancs segítségével",
        ],
        [
          "A célpont következő körének végén",
          "Lejár, amikor a célpont token következő köre véget ér az iniciativában",
        ],
        [
          "A forrás következő körének végén",
          "Lejár, amikor a forrás token következő köre véget ér az iniciativában",
        ],
        [
          "1 / 2 / 3 / 10 kör",
          "Rögzített visszaszámlálás; egy csökkentés a horgony token körének végén",
        ],
      ],
    },
    configuration: {
      heading: "Beállítások",
      intro:
        "Használja a !condition-tracker --config &lt;option&gt; &lt;value&gt; parancsot vagy a főmenü Beállítások gombját.",
      colOption: "Beállítás",
      colValues: "Értékek",
      colDesc: "Leírás",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Roll20 állapotjelölők alkalmazása tokenekre állapot hozzáadásakor",
        ],
        [
          "useIcons",
          "true / false",
          "Rövid ikonkódok megjelenítése (pl. [G]) emoji helyett a Turn Tracker sorokban",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Az opcionális alany-token lépés kihagyása Varázslat / Képesség / Egyéb hatásoknál",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "A figyelendő token sáv; ha 0-ra csökken, a GM felszólítást kap az állapotok rendezésére",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "A chat-üzenetek és a súgó-handout kimeneti nyelve",
        ],
        [
          "marker",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Egy adott állapot állapotjelölőjének felülírása (pl. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Alapértelmezett állapotjelölők",
      colCondition: "Állapot",
      colMarker: "Jelölő neve",
    },
    availableLocales: {
      heading: "Elérhető fordítások",
      intro:
        "Használja a language konfigurációs beállítást a chat-üzenetek és a súgó-handout bármely támogatott locale-re állításához. Rövid álnevek is elfogadottak en, zh és pt esetén.",
      colLocale: "Locale",
      colLanguage: "Nyelv",
      colFile: "Fordítási fájl",
    },
  },
};

export default TRANSLATION;
