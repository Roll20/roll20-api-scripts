const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "pochwycony",
      verb: "chwyta",
    },
    Restrained: {
      past: "unieruchomiony",
      verb: "unieruchamia",
    },
    Prone: {
      past: "powalony",
      verb: "powala",
    },
    Poisoned: {
      past: "zatruty",
      verb: "zatruwa",
    },
    Stunned: {
      past: "ogłuszony",
      verb: "ogłusza",
    },
    Blinded: {
      past: "oślepiony",
      verb: "oślepia",
    },
    Charmed: {
      past: "zauroczony",
      verb: "zaurocza",
    },
    Frightened: {
      past: "przestraszony",
      verb: "przeraża",
    },
    Incapacitated: {
      past: "ubezwłasnowolniony",
      verb: "ubezwłasnowalnia",
    },
    Invisible: {
      past: "niewidzialny",
      verb: "czyni",
      suffix: "niewidzialnym",
    },
    Paralyzed: {
      past: "sparaliżowany",
      verb: "paraliżuje",
    },
    Petrified: {
      past: "skamieniały",
      verb: "zamienia w kamień",
    },
    Unconscious: {
      past: "nieprzytomny",
      verb: "pozbawia przytomności",
    },
    Spell: {
      past: "pod wpływem zaklęcia",
      verb: "rzuca zaklęcie na",
    },
    Ability: {
      past: "pod wpływem zdolności",
      verb: "używa zdolności na",
    },
    Advantage: {
      past: "ma ułatwienie",
      verb: "daje ułatwienie",
      noBy: true,
    },
    Disadvantage: {
      past: "ma utrudnienie",
      verb: "daje utrudnienie",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Pochwycony",
    Restrained: "Unieruchomiony",
    Prone: "Powalony",
    Poisoned: "Zatruty",
    Stunned: "Ogłuszony",
    Blinded: "Oślepiony",
    Charmed: "Zauroczony",
    Frightened: "Przestraszony",
    Incapacitated: "Ubezwłasnowolniony",
    Invisible: "Niewidzialny",
    Paralyzed: "Sparaliżowany",
    Petrified: "Skamieniały",
    Unconscious: "Nieprzytomny",
    Spell: "Zaklęcie",
    Ability: "Zdolność",
    Advantage: "Ułatwienie",
    Disadvantage: "Utrudnienie",
    Other: "Inne",
  },
  templates: {
    display: {
      custom: "{emoji} {target} pod wpływem {effect} ({source})",
      advantage: "{emoji} {source} ma ułatwienie przeciwko {target}{subject}",
      disadvantage:
        "{emoji} {source} ma utrudnienie przeciwko {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} jest {past}",
      standard: "{emoji} {target} {past} przez {source}",
    },
    apply: {
      custom: "{source} nakłada {effect} na {target}.",
      advantage: "{source} ma ułatwienie przeciwko {target}{subject}.",
      disadvantage: "{source} ma utrudnienie przeciwko {target}{subject}.",
      self: "{target} jest {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} nie jest już pod wpływem {effect}.",
      advantage: "{source} nie ma już ułatwienia przeciwko {target}{subject}.",
      disadvantage:
        "{source} nie ma już utrudnienia przeciwko {target}{subject}.",
      noBy: "{target} nie jest już {past}.",
      self: "{target} nie jest już {past}.",
      standard: "{target} nie jest już {past} przez {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Wybierz stan",
      selectSource: "Wybierz żeton źródła",
      selectTarget: "Wybierz żeton celu",
      selectSubject: "Wybierz podmiot",
      selectDuration: "Wybierz czas trwania",
      confirmTargetTitle: "Potwierdź listę celów",
      applyEffectTitle: "Zastosuj efekt {condition}",
      noTokens: "Nie znaleziono nazwanych żetonów na aktywnej stronie.",
      confirmIntro: "Następujące żetony otrzymają stan:",
      confirmBtn: "Potwierdź listę celów",
      enterDetails: "Wprowadź szczegóły efektu",
      noneBtn: "Żaden",
      noneOrSourceBtn: "Żaden lub zastosuj do źródła",
      subjectDesc: "Wybierz, kto lub co wywołuje efekt.",
      sourceDesc:
        "Wybierz stworzenie, które tworzy lub generuje stan albo efekt.",
      targetDesc: "Wybierz stworzenie, które otrzyma stan lub efekt.",
      otherText: "Własny tekst stanu",
      effectDetails: "Szczegóły {condition}",
    },
    col: {
      players: "Gracze",
      npcs: "BN",
      conditions: "Stany",
      customEffects: "Własne efekty",
      permanentTurnEnd: "Trwały / Koniec tury",
      rounds: "Rundy",
      command: "Polecenie",
      result: "Wynik",
      field: "Pole",
      value: "Wartość",
      option: "Opcja",
      condition: "Stan",
      marker: "Znacznik",
      item: "Element",
      removed: "Usunięto",
      details: "Szczegóły",
      description: "Opis",
      scenario: "Scenariusz",
    },
    dur: {
      untilRemoved: "Do usunięcia",
      endOfTargetTurn: "Koniec następnej tury celu",
      endOfSourceTurn: "Koniec następnej tury źródła",
      round1: "1 runda",
      round2: "2 rundy",
      round3: "3 rundy",
      round10: "10 rund",
      custom: "Własny",
      customPrompt: "Liczba rund",
      untilRemovedDisplay: "Do usunięcia",
      turnsRemaining: "Pozostało {n} koniec (końców) tury",
    },
    btn: {
      openWizard: "Otwórz kreator",
      openMultiTarget: "Otwórz kreator wielu celów",
      openRemovalList: "Otwórz listę usuwania",
      showConfig: "Pokaż konfigurację",
      runCleanup: "Uruchom czyszczenie",
      reinstallMacro: "Zainstaluj ponownie makro",
      reinstallHandout: "Zainstaluj ponownie handout",
      showHelp: "Pokaż pomoc",
      reorderConditions: "Zmień kolejność wierszy stanów",
    },
    title: {
      menu: "Menu",
      removalMenu: "Usuwanie stanów",
      config: "Konfiguracja",
      configTracker: "Konfiguracja Condition Trackera",
      help: "Pomoc",
      applied: "Zastosowano",
      removed: "Stan usunięty",
      cleanup: "Czyszczenie zakończone",
      macroReinstalled: "Makro zainstalowane ponownie",
      handoutReinstalled: "Handout zainstalowany ponownie",
      warning: "Ostrzeżenie",
      error: "Błąd",
      turnOrder: "Kolejność tur",
      noConditions: "Brak stanów",
      tokenMoved: "Żeton przeniesiony",
      markedDead: "Oznaczony jako martwy",
      zeroHp: "{name} — 0 PŻ",
      moveToken: "{name} — Przenieść żeton?",
      scriptReady: "Skrypt gotowy",
      conditionReorder: "Kolejność tur zmieniona",
    },
    heading: {
      quickActions: "Szybkie akcje",
      settings: "Ustawienia",
      markerMappings: "Mapowania znaczników",
      result: "Wynik",
      info: "Informacje",
      commandOptions: "Opcje poleceń",
      promptUi: "Interfejs kreatora",
      examples: "Przykłady",
      summary: "Podsumowanie",
    },
    msg: {
      noActive: "Nie są śledzone żadne aktywne stany.",
      configReset: "Konfiguracja zresetowana do domyślnych wartości modułu.",
      unknownConfig:
        "Nieznana opcja konfiguracji. Użyj --config, aby wyświetlić obsługiwane ustawienia.",
      macroReinstalled:
        "Makra {wizard} i {multiTarget} zostały ponownie zainstalowane dla wszystkich obecnych graczy z rolą MG.",
      handoutReinstalled:
        "Handout pomocy {handout} został ponownie zainstalowany.",
      duplicate:
        "Ta dokładna kombinacja źródła, podmiotu, celu, stanu i własnego tekstu jest już aktywna.",
      noTargets: "Nie podano żetonów celu dla zastosowania wielu celów.",
      noSelection:
        "Wybierz przynajmniej jeden żeton na planszy przed użyciem --multi-target.",
      invalidIds:
        "Nie znaleziono prawidłowych identyfikatorów żetonów w bieżącym zaznaczeniu.",
      reSelectTokens:
        "Żaden z pierwotnie wybranych żetonów nie mógł zostać znaleziony. Wybierz żetony ponownie i spróbuj jeszcze raz.",
      conditionNotFound: "Nie znaleziono identyfikatora stanu.",
      gmOnly: "Polecenia Condition Trackera są dostępne tylko dla MG.",
      commandFailed:
        "Polecenia nie można było bezpiecznie wykonać. Sprawdź konsolę API.",
      sourceTokenNotFound: "Nie można było znaleźć żetonu źródła.",
      targetTokenNotFound: "Nie można było znaleźć żetonu celu.",
      subjectTokenNotFound: "Nie można było znaleźć żetonu podmiotu.",
      invalidCondition:
        "Stan musi być jednym ze wstępnie zdefiniowanych stanów lub Inne.",
      subjectOnlyCustom:
        "--subject jest prawidłowy tylko dla Zaklęcia, Zdolności, Ułatwienia, Utrudnienia i Innego.",
      subjectBypassInvalid:
        "--subjectPromptBypass oczekuje wartości true lub false, gdy wartość jest podana.",
      customDetailsRequired:
        "Szczegóły {condition} są wymagane. Użyj --other, aby je podać.",
      markerConfigFormat:
        "Format konfiguracji znacznika: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Konfiguracja znacznika wymaga wstępnie zdefiniowanej nazwy stanu.",
      markerNameRequired:
        "Konfiguracja znacznika wymaga niepustej nazwy znacznika.",
      markerSet: "Znacznik {condition} ustawiony na {marker}.",
      healthBarSet: "Pasek zdrowia ustawiony na {bar}.",
      boolSet: "{key} ustawione na {value}.",
      expectedBoolean: "Oczekiwano true lub false.",
      invalidHealthBar:
        "Pasek zdrowia musi być bar1_value, bar2_value lub bar3_value.",
      markersDisabled: "Znaczniki są wyłączone.",
      noMarkerConfigured:
        "Dla tego stanu nie skonfigurowano żadnego znacznika.",
      markerApplied: "Znacznik zastosowany: {marker}",
      markerPresent: "Znacznik już obecny: {marker}",
      langSet: "Język ustawiony na {locale}.",
      invalidLocale: "Nieprawidłowy język. Obsługiwane języki: {locales}.",
      otherDurationRequiresRounds:
        "Czas trwania Inne wymaga numerycznej liczby rund, na przykład --duration 5 rounds.",
      invalidDuration:
        "Czas trwania musi być Do usunięcia, opcją końca tury lub dodatnią liczbą rund.",
      zeroHpNoConditions: "{name} osiągnął 0 PŻ i nie ma aktywnych stanów.",
      zeroHpConditions: "{name} osiągnął 0 PŻ. Wybierz stany do usunięcia:",
      removeAllBtn: "Usuń wszystkie stany dla {name}",
      markIncapacitated: "Oznacz jako ubezwłasnowolnionego",
      removeFromTurnOrder: "Usuń z kolejności tur",
      alreadyIncapacitated: "{name} jest już ubezwłasnowolniony.",
      tokenRemovedFromTurn: "{name} został usunięty z kolejności tur.",
      tokenNotInTurn: "{name} nie został znaleziony w kolejności tur.",
      moveTokenPrompt:
        "Przenieść {name} na warstwę mapy, żeby pozostał widoczny, ale nie przeszkadzał innym żetonom?",
      moveTokenBtn: "Przenieś {name} na warstwę mapy",
      tokenMoved: "{name} został przeniesiony na warstwę mapy.",
      tokenNotFound: "Nie znaleziono żetonu.",
      noActiveConditions: "{name} nie ma aktywnych stanów do usunięcia.",
      deadNoConditions:
        "{name} został oznaczony jako martwy. Nie było aktywnych stanów.",
      scriptReady: "{name} jest aktywny i używasz wersji {version}.",
      reachedZeroHp: "{name} osiągnął 0 PŻ",
      manuallyRemoved: "zostało ręcznie usunięte",
      durationExpired: "czas trwania wygasł",
      markedAsDead: "{name} został oznaczony jako martwy",
      conditionReorder:
        "Kolejność tur zmieniła się i {count} śledzony (śledzonych) wiersz stanów może być teraz poza kolejnością. Kliknij poniżej, aby przywrócić je po przypisanych żetonach.",
      conditionsReordered:
        "Wiersze stanów zostały przesunięte po ich przypisanych żetonach.",
    },
    removal: {
      conditionField: "Stan",
      reasonField: "Powód",
      turnRowField: "Wiersz śledzenia tur",
      markerField: "Znacznik",
      notConfigured: "Nie skonfigurowano",
      markerRemoved: "Usunięto ({marker})",
      markerRetained: "Zachowano ({marker})",
      rowRemoved: "Usunięto",
      rowMissing: "Już brakuje",
      manualReason: "Ręczne usunięcie",
    },
    cleanup: {
      orphaned: "Osierocone wpisy stanów",
      stale: "Przestarzałe wpisy stanów",
      orphanedRows: "Osierocone wiersze śledzenia tur",
      unusedMarkers: "Nieużywane znaczniki",
    },
    apply: {
      turnAppended:
        "Cel nie był w kolejności tur; wiersz stanu został dołączony na końcu.",
      turnInserted: "Wiersz stanu wstawiony poniżej żetonu celu.",
    },
  },
  handout: {
    versionLabel: "Wersja",
    subtitle: "Menedżer efektów statusu D&D 5e",
    footerNote:
      "Ten handout jest automatycznie tworzony i aktualizowany przy każdym załadowaniu skryptu.",
    overview: {
      heading: "Przegląd",
      body: "Condition Tracker zarządza stanami D&D 5e i własnymi efektami jako oznaczonymi wierszami w Śledzoniku Tur Roll20. Stosuj stany do żetonów, śledź czas trwania według kolejności inicjatywy i automatycznie usuwaj wygasłe efekty na końcu tury. Wszystkie polecenia są dostępne tylko dla MG i można je uruchamiać z czatu lub za pomocą zainstalowanych makr.",
    },
    quickStart: {
      heading: "Szybki start",
      colCommand: "Polecenie",
      colDesc: "Opis",
      rows: [
        [
          "!condition-tracker --prompt",
          "Kreator krok po kroku — interaktywnie wybierz stan, żetony i czas trwania. Dostępny również jako makro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Zastosuj jeden stan do kilku żetonów jednocześnie. Dostępny również jako makro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Otwórz główne menu zarządzania z przyciskami do stosowania, przeglądania lub usuwania stanów.",
        ],
      ],
    },
    commandsRef: {
      heading: "Dokumentacja poleceń",
      colFlag: "Flaga",
      colDesc: "Opis",
      rows: [
        ["--prompt", "Interaktywny kreator krok po kroku"],
        ["--multi-target", "Zastosuj stan do wielu żetonów celu naraz"],
        ["--menu", "Pokaż główne menu (dodaj remove dla menu usuwania)"],
        [
          "--source X --target Y --condition Z",
          "Zastosuj stan bezpośrednio bez kreatora",
        ],
        [
          "--duration &lt;wartość&gt;",
          "Czas trwania dla bezpośredniego zastosowania (np. 2 rounds)",
        ],
        [
          "--other &lt;tekst&gt;",
          "Własny tekst dla typów efektów Zaklęcie / Zdolność / Inne",
        ],
        [
          "--remove &lt;ID stanu&gt;",
          "Usuń konkretny stan według jego unikalnego identyfikatora",
        ],
        [
          "--config &lt;opcja&gt; &lt;wartość&gt;",
          "Dostosuj ustawienia konfiguracji (patrz sekcja Konfiguracja poniżej)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Nadpisz subjectPromptBypass tylko dla tego polecenia (obsługuje również --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Uzgodnij stan — usuń osierocone stany i wiersze Śledzika Tur",
        ],
        [
          "--reorder-conditions",
          "Ręcznie przenieść wiersze warunków za przypisane tokeny w kolejności tur",
        ],
        ["--reinstall-macro", "Utwórz ponownie lub zaktualizuj makra MG"],
        [
          "--reinstall-handout",
          "Utwórz ponownie lub zaktualizuj zlokalizowany handout pomocy",
        ],
        [
          "--lang &lt;język&gt;",
          "Wyświetl wiadomości tego polecenia w dodatkowym języku (tryb dwujęzyczny)",
        ],
        ["--help", "Pokaż krótką kartę pomocy w czacie"],
      ],
    },
    standardConditions: {
      heading: "Standardowe stany (D&amp;D 5e)",
      colCondition: "Stan",
    },
    customEffects: {
      heading: "Własne typy efektów",
      colType: "Typ",
      colNotes: "Uwagi",
      rows: [
        [
          "🔮 Zaklęcie",
          "Śledź nazwany efekt zaklęcia — zostaniesz poproszony o podanie nazwy zaklęcia",
        ],
        [
          "🎯 Zdolność",
          "Śledź nazwaną zdolność klasy lub rasy — zostaniesz poproszony o podanie nazwy",
        ],
        [
          "🍀 Ułatwienie",
          "Zapisz ułatwienie przyznane od jednego żetonu drugiemu; zgrupowane ze źródłem w inicjatywie",
        ],
        [
          "⬇️ Utrudnienie",
          "Zapisz nałożone utrudnienie; zgrupowane ze źródłem w inicjatywie",
        ],
        [
          "📝 Inne",
          "Dowolna własna etykieta — zostaniesz poproszony o podanie opisu",
        ],
      ],
    },
    durationOptions: {
      heading: "Opcje czasu trwania",
      intro:
        "Pozostała liczba jest wyświetlana w kolumnie pr Śledzika Tur i zmniejsza się, gdy kończy się tura żetonu kotwicy.",
      colOption: "Opcja",
      colBehaviour: "Zachowanie",
      rows: [
        [
          "Do usunięcia",
          "Trwały — musi być usunięty ręcznie przez menu lub --remove",
        ],
        [
          "Koniec następnej tury celu",
          "Wygasa gdy kończy się następna tura żetonu celu w inicjatywie",
        ],
        [
          "Koniec następnej tury źródła",
          "Wygasa gdy kończy się następna tura żetonu źródła w inicjatywie",
        ],
        [
          "1 / 2 / 3 / 10 rund",
          "Stały odliczanie; jedno zmniejszenie na koniec tury żetonu kotwicy",
        ],
      ],
    },
    configuration: {
      heading: "Konfiguracja",
      intro:
        "Użyj !condition-tracker --config &lt;opcja&gt; &lt;wartość&gt; lub przycisku Konfiguracja w głównym menu.",
      colOption: "Opcja",
      colValues: "Wartości",
      colDesc: "Opis",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Zastosuj znaczniki statusu Roll20 do żetonów przy dodawaniu stanu",
        ],
        [
          "useIcons",
          "true / false",
          "Pokaż krótkie kody ikon (np. [G]) zamiast emoji w wierszach Śledzika Tur",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Pomiń opcjonalny krok wyboru podmiotu dla efektów Zaklęcie / Zdolność / Inne",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Pasek do obserwacji; gdy spadnie do 0, MG jest proszony o wyczyszczenie stanów",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Język wyjściowy dla wiadomości czatu i handoutu pomocy",
        ],
        [
          "marker",
          "&lt;Stan&gt;=&lt;nazwa znacznika&gt;",
          "Nadpisz znacznik statusu używany dla konkretnego stanu (np. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Domyślne znaczniki statusu",
      colCondition: "Stan",
      colMarker: "Nazwa znacznika",
    },
    availableLocales: {
      heading: "Dostępne tłumaczenia",
      intro:
        "Użyj opcji konfiguracji języka, aby ustawić wiadomości czatu i handout pomocy na dowolny obsługiwany język. Krótkie aliasy są również akceptowane dla en, zh i pt.",
      colLocale: "Locale",
      colLanguage: "Język",
      colFile: "Plik tłumaczenia",
    },
  },
};

export default TRANSLATION;
