const TRANSLATION = {
  titles: {
    ready: 'Heksploracja jest gotowa.',
    settings: 'Ustawienia Heksploracji',
    languages: 'Wybierz język',
    pageSettings: 'Ustawienia strony: {page}',
    status: 'Stan heksploracji: {page}',
    help: 'Komendy Heksploracji',
    confirm: 'Proszę potwierdzić',
  },
  discovery: {
    title: 'Lokalizacja odkryta',
  },
  menu: {
    draw: 'Rysować',
    reveal: 'Odkryj i ukryj',
    locations: 'Lokalizacje',
    tools: 'Narzędzia',
    layerInUse: 'Nowe heksy są rysowane na {layer}.',
    pageSettingsHelp:
      'Te ustawienia dotyczą tylko tej strony. Ustawienia oznaczone ★ zastępują ustawienia globalne.',
  },
  buttons: {
    fill: 'Wypełnić',
    fillInverse: 'Odwrotne wypełnienie',
    undo: 'Cofnij wypełnienie',
    reveal: 'Ujawnić',
    conceal: 'Ukryć',
    explore: 'Badać',
    revealPage: 'Odkryj stronę',
    resetPage: 'Zresetuj stronę',
    mark: 'Zaznacz lokalizację',
    unmark: 'Odznacz',
    name: 'Imię Hex',
    settings: 'Ustawienia',
    pageSettings: 'Ustawienia strony',
    status: 'Status',
    rescan: 'Skanuj ponownie',
    calibrate: 'Kalibrować',
    calibrateReset: 'Zresetuj kalibrację',
    help: 'Pomoc',
    change: 'Zmiana',
    menu: 'Menu',
    clearOverrides: 'Wyczyść zastąpienia',
    confirmReset: 'Tak, usuń wszystkie heksy',
  },
  prompts: {
    name: 'Nazwa lokalizacji (pozostaw puste, aby wyczyścić)',
  },
  values: {
    on: 'NA',
    off: 'Wyłączony',
    none: 'Nic',
    hexLayer: {
      auto: 'Auto (pierwszy plan, jeśli jest dostępny)',
      foreground: 'warstwa pierwszego planu',
      objects: 'warstwa tokenów',
    },
    revealBy: {
      players: 'Żetony graczy',
      characters: 'Żetony postaci',
      all: 'Wszystkie tokeny',
    },
    revealMode: {
      clear: 'Jasne',
      glimpse: 'Dojrzeć',
    },
    announce: {
      all: 'Wszyscy',
      gm: "Tylko GM'a",
      off: 'Wyłączony',
    },
    orientation: {
      vertical: 'Sześciokąt (V)',
      horizontal: 'Sześciokąt (H)',
    },
    fillKind: {
      fill: 'Wypełnić',
      fillInverse: 'Odwrotne wypełnienie',
      conceal: 'Ukryć',
    },
  },
  settings: {
    language: {
      label: 'Język',
      desc: 'Język menu, komunikatów i materiałów informacyjnych.',
    },
    hexLayer: {
      label: 'Warstwa szesnastkowa',
      desc: 'Gdzie rysowane są nowe heksy. Automatycznie próbuje warstwy pierwszego planu (nad tokenami) i wraca do warstwy tokenów, jeśli gra jej nie obsługuje.',
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
      desc: 'Kolor heksów zmienia się na po dostrzeżeniu (tryb ujawnienia przez spojrzenie). Użyj przezroczystego koloru rgba().',
    },
    strokeWidth: {
      label: 'Szerokość obramowania',
      desc: 'Szerokość konturu nowych heksów w pikselach (0 do 20).',
    },
    maxDistance: {
      label: 'Odległość ujawnienia heksadecymalnego',
      desc: 'Dotyczy to dobieranych heksów: żeton musi znajdować się w obrębie określonej liczby heksów, aby je odsłonić, bez względu na to, jak daleko sięga. Pozostaw puste bez ograniczeń.',
    },
    revealDistance: {
      label: 'Odległość wzroku',
      desc: 'Ile heksów wokół poruszającego się żetonu zostało odkrytych (od 0 do 20). 0 ujawnia tylko heksy, przez które przechodzi żeton.',
    },
    lineOfSight: {
      label: 'Linia wzroku',
      desc: 'Kiedy jest włączone, heks jest odkrywany tylko wtedy, gdy pomiędzy nim a żetonem nie leży żaden zakryty heks.',
    },
    revealPath: {
      label: 'Odkryj wzdłuż ścieżki',
      desc: 'Kiedy jest włączone, odkrywane jest każde pole, przez które przechodzi żeton podczas przeciągania (w tym punkty orientacyjne), a nie tylko miejsce, w którym się zatrzymuje.',
    },
    revealBy: {
      label: 'Żetony, które ujawniają',
      desc: 'Które żetony na warstwie żetonów odsłaniają heksy: żetony kontrolowane przez gracza, żetony reprezentujące dowolną postać lub każdy żeton.',
    },
    revealMode: {
      label: 'Tryb ujawnienia',
      desc: 'Clear usuwa heksy w zasięgu wzroku. Zamiast tego Glimpse sprawia, że ​​są przezroczyste; są usuwane, gdy wejdzie do nich żeton.',
    },
    announce: {
      label: 'Ogłoś odkrycia',
      desc: 'Kto widzi wiadomość na czacie po odkryciu nazwanej lokalizacji.',
    },
    pingDiscoveries: {
      label: 'Odkrycia pingowe',
      desc: 'Gdy ta opcja jest włączona, gracze są wysyłani sygnałem ping do nazwanej lokalizacji po jej wykryciu.',
    },
    hideCoveredTokens: {
      label: 'Ukryj zakryte tokeny',
      desc: 'Roll20 rysuje nazwy, słupki i aury nad heksami. Kiedy jest włączone, żetony pod zakrytym heksem mają widoczną dla gracza nazwę, paski i aury wyłączone i włączane ponownie, gdy zostaną odkryte.',
    },
  },
  status: {
    engine: 'Silnik gry',
    grid: 'Siatka',
    layer: 'Warstwa sześciokątna',
    hexes: 'Heksy',
    named: 'Nazwane heksy',
    icons: 'Żetony lokalizacji',
    glimpsed: 'Prześwietlone heksy',
    pending: 'Lokalizacje oczekujące na zapełnienie',
    calibrated: 'Kalibrowane',
    overrides: 'Zastąpienia strony',
    undo: 'Cofnij dostępne',
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
      'Twoje heksowe mapy Heexploration 1.x zostały ulepszone. Jeśli ta gra została skopiowana z gry Legacy, uruchom ponowne skanowanie na każdej stronie mapy heksadecymalnej.',
    pruned:
      'Zapisane heksy, które już nie istnieją i zostały zapomniane: {dropped}. Jeśli ta gra lub strona została skopiowana, uruchom ponowne skanowanie strony, aby ponownie zebrać heksy.',
    readyHint: 'Wpisz !hexploration w menu lub otwórz ulotkę „Hexploration – Talia poleceń”.',
  },
  warnings: {
    foregroundUnavailable:
      'Ta gra nie obsługuje rysowania na warstwie pierwszego planu, więc heksy zostały narysowane na warstwie żetonów.',
    someFailed:
      'Heksy, których nie można narysować: {count}. Aby uzyskać szczegółowe informacje, sprawdź konsolę API.',
  },
  errors: {
    noPage: 'Nie udało się znaleźć strony, nad którą można pracować.',
    notHex: 'Na tej stronie nie jest używana siatka szesnastkowa.',
    noPolygons: 'Wybierz jeden lub więcej narysowanych kształtów do wypełnienia.',
    emptyArea: 'Wybrany obszar nie zawiera żadnych środków heksadecymalnych.',
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
    unmark: 'Zatrzymaj wybrane tokeny jako ukryte lokalizacje.',
    set: 'Zmień ustawienie lub pokaż wszystkie ustawienia.',
    pageSet: 'Zastąp ustawienie odkrywania tylko na bieżącej stronie.',
    pageClear: 'Usuń zastąpienia bieżącej strony.',
    rescan: 'Odbuduj listę szesnastkową strony, na przykład po skopiowaniu strony lub gry.',
    calibrate:
      'Wyrównaj siatkę heksów jednym lub dwoma wybranymi żetonami przyczepionymi do środków heksów.',
    calibrateReset: 'Usuń kalibrację bieżącej strony.',
    status: 'Pokaż, co Heexploration wie o bieżącej stronie.',
    journal: 'Odbuduj materiały informacyjne dotyczące talii pomocy i dowodzenia.',
    help: 'Pokaż tę listę.',
    handout: 'Pełne instrukcje znajdują się w ulotce „{name}”.',
  },
  deck: {
    subtitle: 'Pokład dowodzenia',
    drawDesc:
      'Narysuj kształty wokół obszaru, zaznacz je, a następnie wypełnij. Cofnij odwraca ostatnie wypełnienie.',
    revealDesc:
      'Wybierz heksy, kształty lub żetony, aby ponownie je odkryć lub zakryć. Przeglądaj odkrycia wokół wybranych żetonów, tak jakby się poruszyły.',
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
        'Wybierz kształty i kliknij Wypełnij talię poleceń (lub wpisz !hexploration fill). Kształty są zastępowane przez heksy.',
        'Opcjonalnie: przed wypełnieniem wybierz żetony dla ważnych miejsc i kliknij Zaznacz lokalizację. Są ukryte pod heksami i ogłaszane po odkryciu.',
        'Przesuń żeton gracza. Każdy heks, przez który przechodzi, oraz heks w zasięgu jego wzroku, zostają ujawnione.',
      ],
    },
    commands: {
      heading: 'Polecenia',
      intro:
        'Tylko MG mogą używać tych poleceń. Większość działa na wybrane obiekty; reszta działa na stronie, którą przeglądasz.',
      colCommand: 'Rozkaz',
      colDesc: 'Co to robi',
    },
    revealing: {
      heading: 'Jak działa odkrywanie',
      points: [
        'Tylko żetony na warstwie żetonów ujawniają heksy. Liczba żetonów jest ustalana przez Tokeny, które ujawniają: domyślnie są to żetony graczy, więc MG może przesuwać potwory bez odkrywania mapy.',
        'Żeton odkrywa każdy heks, który obejmuje (duże żetony obejmują kilka), a przy włączonej opcji „Odkryj wzdłuż ścieżki” każdy heks na trasie, po której został przeciągnięty, łącznie z punktami orientacyjnymi.',
        'Odległość wzroku ujawnia heksy wokół każdego z tych heksów. Gdy pole widzenia jest włączone, heks zostaje ujawniony tylko wtedy, gdy pomiędzy nim nie znajduje się żaden zakryty heks.',
        'Odległość ujawnienia heksów jest zapisywana na heksach w miarę ich rysowania. Te heksy są odkrywane tylko z określonej liczby heksów, niezależnie od tego, jak daleko sięga żeton. Używaj go do gór lub lasów, które ukrywają to, co jest za nimi.',
        'W trybie Przejrzenia heksy w zasięgu wzroku stają się przezroczyste zamiast znikać i są usuwane, gdy wejdzie na nie żeton.',
        'The API does not report moves made by other mods. TokenMod moves are picked up automatically; for other mods, select the tokens and click Explore, or call Hexploration.revealAround(token) from your own mod.',
        'API nie raportuje ruchów wykonanych przez inne mody. Ruchy TokenMod są pobierane automatycznie; w przypadku innych modów wybierz tokeny i kliknij Eksploruj lub wywołaj Hexploration.revealAround(token) z własnego moda.',
      ],
    },
    locations: {
      heading: 'Nazwane heksy i lokalizacje',
      points: [
        'Oznacz lokalizację zamienia wybrane żetony w ukryte lokalizacje. Żeton znajdujący się już pod heksem jest natychmiast ukrywany; w przeciwnym razie zostanie ukryty przez następne wypełnienie, które je zakrywa.',
        'Żetony ze znacznikiem stanu białej wieży są również traktowane jako lokalizacje podczas zapełniania, tak jak w wersji 1.',
        'Żetony ukrytych lokalizacji są przenoszone na warstwę GM. Kiedy ich heks zostanie odkryty, wracają na warstwę żetonów z pokazaną nazwą i ogłaszają swoje odkrycie.',
        'Nazwa Heks nadaje heksowi nazwę bez żetonu. Nazwa jest pokazywana MG jako etykieta na warstwie GM i ogłaszana po odkryciu heksu.',
        'Announce Discoveries decyduje, czy wszyscy, tylko GM, czy nikt nie zobaczy ogłoszenia. Ping Discoveries przenosi także widok graczy na lokalizację.',
      ],
    },
    settings: {
      heading: 'Ustawienia',
      intro:
        'Zmień ustawienia za pomocą zestawu !hexploration (lub przycisku Ustawienia). Warstwa heksów, ujawniające tokeny i język można również ustawić na stronie ustawień moda.',
      colKey: 'Klawisz',
      colName: 'Ustawienie',
      colDesc: 'Opis',
      perPage: '(Można ustawić na stronę.)',
    },
    jumpgate: {
      heading: 'Jumpgate i Dziedzictwo',
      points: [
        'Heexploration sprawdza, z jakiego silnika korzysta gra, i rysuje odpowiedni kształt. Kształty narysowane w dowolnym edytorze można wypełnić.',
        'Gdy warstwa heksów jest ustawiona na wartość Auto, heksy są rysowane na warstwie pierwszego planu, nad żetonami, więc gracze nie widzą, co jest pod spodem. Jeśli warstwa pierwszego planu nie jest dostępna, zamiast niej używana jest warstwa tokenów.',
        'Jumpgate rysuje matematycznie regularne heksy, które mają nieco inny kształt niż heksy Legacy. Jeśli heksy nie pokrywają się z siatką strony, przyciągnij żeton do środka heksa, wybierz go i kliknij Kalibruj. Wybierz dwa żetony na sąsiednich heksach tego samego rzędu (Hex V) lub kolumny (Hex H), aby również skorygować rozmiar heksaksu.',
        'Kiedy strona lub gra zostanie skopiowana, jej heksy otrzymują nowe identyfikatory. Uruchom ponownie skanowanie na stronie, aby je ponownie zebrać wraz z etykietami z nazwami i tokenami lokalizacji.',
      ],
    },
    upgrading: {
      heading: 'Aktualizacja z wersji 1',
      points: [
        'Wersja 2 nie potrzebuje już PathMath, MatrixMath, Vector Math ani HTML Builder. Możesz je usunąć, chyba że użyje ich inny mod.',
        'Istniejące mapy heksów, nazwy, tokeny lokalizacji i ustawienia są aktualizowane automatycznie przy pierwszym uruchomieniu.',
        'Polecenia wersji 1, w tym makro Heexploration_menu, nadal działają.',
        'Wersja 1 pozwala, aby dowolny żeton reprezentujący postać ujawniał heksy. Ustaw żetony, które ujawniają, na żetony postaci, aby zachować to zachowanie.',
      ],
      colV1: 'Polecenie wersji 1',
      colV2: 'Polecenie wersji 2',
    },
    troubleshooting: {
      heading: 'Rozwiązywanie problemów',
      points: [
        'Nic się nie dzieje, gdy token się porusza: sprawdź, czy token znajduje się na warstwie tokenów i pasuje do Tokenów, które ujawniają, oraz czy strona ma heksy (status!hexploration).',
        'Heksy są przesunięte względem siatki: użyj opcji Kalibruj, a następnie sprawdź za pomocą żetonu na kilku heksach na mapie.',
        'Heksy przestały się ujawniać po skopiowaniu strony lub gry: uruchom ponownie skanowanie na stronie.',
        'Wypełnienie mówi, że obszar nie ma środków heksów: kształt musi zawierać środek co najmniej jednego heksa.',
        'W innych przypadkach sprawdź dziennik konsoli API i dołącz zawarte w nim komunikaty, prosząc o pomoc.',
      ],
    },
    languages: {
      heading: 'Języki',
      body: 'Wybierz język z ustawionym językiem !hexploration. Dostępne języki:',
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
