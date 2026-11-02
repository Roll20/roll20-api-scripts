const TRANSLATION = {
  titles: {
    ready: 'Keskittyminen on valmis.',
    menu: 'Keskittymisasetukset',
    help: 'Keskittymiskomennot',
    status: 'Kuka keskittyy',
    advantage: 'Keskittymisen etu Säästää',
    reset: 'Palauta keskittyminen',
    concentration: 'Keskittyminen',
    save: 'Keskittyminen Tallenna',
    check: 'Pitoisuuden tarkistus',
  },
  messages: {
    migrated:
      'Päivitetty versiosta 1.0. Asetuksesi ja etuluettelosi säilytettiin, ja vanhat makrosi toimivat edelleen.',
    reconciled:
      'Kartan perässä: keskitettyjä tokeneja löydetty {added}, vanhat merkinnät poistettu {dropped}.',
    readyHint: 'Kirjoita asetukset {command} tai avaa Command Deck -moniste.',
    settingChanged: '{setting} on nyt {value}.',
    confirmReset:
      'Haluatko palauttaa kaikki asetukset oletusarvoihinsa ja tyhjentää etuluettelon? Keskittymismerkit kartalla pysyvät.',
    reset: 'Asetukset palautetaan oletusarvoihinsa.',
    journal: 'Uudelleen rakennetut monisteet: {help} ja {deck}.',
  },
  notices: {
    started: '{name} keskittyy nyt paikkaan {spell}.',
    startedNoSpell: '{name} keskittyy nyt.',
    switched: '{name} lakkaa keskittymästä kohtaan {old} ja keskittyy nyt kohtaan {spell}.',
    switchedNoSpell: '{name} keskittyy nyt.',
    ended: '{name} ei enää keskity kohtaan {spell}.',
    endedNoSpell: '{name} ei enää keskity.',
    lost: '{name} menettää keskittymiskykynsä kohtaan {spell}.',
    lostNoSpell: '{name} menettää keskittymiskykynsä.',
    kept: '{name} keskittyy edelleen paikkaan {spell}.',
    keptNoSpell: '{name} jatkaa keskittymistä.',
    zeroHp: '{name} putoaa 0 osumapisteeseen ja menettää keskittymiskykynsä {spell}.',
    zeroHpNoSpell: '{name} putoaa 0 osumapisteeseen ja menettää keskittymiskykynsä.',
    checkNeeded:
      '{name} täytyy tehdä perustuslakia säästävä heitto jatkaakseen keskittymistä: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Muokkaus',
    roll: 'Rullaa',
    advantageRoll: '{first} ja {second} (etu)',
    success: 'Menestys',
    failure: 'Epäonnistuminen',
  },
  menu: {
    concentratingCount: 'Keskity nyt: {count}',
    settings: 'Asetukset',
    footer: 'Kirjoita {command} palataksesi tänne. Jokainen painike on myös monisteessa "{deck}".',
  },
  status: {
    none: 'Kukaan ei keskity.',
  },
  advantage: {
    intro:
      'Päälle asetettujen hahmojen keskittyminen pelastaa hyödyllisesti, kuten War Caster -pelissä. Tämä koskee automaattista tallennusta.',
    none: 'Tässä pelissä ei ole hahmoja.',
  },
  buttons: {
    roll: 'Rullaa',
    advantage: 'Etu',
    status: 'Status',
    advantageMenu: 'Edut-valikko',
    help: 'Auttaa',
    reset: 'Nollaa',
    confirmReset: 'Palauta asetukset',
    end: 'Loppu',
    menu: 'Valikko',
    concentrate: 'Keskity…',
    toggle: 'Vaihda',
    journal: 'Rakenna monisteet uudelleen',
  },
  prompts: {
    spell: 'Spell',
  },
  values: {
    on: 'Päällä',
    off: 'Pois',
    bar: 'Palkki {bar}',
    unnamed: 'Nimetön',
    sendTo: {
      everyone: 'Kaikki',
      character: 'Merkki',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Perus',
      detailed: 'Yksityiskohtainen',
    },
  },
  settings: {
    language: {
      label: 'Kieli',
      desc: 'Chat-viestien ja monisteen kieli.',
    },
    command: {
      label: 'Komento',
      desc: 'Chat-komento ilman "!". Version 1.0 makrot käyttävät keskittymistä.',
    },
    statusmarker: {
      label: 'Tilan merkki',
      desc: 'Merkkimerkki, joka osoittaa keskittymistä. Mukautettuja merkkimerkkejä voidaan käyttää.',
    },
    bar: {
      label: 'HP baari',
      desc: 'Tunnuspalkki, joka sisältää osumapisteitä. Sen vaurioituminen vaatii keskittymistä.',
    },
    send_reminder_to: {
      label: 'Lähetä muistutus osoitteeseen',
      desc: 'Kuka näkee keskittymisviestit ja säästää: kaikki, GM tai hahmon pelaajat (GM saa kopion).',
    },
    auto_add_concentration_marker: {
      label: 'Auto Add Con. Merkki',
      desc: 'Lisää merkki, kun keskitysloitsu heitetään arkilta.',
      hint: 'D&D 5e 2014 (OGL) ja 2024 arkit.',
    },
    auto_roll_save: {
      label: 'Automaattinen rullan tallennus',
      desc: 'Pyöritä säästöä heti, kun keskittymismerkki vahingoittuu. Kun muistutus on pois päältä, siinä on Roll- ja Advantage-painikkeet.',
    },
    show_roll_button: {
      label: 'Roll-painike',
      desc: 'Lisää rulla- ja etupainikkeet muistutukseen, kun automaattinen rullatallennus on pois päältä.',
    },
    end_at_zero: {
      label: 'Loppuun 0 HP',
      desc: 'Lopeta keskittyminen ilman pelastusta, kun merkki putoaa 0 osumapisteeseen.',
    },
    bonus_attribute: {
      label: 'Bonusominaisuus',
      desc: 'Keskittymiseen lisätty arkkiattribuutti säästää. constitution_save_mod toimii D&D 5e 2014 ja 2024 arkeilla.',
    },
    debug: {
      label: 'Virheenkorjaustila',
      desc: 'Kirjoita muistiinpanoja oikeinkirjoituksen havaitsemisesta ja tallennuksista API-konsoliin tukipyyntöjä varten.',
    },
    support_mode: {
      label: 'Tukitila',
      desc: 'Kuinka paljon Debug Mode kirjoittaa: Perus (lyhyt) tai Yksityiskohtainen.',
    },
  },
  help: {
    menu: 'Kun mitään ei ole valittu (GM): avaa asetukset. Kun merkit on valittu: aloita tai lopeta keskittyminen.',
    toggle:
      'Aloita keskittyminen loitsuun valituilla rahakkeilla. Nimeä toinen loitsu vaihtaaksesi; suorita se uudelleen loppuun.',
    end: 'Valittujen tokenien loppupitoisuus.',
    status: 'Listaa, kuka keskittyy, lopetuspainikkeilla.',
    config: 'Muuta asetusta, esimerkiksi config auto_roll_save|false.',
    advantageMenu: 'Valitse, mitkä hahmot rullaa keskittyminen säästää.',
    toggleAdvantage: 'Ota etu käyttöön tai poista se käytöstä yhdelle hahmolle.',
    roll: 'Rullaa tallenne muistutuksen Roll- tai Advantage-painikkeesta.',
    journal: 'Rakenna Ohje- ja komentokansion monisteet uudelleen.',
    reset: 'Palauta kaikki asetukset oletusarvoihinsa.',
    help: 'Näytä tämä luettelo.',
    footer: 'Täydelliset ohjeet ovat monisteessa "{help}". painikkeet ovat monisteessa "{deck}".',
    playerFooter: 'Valitse ensin tunnus.',
  },
  errors: {
    noSelection: 'Valitse ensin tunnus.',
    notYours: 'Voit muuttaa keskittymistä vain hallitsemillesi tokeneille.',
    gmOnly: 'Vain GM voi käyttää tätä komentoa.',
    notConcentrating: 'Se merkki ei keskitä.',
    unknownSetting: 'Ei ole asetusta nimeltä "{key}".',
    badSettingValue: '"{value}" ei ole kelvollinen arvo kohteelle {key}.',
    rollExpired: 'Painike on vanhentunut.',
    unknownCharacter: 'Sitä hahmoa ei ole enää olemassa.',
    internal: 'Jotain meni pieleen. API-konsolissa on tiedot.',
  },
  hints: {
    noSelection: 'Valitse pyörän tunnus ja suorita komento uudelleen.',
    rollExpired:
      'Painikkeet toimivat kerran ja 10 minuuttia. Vahvista merkki uudelleen uutta varten.',
    unknownSetting: 'Näet asetukset kirjoittamalla komento ilman mitään valittuna.',
  },
  warnings: {
    unknownMarker:
      'Tilamerkki "{marker}" ei ole yksi tämän pelin merkeistä. Valitse asetuksista toinen.',
  },
  deck: {
    subtitle: 'Command Deck',
    selected: 'Valitut tokenit',
    selectedDesc: 'Valitse ensin pyörän tunnus.',
    table: 'Taulukko',
    tableDesc: 'Katso kuka keskittyy ja kenellä on etua säästöissään.',
    tools: 'Työkalut',
    toolsDesc: 'Asetukset, komentoluettelo ja monisteet.',
    footer: 'Täydelliset ohjeet ovat monisteessa "{help}".',
  },
  handout: {
    versionLabel: 'Versio',
    subtitle: 'Keskittymismerkit, muistutukset ja säästöt D&D 5e:lle',
    overview: {
      heading: 'Yleiskatsaus',
      body: 'Keskittyminen pitää kirjaa siitä, kuka keskittyy mihinkin loitsuun. Se asettaa merkin heittäjän merkkiin, heittää (tai pyytää) perustuslain, paitsi jos se vahingoittaa, ja kertoo pöydälle, kun keskittyminen päättyy.',
    },
    quickStart: {
      heading: 'Pika aloitus',
      steps: [
        'Valitse pyörän tunnus ja kirjoita !concentration ja sen jälkeen loitsu, esimerkiksi !concentration Bless.',
        'Muuta tunnuksen osumapisteitä sen palkkikuplassa. Säästö heitetään DC 10:llä tai puolella vahingosta, jos se on suurempi.',
        'Suorita sama komento uudelleen tai poista merkintä lopettaaksesi keskittymisen.',
        'Avaa asetukset kirjoittamalla !concentration ilman mitään valittuna.',
      ],
    },
    concentrating: {
      heading: 'Keskittyminen',
      points: [
        'Toisen loitsun nimeäminen siirtää keskittymisen siihen, kuten uuden keskittymisloitsun heittäminen.',
        'Merkin laittaminen tokeniin käsin aloittaa keskittymisen ilman loitsua; sen poistaminen tai tunnuksen poistaminen lopettaa sen.',
        'Keskittyvän hahmon uusi linkitetty merkki saa merkin, ja liimattua merkkiä, joka kuljettaa merkkiä, seurataan.',
        'Yhden hahmon merkit, joihin on linkitetty osumapistepalkki, jakavat keskittymisen. Linkittämättömät rahakkeet, kuten yhdeltä arkilta sijoittuva peikkopaketti, keskittyvät omikseen.',
        'Kaikki näkevät viestin, kun keskittyminen alkaa, vaihtuu tai loppuu, ellei Lähetä muistutus toisin sano.',
      ],
    },
    saves: {
      heading: 'Keskittyminen säästää',
      points: [
        'DC on 10 tai puolet aiheutuneesta vahingosta, sen mukaan kumpi on suurempi, DC 30 asti.',
        'Muokkaus tulee hahmon arkin bonusmääritteestä; puuttuva arvo lasketaan 0:ksi.',
        'Auto Roll Save rolls at once. Kun se on pois päältä, muistutuksessa on Roll- ja Advantage-painikkeet soittimelle tai GM:lle.',
        'Epäonnistunut torjunta lopettaa keskittymisen. Kun End at 0 HP on päällä, osumapisteen pudottaminen 0:aan lopettaa sen ilman tallentamista.',
        'Advantage Menu tarjoaa hahmoetua automaattisissa tallennuksissa, kuten War Caster feat tekee.',
      ],
    },
    automatic: {
      heading: 'Loitsuja levyltä',
      points: [
        'Auto Add Con. Merkki päälle, keskittymisloitsu D&D 5e 2014 (OGL) tai 2024 arkista lisää merkin.',
        'Pyörien tunnukset sivulla, jota he katselevat, on merkitty; jos niitä ei ole, millä tahansa sivulla olevat merkit ovat.',
        'Vain GM:n, toisen modin tai jonkun hahmon pelaajien kortit lasketaan. Saman loitsun toistaminen ei muuta mitään.',
        'D&D 2024 -kortti, joka mainitsee vain keskittymisen tekstissään, kuten War Caster feat, voi aloittaa keskittymisen, mutta ei koskaan korvaa loitsua.',
        'D&D 2024 -arkit saattavat tarvita Experimental API -palvelimen. Ota virheenkorjaustila käyttöön nähdäksesi, miksi oikeinkirjoitus havaittiin tai ei.',
      ],
    },
    players: {
      heading: 'Pelaajat',
      points: [
        'Pelaajat voivat aloittaa ja lopettaa keskittymisen hallitsemiinsa tokeneihin ja käyttää Roll- ja Advantage-painikkeita omissa tallennuksissaan.',
        'Kun lähetä muistutus Jos haluat asettaa hahmon, viestit kuiskataan hahmon pelaajille ja GM:lle.',
      ],
    },
    commands: {
      heading: 'komennot',
      intro: 'Muut modit, kuten ScriptCards, voivat myös lähettää näitä komentoja.',
      colCommand: 'Komento',
      colDesc: 'Mitä se tekee',
    },
    settings: {
      heading: 'Asetukset',
      intro:
        'Muuta asetuksia asetuskortin painikkeilla tai konfiguraatiolla <key>|<arvo>. Jotkut voidaan asettaa myös Modin sivulla.',
      colKey: 'Avain',
      colName: 'Nimi',
      colDesc: 'Mitä se tekee',
    },
    upgrading: {
      heading: 'Päivitys versiosta 1.0',
      points: [
        'Asetukset, etuluettelo ja kaikki komennot toimivat edelleen.',
        'Viestit kertovat nyt, milloin keskittyminen loppuu ja mihin loitsuun.',
        'Tokenit, joissa on jo merkki, noudetaan käynnistyksen yhteydessä.',
      ],
    },
    troubleshooting: {
      heading: 'Vianetsintä',
      points: [
        'Ei tallennusta, kun osumapisteet putoavat: tarkista, että tunnuksessa on merkintä ja että HP Bar on se palkki, jonka muutit. Muiden modien API:n kautta tekemät muutokset eivät aiheuta tapahtumia, joten niitä ei näytetä.',
        'Muutos on 0: tarkista bonusominaisuus hahmon arkkia vastaan.',
        'Arkista lähetettyjä loitsuja ei havaita: ota virheenkorjaustila käyttöön, loitsu uudelleen ja lue API-konsoli.',
        'Kahdella hahmolla on yhteinen nimi: tunnistus käyttää ensimmäistä vastaavuutta. Anna hahmoille yksilölliset nimet.',
      ],
    },
    languages: {
      heading: 'Kielet',
      body: 'Keskittyminen on käännetty alla oleville kielille. Valitse yksi Kieli-asetuksista.',
      colCode: 'Koodi',
      colName: 'Kieli',
      colNative: 'Alkuperäinen nimi',
    },
    credits: {
      heading: 'Krediitit',
      original: 'Alkuperäinen mod',
      maintainer: 'Ylläpitäjä',
      support: 'Ilmoita virheistä ja ideoista Roll20 Mod -foorumilla tai GitHubissa.',
    },
    footer: 'Jokaisen toiminnon painikkeet ovat monisteessa "{deck}".',
  },
};

export default TRANSLATION;
