const TRANSLATION = {
  titles: {
    ready: 'Heexploration je připraven.',
    settings: 'Nastavení Heexploration',
    languages: 'Vyberte jazyk',
    pageSettings: 'Nastavení stránky: {page}',
    status: 'Stav průzkumu: {page}',
    help: 'Příkazy pro průzkum',
    confirm: 'Prosím potvrďte',
  },
  discovery: {
    title: 'Místo objeveno',
  },
  menu: {
    draw: 'Remíza',
    reveal: 'Odhalit a skrýt',
    locations: 'Místa',
    tools: 'Nástroje',
    layerInUse: 'Na {layer} se kreslí nové hexy.',
    pageSettingsHelp:
      'Tato nastavení platí pouze pro tuto stránku. Nastavení označená ★ přepíší globální nastavení.',
  },
  buttons: {
    fill: 'Vyplnit',
    fillInverse: 'Inverzní výplň',
    undo: 'Vrátit zpět výplň',
    reveal: 'Odhalit',
    conceal: 'Skrývat',
    explore: 'Prozkoumat',
    revealPage: 'Odhalit stránku',
    resetPage: 'Obnovit stránku',
    mark: 'Označte umístění',
    unmark: 'Zrušit označení',
    name: 'Jméno Hex',
    settings: 'Nastavení',
    pageSettings: 'Nastavení stránky',
    status: 'Postavení',
    rescan: 'Znovu naskenujte',
    calibrate: 'Kalibrovat',
    calibrateReset: 'Resetovat kalibraci',
    help: 'Pomoc',
    change: 'Přeměna',
    menu: 'Menu',
    clearOverrides: 'Vymazat přepisy',
    confirmReset: 'Ano, Odebrat všechny hexy',
  },
  prompts: {
    name: 'Název místa (pro vymazání ponechte prázdné)',
  },
  values: {
    on: 'Na',
    off: 'Vypnuto',
    none: 'Žádný',
    hexLayer: {
      auto: 'Auto (popředí, pokud je k dispozici)',
      foreground: 'vrstva popředí',
      objects: 'vrstva tokenů',
    },
    revealBy: {
      players: 'Hráčské žetony',
      characters: 'Žetony postav',
      all: 'Všechny tokeny',
    },
    revealMode: {
      clear: 'Jasný',
      glimpse: 'Záblesk',
    },
    announce: {
      all: 'Každý',
      gm: 'Pouze GM',
      off: 'Vypnuto',
    },
    orientation: {
      vertical: 'Hexadecimální (V)',
      horizontal: 'Hexadecimální (H)',
    },
    fillKind: {
      fill: 'Vyplnit',
      fillInverse: 'Inverzní výplň',
      conceal: 'Skrývat',
    },
  },
  settings: {
    language: {
      label: 'Jazyk',
      desc: 'Jazyk pro nabídky, zprávy a letáky.',
    },
    hexLayer: {
      label: 'Hexadecimální vrstva',
      desc: 'Kde se kreslí nové hexy. Auto zkouší vrstvu popředí (nad žetony) a pokud ji hra nepodporuje, přejde zpět na vrstvu žetonů.',
    },
    fillColor: {
      label: 'Barva výplně',
      desc: 'Barva nových hexů. Použijte rgba() pro průhledné hexy, například rgba(0,0,0,0,8).',
    },
    strokeColor: {
      label: 'Barva ohraničení',
      desc: 'Barva obrysu nových hexů.',
    },
    labelColor: {
      label: 'Barva štítku',
      desc: 'Barva jmenovek pouze GM na pojmenovaných hexech.',
    },
    glimpseColor: {
      label: 'Barva záblesku',
      desc: 'Barevné hexy se při zahlédnutí změní na (režim Odhalení letmým pohledem). Použijte průhlednou barvu rgba().',
    },
    strokeWidth: {
      label: 'Šířka okraje',
      desc: 'Šířka obrysu nových hexů v pixelech (0 až 20).',
    },
    maxDistance: {
      label: 'Hexadecimální vzdálenost odhalení',
      desc: 'Aplikuje se na hexy, když jsou taženy: žeton musí být v tomto počtu hexů, aby je odhalil, ať už vidí jakkoli daleko. Nechte prázdné bez omezení.',
    },
    revealDistance: {
      label: 'Pohledová vzdálenost',
      desc: 'Kolik hexů kolem pohybujícího se žetonu je odhaleno (0 až 20). 0 odhaluje pouze hexy, kterými žeton prochází.',
    },
    lineOfSight: {
      label: 'Zornost',
      desc: 'Když je zapnuto, hex je odhalen pouze v případě, že mezi ním a žetonem není žádný krytý hex.',
    },
    revealPath: {
      label: 'Odhalení Po cestě',
      desc: 'Když je zapnuto, je odhalen každý hex, kterým žeton při tažení projde (včetně trasových bodů), nejen tam, kde se zastaví.',
    },
    revealBy: {
      label: 'Tokeny, které odhalují',
      desc: 'Které žetony na vrstvě žetonů odhalují hexy: žetony ovládané hráčem, žetony, které představují jakoukoli postavu, nebo každý žeton.',
    },
    revealMode: {
      label: 'Režim odhalení',
      desc: 'Clear odstraní hexy na dohled. Letmý pohled je místo toho dělá průhlednými; jsou odstraněny, když do nich vstoupí token.',
    },
    announce: {
      label: 'Oznamte objevy',
      desc: 'Kdo uvidí chatovou zprávu, když je objeveno pojmenované místo.',
    },
    pingDiscoveries: {
      label: 'Ping Discovery',
      desc: 'Když je zapnuto, hráči jsou pingnuti na pojmenované místo, když je objeveno.',
    },
    hideCoveredTokens: {
      label: 'Skryjte kryté žetony',
      desc: 'Roll20 kreslí jména, pruhy a aury nad hexy. Když jsou žetony pod krytým hexem zapnuté, jejich jméno, pruhy a aury viditelné pro hráče jsou vypnuté a znovu zapnuté, když jsou odkryty.',
    },
  },
  status: {
    engine: 'Herní engine',
    grid: 'Mřížka',
    layer: 'Hexadecimální vrstva',
    hexes: 'Hexy',
    named: 'Pojmenované hexy',
    icons: 'Tokeny polohy',
    glimpsed: 'Zahlédnuté hexy',
    pending: 'Místa čekající na zaplnění',
    calibrated: 'Zkalibrováno',
    overrides: 'Přepíše stránku',
    undo: 'Zpět k dispozici',
  },
  messages: {
    filled:
      'Vyplnění dokončeno. Vylosované hexy: {created}. Změna stylu: {restyled}. Skrytá místa: {icons}.',
    revealed: 'Odhalené hexy: {count}.',
    revealedPage: 'Každé odhalené hex na stránce ({count}).',
    confirmReset:
      'Odebrat každé hex z „{page}“ ({count})? Tokeny umístění se vrátí do vrstvy tokenů. Zpět to nelze vrátit.',
    resetPage: 'Ze stránky byly odstraněny hexy: {count}.',
    undone:
      'Poslední výplň zrušena. Odstraněné hexy: {removed}. Obnovené obnovené hexy: {restored}.',
    named: 'Hexusy s názvem „{name}“: {count}.',
    unnamed: 'Jména vymazána: {count}.',
    marked:
      'Místa skrytá na stávajících hexech: {attached}. Čekání na další výplň, která je pokryje: {pending}.',
    unmarked: 'Tokeny, které již nejsou umístěními: {count}.',
    settingChanged: '{setting} nastaveno na {value}.',
    rescanned:
      'Opětovné skenování dokončeno. Uchováno: {kept}. Přijato: {adopted}. Znovu vyplněno: {moved}. Chybějící a zapomenuté: {dropped}. Znovu propojené štítky: {labels}. Tokeny polohy byly znovu propojeny: {icons}.',
    calibrated:
      'Mřížka zkalibrována (krok sloupce {colStep}px, krok řádku {rowStep}px). Znovu naskenovat: ponecháno {kept}, znovu zadáno {moved}, přijato {adopted}.',
    calibrationReset:
      'Kalibrace odstraněna. Znovu naskenovat: ponecháno {kept}, znovu uloženo {moved}, přijato {adopted}.',
    journalRebuilt: 'Materiály „{help}“ a „{deck}“ byly přepracovány.',
    migrated:
      'Vaše hex mapy Heexploration 1.x byly upgradovány. Pokud byla tato hra zkopírována ze starší hry, spusťte znovu skenování na každé stránce hexové mapy.',
    pruned:
      'Uložená hexy, která již neexistují a byla zapomenuta: {dropped}. Pokud byla tato hra nebo stránka zkopírována, spusťte Rescan na stránce a znovu seberte její hexy.',
    readyHint:
      'Zadejte !hexploration pro nabídku nebo otevřete leták „Hexploration – Command Deck“.',
  },
  warnings: {
    foregroundUnavailable:
      'Tato hra nepodporuje kreslení na vrstvě popředí, takže hexy byly nakresleny na vrstvu žetonů.',
    someFailed:
      'Hexametry, které nebylo možné nakreslit: {count}. Podrobnosti naleznete v konzole API.',
  },
  errors: {
    noPage: 'Nelze najít stránku, na které by se dalo pracovat.',
    notHex: 'Tato stránka nepoužívá hexadecimální mřížku.',
    noPolygons: 'Vyberte jeden nebo více nakreslených tvarů, které chcete vyplnit.',
    emptyArea: 'Vybraná oblast neobsahuje žádné středy šestihran.',
    tooMany: 'To by vytvořilo příliš mnoho hexů najednou ({count}).',
    nothingToConceal: 'Vyberte nakreslené tvary nebo žetony, které chcete skrýt.',
    nothingToReveal: 'Vyberte hexy, nakreslené tvary nebo žetony, které chcete odhalit.',
    noTokens: 'Nejprve vyberte jeden nebo více žetonů.',
    noHexes: 'Nejprve vyberte jeden nebo více hexů (nebo žetonů stojících na hexech).',
    nothingToUndo: 'Neexistuje žádná výplň, kterou lze vrátit zpět.',
    unknownCommand: 'Neznámý příkaz: {command}',
    unknownSetting: 'Neznámé nastavení: {key}',
    unknownPageSetting: 'Nastavení, která lze nastavit na stránce: {keys}',
    invalidValue: '„{value}“ není platná hodnota pro {key}.',
    calibrateNeedsTokens: 'Vyberte jeden nebo dva žetony přichycené na středy hexů.',
    calibrateFailed: 'Tyto tokeny nelze použít ke kalibraci.',
    unexpected: 'Něco se pokazilo: {message}',
  },
  hints: {
    noPage: 'Otevřete stránku, na které chcete pracovat, nebo na ní něco vyberte.',
    notHex: 'Nastavte mřížku stránky na Hex (V) nebo Hex (H) v Nastavení stránky.',
    noPolygons:
      'Nakreslete kolem oblasti mnohoúhelník, obdélník, elipsu nebo tvar od ruky, vyberte jej a zkuste to znovu.',
    emptyArea: 'Nakreslete větší tvar nebo zkontrolujte nastavení mřížky stránky.',
    tooMany: 'Vyplňte menší oblast nebo oblast rozdělte do několika tvarů.',
    noHexes: 'Hexy jsou na popředí nebo vrstvě tokenů; přepněte na tuto vrstvu a vyberte je.',
    unknownCommand: 'Chcete-li zobrazit seznam příkazů, zadejte !hexploration help.',
    unknownSetting: 'Chcete-li zobrazit všechna nastavení, zadejte !hexploration set.',
    calibrateNeedsTokens:
      'Přichyťte žeton do středu hexu a vyberte jej. Vyberte druhý žeton přichycený na sousední hex ve stejném řádku (Hex V) nebo sloupci (Hex H), abyste také opravili velikost hexu.',
    calibrateFailed:
      'Dva žetony musí být ve stejném řádku (Hex V) nebo stejném sloupci (Hex H), alespoň jeden hex od sebe.',
    unexpected: 'Podrobnosti jsou v protokolu konzoly API.',
  },
  help: {
    menu: 'Ukaž menu.',
    fill: 'Zakryjte vybrané nakreslené tvary hexy.',
    fillInverse: 'Zakryjte celou stránku kromě vybraných tvarů.',
    undo: 'Zrušte poslední výplň, inverzní výplň nebo skrytí a obnovte tvary, které použila.',
    reveal: 'Odhalte vybrané hexy a hexy pod vybranými tvary a žetony.',
    revealPage: 'Odhalte každé hex na stránce bez oznámení.',
    conceal: 'Znovu zakryjte oblast pod vybranými tvary a žetony hexy.',
    explore: 'Odhalte kolem vybraných žetonů, jako by se tam právě přesunuly.',
    resetPage: 'Odstraňte každý hex na stránce (nejprve se ptá).',
    name: 'Pojmenujte vybrané hexy nebo hexy pod vybranými žetony. Chcete-li jej vymazat, ponechte název prázdný.',
    mark: 'Proměňte vybrané žetony na skrytá místa.',
    unmark: 'Zabraňte tomu, aby se vybrané tokeny staly skrytými místy.',
    set: 'Změňte nastavení nebo zobrazte všechna nastavení.',
    pageSet: 'Přepsat nastavení odkrytí pouze na aktuální stránce.',
    pageClear: 'Odstraňte přepsání aktuální stránky.',
    rescan: 'Znovu vytvořte seznam hex na stránce, například po zkopírování stránky nebo hry.',
    calibrate:
      'Zarovnejte hexovou mřížku jedním nebo dvěma vybranými žetony přichycenými do středů hexů.',
    calibrateReset: 'Odstraňte kalibraci aktuální stránky.',
    status: 'Ukažte, co Heexploration ví o aktuální stránce.',
    journal: 'Znovu sestavte podklady pro balíček nápovědy a příkazů.',
    help: 'Zobrazit tento seznam.',
    handout: 'Úplné pokyny jsou v letáku „{name}“.',
  },
  deck: {
    subtitle: 'Velitelský balíček',
    drawDesc:
      'Nakreslete tvary kolem oblasti, vyberte je a poté vyplňte. Zpět vrátí poslední výplň zpět.',
    revealDesc:
      'Vyberte hexy, tvary nebo žetony, abyste je znovu odhalili nebo zakryli. Prozkoumejte odhalení kolem vybraných žetonů, jako by se pohnuly.',
    locationsDesc:
      'Vyberte žetony a skryjte je jako místa pod hexy. Vyberte hexy nebo žetony a pojmenujte hex.',
    toolsDesc:
      'Nastavení, přepsání stránek, stav, opětovné skenování zkopírovaných stránek a kalibrace mřížky.',
    footer: 'Úplné pokyny naleznete v letáku „{help}“.',
  },
  handout: {
    versionLabel: 'Verze',
    subtitle: 'Průzkum hex po hexu pro Roll20',
    footer: 'Pro ovládání jedním kliknutím použijte leták „{deck}“.',
    overview: {
      heading: 'Přehled',
      body: 'Hexploration pokrývá hexovou mapu s neprůhlednými hexy. Jak se skupina pohybuje, hexy, kterými prochází (a chcete-li, hexy kolem nich), jsou odstraněny, takže mapa je odkrývána jeden hex po druhém. Skrytá místa mohou být umístěna pod hexy a jsou oznámena, když jsou nalezena. Funguje ve hrách Jumpgate a Legacy, na mřížkách Hex (V) a Hex (H) jakékoli velikosti.',
      demo: 'Podívejte se na krátkou ukázku (od verze 1)',
    },
    quickStart: {
      heading: 'Rychlý start',
      steps: [
        'Otevřete stránku, jejíž mřížka je nastavena na Hex (V) nebo Hex (H).',
        'Nakreslete jeden nebo více tvarů (mnohoúhelník, obdélník, elipsa nebo od ruky) kolem oblasti, kterou chcete skrýt.',
        'Vyberte tvary a klikněte na Vyplnit v balíčku příkazů (nebo zadejte !hexploration fill). Tvary jsou nahrazeny hexy.',
        'Volitelné: před vyplněním vyberte žetony pro důležitá místa a klikněte na Označit místo. Jsou ukryty pod hexy a oznámeny, když jsou objeveny.',
        'Přesuňte žeton hráče. Každý hex, kterým projde, a hexy v jeho Viditelné vzdálenosti jsou odhaleny.',
      ],
    },
    commands: {
      heading: 'Příkazy',
      intro:
        'Tyto příkazy mohou používat pouze GM. Většina působí na vybrané objekty; zbytek působí na stránce, kterou si prohlížíte.',
      colCommand: 'Příkaz',
      colDesc: 'Co to dělá',
    },
    revealing: {
      heading: 'Jak funguje odhalování',
      points: [
        'Pouze žetony na vrstvě žetonů odhalují hexy. Počet žetonů je nastaven pomocí žetonů, které se odhalují: žetony hráčů ve výchozím nastavení, takže GM může pohybovat příšerami, aniž by odkrýval mapu.',
        'Žeton odhaluje každý hex, který zakrývá (velké žetony jich pokrývají několik), a se zapnutou funkcí Odhalení podél cesty každý hex na trase, po které byl tažen, včetně navigačních bodů.',
        'Viditelná vzdálenost odhaluje hexy kolem každého z těchto hexů. Se zapnutou linií viditelnosti je hex odhalen pouze v případě, že mezi nimi není žádný krytý hex.',
        'Hexová vzdálenost odhalení je uložena na hexech tak, jak jsou kresleny. Tyto hexy jsou odhaleny pouze z tolika hexů, jakkoli daleko žeton vidí. Použijte jej na hory nebo lesy, které skrývají to, co je za nimi.',
        'V režimu Glimpse se hexy v dohledu stanou průhlednými, místo aby zmizely, a jsou odstraněny, když do nich vstoupí žeton.',
        'API nehlásí pohyby provedené jinými mody. Pohyby TokenMod se sbírají automaticky; pro další mody vyberte tokeny a klikněte na Prozkoumat, nebo zavolejte Heexploration.revealAround(token) ze svého vlastního modu.',
        'API nehlásí pohyby provedené jinými mody. Pohyby TokenMod se sbírají automaticky; pro další mody vyberte tokeny a klikněte na Prozkoumat, nebo zavolejte Heexploration.revealAround(token) ze svého vlastního modu.',
      ],
    },
    locations: {
      heading: 'Pojmenované hexy a umístění',
      points: [
        'Označit místo změní vybrané žetony na skrytá místa. Žeton, který je již pod hexem, je okamžitě skryt; jinak je skryta další výplní, která jej zakrývá.',
        'Žetony se značkou stavu bílé věže jsou při vyplňování také považovány za místa, jako ve verzi 1.',
        'Žetony skrytých umístění se přesunou do vrstvy GM. Když je jejich hex odhalen, vrátí se do vrstvy žetonů se zobrazeným jménem a jejich objev je oznámen.',
        'Name Hex dává hexu jméno bez žetonu. Jméno je ukázáno GM jako štítek na GM vrstvě a oznámeno, když je odhalen hex.',
        'Announce Discoveries volí, zda oznámení uvidí všichni, pouze GM nebo nikdo. Ping Discoveries také přesune pohled hráčů na místo.',
      ],
    },
    settings: {
      heading: 'Nastavení',
      intro:
        'Změňte nastavení pomocí sady !hexploration (nebo tlačítka Nastavení). Hexadecimální vrstvu, tokeny, které odhalují a jazyk lze také nastavit na stránce nastavení modu.',
      colKey: 'Klíč',
      colName: 'Nastavení',
      colDesc: 'Popis',
      perPage: '(Lze nastavit na stránku.)',
    },
    jumpgate: {
      heading: 'Jumpgate a Legacy',
      points: [
        'Heexploration zjistí, který engine hra používá, a nakreslí odpovídající druh tvaru. Tvary nakreslené v obou editorech lze vyplnit.',
        'Při nastavení Hex Layer na Auto se hexy kreslí na vrstvu popředí nad žetony, takže hráči nevidí, co je pod nimi. Pokud vrstva popředí není k dispozici, použije se místo ní vrstva tokenu.',
        'Jumpgate kreslí matematicky pravidelné hexy, které mají trochu jiný tvar než hexy Legacy. Pokud hexy nejsou zarovnány s mřížkou stránky, přichyťte token ke středu hexu, vyberte jej a klikněte na Kalibrovat. Vyberte dva žetony na sousedních hexech stejného řádku (Hex V) nebo sloupce (Hex H), abyste také opravili velikost hexu.',
        'Když je stránka nebo hra zkopírována, její hexy získají nová ID. Spusťte Rescan na stránce a vyzvedněte je znovu spolu s jejich jmenovkami a žetony umístění.',
      ],
    },
    upgrading: {
      heading: 'Upgrade z verze 1',
      points: [
        'Verze 2 již nepotřebuje PathMath, MatrixMath, Vector Math nebo HTML Builder. Můžete je odstranit, pokud je nepoužívá jiný mod.',
        'Stávající hexadecimální mapy, názvy, tokeny umístění a nastavení se automaticky upgradují při prvním spuštění.',
        'Příkazy verze 1, včetně makra Heexploration_menu, stále fungují.',
        'Verze 1 umožnila jakémukoli žetonu, který představoval postavu, odhalit hexy. Chcete-li zachovat toto chování, nastavte žetony, které se odhalují, na žetony postav.',
      ],
      colV1: 'Příkaz verze 1',
      colV2: 'Příkaz verze 2',
    },
    troubleshooting: {
      heading: 'Odstraňování problémů',
      points: [
        'Když se žeton pohne, nic se nestane: zkontrolujte, zda je žeton na vrstvě žetonů a odpovídá žetonům, které odhalují, a že stránka má hexy (stav !hexploration).',
        'Hexy jsou odsazeny od mřížky: použijte Kalibrovat a poté zkontrolujte pomocí žetonu několik hexů po mapě.',
        'Po zkopírování stránky nebo hry se hexy přestaly odhalovat: spusťte znovu skenování stránky.',
        'Fill říká, že oblast nemá žádné středy hexu: tvar musí obsahovat střed alespoň jednoho hexu.',
        'Pro cokoli jiného zkontrolujte protokol konzoly API a při žádosti o pomoc zahrňte jeho zprávy.',
      ],
    },
    languages: {
      heading: 'Jazyky',
      body: 'Vyberte jazyk pomocí nastavení jazyka !hexploration. Dostupné jazyky:',
      colLanguage: 'Jazyk',
      colNative: 'Rodné jméno',
      colCode: 'Kód',
    },
    credits: {
      heading: 'Kredity',
      original: 'Původní mod od',
      maintainer: 'Verze 2 spravovaná společností',
      marketplace: 'Adiny umělecké balíčky na Roll20 Marketplace',
      support:
        'Pokud najdete chybu nebo máte nápad, zveřejněte příspěvek na fóru Roll20 Mod nebo otevřete problém na GitHubu a zahrňte všechny zprávy z protokolu konzoly API.',
    },
  },
};

export default TRANSLATION;
