const TRANSLATION = {
  titles: {
    ready: 'La concentrazione è pronta.',
    menu: 'Impostazioni di concentrazione',
    help: 'Comandi di concentrazione',
    status: 'Chi si sta concentrando',
    advantage: 'Vantaggio sui tiri salvezza sulla concentrazione',
    reset: 'Ripristina la concentrazione',
    concentration: 'Concentrazione',
    save: 'Salvataggio della concentrazione',
    check: 'Controllo della concentrazione',
  },
  messages: {
    migrated:
      "Aggiornato dalla versione 1.0. Le tue impostazioni e l'elenco dei vantaggi sono stati mantenuti e le tue vecchie macro funzionano ancora.",
    reconciled:
      'Intrappolato nella mappa: concentrazione dei gettoni trovati {added}, vecchie voci rimosse {dropped}.',
    readyHint: 'Digita {command} per le impostazioni o apri il volantino del mazzo di comandi.',
    settingChanged: '{setting} ora è {value}.',
    confirmReset:
      "Riportare tutte le impostazioni ai valori predefiniti e cancellare l'elenco dei vantaggi? Gli indicatori di concentrazione sulla mappa rimangono.",
    reset: 'Le impostazioni vengono riportate ai valori predefiniti.',
    journal: 'Schede ricostruite: {help} e {deck}.',
  },
  notices: {
    started: '{name} ora si sta concentrando su {spell}.',
    startedNoSpell: '{name} ora si sta concentrando.',
    switched: '{name} smette di concentrarsi su {old} e ora si concentra su {spell}.',
    switchedNoSpell: '{name} ora si sta concentrando.',
    ended: '{name} non si concentra più su {spell}.',
    endedNoSpell: '{name} non si concentra più.',
    lost: '{name} perde la concentrazione su {spell}.',
    lostNoSpell: '{name} perde la concentrazione.',
    kept: '{name} continua a concentrarsi su {spell}.',
    keptNoSpell: '{name} continua a concentrarsi.',
    zeroHp: '{name} scende a 0 punti ferita e perde la concentrazione su {spell}.',
    zeroHpNoSpell: '{name} scende a 0 punti ferita e perde concentrazione.',
    checkNeeded:
      '{name} deve effettuare un tiro salvezza su Costituzione per continuare a concentrarsi: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'CC {dc}',
    modifier: 'Modificatore',
    roll: 'Rotolo',
    advantageRoll: '{first} e {second} (vantaggio)',
    success: 'Successo',
    failure: 'Fallimento',
  },
  menu: {
    concentratingCount: 'Adesso mi concentro: {count}',
    settings: 'Impostazioni',
    footer:
      'Digita {command} per tornare qui. Ogni pulsante si trova anche nel volantino "{deck}".',
  },
  status: {
    none: 'Nessuno si sta concentrando.',
  },
  advantage: {
    intro:
      'I personaggi impostati sul tiro di concentrazione ottengono un vantaggio, come nel caso del talento Incantatore di Guerra. Questo vale per i salvataggi automatici.',
    none: 'Non ci sono personaggi in questo gioco.',
  },
  buttons: {
    roll: 'Rotolo',
    advantage: 'Vantaggio',
    status: 'Stato',
    advantageMenu: 'Menù vantaggi',
    help: 'Aiuto',
    reset: 'Reset',
    confirmReset: 'Ripristina impostazioni',
    end: 'FINE',
    menu: 'Menu',
    concentrate: 'Concentrati su…',
    toggle: 'Attiva/disattiva',
    journal: 'Ricostruisci le dispense',
  },
  prompts: {
    spell: 'Sillabare',
  },
  values: {
    on: 'SU',
    off: 'Spento',
    bar: 'Barra {bar}',
    unnamed: 'Senza nome',
    sendTo: {
      everyone: 'Tutti',
      character: 'Carattere',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Di base',
      detailed: 'Dettagliato',
    },
  },
  settings: {
    language: {
      label: 'Lingua',
      desc: 'La lingua dei messaggi di chat e dei volantini.',
    },
    command: {
      label: 'Comando',
      desc: 'Il comando chat, senza il "!". Le macro della versione 1.0 utilizzano la concentrazione.',
    },
    statusmarker: {
      label: 'Indicatore di stato',
      desc: 'Il segnalino gettone che mostra la concentrazione. È possibile utilizzare marcatori di token personalizzati.',
    },
    bar: {
      label: 'Barra HP',
      desc: 'La barra dei gettoni che contiene i punti ferita. Il danno ad esso richiede un tiro salvezza sulla concentrazione.',
    },
    send_reminder_to: {
      label: 'Invia promemoria a',
      desc: 'Chi vede i messaggi di concentrazione e salva: tutti, il GM, o i giocatori del personaggio (il GM ne riceve una copia).',
    },
    auto_add_concentration_marker: {
      label: 'Aggiunta automatica cont. Marcatore',
      desc: 'Aggiungi il segnalino quando un incantesimo di concentrazione viene lanciato da un foglio.',
      hint: 'Fogli D&D 5e 2014 (OGL) e 2024.',
    },
    auto_roll_save: {
      label: 'Salvataggio automatico',
      desc: 'Effettua il tiro salvezza non appena un segnalino concentrazione subisce danni. Quando è disattivato, il promemoria dispone dei pulsanti Roll e Advantage.',
    },
    show_roll_button: {
      label: 'Pulsante Rotolo',
      desc: 'Aggiungi i pulsanti Roll e Advantage al promemoria quando il salvataggio automatico del roll è disattivato.',
    },
    end_at_zero: {
      label: 'Termina a 0 HP',
      desc: 'Termina la concentrazione senza effettuare un tiro salvezza quando un gettone scende a 0 punti ferita.',
    },
    bonus_attribute: {
      label: 'Attributo bonus',
      desc: "L'attributo del foglio aggiunto alla concentrazione viene salvato. constitution_save_mod funziona sui fogli D&D 5e 2014 e 2024.",
    },
    debug: {
      label: 'Modalità di debug',
      desc: "Scrivi note sul rilevamento dell'ortografia e sui salvataggi nella console API, per richieste di supporto.",
    },
    support_mode: {
      label: 'Modalità di supporto',
      desc: 'Quanto scrive la modalità Debug: Base (breve) o Dettagliata.',
    },
  },
  help: {
    menu: 'Con nulla selezionato (GM): aprire le impostazioni. Con gettoni selezionati: inizio o fine concentrazione.',
    toggle:
      'Inizia a concentrarti su un incantesimo con i gettoni selezionati. Assegna un nome a un incantesimo diverso da cambiare; eseguilo di nuovo per terminare.',
    end: 'Termina la concentrazione per i token selezionati.',
    status: 'Elenca chi si sta concentrando, con i pulsanti Fine.',
    config: "Modificare un'impostazione, ad esempio config auto_roll_save|false.",
    advantageMenu:
      'Scegli quali personaggi tirano il tiro salvezza sulla concentrazione con vantaggio.',
    toggleAdvantage: 'Attiva o disattiva il vantaggio per un personaggio.',
    roll: 'Effettua un salvataggio dal pulsante Tiro o Vantaggio di un promemoria.',
    journal: 'Ricostruisci le dispense del mazzo di aiuto e di comando.',
    reset: 'Riporta ogni impostazione ai valori predefiniti.',
    help: 'Mostra questo elenco.',
    footer:
      'Le istruzioni complete si trovano nel volantino "{help}"; i pulsanti si trovano nel volantino "{deck}".',
    playerFooter: 'Seleziona prima il tuo token.',
  },
  errors: {
    noSelection: 'Seleziona prima un token.',
    notYours: 'Puoi modificare la concentrazione solo per i segnalini che controlli.',
    gmOnly: 'Solo il GM può usare quel comando.',
    notConcentrating: 'Quel token non è concentrato.',
    unknownSetting: 'Non esiste alcuna impostazione chiamata "{key}".',
    badSettingValue: '"{value}" non è un valore valido per {key}.',
    rollExpired: 'Quel pulsante è scaduto.',
    unknownCharacter: 'Quel personaggio non esiste più.',
    internal: 'Qualcosa è andato storto. La console API contiene i dettagli.',
  },
  hints: {
    noSelection: "Seleziona il token dell'incantatore, quindi esegui nuovamente il comando.",
    rollExpired:
      'I pulsanti funzionano una volta e per 10 minuti. Danneggia nuovamente il token per ottenerne uno nuovo.',
    unknownSetting: 'Digita il comando senza selezionare nulla per visualizzare le impostazioni.',
  },
  warnings: {
    unknownMarker:
      'L\'indicatore di stato "{marker}" non è uno degli indicatori di questo gioco. Scegline un altro nelle impostazioni.',
  },
  deck: {
    subtitle: 'Mazzo di comando',
    selected: 'Gettoni selezionati',
    selectedDesc: "Seleziona prima il gettone dell'incantatore.",
    table: 'Il tavolo',
    tableDesc: 'Scopri chi si concentra e chi ha vantaggio nelle parate.',
    tools: 'Utensili',
    toolsDesc: "Impostazioni, l'elenco dei comandi e le dispense.",
    footer: 'Le istruzioni complete si trovano nel volantino "{help}".',
  },
  handout: {
    versionLabel: 'Versione',
    subtitle: 'Indicatori di concentrazione, promemoria e salvataggi per D&D 5e',
    overview: {
      heading: 'Panoramica',
      body: "La concentrazione tiene traccia di chi si sta concentrando su quale incantesimo. Mette un segnalino sul segnalino dell'incantatore, lancia (o richiede) un tiro salvezza sulla Costituzione quando quel segnalino subisce danni e indica alla tabella quando la concentrazione termina.",
    },
    quickStart: {
      heading: 'Avvio rapido',
      steps: [
        "Seleziona il gettone dell'incantatore e digita !concentrazione seguito dall'incantesimo, ad esempio !concentrazione Benedici.",
        'Cambia i punti ferita del gettone nella sua bolla della barra. Si effettua un tiro salvezza con CD 10, o metà del danno se questo è più alto.',
        'Esegui nuovamente lo stesso comando o rimuovi il segnalino per terminare la concentrazione.',
        'Digita !concentrazione senza nulla selezionato per aprire le impostazioni.',
      ],
    },
    concentrating: {
      heading: 'Concentrarsi',
      points: [
        'Dare un nome a un incantesimo diverso trasferisce la concentrazione su di esso, come fa lanciare un nuovo incantesimo di concentrazione.',
        'Mettendo manualmente il segnalino su un gettone si avvia la concentrazione senza incantesimo; toglierlo o eliminare il token lo termina.',
        'Un nuovo segnalino collegato di un personaggio che si concentra riceve il segnalino, e viene tracciato un segnalino incollato che porta il segnalino.',
        'I gettoni di un personaggio con una barra dei punti ferita collegata condividono la concentrazione. I segnalini non collegati, come un branco di goblin da un foglio, si concentrano da soli.',
        'Tutti vedono un messaggio quando la concentrazione inizia, cambia o finisce, a meno che Invia promemoria a non dica diversamente.',
      ],
    },
    saves: {
      heading: 'La concentrazione salva',
      points: [
        'La CD è pari a 10 o alla metà del danno subito, qualunque sia il valore più alto, fino a un massimo di CD 30.',
        'Il modificatore deriva dall’Attributo Bonus sulla scheda del personaggio; un valore mancante conta come 0.',
        'Rotolo automatico Salva i rotoli contemporaneamente. Quando è disattivato, il promemoria presenta i pulsanti Lancio e Vantaggio per il giocatore o il GM.',
        'Un tiro salvezza fallito pone fine alla concentrazione. Con End at 0 HP attivo, scendere a 0 punti ferita termina senza salvare.',
        'Il menu Vantaggio dà un vantaggio al personaggio sui salvataggi automatici, come fa il talento War Caster.',
      ],
    },
    automatic: {
      heading: 'Incantesimi lanciati da un foglio',
      points: [
        "Con aggiunta automatica Con. Indicatore attivo, lanciare un incantesimo di concentrazione da un foglio di D&D 5e 2014 (OGL) o 2024 aggiunge l'indicatore.",
        "I segnalini dell'incantatore sulla pagina che stanno visualizzando sono contrassegnati; se non ce ne sono, i token su qualsiasi pagina lo sono.",
        'Contano solo le carte del GM, di un altro Mod o di uno dei giocatori del personaggio. Lanciare nuovamente lo stesso incantesimo non cambia nulla.',
        'Una carta di D&D 2024 che menziona solo la concentrazione nel suo testo, come il talento Incantatore di Guerra, può avviare la concentrazione ma non sostituisce mai un incantesimo.',
        'I fogli di D&D 2024 potrebbero richiedere il server API sperimentale. Attiva la modalità Debug per vedere perché un incantesimo è stato o meno rilevato.',
      ],
    },
    players: {
      heading: 'Giocatori',
      points: [
        'I giocatori possono iniziare e terminare la concentrazione per i gettoni che controllano e utilizzare i pulsanti Lancio e Vantaggio nei propri salvataggi.',
        'Con Invia promemoria impostato su Personaggio, i messaggi vengono sussurrati ai giocatori del personaggio e al GM.',
      ],
    },
    commands: {
      heading: 'Comandi',
      intro: 'Anche altri Mod, come ScriptCards, possono inviare questi comandi.',
      colCommand: 'Comando',
      colDesc: 'Cosa fa',
    },
    settings: {
      heading: 'Impostazioni',
      intro:
        'Modificare le impostazioni con i pulsanti nella scheda delle impostazioni o con config <chiave>|<valore>. Alcuni possono anche essere impostati nella pagina del Mod.',
      colKey: 'Chiave',
      colName: 'Nome',
      colDesc: 'Cosa fa',
    },
    upgrading: {
      heading: 'Aggiornamento dalla versione 1.0',
      points: [
        "Le impostazioni, l'elenco dei vantaggi e ogni comando continuano a funzionare.",
        'I messaggi ora dicono quando termina la concentrazione e su quale incantesimo.',
        "I gettoni che già portano il segnalino vengono raccolti all'avvio.",
      ],
    },
    troubleshooting: {
      heading: 'Risoluzione dei problemi',
      points: [
        "Nessun salvataggio quando i punti ferita scendono: controlla che il gettone abbia il segnalino e che la Barra HP sia la barra che hai modificato. Le modifiche apportate da altri Mod tramite l'API non generano eventi, quindi non vengono visualizzate.",
        'Il modificatore è 0: controlla l’Attributo Bonus sulla scheda del personaggio.',
        "Gli incantesimi lanciati dal foglio non vengono rilevati: attiva la modalità Debug, lancia nuovamente l'incantesimo e leggi la console API.",
        'Due caratteri condividono un nome: il rilevamento utilizza la prima corrispondenza. Assegna nomi univoci ai personaggi.',
      ],
    },
    languages: {
      heading: 'Lingue',
      body: "La concentrazione è tradotta nelle lingue seguenti. Scegline uno con l'impostazione Lingua.",
      colCode: 'Codice',
      colName: 'Lingua',
      colNative: 'Nome nativo',
    },
    credits: {
      heading: 'Crediti',
      original: 'Mod originale di',
      maintainer: 'Mantenuto da',
      support: 'Segnala bug e idee sul forum Roll20 Mod o su GitHub.',
    },
    footer: 'I pulsanti per ogni azione si trovano nel volantino "{deck}".',
  },
};

export default TRANSLATION;
