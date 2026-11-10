const TRANSLATION = {
  titles: {
    ready: 'Koncentrationen är klar.',
    menu: 'Koncentrationsinställningar',
    help: 'Koncentrationskommandon',
    status: 'Vem koncentrerar sig',
    advantage: 'Fördel på koncentrationsbesparingar',
    reset: 'Återställ koncentration',
    concentration: 'Koncentration',
    save: 'Koncentration Spara',
    check: 'Koncentrationskontroll',
  },
  messages: {
    migrated:
      'Uppgraderad från version 1.0. Dina inställningar och fördelar behölls, och dina gamla makron fungerar fortfarande.',
    reconciled:
      'Kom ikapp kartan: koncentrerade tokens hittades {added}, gamla poster borttagna {dropped}.',
    readyHint: 'Skriv {command} för inställningarna, eller öppna handouten för kommandodäck.',
    settingChanged: '{setting} är nu {value}.',
    confirmReset:
      'Vill du återställa alla inställningar till standardinställningarna och rensa fördelarlistan? Koncentrationsmarkörer på kartan stannar.',
    reset: 'Inställningarna återställs till sina standardinställningar.',
    journal: 'Handouts ombyggda: {help} och {deck}.',
  },
  notices: {
    started: '{name} koncentrerar sig nu på {spell}.',
    startedNoSpell: '{name} koncentrerar sig nu.',
    switched: '{name} slutar koncentrera sig på {old} och koncentrerar sig nu på {spell}.',
    switchedNoSpell: '{name} koncentrerar sig nu.',
    ended: '{name} koncentrerar sig inte längre på {spell}.',
    endedNoSpell: '{name} koncentrerar sig inte längre.',
    lost: '{name} tappar koncentrationen på {spell}.',
    lostNoSpell: '{name} tappar koncentrationen.',
    kept: '{name} fortsätter att koncentrera sig på {spell}.',
    keptNoSpell: '{name} fortsätter att koncentrera sig.',
    zeroHp: '{name} sjunker till 0 träffpoäng och tappar koncentrationen på {spell}.',
    zeroHpNoSpell: '{name} sjunker till 0 träffpoäng och tappar koncentrationen.',
    checkNeeded:
      '{name} måste göra en konstitutionsräddning för att fortsätta koncentrera sig: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Modifierare',
    roll: 'Rulla',
    advantageRoll: '{first} och {second} (fördel)',
    success: 'Framgång',
    failure: 'Fel',
  },
  menu: {
    concentratingCount: 'Koncentrerar dig nu: {count}',
    settings: 'Inställningar',
    footer:
      'Skriv {command} för att komma tillbaka hit. Varje knapp finns också i "{deck}"-handouten.',
  },
  status: {
    none: 'Ingen koncentrerar sig.',
  },
  advantage: {
    intro:
      'Karaktärer inställda på On roll deras koncentrationsräddningar med fördel, som med War Caster-bedriften. Detta gäller automatiska besparingar.',
    none: 'Det finns inga karaktärer i det här spelet.',
  },
  buttons: {
    roll: 'Rulla',
    advantage: 'Fördel',
    status: 'Status',
    advantageMenu: 'Fördelsmeny',
    help: 'Hjälp',
    reset: 'Återställa',
    confirmReset: 'Återställ inställningar',
    end: 'Avsluta',
    menu: 'Meny',
    concentrate: 'Koncentrera dig på…',
    toggle: 'Växla',
    journal: 'Bygg om åhörarkopior',
  },
  prompts: {
    spell: 'Stava',
  },
  values: {
    on: 'På',
    off: 'Av',
    bar: 'Stapel {bar}',
    unnamed: 'Namnlös',
    sendTo: {
      everyone: 'Alla',
      character: 'Karaktär',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Grundläggande',
      detailed: 'Detaljerad',
    },
  },
  settings: {
    language: {
      label: 'Språk',
      desc: 'Språket för chattmeddelanden och åhörarkopior.',
    },
    command: {
      label: 'Kommando',
      desc: 'Chattkommandot, utan "!". Makro i version 1.0 använder koncentration.',
    },
    statusmarker: {
      label: 'Statusmarkör',
      desc: 'Tokenmarkören som visar koncentration. Anpassade tokenmarkörer kan användas.',
    },
    bar: {
      label: 'HP Bar',
      desc: 'Tokenstapeln som håller träffpoäng. Skador på den kräver en koncentrationsräddning.',
    },
    send_reminder_to: {
      label: 'Skicka påminnelse till',
      desc: 'Vem ser koncentrationsmeddelanden och sparar: alla, GM eller karaktärens spelare (GM får en kopia).',
    },
    auto_add_concentration_marker: {
      label: 'Auto Add Con. Markör',
      desc: 'Lägg till markören när en koncentrationsbesvärjelse gjuts från ett ark.',
      hint: 'D&D 5e 2014 (OGL) och 2024 blad.',
    },
    auto_roll_save: {
      label: 'Spara automatiskt',
      desc: 'Rulla räddningen så fort en koncentrerad token tar skada. När den är avstängd har påminnelsen Roll- och Advantage-knappar.',
    },
    show_roll_button: {
      label: 'Rullknapp',
      desc: 'Lägg till knapparna Roll och Advantage till påminnelsen när Auto Roll Save är avstängt.',
    },
    end_at_zero: {
      label: 'Slutar på 0 hk',
      desc: 'Avsluta koncentrationen utan en räddning när en token sjunker till 0 träffpoäng.',
    },
    bonus_attribute: {
      label: 'Bonusattribut',
      desc: 'Arkattributet som läggs till koncentration sparar. constitution_save_mod fungerar på D&D 5e 2014 och 2024 ark.',
    },
    debug: {
      label: 'Felsökningsläge',
      desc: 'Skriv anteckningar om stavningsdetektering och sparar till API-konsolen för supportförfrågningar.',
    },
    support_mode: {
      label: 'Supportläge',
      desc: 'Hur mycket Debug Mode skriver: Grundläggande (kort) eller Detaljerad.',
    },
  },
  help: {
    menu: 'Med ingenting valt (GM): öppna inställningarna. Med tokens valda: start- eller slutkoncentration.',
    toggle:
      'Börja koncentrera dig på en besvärjelse med de valda tokens. Namnge en annan besvärjelse att byta; kör det igen för att avsluta.',
    end: 'Slutkoncentration för de valda tokens.',
    status: 'Lista vem som koncentrerar sig, med Avsluta-knapparna.',
    config: 'Ändra en inställning, till exempel config auto_roll_save|false.',
    advantageMenu: 'Välj med fördel vilka karaktärer som rullkoncentrationen sparar.',
    toggleAdvantage: 'Slå på eller av fördel för en karaktär.',
    roll: 'Rulla en spara från en påminnelse Roll eller Advantage-knapp.',
    journal: 'Bygg om hjälp- och kommandodäcken.',
    reset: 'Återställ varje inställning till standardinställningen.',
    help: 'Visa den här listan.',
    footer:
      'Fullständiga instruktioner finns i "{help}"-handouten; knappar finns i "{deck}"-utdelningsbladet.',
    playerFooter: 'Välj din token först.',
  },
  errors: {
    noSelection: 'Välj en token först.',
    notYours: 'Du kan bara ändra koncentrationen för tokens du kontrollerar.',
    gmOnly: 'Endast GM kan använda det kommandot.',
    notConcentrating: 'Den token koncentrerar sig inte.',
    unknownSetting: 'Det finns ingen inställning som heter "{key}".',
    badSettingValue: '"{value}" är inte ett giltigt värde för {key}.',
    rollExpired: 'Den knappen har gått ut.',
    unknownCharacter: 'Den karaktären finns inte längre.',
    internal: 'Något gick fel. API-konsolen har detaljerna.',
  },
  hints: {
    noSelection: 'Välj casterns token och kör sedan kommandot igen.',
    rollExpired: 'Knappar fungerar en gång och i 10 minuter. Skada token igen för en ny.',
    unknownSetting: 'Skriv kommandot med inget markerat för att se inställningarna.',
  },
  warnings: {
    unknownMarker:
      'Statusmarkören "{marker}" är inte en av detta spels markörer. Välj en annan i inställningarna.',
  },
  deck: {
    subtitle: 'Kommandodäck',
    selected: 'Valda tokens',
    selectedDesc: 'Välj casterns token först.',
    table: 'Tabellen',
    tableDesc: 'Se vem som koncentrerar sig och vem som har fördel på sina räddningar.',
    tools: 'Verktyg',
    toolsDesc: 'Inställningar, kommandolistan och åhörarkopiorna.',
    footer: 'Fullständiga instruktioner finns i "{help}" handout.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Koncentrationsmarkörer, påminnelser och sparningar för D&D 5e',
    overview: {
      heading: 'Översikt',
      body: 'Koncentration håller reda på vem som koncentrerar sig på vilken besvärjelse. Den sätter en markör på kastarens token, rullar (eller ber om) en konstitutionsräddning när den poletten tar skada och talar om för bordet när koncentrationen tar slut.',
    },
    quickStart: {
      heading: 'Snabbstart',
      steps: [
        'Välj casterns token och skriv !koncentration följt av besvärjelsen, till exempel !koncentration Välsigna.',
        'Ändra tokens träffpunkter i dess barbubbla. En räddning rullas på DC 10, eller halva skadan om den är högre.',
        'Kör samma kommando igen, eller ta av markören, för att avsluta koncentrationen.',
        'Skriv !koncentration med ingenting markerat för att öppna inställningarna.',
      ],
    },
    concentrating: {
      heading: 'Koncentrerar sig',
      points: [
        'Genom att namnge en annan besvärjelse ändras koncentrationen till den, som en ny koncentrationsbesvärjelse gör.',
        'Att sätta markören på en token för hand startar koncentrationen utan en besvärjelse; ta bort den eller radera token, avslutar den.',
        'En ny länkad token av en koncentrerande karaktär får markören, och en inklistrad token som bär markören spåras.',
        'Tokens av en karaktär med en länkad träffpunktstapel delar koncentration. Olänkade tokens, till exempel ett paket troll från ett ark, koncentrerar sig på egen hand.',
        'Alla ser ett meddelande när koncentrationen börjar, växlar eller slutar, om inte Skicka påminnelse till säger något annat.',
      ],
    },
    saves: {
      heading: 'Koncentration räddar',
      points: [
        'DC är 10 eller hälften av skadan, beroende på vilket som är högst, upp till DC 30.',
        'Modifieraren kommer från bonusattributet på karaktärens ark; ett saknat värde räknas som 0.',
        'Auto Roll Spara rullar på en gång. När den är avstängd har påminnelsen Roll- och Advantage-knappar för spelaren eller GM.',
        'En misslyckad räddning gör slut på koncentrationen. Med End at 0 HP på, sjunker till 0 träffpoäng slutar det utan räddning.',
        'Advantage-menyn ger en karaktärsfördel vid automatiska räddningar, som War Caster-bedriften gör.',
      ],
    },
    automatic: {
      heading: 'Trollformler gjutna från ett ark',
      points: [
        'Med Auto Add Con. Markör på, kasta en koncentrationsbesvärjelse från ett D&D 5e 2014 (OGL) eller 2024 ark lägger till markören.',
        'Castarens tokens på sidan de tittar på är markerade; om det inte finns några, är tokens på vilken sida som helst.',
        'Endast kort från GM, en annan Mod eller en av karaktärens spelare räknas. Att kasta samma besvärjelse igen förändrar ingenting.',
        'Ett D&D 2024-kort som bara nämner koncentration i sin text, till exempel War Caster-bedriften, kan starta koncentration men ersätter aldrig en besvärjelse.',
        'D&D 2024-ark kan behöva Experimental API-servern. Aktivera felsökningsläget för att se varför en besvärjelse upptäcktes eller inte.',
      ],
    },
    players: {
      heading: 'Spelare',
      points: [
        'Spelare kan börja och avsluta koncentrationen för tokens de kontrollerar och använda knapparna Roll och Advantage på sina egna räddningar.',
        'Med Skicka påminnelse För att ställa in på Karaktär viskas meddelanden till karaktärens spelare och till GM.',
      ],
    },
    commands: {
      heading: 'Kommandon',
      intro: 'Andra Mods, som ScriptCards, kan också skicka dessa kommandon.',
      colCommand: 'Kommando',
      colDesc: 'Vad den gör',
    },
    settings: {
      heading: 'Inställningar',
      intro:
        'Ändra inställningar med knapparna på inställningskortet, eller med config <nyckel>|<värde>. Vissa kan också ställas in på Mods sida.',
      colKey: 'Nyckel',
      colName: 'Namn',
      colDesc: 'Vad den gör',
    },
    upgrading: {
      heading: 'Uppgraderar från version 1.0',
      points: [
        'Inställningar, fördelslistan och varje kommando fortsätter att fungera.',
        'Meddelanden säger nu när koncentrationen upphör och på vilken besvärjelse.',
        'Polletter som redan bär markören plockas upp vid start.',
      ],
    },
    troubleshooting: {
      heading: 'Felsökning',
      points: [
        'Ingen räddning när träffpunkterna faller: kontrollera att token har markören och att HP Bar är stapeln du ändrade. Ändringar som görs av andra Mods via API:n skapar inga händelser, så de syns inte.',
        'Modifieraren är 0: kontrollera bonusattributet mot karaktärens ark.',
        'Besvärjelser som kastas från arket upptäcks inte: aktivera felsökningsläge, trollformel igen och läs API-konsolen.',
        'Två tecken delar ett namn: detektion använder den första matchningen. Ge karaktärer unika namn.',
      ],
    },
    languages: {
      heading: 'Språk',
      body: 'Koncentration översätts till språken nedan. Välj en med språkinställningen.',
      colCode: 'Koda',
      colName: 'Språk',
      colNative: 'Inhemskt namn',
    },
    credits: {
      heading: 'Krediter',
      original: 'Original Mod av',
      maintainer: 'Underhålls av',
      support: 'Rapportera buggar och idéer på Roll20 Mod-forumet eller på GitHub.',
    },
    footer: 'Knappar för varje åtgärd finns i utdelningsbladet "{deck}".',
  },
};

export default TRANSLATION;
