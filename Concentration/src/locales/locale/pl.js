const TRANSLATION = {
  titles: {
    ready: 'Koncentracja gotowa.',
    menu: 'Ustawienia stężenia',
    help: 'Polecenia koncentracji',
    status: 'Kto się koncentruje',
    advantage: 'Zaleta oszczędzania koncentracji',
    reset: 'Zresetuj koncentrację',
    concentration: 'Stężenie',
    save: 'Oszczędność koncentracji',
    check: 'Kontrola koncentracji',
  },
  messages: {
    migrated:
      'Aktualizacja z wersji 1.0. Twoje ustawienia i lista zalet zostały zachowane, a stare makra nadal działają.',
    reconciled:
      'Dogoniony z mapą: znaleziono koncentrację tokenów {added}, usunięto stare wpisy {dropped}.',
    readyHint:
      'Wpisz {command}, aby wyświetlić ustawienia, lub otwórz ulotkę dotyczącą talii poleceń.',
    settingChanged: '{setting} to teraz {value}.',
    confirmReset:
      'Przywrócić wszystkie ustawienia do wartości domyślnych i wyczyścić listę zalet? Znaczniki koncentracji na mapie pozostają.',
    reset: 'Ustawienia przywrócone do wartości domyślnych.',
    journal: 'Przebudowano materiały informacyjne: {help} i {deck}.',
  },
  notices: {
    started: '{name} koncentruje się teraz na {spell}.',
    startedNoSpell: '{name} jest teraz skoncentrowany.',
    switched: '{name} przestaje koncentrować się na {old} i koncentruje się teraz na {spell}.',
    switchedNoSpell: '{name} jest teraz skoncentrowany.',
    ended: '{name} nie koncentruje się już na {spell}.',
    endedNoSpell: '{name} nie jest już skoncentrowany.',
    lost: '{name} traci koncentrację na {spell}.',
    lostNoSpell: '{name} traci koncentrację.',
    kept: '{name} cały czas koncentruje się na {spell}.',
    keptNoSpell: '{name} ciągle się koncentruje.',
    zeroHp: '{name} spada do 0 punktów wytrzymałości i traci koncentrację na {spell}.',
    zeroHpNoSpell: '{name} spada do 0 punktów wytrzymałości i traci koncentrację.',
    checkNeeded: '{name} musi wykonać rzut obronny na Kondycję, aby zachować koncentrację: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Modyfikator',
    roll: 'Rolka',
    advantageRoll: '{first} i {second} (zaleta)',
    success: 'Sukces',
    failure: 'Awaria',
  },
  menu: {
    concentratingCount: 'Koncentruję się teraz: {count}',
    settings: 'Ustawienia',
    footer: 'Wpisz {command}, aby tu wrócić. Każdy przycisk znajduje się także w ulotce „{deck}”.',
  },
  status: {
    none: 'Nikt się nie koncentruje.',
  },
  advantage: {
    intro:
      'Postacie ustawione na Rzut na koncentrację oszczędzają z korzyścią, tak jak w przypadku atutu Wojenny Czarodziej. Dotyczy to automatycznych zapisów.',
    none: 'W tej grze nie ma żadnych postaci.',
  },
  buttons: {
    roll: 'Rolka',
    advantage: 'Korzyść',
    status: 'Status',
    advantageMenu: 'Menu korzyści',
    help: 'Pomoc',
    reset: 'Nastawić',
    confirmReset: 'Zresetuj ustawienia',
    end: 'Koniec',
    menu: 'Menu',
    concentrate: 'Skoncentruj się na…',
    toggle: 'Dźwignia kolankowa',
    journal: 'Odbuduj materiały informacyjne',
  },
  prompts: {
    spell: 'Zaklęcie',
  },
  values: {
    on: 'NA',
    off: 'Wyłączony',
    bar: 'Pasek {bar}',
    unnamed: 'Anonimowy',
    sendTo: {
      everyone: 'Wszyscy',
      character: 'Charakter',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Podstawowy',
      detailed: 'Szczegółowy',
    },
  },
  settings: {
    language: {
      label: 'Język',
      desc: 'Język wiadomości na czacie i materiałów informacyjnych.',
    },
    command: {
      label: 'Rozkaz',
      desc: 'Polecenie czatu bez znaku „!”. Makra w wersji 1.0 wykorzystują koncentrację.',
    },
    statusmarker: {
      label: 'Znacznik stanu',
      desc: 'Znacznik żetonowy pokazujący koncentrację. Można używać niestandardowych znaczników tokenów.',
    },
    bar: {
      label: 'Pasek HP',
      desc: 'Pasek żetonów przechowujący punkty wytrzymałości. Uszkodzenie go wymaga rzutu obronnego na koncentrację.',
    },
    send_reminder_to: {
      label: 'Wyślij przypomnienie do',
      desc: 'Kto widzi komunikaty o koncentracji i zapisuje: wszyscy, MG lub gracze postaci (MG otrzymuje kopię).',
    },
    auto_add_concentration_marker: {
      label: 'Automatyczne dodawanie połączenia Znacznik',
      desc: 'Dodaj znacznik, gdy zaklęcie koncentracji jest rzucane z arkusza.',
      hint: 'Arkusze D&D 5e 2014 (OGL) i 2024.',
    },
    auto_roll_save: {
      label: 'Automatyczne zapisywanie rolki',
      desc: 'Rzuć rzut obronny, gdy tylko żeton koncentracji otrzyma obrażenia. Gdy jest wyłączone, przypomnienie ma przyciski Roll i Advantage.',
    },
    show_roll_button: {
      label: 'Przycisk Rolki',
      desc: 'Dodaj przyciski Roll i Advantage do przypomnienia, gdy funkcja Auto Roll Save jest wyłączona.',
    },
    end_at_zero: {
      label: 'Zakończ przy 0 HP',
      desc: 'Zakończ koncentrację bez rzutu obronnego, gdy żeton spadnie do 0 punktów wytrzymałości.',
    },
    bonus_attribute: {
      label: 'Atrybut bonusowy',
      desc: 'Atrybut arkusza dodany do zapisów koncentracji. Constitution_save_mod działa na arkuszach D&D 5e 2014 i 2024.',
    },
    debug: {
      label: 'Tryb debugowania',
      desc: 'Napisz notatki na temat wykrywania pisowni i zapisów w konsoli API w celu uzyskania pomocy technicznej.',
    },
    support_mode: {
      label: 'Tryb wsparcia',
      desc: 'Ile zapisuje tryb debugowania: podstawowy (krótki) lub szczegółowy.',
    },
  },
  help: {
    menu: 'Bez zaznaczenia niczego (GM): otwórz ustawienia. Po wybraniu żetonów: koncentracja początkowa lub końcowa.',
    toggle:
      'Zacznij koncentrować się na zaklęciu z wybranymi żetonami. Nazwij inne zaklęcie do przełączenia; uruchom go ponownie, aby zakończyć.',
    end: 'Zakończ koncentrację dla wybranych tokenów.',
    status: 'Lista osób skoncentrowanych za pomocą przycisków Zakończ.',
    config: 'Zmień ustawienie, na przykład config auto_roll_save|false.',
    advantageMenu:
      'Wybierz, które postacie będą korzystniej rzucać rzutami obronnymi na koncentrację.',
    toggleAdvantage: 'Włącz lub wyłącz przewagę dla jednej postaci.',
    roll: 'Rzuć zapis za pomocą przycisku Rzut lub Przewaga przypomnienia.',
    journal: 'Odbuduj materiały informacyjne dotyczące talii pomocy i dowodzenia.',
    reset: 'Przywróć każde ustawienie do wartości domyślnych.',
    help: 'Pokaż tę listę.',
    footer:
      'Pełne instrukcje znajdują się w ulotce „{help}”; przyciski znajdują się w ulotce „{deck}”.',
    playerFooter: 'Najpierw wybierz swój token.',
  },
  errors: {
    noSelection: 'Najpierw wybierz token.',
    notYours: 'Możesz zmienić koncentrację tylko dla żetonów, które kontrolujesz.',
    gmOnly: 'Tylko MG może użyć tej komendy.',
    notConcentrating: 'Ten znak nie jest skoncentrowany.',
    unknownSetting: 'Nie ma ustawienia o nazwie „{key}”.',
    badSettingValue: '„{value}” nie jest prawidłową wartością dla {key}.',
    rollExpired: 'Ten przycisk wygasł.',
    unknownCharacter: 'Ta postać już nie istnieje.',
    internal: 'Coś poszło nie tak. Konsola API zawiera szczegółowe informacje.',
  },
  hints: {
    noSelection: 'Wybierz token rzucającego, a następnie uruchom komendę ponownie.',
    rollExpired: 'Przyciski działają raz na 10 minut. Ponownie zniszcz token, aby uzyskać nowy.',
    unknownSetting: 'Wpisz polecenie bez zaznaczenia niczego, aby zobaczyć ustawienia.',
  },
  warnings: {
    unknownMarker:
      'Znacznik stanu „{marker}” nie jest jednym ze znaczników tej gry. Wybierz inny w ustawieniach.',
  },
  deck: {
    subtitle: 'Pokład dowodzenia',
    selected: 'Wybrane tokeny',
    selectedDesc: 'Najpierw wybierz żeton rzucającego.',
    table: 'Stół',
    tableDesc: 'Zobacz, kto się koncentruje, a kto ma przewagę po swoich interwencjach.',
    tools: 'Narzędzia',
    toolsDesc: 'Ustawienia, lista poleceń i materiały informacyjne.',
    footer: 'Pełne instrukcje znajdują się w ulotce „{help}”.',
  },
  handout: {
    versionLabel: 'Wersja',
    subtitle: 'Znaczniki koncentracji, przypomnienia i zapisy dla D&D 5e',
    overview: {
      heading: 'Przegląd',
      body: 'Koncentracja rejestruje, kto koncentruje się na jakim zaklęciu. Umieszcza znacznik na żetonie rzucającego, rzuca (lub prosi) o rzut obronny na Kondycję, gdy ten żeton otrzyma obrażenia, i informuje stół o zakończeniu koncentracji.',
    },
    quickStart: {
      heading: 'Szybki start',
      steps: [
        'Wybierz żeton rzucającego i wpisz !concentration, a następnie zaklęcie, na przykład !concentration Bless.',
        'Zmień punkty wytrzymałości żetonu w bańce na pasku. Rzut obronny wynosi ST 10 lub połowę obrażeń, jeśli jest wyższa.',
        'Uruchom ponownie tę samą komendę lub zdejmij znacznik, aby zakończyć koncentrację.',
        'Wpisz !concentration bez zaznaczenia żadnej opcji, aby otworzyć ustawienia.',
      ],
    },
    concentrating: {
      heading: 'Koncentrując się',
      points: [
        'Nazwanie innego zaklęcia przełącza na nie koncentrację, tak jak robi to rzucenie nowego zaklęcia skupiającego.',
        'Ręczne umieszczenie znacznika na żetonie rozpoczyna koncentrację bez zaklęcia; jego zdjęcie lub usunięcie tokena kończy go.',
        'Nowy połączony żeton koncentrującej się postaci otrzymuje znacznik, a wklejony żeton niosący znacznik jest śledzony.',
        'Żetony jednej postaci z powiązanym paskiem punktów wytrzymałości mają wspólną koncentrację. Niepowiązane żetony, takie jak stado goblinów z jednego arkusza, skupiają się na sobie.',
        'Każdy widzi komunikat o rozpoczęciu, przełączeniu lub zakończeniu koncentracji, chyba że opcja Wyślij przypomnienie do mówi inaczej.',
      ],
    },
    saves: {
      heading: 'Koncentracja oszczędza',
      points: [
        'ST wynosi 10 lub połowę otrzymanych obrażeń, w zależności od tego, która wartość jest wyższa, aż do ST 30.',
        'Modyfikator pochodzi z Atrybutu Bonusowego na karcie postaci; brakująca wartość liczy się jako 0.',
        'Funkcja automatycznego zapisu rolki rzuca na raz. Gdy jest wyłączone, przypomnienie ma przyciski Rzut i Przewaga dla gracza lub MG.',
        'Nieudany zapis kończy koncentrację. Przy włączonej opcji End przy 0 HP, spadek do 0 punktów wytrzymałości kończy grę bez rzutu obronnego.',
        'Menu Przewagi zapewnia postaci przewagę przy automatycznych zapisach, tak jak ma to miejsce w przypadku atutu Wojennego Czarownika.',
      ],
    },
    automatic: {
      heading: 'Zaklęcia rzucane z prześcieradła',
      points: [
        'Z funkcją automatycznego dodawania. Znacznik włączony, rzucenie zaklęcia koncentracji z arkusza D&D 5e 2014 (OGL) lub 2024 dodaje znacznik.',
        'Żetony rzucającego na stronie, którą przegląda, są oznaczone; jeśli ich nie ma, to są to żetony na dowolnej stronie.',
        'Liczą się tylko karty od MG, innego Modu lub jednego z graczy postaci. Ponowne rzucenie tego samego zaklęcia nic nie zmienia.',
        'Karta D&D 2024, która w swoim tekście wspomina jedynie o koncentracji, np. atut Wojenny, może rozpocząć koncentrację, ale nigdy nie zastępuje zaklęcia.',
        'Arkusze D&D 2024 mogą wymagać serwera Experimental API. Włącz tryb debugowania, aby zobaczyć, dlaczego zaklęcie zostało wykryte lub nie.',
      ],
    },
    players: {
      heading: 'Gracze',
      points: [
        'Gracze mogą rozpoczynać i kończyć koncentrację dla kontrolowanych przez siebie żetonów oraz używać przycisków Rzut i Przewaga podczas własnych zapisów.',
        'Opcja Wyślij przypomnienie Aby ustawić postać, wiadomości będą szeptane do graczy danej postaci i do MG.',
      ],
    },
    commands: {
      heading: 'Polecenia',
      intro: 'Inne mody, takie jak ScriptCards, również mogą wysyłać te polecenia.',
      colCommand: 'Rozkaz',
      colDesc: 'Co to robi',
    },
    settings: {
      heading: 'Ustawienia',
      intro:
        'Zmień ustawienia za pomocą przycisków na karcie ustawień lub za pomocą konfiguracji <klucz>|<wartość>. Niektóre można również ustawić na stronie moda.',
      colKey: 'Klawisz',
      colName: 'Nazwa',
      colDesc: 'Co to robi',
    },
    upgrading: {
      heading: 'Aktualizacja z wersji 1.0',
      points: [
        'Ustawienia, lista zalet i każde polecenie działają.',
        'Wiadomości mówią teraz, kiedy kończy się koncentracja i na którym zaklęciu.',
        'Tokeny, które już noszą znacznik, są odbierane podczas uruchamiania.',
      ],
    },
    troubleshooting: {
      heading: 'Rozwiązywanie problemów',
      points: [
        'Brak zapisu po spadku punktów wytrzymałości: sprawdź, czy żeton ma znacznik i czy pasek HP to pasek, który zmieniłeś. Zmiany dokonane przez innych Modów za pośrednictwem API nie wywołują zdarzeń, więc nie są widoczne.',
        'Modyfikator wynosi 0: sprawdź atrybut bonusowy na karcie postaci.',
        'Czary rzucane z arkusza nie są wykrywane: włącz tryb debugowania, rzuć zaklęcie ponownie i przeczytaj konsolę API.',
        'Dwie postacie mają wspólną nazwę: wykrywanie wykorzystuje pierwsze dopasowanie. Nadaj postaciom unikalne imiona.',
      ],
    },
    languages: {
      heading: 'Języki',
      body: 'Koncentracja została przetłumaczona na poniższe języki. Wybierz ten z ustawieniem Język.',
      colCode: 'Kod',
      colName: 'Język',
      colNative: 'Imię rodzime',
    },
    credits: {
      heading: 'Kredyty',
      original: 'Oryginalny mod autorstwa',
      maintainer: 'Utrzymywany przez',
      support: 'Zgłaszaj błędy i pomysły na forum Roll20 Mod lub na GitHubie.',
    },
    footer: 'Przyciski dla każdej akcji znajdują się w ulotce „{deck}”.',
  },
};

export default TRANSLATION;
