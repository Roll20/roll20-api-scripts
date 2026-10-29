const TRANSLATION = {
  titles: {
    ready: 'A hexploration készen áll.',
    settings: 'Hexexploration beállítások',
    languages: 'Válasszon nyelvet',
    pageSettings: 'Oldalbeállítások: {page}',
    status: 'Heti feltárás állapota: {page}',
    help: 'Hexploration parancsok',
    confirm: 'Kérjük, erősítse meg',
  },
  discovery: {
    title: 'Hely felfedezve',
  },
  menu: {
    draw: 'Rajzolj',
    reveal: 'Felfedni és elrejteni',
    locations: 'Helyszínek',
    tools: 'Eszközök',
    layerInUse: 'Új hatszögek rajzolása folyamatban van a {layer}.',
    pageSettingsHelp:
      'Ezek a beállítások csak erre az oldalra vonatkoznak. A ★ jelű beállítások felülírják a globális beállításokat.',
  },
  buttons: {
    fill: 'Töltse ki',
    fillInverse: 'Inverz kitöltés',
    undo: 'Kitöltés visszavonása',
    reveal: 'Felfedni',
    conceal: 'Elrejteni',
    explore: 'Fedezze fel',
    revealPage: 'Oldal feltárása',
    resetPage: 'Oldal visszaállítása',
    mark: 'Hely megjelölése',
    unmark: 'Törölje a jelölést',
    name: 'Név Hex',
    settings: 'Beállítások elemre',
    pageSettings: 'Oldalbeállítások',
    status: 'Állapot',
    rescan: 'Újraszkennelés',
    calibrate: 'Kalibrálni',
    calibrateReset: 'Kalibrálás visszaállítása',
    help: 'Segítség',
    change: 'Változás',
    menu: 'Menü',
    clearOverrides: 'Felülbírálások törlése',
    confirmReset: 'Igen, távolítsa el az összes hexát',
  },
  prompts: {
    name: 'Helynév (a törléshez hagyja üresen)',
  },
  values: {
    on: 'On',
    off: 'Le',
    none: 'Egyik sem',
    hexLayer: {
      auto: 'Automatikus (előtérben, ha elérhető)',
      foreground: 'előtér réteg',
      objects: 'token réteg',
    },
    revealBy: {
      players: 'Játékos tokenek',
      characters: 'Karakter tokenek',
      all: 'Minden token',
    },
    revealMode: {
      clear: 'Világos',
      glimpse: 'Bepillantás',
    },
    announce: {
      all: 'Mindenki',
      gm: 'Csak GM',
      off: 'Le',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Töltse ki',
      fillInverse: 'Inverz kitöltés',
      conceal: 'Elrejteni',
    },
  },
  settings: {
    language: {
      label: 'Nyelv',
      desc: 'A menük, üzenetek és tájékoztatók nyelve.',
    },
    hexLayer: {
      label: 'Hatlapos réteg',
      desc: 'Ahol új hatszögeket rajzolnak. Az Auto megpróbálja az előtér réteget (a tokenek felett), és visszaesik a token rétegre, ha a játék nem támogatja.',
    },
    fillColor: {
      label: 'Kitöltés színe',
      desc: 'Új hatszögek színe. Használja az rgba()-t az átlátszó hexákhoz, például rgba(0,0,0,0,8).',
    },
    strokeColor: {
      label: 'Szegély színe',
      desc: 'Az új hatszögek körvonalának színe.',
    },
    labelColor: {
      label: 'Címke színe',
      desc: 'A csak GM-nek szánt névcímkék színe a megnevezett hexákon.',
    },
    glimpseColor: {
      label: 'Glimpse Color',
      desc: 'A színes hatszögek bepillantáskor a következőre változnak (Glimpse discovery mód). Használjon átlátszó rgba() színt.',
    },
    strokeWidth: {
      label: 'Határ szélessége',
      desc: 'Az új hatszögek körvonalának szélessége pixelben (0-tól 20-ig).',
    },
    maxDistance: {
      label: 'Hex Reveal távolság',
      desc: 'A húzott hatszögekre alkalmazva: egy jelzőnek ezen a sok hatszögön belül kell lennie ahhoz, hogy felfedje őket, bármilyen messzire is lásson. Hagyja üresen korlátozás nélkül.',
    },
    revealDistance: {
      label: 'Látótávolság',
      desc: 'Hány hexa jelenik meg egy mozgó token körül (0-tól 20-ig). A 0 csak azokat a hatszögeket mutatja, amelyeken a token áthalad.',
    },
    lineOfSight: {
      label: 'Látóvonal',
      desc: 'Ha be van kapcsolva, egy hatszög csak akkor derül ki, ha nincs fedett hatszög közte és a token között.',
    },
    revealPath: {
      label: 'Fedezd fel az ösvényen',
      desc: 'Ha be van kapcsolva, minden hexa, amelyen a token áthalad a húzás közben (beleértve az útpontokat is), megjelenik, nem csak az, ahol megáll.',
    },
    revealBy: {
      label: 'Tokenek, amelyek felfedik',
      desc: 'A tokenrétegen lévő jelzők hatszögeket mutatnak: a játékos által irányított jelzőket, bármely karaktert vagy minden jelzőt.',
    },
    revealMode: {
      label: 'Felfedezési mód',
      desc: 'A Clear eltávolítja a hatszögleteket látótávolságon belül. A bepillantás ehelyett átlátszóvá teszi őket; eltávolítják őket, amikor egy token belép beléjük.',
    },
    announce: {
      label: 'Hirdesse a felfedezéseket',
      desc: 'Ki látja a csevegőüzenetet, ha egy megnevezett helyet felfedeznek.',
    },
    pingDiscoveries: {
      label: 'Ping felfedezések',
      desc: 'Ha be van kapcsolva, a játékosok egy megnevezett helyre pingelődnek, amikor felfedezik.',
    },
    hideCoveredTokens: {
      label: 'Fedett tokenek elrejtése',
      desc: 'A Roll20 neveket, sávokat és aurákat rajzol a hatszögek fölé. Ha be van kapcsolva, a fedett hatszög alatti jelzőknek a játékosok által látható nevük, a sávok és az aurák ki vannak kapcsolva, majd újra bekapcsolnak, amikor feltárják őket.',
    },
  },
  status: {
    engine: 'Játék motor',
    grid: 'Rács',
    layer: 'Hatlapos réteg',
    hexes: 'Hexák',
    named: 'Elnevezett hexák',
    icons: 'Helyjelzők',
    glimpsed: 'Megpillantott hatszögek',
    pending: 'Betöltésre váró helyek',
    calibrated: 'Kalibrálva',
    overrides: 'Oldal felülbírálása',
    undo: 'Visszavonás elérhető',
  },
  messages: {
    filled:
      'Kitöltés kész. Rajzolt hatszögek: {created}. Átformálva: {restyled}. Elrejtett helyek: {icons}.',
    revealed: 'Felfedezett hatszögek: {count}.',
    revealedPage: 'Az oldalon minden hex látható ({count}).',
    confirmReset:
      'Eltávolít minden hexát innen: „{page}” ({count})? A helyjelzők visszatérnek a token rétegbe. A visszavonás ezt nem tudja visszafordítani.',
    resetPage: 'Az oldalról eltávolított hatszögek: {count}.',
    undone:
      'Az utolsó kitöltés visszavonva. Eltávolított hatszögek: {removed}. Újraformázott hatszögek visszaállítva: {restored}.',
    named: '"{name}" nevű hatszögek: {count}.',
    unnamed: 'Törölt nevek: {count}.',
    marked:
      'Meglévő hexákban rejtett helyek: {attached}. Várakozás a következő kitöltésre, amely lefedi őket: {pending}.',
    unmarked: 'Tokenek, amelyek már nem helyek: {count}.',
    settingChanged: '{setting} értéke {value}.',
    rescanned:
      'Az újraszkennelés befejeződött. Tartva: {kept}. Elfogadva: {adopted}. Újra benyújtva: {moved}. Hiányzó és elfelejtett: {dropped}. Újra összekapcsolt címkék: {labels}. A helytokenek újra összekapcsolva: {icons}.',
    calibrated:
      'Rács kalibrálva (oszloplépés {colStep}px, sorlépés {rowStep}px). Újraellenőrzés: megtartva {kept}, újra benyújtva {moved}, átvéve {adopted}.',
    calibrationReset:
      'A kalibráció eltávolítva. Újraellenőrzés: megtartva {kept}, újra benyújtva {moved}, átvett {adopted}.',
    journalRebuilt: 'A "{help}" és a "{deck}" szórólapok újjáépítésre kerültek.',
    migrated:
      'A Hexploration 1.x hexadecimális térképeidet frissítettük. Ha ezt a játékot egy régi játékból másolták, futtassa az Újrakeresést minden hexadecimális térképoldalon.',
    pruned:
      'Mentett hexák, amelyek már nem léteznek és elfelejtettek: {dropped}. Ha ezt a játékot vagy oldalt másolták, futtassa az Újraellenőrzést az oldalon, hogy újra felvegye a hatszögleteket.',
    readyHint:
      'Írja be a !hexploration parancsot a menübe, vagy nyissa meg a "Hexploration - Command Deck" tájékoztatót.',
  },
  warnings: {
    foregroundUnavailable:
      'Ez a játék nem támogatja az előtér rétegre való rajzolást, ezért hatszögletűek rajzoltak a token rétegre.',
    someFailed: 'Nem rajzolható hatszögek: {count}. A részletekért tekintse meg az API-konzolt.',
  },
  errors: {
    noPage: 'Nem található az oldal, amelyen dolgozni kellene.',
    notHex: 'Ez az oldal nem használ hatszögletű rácsot.',
    noPolygons: 'Válasszon ki egy vagy több rajzolt alakzatot a kitöltéshez.',
    emptyArea: 'A kiválasztott terület nem tartalmaz hexadecimális középpontokat.',
    tooMany: 'Ez túl sok hexát hozna létre egyszerre ({count}).',
    nothingToConceal: 'Válassza ki a rajzolt alakzatokat vagy jelzőket az elrejteni.',
    nothingToReveal:
      'Válassza ki a hatszögleteket, a rajzolt alakzatokat vagy a tokeneket a felfedéshez.',
    noTokens: 'Először válasszon ki egy vagy több tokent.',
    noHexes: 'Először válasszon ki egy vagy több hexát (vagy hatszögletű tokent).',
    nothingToUndo: 'Nincs visszavonható kitöltés.',
    unknownCommand: 'Ismeretlen parancs: {command}',
    unknownSetting: 'Ismeretlen beállítás: {key}',
    unknownPageSetting: 'Oldalanként beállítható beállítások: {keys}',
    invalidValue: 'A „{value}” nem érvényes érték a {key} számára.',
    calibrateNeedsTokens: 'Válasszon ki egy vagy két hatszögletű középpontra pattintott tokent.',
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
      'Két tokennek ugyanabban a sorban (Hex V) vagy ugyanabban az oszlopban (Hexa) kell lennie, egymástól legalább egy hatszögre.',
    unexpected: 'A részletek az API-konzol naplójában találhatók.',
  },
  help: {
    menu: 'Mutasd a menüt.',
    fill: 'A kiválasztott rajzolt alakzatokat hatszögletekkel fedjük le.',
    fillInverse: 'Fedje le az egész oldalt, kivéve a kiválasztott formák belsejét.',
    undo: 'Vonja vissza az utolsó kitöltést, inverz kitöltést vagy elrejtést, és állítsa vissza a használt alakzatokat.',
    reveal:
      'Jelenítse meg a kiválasztott hatszögeket, valamint a kiválasztott alakzatok és tokenek alatti hatszögeket.',
    revealPage: 'Felfed minden hexát az oldalon bejelentések nélkül.',
    conceal:
      'A kiválasztott alakzatok és tokenek alatti területet ismét takarja be hatszögletekkel.',
    explore: 'Mutasd meg a kiválasztott tokenek körül, mintha csak most költöztek volna oda.',
    resetPage: 'Távolítson el minden hatszögletet az oldalon (először rákérdez).',
    name: 'Nevezze el a kiválasztott hexákat, vagy a kiválasztott tokenek alatti hexákat. Hagyja üresen a nevet a törléshez.',
    mark: 'A kiválasztott tokeneket rejtett helyekké alakíthatja.',
    unmark: 'Állítsa le, hogy a kiválasztott tokenek rejtett helyek legyenek.',
    set: 'Módosítson egy beállítást, vagy jelenítse meg az összes beállítást.',
    pageSet: 'Felfedezési beállítás felülírása csak az aktuális oldalon.',
    pageClear: 'Távolítsa el az aktuális oldal felülírásait.',
    rescan:
      'Építse újra az oldal hexadecimális listáját, például egy oldal vagy játék másolása után.',
    calibrate:
      'Sorolja fel a hatszögletű rácsot egy vagy két kiválasztott tokennel, amelyeket hatszögletű középpontokra pattint.',
    calibrateReset: 'Távolítsa el az aktuális oldal kalibrálását.',
    status: 'Mutassa meg, mit tud a Hexploration az aktuális oldalról.',
    journal: 'Építsd újra a Help és Command Deck segédanyagokat.',
    help: 'Mutasd ezt a listát.',
    handout: 'A teljes utasítás a „{name}” tájékoztatóban található.',
  },
  deck: {
    subtitle: 'Parancsnoki pakli',
    drawDesc:
      'Rajzoljon alakzatokat egy terület köré, jelölje ki őket, majd töltse ki. A visszavonás megfordítja az utolsó kitöltést.',
    revealDesc:
      'Válassza ki a hatszögleteket, alakzatokat vagy jelzőket, hogy ismét felfedje vagy lefedje őket. Fedezze fel a kiválasztott tokenek körüli felfedéseket, mintha elmozdultak volna.',
    locationsDesc:
      'Jelölje ki a tokeneket, hogy elrejtse őket hexák alatti helyként. Válasszon hexákat vagy tokeneket a hexa elnevezéséhez.',
    toolsDesc:
      'Beállítások, oldalfelülírások, állapot, a másolt oldalak újraolvasása és a rács kalibrálása.',
    footer: 'A teljes útmutatásért lásd a „{help}” tájékoztatót.',
  },
  handout: {
    versionLabel: 'Változat',
    subtitle: 'Hex-by-hex felfedezés a Roll20 számára',
    footer: 'Használja a „{deck}” tájékoztatót az egykattintásos vezérlőkhöz.',
    overview: {
      heading: 'Áttekintés',
      body: 'A Hexploration egy hexadecimális térképet fed le átlátszatlan hatszögekkel. Ahogy a csapat mozog, a hatszögek, amelyeken áthaladnak (és ha úgy tetszik, a körülöttük lévő hatszögek) eltávolításra kerülnek, így a térkép egyenként hatszögletű kerül felfedésre. A rejtett helyek hatszögek alá helyezhetők, és a rendszer kijelenti, ha megtalálják. Működik a Jumpgate és Legacy játékokban, bármilyen méretű Hex (V) és Hex (H) rácson.',
      demo: 'Nézzen meg egy rövid bemutatót (az 1-es verziótól)',
    },
    quickStart: {
      heading: 'Gyors kezdés',
      steps: [
        'Nyisson meg egy oldalt, amelynek rácsának beállítása Hex (V) vagy Hex (H).',
        'Rajzoljon egy vagy több alakzatot (sokszög, téglalap, ellipszis vagy szabadkézi) az elrejteni kívánt terület köré.',
        'Jelölje ki az alakzatokat, és kattintson a Kitöltés gombra a Command Deckben (vagy írja be a !hexploration fill parancsot). Az alakzatokat hatszögek helyettesítik.',
        'Nem kötelező: a kitöltés előtt válassza ki a tokeneket a fontos helyekhez, és kattintson a Hely megjelölése lehetőségre. A hatszögek alatt vannak elrejtve, és felfedik őket, amikor felfedezik.',
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
        'Csak a token rétegen lévő tokenek mutatnak hatszögeket. A tokenek számát a Tokens That Reveal: alapértelmezés szerint a játékos tokenek állítják be, így a GM a térkép felfedése nélkül mozgathatja a szörnyeket.',
        'A token felfedi minden általa lefedett hatszöget (a nagy tokenek többre is kiterjednek), és ha a Reveal Along Path be van kapcsolva, minden hexát az útvonalon, amelyen végighúzták, beleértve az útpontokat is.',
        'A Sight Distance felfedi az egyes hatszögek körüli hatszögeket. Ha a Line of Sight be van kapcsolva, a hatszög csak akkor jelenik meg, ha nincs közöttük fedett hatszög.',
        'A hexadecimális feltárási távolságot a rendszer a hexákon tárolja, ahogy rajzolják. Azok a hatszögek csak belülről tárulnak fel annyi hatszögből, bármennyire is lát egy token. Használja hegyekre vagy erdőkre, amelyek elrejtik azt, ami mögöttük van.',
        'Pillantás módban a látótávolságon belüli hatszögek ahelyett, hogy eltűnnének, átlátszóvá válnak, és eltávolítódnak, amikor egy token belép beléjük.',
        'Az API nem jelenti a más modok által végrehajtott mozgásokat. A TokenMod lépéseit a rendszer automatikusan felveszi; más modok esetén válassza ki a tokeneket, és kattintson az Explore gombra, vagy hívja a Hexploration.revealAround(token)-t a saját mododból.',
        'Az API nem jelenti a más modok által végrehajtott mozgásokat. A TokenMod lépéseit a rendszer automatikusan felveszi; más modok esetén válassza ki a tokeneket, és kattintson az Explore gombra, vagy hívja a Hexploration.revealAround(token)-t a saját modjából.',
      ],
    },
    locations: {
      heading: 'Hexák és helyek neve',
      points: [
        'A Mark Location funkció rejtett helyekre változtatja a kiválasztott tokeneket. A már hatszög alatt lévő tokent azonnal elrejti; különben elrejti a következő kitöltés, amely lefedi.',
        'A fehér torony állapotjelzővel ellátott tokeneket a rendszer az 1-es verzióhoz hasonlóan helyként kezeli kitöltésekor.',
        'A rejtett helyjelzők a GM rétegre kerülnek. Amikor a hatszögük kiderül, a nevükkel együtt visszatérnek a token réteghez, és a felfedezésüket bejelentik.',
        'Name Hex ad egy hexa nevet token nélkül. A név megjelenik a GM-nek címkeként a GM rétegen, és közli, amikor a hatszög megjelenik.',
        'Az Announce Discoveries kiválasztja, hogy mindenki, csak a GM vagy senki sem látja a bejelentést. A Ping Discoveries a játékosok nézetét is áthelyezi a helyszínre.',
      ],
    },
    settings: {
      heading: 'Beállítások elemre',
      intro:
        'Módosítsa a beállításokat a !hexploration set segítségével (vagy a Beállítások gombbal). A Hex Layer, a Tokens That Reveal és a Language is beállítható a Mod beállítási oldalán.',
      colKey: 'Kulcsfontosságú',
      colName: 'Beállítás',
      colDesc: 'Leírás',
      perPage: '(Oldalonként beállítható.)',
    },
    jumpgate: {
      heading: 'Jumpgate és Legacy',
      points: [
        'A Hexploration kidolgozza, hogy a játék melyik motort használja, és megrajzolja a megfelelő formát. Bármelyik szerkesztőben rajzolt alakzatok kitölthetők.',
        'Ha a Hex Layer Auto-ra van állítva, a hexák az előtér rétegre, a tokenek fölé kerülnek, így a játékosok nem láthatják, mi van alatta. Ha az előtér réteg nem érhető el, a rendszer a token réteget használja helyette.',
        'A Jumpgate matematikailag szabályos hatszögeket rajzol, amelyek kissé eltérnek az örökölt hatszögektől. Ha a hatszögek nem illeszkednek az oldal rácsához, illesszen egy tokent egy hatszögletű középponthoz, jelölje ki, majd kattintson a Kalibrálás gombra. Válasszon ki két tokent ugyanazon sor (Hex V) vagy oszlop (Hex H) szomszédos hatszögletéből a hexadecimális méret javításához.',
        'Amikor egy oldalt vagy játékot másol, a hatszögei új azonosítókat kapnak. Futtassa az Újrakeresést az oldalon, hogy újra felvegye őket a névcímkéikkel és helyjelzőikkel együtt.',
      ],
    },
    upgrading: {
      heading: 'Frissítés az 1-es verzióról',
      points: [
        'A 2-es verziónak már nincs szüksége PathMath-ra, MatrixMath-ra, Vector Math-ra vagy HTML-készítőre. Eltávolíthatja őket, hacsak egy másik mod nem használja őket.',
        'A meglévő hexa térképek, nevek, helyjelzők és beállítások automatikusan frissülnek az első indításkor.',
        'Az 1-es verzió parancsai, beleértve a Hexploration_menu makrót is, továbbra is működnek.',
        'Az 1-es verzió lehetővé teszi, hogy bármely karaktert ábrázoló token felfedjen hatszögleteket. Állítsa be a felfedő tokeneket karakterjelzőkre, hogy megtartsa ezt a viselkedést.',
      ],
      colV1: '1-es verzió parancs',
      colV2: '2-es verzió parancs',
    },
    troubleshooting: {
      heading: 'Hibaelhárítás',
      points: [
        'Semmi sem történik, amikor egy token mozog: ellenőrizze, hogy a token a tokenrétegen van-e, és egyezik-e a felfedő tokenekkel, és hogy az oldal rendelkezik-e hexákkal (!hexploration állapot).',
        'A hatszögek el vannak tolva a rácstól: használja a Kalibrálást, majd ellenőrizze a token segítségével néhány hatszöget a térképen.',
        'Egy oldal vagy játék másolása után a hexák nem jelennek meg: futtassa az Újrakeresést az oldalon.',
        'Kitöltés szerint a területnek nincs hatszög középpontja: az alakzatnak tartalmaznia kell legalább egy hatszög középpontját.',
        'Ha bármi mást szeretne, ellenőrizze az API-konzol naplóját, és adja meg az üzeneteit, amikor segítséget kér.',
      ],
    },
    languages: {
      heading: 'Nyelvek',
      body: 'Válasszon nyelvet a !hexploration beállított nyelvvel. Elérhető nyelvek:',
    },
    credits: {
      heading: 'Kredit',
      original: 'Eredeti mod által',
      maintainer: 'A 2-es verziót karbantartja',
      marketplace: 'Ada művészeti csomagjai a Roll20 Marketplace-en',
      support:
        'Ha hibát talál, vagy ötlete van, tegye közzé a Roll20 Mod fórumban, vagy nyissa meg a problémát a GitHubon, és adja meg az API-konzol naplójából származó üzeneteket.',
    },
  },
};

export default TRANSLATION;
