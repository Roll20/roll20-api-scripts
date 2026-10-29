const TRANSLATION = {
  titles: {
    ready: 'Hexploration on valmis.',
    settings: 'Tutkimusasetukset',
    languages: 'Valitse kieli',
    pageSettings: 'Sivuasetukset: {page}',
    status: 'Tutkimuksen tila: {page}',
    help: 'Hexploration komennot',
    confirm: 'Ole hyvä ja vahvista',
  },
  discovery: {
    title: 'Sijainti löydetty',
  },
  menu: {
    draw: 'Piirrä',
    reveal: 'Paljasta ja piilota',
    locations: 'Sijainnit',
    tools: 'Työkalut',
    layerInUse: 'Uusia heksalukuja piirretään paikkaan {layer}.',
    pageSettingsHelp:
      'Nämä asetukset koskevat vain tätä sivua. ★-merkityt asetukset ohittavat yleiset asetukset.',
  },
  buttons: {
    fill: 'Täyttää',
    fillInverse: 'Käänteinen täyttö',
    undo: 'Kumoa täyttö',
    reveal: 'Paljastaa',
    conceal: 'Salata',
    explore: 'Tutkia',
    revealPage: 'Paljasta sivu',
    resetPage: 'Nollaa sivu',
    mark: 'Merkitse sijainti',
    unmark: 'Poista merkintä',
    name: 'Nimi Hex',
    settings: 'Asetukset',
    pageSettings: 'Sivun asetukset',
    status: 'Status',
    rescan: 'Skannaa uudelleen',
    calibrate: 'Kalibroida',
    calibrateReset: 'Nollaa kalibrointi',
    help: 'Auttaa',
    change: 'Muuttaa',
    menu: 'Valikko',
    clearOverrides: 'Tyhjennä ohitukset',
    confirmReset: 'Kyllä, poista kaikki heksit',
  },
  prompts: {
    name: 'Sijainnin nimi (jätä tyhjäksi tyhjentääksesi)',
  },
  values: {
    on: 'Päällä',
    off: 'Pois',
    none: 'Ei mitään',
    hexLayer: {
      auto: 'Automaattinen (etualalla, jos saatavilla)',
      foreground: 'etualan kerros',
      objects: 'merkkikerros',
    },
    revealBy: {
      players: 'Pelaajan merkit',
      characters: 'Hahmomerkit',
      all: 'Kaikki merkit',
    },
    revealMode: {
      clear: 'Selkeä',
      glimpse: 'Vilkkaus',
    },
    announce: {
      all: 'Kaikki',
      gm: 'Vain GM',
      off: 'Pois',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Täyttää',
      fillInverse: 'Käänteinen täyttö',
      conceal: 'Salata',
    },
  },
  settings: {
    language: {
      label: 'Kieli',
      desc: 'Valikkojen, viestien ja monisteiden kieli.',
    },
    hexLayer: {
      label: 'Hex kerros',
      desc: 'Jossa piirretään uudet heksat. Auto yrittää etualan kerrosta (merkkien yläpuolella) ja palaa token-kerrokseen, jos peli ei tue sitä.',
    },
    fillColor: {
      label: 'Täyttöväri',
      desc: 'Uusien kuusioiden väri. Käytä rgba()-funktiota läpinäkyville heksadesille, esimerkiksi rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Reunuksen väri',
      desc: 'Uusien kuusioiden ääriviivan väri.',
    },
    labelColor: {
      label: 'Etiketin väri',
      desc: 'Vain GM:n nimitarrojen väri nimetyissä heksadesissä.',
    },
    glimpseColor: {
      label: 'Glimpse Color',
      desc: 'Heksojen väri muuttuu välähdessään (Glimpse paljastamistila). Käytä läpinäkyvää rgba()-väriä.',
    },
    strokeWidth: {
      label: 'Reunan leveys',
      desc: 'Uusien heksojen ääriviivan leveys pikseleinä (0 - 20).',
    },
    maxDistance: {
      label: 'Hex paljastaa etäisyyttä',
      desc: 'Soveltuu heksaan, kun ne on piirretty: merkki on oltava tämän monen heksan sisällä paljastaakseen ne, riippumatta siitä, kuinka kauas se näkee. Jätä tyhjäksi ilman rajoituksia.',
    },
    revealDistance: {
      label: 'Näköetäisyys',
      desc: 'Kuinka monta heksaa liikkuvan merkin ympärillä paljastetaan (0 - 20). 0 paljastaa vain ne heksat, joiden läpi merkki kulkee.',
    },
    lineOfSight: {
      label: 'Näkökenttä',
      desc: 'Kun heksa on päällä, se paljastuu vain, jos sen ja merkin välissä ei ole peitettyä heksaa.',
    },
    revealPath: {
      label: 'Paljasta polun varrella',
      desc: 'Kun se on päällä, jokainen hex, jonka läpi merkki kulkee vedettäessä (mukaan lukien reittipisteet), paljastetaan, ei vain sen pysähtymiskohtaa.',
    },
    revealBy: {
      label: 'Tokenit jotka paljastavat',
      desc: 'Token-kerroksen merkit paljastavat heksioita: pelaajan hallitsemia merkkejä, mitä tahansa hahmoa edustavia merkkejä tai jokaista merkkiä.',
    },
    revealMode: {
      label: 'Paljastustila',
      desc: 'Kirkas poistaa kuusiot näkyviltä. Sen sijaan välähdys tekee niistä läpinäkyviä; ne poistetaan, kun niihin tulee merkki.',
    },
    announce: {
      label: 'Ilmoita löydökset',
      desc: 'Kuka näkee chat-viestin, kun nimetty sijainti löydetään.',
    },
    pingDiscoveries: {
      label: 'Ping löydöt',
      desc: 'Kun se on päällä, pelaajat pingoidaan nimettyyn paikkaan, kun se löydetään.',
    },
    hideCoveredTokens: {
      label: 'Piilota peitetyt rahakkeet',
      desc: 'Roll20 piirtää nimiä, palkkeja ja auloja heksaan yläpuolelle. Kun se on päällä, peitetyn heksan alla olevilla rahakkeilla on pelaajalle näkyvä nimi, palkit ja aurat pois päältä ja takaisin päälle, kun ne paljastuvat.',
    },
  },
  status: {
    engine: 'Pelin moottori',
    grid: 'Ruudukko',
    layer: 'Hex kerros',
    hexes: 'Hexes',
    named: 'Nimetyt heksat',
    icons: 'Sijaintitunnukset',
    glimpsed: 'Näytetyt kuusiot',
    pending: 'Täyttöä odottavat paikat',
    calibrated: 'Kalibroitu',
    overrides: 'Sivun ohitukset',
    undo: 'Kumoa käytettävissä',
  },
  messages: {
    filled:
      'Täyttö valmis. Heksat piirretty: {created}. Uudelleen muotoiltu: {restyled}. Piilotetut sijainnit: {icons}.',
    revealed: 'Heksat paljastettiin: {count}.',
    revealedPage: 'Jokainen sivun heksa paljastettiin ({count}).',
    confirmReset:
      'Poistetaanko jokainen heksa kohdasta "{page}" ({count})? Sijaintitunnukset palaavat merkkikerrokseen. Kumoa ei voi peruuttaa tätä.',
    resetPage: 'Heksit poistettu sivulta: {count}.',
    undone:
      'Viimeinen täyttö kumottu. Heksit poistettu: {removed}. Uudelleen muotoillut heksat palautettu: {restored}.',
    named: 'Heksaalit nimeltä "{name}": {count}.',
    unnamed: 'Poistetut nimet: {count}.',
    marked:
      'Olemassa oleviin heksaan piilotetut sijainnit: {attached}. Odotetaan seuraavaa täyttöä, joka kattaa ne: {pending}.',
    unmarked: 'Tunnukset, jotka eivät ole enää sijainteja: {count}.',
    settingChanged: '{setting} asetettu arvoon {value}.',
    rescanned:
      'Uudelleenskannaus valmis. Säilytetty: {kept}. Hyväksytty: {adopted}. Arkistoitu uudelleen: {moved}. Kadonnut ja unohdettu: {dropped}. Uudelleen linkitetyt tunnisteet: {labels}. Sijaintitunnukset linkitetty uudelleen: {icons}.',
    calibrated:
      'Ruudukko kalibroitu (sarakkeen vaihe {colStep}px, rivin vaihe {rowStep}px). Tarkista uudelleen: säilytetty {kept}, arkistoitu uudelleen {moved}, hyväksytty {adopted}.',
    calibrationReset:
      'Kalibrointi poistettu. Tarkista uudelleen: säilytetty {kept}, arkistoitu uudelleen {moved}, hyväksytty {adopted}.',
    journalRebuilt: 'Monisteet "{help}" ja "{deck}" on rakennettu uudelleen.',
    migrated:
      'Hexploration 1.x -heksaanikarttasi on päivitetty. Jos tämä peli on kopioitu Legacy-pelistä, suorita Rescan jokaisella hex-karttasivulla.',
    pruned:
      'Tallennetut heksat, joita ei enää ole ja jotka unohdettiin: {dropped}. Jos tämä peli tai sivu kopioitiin, suorita sivulla uudelleenskannaus, jotta voit hakea sen heksaanit uudelleen.',
    readyHint: 'Kirjoita valikkoon !hexploration tai avaa "Hexploation - Command Deck" -moniste.',
  },
  warnings: {
    foregroundUnavailable:
      'Tämä peli ei tue piirtämistä etualan kerrokselle, joten heksaat piirrettiin merkkikerrokseen.',
    someFailed: 'Heksat, joita ei voitu piirtää: {count}. Katso lisätietoja API-konsolista.',
  },
  errors: {
    noPage: 'Työstettävää sivua ei löytynyt.',
    notHex: 'Tämä sivu ei käytä kuusioruudukkoa.',
    noPolygons: 'Valitse yksi tai useampi piirretty muoto täytettäväksi.',
    emptyArea: 'Valittu alue ei sisällä heksakeskuksia.',
    tooMany: 'Tämä loisi liian monta heksaa kerralla ({count}).',
    nothingToConceal: 'Valitse piilotettavat piirretyt muodot tai merkit.',
    nothingToReveal: 'Valitse paljastettavat kuusikat, piirretyt muodot tai merkit.',
    noTokens: 'Valitse ensin yksi tai useampi merkki.',
    noHexes: 'Valitse ensin yksi tai useampi heksa (tai heksoilla seisova rahake).',
    nothingToUndo: 'Kumoavaa täyttöä ei ole.',
    unknownCommand: 'Tuntematon komento: {command}',
    unknownSetting: 'Tuntematon asetus: {key}',
    unknownPageSetting: 'Sivukohtaisesti määritettävissä olevat asetukset: {keys}',
    invalidValue: '"{value}" ei ole kelvollinen arvo kohteelle {key}.',
    calibrateNeedsTokens: 'Valitse yksi tai kaksi kuusiokeskuksiin napsautettua rahaketta.',
    calibrateFailed: 'Näitä tunnuksia ei voi käyttää kalibrointiin.',
    unexpected: 'Jotain meni pieleen: {message}',
  },
  hints: {
    noPage: 'Avaa sivu, jota haluat käsitellä, tai valitse siitä jotain.',
    notHex: 'Aseta sivun ruudukoksi heksadesimaali (V) tai heksa (H) Sivuasetuksissa.',
    noPolygons:
      'Piirrä alueen ympärille monikulmio, suorakulmio, ellipsi tai vapaalla kädellä oleva muoto, valitse se ja yritä sitten uudelleen.',
    emptyArea: 'Piirrä suurempi muoto tai tarkista sivuruudukon asetukset.',
    tooMany: 'Täytä pienempi alue tai jaa alue useisiin muotoihin.',
    noHexes:
      'Heksit ovat etualalla tai merkkikerroksessa; vaihda kyseiselle tasolle valitaksesi ne.',
    unknownCommand: 'Kirjoita !hexploration help listataksesi komennot.',
    unknownSetting: 'Näet kaikki asetukset kirjoittamalla !hexploration set.',
    calibrateNeedsTokens:
      'Napsauta merkki heksan keskelle ja valitse se. Valitse toinen saman rivin (Hex V) tai sarakkeen (Hex H) viereiseen heksaaniin napsautettu merkki ja korjaa myös heksadesimaalikoko.',
    calibrateFailed:
      'Kahden tunnuksen on oltava samalla rivillä (Hex V) tai samassa sarakkeessa (Hex H), vähintään yhden heksan päässä toisistaan.',
    unexpected: 'Yksityiskohdat ovat API-konsolin lokissa.',
  },
  help: {
    menu: 'Näytä valikko.',
    fill: 'Peitä valitut piirretyt muodot kuusioilla.',
    fillInverse: 'Peitä koko sivu paitsi valittujen muotojen sisällä.',
    undo: 'Kumoa viimeinen täyttö, käänteinen täyttö tai piilota ja palauta käytetyt muodot.',
    reveal: 'Näytä valitut heksat ja valittujen muotojen ja merkkien alla olevat heksat.',
    revealPage: 'Paljasta sivun jokainen hex ilman ilmoituksia.',
    conceal: 'Peitä alue valittujen muotojen ja merkkien alla uudelleen kuusioilla.',
    explore:
      'Paljasta valittujen rahakkeiden ympärillä ikään kuin ne olisivat juuri muuttaneet sinne.',
    resetPage: 'Poista sivulta jokainen hekseli (kysyy ensin).',
    name: 'Nimeä valitut heksat tai valittujen merkkien alla olevat heksat. Tyhjennä se jättämällä nimen tyhjäksi.',
    mark: 'Muuta valitut merkit piilotettuihin paikkoihin.',
    unmark: 'Estä valittujen merkkien piilottaminen.',
    set: 'Muuta asetusta tai näytä kaikki asetukset.',
    pageSet: 'Ohita paljastamisasetus vain nykyisellä sivulla.',
    pageClear: 'Poista nykyisen sivun ohitukset.',
    rescan:
      'Rakenna sivun heksadesimaalilista uudelleen esimerkiksi sivun tai pelin kopioimisen jälkeen.',
    calibrate:
      'Linjaa kuusioruudukko yhdellä tai kahdella valitulla kentällä, jotka on napsautettu kuusiokeskuksiin.',
    calibrateReset: 'Poista nykyisen sivun kalibrointi.',
    status: 'Näytä, mitä Hexploration tietää nykyisestä sivusta.',
    journal: 'Rakenna Ohje- ja komentokansion monisteet uudelleen.',
    help: 'Näytä tämä luettelo.',
    handout: 'Täydelliset ohjeet ovat monisteessa "{name}".',
  },
  deck: {
    subtitle: 'Komentolevy',
    drawDesc:
      'Piirrä muotoja alueen ympärille, valitse ne ja täytä. Kumoa kääntää viimeisen täytön.',
    revealDesc:
      'Valitse kuusiot, muodot tai merkit paljastaaksesi tai peittääksesi ne uudelleen. Tutki valittujen tokenien ympärillä olevia paljastuksia ikään kuin ne olisivat siirtyneet.',
    locationsDesc:
      'Valitse tunnukset piilottaaksesi ne sijainneiksi heksojen alle. Valitse heksadesimaalit tai merkit nimetäksesi heksan.',
    toolsDesc:
      'Asetukset, sivujen ohitukset, tila, kopioitujen sivujen uudelleenskannaus ja ruudukon kalibrointi.',
    footer: 'Katso täydelliset ohjeet monisteesta "{help}".',
  },
  handout: {
    versionLabel: 'Versio',
    subtitle: 'Hex-by-hex tutkiminen Roll20:lle',
    footer: 'Käytä "{deck}" -monistetta yhden napsautuksen ohjaimiin.',
    overview: {
      heading: 'Yleiskatsaus',
      body: 'Hexploration kattaa hex-kartan läpinäkymättömillä heksailla. Kun seurue liikkuu, niiden läpi kulkevat heksat (ja halutessasi niiden ympärillä olevat heksat) poistetaan, joten kartta paljastuu heksa kerrallaan. Piilotetut paikat voidaan sijoittaa heksojen alle ja niistä ilmoitetaan, kun ne löydetään. Se toimii Jumpgate- ja Legacy-peleissä, minkä tahansa kokoisissa Hex (V) ja Hex (H) -ruudukoissa.',
      demo: 'Katso lyhyt esittely (versiosta 1)',
    },
    quickStart: {
      heading: 'Pika-aloitus',
      steps: [
        'Avaa sivu, jonka ruudukkoasetuksena on Hex (V) tai Hex (H).',
        'Piirrä piilotettavan alueen ympärille yksi tai useampi muoto (monikulmio, suorakaide, ellipsi tai vapaalla kädellä).',
        'Valitse muodot ja napsauta Täytä komentopakissa (tai kirjoita !hexploration fill). Muodot korvataan heksoilla.',
        'Valinnainen: ennen täyttämistä valitse tunnukset tärkeille paikoille ja napsauta Merkitse sijainti. Ne piilotetaan kuusioiden alle ja ilmoitetaan, kun ne löydetään.',
        'Siirrä pelaajatunnusta. Jokainen heksa, jonka se kulkee, ja sen näköetäisyyden sisällä olevat heksat paljastetaan.',
      ],
    },
    commands: {
      heading: 'komennot',
      intro:
        'Vain GM:t voivat käyttää näitä komentoja. Useimmat toimivat valittuihin objekteihin; loput toimivat katsomallasi sivulla.',
      colCommand: 'Komento',
      colDesc: 'Mitä se tekee',
    },
    revealing: {
      heading: 'Kuinka paljastaminen toimii',
      points: [
        'Vain merkkikerroksen merkit paljastavat heksalukuja. Tokens That Reveal -pelimerkkien määrän määrittää oletusarvoisesti pelaajamerkit, joten GM voi siirtää hirviöitä paljastamatta karttaa.',
        'Token paljastaa jokaisen heksan, jonka se peittää (suuret merkit kattavat useita) ja, kun Reveal Along Path on päällä, jokaisen heksan reitillä, jota se vedettiin, mukaan lukien reittipisteet.',
        'Näköetäisyys paljastaa kunkin heksan ympärillä olevat heksat. Kun Line of Sight on päällä, kuusio tulee näkyviin vain, jos välissä ei ole peitettyä kuusiota.',
        'Hex Reveal Distance tallennetaan heksaan kun ne piirretään. Nuo heksat paljastuvat vain sisältäpäin, että monet heksat, kuinka kauas merkki näkee. Käytä sitä vuorille tai metsille, jotka piilottavat sen, mikä on takanaan.',
        'Glimpse-tilassa näkyvissä olevista kuusioista tulee läpinäkyviä sen sijaan, että ne katoavat, ja ne poistetaan, kun niihin tulee merkki.',
        'API ei raportoi muiden modien tekemiä liikkeitä. TokenMod-liikkeet poimitaan automaattisesti; muita modeja varten valitse tunnukset ja napsauta Explore tai soita Hexploration.revealAround(token) omasta modistasi.',
        'API ei raportoi muiden modien tekemiä liikkeitä. TokenMod-liikkeet poimitaan automaattisesti; muita modeja varten valitse tunnukset ja napsauta Explore tai soita Hexploration.revealAround(token) omasta modistasi.',
      ],
    },
    locations: {
      heading: 'Nimetty Heksit ja sijainnit',
      points: [
        'Mark Location muuttaa valitut tunnukset piilotetuiksi sijainneiksi. Heksan alla oleva merkki piilotetaan heti; muuten se piilotetaan seuraavalla sen peittävällä täytteellä.',
        'Valkoisen tornin tilamerkillä varustetut rahakkeet käsitellään myös sijainneina, kun täytät, kuten versiossa 1.',
        'Piilotetut sijaintitunnukset siirretään GM-tasolle. Kun heidän heksansa paljastetaan, he palaavat merkkikerrokseen ja heidän nimensä näytetään, ja heidän löytönsä ilmoitetaan.',
        'Name Hex antaa heksalle nimen ilman merkkiä. Nimi näytetään GM:lle etikettinä GM-tasolla ja ilmoitetaan, kun hex paljastetaan.',
        'Announce Discoveries valitsee, näkevätkö ilmoituksen kaikki, vain GM vai ei kukaan. Ping Discoveries siirtää myös pelaajien näkymän paikkaan.',
      ],
    },
    settings: {
      heading: 'Asetukset',
      intro:
        'Muuta asetuksia !hexploration setillä (tai Asetukset-painikkeella). Hex Layer, Tokens That Reveal ja Language voidaan asettaa myös Modin asetussivulla.',
      colKey: 'Avain',
      colName: 'Asetus',
      colDesc: 'Kuvaus',
      perPage: '(Voidaan asettaa sivukohtaisesti.)',
    },
    jumpgate: {
      heading: 'Jumpgate ja Legacy',
      points: [
        'Hexploration selvittää, mitä moottoria peli käyttää, ja piirtää vastaavan muodon. Kummassakin editorissa piirretyt muodot voidaan täyttää.',
        'Kun Hex Layer -asetuksena on Auto, heksat piirretään etualan tasolle, merkkien yläpuolelle, jotta pelaajat eivät näe, mitä alla on. Jos etualan kerrosta ei ole saatavilla, sen sijaan käytetään merkkikerrosta.',
        'Jumpgate piirtää matemaattisesti säännölliset heksat, jotka ovat hieman eri muotoisia kuin Legacy-heksat. Jos heksaat eivät ole linjassa sivun ruudukon kanssa, kiinnitä merkki heksaanien keskipisteeseen, valitse se ja napsauta Kalibroi. Valitse kaksi merkkiä saman rivin (Hex V) tai sarakkeen (Hex H) viereisistä heksadesistä korjataksesi myös heksadesiaalisen koon.',
        'Kun sivu tai peli kopioidaan, sen heksat saavat uudet tunnukset. Suorita uudelleenskannaus sivulla hakeaksesi ne uudelleen sekä niiden nimilaput ja sijaintitunnukset.',
      ],
    },
    upgrading: {
      heading: 'Päivitys versiosta 1',
      points: [
        'Versio 2 ei enää tarvitse PathMath-, MatrixMath-, Vector Math- tai HTML Builder -sovellusta. Voit poistaa ne, ellei toinen mod käytä niitä.',
        'Nykyiset heksadesimaalikartat, nimet, sijaintitunnukset ja asetukset päivitetään automaattisesti ensimmäisen käynnistyksen yhteydessä.',
        'Version 1 komennot, mukaan lukien Hexploration_menu-makro, toimivat edelleen.',
        'Versio 1 antaa minkä tahansa merkkiä edustavan tunnuksen paljastaa heksalukuja. Aseta Paljastavat Tokenit Hahmotokeneiksi säilyttääksesi tämän käytöksen.',
      ],
      colV1: 'Version 1 komento',
      colV2: 'Version 2 komento',
    },
    troubleshooting: {
      heading: 'Vianetsintä',
      points: [
        'Mitään ei tapahdu, kun merkki liikkuu: tarkista, että merkki on merkkikerroksella ja vastaa Tokens That Reveal -merkkejä ja että sivulla on heksioita (!hexploration status).',
        'Heksat ovat poissa ruudukosta: käytä Kalibrointia ja tarkista sitten tunnuksella muutamalla heksalla kartalla.',
        'Heksit lakkasivat paljastamasta sivun tai pelin kopioimisen jälkeen: suorita sivulla Rescan.',
        'Fill sanoo, että alueella ei ole heksadesimaalikeskuksia: muodon on sisällettävä vähintään yhden hex-keskipiste.',
        'Jos haluat lisätietoja, tarkista API-konsolin loki ja sisällytä sen viestit, kun pyydät apua.',
      ],
    },
    languages: {
      heading: 'Kielet',
      body: 'Valitse kieli !hexploration set -kielellä. Käytettävissä olevat kielet:',
      colLanguage: 'Kieli',
      colNative: 'Alkuperäinen nimi',
      colCode: 'Koodi',
    },
    credits: {
      heading: 'Krediitit',
      original: 'Alkuperäinen mod',
      maintainer: 'Versio 2 ylläpitäjä',
      marketplace: 'Adan taidepaketit Roll20 Marketplacessa',
      support:
        'Jos löydät virheen tai sinulla on idea, kirjoita viesti Roll20 Mod -foorumille tai avaa ongelma GitHubissa ja sisällytä kaikki viestit API-konsolin lokista.',
    },
  },
};

export default TRANSLATION;
