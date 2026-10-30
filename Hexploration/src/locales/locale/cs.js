const TRANSLATION = {
  titles: {
    ready: 'Hexploration je připraven.',
    settings: 'Nastavení Hexploration',
    languages: 'Vyberte jazyk',
    pageSettings: 'Nastavení stránky: {page}',
    status: 'Stav Hexploration: {page}',
    help: 'Příkazy Hexploration',
    confirm: 'Potvrďte prosím',
  },
  discovery: {
    title: 'Místo objeveno',
  },
  menu: {
    draw: 'Kreslení',
    reveal: 'Odhalení a skrytí',
    locations: 'Místa',
    tools: 'Nástroje',
    layerInUse: 'Vrstva, do které se kreslí nové hexy: {layer}.',
    pageSettingsHelp:
      'Tato nastavení platí pouze pro tuto stránku. Nastavení označená ★ přepíší globální nastavení.',
  },
  buttons: {
    fill: 'Vyplnit',
    fillInverse: 'Inverzní výplň',
    undo: 'Vrátit výplň',
    reveal: 'Odhalit',
    conceal: 'Zakrýt',
    explore: 'Prozkoumat',
    revealPage: 'Odhalit stránku',
    resetPage: 'Resetovat stránku',
    mark: 'Označit místo',
    unmark: 'Zrušit označení',
    name: 'Pojmenovat hex',
    settings: 'Nastavení',
    pageSettings: 'Nastavení stránky',
    status: 'Stav',
    rescan: 'Znovu skenovat',
    calibrate: 'Kalibrovat',
    calibrateReset: 'Resetovat kalibraci',
    help: 'Pomoc',
    change: 'Změnit',
    menu: 'Menu',
    clearOverrides: 'Zrušit přepsání',
    confirmReset: 'Ano, odebrat všechny hexy',
  },
  prompts: {
    name: 'Název místa (pro vymazání ponechte prázdné)',
  },
  values: {
    on: 'Zapnuto',
    off: 'Vypnuto',
    none: 'Žádné',
    hexLayer: {
      auto: 'Auto (popředí, pokud je k dispozici)',
      foreground: 'vrstva popředí',
      objects: 'vrstva žetonů',
    },
    revealBy: {
      players: 'Žetony hráčů',
      characters: 'Žetony postav',
      all: 'Všechny žetony',
    },
    revealMode: {
      clear: 'Odstranění',
      glimpse: 'Záblesk',
    },
    announce: {
      all: 'Všichni',
      gm: 'Pouze GM',
      off: 'Vypnuto',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Vyplnit',
      fillInverse: 'Inverzní výplň',
      conceal: 'Zakrýt',
    },
  },
  settings: {
    language: {
      label: 'Jazyk',
      desc: 'Jazyk pro nabídky, zprávy a letáky.',
    },
    hexLayer: {
      label: 'Vrstva šestiúhelníků',
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
      label: 'Barva popisku',
      desc: 'Barva jmenovek pouze GM na pojmenovaných hexech.',
    },
    glimpseColor: {
      label: 'Barva záblesku',
      desc: 'Barva, kterou hexy získají při zahlédnutí (režim odhalování Záblesk). Použijte průhlednou barvu rgba().',
    },
    strokeWidth: {
      label: 'Šířka ohraničení',
      desc: 'Šířka obrysu nových hexů v pixelech (0 až 20).',
    },
    maxDistance: {
      label: 'Vzdálenost odhalení šestiúhelníků',
      desc: 'Ukládá se do hexů při jejich vyplňování, proto ji nastavte před vyplněním: pozdější změna neovlivní hexy, které už jsou na mapě. Žeton musí být v dosahu tohoto počtu hexů, aby je odhalil, ať vidí jakkoli daleko; při hodnotě 0 se odhalí jen tím, že do nich vstoupí. Použijte ji pro hory nebo lesy. Nechte prázdné bez omezení.',
    },
    revealDistance: {
      label: 'Vzdálenost dohledu',
      desc: 'Kolik hexů kolem pohybujícího se žetonu je odhaleno (0 až 20). 0 odhaluje pouze hexy, kterými žeton prochází.',
    },
    lineOfSight: {
      label: 'Přímá viditelnost',
      desc: 'Když je zapnuto, hexy, které zůstávají zakryté, například hory vyplněné s nastavením Vzdálenost odhalení šestiúhelníků, skrývají hexy za sebou. Projeví se to pouze tehdy, když je Vzdálenost dohledu 2 nebo více.',
    },
    revealPath: {
      label: 'Odhalovat po cestě',
      desc: 'Když je zapnuto, je odhalen každý hex, kterým žeton při tažení projde (včetně trasových bodů), nejen tam, kde se zastaví.',
    },
    revealBy: {
      label: 'Žetony, které odhalují',
      desc: 'Které žetony na vrstvě žetonů odhalují hexy: žetony ovládané hráčem, žetony, které představují jakoukoli postavu, nebo každý žeton.',
    },
    revealMode: {
      label: 'Režim odhalování',
      desc: 'Odstranění odstraní hexy v dohledu. Záblesk je místo toho zprůhlední; odstraní se, když do nich vstoupí žeton.',
    },
    announce: {
      label: 'Oznamovat objevy',
      desc: 'Kdo uvidí chatovou zprávu, když je objeveno pojmenované místo.',
    },
    pingDiscoveries: {
      label: 'Pingnout objevy',
      desc: 'Když je zapnuto, hráči jsou pingnuti na pojmenované místo, když je objeveno.',
    },
    hideCoveredTokens: {
      label: 'Skrýt zakryté žetony',
      desc: 'Roll20 kreslí jména, pruhy a aury nad hexy. Když jsou žetony pod krytým hexem zapnuté, jejich jméno, pruhy a aury viditelné pro hráče jsou vypnuté a znovu zapnuté, když jsou odkryty.',
    },
  },
  status: {
    engine: 'Herní engine',
    grid: 'Mřížka',
    layer: 'Vrstva hexů',
    hexes: 'Hexy',
    named: 'Pojmenované hexy',
    icons: 'Žetony míst',
    glimpsed: 'Zahlédnuté hexy',
    pending: 'Místa čekající na výplň',
    calibrated: 'Zkalibrováno',
    overrides: 'Přepsání stránky',
    undo: 'Lze vrátit zpět',
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
      'Poslední výplň vrácena. Odstraněné hexy: {removed}. Hexy s obnoveným stylem: {restored}.',
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
      'Vaše hexové mapy z Hexploration 1.x byly aktualizovány. Pokud byla tato hra zkopírována z hry Legacy, spusťte Znovu skenovat na každé stránce s hexovou mapou.',
    pruned:
      'Uložené hexy, které již neexistují a byly zapomenuty: {dropped}. Pokud byla tato hra nebo stránka zkopírována, spusťte na stránce Znovu skenovat, aby se její hexy znovu načetly.',
    readyHint:
      'Zadejte !hexploration pro otevření nabídky nebo otevřete leták "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Tato hra nepodporuje kreslení na vrstvě popředí, takže hexy byly nakresleny na vrstvu žetonů.',
    someFailed:
      'Hexametry, které nebylo možné nakreslit: {count}. Podrobnosti naleznete v konzole API.',
  },
  errors: {
    noPage: 'Nelze najít stránku, na které by se dalo pracovat.',
    notHex: 'Tato stránka nepoužívá hexovou mřížku.',
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
    status: 'Zobrazit, co Hexploration ví o aktuální stránce.',
    journal: 'Znovu vytvořte letáky „Pomoc“ a „Command Deck“.',
    help: 'Zobrazit tento seznam.',
    handout: 'Úplné pokyny jsou v letáku „{name}“.',
  },
  deck: {
    drawDesc:
      'Nakreslete tvary kolem oblasti, vyberte je a poté vyplňte. Zpět vrátí poslední výplň zpět.',
    revealDesc:
      'Vyberte hexy, tvary nebo žetony, abyste je odhalili nebo znovu zakryli. Prozkoumat odhalí okolí vybraných žetonů, jako by se pohnuly.',
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
        'Vyberte tvary a v Command Deck klikněte na Vyplnit (nebo zadejte !hexploration fill). Tvary se nahradí hexy.',
        'Volitelné: před vyplněním vyberte žetony pro důležitá místa a klikněte na Označit místo. Jsou ukryty pod hexy a oznámeny, když jsou objeveny.',
        'Přesuňte žeton hráče. Každý hex, kterým projde, a hexy v jeho Vzdálenosti dohledu jsou odhaleny.',
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
        'Hexy odhalují pouze žetony na vrstvě žetonů. Které žetony se počítají, určuje nastavení Žetony, které odhalují: ve výchozím stavu žetony hráčů, takže GM může pohybovat příšerami, aniž by odkrýval mapu.',
        'Žeton odhalí každý hex, který zakrývá (velké žetony zakrývají několik), a se zapnutým nastavením Odhalovat po cestě také každý hex na trase, po které byl tažen, včetně průchozích bodů.',
        'Vzdálenost dohledu odhaluje hexy kolem každého z těchto hexů, od nejbližších. Když je zapnutá Přímá viditelnost, hex se neodhalí, dokud mezi ním a žetonem leží zakrytý hex. Bližší hexy se obvykle odhalí jako první, takže v otevřené krajině Přímá viditelnost nic nemění: projeví se jen tehdy, když je Vzdálenost dohledu 2 nebo více a existují hexy, které zůstávají zakryté, například terén vyplněný s nastavením Vzdálenost odhalení šestiúhelníků.',
        'Vzdálenost odhalení šestiúhelníků se ukládá do každého hexu při jeho vyplnění, proto ji nastavte před vyplňováním; pozdější změna neovlivní hexy, které už jsou na mapě. Žeton musí být v dosahu tolika hexů, aby je odhalil, ať vidí jakkoli daleko, a při hodnotě 0 se odhalí jen tím, že do nich vstoupí. Pro horské pásmo: nastavte Vzdálenost odhalení šestiúhelníků na 0, vyplňte hory, pak hodnotu opět vymažte (bez omezení) a nakonec vyplňte krajinu za nimi. Když je Vzdálenost dohledu 3 a Přímá viditelnost zapnutá, družina vidí otevřený terén kolem sebe, ale ne hory ani to, co leží za nimi. Každý horský hex se odhalí, když do něj vstoupí žeton.',
        'V režimu Záblesk se hexy v dohledu místo zmizení stanou průhlednými a odstraní se, když do nich vstoupí žeton. Hexy zahlédnuté v režimu Záblesk nezakrývají výhled pro nastavení Přímá viditelnost.',
        'Roll20 kreslí jména, ukazatele a aury žetonů nad hexy. Se zapnutým nastavením Skrýt zakryté žetony má žeton pod zakrytým hexem vypnuté jméno, ukazatele a aury viditelné pro hráče, dokud není odkryt, takže se skryté příšery neprozradí. Pokud některý z nich zapnete, zatímco je žeton zakrytý, zůstane skrytý a zapne se, až bude žeton odkryt.',
        'API nehlásí pohyby provedené jinými mody. Pohyby z TokenMod se zachytí automaticky; u ostatních modů vyberte žetony a klikněte na Prozkoumat, nebo zavolejte Hexploration.revealAround(token) z vlastního modu.',
      ],
    },
    locations: {
      heading: 'Pojmenované hexy a umístění',
      points: [
        'Označit místo změní vybrané žetony na skrytá místa. Žeton, který je již pod hexem, je okamžitě skryt; jinak je skryta další výplní, která jej zakrývá.',
        'Žetony se značkou stavu bílé věže jsou při vyplňování také považovány za místa, jako ve verzi 1.',
        'Žetony skrytých umístění se přesunou do vrstvy GM. Když je jejich hex odhalen, vrátí se do vrstvy žetonů se zobrazeným jménem a jejich objev je oznámen.',
        'Pojmenovat hex dá hexu jméno bez žetonu. Jméno se GM zobrazí jako popisek na vrstvě GM a oznámí se, když je hex odhalen. Jumpgate vykresluje vrstvu GM pod vrstvou popředí, takže v Jumpgate se popisky zobrazí jen tehdy, když je Vrstva šestiúhelníků nastavena na vrstvu žetonů.',
        'Oznamovat objevy určuje, zda oznámení uvidí všichni, pouze GM, nebo nikdo. Pingnout objevy navíc přesune pohled hráčů na dané místo.',
      ],
    },
    settings: {
      heading: 'Nastavení',
      intro:
        'Nastavení změníte příkazem !hexploration set (nebo tlačítkem Nastavení). Vrstvu šestiúhelníků, Žetony, které odhalují, a Jazyk lze nastavit také na stránce nastavení modu.',
      colKey: 'Klíč',
      colName: 'Nastavení',
      colDesc: 'Popis',
      perPage: '(Lze nastavit na stránku.)',
    },
    jumpgate: {
      heading: 'Jumpgate a Legacy',
      points: [
        'Heexploration zjistí, který engine hra používá, a nakreslí odpovídající druh tvaru. Tvary nakreslené v obou editorech lze vyplnit.',
        'Když je Vrstva šestiúhelníků nastavena na Auto, hexy se kreslí na vrstvu popředí nad žetony, takže hráči nevidí, co je pod nimi. Pokud vrstva popředí není k dispozici, použije se místo ní vrstva žetonů.',
        'Jumpgate kreslí matematicky pravidelné hexy, které mají trochu jiný tvar než hexy Legacy. Pokud hexy nejsou zarovnány s mřížkou stránky, přichyťte token ke středu hexu, vyberte jej a klikněte na Kalibrovat. Vyberte dva žetony na sousedních hexech stejného řádku (Hex V) nebo sloupce (Hex H), abyste také opravili velikost hexu.',
        'Když se stránka nebo hra zkopíruje, její hexy získají nová ID. Spusťte na stránce Znovu skenovat, aby se znovu načetly spolu se svými popisky jmen a žetony míst.',
      ],
    },
    upgrading: {
      heading: 'Upgrade z verze 1',
      points: [
        'Verze 2 již nepotřebuje PathMath, MatrixMath, Vector Math nebo HTML Builder. Můžete je odstranit, pokud je nepoužívá jiný mod.',
        'Stávající hexové mapy, názvy, tokeny lokací a nastavení se při prvním spuštění automaticky aktualizují.',
        'Příkazy verze 1, včetně makra Hexploration_menu, stále fungují.',
        'Verze 1 umožňovala odhalovat hexy každému žetonu, který představoval postavu. Chcete-li toto chování zachovat, nastavte Žetony, které odhalují, na Žetony postav.',
      ],
      colV1: 'Příkaz verze 1',
      colV2: 'Příkaz verze 2',
    },
    troubleshooting: {
      heading: 'Odstraňování problémů',
      points: [
        'Když se žeton pohne, nic se nestane: zkontrolujte, zda je žeton na vrstvě žetonů a odpovídá nastavení Žetony, které odhalují, a zda stránka obsahuje hexy (!hexploration status).',
        'Hexy jsou odsazeny od mřížky: použijte Kalibrovat a poté zkontrolujte pomocí žetonu několik hexů po mapě.',
        'Po zkopírování stránky nebo hry se hexy přestaly odhalovat: spusťte na stránce Znovu skenovat.',
        'Vyplnit hlásí, že oblast neobsahuje žádné středy hexů: tvar musí obsahovat střed alespoň jednoho hexu.',
        'Pro cokoli jiného zkontrolujte protokol konzoly API a při žádosti o pomoc zahrňte jeho zprávy.',
      ],
    },
    languages: {
      heading: 'Jazyky',
      body: 'Jazyk vyberte příkazem !hexploration set language. Dostupné jazyky:',
      colLanguage: 'Jazyk',
      colNative: 'Vlastní název',
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
