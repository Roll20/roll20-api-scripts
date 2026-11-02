const TRANSLATION = {
  titles: {
    ready: 'A koncentráció készen áll.',
    menu: 'Koncentráció beállításai',
    help: 'Koncentrációs parancsok',
    status: 'Aki Koncentrál',
    advantage: 'Koncentráció-megtakarítás',
    reset: 'Koncentráció visszaállítása',
    concentration: 'Koncentráció',
    save: 'Koncentráció Mentés',
    check: 'Koncentráció ellenőrzése',
  },
  messages: {
    migrated:
      'Frissítve az 1.0-s verzióról. A beállítások és az előnyök listája megmaradt, és a régi makrók továbbra is működnek.',
    reconciled:
      'Utolérte a térképet: koncentráló tokenek találhatók {added}, régi bejegyzések eltávolítva {dropped}.',
    readyHint: 'A beállításokhoz írja be: {command}, vagy nyissa meg a Command Deck tájékoztatót.',
    settingChanged: '{setting} mostantól {value}.',
    confirmReset:
      'Minden beállítást visszaállít az alapértelmezettre, és törli az előnyök listáját? A koncentrációjelzők a térképen maradnak.',
    reset: 'A beállítások visszaállnak az alapértelmezett értékekre.',
    journal: 'Átépített tájékoztatók: {help} és {deck}.',
  },
  notices: {
    started: '{name} most a következőre koncentrál: {spell}.',
    startedNoSpell: '{name} most koncentrál.',
    switched: '{name} már nem a {old}-ra koncentrál, és most a {spell}-ra koncentrál.',
    switchedNoSpell: '{name} most koncentrál.',
    ended: '{name} már nem a {spell}-ra koncentrál.',
    endedNoSpell: '{name} már nem koncentrál.',
    lost: '{name} elveszti a koncentrációt a {spell}-ra.',
    lostNoSpell: '{name} elveszti a koncentrációt.',
    kept: '{name} továbbra is a {spell}-ra koncentrál.',
    keptNoSpell: '{name} folyamatosan koncentrál.',
    zeroHp: '{name} 0 életpontra esik, és elveszíti a koncentrációját a {spell}-ra.',
    zeroHpNoSpell: '{name} 0 életpontra esik, és elveszti a koncentrációt.',
    checkNeeded:
      '{name} Alkotmánymentő dobást kell tennie, hogy továbbra is koncentrálhasson: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Módosító',
    roll: 'Tekercs',
    advantageRoll: '{first} és {second} (előny)',
    success: 'Siker',
    failure: 'Hiba',
  },
  menu: {
    concentratingCount: 'Most koncentrál: {count}',
    settings: 'Beállítások elemre',
    footer:
      'Írja be a következőt: {command}, hogy visszatérjen ide. Minden gomb a „{deck}” tájékoztatóban is megtalálható.',
  },
  status: {
    none: 'Senki sem koncentrál.',
  },
  advantage: {
    intro:
      'Az On-ra beállított karakterek koncentrációjuk előnnyel ment, mint a War Caster feat esetében. Ez az automatikus mentésekre vonatkozik.',
    none: 'Ebben a játékban nincsenek karakterek.',
  },
  buttons: {
    roll: 'Tekercs',
    advantage: 'Előny',
    status: 'Állapot',
    advantageMenu: 'Előny menü',
    help: 'Segítség',
    reset: 'Reset',
    confirmReset: 'Beállítások visszaállítása',
    end: 'Vége',
    menu: 'Menü',
    concentrate: 'Koncentrálj a…',
    toggle: 'Váltás',
    journal: 'Rebuild Handouts',
  },
  prompts: {
    spell: 'Varázslat',
  },
  values: {
    on: 'On',
    off: 'Le',
    bar: 'Bar {bar}',
    unnamed: 'Névtelen',
    sendTo: {
      everyone: 'Mindenki',
      character: 'Karakter',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Alapvető',
      detailed: 'Részletes',
    },
  },
  settings: {
    language: {
      label: 'Nyelv',
      desc: 'A csevegőüzenetek és tájékoztatók nyelve.',
    },
    command: {
      label: 'Parancs',
      desc: 'A chat parancs, a "!" nélkül. Az 1.0-s verzió makrók koncentrációt használnak.',
    },
    statusmarker: {
      label: 'Állapotjelző',
      desc: 'A token marker, amely a koncentrációt mutatja. Egyéni token markerek használhatók.',
    },
    bar: {
      label: 'HP bár',
      desc: 'Az elütési pontokat tároló jelzősáv. Károsodása koncentrációs mentést igényel.',
    },
    send_reminder_to: {
      label: 'Emlékeztető küldése a címre',
      desc: 'Aki látja a koncentrációs üzeneteket és menti: mindenki, a GM vagy a karakter játékosai (a GM kap egy példányt).',
    },
    auto_add_concentration_marker: {
      label: 'Auto Add Con. Jelző',
      desc: 'Adja hozzá a jelölőt, amikor koncentrációs varázslatot vet ki egy lapról.',
      hint: 'D&D 5e 2014 (OGL) és 2024 lapok.',
    },
    auto_roll_save: {
      label: 'Automatikus tekercsmentés',
      desc: 'Dobd a mentést, amint egy koncentráló jelző sebzést szenved. Ha ki van kapcsolva, az emlékeztetőn Roll és Advantage gombok találhatók.',
    },
    show_roll_button: {
      label: 'Roll gomb',
      desc: 'Adja hozzá a Roll és Advantage gombokat az emlékeztetőhöz, ha az Automatikus tekercsmentés ki van kapcsolva.',
    },
    end_at_zero: {
      label: 'Vége 0 HP-nál',
      desc: 'Fejezze be a koncentrációt mentés nélkül, amikor egy token 0 életpontra esik.',
    },
    bonus_attribute: {
      label: 'Bónusz attribútum',
      desc: 'A koncentráció mentéshez hozzáadott lapattribútum. A constitution_save_mod a D&D 5e 2014 és 2024 lapokon működik.',
    },
    debug: {
      label: 'Hibakeresési mód',
      desc: 'Írjon megjegyzéseket a helyesírás-észlelésről és a mentésekről az API-konzolra támogatási kérésekhez.',
    },
    support_mode: {
      label: 'Támogatási mód',
      desc: 'Mennyit ír a Debug Mode: Basic (rövid) vagy Detailed.',
    },
  },
  help: {
    menu: 'Nincs kiválasztva (GM): nyissa meg a beállításokat. Kiválasztott jelzőkkel: kezdő vagy végkoncentráció.',
    toggle:
      'Kezdj el egy varázslatra koncentrálni a kiválasztott jelzőkkel. A váltáshoz nevezzen el egy másik varázslatot; futtassa újra a végére.',
    end: 'Végkoncentráció a kiválasztott tokenekhez.',
    status: 'Listázza ki, aki koncentrál, a Vége gombokkal.',
    config: 'Módosítson egy beállítást, például config auto_roll_save|false.',
    advantageMenu: 'Válassza ki, mely karakterek dobáskoncentrációja takarít meg előnyt.',
    toggleAdvantage: 'Kapcsolja be vagy ki az előnyt egy karakterhez.',
    roll: 'Mentsen egy emlékeztető Roll vagy Advantage gombjával.',
    journal: 'Építse újra a Help és Command Deck segédanyagait.',
    reset: 'Állítson vissza minden beállítást az alapértelmezettre.',
    help: 'Mutasd ezt a listát.',
    footer:
      'A teljes utasítás a "{help}" tájékoztatóban található; gombok a "{deck}" tájékoztatóban találhatók.',
    playerFooter: 'Először válassza ki a tokent.',
  },
  errors: {
    noSelection: 'Először válasszon ki egy tokent.',
    notYours: 'Csak az általad irányított tokenek koncentrációját módosíthatod.',
    gmOnly: 'Csak a GM használhatja ezt a parancsot.',
    notConcentrating: 'Ez a jelző nem koncentrál.',
    unknownSetting: 'Nincs "{key}" nevű beállítás.',
    badSettingValue: 'A „{value}” nem érvényes érték a következőhöz: {key}.',
    rollExpired: 'Ez a gomb lejárt.',
    unknownCharacter: 'Ez a karakter már nem létezik.',
    internal: 'Valami elromlott. Az API-konzol tartalmazza a részleteket.',
  },
  hints: {
    noSelection: 'Válassza ki a görgő tokent, majd futtassa újra a parancsot.',
    rollExpired: 'A gombok egyszer és 10 percig működnek. Sérítse meg újra a tokent egy újért.',
    unknownSetting:
      'A beállítások megtekintéséhez írja be a parancsot úgy, hogy nincs kiválasztva.',
  },
  warnings: {
    unknownMarker:
      'A „{marker}” állapotjelző nem tartozik a játék jelzői közé. Válasszon másikat a beállításokban.',
  },
  deck: {
    subtitle: 'Command Deck',
    selected: 'Kiválasztott tokenek',
    selectedDesc: 'Először válassza ki a görgő tokent.',
    table: 'A táblázat',
    tableDesc: 'Nézze meg, ki koncentrál, és kinek van előnye a mentésekben.',
    tools: 'Eszközök',
    toolsDesc: 'Beállítások, parancslista és segédanyagok.',
    footer: 'A teljes utasítás a „{help}” tájékoztatóban található.',
  },
  handout: {
    versionLabel: 'Változat',
    subtitle: 'Koncentrációjelzők, emlékeztetők és mentések a D&D 5e számára',
    overview: {
      heading: 'Áttekintés',
      body: 'A koncentráció nyomon követi, hogy ki melyik varázslatra koncentrál. Jelzőt tesz a dobó jelzőjére, eldob (vagy kér) egy Alkotmányt, kivéve, ha a jelző sebzést szenved, és közli az asztallal, ha a koncentráció véget ér.',
    },
    quickStart: {
      heading: 'Gyors kezdés',
      steps: [
        'Válassza ki a görgő tokent, és írja be a !concentration szót, majd a varázslatot, például !concentration Bless.',
        'Módosítsa a token elütési pontjait a sávbuborékban. A mentést DC 10-nél dobják, vagy a sebzés felénél, ha ez magasabb.',
        'Futtassa újra ugyanazt a parancsot, vagy vegye le a jelölőt a koncentráció befejezéséhez.',
        'A beállítások megnyitásához írja be a !concentration parancsot úgy, hogy nincs kiválasztva.',
      ],
    },
    concentrating: {
      heading: 'Koncentrálva',
      points: [
        'Egy másik varázslat elnevezése átkapcsolja a koncentrációt, akárcsak egy új koncentrációs varázslat varázslása.',
        'A marker kézzel történő felhelyezése varázslat nélkül elindítja a koncentrációt; levétele vagy a token törlése véget ér.',
        'Egy koncentráló karakter új linkelt tokenje megkapja a jelölőt, és a jelölőt hordozó beillesztett token nyomon követhető.',
        'Az egy karakterből álló tokenek egy kapcsolt találati sávval megosztják a koncentrációt. A nem összekapcsolt tokenek, például egy lapon lévő goblincsomag, magukra koncentrálnak.',
        'Mindenki lát üzenetet, amikor a koncentráció elkezdődik, átkapcsol vagy véget ér, hacsak az Emlékeztető küldése mást nem mond.',
      ],
    },
    saves: {
      heading: 'A koncentráció megment',
      points: [
        'A DC 10 vagy az elszenvedett sebzés fele, amelyik nagyobb, DC 30-ig.',
        'A módosító a karakter lapján található bónuszattribútumból származik; a hiányzó érték 0-nak számít.',
        'Automatikus tekercs A tekercsek mentése egyszerre. Ha ki van kapcsolva, az emlékeztetőn Roll és Advantage gombok találhatók a lejátszóhoz vagy a GM-hez.',
        'A sikertelen mentés véget vet a koncentrációnak. Ha az End at 0 HP be van kapcsolva, a 0 életpontra csökkenés mentés nélkül fejeződik be.',
        'Az Advantage Menu karakterelőnyt biztosít az automatikus mentéseknél, akárcsak a War Caster.',
      ],
    },
    automatic: {
      heading: 'Lapról varázsolt varázslatok',
      points: [
        'Auto Add Con. A jelölő bekapcsolása, a koncentrációs varázslat egy D&D 5e 2014 (OGL) vagy 2024 lapról hozzáadja a jelölőt.',
        'A görgők jelzői az általuk megtekintett oldalon meg vannak jelölve; ha nincsenek, akkor bármelyik oldalon lévő tokenek vannak.',
        'Csak a GM, egy másik mod vagy a karakter játékosainak kártyái számítanak. Ugyanannak a varázslatnak az ismételt leadása semmit sem változtat.',
        'Egy D&D 2024 kártya, amely csak a szövegében említi a koncentrációt, mint például a War Caster feat, elindíthatja a koncentrációt, de soha nem helyettesíti a varázslatot.',
        'A D&D 2024 lapokhoz szükség lehet a Kísérleti API-kiszolgálóra. Kapcsolja be a hibakeresési módot, hogy megtudja, miért észlelt vagy nem észlelt egy varázslatot.',
      ],
    },
    players: {
      heading: 'Játékosok',
      points: [
        'A játékosok elkezdhetik és befejezhetik a koncentrációt az általuk irányított jelzőkkel, és használhatják a Roll és az Advantage gombokat saját mentéseikhez.',
        'Az Emlékeztető küldése funkcióval Karakterre állítva az üzeneteket a rendszer suttogja a karakter játékosainak és a GM-nek.',
      ],
    },
    commands: {
      heading: 'Parancsok',
      intro: 'Más modok, például a ScriptCards is elküldhetik ezeket a parancsokat.',
      colCommand: 'Parancs',
      colDesc: 'Mit csinál',
    },
    settings: {
      heading: 'Beállítások elemre',
      intro:
        'Módosítsa a beállításokat a beállítási kártya gombjaival vagy a config <key>|<value> segítségével. Néhányat a Mod oldalán is be lehet állítani.',
      colKey: 'Kulcsfontosságú',
      colName: 'Név',
      colDesc: 'Mit csinál',
    },
    upgrading: {
      heading: 'Frissítés az 1.0-s verzióról',
      points: [
        'A beállítások, az előnylista és minden parancs továbbra is működik.',
        'Az üzenetek most azt mondják, hogy mikor ér véget a koncentráció, és melyik varázslatra.',
        'A jelzőt már hordozó tokeneket a rendszer indításkor veszi fel.',
      ],
    },
    troubleshooting: {
      heading: 'Hibaelhárítás',
      points: [
        'Nincs mentés, ha a találati pontok csökkennek: ellenőrizze, hogy a tokenben van-e a jelölő, és hogy a HP Bar az a sáv, amelyet megváltoztatott. Más Modok által az API-n keresztül végrehajtott módosítások nem okoznak eseményeket, így nem láthatók.',
        'A módosító 0: ellenőrizze a bónusz attribútumot a karakter lapjával.',
        'A lapról leadott varázslatok nem észlelhetők: kapcsolja be a hibakeresési módot, hajtsa végre újra a varázslatot, és olvassa el az API-konzolt.',
        'Két karakternek közös a neve: az észlelés az első egyezést használja. Adjon egyedi neveket a karaktereknek.',
      ],
    },
    languages: {
      heading: 'Nyelvek',
      body: 'A Concentration az alábbi nyelvekre van lefordítva. Válasszon egyet a Nyelv beállítással.',
      colCode: 'Kód',
      colName: 'Nyelv',
      colNative: 'Natív név',
    },
    credits: {
      heading: 'Kredit',
      original: 'Eredeti Mod by',
      maintainer: 'által karbantartott',
      support: 'Jelentse be a hibákat és ötleteket a Roll20 Mod fórumon vagy a GitHubon.',
    },
    footer: 'Minden művelet gombja a „{deck}” tájékoztatóban található.',
  },
};

export default TRANSLATION;
