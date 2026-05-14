const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "painissa",
      verb: "ottaa painiin",
    },
    Restrained: {
      past: "sidottu",
      verb: "sitoo",
    },
    Prone: {
      past: "kaadettu",
      verb: "kaataa",
    },
    Poisoned: {
      past: "myrkytetty",
      verb: "myrkyttää",
    },
    Stunned: {
      past: "tainnutettu",
      verb: "tainnuttaa",
    },
    Blinded: {
      past: "sokaistu",
      verb: "sokaisee",
    },
    Charmed: {
      past: "lumottu",
      verb: "lumoaa",
    },
    Frightened: {
      past: "pelästynyt",
      verb: "pelästyttää",
    },
    Incapacitated: {
      past: "toimintakyvytön",
      verb: "tekee",
      suffix: "toimintakyvyttömäksi",
    },
    Invisible: {
      past: "näkymätön",
      verb: "tekee",
      suffix: "näkymättömäksi",
    },
    Paralyzed: {
      past: "halvaantunut",
      verb: "halvaannuttaa",
    },
    Petrified: {
      past: "kivettynyt",
      verb: "kivettää",
    },
    Unconscious: {
      past: "tajuton",
      verb: "tekee",
      suffix: "tajuttomaksi",
    },
    Spell: {
      past: "loitsun vaikutuksen alainen",
      verb: "langettaa loitsun kohteeseen",
    },
    Ability: {
      past: "kyvyn vaikutuksen alainen",
      verb: "käyttää kykyä kohteeseen",
    },
    Advantage: {
      past: "on etu",
      verb: "antaa edun",
      noBy: true,
    },
    Disadvantage: {
      past: "on haitta",
      verb: "antaa haitan",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Painissa",
    Restrained: "Sidottu",
    Prone: "Maassa",
    Poisoned: "Myrkytetty",
    Stunned: "Tainnutettu",
    Blinded: "Sokaistu",
    Charmed: "Lumottu",
    Frightened: "Peloissaan",
    Incapacitated: "Toimintakyvytön",
    Invisible: "Näkymätön",
    Paralyzed: "Halvaantunut",
    Petrified: "Kivettynyt",
    Unconscious: "Tajuton",
    Spell: "Loitsu",
    Ability: "Kyky",
    Advantage: "Etu",
    Disadvantage: "Haitta",
    Other: "Muu",
  },
  templates: {
    display: {
      custom: "{emoji} {target} vaikutuksen alainen: {effect} ({source})",
      advantage: "{emoji} {source} on etu {target}{subject} vastaan",
      disadvantage: "{emoji} {source} on haitta {target}{subject} vastaan",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} on {past}",
      standard: "{emoji} {target} {past} — {source}",
    },
    apply: {
      custom: "{source} soveltaa {effect} kohteeseen {target}.",
      advantage: "{source} on etu {target}{subject} vastaan.",
      disadvantage: "{source} on haitta {target}{subject} vastaan.",
      self: "{target} on {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} ei enää ole {effect} vaikutuksen alainen.",
      advantage: "{source} ei enää ole etu {target}{subject} vastaan.",
      disadvantage: "{source} ei enää ole haitta {target}{subject} vastaan.",
      noBy: "{target} ei enää ole {past}.",
      self: "{target} ei enää ole {past}.",
      standard: "{target} ei enää ole {past} — {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Valitse tila",
      selectSource: "Valitse lähde-token",
      selectTarget: "Valitse kohde-token",
      selectSubject: "Valitse kohde",
      selectDuration: "Valitse kesto",
      confirmTargetTitle: "Vahvista kohdelista",
      applyEffectTitle: "Käytä {condition}-vaikutus",
      noTokens: "Aktiiviselta sivulta ei löydy nimettyjä tokeneita.",
      confirmIntro: "Seuraavat tokenit saavat tilan:",
      confirmBtn: "Vahvista kohdelista",
      enterDetails: "Syötä vaikutuksen tiedot",
      noneBtn: "Ei mitään",
      noneOrSourceBtn: "Ei mitään tai käytä lähteeseen",
      subjectDesc: "Valitse kuka tai mikä tuottaa vaikutuksen.",
      sourceDesc: "Valitse olento, joka luo tai tuottaa tilan tai vaikutuksen.",
      targetDesc: "Valitse olento, joka vastaanottaa tilan tai vaikutuksen.",
      otherText: "Mukautettu tilateksti",
      effectDetails: "{condition}-tiedot",
    },
    col: {
      players: "Pelaajat",
      npcs: "HMH",
      conditions: "Tilat",
      customEffects: "Mukautetut vaikutukset",
      permanentTurnEnd: "Pysyvä / Vuoron loppu",
      rounds: "Kierrokset",
      command: "Komento",
      result: "Tulos",
      field: "Kenttä",
      value: "Arvo",
      option: "Asetus",
      condition: "Tila",
      marker: "Merkki",
      item: "Kohde",
      removed: "Poistettu",
      details: "Tiedot",
      description: "Kuvaus",
      scenario: "Tilanne",
    },
    dur: {
      untilRemoved: "Kunnes poistetaan",
      endOfTargetTurn: "Kohteen seuraavan vuoron lopussa",
      endOfSourceTurn: "Lähteen seuraavan vuoron lopussa",
      round1: "1 kierros",
      round2: "2 kierrosta",
      round3: "3 kierrosta",
      round10: "10 kierrosta",
      custom: "Mukautettu",
      customPrompt: "Kierrosten määrä",
      untilRemovedDisplay: "Kunnes poistetaan",
      turnsRemaining: "{n} jäljellä olevaa vuoron loppua",
    },
    btn: {
      openWizard: "Avaa ohjattu toiminto",
      openMultiTarget: "Avaa monikohde-ohjattu toiminto",
      openRemovalList: "Avaa poistolistaus",
      showConfig: "Näytä asetukset",
      runCleanup: "Suorita siivous",
      reinstallMacro: "Asenna makro uudelleen",
      reinstallHandout: "Asenna handout uudelleen",
      showHelp: "Näytä ohje",
      reorderConditions: "Järjestä tilarivit uudelleen",
    },
    title: {
      menu: "Valikko",
      removalMenu: "Condition Tracker — poisto",
      config: "Asetukset",
      configTracker: "Condition Tracker — asetukset",
      help: "Ohje",
      applied: "Sovellettu",
      removed: "Tila poistettu",
      cleanup: "Siivous valmis",
      macroReinstalled: "Makro asennettu uudelleen",
      handoutReinstalled: "Handout asennettu uudelleen",
      warning: "Varoitus",
      error: "Virhe",
      turnOrder: "Vuorojärjestys",
      noConditions: "Ei tiloja",
      tokenMoved: "Token siirretty",
      markedDead: "Merkitty kuolleeksi",
      zeroHp: "{name} — 0 HP",
      moveToken: "{name} — siirretäänkö token?",
      scriptReady: "Skripti valmis",
      conditionReorder: "Vuorojärjestys muuttui",
    },
    heading: {
      quickActions: "Pikavalinnat",
      settings: "Asetukset",
      markerMappings: "Merkkimääritykset",
      result: "Tulos",
      info: "Tiedot",
      commandOptions: "Komentovaihtoehdot",
      promptUi: "Ohjatun toiminnon käyttöliittymä",
      examples: "Esimerkit",
      summary: "Yhteenveto",
    },
    msg: {
      noActive: "Aktiivisia tiloja ei seurata.",
      configReset: "Asetukset palautettu oletuksiin.",
      unknownConfig:
        "Tuntematon asetusvaihtoehto. Käytä --config nähdäksesi tuetut asetukset.",
      macroReinstalled:
        "Makrot {wizard} ja {multiTarget} on asennettu uudelleen kaikille nykyisille GM-pelaajille.",
      handoutReinstalled: "Ohje-handout {handout} on asennettu uudelleen.",
      duplicate:
        "Täsmälleen sama lähde, kohde, tila ja mukautettu teksti on jo aktiivinen.",
      noTargets: "Monikohdesovellukselle ei määritetty kohde-tokeneita.",
      noSelection:
        "Valitse vähintään yksi token laudalta ennen --multi-target-komennon käyttöä.",
      invalidIds: "Nykyisestä valinnasta ei löydy kelvollisia token-tunnuksia.",
      reSelectTokens:
        "Yhtään alun perin valituista tokeneista ei löydy. Valitse tokenit uudelleen ja yritä uudelleen.",
      conditionNotFound: "Tilatunnusta ei löydy.",
      gmOnly: "Condition Tracker -komennot ovat vain GM:n käytettävissä.",
      commandFailed:
        "Komentoa ei voitu suorittaa turvallisesti. Tarkista API-konsoli lisätietoja varten.",
      sourceTokenNotFound: "Lähde-tokenia ei löydy.",
      targetTokenNotFound: "Kohde-tokenia ei löydy.",
      subjectTokenNotFound: "Kohde-tokenia ei löydy.",
      invalidCondition:
        "Tilan on oltava jokin ennalta määritetyistä tiloista tai Muu.",
      subjectOnlyCustom:
        "--subject on kelvollinen vain Loitsulle, Kyvylle, Edulle, Haitalle ja Muulle.",
      subjectBypassInvalid:
        "--subjectPromptBypass odottaa arvoa true tai false.",
      customDetailsRequired:
        "{condition}-tiedot ovat pakollisia. Käytä --other antaaksesi ne.",
      markerConfigFormat:
        "Merkkimäärityksen muoto: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Merkkimääritys edellyttää ennalta määritettyä tilanimeä.",
      markerNameRequired: "Merkkimääritys edellyttää ei-tyhjää merkin nimeä.",
      markerSet: "Tilan {condition} merkiksi asetettu {marker}.",
      healthBarSet: "Elämäpalkki asetettu: {bar}.",
      boolSet: "{key} asetettu arvoon {value}.",
      expectedBoolean: "Odotettiin true tai false.",
      invalidHealthBar:
        "Elämäpalkin on oltava bar1_value, bar2_value tai bar3_value.",
      markersDisabled: "Merkit ovat poistettu käytöstä.",
      noMarkerConfigured: "Tälle tilalle ei ole määritetty merkkiä.",
      markerApplied: "Merkki sovellettu: {marker}",
      markerPresent: "Merkki on jo olemassa: {marker}",
      langSet: "Kieleksi asetettu {locale}.",
      invalidLocale: "Virheellinen locale. Tuetut localet: {locales}.",
      otherDurationRequiresRounds:
        "Mukautettu kesto edellyttää numeerista kierrosmäärää, esim. --duration 5 rounds.",
      invalidDuration:
        "Keston on oltava Kunnes poistetaan, vuoron loppuvaihtoehto tai positiivinen kierrosmäärä.",
      zeroHpNoConditions:
        "{name} saavutti 0 HP eikä sillä ole aktiivisia tiloja.",
      zeroHpConditions: "{name} saavutti 0 HP. Valitse poistettavat tilat:",
      removeAllBtn: "Poista kaikki {name}-tilat",
      markIncapacitated: "Merkitse toimintakyvyttömäksi",
      removeFromTurnOrder: "Poista vuorojärjestyksestä",
      alreadyIncapacitated: "{name} on jo toimintakyvytön.",
      tokenRemovedFromTurn: "{name} poistettiin vuorojärjestyksestä.",
      tokenNotInTurn: "{name} ei löydy vuorojärjestyksestä.",
      moveTokenPrompt:
        "Siirretäänkö {name} karttatasolle niin, että se pysyy näkyvänä eikä häiritse muita tokeneita?",
      moveTokenBtn: "Siirrä {name} karttatasolle",
      tokenMoved: "{name} siirrettiin karttatasolle.",
      tokenNotFound: "Tokenia ei löydy.",
      noActiveConditions: "{name}:llä ei ole aktiivisia tiloja poistettavaksi.",
      deadNoConditions:
        "{name} merkittiin kuolleeksi. Aktiivisia tiloja ei ollut.",
      scriptReady: "{name} on aktiivinen ja käytät versiota {version}.",
      reachedZeroHp: "{name} saavutti 0 HP",
      manuallyRemoved: "poistettiin manuaalisesti",
      durationExpired: "kesto päättyi",
      markedAsDead: "{name} merkittiin kuolleeksi",
      conditionReorder:
        "Vuorojärjestys muuttui ja {count} seurattu tilarivi voi nyt olla väärässä paikassa. Palauta ne klikkaamalla alla niille kuuluvien tokeneiden jälkeen.",
      conditionsReordered:
        "Tilarivit on sijoitettu uudelleen niille kuuluvien tokeneiden jälkeen.",
    },
    removal: {
      conditionField: "Tila",
      reasonField: "Syy",
      turnRowField: "Turn Tracker -rivi",
      markerField: "Merkki",
      notConfigured: "Ei määritetty",
      markerRemoved: "Poistettu ({marker})",
      markerRetained: "Säilytetty ({marker})",
      rowRemoved: "Poistettu",
      rowMissing: "Jo puuttuu",
      manualReason: "Manuaalinen poisto",
    },
    cleanup: {
      orphaned: "Orpoja tilamerkintöjä",
      stale: "Vanhentuneita tilamerkintöjä",
      orphanedRows: "Orpoja Turn Tracker -rivejä",
      unusedMarkers: "Käyttämättömiä merkkejä",
    },
    apply: {
      turnAppended:
        "Kohde ei ollut vuorojärjestyksessä; tilarivi lisättiin loppuun.",
      turnInserted: "Tilarivi lisätty kohde-tokenin alapuolelle.",
    },
  },
  handout: {
    versionLabel: "Versio",
    subtitle: "D&D 5e -tilavaikutusten hallinta",
    footerNote:
      "Tämä handout luodaan ja päivitetään automaattisesti aina, kun skripti latautuu.",
    overview: {
      heading: "Yleiskatsaus",
      body: "Condition Tracker hallitsee D&D 5e -tiloja ja mukautettuja vaikutuksia nimettyinä riveinä Roll20:n Turn Trackerissa. Sovella tiloja tokeneihin, seuraa kestoja aloitejärjestyksessä ja poista vanhentuneet vaikutukset automaattisesti vuoron päättyessä. Kaikki komennot ovat vain GM:n käytettävissä ja ne voidaan käynnistää chatissa tai asennettujen makrojen kautta.",
    },
    quickStart: {
      heading: "Pika-aloitus",
      colCommand: "Komento",
      colDesc: "Kuvaus",
      rows: [
        [
          "!condition-tracker --prompt",
          "Vaiheittainen ohjattu toiminto — valitse tila, tokenit ja kesto vuorovaikutteisesti. Saatavilla myös ConditionTrackerWizard-makrona.",
        ],
        [
          "!condition-tracker --multi-target",
          "Sovella yksi tila useisiin tokeneihin samanaikaisesti. Saatavilla myös ConditionTrackerMultiTarget-makrona.",
        ],
        [
          "!condition-tracker --menu",
          "Avaa päähallinnointi valikko, jossa on painikkeet tilojen soveltamiseen, tarkasteluun tai poistamiseen.",
        ],
      ],
    },
    commandsRef: {
      heading: "Komentoviite",
      colFlag: "Lippu",
      colDesc: "Kuvaus",
      rows: [
        ["--prompt", "Vuorovaikutteinen vaiheittainen ohjaustoiminto"],
        ["--multi-target", "Sovella tila useisiin kohde-tokeneihin kerralla"],
        ["--menu", "Näytä päävalikko (lisää remove poistovalikkoa varten)"],
        [
          "--source X --target Y --condition Z",
          "Sovella tila suoraan ilman ohjaustoimintoa",
        ],
        [
          "--duration &lt;arvo&gt;",
          "Kesto suoraa soveltamista varten (esim. 2 rounds)",
        ],
        [
          "--other &lt;teksti&gt;",
          "Mukautettu teksti Loitsu / Kyky / Muu -vaikutustyypeille",
        ],
        [
          "--remove &lt;condition-id&gt;",
          "Poista tietty tila sen yksilöllisellä tunnuksella",
        ],
        [
          "--config &lt;option&gt; &lt;value&gt;",
          "Muuta asetuksia (katso alla oleva Asetukset-osio)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Ohita subjectPromptBypass vain tätä komentoa varten (tukee myös --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Täsmäytä tila — poista orpot tilat ja Turn Tracker -rivit",
        ],
        [
          "--reorder-conditions",
          "Siirrä ehtoriviä manuaalisesti niille määrättyjen pelinappuloiden taakse vuorojärjestyksessä",
        ],
        ["--reinstall-macro", "Luo GM-makrot uudelleen tai päivitä ne"],
        [
          "--reinstall-handout",
          "Luo lokalisoitu ohje-handout uudelleen tai päivitä se",
        ],
        [
          "--lang &lt;locale&gt;",
          "Tulosta tämän komennon viestit lisälocalella (kaksikielinen tila)",
        ],
        ["--help", "Näytä lyhyt ohjekortti chatissa"],
      ],
    },
    standardConditions: {
      heading: "Vakiotilat (D&amp;D 5e)",
      colCondition: "Tila",
    },
    customEffects: {
      heading: "Mukautetut vaikutustyypit",
      colType: "Tyyppi",
      colNotes: "Huomautukset",
      rows: [
        [
          "🔮 Loitsu",
          "Seuraa nimettyä loitsuvaikutusta — sinulta pyydetään loitsun nimi",
        ],
        [
          "🎯 Kyky",
          "Seuraa nimettyä luokka- tai rotukyvykkyyttä — sinulta pyydetään kyvyn nimi",
        ],
        [
          "🍀 Etu",
          "Kirjaa etulyöntiasema, joka annetaan tokenilta toiselle; ryhmitellään lähteen kanssa aloitejärjestyksessä",
        ],
        [
          "⬇️ Haitta",
          "Kirjaa asetettu haitta; ryhmitellään lähteen kanssa aloitejärjestyksessä",
        ],
        [
          "📝 Muu",
          "Vapaamuotoinen mukautettu tunniste — sinulta pyydetään kuvaus",
        ],
      ],
    },
    durationOptions: {
      heading: "Kestovaihtoehdot",
      intro:
        "Jäljellä oleva laskuri näkyy Turn Trackerin pr-sarakkeessa ja pienenee ankkuri-tokenin vuoron päättyessä.",
      colOption: "Vaihtoehto",
      colBehaviour: "Toiminta",
      rows: [
        [
          "Kunnes poistetaan",
          "Pysyvä — on poistettava manuaalisesti valikon tai --remove-komennon kautta",
        ],
        [
          "Kohteen seuraavan vuoron lopussa",
          "Vanhenee kun kohde-tokenin seuraava vuoro päättyy aloitejärjestyksessä",
        ],
        [
          "Lähteen seuraavan vuoron lopussa",
          "Vanhenee kun lähde-tokenin seuraava vuoro päättyy aloitejärjestyksessä",
        ],
        [
          "1 / 2 / 3 / 10 kierrosta",
          "Kiinteä laskuri; yksi pienennys ankkuri-tokenin vuoron päättyessä",
        ],
      ],
    },
    configuration: {
      heading: "Asetukset",
      intro:
        "Käytä !condition-tracker --config &lt;option&gt; &lt;value&gt; tai päävalikon Asetukset-painiketta.",
      colOption: "Vaihtoehto",
      colValues: "Arvot",
      colDesc: "Kuvaus",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Lisää Roll20-tilamarkerit tokeneihin, kun tila lisätään",
        ],
        [
          "useIcons",
          "true / false",
          "Näytä lyhyet kuvakekoodit (esim. [G]) emojien sijaan Turn Tracker -riveillä",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Ohita valinnainen kohde-tokenin vaihe Loitsu / Kyky / Muu -vaikutuksille",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Seurattava tokenpalkki; kun se tippuu 0:aan, GM:ää kehotetaan siivoamaan tilat",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Chat-viestien ja ohje-handoutin tulostuskieli",
        ],
        [
          "marker",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Korvaa tietyn tilan tilamerkki (esim. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Oletustilamarkerit",
      colCondition: "Tila",
      colMarker: "Merkin nimi",
    },
    availableLocales: {
      heading: "Saatavilla olevat käännökset",
      intro:
        "Käytä language-asetusta asettaaksesi chat-viestit ja ohje-handoutin mihin tahansa tuettuun localeen. Lyhyet aliakset ovat myös hyväksyttyjä muodoille en, zh ja pt.",
      colLocale: "Locale",
      colLanguage: "Kieli",
      colFile: "Käännöstiedosto",
    },
  },
};

export default TRANSLATION;
