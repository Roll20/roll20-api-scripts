const TRANSLATION = {
  titles: {
    ready: 'Hexploration ist fertig.',
    settings: 'Erkundungseinstellungen',
    languages: 'Wählen Sie eine Sprache',
    pageSettings: 'Seiteneinstellungen: {page}',
    status: 'Erkundungsstatus: {page}',
    help: 'Erkundungsbefehle',
    confirm: 'Bitte bestätigen',
  },
  discovery: {
    title: 'Standort entdeckt',
  },
  menu: {
    draw: 'Ziehen',
    reveal: 'Enthüllen und Verstecken',
    locations: 'Standorte',
    tools: 'Werkzeuge',
    layerInUse: 'Auf dem {layer} werden neue Hexfelder gezeichnet.',
    pageSettingsHelp:
      'Diese Einstellungen gelten nur für diese Seite. Mit ★ gekennzeichnete Einstellungen überschreiben die globalen Einstellungen.',
  },
  buttons: {
    fill: 'Füllen',
    fillInverse: 'Inverse Füllung',
    undo: 'Füllung rückgängig machen',
    reveal: 'Aufdecken',
    conceal: 'Verbergen',
    explore: 'Erkunden',
    revealPage: 'Seite enthüllen',
    resetPage: 'Seite zurücksetzen',
    mark: 'Standort markieren',
    unmark: 'Markierung aufheben',
    name: 'Name Hex',
    settings: 'Einstellungen',
    pageSettings: 'Seiteneinstellungen',
    status: 'Status',
    rescan: 'Erneut scannen',
    calibrate: 'Kalibrieren',
    calibrateReset: 'Kalibrierung zurücksetzen',
    help: 'Helfen',
    change: 'Ändern',
    menu: 'Speisekarte',
    clearOverrides: 'Überschreibungen löschen',
    confirmReset: 'Ja, alle Verhexungen entfernen',
  },
  prompts: {
    name: 'Standortname (zum Löschen leer lassen)',
  },
  values: {
    on: 'An',
    off: 'Aus',
    none: 'Keiner',
    hexLayer: {
      auto: 'Auto (Vordergrund, falls verfügbar)',
      foreground: 'Vordergrundebene',
      objects: 'Token-Schicht',
    },
    revealBy: {
      players: 'Spielertoken',
      characters: 'Charaktertoken',
      all: 'Alle Token',
    },
    revealMode: {
      clear: 'Klar',
      glimpse: 'Blick',
    },
    announce: {
      all: 'Alle',
      gm: 'Nur GM',
      off: 'Aus',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Sechskant (H)',
    },
    fillKind: {
      fill: 'Füllen',
      fillInverse: 'Inverse Füllung',
      conceal: 'Verbergen',
    },
  },
  settings: {
    language: {
      label: 'Sprache',
      desc: 'Sprache für Menüs, Nachrichten und Handouts.',
    },
    hexLayer: {
      label: 'Hex-Ebene',
      desc: 'Wo neue Hexfelder gezeichnet werden. Automatisch versucht es mit der Vordergrundebene (über den Token) und greift auf die Tokenebene zurück, wenn das Spiel dies nicht unterstützt.',
    },
    fillColor: {
      label: 'Füllfarbe',
      desc: 'Farbe neuer Hexfelder. Verwenden Sie rgba() für durchsichtige Hexadezimalwerte, zum Beispiel rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Randfarbe',
      desc: 'Farbe der Umrisse neuer Hexfelder.',
    },
    labelColor: {
      label: 'Etikettenfarbe',
      desc: 'Farbe der Nur-GM-Namensschilder auf benannten Hexfeldern.',
    },
    glimpseColor: {
      label: 'Einblick in die Farbe',
      desc: 'Die Farbverhexungen ändern sich, wenn man sie erblickt (Einblick-Enthüllungsmodus). Verwenden Sie eine durchsichtige rgba()-Farbe.',
    },
    strokeWidth: {
      label: 'Randbreite',
      desc: 'Breite des Umrisses neuer Hexfelder in Pixel (0 bis 20).',
    },
    maxDistance: {
      label: 'Hex-Enthüllungsabstand',
      desc: 'Wird auf Hexfelder angewendet, wenn sie gezogen werden: Ein Spielstein muss sich innerhalb dieser Anzahl von Hexfeldern befinden, um sie aufzudecken, egal wie weit er sehen kann. Für keine Begrenzung leer lassen.',
    },
    revealDistance: {
      label: 'Sichtweite',
      desc: 'Wie viele Hexfelder um einen beweglichen Spielstein herum angezeigt werden (0 bis 20). 0 zeigt nur die Hexfelder an, die der Token durchquert.',
    },
    lineOfSight: {
      label: 'Sichtlinie',
      desc: 'Wenn diese Option aktiviert ist, wird ein Hexfeld nur dann aufgedeckt, wenn kein abgedecktes Hexfeld zwischen ihm und dem Spielstein liegt.',
    },
    revealPath: {
      label: 'Auf dem Weg enthüllen',
      desc: 'Wenn diese Option aktiviert ist, wird jedes Hexfeld, das ein Spielstein beim Ziehen durchquert (einschließlich Wegpunkte), angezeigt, nicht nur die Stelle, an der er anhält.',
    },
    revealBy: {
      label: 'Zeichen, die offenbaren',
      desc: 'Welche Spielsteine ​​auf der Spielsteinebene zeigen Hexereien an: Spielsteine, die von einem Spieler kontrolliert werden, Spielsteine, die einen beliebigen Charakter repräsentieren, oder jeder Spielstein.',
    },
    revealMode: {
      label: 'Reveal-Modus',
      desc: 'Clear entfernt Verhexungen in Sichtweite. Glimpse macht sie stattdessen durchsichtig; Sie werden entfernt, wenn ein Token in sie eindringt.',
    },
    announce: {
      label: 'Kündigen Sie Entdeckungen an',
      desc: 'Wer sieht die Chat-Nachricht, wenn ein benannter Ort entdeckt wird?',
    },
    pingDiscoveries: {
      label: 'Ping-Entdeckungen',
      desc: 'Wenn diese Option aktiviert ist, werden Spieler an einen benannten Ort gepingt, wenn dieser entdeckt wird.',
    },
    hideCoveredTokens: {
      label: 'Verdeckte Token ausblenden',
      desc: 'Roll20 zeichnet Namen, Balken und Auren über Hexfeldern. Wenn diese Option aktiviert ist, werden der für den Spieler sichtbare Name, die Balken und die Auren von Spielsteinen unter einem abgedeckten Hexfeld ausgeschaltet und wieder eingeschaltet, wenn sie aufgedeckt werden.',
    },
  },
  status: {
    engine: 'Spiel-Engine',
    grid: 'Netz',
    layer: 'Hex-Schicht',
    hexes: 'Verhexungen',
    named: 'Benannte Verhexungen',
    icons: 'Standorttoken',
    glimpsed: 'Gesehene Verhexungen',
    pending: 'Orte, die auf eine Besetzung warten',
    calibrated: 'Kalibriert',
    overrides: 'Seitenüberschreibungen',
    undo: 'Rückgängig machen verfügbar',
  },
  messages: {
    filled:
      'Vollständig ausfüllen. Gezeichnete Hexen: {created}. Neu gestaltet: {restyled}. Ausgeblendete Orte: {icons}.',
    revealed: 'Aufgedeckte Verhexungen: {count}.',
    revealedPage: 'Jedes Hex auf der Seite wird angezeigt ({count}).',
    confirmReset:
      'Jedes Hex aus „{page}“ ({count}) entfernen? Standort-Tokens kehren zur Token-Ebene zurück. Durch Rückgängigmachen kann dies nicht rückgängig gemacht werden.',
    resetPage: 'Hexes wurden von der Seite entfernt: {count}.',
    undone:
      'Letzte Füllung rückgängig gemacht. Entfernte Verhexungen: {removed}. Neu gestaltete Hexfelder wiederhergestellt: {restored}.',
    named: 'Hexen mit dem Namen „{name}“: {count}.',
    unnamed: 'Gelöschte Namen: {count}.',
    marked:
      'In vorhandenen Hexfeldern versteckte Orte: {attached}. Warten auf die nächste Füllung, die sie abdeckt: {pending}.',
    unmarked: 'Token, die keine Standorte mehr sind: {count}.',
    settingChanged: '{setting} wird auf {value} gesetzt.',
    rescanned:
      'Neuscan abgeschlossen. Behalten: {kept}. Angenommen: {adopted}. Erneut eingereicht: {moved}. Fehlt und vergessen: {dropped}. Neu verknüpfte Etiketten: {labels}. Standort-Tokens neu verknüpft: {icons}.',
    calibrated:
      'Rasterkalibriert (Spaltenschritt {colStep}px, Zeilenschritt {rowStep}px). Erneut scannen: beibehalten {kept}, erneut eingereicht {moved}, übernommen {adopted}.',
    calibrationReset:
      'Kalibrierung entfernt. Erneut scannen: beibehalten {kept}, erneut eingereicht {moved}, übernommen {adopted}.',
    journalRebuilt: 'Die Handouts „{help}“ und „{deck}“ wurden neu erstellt.',
    migrated:
      'Ihre Hexploration 1.x-Hex-Karten wurden aktualisiert. Wenn dieses Spiel von einem Legacy-Spiel kopiert wurde, führen Sie Rescan auf jeder Hex-Kartenseite aus.',
    pruned:
      'Gespeicherte Hexen, die nicht mehr existieren und vergessen wurden: {dropped}. Wenn dieses Spiel oder diese Seite kopiert wurde, führen Sie „Rescan“ auf der Seite aus, um die Verhexungen wieder aufzunehmen.',
    readyHint:
      'Geben Sie !hexploration für das Menü ein oder öffnen Sie das Handout „Hexploration – Command Deck“.',
  },
  warnings: {
    foregroundUnavailable:
      'Dieses Spiel unterstützt das Zeichnen auf der Vordergrundebene nicht, daher wurden Hexfelder auf der Tokenebene gezeichnet.',
    someFailed:
      'Hexen, die nicht gezeichnet werden konnten: {count}. Weitere Informationen finden Sie in der API-Konsole.',
  },
  errors: {
    noPage: 'Die Seite, an der gearbeitet werden soll, konnte nicht gefunden werden.',
    notHex: 'Diese Seite verwendet kein Hex-Raster.',
    noPolygons: 'Wählen Sie eine oder mehrere gezeichnete Formen zum Füllen aus.',
    emptyArea: 'Der ausgewählte Bereich enthält keine Hex-Zentren.',
    tooMany: 'Das würde zu viele Verhexungen auf einmal erzeugen ({count}).',
    nothingToConceal:
      'Wählen Sie gezeichnete Formen oder Spielsteine ​​aus, die Sie verbergen möchten.',
    nothingToReveal:
      'Wählen Sie Hexfelder, gezeichnete Formen oder Spielsteine ​​aus, die Sie aufdecken möchten.',
    noTokens: 'Wählen Sie zunächst einen oder mehrere Token aus.',
    noHexes:
      'Wählen Sie zunächst ein oder mehrere Hexfelder (oder darauf stehende Spielsteine) aus.',
    nothingToUndo: 'Es gibt keine Füllung, die rückgängig gemacht werden könnte.',
    unknownCommand: 'Unbekannter Befehl: {command}',
    unknownSetting: 'Unbekannte Einstellung: {key}',
    unknownPageSetting: 'Einstellungen, die pro Seite festgelegt werden können: {keys}',
    invalidValue: '„{value}“ ist kein gültiger Wert für {key}.',
    calibrateNeedsTokens:
      'Wählen Sie ein oder zwei Token aus, die an den Sechseckzentren befestigt werden.',
    calibrateFailed: 'Diese Token können nicht zur Kalibrierung verwendet werden.',
    unexpected: 'Es ist ein Fehler aufgetreten: {message}',
  },
  hints: {
    noPage: 'Öffnen Sie die Seite, an der Sie arbeiten möchten, oder wählen Sie etwas darauf aus.',
    notHex: 'Stellen Sie das Seitenraster in den Seiteneinstellungen auf Hex (V) oder Hex (H) ein.',
    noPolygons:
      'Zeichnen Sie ein Polygon, ein Rechteck, eine Ellipse oder eine Freihandform um den Bereich, wählen Sie es aus und versuchen Sie es erneut.',
    emptyArea: 'Zeichnen Sie eine größere Form oder überprüfen Sie die Seitenrastereinstellungen.',
    tooMany:
      'Füllen Sie einen kleineren Bereich oder teilen Sie den Bereich in mehrere Formen auf.',
    noHexes:
      'Verhexungen befinden sich im Vordergrund oder auf der Token-Ebene. Wechseln Sie zu dieser Ebene, um sie auszuwählen.',
    unknownCommand: 'Geben Sie !hexploration help ein, um die Befehle aufzulisten.',
    unknownSetting: 'Geben Sie !hexploration set ein, um alle Einstellungen anzuzeigen.',
    calibrateNeedsTokens:
      'Rasten Sie einen Spielstein in der Mitte eines Hexfelds ein und wählen Sie ihn aus. Wählen Sie ein zweites Token aus, das an einem benachbarten Hexfeld in derselben Zeile (Hex V) oder Spalte (Hex H) eingerastet ist, um auch die Hexfeldgröße zu korrigieren.',
    calibrateFailed:
      'Zwei Spielsteine ​​müssen sich in derselben Reihe (Hex V) oder derselben Spalte (Hex H) befinden und mindestens ein Hex voneinander entfernt sein.',
    unexpected: 'Details finden Sie im API-Konsolenprotokoll.',
  },
  help: {
    menu: 'Zeigen Sie das Menü an.',
    fill: 'Decken Sie die ausgewählten gezeichneten Formen mit Hexen ab.',
    fillInverse: 'Bedecken Sie die gesamte Seite mit Ausnahme der ausgewählten Formen.',
    undo: 'Machen Sie die letzte Füllung rückgängig, kehren Sie die Füllung um oder verbergen Sie sie und stellen Sie die verwendeten Formen wieder her.',
    reveal:
      'Zeigt die ausgewählten Hexfelder und die Hexfelder unter den ausgewählten Formen und Spielsteinen an.',
    revealPage: 'Enthülle jedes Hex auf der Seite ohne Ankündigungen.',
    conceal:
      'Decken Sie den Bereich unter den ausgewählten Formen und Spielsteinen erneut mit Hexen ab.',
    explore:
      'Zeigen Sie die ausgewählten Spielsteine ​​an, als ob sie sich gerade dorthin bewegt hätten.',
    resetPage: 'Entferne jedes Hex auf der Seite (fragt zuerst).',
    name: 'Benennen Sie die ausgewählten Hexfelder oder die Hexfelder unter den ausgewählten Spielsteinen. Lassen Sie den Namen leer, um ihn zu löschen.',
    mark: 'Verwandeln Sie die ausgewählten Spielsteine ​​in versteckte Orte.',
    unmark: 'Verhindern Sie, dass die ausgewählten Token versteckte Orte sind.',
    set: 'Ändern Sie eine Einstellung oder zeigen Sie alle Einstellungen an.',
    pageSet: 'Überschreiben Sie eine Anzeigeeinstellung nur auf der aktuellen Seite.',
    pageClear: 'Entfernen Sie die Überschreibungen der aktuellen Seite.',
    rescan:
      'Erstellen Sie die Hex-Liste der Seite neu, beispielsweise nach dem Kopieren einer Seite oder eines Spiels.',
    calibrate:
      'Richten Sie das Sechseckgitter so aus, dass ein oder zwei ausgewählte Spielsteine ​​in die Sechseckmitten eingerastet werden.',
    calibrateReset: 'Entfernen Sie die Kalibrierung der aktuellen Seite.',
    status: 'Zeigen Sie, was Hexploration über die aktuelle Seite weiß.',
    journal: 'Erstellen Sie die Handzettel für das Hilfe- und Befehlsdeck neu.',
    help: 'Diese Liste anzeigen.',
    handout: 'Vollständige Anweisungen finden Sie im Handout „{name}“.',
  },
  deck: {
    subtitle: 'Kommandodeck',
    drawDesc:
      'Zeichnen Sie Formen um einen Bereich, wählen Sie sie aus und füllen Sie sie aus. Mit „Rückgängig“ wird die letzte Füllung rückgängig gemacht.',
    revealDesc:
      'Wählen Sie Verhexungen, Formen oder Spielsteine ​​aus, um sie wieder freizulegen oder zu verdecken. Beim Erkunden wird die Umgebung ausgewählter Spielsteine ​​angezeigt, als ob sie sich bewegt hätten.',
    locationsDesc:
      'Wählen Sie Spielsteine ​​aus, um sie als Standorte unter Hexfeldern zu verbergen. Wählen Sie Hexfelder oder Token aus, um einem Hexfeld einen Namen zu geben.',
    toolsDesc:
      'Einstellungen, Seitenüberschreibungen, Status, erneutes Scannen kopierter Seiten und Kalibrieren des Rasters.',
    footer: 'Vollständige Anweisungen finden Sie im Handout „{help}“.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Hex-für-Hex-Erkundung für Roll20',
    footer: 'Verwenden Sie das Handout „{deck}“ für Ein-Klick-Steuerungen.',
    overview: {
      heading: 'Überblick',
      body: 'Hexploration umfasst eine Hexfeldkarte mit undurchsichtigen Hexfeldern. Während sich die Gruppe bewegt, werden die Hexfelder, die sie durchquert (und, wenn Sie möchten, die Hexfelder um sie herum) entfernt, sodass die Karte jeweils ein Hexfeld freigelegt wird. Versteckte Orte können unter Hexfeldern platziert werden und werden bekannt gegeben, wenn sie gefunden werden. Es funktioniert in Jumpgate- und Legacy-Spielen auf Hex- (V) und Hex- (H) Gittern jeder Größe.',
      demo: 'Sehen Sie sich eine kurze Demo an (ab Version 1)',
    },
    quickStart: {
      heading: 'Schnellstart',
      steps: [
        'Öffnen Sie eine Seite, deren Raster auf Hex (V) oder Hex (H) eingestellt ist.',
        'Zeichnen Sie eine oder mehrere Formen (Polygon, Rechteck, Ellipse oder Freihand) um den auszublendenden Bereich.',
        'Wählen Sie die Formen aus und klicken Sie im Command Deck auf „Fill“ (oder geben Sie „!hexploration fill“ ein). Die Formen werden durch Sechsecke ersetzt.',
        'Optional: Wählen Sie vor dem Ausfüllen Token für wichtige Orte aus und klicken Sie auf „Standort markieren“. Sie sind unter den Verhexungen versteckt und werden bekannt gegeben, wenn sie entdeckt werden.',
        'Verschiebe einen Spielermarker. Jedes Hexfeld, das es durchquert, und die Hexfelder innerhalb seiner Sichtweite werden aufgedeckt.',
      ],
    },
    commands: {
      heading: 'Befehle',
      intro:
        'Nur GMs können diese Befehle verwenden. Die meisten wirken auf die ausgewählten Objekte; Der Rest wirkt auf der Seite, die Sie gerade betrachten.',
      colCommand: 'Befehl',
      colDesc: 'Was es bewirkt',
    },
    revealing: {
      heading: 'Wie Offenlegung funktioniert',
      points: [
        'Nur Spielsteine ​​auf der Spielsteinebene zeigen Hexfelder an. Die Anzahl der Spielsteine ​​wird standardmäßig durch „Tokens That Reveal: Player Tokens“ festgelegt, sodass der Spielleiter Monster bewegen kann, ohne die Karte aufzudecken.',
        'Ein Spielstein deckt jedes Hexfeld auf, das er abdeckt (große Spielsteine ​​decken mehrere ab) und, wenn „Entlang des Pfads anzeigen“ aktiviert ist, jedes Hexfeld auf der Route, entlang derer es gezogen wurde, einschließlich Wegpunkten.',
        'Die Sichtweite zeigt die Hexfelder um jedes dieser Hexfelder an. Bei aktivierter Sichtlinie wird ein Hexfeld nur dann aufgedeckt, wenn kein verdecktes Hexfeld dazwischen liegt.',
        'Der Hex-Enthüllungsabstand wird auf den Hexfeldern gespeichert, während diese gezeichnet werden. Diese Verhexungen werden nur innerhalb von so vielen Verhexungen aufgedeckt, unabhängig davon, wie weit ein Spielstein reichen kann. Verwenden Sie es für Berge oder Wälder, die verbergen, was sich dahinter befindet.',
        'Im Glimpse-Modus werden Hexfelder in Sichtweite durchsichtig, anstatt zu verschwinden, und werden entfernt, wenn ein Token sie betritt.',
        'Die API meldet keine Bewegungen anderer Mods. TokenMod-Bewegungen werden automatisch übernommen; Wählen Sie für andere Mods die Token aus und klicken Sie auf „Erkunden“ oder rufen Sie Hexploration.revealAround(token) von Ihrem eigenen Mod aus auf.',
        'Die API meldet keine Bewegungen anderer Mods. TokenMod-Bewegungen werden automatisch übernommen; Wählen Sie für andere Mods die Token aus und klicken Sie auf „Erkunden“ oder rufen Sie Hexploration.revealAround(token) von Ihrem eigenen Mod aus auf.',
      ],
    },
    locations: {
      heading: 'Benannte Hexfelder und Orte',
      points: [
        '„Standort markieren“ verwandelt die ausgewählten Token in versteckte Orte. Ein Spielstein, der sich bereits unter einem Feld befindet, wird sofort ausgeblendet; andernfalls wird es von der nächsten Füllung verdeckt, die es bedeckt.',
        'Token mit der Statusmarkierung „Weißer Turm“ werden beim Ausfüllen ebenfalls als Orte behandelt, wie in Version 1.',
        'Versteckte Standortmarker werden auf die GM-Ebene verschoben. Wenn ihr Hexfeld aufgedeckt wird, kehren sie mit angezeigtem Namen zur Spielsteinebene zurück und ihre Entdeckung wird bekannt gegeben.',
        'Name Hex gibt einem Hex einen Namen ohne Token. Der Name wird dem GM als Beschriftung auf der GM-Ebene angezeigt und bekannt gegeben, wenn das Hex aufgedeckt wird.',
        '„Entdeckungen ankündigen“ legt fest, ob jeder, nur der GM oder niemand die Ankündigung sieht. Ping Discoveries verschiebt auch die Sicht der Spieler auf den Ort.',
      ],
    },
    settings: {
      heading: 'Einstellungen',
      intro:
        'Ändern Sie die Einstellungen mit !hexploration set (oder der Schaltfläche „Einstellungen“). Hex Layer, Tokens That Reveal und Sprache können ebenfalls auf der Einstellungsseite des Mods eingestellt werden.',
      colKey: 'Schlüssel',
      colName: 'Einstellung',
      colDesc: 'Beschreibung',
      perPage: '(Kann pro Seite eingestellt werden.)',
    },
    jumpgate: {
      heading: 'Jumpgate und Legacy',
      points: [
        'Hexploration ermittelt, welche Engine das Spiel verwendet, und zeichnet die passende Form. In beiden Editoren gezeichnete Formen können gefüllt werden.',
        'Wenn die Hex-Ebene auf „Auto“ eingestellt ist, werden Hexfelder auf der Vordergrundebene über den Spielsteinen gezeichnet, sodass Spieler nicht sehen können, was sich darunter befindet. Wenn die Vordergrundebene nicht verfügbar ist, wird stattdessen die Tokenebene verwendet.',
        'Jumpgate zeichnet mathematisch regelmäßige Verhexungen, die eine etwas andere Form als Legacy-Verhexungen haben. Wenn die Sechsecke nicht mit dem Raster einer Seite übereinstimmen, rasten Sie ein Token in der Mitte eines Sechsecks ein, wählen Sie es aus und klicken Sie auf „Kalibrieren“. Wählen Sie zwei Spielsteine ​​in benachbarten Hexfeldern derselben Zeile (Hex V) oder Spalte (Hex H) aus, um auch die Hexfeldgröße zu korrigieren.',
        'Wenn eine Seite oder ein Spiel kopiert wird, erhalten ihre Hexfelder neue IDs. Führen Sie „Rescan“ auf der Seite aus, um sie zusammen mit ihren Namensschildern und Standorttokens wieder aufzunehmen.',
      ],
    },
    upgrading: {
      heading: 'Upgrade von Version 1',
      points: [
        'Version 2 benötigt PathMath, MatrixMath, Vector Math oder HTML Builder nicht mehr. Sie können sie entfernen, es sei denn, ein anderer Mod verwendet sie.',
        'Vorhandene Hex-Karten, Namen, Standort-Tokens und Einstellungen werden beim ersten Start automatisch aktualisiert.',
        'Die Befehle der Version 1, einschließlich des Hexploration_menu-Makros, funktionieren weiterhin.',
        'In Version 1 konnte jeder Spielstein, der einen Charakter darstellte, Verhexungen aufdecken. Setzen Sie Offenbar-Token auf Charakter-Token, um dieses Verhalten beizubehalten.',
      ],
      colV1: 'Befehl der Version 1',
      colV2: 'Befehl der Version 2',
    },
    troubleshooting: {
      heading: 'Fehlerbehebung',
      points: [
        'Es passiert nichts, wenn sich ein Token bewegt: Überprüfen Sie, ob sich der Token auf der Token-Ebene befindet und mit Tokens That Reveal übereinstimmt und ob die Seite Hexfelder hat (!hexploration-Status).',
        'Hexfelder sind vom Raster versetzt: Verwenden Sie „Kalibrieren“ und überprüfen Sie dann mit einem Token einige Hexfelder auf der Karte.',
        'Verhexungen werden nach dem Kopieren einer Seite oder eines Spiels nicht mehr angezeigt: Führen Sie „Rescan“ auf der Seite aus.',
        'Fill besagt, dass der Bereich keine Hex-Zentren hat: Die Form muss den Mittelpunkt von mindestens einem Hex enthalten.',
        'Überprüfen Sie für alles andere das API-Konsolenprotokoll und geben Sie die entsprechenden Meldungen an, wenn Sie um Hilfe bitten.',
      ],
    },
    languages: {
      heading: 'Sprachen',
      body: 'Wählen Sie eine Sprache mit !hexploration set language. Verfügbare Sprachen:',
      colLanguage: 'Sprache',
      colNative: 'Einheimischer Name',
      colCode: 'Code',
    },
    credits: {
      heading: 'Credits',
      original: 'Original-Mod von',
      maintainer: 'Version 2 verwaltet von',
      marketplace: 'Adas Kunstpakete auf dem Roll20-Marktplatz',
      support:
        'Wenn Sie einen Fehler finden oder eine Idee haben, posten Sie im Roll20 Mod-Forum oder öffnen Sie ein Problem auf GitHub und fügen Sie alle Meldungen aus dem API-Konsolenprotokoll hinzu.',
    },
  },
};

export default TRANSLATION;
