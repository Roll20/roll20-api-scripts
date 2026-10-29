const TRANSLATION = {
  titles: {
    ready: 'Hexploration jest gotowy.',
    settings: 'Ustawienia Hexploration',
    languages: 'Wybierz język',
    pageSettings: 'Ustawienia strony: {page}',
    status: 'Stan Hexploration: {page}',
    help: 'Polecenia Hexploration',
    confirm: 'Proszę potwierdzić',
  },
  discovery: {
    title: 'Odkryto lokalizację',
  },
  menu: {
    draw: 'Rysowanie',
    reveal: 'Odkrywanie i ukrywanie',
    locations: 'Lokalizacje',
    tools: 'Narzędzia',
    layerInUse: 'Warstwa, na której rysowane są nowe heksy: {layer}.',
    pageSettingsHelp:
      'Te ustawienia dotyczą tylko tej strony. Ustawienia oznaczone ★ zastępują ustawienia globalne.',
  },
  buttons: {
    fill: 'Wypełnij',
    fillInverse: 'Odwrotne wypełnienie',
    undo: 'Cofnij wypełnienie',
    reveal: 'Odkryj',
    conceal: 'Zakryj',
    explore: 'Eksploruj',
    revealPage: 'Odkryj stronę',
    resetPage: 'Zresetuj stronę',
    mark: 'Oznacz lokalizację',
    unmark: 'Usuń oznaczenie',
    name: 'Nazwij heks',
    settings: 'Ustawienia',
    pageSettings: 'Ustawienia strony',
    status: 'Status',
    rescan: 'Skanuj ponownie',
    calibrate: 'Kalibruj',
    calibrateReset: 'Zresetuj kalibrację',
    help: 'Pomoc',
    change: 'Zmień',
    menu: 'Menu',
    clearOverrides: 'Usuń nadpisania',
    confirmReset: 'Tak, usuń wszystkie heksy',
  },
  prompts: {
    name: 'Nazwa lokalizacji (pozostaw puste, aby wyczyścić)',
  },
  values: {
    on: 'Włączone',
    off: 'Wyłączone',
    none: 'Brak',
    hexLayer: {
      auto: 'Auto (pierwszy plan, jeśli jest dostępny)',
      foreground: 'warstwa pierwszego planu',
      objects: 'warstwa żetonów',
    },
    revealBy: {
      players: 'Żetony graczy',
      characters: 'Żetony postaci',
      all: 'Wszystkie żetony',
    },
    revealMode: {
      clear: 'Usuwanie',
      glimpse: 'Przebłysk',
    },
    announce: {
      all: 'Wszyscy',
      gm: 'Tylko MG',
      off: 'Wyłączone',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Wypełnij',
      fillInverse: 'Odwrotne wypełnienie',
      conceal: 'Zakryj',
    },
  },
  settings: {
    language: {
      label: 'Język',
      desc: 'Język menu, komunikatów i materiałów informacyjnych.',
    },
    hexLayer: {
      label: 'Warstwa heksagonów',
      desc: 'Gdzie rysowane są nowe heksy. Auto próbuje warstwy pierwszego planu (nad żetonami), a jeśli gra jej nie obsługuje, używa warstwy żetonów.',
    },
    fillColor: {
      label: 'Kolor wypełnienia',
      desc: 'Kolor nowych heksów. Użyj rgba() dla przezroczystych heksów, na przykład rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Kolor obramowania',
      desc: 'Kolor konturu nowych heksów.',
    },
    labelColor: {
      label: 'Kolor etykiety',
      desc: 'Kolor etykiet z nazwami tylko dla GM na nazwanych heksach.',
    },
    glimpseColor: {
      label: 'Kolor przebłysku',
      desc: 'Kolor, jaki przyjmują heksy objęte przebłyskiem (tryb odkrywania Przebłysk). Użyj przezroczystego koloru rgba().',
    },
    strokeWidth: {
      label: 'Szerokość obramowania',
      desc: 'Szerokość konturu nowych heksów w pikselach (0 do 20).',
    },
    maxDistance: {
      label: 'Odległość odkrywania heksagonów',
      desc: 'Dotyczy to dobieranych heksów: żeton musi znajdować się w obrębie określonej liczby heksów, aby je odsłonić, bez względu na to, jak daleko sięga. Pozostaw puste bez ograniczeń.',
    },
    revealDistance: {
      label: 'Zasięg wzroku',
      desc: 'Ile heksów wokół poruszającego się żetonu zostało odkrytych (od 0 do 20). 0 ujawnia tylko heksy, przez które przechodzi żeton.',
    },
    lineOfSight: {
      label: 'Linia wzroku',
      desc: 'Kiedy jest włączone, heks jest odkrywany tylko wtedy, gdy pomiędzy nim a żetonem nie leży żaden zakryty heks.',
    },
    revealPath: {
      label: 'Odkrywaj wzdłuż ścieżki',
      desc: 'Kiedy jest włączone, odkrywane jest każde pole, przez które przechodzi żeton podczas przeciągania (w tym punkty orientacyjne), a nie tylko miejsce, w którym się zatrzymuje.',
    },
    revealBy: {
      label: 'Żetony odkrywające',
      desc: 'Które żetony na warstwie żetonów odsłaniają heksy: żetony kontrolowane przez gracza, żetony reprezentujące dowolną postać lub każdy żeton.',
    },
    revealMode: {
      label: 'Tryb odkrywania',
      desc: 'Usuwanie usuwa heksy w zasięgu wzroku. Przebłysk zamiast tego czyni je przezroczystymi; są usuwane, gdy wejdzie na nie żeton.',
    },
    announce: {
      label: 'Ogłaszaj odkrycia',
      desc: 'Kto widzi wiadomość na czacie po odkryciu nazwanej lokalizacji.',
    },
    pingDiscoveries: {
      label: 'Pinguj odkrycia',
      desc: 'Gdy ta opcja jest włączona, gracze są wysyłani sygnałem ping do nazwanej lokalizacji po jej wykryciu.',
    },
    hideCoveredTokens: {
      label: 'Ukrywaj zakryte żetony',
      desc: 'Roll20 rysuje nazwy, słupki i aury nad heksami. Kiedy jest włączone, żetony pod zakrytym heksem mają widoczną dla gracza nazwę, paski i aury wyłączone i włączane ponownie, gdy zostaną odkryte.',
    },
  },
  status: {
    engine: 'Silnik gry',
    grid: 'Siatka',
    layer: 'Warstwa heksagonów',
    hexes: 'Heksy',
    named: 'Nazwane heksy',
    icons: 'Żetony lokalizacji',
    glimpsed: 'Heksy w przebłysku',
    pending: 'Lokalizacje czekające na wypełnienie',
    calibrated: 'Skalibrowano',
    overrides: 'Nadpisania strony',
    undo: 'Można cofnąć',
  },
  messages: {
    filled:
      'Wypełnienie zakończone. Wylosowane heksy: {created}. Zmiana stylu: {restyled}. Ukryte lokalizacje: {icons}.',
    revealed: 'Ujawnione heksy: {count}.',
    revealedPage: 'Każdy odkryty heks na stronie ({count}).',
    confirmReset:
      'Usunąć wszystkie heksy z „{page}” ({count})? Żetony lokalizacji wracają na warstwę żetonów. Opcja Cofnij nie może tego odwrócić.',
    resetPage: 'Heksy usunięte ze strony: {count}.',
    undone:
      'Ostatnie wypełnienie nie zostało wykonane. Usunięte heksy: {removed}. Przywrócono nowe heksy: {restored}.',
    named: 'Heksy o nazwie „{name}”: {count}.',
    unnamed: 'Nazwy zostały usunięte: {count}.',
    marked:
      'Lokalizacje ukryte na istniejących heksach: {attached}. Czekam na następne wypełnienie, które je obejmuje: {pending}.',
    unmarked: 'Tokeny, które nie są już lokalizacjami: {count}.',
    settingChanged: '{setting} ustawiony na {value}.',
    rescanned:
      'Ponowne skanowanie zakończone. Zachowane: {kept}. Przyjęto: {adopted}. Zgłoszono ponownie: {moved}. Zaginione i zapomniane: {dropped}. Etykiety ponownie połączone: {labels}. Połączono ponownie tokeny lokalizacji: {icons}.',
    calibrated:
      'Skalibrowano siatkę (krok kolumny {colStep}px, krok wiersza {rowStep}px). Ponowne skanowanie: zachowane {kept}, ponownie złożone {moved}, przyjęte {adopted}.',
    calibrationReset:
      'Kalibracja usunięta. Ponowne skanowanie: zachowane {kept}, ponownie przesłane {moved}, przyjęte {adopted}.',
    journalRebuilt: 'Przebudowano materiały informacyjne „{help}” i „{deck}”.',
    migrated:
      'Twoje mapy heksowe z Hexploration 1.x zostały zaktualizowane. Jeśli ta gra została skopiowana z gry Legacy, uruchom „Skanuj ponownie” na każdej stronie z mapą heksową.',
    pruned:
      'Zapisane heksy, które już nie istnieją i zostały zapomniane: {dropped}. Jeśli ta gra lub strona została skopiowana, uruchom „Skanuj ponownie” na stronie, aby ponownie odnaleźć jej heksy.',
    readyHint:
      'Wpisz !hexploration, aby otworzyć menu, lub otwórz materiał informacyjny "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Ta gra nie obsługuje rysowania na warstwie pierwszego planu, więc heksy zostały narysowane na warstwie żetonów.',
    someFailed:
      'Heksy, których nie można narysować: {count}. Aby uzyskać szczegółowe informacje, sprawdź konsolę API.',
  },
  errors: {
    noPage: 'Nie udało się znaleźć strony, nad którą można pracować.',
    notHex: 'Ta strona nie używa siatki heksowej.',
    noPolygons: 'Wybierz jeden lub więcej narysowanych kształtów do wypełnienia.',
    emptyArea: 'Zaznaczony obszar nie zawiera żadnych środków heksów.',
    tooMany: 'Spowodowałoby to utworzenie zbyt wielu heksów za jednym razem ({count}).',
    nothingToConceal: 'Wybierz narysowane kształty lub żetony do ukrycia.',
    nothingToReveal: 'Wybierz heksy, narysowane kształty lub żetony do odsłonięcia.',
    noTokens: 'Najpierw wybierz jeden lub więcej tokenów.',
    noHexes: 'Najpierw wybierz jeden lub więcej heksów (lub żetonów stojących na heksach).',
    nothingToUndo: 'Nie ma wypełnienia, które można cofnąć.',
    unknownCommand: 'Nieznane polecenie: {command}',
    unknownSetting: 'Nieznane ustawienie: {key}',
    unknownPageSetting: 'Ustawienia, które można ustawić na stronie: {keys}',
    invalidValue: '„{value}” nie jest prawidłową wartością dla {key}.',
    calibrateNeedsTokens: 'Wybierz jeden lub dwa żetony przyciągnięte do środków heksów.',
    calibrateFailed: 'Tych tokenów nie można używać do kalibracji.',
    unexpected: 'Coś poszło nie tak: {message}',
  },
  hints: {
    noPage: 'Otwórz stronę, nad którą chcesz pracować, lub wybierz coś na niej.',
    notHex: 'Ustaw siatkę strony na Hex (V) lub Hex (H) w Ustawieniach strony.',
    noPolygons:
      'Narysuj wielokąt, prostokąt, elipsę lub odręczny kształt wokół obszaru, zaznacz go i spróbuj ponownie.',
    emptyArea: 'Narysuj większy kształt lub sprawdź ustawienia siatki strony.',
    tooMany: 'Wypełnij mniejszy obszar lub podziel obszar na kilka kształtów.',
    noHexes:
      'Heksy znajdują się na pierwszym planie lub w warstwie żetonów; przejdź do tej warstwy, aby je wybrać.',
    unknownCommand: 'Wpisz !hexploration help, aby wyświetlić listę poleceń.',
    unknownSetting: 'Wpisz !hexploration set, aby zobaczyć wszystkie ustawienia.',
    calibrateNeedsTokens:
      'Przyciągnij żeton do środka heksa i wybierz go. Wybierz drugi żeton przyciągnięty do sąsiedniego heksu w tym samym rzędzie (Hex V) lub kolumnie (Hex H), aby również skorygować rozmiar heksa.',
    calibrateFailed:
      'Dwa żetony muszą znajdować się w tym samym rzędzie (Hex V) lub w tej samej kolumnie (Hex H), w odległości co najmniej jednego heksa od siebie.',
    unexpected: 'Szczegóły znajdują się w dzienniku konsoli API.',
  },
  help: {
    menu: 'Pokaż menu.',
    fill: 'Zakryj wybrane narysowane kształty heksami.',
    fillInverse: 'Zakryj całą stronę z wyjątkiem wnętrza wybranych kształtów.',
    undo: 'Cofnij ostatnie wypełnienie, odwróć wypełnienie lub ukryj i przywróć używane kształty.',
    reveal: 'Odsłoń wybrane heksy oraz heksy pod wybranymi kształtami i żetonami.',
    revealPage: 'Odkryj każdy heks na stronie bez ogłoszeń.',
    conceal: 'Ponownie zakryj obszar pod wybranymi kształtami i żetonami heksami.',
    explore: 'Odsłoń wokół wybranych żetonów tak, jakby właśnie się tam przesunęły.',
    resetPage: 'Usuń wszystkie heksy na stronie (najpierw pyta).',
    name: 'Nazwij wybrane heksy lub heksy pod wybranymi żetonami. Pozostaw nazwę pustą, aby ją wyczyścić.',
    mark: 'Zamień wybrane żetony w ukryte lokalizacje.',
    unmark: 'Spraw, by zaznaczone żetony przestały być ukrytymi lokalizacjami.',
    set: 'Zmień ustawienie lub pokaż wszystkie ustawienia.',
    pageSet: 'Zastąp ustawienie odkrywania tylko na bieżącej stronie.',
    pageClear: 'Usuń zastąpienia bieżącej strony.',
    rescan: 'Odbuduj listę heksów strony, na przykład po skopiowaniu strony lub gry.',
    calibrate:
      'Wyrównaj siatkę heksów jednym lub dwoma wybranymi żetonami przyczepionymi do środków heksów.',
    calibrateReset: 'Usuń kalibrację bieżącej strony.',
    status: 'Pokaż, co Hexploration wie o bieżącej stronie.',
    journal: 'Odbuduj materiały informacyjne „Pomoc” i „Command Deck”.',
    help: 'Pokaż tę listę.',
    handout: 'Pełne instrukcje znajdują się w ulotce „{name}”.',
  },
  deck: {
    drawDesc:
      'Narysuj kształty wokół obszaru, zaznacz je, a następnie wypełnij. Cofnij odwraca ostatnie wypełnienie.',
    revealDesc:
      'Zaznacz heksy, kształty lub żetony, aby je odkryć lub ponownie zakryć. „Eksploruj” odkrywa okolicę zaznaczonych żetonów, jakby właśnie się przesunęły.',
    locationsDesc:
      'Wybierz żetony, aby ukryć je jako lokalizacje pod heksami. Wybierz heksy lub żetony, aby nazwać heks.',
    toolsDesc:
      'Ustawienia, nadpisania stron, status, ponowne skanowanie skopiowanych stron i kalibracja siatki.',
    footer: 'Pełne instrukcje znajdziesz w ulotce „{help}”.',
  },
  handout: {
    versionLabel: 'Wersja',
    subtitle: 'Eksploracja heks po heksie dla Roll20',
    footer:
      'Skorzystaj z materiałów informacyjnych „{deck}”, aby uzyskać informacje na temat elementów sterujących jednym kliknięciem.',
    overview: {
      heading: 'Przegląd',
      body: 'Heksploracja obejmuje mapę heksów nieprzezroczystymi heksami. Gdy drużyna się porusza, heksy, przez które przechodzi (oraz, jeśli wolisz, heksy wokół niej) są usuwane, więc mapa jest odkrywana heks po heksie. Ukryte lokalizacje można umieszczać pod heksami i ogłaszać je po ich znalezieniu. Działa w grach Jumpgate i Legacy, na siatkach Hex (V) i Hex (H) o dowolnym rozmiarze.',
      demo: 'Obejrzyj krótkie demo (od wersji 1)',
    },
    quickStart: {
      heading: 'Szybki start',
      steps: [
        'Otwórz stronę, której siatka jest ustawiona na Hex (V) lub Hex (H).',
        'Narysuj jeden lub więcej kształtów (wielokąt, prostokąt, elipsa lub odręcznie) wokół obszaru, który chcesz ukryć.',
        'Zaznacz kształty i kliknij „Wypełnij” w Command Deck (lub wpisz !hexploration fill). Kształty zostaną zastąpione heksami.',
        'Opcjonalnie: przed wypełnieniem zaznacz żetony ważnych miejsc i kliknij „Oznacz lokalizację”. Zostaną ukryte pod heksami i ogłoszone po odkryciu.',
        'Przesuń żeton gracza. Każdy heks, przez który przejdzie, oraz heksy w jego zasięgu wzroku (ustawienie „Zasięg wzroku”) zostaną odkryte.',
      ],
    },
    commands: {
      heading: 'Polecenia',
      intro:
        'Tylko MG mogą używać tych poleceń. Większość działa na wybrane obiekty; reszta działa na stronie, którą przeglądasz.',
      colCommand: 'Polecenie',
      colDesc: 'Co to robi',
    },
    revealing: {
      heading: 'Jak działa odkrywanie',
      points: [
        'Heksy odkrywają tylko żetony na warstwie żetonów. To, które żetony się liczą, określa ustawienie „Żetony odkrywające”: domyślnie żetony graczy, więc MG może przesuwać potwory bez odkrywania mapy.',
        'Żeton odkrywa każdy heks, który zajmuje (duże żetony zajmują kilka), a przy włączonej opcji „Odkrywaj wzdłuż ścieżki” także każdy heks na trasie, po której był przeciągany, łącznie z punktami pośrednimi.',
        '„Zasięg wzroku” odkrywa heksy wokół każdego z tych heksów. Gdy „Linia wzroku” jest włączona, heks zostaje odkryty tylko wtedy, gdy między nim a żetonem nie leży żaden zakryty heks.',
        '„Odległość odkrywania heksagonów” jest zapisywana na heksach w chwili ich rysowania. Takie heksy można odkryć tylko z odległości najwyżej tylu heksów, niezależnie od tego, jak daleko widzi żeton. Używaj jej dla gór lub lasów, które zasłaniają to, co jest za nimi.',
        'W trybie Przebłysk heksy w zasięgu wzroku stają się przezroczyste zamiast znikać i są usuwane, gdy wejdzie na nie żeton.',
        'Roll20 rysuje nazwy, paski i aury żetonów nad heksami. Przy włączonej opcji „Ukrywaj zakryte żetony” żeton pod zakrytym heksem ma wyłączone widoczne dla graczy nazwę, paski i aury, dopóki nie zostanie odkryty, więc ukryte potwory się nie zdradzą. Jeśli włączysz któryś z tych elementów, gdy żeton jest zakryty, pozostanie on ukryty i zostanie włączony po odkryciu żetonu.',
        'API nie zgłasza ruchów wykonanych przez inne mody. Ruchy TokenMod są wychwytywane automatycznie; w przypadku innych modów zaznacz żetony i kliknij „Eksploruj” albo wywołaj Hexploration.revealAround(token) z własnego moda.',
      ],
    },
    locations: {
      heading: 'Nazwane heksy i lokalizacje',
      points: [
        'Oznacz lokalizację zamienia wybrane żetony w ukryte lokalizacje. Żeton znajdujący się już pod heksem jest natychmiast ukrywany; w przeciwnym razie zostanie ukryty przez następne wypełnienie, które je zakrywa.',
        'Żetony ze znacznikiem stanu białej wieży są również traktowane jako lokalizacje podczas zapełniania, tak jak w wersji 1.',
        'Żetony ukrytych lokalizacji są przenoszone na warstwę GM. Kiedy ich heks zostanie odkryty, wracają na warstwę żetonów z pokazaną nazwą i ogłaszają swoje odkrycie.',
        '„Nazwij heks” nadaje heksowi nazwę bez żetonu. Nazwa jest pokazywana MG jako etykieta na warstwie MG i ogłaszana, gdy heks zostanie odkryty.',
        '„Ogłaszaj odkrycia” określa, czy ogłoszenie widzą wszyscy, tylko MG, czy nikt. „Pinguj odkrycia” dodatkowo przenosi widok graczy na lokalizację.',
      ],
    },
    settings: {
      heading: 'Ustawienia',
      intro:
        'Zmieniaj ustawienia poleceniem !hexploration set (lub przyciskiem Ustawienia). „Warstwa heksagonów”, „Żetony odkrywające” i „Język” można też ustawić na stronie ustawień moda.',
      colKey: 'Klucz',
      colName: 'Ustawienie',
      colDesc: 'Opis',
      perPage: '(Można ustawić na stronę.)',
    },
    jumpgate: {
      heading: 'Jumpgate i Dziedzictwo',
      points: [
        'Heexploration sprawdza, z jakiego silnika korzysta gra, i rysuje odpowiedni kształt. Kształty narysowane w dowolnym edytorze można wypełnić.',
        'Gdy „Warstwa heksagonów” jest ustawiona na Auto, heksy są rysowane na warstwie pierwszego planu, nad żetonami, więc gracze nie widzą, co jest pod spodem. Jeśli warstwa pierwszego planu jest niedostępna, używana jest warstwa żetonów.',
        'Jumpgate rysuje matematycznie regularne heksy, które mają nieco inny kształt niż heksy Legacy. Jeśli heksy nie pokrywają się z siatką strony, przyciągnij żeton do środka heksu, zaznacz go i kliknij „Kalibruj”. Zaznacz dwa żetony na sąsiednich heksach tego samego rzędu (Hex V) lub kolumny (Hex H), aby skorygować także rozmiar heksu.',
        'Po skopiowaniu strony lub gry jej heksy otrzymują nowe identyfikatory. Uruchom „Skanuj ponownie” na stronie, aby ponownie je odnaleźć wraz z etykietami nazw i żetonami lokalizacji.',
      ],
    },
    upgrading: {
      heading: 'Aktualizacja z wersji 1',
      points: [
        'Wersja 2 nie potrzebuje już PathMath, MatrixMath, Vector Math ani HTML Builder. Możesz je usunąć, chyba że użyje ich inny mod.',
        'Istniejące mapy heksów, nazwy, tokeny lokalizacji i ustawienia są aktualizowane automatycznie przy pierwszym uruchomieniu.',
        'Polecenia wersji 1, w tym makro Hexploration_menu, nadal działają.',
        'W wersji 1 heksy mógł odkrywać każdy żeton reprezentujący postać. Aby zachować to zachowanie, ustaw „Żetony odkrywające” na „Żetony postaci”.',
      ],
      colV1: 'Polecenie wersji 1',
      colV2: 'Polecenie wersji 2',
    },
    troubleshooting: {
      heading: 'Rozwiązywanie problemów',
      points: [
        'Nic się nie dzieje, gdy żeton się porusza: sprawdź, czy żeton jest na warstwie żetonów i pasuje do ustawienia „Żetony odkrywające” oraz czy strona ma heksy (!hexploration status).',
        'Heksy są przesunięte względem siatki: użyj opcji Kalibruj, a następnie sprawdź za pomocą żetonu na kilku heksach na mapie.',
        'Heksy przestały się odkrywać po skopiowaniu strony lub gry: uruchom „Skanuj ponownie” na stronie.',
        '„Wypełnij” zgłasza, że obszar nie zawiera środków heksów: kształt musi zawierać środek co najmniej jednego heksu.',
        'W innych przypadkach sprawdź dziennik konsoli API i dołącz zawarte w nim komunikaty, prosząc o pomoc.',
      ],
    },
    languages: {
      heading: 'Języki',
      body: 'Wybierz język poleceniem !hexploration set language. Dostępne języki:',
      colLanguage: 'Język',
      colNative: 'Nazwa rodzima',
      colCode: 'Kod',
    },
    credits: {
      heading: 'Kredyty',
      original: 'Oryginalny mod autorstwa',
      maintainer: 'Wersja 2 obsługiwana przez',
      marketplace: 'Pakiety grafik Ady na Roll20 Marketplace',
      support:
        'Jeśli znajdziesz błąd lub masz pomysł, opublikuj post na forum Roll20 Mod lub otwórz problem w GitHub i dołącz wszelkie komunikaty z dziennika konsoli API.',
    },
  },
};

export default TRANSLATION;
