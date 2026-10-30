const TRANSLATION = {
  titles: {
    ready: 'A Hexploration készen áll.',
    settings: 'Hexploration-beállítások',
    languages: 'Válasszon nyelvet',
    pageSettings: 'Oldalbeállítások: {page}',
    status: 'Hexploration-állapot: {page}',
    help: 'Hexploration parancsok',
    confirm: 'Kérjük, erősítse meg',
  },
  discovery: {
    title: 'Helyszín felfedezve',
  },
  menu: {
    draw: 'Rajzolás',
    reveal: 'Felfedés és elrejtés',
    locations: 'Helyszínek',
    tools: 'Eszközök',
    layerInUse: 'Az új hatszögek ide kerülnek: {layer}.',
    pageSettingsHelp:
      'Ezek a beállítások csak erre az oldalra vonatkoznak. A ★ jelű beállítások felülírják a globális beállításokat.',
  },
  buttons: {
    fill: 'Kitöltés',
    fillInverse: 'Inverz kitöltés',
    undo: 'Kitöltés visszavonása',
    reveal: 'Felfedés',
    conceal: 'Lefedés',
    explore: 'Felderítés',
    revealPage: 'Oldal felfedése',
    resetPage: 'Oldal visszaállítása',
    mark: 'Helyszín megjelölése',
    unmark: 'Jelölés törlése',
    name: 'Hatszög elnevezése',
    settings: 'Beállítások',
    pageSettings: 'Oldalbeállítások',
    status: 'Állapot',
    rescan: 'Újraszkennelés',
    calibrate: 'Kalibrálás',
    calibrateReset: 'Kalibrálás visszaállítása',
    help: 'Segítség',
    change: 'Módosítás',
    menu: 'Menü',
    clearOverrides: 'Felülbírálások törlése',
    confirmReset: 'Igen, minden hatszög eltávolítása',
  },
  prompts: {
    name: 'Helynév (a törléshez hagyja üresen)',
  },
  values: {
    on: 'Be',
    off: 'Ki',
    none: 'Nincs',
    hexLayer: {
      auto: 'Automatikus (előtér, ha elérhető)',
      foreground: 'előtérréteg',
      objects: 'tokenréteg',
    },
    revealBy: {
      players: 'Játékos tokenek',
      characters: 'Karakter tokenek',
      all: 'Minden token',
    },
    revealMode: {
      clear: 'Eltávolítás',
      glimpse: 'Bepillantás',
    },
    announce: {
      all: 'Mindenki',
      gm: 'Csak a GM',
      off: 'Ki',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Kitöltés',
      fillInverse: 'Inverz kitöltés',
      conceal: 'Lefedés',
    },
  },
  settings: {
    language: {
      label: 'Nyelv',
      desc: 'A menük, üzenetek és tájékoztatók nyelve.',
    },
    hexLayer: {
      label: 'Hatszögek rétege',
      desc: 'Hová kerülnek az új hatszögek. Az Automatikus az előtérréteggel próbálkozik (a tokenek fölött), és ha a játék ezt nem támogatja, a tokenréteget használja.',
    },
    fillColor: {
      label: 'Kitöltés színe',
      desc: 'Új hatszögek színe. Áttetsző hatszögekhez használjon rgba()-t, például rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Szegély színe',
      desc: 'Az új hatszögek körvonalának színe.',
    },
    labelColor: {
      label: 'Címke színe',
      desc: 'A csak GM-nek szánt névcímkék színe az elnevezett hatszögeken.',
    },
    glimpseColor: {
      label: 'Bepillantás színe',
      desc: 'Az a szín, amelyre a hatszögek bepillantáskor váltanak (Bepillantás felfedési mód). Használjon átlátszó rgba() színt.',
    },
    strokeWidth: {
      label: 'Szegély szélessége',
      desc: 'Az új hatszögek körvonalának szélessége pixelben (0-tól 20-ig).',
    },
    maxDistance: {
      label: 'Hatszögek felfedési távolsága',
      desc: 'A hatszögek kitöltésekor kerül tárolásra rajtuk, ezért a kitöltés előtt állítsa be: a későbbi módosítás nem hat a térképen már meglévő hatszögekre. Egy tokennek ennyi hatszögön belül kell lennie ahhoz, hogy felfedje őket, bármilyen messzire lát is; 0 esetén csak akkor fedődnek fel, ha belépnek beléjük. Hegyekhez vagy erdőkhöz használja. Hagyja üresen, ha nem kíván korlátozást.',
    },
    revealDistance: {
      label: 'Látótávolság',
      desc: 'Hány hatszög fedődik fel egy mozgó token körül (0-tól 20-ig). A 0 csak azokat a hatszögeket fedi fel, amelyeken a token áthalad.',
    },
    lineOfSight: {
      label: 'Látóvonal',
      desc: 'Ha be van kapcsolva, a fedve maradó hatszögek, például a Hatszögek felfedési távolsága beállítással kitöltött hegyek, eltakarják a mögöttük lévő hatszögeket. Csak akkor számít, ha a Látótávolság legalább 2.',
    },
    revealPath: {
      label: 'Felfedés az útvonal mentén',
      desc: 'Ha be van kapcsolva, minden hatszög felfedődik, amelyen a token a húzás közben áthalad (az útpontokat is beleértve), nem csak az, ahol megáll.',
    },
    revealBy: {
      label: 'Felfedő tokenek',
      desc: 'Mely tokenek fedik fel a hatszögeket a tokenrétegen: a játékos által irányított tokenek, a bármely karaktert ábrázoló tokenek vagy minden token.',
    },
    revealMode: {
      label: 'Felfedési mód',
      desc: 'Az Eltávolítás mód eltávolítja a látótávolságon belüli hatszögeket. A Bepillantás mód ehelyett átlátszóvá teszi őket; akkor tűnnek el, amikor egy token belép beléjük.',
    },
    announce: {
      label: 'Felfedezések bejelentése',
      desc: 'Ki látja a csevegőüzenetet, ha egy megnevezett helyet felfedeznek.',
    },
    pingDiscoveries: {
      label: 'Felfedezések pingelése',
      desc: 'Ha be van kapcsolva, a játékosok egy megnevezett helyre pingelődnek, amikor felfedezik.',
    },
    hideCoveredTokens: {
      label: 'Lefedett tokenek elrejtése',
      desc: 'A Roll20 a neveket, sávokat és aurákat a hatszögek fölé rajzolja. Ha be van kapcsolva, a lefedett hatszög alatti tokenek játékosok által látható neve, sávjai és aurái kikapcsolnak, majd a tokenek felfedésekor újra bekapcsolnak.',
    },
  },
  status: {
    engine: 'Játékmotor',
    grid: 'Rács',
    layer: 'Hatszögek rétege',
    hexes: 'Hatszögek',
    named: 'Elnevezett hatszögek',
    icons: 'Helyszíntokenek',
    glimpsed: 'Bepillantott hatszögek',
    pending: 'Kitöltésre váró helyszínek',
    calibrated: 'Kalibrálva',
    overrides: 'Oldalszintű felülbírálások',
    undo: 'Visszavonható',
  },
  messages: {
    filled:
      'Kitöltés kész. Rajzolt hatszögek: {created}. Átformálva: {restyled}. Elrejtett helyek: {icons}.',
    revealed: 'Felfedezett hatszögek: {count}.',
    revealedPage: 'Az oldal minden hatszöge felfedve ({count}).',
    confirmReset:
      'Eltávolítja az összes hatszöget innen: „{page}” ({count})? A helyszíntokenek visszakerülnek a tokenrétegre. A visszavonás ezt nem tudja visszafordítani.',
    resetPage: 'Az oldalról eltávolított hatszögek: {count}.',
    undone:
      'Az utolsó kitöltés visszavonva. Eltávolított hatszögek: {removed}. Újraformázott hatszögek visszaállítva: {restored}.',
    named: '"{name}" nevű hatszögek: {count}.',
    unnamed: 'Törölt nevek: {count}.',
    marked:
      'Meglévő hatszögekben rejtett helyek: {attached}. Várakozás a következő kitöltésre, amely lefedi őket: {pending}.',
    unmarked: 'Tokenek, amelyek már nem helyek: {count}.',
    settingChanged: '{setting} értéke {value}.',
    rescanned:
      'Az újraszkennelés befejeződött. Tartva: {kept}. Elfogadva: {adopted}. Áthelyezve: {moved}. Hiányzó és elfelejtett: {dropped}. Újra összekapcsolt címkék: {labels}. A helytokenek újra összekapcsolva: {icons}.',
    calibrated:
      'Rács kalibrálva (oszloplépés {colStep}px, sorlépés {rowStep}px). Újraellenőrzés: megtartva {kept}, áthelyezve {moved}, átvéve {adopted}.',
    calibrationReset:
      'A kalibráció eltávolítva. Újraellenőrzés: megtartva {kept}, áthelyezve {moved}, átvéve {adopted}.',
    journalRebuilt: 'A(z) „{help}” és „{deck}” tájékoztató újra elkészült.',
    migrated:
      'Az Ön Hexploration 1.x hatszögtérképei frissültek. Ha ezt a játékot egy Legacy játékból másolták, futtassa az Újraszkennelést minden hatszögtérkép-oldalon.',
    pruned:
      'Mentett hatszögek, amelyek már nem léteznek, és törlődtek a nyilvántartásból: {dropped}. Ha ezt a játékot vagy oldalt másolták, futtassa az Újraszkennelést az oldalon, hogy újra felvegye a hatszögeit.',
    readyHint:
      'A menühöz írja be a !hexploration parancsot, vagy nyissa meg a "Hexploration - Command Deck" tájékoztatót.',
  },
  warnings: {
    foregroundUnavailable:
      'Ez a játék nem támogatja az előtérrétegre való rajzolást, ezért a hatszögek a tokenrétegre kerültek.',
    someFailed: 'Nem rajzolható hatszögek: {count}. A részletekért tekintse meg az API-konzolt.',
  },
  errors: {
    noPage: 'Nem található az oldal, amelyen dolgozni kellene.',
    notHex: 'Ez az oldal nem használ hatszögrácsot.',
    noPolygons: 'Válasszon ki egy vagy több rajzolt alakzatot a kitöltéshez.',
    emptyArea: 'A kijelölt terület egyetlen hatszögközéppontot sem tartalmaz.',
    tooMany: 'Ez túl sok hatszöget hozna létre egyszerre ({count}).',
    nothingToConceal: 'Jelölje ki az elrejtendő rajzolt alakzatokat vagy tokeneket.',
    nothingToReveal:
      'Válassza ki a hatszögeket, a rajzolt alakzatokat vagy a tokeneket a felfedéshez.',
    noTokens: 'Először válasszon ki egy vagy több tokent.',
    noHexes: 'Először jelöljön ki egy vagy több hatszöget (vagy hatszögön álló tokent).',
    nothingToUndo: 'Nincs visszavonható kitöltés.',
    unknownCommand: 'Ismeretlen parancs: {command}',
    unknownSetting: 'Ismeretlen beállítás: {key}',
    unknownPageSetting: 'Oldalanként beállítható beállítások: {keys}',
    invalidValue: 'A „{value}” nem érvényes érték a {key} számára.',
    calibrateNeedsTokens: 'Jelöljön ki egy vagy két, hatszögközéppontra illesztett tokent.',
    calibrateFailed: 'Ezeket a tokeneket nem lehet kalibrálni.',
    unexpected: 'Hiba történt: {message}',
  },
  hints: {
    noPage: 'Nyissa meg azt az oldalt, amelyen dolgozni szeretne, vagy válasszon rajta valamit.',
    notHex: 'Állítsa az oldalrácsot Hex (V) vagy Hex (H) értékre az Oldalbeállításokban.',
    noPolygons:
      'Rajzoljon sokszöget, téglalapot, ellipszist vagy szabadkézi alakzatot a terület köré, jelölje ki, majd próbálkozzon újra.',
    emptyArea: 'Rajzoljon nagyobb alakzatot, vagy ellenőrizze az oldalrács beállításait.',
    tooMany: 'Töltsön ki egy kisebb területet, vagy ossza fel több formára.',
    noHexes:
      'A hatszögek az előtérben vagy a token rétegben vannak; váltson át arra a rétegre a kijelölésükhöz.',
    unknownCommand: 'Írja be a !hexploration help parancsot a parancsok listázásához.',
    unknownSetting: 'Minden beállítás megtekintéséhez írja be a !hexploration set parancsot.',
    calibrateNeedsTokens:
      'Illesszen egy tokent egy hatszög közepére, és jelölje ki. Válasszon ki egy második tokent, amely egy szomszédos hatszögre van illesztve ugyanabban a sorban (Hex V) vagy oszlopban (Hex H), hogy a hatszög méretét is javítsa.',
    calibrateFailed:
      'A két tokennek ugyanabban a sorban (Hex V) vagy ugyanabban az oszlopban (Hex H) kell lennie, egymástól legalább egy hatszögnyire.',
    unexpected: 'A részletek az API-konzol naplójában találhatók.',
  },
  help: {
    menu: 'Mutasd a menüt.',
    fill: 'Fedje le a kijelölt rajzolt alakzatokat hatszögekkel.',
    fillInverse: 'Fedje le az egész oldalt, kivéve a kiválasztott formák belsejét.',
    undo: 'Vonja vissza az utolsó kitöltést, inverz kitöltést vagy elrejtést, és állítsa vissza a használt alakzatokat.',
    reveal:
      'Jelenítse meg a kiválasztott hatszögeket, valamint a kiválasztott alakzatok és tokenek alatti hatszögeket.',
    revealPage: 'Fedjen fel minden hatszöget az oldalon bejelentések nélkül.',
    conceal: 'A kiválasztott alakzatok és tokenek alatti területet ismét takarja be hatszögekkel.',
    explore: 'Felfedés a kijelölt tokenek körül, mintha éppen oda mozogtak volna.',
    resetPage: 'Távolítson el minden hatszöget az oldalon (először rákérdez).',
    name: 'Nevezze el a kijelölt hatszögeket vagy a kijelölt tokenek alatti hatszögeket. A név törléséhez hagyja üresen.',
    mark: 'A kiválasztott tokeneket rejtett helyekké alakíthatja.',
    unmark: 'Állítsa le, hogy a kiválasztott tokenek rejtett helyek legyenek.',
    set: 'Módosítson egy beállítást, vagy jelenítse meg az összes beállítást.',
    pageSet: 'Felfedezési beállítás felülírása csak az aktuális oldalon.',
    pageClear: 'Távolítsa el az aktuális oldal felülírásait.',
    rescan: 'Építse újra az oldal hatszöglistáját, például egy oldal vagy játék másolása után.',
    calibrate:
      'Igazítsa a hatszögrácsot egy vagy két kijelölt, hatszögközéppontra illesztett tokenhez.',
    calibrateReset: 'Távolítsa el az aktuális oldal kalibrálását.',
    status: 'Mutassa meg, mit tud a Hexploration az aktuális oldalról.',
    journal: 'Építse újra a Segítség és a Command Deck tájékoztatót.',
    help: 'Mutasd ezt a listát.',
    handout: 'A teljes utasítás a „{name}” tájékoztatóban található.',
  },
  deck: {
    drawDesc:
      'Rajzoljon alakzatokat egy terület köré, jelölje ki őket, majd töltse ki. A visszavonás megfordítja az utolsó kitöltést.',
    revealDesc:
      'Jelöljön ki hatszögeket, alakzatokat vagy tokeneket a felfedésükhöz vagy újbóli lefedésükhöz. A Felderítés úgy fed fel a kijelölt tokenek körül, mintha odamozogtak volna.',
    locationsDesc:
      'Jelöljön ki tokeneket, hogy helyszínként elrejtse őket a hatszögek alatt. Jelöljön ki hatszögeket vagy tokeneket egy hatszög elnevezéséhez.',
    toolsDesc:
      'Beállítások, oldalfelülírások, állapot, a másolt oldalak újraolvasása és a rács kalibrálása.',
    footer: 'A teljes útmutatásért lásd a „{help}” tájékoztatót.',
  },
  handout: {
    versionLabel: 'Változat',
    subtitle: 'Hatszögről hatszögre haladó felfedezés a Roll20-hoz',
    footer: 'Használja a „{deck}” tájékoztatót az egykattintásos vezérlőkhöz.',
    overview: {
      heading: 'Áttekintés',
      body: 'A Hexploration átlátszatlan hatszögekkel fedi le a hatszögtérképet. Ahogy a csapat halad, a hatszögek, amelyeken áthalad (és ha szeretné, a körülöttük lévők is), eltűnnek, így a térkép hatszögről hatszögre tárul fel. A hatszögek alá rejtett helyszínek helyezhetők el, ezeket megtalálásukkor a rendszer bejelenti. Jumpgate és Legacy játékokban is működik, bármekkora Hex (V) és Hex (H) rácson.',
      demo: 'Nézzen meg egy rövid bemutatót (az 1-es verzióból)',
    },
    quickStart: {
      heading: 'Gyors kezdés',
      steps: [
        'Nyisson meg egy oldalt, amelynek rácsa Hex (V) vagy Hex (H) beállítású.',
        'Rajzoljon egy vagy több alakzatot (sokszög, téglalap, ellipszis vagy szabadkézi) az elrejteni kívánt terület köré.',
        'Jelölje ki az alakzatokat, és kattintson a Command Deck Kitöltés gombjára (vagy írja be: !hexploration fill). Az alakzatok helyére hatszögek kerülnek.',
        'Nem kötelező: a kitöltés előtt jelölje ki a fontos helyek tokenjeit, és kattintson a Helyszín megjelölése gombra. Ezek a hatszögek alá rejtőznek, és felfedezésükkor a rendszer bejelenti őket.',
        'Mozgass egy játékos tokent. Minden hatszög, amelyen áthalad, és a látótávolságon belüli hatszögek feltárulnak.',
      ],
    },
    commands: {
      heading: 'Parancsok',
      intro:
        'Csak a GM-ek használhatják ezeket a parancsokat. A legtöbb a kiválasztott objektumokra hat; a többi az éppen megtekintett oldalon működik.',
      colCommand: 'Parancs',
      colDesc: 'Mit csinál',
    },
    revealing: {
      heading: 'Hogyan működik a feltárás',
      points: [
        'Csak a tokenrétegen lévő tokenek fednek fel hatszögeket. Hogy mely tokenek számítanak, azt a Felfedő tokenek beállítás határozza meg: alapértelmezés szerint a játékosok tokenjei, így a GM a térkép felfedése nélkül mozgathatja a szörnyeket.',
        'Egy token felfed minden hatszöget, amelyet lefed (a nagy tokenek többet is), és ha a Felfedés az útvonal mentén be van kapcsolva, minden hatszöget azon az útvonalon is, amelyen végighúzták, az útpontokat is beleértve.',
        'A Látótávolság az egyes ilyen hatszögek körüli hatszögeket fedi fel, a legközelebbiekkel kezdve. Ha a Látóvonal be van kapcsolva, egy hatszög nem fedődik fel, amíg közte és a token között lefedett hatszög van. A közelebbi hatszögek általában előbb fedődnek fel, így nyílt terepen a Látóvonal semmin sem változtat: csak akkor számít, ha a Látótávolság legalább 2, és vannak fedve maradó hatszögek, például a Hatszögek felfedési távolsága beállítással kitöltött terep.',
        'A Hatszögek felfedési távolsága minden hatszögön a kitöltésekor kerül tárolásra, ezért a kitöltés előtt állítsa be; a későbbi módosítás nem hat a térképen már meglévő hatszögekre. Egy tokennek ennyi hatszögön belül kell lennie ahhoz, hogy felfedje őket, bármilyen messzire lát is, 0 esetén pedig csak akkor fedődnek fel, ha belépnek beléjük. Hegyvonulathoz: állítsa a Hatszögek felfedési távolsága értékét 0-ra, töltse ki a hegyeket, állítsa vissza üresre (korlátozás nélkül), majd töltse ki a mögöttük lévő vidéket. Ha a Látótávolság 3 és a Látóvonal be van kapcsolva, a csapat látja a körülötte lévő nyílt terepet, de a hegyeket és azt, ami mögöttük van, nem. Minden hegyi hatszög akkor fedődik fel, amikor egy token belép bele.',
        'Bepillantás módban a látótávolságon belüli hatszögek eltűnés helyett átlátszóvá válnak, és eltávolításra kerülnek, amikor egy token belép beléjük. A Bepillantás módban látott hatszögek a Látóvonal szempontjából nem számítanak takarásnak.',
        'A Roll20 a tokenek nevét, sávjait és auráit a hatszögek fölé rajzolja. Ha a Lefedett tokenek elrejtése be van kapcsolva, a lefedett hatszög alatti token játékosok által látható neve, sávjai és aurái kikapcsolnak, amíg fel nem fedik, így a rejtett szörnyek nem árulják el magukat. Ha ezek közül bármelyiket bekapcsolja, amíg a token le van fedve, rejtve marad, és a token felfedésekor kapcsol be.',
        'Az API nem jelzi a más modok által végrehajtott mozgásokat. A TokenMod mozgásait a rendszer automatikusan észleli; más modok esetén jelölje ki a tokeneket, és kattintson a Felderítés gombra, vagy hívja meg a Hexploration.revealAround(token) függvényt a saját modjából.',
      ],
    },
    locations: {
      heading: 'Elnevezett hatszögek és helyszínek',
      points: [
        'A Helyszín megjelölése a kijelölt tokeneket rejtett helyszínekké alakítja. A már hatszög alatt lévő token azonnal elrejtődik; különben a következő kitöltés rejti el, amely lefedi.',
        'A fehér torony állapotjelzővel ellátott tokeneket a rendszer az 1-es verzióhoz hasonlóan helyként kezeli kitöltésekor.',
        'A rejtett helyjelzők a GM rétegre kerülnek. Amikor a hatszögük felfedődik, a nevükkel együtt visszatérnek a token réteghez, és a felfedezésüket bejelentik.',
        'A Hatszög elnevezése token nélkül ad nevet egy hatszögnek. A nevet a GM címkeként látja a GM-rétegen, és a rendszer bejelenti, amikor a hatszög felfedődik. A Jumpgate a GM-réteget az előtérréteg alá rajzolja, ezért a Jumpgate-ben a címkék csak akkor látszanak, ha a Hatszögek rétege beállítás értéke tokenréteg.',
        'A Felfedezések bejelentése határozza meg, hogy mindenki, csak a GM vagy senki sem látja a bejelentést. A Felfedezések pingelése a játékosok nézetét is a helyszínre mozgatja.',
      ],
    },
    settings: {
      heading: 'Beállítások',
      intro:
        'A beállításokat a !hexploration set paranccsal (vagy a Beállítások gombbal) módosíthatja. A Hatszögek rétege, a Felfedő tokenek és a Nyelv a Mod beállítási oldalán is megadható.',
      colKey: 'Kulcs',
      colName: 'Beállítás',
      colDesc: 'Leírás',
      perPage: '(Oldalonként beállítható.)',
    },
    jumpgate: {
      heading: 'Jumpgate és Legacy',
      points: [
        'A Hexploration megállapítja, hogy a játék melyik motort használja, és megrajzolja a megfelelő formát. Bármelyik szerkesztőben rajzolt alakzatok kitölthetők.',
        'Ha a Hatszögek rétege Automatikus értékre van állítva, a hatszögek az előtérrétegre, a tokenek fölé kerülnek, így a játékosok nem látják, mi van alattuk. Ha az előtérréteg nem érhető el, a rendszer helyette a tokenréteget használja.',
        'A Jumpgate matematikailag szabályos hatszögeket rajzol, amelyek alakja kissé eltér a Legacy hatszögekétől. Ha a hatszögek nem illeszkednek az oldal rácsához, illesszen egy tokent egy hatszög középpontjára, jelölje ki, majd kattintson a Kalibrálás gombra. A hatszögméret javításához jelöljön ki két tokent ugyanazon sor (Hex V) vagy oszlop (Hex H) szomszédos hatszögeiben.',
        'Amikor egy oldalt vagy játékot másolnak, a hatszögei új azonosítókat kapnak. Futtassa az Újraszkennelést az oldalon, hogy újra felvegye őket a névcímkéikkel és helyszíntokenjeikkel együtt.',
      ],
    },
    upgrading: {
      heading: 'Frissítés az 1-es verzióról',
      points: [
        'A 2-es verziónak már nincs szüksége PathMath-ra, MatrixMath-ra, Vector Math-ra vagy HTML Builderre. Eltávolíthatja őket, hacsak egy másik mod nem használja őket.',
        'A meglévő hatszögtérképek, nevek, helyjelzők és beállítások automatikusan frissülnek az első indításkor.',
        'Az 1-es verzió parancsai, beleértve a Hexploration_menu makrót is, továbbra is működnek.',
        'Az 1-es verzióban bármely karaktert ábrázoló token felfedhetett hatszögeket. Ennek megtartásához állítsa a Felfedő tokenek beállítást Karakter tokenek értékre.',
      ],
      colV1: '1-es verzió parancs',
      colV2: '2-es verzió parancs',
    },
    troubleshooting: {
      heading: 'Hibaelhárítás',
      points: [
        'Semmi sem történik, amikor egy token mozog: ellenőrizze, hogy a token a tokenrétegen van-e, megfelel-e a Felfedő tokenek beállításnak, és vannak-e hatszögek az oldalon (!hexploration status).',
        'A hatszögek el vannak tolva a rácstól: használja a Kalibrálást, majd ellenőrizze a token segítségével néhány hatszöget a térképen.',
        'Egy oldal vagy játék másolása után a hatszögek nem fedődnek fel: futtassa az Újraszkennelést az oldalon.',
        'Kitöltés szerint a területnek nincs hatszög középpontja: az alakzatnak tartalmaznia kell legalább egy hatszög középpontját.',
        'Minden más esetben ellenőrizze az API-konzol naplóját, és segítségkéréskor mellékelje az üzeneteit.',
      ],
    },
    languages: {
      heading: 'Nyelvek',
      body: 'Nyelvet a !hexploration set language paranccsal választhat. Elérhető nyelvek:',
      colLanguage: 'Nyelv',
      colNative: 'Saját név',
      colCode: 'Kód',
    },
    credits: {
      heading: 'Készítők',
      original: 'Az eredeti mod szerzője',
      maintainer: 'A 2-es verziót karbantartja',
      marketplace: 'Ada művészeti csomagjai a Roll20 Marketplace-en',
      support:
        'Ha hibát talál, vagy ötlete van, írjon a Roll20 Mod fórumba, vagy nyisson hibajegyet a GitHubon, és mellékelje az API-konzol naplójának üzeneteit.',
    },
  },
};

export default TRANSLATION;
