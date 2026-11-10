const TRANSLATION = {
  titles: {
    ready: 'Concentratie is klaar.',
    menu: 'Concentratie-instellingen',
    help: "Concentratie commando's",
    status: 'Wie concentreert zich',
    advantage: 'Voordeel op concentratiebesparing',
    reset: 'Concentratie opnieuw instellen',
    concentration: 'Concentratie',
    save: 'Concentratie Opslaan',
    check: 'Concentratiecontrole',
  },
  messages: {
    migrated:
      "Geüpgraded vanaf versie 1.0. Je instellingen en voordelenlijst zijn behouden en je oude macro's werken nog steeds.",
    reconciled:
      'Op de hoogte van de kaart: geconcentreerde tokens gevonden {added}, oude vermeldingen verwijderd {dropped}.',
    readyHint: 'Typ {command} voor de instellingen, of open de Command Deck-handout.',
    settingChanged: '{setting} is nu {value}.',
    confirmReset:
      'Elke instelling terugzetten naar de standaardwaarde en de voordelenlijst wissen? Concentratiemarkeringen op de kaart blijven staan.',
    reset: 'Instellingen teruggezet naar hun standaardwaarden.',
    journal: 'Hand-outs herbouwd: {help} en {deck}.',
  },
  notices: {
    started: '{name} concentreert zich nu op {spell}.',
    startedNoSpell: '{name} concentreert zich nu.',
    switched: '{name} concentreert zich niet meer op {old} en concentreert zich nu op {spell}.',
    switchedNoSpell: '{name} concentreert zich nu.',
    ended: '{name} concentreert zich niet langer op {spell}.',
    endedNoSpell: '{name} concentreert zich niet meer.',
    lost: '{name} verliest concentratie op {spell}.',
    lostNoSpell: '{name} verliest concentratie.',
    kept: '{name} blijft zich concentreren op {spell}.',
    keptNoSpell: '{name} blijft zich concentreren.',
    zeroHp: '{name} zakt naar 0 hitpoints en verliest de concentratie op {spell}.',
    zeroHpNoSpell: '{name} zakt naar 0 hitpoints en verliest zijn concentratie.',
    checkNeeded:
      '{name} moet een Constitution-besparende worp maken om zich te kunnen blijven concentreren: {dc}.',
  },
  save: {
    dc: 'gelijkstroom',
    dcValue: 'DC {dc}',
    modifier: 'Wijziger',
    roll: 'Rollen',
    advantageRoll: '{first} en {second} (voordeel)',
    success: 'Succes',
    failure: 'Mislukking',
  },
  menu: {
    concentratingCount: 'Nu concentreren: {count}',
    settings: 'Instellingen',
    footer: 'Typ {command} om hier terug te komen. Elke knop staat ook in de uitreikblad "{deck}".',
  },
  status: {
    none: 'Niemand concentreert zich.',
  },
  advantage: {
    intro:
      'Personages die op On roll zijn ingesteld, besparen hun concentratie met voordeel, zoals bij de War Caster-prestatie. Dit geldt voor automatisch opslaan.',
    none: 'Er zijn geen personages in dit spel.',
  },
  buttons: {
    roll: 'Rollen',
    advantage: 'Voordeel',
    status: 'Status',
    advantageMenu: 'Voordeelmenu',
    help: 'Hulp',
    reset: 'Opnieuw instellen',
    confirmReset: 'Instellingen resetten',
    end: 'Einde',
    menu: 'Menu',
    concentrate: 'Concentreer je op…',
    toggle: 'Schakelaar',
    journal: 'Hand-outs opnieuw opbouwen',
  },
  prompts: {
    spell: 'Spellen',
  },
  values: {
    on: 'Op',
    off: 'Uit',
    bar: 'Staaf {bar}',
    unnamed: 'Naamloos',
    sendTo: {
      everyone: 'Iedereen',
      character: 'Karakter',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Basis',
      detailed: 'Gedetailleerd',
    },
  },
  settings: {
    language: {
      label: 'Taal',
      desc: 'De taal van chatberichten en hand-outs.',
    },
    command: {
      label: 'Commando',
      desc: 'Het chatcommando, zonder de "!". Macro\'s van versie 1.0 gebruiken concentratie.',
    },
    statusmarker: {
      label: 'Statusmarkering',
      desc: 'De tokenmarker die concentratie aangeeft. Er kunnen aangepaste tokenmarkeringen worden gebruikt.',
    },
    bar: {
      label: 'HP-balk',
      desc: 'De tokenbalk die hitpoints bevat. Schade daaraan vereist concentratie.',
    },
    send_reminder_to: {
      label: 'Herinnering verzenden naar',
      desc: 'Wie concentratieberichten ziet en opslaat: iedereen, de GM of de spelers van het personage (de GM krijgt een kopie).',
    },
    auto_add_concentration_marker: {
      label: 'Automatisch toevoegen Con. Markering',
      desc: 'Voeg de markering toe wanneer een concentratiespreuk van een blad wordt uitgesproken.',
      hint: 'D&D 5e 2014 (OGL) en 2024-bladen.',
    },
    auto_roll_save: {
      label: 'Automatische rolbesparing',
      desc: 'Gooi de save zodra een concentrerend token schade oploopt. Als de herinnering is uitgeschakeld, heeft deze de knoppen Roll en Advantage.',
    },
    show_roll_button: {
      label: 'Rolknop',
      desc: 'Voeg de knoppen Roll en Advantage toe aan de herinnering wanneer Auto Roll Save is uitgeschakeld.',
    },
    end_at_zero: {
      label: 'Eindig bij 0 PK',
      desc: 'Eindconcentratie zonder opslaan wanneer een token naar 0 hitpoints zakt.',
    },
    bonus_attribute: {
      label: 'Bonuskenmerk',
      desc: 'Het bladattribuut toegevoegd aan concentratiebesparingen. constitution_save_mod werkt op D&D 5e 2014 en 2024-bladen.',
    },
    debug: {
      label: 'Foutopsporingsmodus',
      desc: 'Schrijf notities over spellingdetectie en opslag naar de API-console, voor ondersteuningsverzoeken.',
    },
    support_mode: {
      label: 'Ondersteuningsmodus',
      desc: 'Hoeveel Debug-modus schrijft: Basis (kort) of Gedetailleerd.',
    },
  },
  help: {
    menu: 'Met niets geselecteerd (GM): open de instellingen. Met geselecteerde tokens: start- of eindconcentratie.',
    toggle:
      'Begin je te concentreren op een spreuk met de geselecteerde tokens. Noem een ​​andere spreuk om te wisselen; voer het opnieuw uit om te eindigen.',
    end: 'Eindconcentratie voor de geselecteerde tokens.',
    status: 'Maak een lijst van wie zich concentreert, met de knoppen Einde.',
    config: 'Wijzig een instelling, bijvoorbeeld config auto_roll_save|false.',
    advantageMenu: 'Kies welke karakters concentratie besparen met voordeel.',
    toggleAdvantage: 'Schakel het voordeel voor één personage in of uit.',
    roll: 'Voer een save uit via de Roll- of Advantage-knop van een herinnering.',
    journal: 'Herbouw de Help- en Command Deck-hand-outs.',
    reset: 'Zet elke instelling terug naar de standaardwaarde.',
    help: 'Laat deze lijst zien.',
    footer:
      'Volledige instructies vindt u in de hand-out "{help}"; De knoppen staan ​​in de uitreikblad "{deck}".',
    playerFooter: 'Selecteer eerst uw token.',
  },
  errors: {
    noSelection: 'Selecteer eerst een token.',
    notYours: 'Je kunt alleen de concentratie veranderen voor tokens die je beheert.',
    gmOnly: 'Alleen de GM kan dat commando gebruiken.',
    notConcentrating: 'Dat teken concentreert zich niet.',
    unknownSetting: 'Er is geen instelling genaamd "{key}".',
    badSettingValue: '"{value}" is geen geldige waarde voor {key}.',
    rollExpired: 'Die knop is verlopen.',
    unknownCharacter: 'Dat karakter bestaat niet meer.',
    internal: 'Er is iets misgegaan. De API-console bevat de details.',
  },
  hints: {
    noSelection: 'Selecteer het token van de caster en voer de opdracht opnieuw uit.',
    rollExpired:
      'Knoppen werken eenmalig en gedurende 10 minuten. Beschadig het token opnieuw voor een nieuw exemplaar.',
    unknownSetting:
      'Typ de opdracht terwijl er niets is geselecteerd om de instellingen te bekijken.',
  },
  warnings: {
    unknownMarker:
      'De statusmarkering "{marker}" is niet een van de markeringen van dit spel. Kies een andere in de instellingen.',
  },
  deck: {
    subtitle: 'Commandodek',
    selected: 'Geselecteerde tokens',
    selectedDesc: 'Selecteer eerst het token van de caster.',
    table: 'De tafel',
    tableDesc: 'Kijk wie zich concentreert en wie voordeel heeft bij zijn reddingen.',
    tools: 'Hulpmiddelen',
    toolsDesc: 'Instellingen, de commandolijst en de hand-outs.',
    footer: 'Volledige instructies vindt u in de hand-out "{help}".',
  },
  handout: {
    versionLabel: 'Versie',
    subtitle: 'Concentratiemarkeringen, herinneringen en opslag voor D&D 5e',
    overview: {
      heading: 'Overzicht',
      body: 'Concentratie houdt bij wie zich op welke spreuk concentreert. Het plaatst een marker op het token van de caster, gooit (of vraagt ​​om) een Constitution Save wanneer dat token schade oploopt, en vertelt de tafel wanneer de concentratie eindigt.',
    },
    quickStart: {
      heading: 'Snel beginnen',
      steps: [
        'Selecteer het token van de caster en typ !concentration gevolgd door de spreuk, bijvoorbeeld !concentration Bless.',
        'Verander de hitpoints van het token in de staafbel. Een save wordt gegooid bij DC 10, of de helft van de schade als die hoger is.',
        'Voer hetzelfde commando nogmaals uit, of verwijder de marker, om de concentratie te beëindigen.',
        'Typ !concentration terwijl er niets is geselecteerd om de instellingen te openen.',
      ],
    },
    concentrating: {
      heading: 'Concentreren',
      points: [
        'Het benoemen van een andere spreuk verandert de concentratie ernaar, zoals het uitspreken van een nieuwe concentratiespreuk dat doet.',
        'Door de marker met de hand op een fiche te plaatsen, wordt de concentratie zonder spreuk gestart; het verwijderen of verwijderen van het token beëindigt het.',
        'Een nieuw gekoppeld token van een concentrerend personage krijgt de marker, en een geplakt token dat de marker draagt, wordt gevolgd.',
        'Tokens van één personage met een gekoppelde hitpoint-balk delen de concentratie. Niet-gekoppelde tokens, zoals een pakket goblins van één vel, concentreren zich op hun eigen tokens.',
        'Iedereen ziet een bericht wanneer de concentratie begint, schakelt of eindigt, tenzij Send Reminder To anders zegt.',
      ],
    },
    saves: {
      heading: 'Concentratie bespaart',
      points: [
        'De DC is 10 of de helft van de opgelopen schade, afhankelijk van wat het hoogste is, tot DC 30.',
        'De modifier komt van het bonuskenmerk op het blad van het personage; een ontbrekende waarde telt als 0.',
        'Automatische rol Sla rollen in één keer op. Als de herinnering is uitgeschakeld, heeft de herinnering Roll- en Advantage-knoppen voor de speler of GM.',
        'Een mislukte redding maakt een einde aan de concentratie. Als Einde bij 0 HP is ingeschakeld, wordt het spel beëindigd zonder een save als je naar 0 hitpoints gaat.',
        'Het Advantage-menu geeft een karaktervoordeel bij automatisch opslaan, net als de War Caster-prestatie.',
      ],
    },
    automatic: {
      heading: 'Spreuken uit een laken',
      points: [
        'Met automatisch toevoegen Con. Markering ingeschakeld, door een concentratiespreuk uit een D&D 5e 2014 (OGL) of 2024-blad uit te spreken, wordt de markering toegevoegd.',
        'De tokens van de caster op de pagina die hij bekijkt, zijn gemarkeerd; als er geen zijn, zijn tokens op elke pagina dat wel.',
        'Alleen kaarten van de GM, een andere Mod of een van de spelers van het personage tellen. Het opnieuw uitspreken van dezelfde spreuk verandert niets.',
        'Een D&D 2024-kaart die alleen concentratie in de tekst vermeldt, zoals de War Caster-prestatie, kan de concentratie starten, maar vervangt nooit een spreuk.',
        'D&D 2024-bladen hebben mogelijk de Experimentele API-server nodig. Schakel de foutopsporingsmodus in om te zien waarom een ​​spreuk wel of niet is gedetecteerd.',
      ],
    },
    players: {
      heading: 'Spelers',
      points: [
        'Spelers kunnen de concentratie starten en beëindigen voor tokens die zij beheren, en de Roll- en Advantage-knoppen gebruiken bij hun eigen saves.',
        'Met Herinnering verzenden Als je het personage instelt, worden er berichten gefluisterd naar de spelers van het personage en naar de GM.',
      ],
    },
    commands: {
      heading: "Commando's",
      intro: 'Andere Mods, zoals ScriptCards, kunnen deze opdrachten ook verzenden.',
      colCommand: 'Commando',
      colDesc: 'Wat het doet',
    },
    settings: {
      heading: 'Instellingen',
      intro:
        'Wijzig instellingen met de knoppen op de instellingenkaart, of met config <key>|<value>. Sommige kunnen ook worden ingesteld op de Mod-pagina.',
      colKey: 'Sleutel',
      colName: 'Naam',
      colDesc: 'Wat het doet',
    },
    upgrading: {
      heading: 'Upgraden vanaf versie 1.0',
      points: [
        'Instellingen, de voordelenlijst en elke opdracht blijven werken.',
        'Berichten zeggen nu wanneer de concentratie eindigt, en op welke spreuk.',
        'Tokens die de marker al dragen, worden bij het opstarten opgehaald.',
      ],
    },
    troubleshooting: {
      heading: 'Problemen oplossen',
      points: [
        'Geen opslag als de hitpoints vallen: controleer of het token de markering heeft en dat HP Bar de balk is die je hebt gewijzigd. Wijzigingen die door andere Mods via de API zijn aangebracht, veroorzaken geen gebeurtenissen en worden dus niet gezien.',
        'De modifier is 0: controleer het bonuskenmerk op het blad van het personage.',
        'Spreuken uit het blad worden niet gedetecteerd: schakel de foutopsporingsmodus in, spreek de spreuk opnieuw uit en lees de API-console.',
        'Twee karakters delen een naam: detectie gebruikt de eerste match. Geef karakters unieke namen.',
      ],
    },
    languages: {
      heading: 'Talen',
      body: 'Concentratie wordt vertaald in de onderstaande talen. Kies er een met de taalinstelling.',
      colCode: 'Code',
      colName: 'Taal',
      colNative: 'Inheemse naam',
    },
    credits: {
      heading: 'Kredieten',
      original: 'Originele mod door',
      maintainer: 'Onderhouden door',
      support: 'Rapporteer bugs en ideeën op het Roll20 Mod-forum of op GitHub.',
    },
    footer: 'Knoppen voor elke actie staan ​​in de hand-out "{deck}".',
  },
};

export default TRANSLATION;
