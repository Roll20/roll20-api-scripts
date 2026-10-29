const TRANSLATION = {
  titles: {
    ready: 'Hexploration on valmis.',
    settings: 'Hexploration-asetukset',
    languages: 'Valitse kieli',
    pageSettings: 'Sivuasetukset: {page}',
    status: 'Hexploration-tila: {page}',
    help: 'Hexploration-komennot',
    confirm: 'Vahvista',
  },
  discovery: {
    title: 'Sijainti löydetty',
  },
  menu: {
    draw: 'Piirto',
    reveal: 'Paljasta ja piilota',
    locations: 'Sijainnit',
    tools: 'Työkalut',
    layerInUse: 'Uudet heksat piirretään tasolle: {layer}.',
    pageSettingsHelp:
      'Nämä asetukset koskevat vain tätä sivua. ★-merkityt asetukset ohittavat yleiset asetukset.',
  },
  buttons: {
    fill: 'Täytä',
    fillInverse: 'Käänteinen täyttö',
    undo: 'Kumoa täyttö',
    reveal: 'Paljasta',
    conceal: 'Peitä',
    explore: 'Tutki',
    revealPage: 'Paljasta sivu',
    resetPage: 'Nollaa sivu',
    mark: 'Merkitse sijainti',
    unmark: 'Poista merkintä',
    name: 'Nimeä heksa',
    settings: 'Asetukset',
    pageSettings: 'Sivuasetukset',
    status: 'Tila',
    rescan: 'Skannaa uudelleen',
    calibrate: 'Kalibroi',
    calibrateReset: 'Nollaa kalibrointi',
    help: 'Ohje',
    change: 'Muuta',
    menu: 'Valikko',
    clearOverrides: 'Tyhjennä ohitukset',
    confirmReset: 'Kyllä, poista kaikki heksat',
  },
  prompts: {
    name: 'Sijainnin nimi (jätä tyhjäksi tyhjentääksesi)',
  },
  values: {
    on: 'Päällä',
    off: 'Pois',
    none: 'Ei mitään',
    hexLayer: {
      auto: 'Automaattinen (etuala, jos saatavilla)',
      foreground: 'etualan taso',
      objects: 'merkkitaso',
    },
    revealBy: {
      players: 'Pelaajien merkit',
      characters: 'Hahmojen merkit',
      all: 'Kaikki merkit',
    },
    revealMode: {
      clear: 'Poisto',
      glimpse: 'Vilkaisu',
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
      fill: 'Täyttö',
      fillInverse: 'Käänteinen täyttö',
      conceal: 'Peitto',
    },
  },
  settings: {
    language: {
      label: 'Kieli',
      desc: 'Valikkojen, viestien ja monisteiden kieli.',
    },
    hexLayer: {
      label: 'Heksataso',
      desc: 'Mihin uudet heksat piirretään. Automaattinen kokeilee etualan tasoa (merkkien yläpuolella) ja käyttää merkkitasoa, jos peli ei tue sitä.',
    },
    fillColor: {
      label: 'Täyttöväri',
      desc: 'Uusien kuusioiden väri. Käytä rgba()-funktiota läpinäkyville heksadesille, esimerkiksi rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Reunan väri',
      desc: 'Uusien kuusioiden ääriviivan väri.',
    },
    labelColor: {
      label: 'Nimilappujen väri',
      desc: 'Vain GM:n nimitarrojen väri nimetyissä heksadesissä.',
    },
    glimpseColor: {
      label: 'Vilkaisun väri',
      desc: 'Väri, jonka heksat saavat Vilkaisu-tilassa. Käytä läpikuultavaa rgba()-väriä.',
    },
    strokeWidth: {
      label: 'Reunan leveys',
      desc: 'Uusien heksojen ääriviivan leveys pikseleinä (0 - 20).',
    },
    maxDistance: {
      label: 'Heksojen paljastusetäisyys',
      desc: 'Soveltuu heksaan, kun ne on piirretty: merkki on oltava tämän monen heksan sisällä paljastaakseen ne, riippumatta siitä, kuinka kauas se näkee. Jätä tyhjäksi ilman rajoituksia.',
    },
    revealDistance: {
      label: 'Näköetäisyys',
      desc: 'Kuinka monta heksaa liikkuvan merkin ympärillä paljastetaan (0 - 20). 0 paljastaa vain ne heksat, joiden läpi merkki kulkee.',
    },
    lineOfSight: {
      label: 'Näköyhteys',
      desc: 'Kun heksa on päällä, se paljastuu vain, jos sen ja merkin välissä ei ole peitettyä heksaa.',
    },
    revealPath: {
      label: 'Paljasta reitin varrelta',
      desc: 'Kun se on päällä, jokainen hex, jonka läpi merkki kulkee vedettäessä (mukaan lukien reittipisteet), paljastetaan, ei vain sen pysähtymiskohtaa.',
    },
    revealBy: {
      label: 'Paljastavat merkit',
      desc: 'Token-kerroksen merkit paljastavat heksioita: pelaajan hallitsemia merkkejä, mitä tahansa hahmoa edustavia merkkejä tai jokaista merkkiä.',
    },
    revealMode: {
      label: 'Paljastustila',
      desc: 'Poisto poistaa näköetäisyydellä olevat heksat. Vilkaisu tekee niistä sen sijaan läpikuultavia; ne poistetaan, kun merkki astuu niihin.',
    },
    announce: {
      label: 'Ilmoita löydöt',
      desc: 'Kuka näkee chat-viestin, kun nimetty sijainti löydetään.',
    },
    pingDiscoveries: {
      label: 'Pingaa löydöt',
      desc: 'Kun se on päällä, pelaajat pingoidaan nimettyyn paikkaan, kun se löydetään.',
    },
    hideCoveredTokens: {
      label: 'Piilota peitetyt merkit',
      desc: 'Roll20 piirtää nimiä, palkkeja ja auloja heksaan yläpuolelle. Kun se on päällä, peitetyn heksan alla olevilla rahakkeilla on pelaajalle näkyvä nimi, palkit ja aurat pois päältä ja takaisin päälle, kun ne paljastuvat.',
    },
  },
  status: {
    engine: 'Pelimoottori',
    grid: 'Ruudukko',
    layer: 'Heksataso',
    hexes: 'Heksat',
    named: 'Nimetyt heksat',
    icons: 'Sijaintimerkit',
    glimpsed: 'Vilkaistut heksat',
    pending: 'Täyttöä odottavat sijainnit',
    calibrated: 'Kalibroitu',
    overrides: 'Sivun ohitukset',
    undo: 'Kumoaminen käytettävissä',
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
      'Hexploration 1.x -heksakarttasi on päivitetty. Jos tämä peli on kopioitu Legacy-pelistä, suorita Skannaa uudelleen jokaisella heksakarttasivulla.',
    pruned:
      'Tallennetut heksat, joita ei enää ole ja jotka unohdettiin: {dropped}. Jos tämä peli tai sivu kopioitiin, suorita sivulla Skannaa uudelleen, jotta sen heksat löytyvät taas.',
    readyHint:
      'Kirjoita !hexploration avataksesi valikon, tai avaa moniste "Hexploration - Command Deck".',
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
    notHex: 'Aseta sivun ruudukoksi Hex (V) tai Hex (H) sivun asetuksista.',
    noPolygons:
      'Piirrä alueen ympärille monikulmio, suorakulmio, ellipsi tai vapaalla kädellä oleva muoto, valitse se ja yritä sitten uudelleen.',
    emptyArea: 'Piirrä suurempi muoto tai tarkista sivuruudukon asetukset.',
    tooMany: 'Täytä pienempi alue tai jaa alue useisiin muotoihin.',
    noHexes:
      'Heksit ovat etualalla tai merkkikerroksessa; vaihda kyseiselle tasolle valitaksesi ne.',
    unknownCommand: 'Kirjoita !hexploration help listataksesi komennot.',
    unknownSetting: 'Näet kaikki asetukset kirjoittamalla !hexploration set.',
    calibrateNeedsTokens:
      'Kiinnitä merkki heksan keskelle ja valitse se. Korjaa myös heksan koko valitsemalla toinen merkki, joka on kiinnitetty viereiseen heksaan samalla rivillä (Hex V) tai samassa sarakkeessa (Hex H).',
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
      'Rakenna sivun heksaluettelo uudelleen, esimerkiksi sivun tai pelin kopioinnin jälkeen.',
    calibrate:
      'Linjaa kuusioruudukko yhdellä tai kahdella valitulla kentällä, jotka on napsautettu kuusiokeskuksiin.',
    calibrateReset: 'Poista nykyisen sivun kalibrointi.',
    status: 'Näytä, mitä Hexploration tietää nykyisestä sivusta.',
    journal: 'Rakenna monisteet Help ja Command Deck uudelleen.',
    help: 'Näytä tämä luettelo.',
    handout: 'Täydelliset ohjeet ovat monisteessa "{name}".',
  },
  deck: {
    drawDesc:
      'Piirrä muotoja alueen ympärille, valitse ne ja napsauta Täytä. Kumoa täyttö peruu viimeisimmän täytön.',
    revealDesc:
      'Valitse heksoja, muotoja tai merkkejä paljastaaksesi ne tai peittääksesi ne uudelleen. Tutki paljastaa valittujen merkkien ympäristön ikään kuin ne olisivat juuri siirtyneet sinne.',
    locationsDesc:
      'Valitse merkit piilottaaksesi ne sijainneiksi heksojen alle. Valitse heksoja tai merkkejä nimetäksesi heksan.',
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
        'Valitse muodot ja napsauta Command Deck -monisteessa Täytä (tai kirjoita !hexploration fill). Muodot korvataan heksoilla.',
        'Valinnainen: valitse ennen täyttöä merkit tärkeille paikoille ja napsauta Merkitse sijainti. Ne piilotetaan heksojen alle, ja niistä ilmoitetaan, kun ne löydetään.',
        'Siirrä pelaajan merkkiä. Jokainen heksa, jonka läpi se kulkee, ja sen Näköetäisyyden sisällä olevat heksat paljastetaan.',
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
        'Heksoja paljastavat vain merkkitason merkit. Asetus Paljastavat merkit määrää, mitkä merkit lasketaan: oletuksena pelaajien merkit, joten GM voi siirtää hirviöitä paljastamatta karttaa.',
        'Merkki paljastaa jokaisen heksan, jonka se peittää (suuret merkit peittävät useita), ja kun Paljasta reitin varrelta on päällä, jokaisen heksan reitillä, jota pitkin sitä vedettiin, välipisteet mukaan lukien.',
        'Näköetäisyys paljastaa kunkin näiden heksojen ympärillä olevat heksat. Kun Näköyhteys on päällä, heksa paljastetaan vain, jos välissä ei ole peitettyä heksaa.',
        'Heksojen paljastusetäisyys tallennetaan heksoihin niitä piirrettäessä. Nämä heksat paljastuvat vain enintään näin monen heksan päästä, vaikka merkki näkisi kauemmas. Käytä sitä vuorille tai metsille, jotka kätkevät taakseen jäävän.',
        'Vilkaisu-tilassa näköetäisyydellä olevat heksat muuttuvat läpikuultaviksi katoamisen sijaan, ja ne poistetaan, kun merkki astuu niihin.',
        'Roll20 piirtää merkkien nimet, palkit ja aurat heksojen päälle. Kun Piilota peitetyt merkit on päällä, peitetyn heksan alla olevan merkin pelaajille näkyvä nimi, palkit ja aurat kytketään pois, kunnes se paljastuu, joten piilotetut hirviöt eivät paljasta itseään. Jos kytket jonkin niistä päälle merkin ollessa peitettynä, se pysyy piilossa ja kytkeytyy päälle, kun merkki paljastuu.',
        'API ei ilmoita muiden modien tekemistä siirroista. TokenModin siirrot huomataan automaattisesti; muiden modien kohdalla valitse merkit ja napsauta Tutki tai kutsu Hexploration.revealAround(token) omasta modistasi.',
      ],
    },
    locations: {
      heading: 'Nimetty Heksit ja sijainnit',
      points: [
        'Merkitse sijainti muuttaa valitut merkit piilotetuiksi sijainneiksi. Jo heksan alla oleva merkki piilotetaan heti; muuten sen piilottaa seuraava täyttö, joka peittää sen.',
        'Valkoisen tornin tilamerkillä varustetut rahakkeet käsitellään myös sijainneina, kun täytät, kuten versiossa 1.',
        'Piilotetut sijaintitunnukset siirretään GM-tasolle. Kun heidän heksansa paljastetaan, he palaavat merkkikerrokseen ja heidän nimensä näytetään, ja heidän löytönsä ilmoitetaan.',
        'Nimeä heksa antaa heksalle nimen ilman merkkiä. Nimi näytetään GM:lle nimilappuna GM-tasolla, ja siitä ilmoitetaan, kun heksa paljastetaan.',
        'Ilmoita löydöt valitsee, näkevätkö ilmoituksen kaikki, vain GM vai ei kukaan. Pingaa löydöt siirtää lisäksi pelaajien näkymän sijaintiin.',
      ],
    },
    settings: {
      heading: 'Asetukset',
      intro:
        'Muuta asetuksia komennolla !hexploration set (tai Asetukset-painikkeella). Heksatason, Paljastavat merkit ja Kielen voi asettaa myös modin asetussivulla.',
      colKey: 'Avain',
      colName: 'Asetus',
      colDesc: 'Kuvaus',
      perPage: '(Voidaan asettaa sivukohtaisesti.)',
    },
    jumpgate: {
      heading: 'Jumpgate ja Legacy',
      points: [
        'Hexploration selvittää, mitä moottoria peli käyttää, ja piirtää vastaavan muodon. Kummassakin editorissa piirretyt muodot voidaan täyttää.',
        'Kun Heksataso on Automaattinen, heksat piirretään etualan tasolle merkkien yläpuolelle, joten pelaajat eivät näe, mitä alla on. Jos etualan taso ei ole käytettävissä, käytetään merkkitasoa.',
        'Jumpgate piirtää matemaattisesti säännöllisiä heksoja, jotka ovat hieman eri muotoisia kuin Legacy-heksat. Jos heksat eivät osu sivun ruudukkoon, kiinnitä merkki heksan keskipisteeseen, valitse se ja napsauta Kalibroi. Korjaa myös heksan koko valitsemalla kaksi merkkiä saman rivin (Hex V) tai sarakkeen (Hex H) vierekkäisistä heksoista.',
        'Kun sivu tai peli kopioidaan, sen heksat saavat uudet tunnisteet. Suorita sivulla Skannaa uudelleen, jotta ne löytyvät taas nimilappuineen ja sijaintimerkkeineen.',
      ],
    },
    upgrading: {
      heading: 'Päivitys versiosta 1',
      points: [
        'Versio 2 ei enää tarvitse PathMath-, MatrixMath-, Vector Math- tai HTML Builder -sovellusta. Voit poistaa ne, ellei toinen mod käytä niitä.',
        'Nykyiset heksakartat, nimet, sijaintimerkit ja asetukset päivitetään automaattisesti ensimmäisellä käynnistyksellä.',
        'Version 1 komennot, mukaan lukien Hexploration_menu-makro, toimivat edelleen.',
        'Versiossa 1 mikä tahansa hahmoa edustava merkki paljasti heksoja. Säilytä tämä toiminta asettamalla Paljastavat merkit arvoon Hahmojen merkit.',
      ],
      colV1: 'Version 1 komento',
      colV2: 'Version 2 komento',
    },
    troubleshooting: {
      heading: 'Vianetsintä',
      points: [
        'Mitään ei tapahdu, kun merkki liikkuu: tarkista, että merkki on merkkitasolla ja vastaa Paljastavat merkit -asetusta ja että sivulla on heksoja (!hexploration status).',
        'Heksat ovat siirtyneet ruudukosta: käytä Kalibroi-toimintoa ja tarkista sitten merkillä muutama heksa eri puolilta karttaa.',
        'Heksat lakkasivat paljastumasta sivun tai pelin kopioinnin jälkeen: suorita sivulla Skannaa uudelleen.',
        'Täytä ilmoittaa, ettei alueella ole heksojen keskipisteitä: muodon on sisällettävä vähintään yhden heksan keskipiste.',
        'Jos haluat lisätietoja, tarkista API-konsolin loki ja sisällytä sen viestit, kun pyydät apua.',
      ],
    },
    languages: {
      heading: 'Kielet',
      body: 'Valitse kieli komennolla !hexploration set language. Käytettävissä olevat kielet:',
      colLanguage: 'Kieli',
      colNative: 'Oma nimi',
      colCode: 'Koodi',
    },
    credits: {
      heading: 'Krediitit',
      original: 'Alkuperäisen modin tekijä',
      maintainer: 'Versio 2 ylläpitäjä',
      marketplace: 'Adan taidepaketit Roll20 Marketplacessa',
      support:
        'Jos löydät virheen tai sinulla on idea, kirjoita viesti Roll20 Mod -foorumille tai avaa ongelma GitHubissa ja sisällytä kaikki viestit API-konsolin lokista.',
    },
  },
};

export default TRANSLATION;
