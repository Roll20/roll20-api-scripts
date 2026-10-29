const TRANSLATION = {
  titles: {
    ready: 'Hexploration è pronto.',
    settings: 'Impostazioni di Hexploration',
    languages: 'Scegli una lingua',
    pageSettings: 'Impostazioni pagina: {page}',
    status: 'Stato di Hexploration: {page}',
    help: 'Comandi di Hexploration',
    confirm: 'Conferma',
  },
  discovery: {
    title: 'Posizione scoperta',
  },
  menu: {
    draw: 'Disegna',
    reveal: 'Rivela e nascondi',
    locations: 'Posizioni',
    tools: 'Strumenti',
    layerInUse: 'I nuovi esagoni vengono disegnati sul {layer}.',
    pageSettingsHelp:
      'Queste impostazioni si applicano solo a questa pagina. Le impostazioni contrassegnate con ★ sovrascrivono le impostazioni globali.',
  },
  buttons: {
    fill: 'Riempi',
    fillInverse: 'Riempimento inverso',
    undo: 'Annulla riempimento',
    reveal: 'Rivela',
    conceal: 'Nascondi',
    explore: 'Esplora',
    revealPage: 'Rivela pagina',
    resetPage: 'Reimposta pagina',
    mark: 'Segna posizione',
    unmark: 'Rimuovi segno',
    name: 'Nomina esagono',
    settings: 'Impostazioni',
    pageSettings: 'Impostazioni pagina',
    status: 'Stato',
    rescan: 'Nuova scansione',
    calibrate: 'Calibra',
    calibrateReset: 'Ripristina calibrazione',
    help: 'Aiuto',
    change: 'Modifica',
    menu: 'Menu',
    clearOverrides: 'Cancella sostituzioni',
    confirmReset: 'Sì, rimuovi tutti gli esagoni',
  },
  prompts: {
    name: 'Nome della posizione (lascia vuoto per cancellare)',
  },
  values: {
    on: 'Attivo',
    off: 'Disattivo',
    none: 'Nessuno',
    hexLayer: {
      auto: 'Automatico (in primo piano se disponibile)',
      foreground: 'livello in primo piano',
      objects: 'livello dei segnalini',
    },
    revealBy: {
      players: 'Segnalini dei giocatori',
      characters: 'Segnalini dei personaggi',
      all: 'Tutti i segnalini',
    },
    revealMode: {
      clear: 'Elimina',
      glimpse: 'Intravedi',
    },
    announce: {
      all: 'Tutti',
      gm: 'Solo il GM',
      off: 'Disattivo',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Riempi',
      fillInverse: 'Riempimento inverso',
      conceal: 'Nascondi',
    },
  },
  settings: {
    language: {
      label: 'Lingua',
      desc: 'Lingua per menu, messaggi e dispense.',
    },
    hexLayer: {
      label: 'Livello degli esagoni',
      desc: 'Dove vengono disegnati i nuovi esagoni. Automatico prova il livello in primo piano (sopra i segnalini) e ripiega sul livello dei segnalini se il gioco non lo supporta.',
    },
    fillColor: {
      label: 'Colore riempimento',
      desc: 'Colore dei nuovi esagoni. Usa rgba() per esagoni trasparenti, ad esempio rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Colore del bordo',
      desc: 'Colore del contorno dei nuovi esagoni.',
    },
    labelColor: {
      label: "Colore dell'etichetta",
      desc: 'Colore delle etichette con i nomi riservati ai GM sugli esagoni con nome.',
    },
    glimpseColor: {
      label: 'Colore degli esagoni intravisti',
      desc: 'Colore che assumono gli esagoni intravisti (modalità di rivelazione Intravedi). Usa un colore rgba() trasparente.',
    },
    strokeWidth: {
      label: 'Larghezza del bordo',
      desc: 'Larghezza del contorno dei nuovi esagoni, in pixel (da 0 a 20).',
    },
    maxDistance: {
      label: 'Distanza di rivelazione degli esagoni',
      desc: 'Applicato agli esagoni mentre vengono disegnati: un segnalino deve trovarsi entro questo numero di esagoni per rivelarli, per quanto lontano possa vedere. Lascia vuoto per nessun limite.',
    },
    revealDistance: {
      label: 'Distanza di vista',
      desc: 'Quanti esagoni vengono rivelati attorno a un segnalino in movimento (da 0 a 20). 0 rivela solo gli esagoni attraversati dal segnalino.',
    },
    lineOfSight: {
      label: 'Linea di vista',
      desc: 'Quando è attivo, un esagono viene rivelato solo se non si trova alcun esagono coperto tra esso e il segnalino.',
    },
    revealPath: {
      label: 'Rivela lungo il percorso',
      desc: 'Quando è attivo, viene rivelato ogni esagono attraversato da un token mentre viene trascinato (inclusi i punti di passaggio), non solo dove si ferma.',
    },
    revealBy: {
      label: 'Segnalini che rivelano',
      desc: 'Quali gettoni sul livello dei gettoni rivelano esagoni: gettoni controllati da un giocatore, gettoni che rappresentano qualsiasi personaggio o ogni gettone.',
    },
    revealMode: {
      label: 'Modalità di rivelazione',
      desc: 'Elimina rimuove gli esagoni in vista. Intravedi invece li rende trasparenti; vengono rimossi quando un segnalino vi entra.',
    },
    announce: {
      label: 'Annuncia le scoperte',
      desc: 'Chi vede il messaggio di chat quando viene scoperta una posizione denominata.',
    },
    pingDiscoveries: {
      label: 'Ping sulle scoperte',
      desc: 'Quando è attivo, i giocatori vengono collegati a una posizione denominata quando viene scoperta.',
    },
    hideCoveredTokens: {
      label: 'Nascondi i segnalini coperti',
      desc: 'Roll20 disegna nomi, barre e aure sopra gli esagoni. Quando sono attivi, i gettoni sotto un esagono coperto hanno il nome, le barre e le aure visibili al giocatore disattivati ​​e riattivati ​​quando vengono scoperti.',
    },
  },
  status: {
    engine: 'Motore di gioco',
    grid: 'Griglia',
    layer: 'Livello degli esagoni',
    hexes: 'Esagoni',
    named: 'Esagoni con nome',
    icons: 'Segnalini di posizione',
    glimpsed: 'Esagoni intravisti',
    pending: 'Posizioni in attesa di riempimento',
    calibrated: 'Calibrato',
    overrides: 'Sostituzioni di pagina',
    undo: 'Annullamento disponibile',
  },
  messages: {
    filled:
      'Riempimento completato. Esagoni tracciati: {created}. Restyling: {restyled}. Posizioni nascoste: {icons}.',
    revealed: 'Esagoni rivelati: {count}.',
    revealedPage: 'Tutti gli esagoni della pagina sono stati rivelati ({count}).',
    confirmReset:
      'Rimuovere ogni esagono da "{page}" ({count})? I token di posizione ritornano al livello dei token. L\'annullamento non può annullare questa operazione.',
    resetPage: 'Esagoni rimossi dalla pagina: {count}.',
    undone:
      'Ultimo riempimento annullato. Esagoni rimossi: {removed}. Esagoni rinnovati ripristinati: {restored}.',
    named: 'Esagoni denominati "{name}": {count}.',
    unnamed: 'Nomi cancellati: {count}.',
    marked:
      'Posizioni nascoste negli esagoni esistenti: {attached}. In attesa del prossimo riempimento che li ricopra: {pending}.',
    unmarked: 'Token che non rappresentano più posizioni: {count}.',
    settingChanged: '{setting} impostato su {value}.',
    rescanned:
      'Nuova scansione completata. Conservato: {kept}. Adottato: {adopted}. Archiviato nuovamente: {moved}. Mancante e dimenticato: {dropped}. Etichette ricollegate: {labels}. Token di posizione ricollegati: {icons}.',
    calibrated:
      'Griglia calibrata (passo colonna {colStep}px, passo riga {rowStep}px). Nuova scansione: mantenuto {kept}, archiviato nuovamente {moved}, adottato {adopted}.',
    calibrationReset:
      'Calibrazione rimossa. Nuova scansione: mantenuto {kept}, archiviato nuovamente {moved}, adottato {adopted}.',
    journalRebuilt: 'Le dispense "{help}" e "{deck}" sono state ricostruite.',
    migrated:
      'Le tue mappe a esagoni di Hexploration 1.x sono state aggiornate. Se questo gioco è stato copiato da un gioco Legacy, esegui Nuova scansione su ogni pagina con una mappa a esagoni.',
    pruned:
      'Esagoni salvati che non esistono più e sono stati dimenticati: {dropped}. Se questo gioco o questa pagina sono stati copiati, esegui Nuova scansione sulla pagina per riprenderne gli esagoni.',
    readyHint:
      'Digita !hexploration per il menu, oppure apri la dispensa "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Questo gioco non supporta il disegno sul livello in primo piano, quindi gli esagoni sono stati disegnati sul livello dei token.',
    someFailed:
      'Esagoni che non è stato possibile disegnare: {count}. Controlla la console API per i dettagli.',
  },
  errors: {
    noPage: 'Impossibile trovare la pagina su cui lavorare.',
    notHex: 'Questa pagina non usa una griglia esagonale.',
    noPolygons: 'Seleziona una o più forme disegnate da riempire.',
    emptyArea: "L'area selezionata non contiene alcun centro di esagono.",
    tooMany: 'Ciò creerebbe troppi esagoni in una volta sola ({count}).',
    nothingToConceal: 'Seleziona forme disegnate o gettoni da nascondere.',
    nothingToReveal: 'Seleziona esagoni, forme disegnate o gettoni da rivelare.',
    noTokens: 'Seleziona prima uno o più token.',
    noHexes: 'Seleziona prima uno o più esagoni (o gettoni che si trovano sugli esagoni).',
    nothingToUndo: "Non c'è nessun riempimento da annullare.",
    unknownCommand: 'Comando sconosciuto: {command}',
    unknownSetting: 'Impostazione sconosciuta: {key}',
    unknownPageSetting: 'Impostazioni che possono essere impostate per pagina: {keys}',
    invalidValue: '"{value}" non è un valore valido per {key}.',
    calibrateNeedsTokens: 'Seleziona uno o due token agganciati ai centri esagonali.',
    calibrateFailed: 'Questi token non possono essere utilizzati per calibrare.',
    unexpected: 'Qualcosa è andato storto: {message}',
  },
  hints: {
    noPage: 'Apri la pagina su cui vuoi lavorare o seleziona qualcosa al suo interno.',
    notHex: 'Imposta la griglia della pagina su Hex (V) o Hex (H) nelle Impostazioni pagina.',
    noPolygons:
      "Disegna un poligono, un rettangolo, un'ellisse o una forma a mano libera attorno all'area, selezionala e riprova.",
    emptyArea:
      'Disegna una forma più grande o controlla le impostazioni della griglia della pagina.',
    tooMany: "Riempi un'area più piccola o dividi l'area in più forme.",
    noHexes:
      'Gli esagoni si trovano in primo piano o sul livello token; passare a quel livello per selezionarli.',
    unknownCommand: 'Digita !hexploration help per elencare i comandi.',
    unknownSetting: 'Digita !hexploration set per vedere tutte le impostazioni.',
    calibrateNeedsTokens:
      'Aggancia un segnalino al centro di un esagono e selezionalo. Seleziona un secondo segnalino agganciato a un esagono adiacente nella stessa riga (Hex V) o colonna (Hex H) per correggere anche la dimensione degli esagoni.',
    calibrateFailed:
      'Due gettoni devono trovarsi nella stessa riga (Hex V) o nella stessa colonna (Hex H), ad almeno un esagono di distanza.',
    unexpected: 'I dettagli si trovano nel registro della console API.',
  },
  help: {
    menu: 'Mostra il menù.',
    fill: 'Copri le forme disegnate selezionate con esagoni.',
    fillInverse: "Copri l'intera pagina tranne l'interno delle forme selezionate.",
    undo: "Annulla l'ultimo riempimento, inverti il ​​riempimento o nascondi e ripristina le forme utilizzate.",
    reveal: 'Rivela gli esagoni selezionati e gli esagoni sotto le forme e i gettoni selezionati.',
    revealPage: 'Rivela ogni esagono sulla pagina senza annunci.',
    conceal: "Copri nuovamente l'area sotto le forme e i gettoni selezionati con esagoni.",
    explore: 'Rivela i gettoni selezionati come se si fossero appena spostati lì.',
    resetPage: 'Rimuovi ogni esagono dalla pagina (chiede prima).',
    name: 'Assegna un nome agli esagoni selezionati o agli esagoni sotto i gettoni selezionati. Lascia il nome vuoto per cancellarlo.',
    mark: 'Trasforma i gettoni selezionati in luoghi nascosti.',
    unmark: 'Impedisci che i token selezionati siano posizioni nascoste.',
    set: "Modifica un'impostazione o mostra tutte le impostazioni.",
    pageSet: "Sostituisci un'impostazione di visualizzazione solo nella pagina corrente.",
    pageClear: 'Rimuovi le sostituzioni della pagina corrente.',
    rescan:
      "Ricostruisci l'elenco degli esagoni della pagina, ad esempio dopo aver copiato una pagina o un gioco.",
    calibrate:
      'Allinea la griglia esagonale con uno o due gettoni selezionati agganciati ai centri esagonali.',
    calibrateReset: 'Rimuovi la calibrazione della pagina corrente.',
    status: 'Mostra cosa sa Hexploration sulla pagina corrente.',
    journal: 'Ricostruisci le dispense Help e Command Deck.',
    help: 'Mostra questo elenco.',
    handout: 'Le istruzioni complete si trovano nel volantino "{name}".',
  },
  deck: {
    drawDesc:
      "Disegna forme attorno a un'area, selezionale, quindi riempi. Annulla riempimento annulla l'ultimo riempimento.",
    revealDesc:
      'Seleziona esagoni, forme o segnalini per rivelarli o coprirli di nuovo. Esplora rivela attorno ai segnalini selezionati come se si fossero appena spostati.',
    locationsDesc:
      'Seleziona i token per nasconderli come posizioni sotto esagoni. Seleziona esagoni o gettoni per nominare un esagono.',
    toolsDesc:
      'Impostazioni, sostituzioni di pagina, stato, nuova scansione delle pagine copiate e calibrazione della griglia.',
    footer: 'Consulta il volantino "{help}" per le istruzioni complete.',
  },
  handout: {
    versionLabel: 'Versione',
    subtitle: 'Esplorazione esagono per esagono per Roll20',
    footer: 'Utilizza il volantino "{deck}" per i controlli con un clic.',
    overview: {
      heading: 'Panoramica',
      body: "L'esplorazione copre una mappa esagonale con esagoni opachi. Mentre il gruppo si muove, gli esagoni che attraversa (e, se preferisci, gli esagoni attorno a lui) vengono rimossi, quindi la mappa viene scoperta un esagono alla volta. I luoghi nascosti possono essere posizionati sotto esagoni e vengono annunciati quando vengono trovati. Funziona nei giochi Jumpgate e Legacy, su griglie Hex (V) e Hex (H) di qualsiasi dimensione.",
      demo: 'Guarda una breve demo (dalla versione 1)',
    },
    quickStart: {
      heading: 'Avvio rapido',
      steps: [
        'Apri una pagina la cui griglia è impostata su Hex (V) o Hex (H).',
        "Disegna una o più forme (poligono, rettangolo, ellisse o a mano libera) attorno all'area da nascondere.",
        'Seleziona le forme e fai clic su Riempi nel Command Deck (oppure digita !hexploration fill). Le forme vengono sostituite da esagoni.',
        'Facoltativo: prima di riempire, seleziona i segnalini dei luoghi importanti e fai clic su Segna posizione. Vengono nascosti sotto gli esagoni e annunciati quando vengono scoperti.',
        'Muovi un segnalino giocatore. Ogni esagono che attraversa, e gli esagoni entro la sua Distanza di vista, vengono rivelati.',
      ],
    },
    commands: {
      heading: 'Comandi',
      intro:
        'Solo i GM possono utilizzare questi comandi. La maggior parte agisce sugli oggetti selezionati; il resto agisci sulla pagina che stai visualizzando.',
      colCommand: 'Comando',
      colDesc: 'Cosa fa',
    },
    revealing: {
      heading: 'Come funziona la rivelazione',
      points: [
        'Solo i segnalini sul livello dei segnalini rivelano gli esagoni. Quali segnalini contano lo stabilisce Segnalini che rivelano: per impostazione predefinita i segnalini dei giocatori, così il GM può spostare i mostri senza scoprire la mappa.',
        'Un segnalino rivela ogni esagono che copre (i segnalini grandi ne coprono diversi) e, con Rivela lungo il percorso attivo, ogni esagono del percorso lungo il quale è stato trascinato, compresi i waypoint.',
        "La Distanza di vista rivela gli esagoni attorno a ciascuno di quegli esagoni. Con Linea di vista attiva, un esagono viene rivelato solo se in mezzo non c'è alcun esagono coperto.",
        "La Distanza di rivelazione degli esagoni viene memorizzata sugli esagoni nel momento in cui vengono disegnati. Quegli esagoni vengono rivelati solo da non più di quel numero di esagoni di distanza, per quanto lontano possa vedere un segnalino. Usala per montagne o foreste che nascondono ciò che c'è dietro.",
        'Nella modalità Intravedi, gli esagoni in vista diventano trasparenti invece di scomparire e vengono rimossi quando un segnalino vi entra.',
        'Roll20 disegna nomi, barre e aure dei segnalini sopra gli esagoni. Con Nascondi i segnalini coperti attivo, un segnalino sotto un esagono coperto ha nome, barre e aure visibili ai giocatori disattivati finché non viene scoperto, così i mostri nascosti non si tradiscono. Se ne attivi uno mentre il segnalino è coperto, resta nascosto e viene attivato quando il segnalino viene scoperto.',
        "L'API non segnala gli spostamenti effettuati da altre mod. Gli spostamenti di TokenMod vengono rilevati automaticamente; per altre mod, seleziona i segnalini e fai clic su Esplora, oppure chiama Hexploration.revealAround(token) dalla tua mod.",
      ],
    },
    locations: {
      heading: 'Esagoni e posizioni con nome',
      points: [
        'Segna posizione trasforma i segnalini selezionati in posizioni nascoste. Un segnalino già sotto un esagono viene nascosto subito; altrimenti viene nascosto dal riempimento successivo che lo copre.',
        "Anche i gettoni con l'indicatore di stato della torre bianca vengono trattati come posizioni quando li riempi, come nella versione 1.",
        'I segnalini posizione nascosta vengono spostati nel livello GM. Quando il loro esagono viene rivelato, ritornano al livello dei gettoni con il loro nome mostrato e la loro scoperta viene annunciata.',
        "Nomina esagono dà un nome a un esagono senza usare un segnalino. Il nome viene mostrato al GM come etichetta sul livello GM e annunciato quando l'esagono viene rivelato.",
        "Annuncia le scoperte sceglie se l'annuncio lo vedono tutti, solo il GM o nessuno. Ping sulle scoperte sposta anche la visuale dei giocatori sulla posizione.",
      ],
    },
    settings: {
      heading: 'Impostazioni',
      intro:
        'Modifica le impostazioni con !hexploration set (o con il pulsante Impostazioni). Livello degli esagoni, Segnalini che rivelano e Lingua si possono impostare anche nella pagina delle impostazioni della mod.',
      colKey: 'Chiave',
      colName: 'Collocamento',
      colDesc: 'Descrizione',
      perPage: '(Può essere impostato per pagina.)',
    },
    jumpgate: {
      heading: 'Jumpgate e Legacy',
      points: [
        "L'esplorazione determina quale motore utilizza il gioco e disegna il tipo di forma corrispondente. È possibile riempire le forme disegnate in entrambi gli editor.",
        "Con Livello degli esagoni impostato su Automatico, gli esagoni vengono disegnati sul livello in primo piano, sopra i segnalini, così i giocatori non possono vedere cosa c'è sotto. Se il livello in primo piano non è disponibile, viene usato invece il livello dei segnalini.",
        'Jumpgate disegna esagoni matematicamente regolari, che hanno una forma leggermente diversa dagli esagoni Legacy. Se gli esagoni non sono allineati alla griglia di una pagina, aggancia un segnalino al centro di un esagono, selezionalo e fai clic su Calibra. Seleziona due segnalini in esagoni adiacenti della stessa riga (Hex V) o colonna (Hex H) per correggere anche la dimensione degli esagoni.',
        'Quando una pagina o un gioco viene copiato, i suoi esagoni ottengono nuovi ID. Esegui Nuova scansione sulla pagina per riprenderli, insieme alle etichette dei nomi e ai segnalini di posizione.',
      ],
    },
    upgrading: {
      heading: 'Aggiornamento dalla versione 1',
      points: [
        'La versione 2 non necessita più di PathMath, MatrixMath, Vector Math o HTML Builder. Puoi rimuoverli a meno che un altro mod non li utilizzi.',
        'Le mappe a esagoni, i nomi, i segnalini di posizione e le impostazioni esistenti vengono aggiornati automaticamente al primo avvio.',
        'I comandi della versione 1, inclusa la macro Hexploration_menu, funzionano ancora.',
        'La versione 1 permetteva a qualsiasi segnalino che rappresentasse un personaggio di rivelare esagoni. Imposta Segnalini che rivelano su Segnalini dei personaggi per mantenere quel comportamento.',
      ],
      colV1: 'Comando della versione 1',
      colV2: 'Comando della versione 2',
    },
    troubleshooting: {
      heading: 'Risoluzione dei problemi',
      points: [
        'Non succede nulla quando un segnalino si muove: controlla che il segnalino sia sul livello dei segnalini e corrisponda a Segnalini che rivelano, e che la pagina abbia esagoni (!hexploration status).',
        'Gli esagoni sono sfalsati rispetto alla griglia: usa Calibra, poi controlla con un segnalino su alcuni esagoni in vari punti della mappa.',
        'Gli esagoni non vengono più rivelati dopo aver copiato una pagina o un gioco: esegui Nuova scansione sulla pagina.',
        "Riempi indica che l'area non contiene centri di esagono: la forma deve contenere il centro di almeno un esagono.",
        'Per qualsiasi altra cosa, controlla il registro della console API e includi i suoi messaggi quando chiedi aiuto.',
      ],
    },
    languages: {
      heading: 'Lingue',
      body: "Scegli una lingua con la lingua impostata per l'esplorazione. Lingue disponibili:",
      colLanguage: 'Lingua',
      colNative: 'Nome originale',
      colCode: 'Codice',
    },
    credits: {
      heading: 'Crediti',
      original: 'Mod originale di',
      maintainer: 'Versione 2 mantenuta da',
      marketplace: 'I pacchetti artistici di Ada sul Marketplace Roll20',
      support:
        "Se trovi un bug o hai un'idea, pubblica un post nel forum Roll20 Mod o apri un problema su GitHub e includi eventuali messaggi dal registro della console API.",
    },
  },
};

export default TRANSLATION;
