const TRANSLATION = {
  titles: {
    ready: 'Konzentration ist fertig.',
    menu: 'Konzentrationseinstellungen',
    help: 'Konzentrationsbefehle',
    status: 'Wer konzentriert sich?',
    advantage: 'Vorteil durch Konzentrationseinsparungen',
    reset: 'Konzentration zurücksetzen',
    concentration: 'Konzentration',
    save: 'Konzentration speichern',
    check: 'Konzentrationskontrolle',
  },
  messages: {
    migrated:
      'Von Version 1.0 aktualisiert. Ihre Einstellungen und Vorteilsliste wurden beibehalten und Ihre alten Makros funktionieren weiterhin.',
    reconciled:
      'Habe die Karte eingeholt: Konzentrierte Token gefunden {added}, alte Einträge entfernt {dropped}.',
    readyHint:
      'Geben Sie {command} für die Einstellungen ein oder öffnen Sie das Command Deck-Handout.',
    settingChanged: '{setting} ist jetzt {value}.',
    confirmReset:
      'Alle Einstellungen auf die Standardeinstellungen zurücksetzen und die Vorteilsliste löschen? Konzentrationsmarkierungen auf der Karte bleiben erhalten.',
    reset: 'Die Einstellungen werden auf ihre Standardwerte zurückgesetzt.',
    journal: 'Handouts neu erstellt: {help} und {deck}.',
  },
  notices: {
    started: '{name} konzentriert sich jetzt auf {spell}.',
    startedNoSpell: '{name} konzentriert sich jetzt.',
    switched:
      '{name} konzentriert sich nicht mehr auf {old} und konzentriert sich jetzt auf {spell}.',
    switchedNoSpell: '{name} konzentriert sich jetzt.',
    ended: '{name} konzentriert sich nicht mehr auf {spell}.',
    endedNoSpell: '{name} konzentriert sich nicht mehr.',
    lost: '{name} verliert die Konzentration auf {spell}.',
    lostNoSpell: '{name} verliert die Konzentration.',
    kept: '{name} konzentriert sich weiterhin auf {spell}.',
    keptNoSpell: '{name} konzentriert sich weiter.',
    zeroHp: '{name} sinkt auf 0 Trefferpunkte und verliert die Konzentration auf {spell}.',
    zeroHpNoSpell: '{name} sinkt auf 0 Trefferpunkte und verliert die Konzentration.',
    checkNeeded:
      '{name} muss einen konstitutionsrettenden Wurf machen, um konzentriert zu bleiben: {dc}.',
  },
  save: {
    dc: 'Gleichstrom',
    dcValue: 'DC {dc}',
    modifier: 'Modifikator',
    roll: 'Rollen',
    advantageRoll: '{first} und {second} (Vorteil)',
    success: 'Erfolg',
    failure: 'Versagen',
  },
  menu: {
    concentratingCount: 'Jetzt konzentrieren: {count}',
    settings: 'Einstellungen',
    footer:
      'Geben Sie {command} ein, um hierher zurückzukehren. Jeder Button ist auch im Handout „{deck}“ enthalten.',
  },
  status: {
    none: 'Niemand konzentriert sich.',
  },
  advantage: {
    intro:
      'Charaktere, die auf „Ein“ eingestellt sind, würfeln ihre Konzentrationswürfe mit Vorteil, wie beim War Caster-Talent. Dies gilt für automatische Speicherungen.',
    none: 'In diesem Spiel gibt es keine Charaktere.',
  },
  buttons: {
    roll: 'Rollen',
    advantage: 'Vorteil',
    status: 'Status',
    advantageMenu: 'Vorteilsmenü',
    help: 'Helfen',
    reset: 'Zurücksetzen',
    confirmReset: 'Einstellungen zurücksetzen',
    end: 'Ende',
    menu: 'Speisekarte',
    concentrate: 'Konzentrieren Sie sich auf…',
    toggle: 'Umschalten',
    journal: 'Handouts neu erstellen',
  },
  prompts: {
    spell: 'Fluch',
  },
  values: {
    on: 'An',
    off: 'Aus',
    bar: 'Balken {bar}',
    unnamed: 'Unbenannt',
    sendTo: {
      everyone: 'Alle',
      character: 'Charakter',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Basic',
      detailed: 'Ausführlich',
    },
  },
  settings: {
    language: {
      label: 'Sprache',
      desc: 'Die Sprache von Chat-Nachrichten und Handouts.',
    },
    command: {
      label: 'Befehl',
      desc: 'Der Chat-Befehl, ohne das „!“. Makros der Version 1.0 verwenden Konzentration.',
    },
    statusmarker: {
      label: 'Statusmarkierung',
      desc: 'Der Token-Marker, der die Konzentration anzeigt. Es können benutzerdefinierte Token-Marker verwendet werden.',
    },
    bar: {
      label: 'HP-Leiste',
      desc: 'Die Token-Leiste, die Trefferpunkte enthält. Schäden daran erfordern einen Konzentrationswurf.',
    },
    send_reminder_to: {
      label: 'Erinnerung senden an',
      desc: 'Wer Konzentrationsnachrichten sieht und speichert: jeder, der GM oder die Spieler des Charakters (der GM erhält eine Kopie).',
    },
    auto_add_concentration_marker: {
      label: 'Con automatisch hinzufügen. Marker',
      desc: 'Fügen Sie die Markierung hinzu, wenn ein Konzentrationszauber von einem Blatt aus gewirkt wird.',
      hint: 'D&D 5e 2014 (OGL) und 2024 Blätter.',
    },
    auto_roll_save: {
      label: 'Automatische Rollenspeicherung',
      desc: 'Würfeln Sie den Rettungswurf, sobald ein Konzentrationsmarker Schaden erleidet. Wenn die Erinnerung deaktiviert ist, verfügt sie über die Schaltflächen „Rollen“ und „Vorteil“.',
    },
    show_roll_button: {
      label: 'Roll-Taste',
      desc: 'Fügen Sie der Erinnerung die Schaltflächen „Rolle“ und „Vorteil“ hinzu, wenn die automatische Rollspeicherung deaktiviert ist.',
    },
    end_at_zero: {
      label: 'Ende bei 0 PS',
      desc: 'Beenden Sie die Konzentration ohne Speichern, wenn ein Token auf 0 Trefferpunkte fällt.',
    },
    bonus_attribute: {
      label: 'Bonusattribut',
      desc: 'Das zu Konzentrationsspeichern hinzugefügte Blattattribut. Constitution_save_mod funktioniert auf D&D 5e 2014- und 2024-Blättern.',
    },
    debug: {
      label: 'Debug-Modus',
      desc: 'Schreiben Sie Notizen zur Zaubererkennung und zum Speichern in der API-Konsole für Supportanfragen.',
    },
    support_mode: {
      label: 'Support-Modus',
      desc: 'Wie viel Debug-Modus schreibt: Einfach (kurz) oder Ausführlich.',
    },
  },
  help: {
    menu: 'Wenn nichts ausgewählt ist (GM): Öffnen Sie die Einstellungen. Bei ausgewählten Token: Konzentration starten oder beenden.',
    toggle:
      'Konzentrieren Sie sich auf einen Zauberspruch mit den ausgewählten Spielsteinen. Nennen Sie einen anderen Zauberspruch, den Sie wechseln möchten. Führen Sie es erneut aus, um es zu beenden.',
    end: 'Endkonzentration für die ausgewählten Token.',
    status: 'Listen Sie mit den Schaltflächen „Beenden“ auf, wer sich konzentriert.',
    config: 'Ändern Sie eine Einstellung, zum Beispiel config auto_roll_save|false.',
    advantageMenu: 'Wählen Sie aus, welche Charaktere mit Vorteil Konzentrationswürfe erzielen.',
    toggleAdvantage: 'Schalten Sie den Vorteil für einen Charakter ein oder aus.',
    roll: 'Führen Sie einen Rettungswurf über die Schaltfläche „Würfen“ oder „Vorteil“ einer Erinnerung aus.',
    journal: 'Erstellen Sie die Handzettel für das Hilfe- und Befehlsdeck neu.',
    reset: 'Setzen Sie alle Einstellungen auf die Standardeinstellungen zurück.',
    help: 'Diese Liste anzeigen.',
    footer:
      'Vollständige Anweisungen finden Sie im Handout „{help}“. Schaltflächen finden Sie im Handout „{deck}“.',
    playerFooter: 'Wählen Sie zuerst Ihren Token aus.',
  },
  errors: {
    noSelection: 'Wählen Sie zunächst einen Token aus.',
    notYours: 'Du kannst die Konzentration nur für Spielsteine ​​ändern, die du kontrollierst.',
    gmOnly: 'Nur der GM kann diesen Befehl verwenden.',
    notConcentrating: 'Dieses Zeichen konzentriert sich nicht.',
    unknownSetting: 'Es gibt keine Einstellung namens „{key}“.',
    badSettingValue: '„{value}“ ist kein gültiger Wert für {key}.',
    rollExpired: 'Diese Schaltfläche ist abgelaufen.',
    unknownCharacter: 'Dieser Charakter existiert nicht mehr.',
    internal: 'Etwas ist schief gelaufen. Die API-Konsole enthält die Details.',
  },
  hints: {
    noSelection: 'Wählen Sie den Token des Zauberers aus und führen Sie den Befehl erneut aus.',
    rollExpired:
      'Die Tasten funktionieren einmal und 10 Minuten lang. Beschädigen Sie den Token erneut, um einen neuen zu erhalten.',
    unknownSetting:
      'Geben Sie den Befehl ein, ohne dass etwas ausgewählt ist, um die Einstellungen anzuzeigen.',
  },
  warnings: {
    unknownMarker:
      'Der Statusmarker „{marker}“ gehört nicht zu den Markern dieses Spiels. Wählen Sie in den Einstellungen eine andere aus.',
  },
  deck: {
    subtitle: 'Kommandodeck',
    selected: 'Ausgewählte Token',
    selectedDesc: 'Wählen Sie zuerst den Spielstein des Zaubernden aus.',
    table: 'Der Tisch',
    tableDesc: 'Sehen Sie, wer konzentriert ist und wer bei seinen Paraden im Vorteil ist.',
    tools: 'Werkzeuge',
    toolsDesc: 'Einstellungen, die Befehlsliste und die Handouts.',
    footer: 'Vollständige Anweisungen finden Sie im Handout „{help}“.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Konzentrationsmarkierungen, Erinnerungen und Speicherungen für D&D 5e',
    overview: {
      heading: 'Überblick',
      body: 'Konzentration verfolgt, wer sich auf welchen Zauber konzentriert. Es setzt einen Marker auf den Marker des Zauberers, führt einen Konstitutionswurf durch (oder fordert ihn dazu auf), wenn dieser Marker Schaden erleidet, und teilt dem Tisch mit, wann die Konzentration endet.',
    },
    quickStart: {
      heading: 'Schnellstart',
      steps: [
        'Wählen Sie den Spielstein des Zauberers aus und geben Sie „!concentration“ gefolgt vom Zauber ein, zum Beispiel „!concentration Bless“.',
        'Ändern Sie die Trefferpunkte des Tokens in seiner Balkenblase. Ein Rettungswurf wird mit SG 10 gewürfelt, oder mit der Hälfte des Schadens, wenn dieser höher ist.',
        'Führen Sie denselben Befehl noch einmal aus oder nehmen Sie den Marker ab, um die Konzentration zu beenden.',
        'Geben Sie !concentration ein, ohne dass etwas ausgewählt ist, um die Einstellungen zu öffnen.',
      ],
    },
    concentrating: {
      heading: 'Konzentrieren',
      points: [
        'Das Benennen eines anderen Zaubers verlagert die Konzentration darauf, ebenso wie das Wirken eines neuen Konzentrationszaubers.',
        'Wenn man den Marker mit der Hand auf einen Spielstein legt, beginnt die Konzentration ohne Zauber; Durch Entfernen oder Löschen des Tokens wird es beendet.',
        'Ein neu verknüpfter Token eines sich konzentrierenden Charakters erhält die Markierung, und ein eingefügter Token, der die Markierung trägt, wird verfolgt.',
        'Token eines Charakters mit verknüpfter Trefferpunktleiste teilen sich die Konzentration. Nicht verbundene Spielsteine, wie zum Beispiel ein Rudel Kobolde auf einem Blatt, konzentrieren sich auf sich allein.',
        'Jeder sieht eine Nachricht, wenn die Konzentration beginnt, wechselt oder endet, es sei denn, „Erinnerung senden an“ sagt etwas anderes.',
      ],
    },
    saves: {
      heading: 'Konzentration spart',
      points: [
        'Der SG beträgt 10 oder die Hälfte des erlittenen Schadens, je nachdem, welcher Wert höher ist, bis zu SG 30.',
        'Der Modifikator stammt aus dem Bonusattribut auf dem Charakterbogen; ein fehlender Wert zählt als 0.',
        'Auto Roll Save rollt auf einmal. Wenn sie ausgeschaltet ist, verfügt die Erinnerung über Würfel- und Vorteilsschaltflächen für den Spieler oder GM.',
        'Ein fehlgeschlagener Rettungswurf beendet die Konzentration. Wenn „Ende bei 0 HP“ aktiviert ist, endet es ohne Speicherung, wenn es auf 0 Trefferpunkte fällt.',
        'Das Vorteilsmenü verschafft dem Charakter einen Vorteil bei automatischen Speicherungen, wie es auch das Talent War Caster tut.',
      ],
    },
    automatic: {
      heading: 'Von einem Blatt gewirkte Zauber',
      points: [
        'Mit Auto Add Con. Markierung an, das Wirken eines Konzentrationszaubers von einem D&D 5e 2014 (OGL)- oder 2024-Blatt fügt die Markierung hinzu.',
        'Die Token des Zaubernden auf der Seite, die er gerade betrachtet, sind markiert; Wenn es keine gibt, sind es Token auf jeder Seite.',
        'Es zählen nur Karten des GM, eines anderen Mods oder eines Spielers des Charakters. Das erneute Wirken desselben Zaubers ändert nichts.',
        'Eine D&D 2024-Karte, in deren Text nur von Konzentration die Rede ist, wie zum Beispiel das Talent War Caster, kann zwar Konzentration anregen, ersetzt aber niemals einen Zauber.',
        'Für D&D 2024-Blätter ist möglicherweise der experimentelle API-Server erforderlich. Aktivieren Sie den Debug-Modus, um zu sehen, warum ein Zauber erkannt wurde oder nicht.',
      ],
    },
    players: {
      heading: 'Spieler',
      points: [
        'Spieler können die Konzentration für von ihnen kontrollierte Spielsteine ​​starten und beenden und die Würfel- und Vorteilsschaltflächen für ihre eigenen Spielstände verwenden.',
        'Wenn „Erinnerung senden“ auf „Charakter“ eingestellt ist, werden Nachrichten an die Spieler des Charakters und an den GM geflüstert.',
      ],
    },
    commands: {
      heading: 'Befehle',
      intro: 'Andere Mods, wie zum Beispiel ScriptCards, können diese Befehle ebenfalls senden.',
      colCommand: 'Befehl',
      colDesc: 'Was es bewirkt',
    },
    settings: {
      heading: 'Einstellungen',
      intro:
        'Ändern Sie die Einstellungen mit den Schaltflächen in der Einstellungskarte oder mit config <key>|<value>. Einige können auch auf der Mod-Seite eingestellt werden.',
      colKey: 'Schlüssel',
      colName: 'Name',
      colDesc: 'Was es bewirkt',
    },
    upgrading: {
      heading: 'Upgrade von Version 1.0',
      points: [
        'Die Einstellungen, die Vorteilsliste und alle Befehle funktionieren weiterhin.',
        'Nachrichten sagen jetzt, wann die Konzentration endet und bei welchem ​​Zauberspruch.',
        'Token, die bereits den Marker tragen, werden beim Start aufgenommen.',
      ],
    },
    troubleshooting: {
      heading: 'Fehlerbehebung',
      points: [
        'Kein Speichern, wenn Trefferpunkte sinken: Überprüfen Sie, ob der Marker die Markierung hat und ob der HP-Balken der Balken ist, den Sie geändert haben. Von anderen Mods über die API vorgenommene Änderungen lösen keine Ereignisse aus und werden daher nicht angezeigt.',
        'Der Modifikator ist 0: Vergleichen Sie das Bonusattribut mit dem Blatt des Charakters.',
        'Vom Blatt aus gewirkte Zauber werden nicht erkannt: Aktivieren Sie den Debug-Modus, wirken Sie den Zauber erneut und lesen Sie die API-Konsole.',
        'Zwei Zeichen teilen sich einen Namen: Bei der Erkennung wird die erste Übereinstimmung verwendet. Geben Sie den Charakteren eindeutige Namen.',
      ],
    },
    languages: {
      heading: 'Sprachen',
      body: 'Konzentration wird in die folgenden Sprachen übersetzt. Wählen Sie eine mit der Spracheinstellung aus.',
      colCode: 'Code',
      colName: 'Sprache',
      colNative: 'Einheimischer Name',
    },
    credits: {
      heading: 'Credits',
      original: 'Original Mod von',
      maintainer: 'Verwaltet von',
      support: 'Melden Sie Fehler und Ideen im Roll20 Mod-Forum oder auf GitHub.',
    },
    footer: 'Schaltflächen für jede Aktion finden Sie im Handout „{deck}“.',
  },
};

export default TRANSLATION;
