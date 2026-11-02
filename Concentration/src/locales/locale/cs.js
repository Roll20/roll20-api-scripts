const TRANSLATION = {
  titles: {
    ready: 'Soustředění je připraveno.',
    menu: 'Nastavení koncentrace',
    help: 'Příkazy koncentrace',
    status: 'Kdo se soustředí',
    advantage: 'Výhoda v oblasti úspory koncentrace',
    reset: 'Resetovat koncentraci',
    concentration: 'Koncentrace',
    save: 'Koncentrace Uložit',
    check: 'Kontrola koncentrace',
  },
  messages: {
    migrated:
      'Upgradováno z verze 1.0. Vaše nastavení a seznam výhod byly zachovány a vaše stará makra stále fungují.',
    reconciled:
      'Dohozeno s mapou: nalezeny koncentrační tokeny {added}, staré záznamy odstraněny {dropped}.',
    readyHint: 'Zadejte {command} pro nastavení nebo otevřete leták Command Deck.',
    settingChanged: '{setting} je nyní {value}.',
    confirmReset:
      'Vrátit všechna nastavení zpět na výchozí hodnoty a vymazat seznam výhod? Značky koncentrace na mapě zůstávají.',
    reset: 'Nastavení se vrátí na výchozí hodnoty.',
    journal: 'Přepracované podklady: {help} a {deck}.',
  },
  notices: {
    started: '{name} se nyní soustředí na {spell}.',
    startedNoSpell: '{name} se nyní soustředí.',
    switched: '{name} se přestane soustředit na {old} a nyní se soustředí na {spell}.',
    switchedNoSpell: '{name} se nyní soustředí.',
    ended: '{name} se již nesoustředí na {spell}.',
    endedNoSpell: '{name} se již nesoustředí.',
    lost: '{name} ztrácí koncentraci na {spell}.',
    lostNoSpell: '{name} ztrácí koncentraci.',
    kept: '{name} se stále soustředí na {spell}.',
    keptNoSpell: '{name} se stále soustředí.',
    zeroHp: '{name} klesne na 0 životů a ztratí koncentraci na {spell}.',
    zeroHpNoSpell: '{name} klesá na 0 životů a ztrácí koncentraci.',
    checkNeeded: '{name} musí provést záchranný hod Ústavy, aby se mohl dále soustředit: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Modifikátor',
    roll: 'Role',
    advantageRoll: '{first} a {second} (výhoda)',
    success: 'Úspěch',
    failure: 'Selhání',
  },
  menu: {
    concentratingCount: 'Právě se soustředím: {count}',
    settings: 'Nastavení',
    footer: 'Chcete-li se sem vrátit, zadejte {command}. Každé tlačítko je také v letáku „{deck}“.',
  },
  status: {
    none: 'Nikdo se nesoustředí.',
  },
  advantage: {
    intro:
      'Postavám nastaveným na On roll se jejich koncentrace s výhodou šetří, jako u featu War Caster. To platí pro automatické ukládání.',
    none: 'V této hře nejsou žádné postavy.',
  },
  buttons: {
    roll: 'Role',
    advantage: 'Výhoda',
    status: 'Postavení',
    advantageMenu: 'Nabídka výhod',
    help: 'Pomoc',
    reset: 'Resetovat',
    confirmReset: 'Obnovit nastavení',
    end: 'Konec',
    menu: 'Menu',
    concentrate: 'Soustřeďte se na…',
    toggle: 'Přepnout',
    journal: 'Znovu sestavit podklady',
  },
  prompts: {
    spell: 'Kouzlo',
  },
  values: {
    on: 'Na',
    off: 'Vypnuto',
    bar: 'Bar {bar}',
    unnamed: 'Nejmenovaný',
    sendTo: {
      everyone: 'Každý',
      character: 'Charakter',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Základní',
      detailed: 'Detailní',
    },
  },
  settings: {
    language: {
      label: 'Jazyk',
      desc: 'Jazyk chatových zpráv a letáků.',
    },
    command: {
      label: 'Příkaz',
      desc: 'Příkaz chatu bez "!". Makra verze 1.0 používají koncentraci.',
    },
    statusmarker: {
      label: 'Značka stavu',
      desc: 'Značka tokenu, která ukazuje koncentraci. Lze použít vlastní značky tokenů.',
    },
    bar: {
      label: 'HP Bar',
      desc: 'Token bar, který obsahuje životy. Poškození vyžaduje soustředění.',
    },
    send_reminder_to: {
      label: 'Odeslat připomenutí',
      desc: 'Kdo vidí zprávy o koncentraci a ukládá: všichni, GM nebo hráči postavy (GM dostane kopii).',
    },
    auto_add_concentration_marker: {
      label: 'Auto Add Con. Marker',
      desc: 'Přidejte značku, když je z listu sesláno kouzlo koncentrace.',
      hint: 'D&D 5e 2014 (OGL) a 2024 listů.',
    },
    auto_roll_save: {
      label: 'Auto Roll Save',
      desc: 'Hoďte záchranu, jakmile koncentrující se žeton utrpí poškození. Když je připomenutí vypnuto, má tlačítka Roll a Advantage.',
    },
    show_roll_button: {
      label: 'Tlačítko Roll',
      desc: 'Když je funkce Auto Roll Save vypnutá, přidejte k připomenutí tlačítka Roll a Advantage.',
    },
    end_at_zero: {
      label: 'Konec na 0 HP',
      desc: 'Ukončete koncentraci bez uložení, když žeton klesne na 0 životů.',
    },
    bonus_attribute: {
      label: 'Bonusový atribut',
      desc: 'Atribut listu přidaný k uložení koncentrace. constitution_save_mod funguje na listech D&D 5e 2014 a 2024.',
    },
    debug: {
      label: 'Režim ladění',
      desc: 'Pište poznámky o detekci pravopisu a ukládání do konzole API pro žádosti o podporu.',
    },
    support_mode: {
      label: 'Režim podpory',
      desc: 'Kolik režim ladění zapisuje: Základní (krátký) nebo Podrobný.',
    },
  },
  help: {
    menu: 'Není-li vybráno nic (GM): otevřete nastavení. S vybranými žetony: začátek nebo konec koncentrace.',
    toggle:
      'Začněte se soustředit na kouzlo s vybranými žetony. Pojmenujte jiné kouzlo, které chcete přepnout; run it again to end.',
    end: 'Konec koncentrace pro vybrané tokeny.',
    status: 'Seznamte, kdo se soustředí, pomocí tlačítek Konec.',
    config: 'Změňte nastavení, například config auto_roll_save|false.',
    advantageMenu: 'Vyberte si, které postavy při hodu šetří s výhodou.',
    toggleAdvantage: 'Zapněte nebo vypněte výhodu pro jednu postavu.',
    roll: 'Roll uložení pomocí tlačítka Roll nebo Advantage připomenutí.',
    journal: 'Znovu sestavte podklady pro balíček nápovědy a příkazů.',
    reset: 'Vraťte všechna nastavení zpět na výchozí hodnoty.',
    help: 'Zobrazit tento seznam.',
    footer: 'Úplné pokyny jsou v letáku „{help}“; tlačítka jsou v letáku „{deck}“.',
    playerFooter: 'Nejprve vyberte svůj token.',
  },
  errors: {
    noSelection: 'Nejprve vyberte token.',
    notYours: 'Koncentraci můžete měnit pouze u žetonů, které ovládáte.',
    gmOnly: 'Tento příkaz může použít pouze GM.',
    notConcentrating: 'Tento token se nesoustředí.',
    unknownSetting: 'Neexistuje žádné nastavení s názvem „{key}“.',
    badSettingValue: '„{value}“ není platná hodnota pro {key}.',
    rollExpired: 'Platnost tohoto tlačítka vypršela.',
    unknownCharacter: 'Ta postava už neexistuje.',
    internal: 'Něco se pokazilo. Konzole API má podrobnosti.',
  },
  hints: {
    noSelection: 'Vyberte token sesilatele a spusťte příkaz znovu.',
    rollExpired: 'Tlačítka fungují jednou a po dobu 10 minut. Poškoďte žeton znovu za nový.',
    unknownSetting: 'Chcete-li zobrazit nastavení, zadejte příkaz bez výběru.',
  },
  warnings: {
    unknownMarker:
      'Značka stavu „{marker}“ není jednou ze značek této hry. V nastavení vyberte jiný.',
  },
  deck: {
    subtitle: 'Velitelský balíček',
    selected: 'Vybrané tokeny',
    selectedDesc: 'Nejprve vyberte sesilatelův žeton.',
    table: 'Stůl',
    tableDesc: 'Podívejte se, kdo se soustředí a kdo má výhodu ve svých úsporách.',
    tools: 'Nástroje',
    toolsDesc: 'Nastavení, seznam příkazů a letáky.',
    footer: 'Úplné pokyny jsou v letáku „{help}“.',
  },
  handout: {
    versionLabel: 'Verze',
    subtitle: 'Značky koncentrace, upomínky a ukládání pro D&D 5e',
    overview: {
      heading: 'Přehled',
      body: 'Koncentrace sleduje, kdo se na které kouzlo soustředí. Umístí žeton na sesilatelův žeton, hodí (nebo požádá) o záchranu Ústavy, když žeton utrpí poškození, a oznámí stolu, když koncentrace skončí.',
    },
    quickStart: {
      heading: 'Rychlý start',
      steps: [
        'Vyberte sesilatelův žeton a napište !koncentrace následované kouzlem, například !koncentrace Bless.',
        'Změňte životy žetonu v jeho barové bublině. Záchrana je hozena na 10 DC nebo poloviční poškození, pokud je vyšší.',
        'Spusťte znovu stejný příkaz nebo sejměte značku, abyste ukončili koncentraci.',
        'Chcete-li otevřít nastavení, zadejte !concentration bez výběru.',
      ],
    },
    concentrating: {
      heading: 'Soustředění',
      points: [
        'Pojmenováním jiného kouzla se na něj přepne koncentrace, stejně jako seslání nového kouzla koncentrace.',
        'Ruční položení žetonu na žeton spustí koncentraci bez kouzla; jeho odebráním nebo smazáním tokenu končí.',
        'Nový propojený token soustředící se postavy získá značku a vložený token, který nese značku, je sledován.',
        'Žetony jedné postavy s propojenou lištou životů sdílejí koncentraci. Nepropojené žetony, jako je balíček goblinů z jednoho listu, se soustředí samy na sebe.',
        'Každý vidí zprávu, když koncentrace začíná, přepíná nebo končí, pokud Send Reminder To neříká jinak.',
      ],
    },
    saves: {
      heading: 'Koncentrace šetří',
      points: [
        'DC je 10 nebo polovina utrženého poškození, podle toho, co je vyšší, až do DC 30.',
        'Modifikátor pochází z bonusového atributu na listu postavy; chybějící hodnota se počítá jako 0.',
        'Auto Roll Uložte role najednou. Když je vypnutá, připomenutí má tlačítka Roll a Advantage pro hráče nebo GM.',
        'Neúspěšné uložení ukončí soustředění. Když je End na 0 HP zapnutý, pokles na 0 životů to ukončí bez uložení.',
        'Nabídka Advantage poskytuje postavě výhodu při automatickém ukládání, jako to dělá feat War Caster.',
      ],
    },
    automatic: {
      heading: 'Kouzla seslaná z listu',
      points: [
        'S Auto Add Con. Značka zapnuta, seslání koncentračního kouzla z listu D&D 5e 2014 (OGL) nebo 2024 přidá značku.',
        'Tokeny sesilatele na stránce, kterou si prohlížejí, jsou označeny; pokud žádné nejsou, tokeny na jakékoli stránce ano.',
        'Počítají se pouze karty od GM, jiného modu nebo jednoho z hráčů postavy. Opětovné seslání stejného kouzla nic nezmění.',
        'Karta D&D 2024, která ve svém textu zmiňuje pouze koncentraci, jako je například feat War Caster, může zahájit koncentraci, ale nikdy nenahradí kouzlo.',
        'Listy D&D 2024 mohou vyžadovat server Experimental API. Zapněte režim ladění, abyste viděli, proč kouzlo bylo nebo nebylo detekováno.',
      ],
    },
    players: {
      heading: 'Hráči',
      points: [
        'Hráči mohou začít a ukončit koncentraci pro žetony, které ovládají, a používat tlačítka Roll a Advantage na své vlastní ukládání.',
        'S Send Reminder Chcete-li nastavit na Character, zprávy jsou šeptány hráčům postavy a GM.',
      ],
    },
    commands: {
      heading: 'Příkazy',
      intro: 'Jiné mody, jako jsou ScriptCards, mohou také odesílat tyto příkazy.',
      colCommand: 'Příkaz',
      colDesc: 'Co to dělá',
    },
    settings: {
      heading: 'Nastavení',
      intro:
        'Změňte nastavení pomocí tlačítek na kartě nastavení nebo pomocí config <klíč>|<hodnota>. Některé lze také nastavit na stránce Modu.',
      colKey: 'Klíč',
      colName: 'Jméno',
      colDesc: 'Co to dělá',
    },
    upgrading: {
      heading: 'Upgrade z verze 1.0',
      points: [
        'Nastavení, seznam výhod a každý příkaz fungují dál.',
        'Zprávy nyní říkají, kdy koncentrace končí a na které kouzlo.',
        'Žetony, které již nesou značku, se vyzvednou při spuštění.',
      ],
    },
    troubleshooting: {
      heading: 'Odstraňování problémů',
      points: [
        'Žádné uložení při poklesu životů: zkontrolujte, že žeton má značku a že pruh HP je pruh, který jste změnili. Změny provedené jinými mody prostřednictvím API nevyvolávají události, takže nejsou vidět.',
        'Modifikátor je 0: zkontrolujte bonusový atribut proti listu postavy.',
        'Kouzla seslaná z listu nejsou detekována: zapněte režim ladění, sešlete kouzlo znovu a přečtěte si konzolu API.',
        'Dva znaky sdílejí jméno: detekce používá první shodu. Dejte postavám jedinečná jména.',
      ],
    },
    languages: {
      heading: 'Jazyky',
      body: 'Koncentrace je přeložena do níže uvedených jazyků. Vyberte jeden pomocí nastavení Jazyk.',
      colCode: 'Kód',
      colName: 'Jazyk',
      colNative: 'Rodné jméno',
    },
    credits: {
      heading: 'Kredity',
      original: 'Původní mod od',
      maintainer: 'Udržovaný',
      support: 'Nahlaste chyby a nápady na fóru Roll20 Mod nebo na GitHubu.',
    },
    footer: 'Tlačítka pro každou akci jsou v letáku „{deck}“.',
  },
};

export default TRANSLATION;
