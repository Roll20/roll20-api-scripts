const TRANSLATION = {
  titles: {
    ready: 'Konsentrasie is gereed.',
    menu: 'Konsentrasie-instellings',
    help: 'Konsentrasie opdragte',
    status: 'Wie konsentreer',
    advantage: 'Voordeel op konsentrasiebesparings',
    reset: 'Stel konsentrasie terug',
    concentration: 'Konsentrasie',
    save: 'Konsentrasie Stoor',
    check: 'Konsentrasiekontrole',
  },
  messages: {
    migrated:
      "Opgegradeer vanaf weergawe 1.0. Jou instellings en voordelelys is gehou, en jou ou makro's werk steeds.",
    reconciled:
      'Opgevang met die kaart: konsentreer-tokens gevind {added}, ou inskrywings is verwyder {dropped}.',
    readyHint: 'Tik {command} vir die instellings, of maak die Command Deck-uitdeelstuk oop.',
    settingChanged: '{setting} is nou {value}.',
    confirmReset:
      'Stel elke instelling terug na sy verstek en maak die voordeellys skoon? Konsentrasiemerkers op die kaart bly.',
    reset: 'Instellings teruggestel na hul verstekke.',
    journal: 'Uitdeelstukke herbou: {help} en {deck}.',
  },
  notices: {
    started: '{name} konsentreer nou op {spell}.',
    startedNoSpell: '{name} konsentreer nou.',
    switched: '{name} hou op om op {old} te konsentreer en konsentreer nou op {spell}.',
    switchedNoSpell: '{name} konsentreer nou.',
    ended: '{name} konsentreer nie meer op {spell} nie.',
    endedNoSpell: '{name} konsentreer nie meer nie.',
    lost: '{name} verloor konsentrasie op {spell}.',
    lostNoSpell: '{name} verloor konsentrasie.',
    kept: '{name} hou aan konsentreer op {spell}.',
    keptNoSpell: '{name} hou aan konsentreer.',
    zeroHp: '{name} daal tot 0 trefpunte en verloor konsentrasie op {spell}.',
    zeroHpNoSpell: '{name} daal tot 0 trefpunte en verloor konsentrasie.',
    checkNeeded: "{name} moet 'n Grondwet-spaargooi maak om aan te hou konsentreer: {dc}.",
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Wysiger',
    roll: 'Rol',
    advantageRoll: '{first} en {second} (voordeel)',
    success: 'Sukses',
    failure: 'Mislukking',
  },
  menu: {
    concentratingCount: 'Konsentreer nou: {count}',
    settings: 'Instellings',
    footer:
      'Tik {command} om hierheen terug te kom. Elke knoppie is ook in die "{deck}"-uitdeelstuk.',
  },
  status: {
    none: 'Niemand konsentreer nie.',
  },
  advantage: {
    intro:
      'Karakters ingestel op Aan rol hul konsentrasie spaar met voordeel, soos met die War Caster-prestasie. Dit geld vir outomatiese stoor.',
    none: 'Daar is geen karakters in hierdie speletjie nie.',
  },
  buttons: {
    roll: 'Rol',
    advantage: 'Voordeel',
    status: 'Status',
    advantageMenu: 'Voordeel spyskaart',
    help: 'Help',
    reset: 'Stel terug',
    confirmReset: 'Stel instellings terug',
    end: 'Einde',
    menu: 'Spyskaart',
    concentrate: 'Konsentreer op...',
    toggle: 'Wissel',
    journal: 'Herbou uitdeelstukke',
  },
  prompts: {
    spell: 'Spel',
  },
  values: {
    on: 'Aan',
    off: 'Af',
    bar: 'Staaf {bar}',
    unnamed: 'Naamloos',
    sendTo: {
      everyone: 'Almal',
      character: 'Karakter',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Basies',
      detailed: 'Gedetailleerd',
    },
  },
  settings: {
    language: {
      label: 'Taal',
      desc: 'Die taal van kletsboodskappe en uitdeelstukke.',
    },
    command: {
      label: 'Bevel',
      desc: 'Die kletsopdrag, sonder die "!". Weergawe 1.0 makro\'s gebruik konsentrasie.',
    },
    statusmarker: {
      label: 'Status Merker',
      desc: 'Die tekenmerker wat konsentrasie toon. Gepasmaakte tekenmerkers kan gebruik word.',
    },
    bar: {
      label: 'HP Bar',
      desc: "Die tekenbalk wat trefpunte bevat. Skade daaraan verg 'n konsentrasiebesparing.",
    },
    send_reminder_to: {
      label: 'Stuur herinnering aan',
      desc: "Wie konsentrasieboodskappe sien en stoor: almal, die GM, of die karakter se spelers (die GM kry 'n kopie).",
    },
    auto_add_concentration_marker: {
      label: 'Auto Voeg Con. Merker',
      desc: "Voeg die merker by wanneer 'n konsentrasiespel uit 'n vel gegooi word.",
      hint: 'D&D 5e 2014 (OGL) en 2024-blaaie.',
    },
    auto_roll_save: {
      label: 'Stoor outomaties',
      desc: "Rol die stoor sodra 'n konsentreerteken skade opdoen. As dit af is, het die herinnering Rol- en Advantage-knoppies.",
    },
    show_roll_button: {
      label: 'Rol knoppie',
      desc: 'Voeg Roll- en Advantage-knoppies by die herinnering wanneer Auto Roll Save af is.',
    },
    end_at_zero: {
      label: 'Eindig by 0 HP',
      desc: "Beëindig konsentrasie sonder 'n stoor wanneer 'n teken tot 0 trefpunte daal.",
    },
    bonus_attribute: {
      label: 'Bonus kenmerk',
      desc: 'Die lakkenmerk wat by konsentrasie gevoeg word, spaar. constitution_save_mod werk op D&D 5e 2014 en 2024-blaaie.',
    },
    debug: {
      label: 'Ontfoutmodus',
      desc: 'Skryf notas oor spelbespeuring en stoor na die API-konsole, vir ondersteuningsversoeke.',
    },
    support_mode: {
      label: 'Ondersteuningsmodus',
      desc: 'Hoeveel Debug Mode skryf: Basies (kort) of Gedetailleerd.',
    },
  },
  help: {
    menu: 'Met niks gekies nie (GM): maak die instellings oop. Met tekens gekies: begin- of eindkonsentrasie.',
    toggle:
      "Begin konsentreer op 'n towerspel met die geselekteerde tekens. Noem 'n ander spel om oor te skakel; hardloop dit weer om te eindig.",
    end: 'Eindkonsentrasie vir die geselekteerde tokens.',
    status: 'Lys wie konsentreer, met Einde-knoppies.',
    config: "Verander 'n instelling, byvoorbeeld config auto_roll_save|false.",
    advantageMenu: 'Kies watter karakters rolkonsentrasie spaar met voordeel.',
    toggleAdvantage: 'Skakel voordeel aan of af vir een karakter.',
    roll: "Rol 'n stoor vanaf 'n herinnering se Roll of Advantage-knoppie.",
    journal: 'Herbou die hulp- en beveldek-uitdeelstukke.',
    reset: 'Stel elke instelling terug na sy verstek.',
    help: 'Wys hierdie lys.',
    footer:
      'Volledige instruksies is in die "{help}"-uitdeelstuk; knoppies is in die "{deck}"-uitdeelstuk.',
    playerFooter: 'Kies eers jou teken.',
  },
  errors: {
    noSelection: "Kies eers 'n teken.",
    notYours: 'Jy kan net konsentrasie verander vir tekens wat jy beheer.',
    gmOnly: 'Slegs die GM kan daardie opdrag gebruik.',
    notConcentrating: 'Daardie teken konsentreer nie.',
    unknownSetting: 'Daar is geen instelling genaamd "{key}" nie.',
    badSettingValue: '"{value}" is nie \'n geldige waarde vir {key} nie.',
    rollExpired: 'Daardie knoppie het verval.',
    unknownCharacter: 'Daardie karakter bestaan ​​nie meer nie.',
    internal: 'Iets het verkeerd geloop. Die API-konsole het die besonderhede.',
  },
  hints: {
    noSelection: 'Kies die rolspeler se teken en voer dan die opdrag weer uit.',
    rollExpired:
      "Knoppies werk een keer en vir 10 minute. Beskadig die teken weer vir 'n nuwe een.",
    unknownSetting: 'Tik die opdrag met niks gekies om die instellings te sien nie.',
  },
  warnings: {
    unknownMarker:
      'Die statusmerker "{marker}" is nie een van hierdie speletjie se merkers nie. Kies \'n ander in die instellings.',
  },
  deck: {
    subtitle: 'Beveldek',
    selected: 'Geselekteerde tokens',
    selectedDesc: 'Kies eers die rolspeler se token.',
    table: 'Die Tafel',
    tableDesc: 'Kyk wie konsentreer, en wie het voordeel op hul besparings.',
    tools: 'Gereedskap',
    toolsDesc: 'Instellings, die opdraglys en die uitdeelstukke.',
    footer: 'Volledige instruksies is in die "{help}"-uitdeelstuk.',
  },
  handout: {
    versionLabel: 'Weergawe',
    subtitle: 'Konsentrasiemerkers, aanmanings en stoor vir D&D 5e',
    overview: {
      heading: 'Oorsig',
      body: "Konsentrasie hou tred met wie op watter spel konsentreer. Dit plaas 'n merker op die rolspeler se teken, rol (of vra vir) 'n Grondwet stoor wanneer daardie teken skade opdoen, en vertel die tafel wanneer konsentrasie eindig.",
    },
    quickStart: {
      heading: 'Vinnige begin',
      steps: [
        'Kies die rolspeler se teken en tik !konsentrasie gevolg deur die towerspel, byvoorbeeld !konsentrasie Bless.',
        "Verander die teken se trefpunte in sy staafborrel. 'n Save word gerol teen DC 10, of die helfte van die skade as dit hoër is.",
        'Voer dieselfde opdrag weer uit, of haal die merker af, om konsentrasie te beëindig.',
        'Tik !konsentrasie met niks gekies om die instellings oop te maak nie.',
      ],
    },
    concentrating: {
      heading: 'Konsentreer',
      points: [
        "Deur 'n ander towerspreuk te benoem, verander konsentrasie daarna, soos om 'n nuwe konsentrasiespel te doen.",
        "Deur die merker met die hand op 'n teken te plaas, begin konsentrasie sonder 'n spel; dit afneem, of die teken uitvee, beëindig dit.",
        "'n Nuwe gekoppelde teken van 'n konsentrerende karakter kry die merker, en 'n geplakte teken wat die merker dra, word nagespoor.",
        "Tekens van een karakter met 'n gekoppelde trefferpuntstaafdeelkonsentrasie. Ontkoppelde tekens, soos 'n pak kabouters van een laken, konsentreer op hul eie.",
        "Almal sien 'n boodskap wanneer konsentrasie begin, oorskakel of eindig, tensy Stuur herinnering aan anders sê.",
      ],
    },
    saves: {
      heading: 'Konsentrasie spaar',
      points: [
        'Die DC is 10 of die helfte van die skade wat geneem is, wat ook al die hoogste is, tot DC 30.',
        "Die wysiger kom van die Bonuskenmerk op die karakter se blad; 'n ontbrekende waarde tel as 0.",
        'Outo-rol Stoor rolle gelyktydig. Wanneer dit af is, het die herinnering Roll- en Advantage-knoppies vir die speler of GM.',
        "'n Mislukte stoor beëindig konsentrasie. Met Einde op 0 HP aan, eindig dit sonder 'n stoor as u na 0 trefpunte daal.",
        "Die Advantage Menu gee 'n karaktervoordeel op outomatiese stoor, soos die War Caster-prestasie doen.",
      ],
    },
    automatic: {
      heading: "Towerspreuke uit 'n blad gegooi",
      points: [
        "Met Auto Add Con. Merker op, gooi 'n konsentrasie toor uit 'n D&D 5e 2014 (OGL) of 2024 blad voeg die merker by.",
        'Die rolspeler se tokens op die bladsy wat hulle bekyk, is gemerk; as daar geen is nie, is tekens op enige bladsy.',
        "Slegs kaarte van die GM, 'n ander Mod of een van die karakter se spelers tel. Om weer dieselfde towerspel uit te spreek verander niks nie.",
        "'n D&D 2024-kaart wat net konsentrasie in sy teks noem, soos die War Caster-prestasie, kan konsentrasie begin, maar vervang nooit 'n towerspreuk nie.",
        "D&D 2024-blaaie benodig dalk die eksperimentele API-bediener. Skakel Ontfoutmodus aan om te sien hoekom 'n towerspreuk bespeur is of nie.",
      ],
    },
    players: {
      heading: 'Spelers',
      points: [
        'Spelers kan konsentrasie begin en beëindig vir tekens wat hulle beheer, en Roll- en Advantage-knoppies gebruik op hul eie stoor.',
        'Met Stuur herinnering Om op Karakter te stel, word boodskappe aan die karakter se spelers en aan die GM gefluister.',
      ],
    },
    commands: {
      heading: 'Opdragte',
      intro: 'Ander mods, soos ScriptCards, kan ook hierdie opdragte stuur.',
      colCommand: 'Bevel',
      colDesc: 'Wat dit doen',
    },
    settings: {
      heading: 'Instellings',
      intro:
        'Verander instellings met die knoppies in die instellingskaart, of met config <sleutel>|<waarde>. Sommige kan ook op die Mod se bladsy ingestel word.',
      colKey: 'Sleutel',
      colName: 'Naam',
      colDesc: 'Wat dit doen',
    },
    upgrading: {
      heading: 'Opgradering vanaf weergawe 1.0',
      points: [
        'Instellings, die voordelelys en elke opdrag bly werk.',
        'Boodskappe sê nou wanneer konsentrasie eindig, en op watter spel.',
        'Tokens wat reeds die merker dra, word opgetel wanneer dit begin word.',
      ],
    },
    troubleshooting: {
      heading: 'Probleemoplossing',
      points: [
        'Geen stoor wanneer trefpunte daal nie: maak seker dat die teken die merker het en dat HP Bar die balk is wat jy verander het. Veranderinge wat deur ander Mods deur die API gemaak word, veroorsaak nie gebeurtenisse nie, dus word hulle nie gesien nie.',
        'Die wysiger is 0: kontroleer die bonuskenmerk teen die karakter se blad.',
        'Spele wat uit die blad gegooi word, word nie bespeur nie: skakel Ontfoutmodus aan, spel weer uit en lees die API-konsole.',
        "Twee karakters deel 'n naam: opsporing gebruik die eerste pasmaat. Gee karakters unieke name.",
      ],
    },
    languages: {
      heading: 'Tale',
      body: 'Konsentrasie word in die tale hieronder vertaal. Kies een met die Taalinstelling.',
      colCode: 'Kode',
      colName: 'Taal',
      colNative: 'Inheemse naam',
    },
    credits: {
      heading: 'Krediete',
      original: 'Oorspronklike mod deur',
      maintainer: 'Onderhou deur',
      support: 'Rapporteer foute en idees op die Roll20 Mod-forum of op GitHub.',
    },
    footer: 'Knoppies vir elke handeling is in die "{deck}"-uitdeelstuk.',
  },
};

export default TRANSLATION;
