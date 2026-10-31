const TRANSLATION = {
  titles: {
    ready: 'Hexploration ist bereit.',
    settings: 'Hexploration-Einstellungen',
    languages: 'Sprache wählen',
    pageSettings: 'Seiteneinstellungen: {page}',
    status: 'Hexploration-Status: {page}',
    help: 'Hexploration-Befehle',
    confirm: 'Bitte bestätigen',
  },
  discovery: {
    title: 'Standort entdeckt',
  },
  menu: {
    draw: 'Zeichnen',
    reveal: 'Aufdecken und Verdecken',
    locations: 'Standorte',
    tools: 'Werkzeuge',
    layerInUse: 'Neue Hexfelder werden auf der {layer} gezeichnet.',
    pageSettingsHelp:
      'Diese Einstellungen gelten nur für diese Seite. Mit ★ gekennzeichnete Einstellungen überschreiben die globalen Einstellungen.',
  },
  buttons: {
    fill: 'Füllen',
    fillInverse: 'Umgekehrt füllen',
    undo: 'Füllung rückgängig machen',
    reveal: 'Aufdecken',
    conceal: 'Verbergen',
    explore: 'Erkunden',
    revealPage: 'Seite aufdecken',
    resetPage: 'Seite zurücksetzen',
    mark: 'Standort markieren',
    unmark: 'Markierung aufheben',
    name: 'Hexfeld benennen',
    settings: 'Einstellungen',
    pageSettings: 'Seiteneinstellungen',
    status: 'Status',
    rescan: 'Erneut scannen',
    calibrate: 'Kalibrieren',
    calibrateReset: 'Kalibrierung zurücksetzen',
    help: 'Hilfe',
    change: 'Ändern',
    menu: 'Menü',
    clearOverrides: 'Überschreibungen löschen',
    confirmReset: 'Ja, alle Hexfelder entfernen',
  },
  prompts: {
    name: 'Standortname (zum Löschen leer lassen)',
  },
  values: {
    on: 'An',
    off: 'Aus',
    none: 'Keine',
    hexLayer: {
      auto: 'Auto (Vordergrund, falls verfügbar)',
      foreground: 'Vordergrundebene',
      objects: 'Token-Ebene',
    },
    revealBy: {
      players: 'Spielertoken',
      characters: 'Charaktertoken',
      all: 'Alle Token',
    },
    revealMode: {
      clear: 'Entfernen',
      glimpse: 'Durchsicht',
    },
    announce: {
      all: 'Alle',
      gm: 'Nur GM',
      off: 'Aus',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Füllen',
      fillInverse: 'Umgekehrt füllen',
      conceal: 'Verbergen',
    },
  },
  settings: {
    language: {
      label: 'Sprache',
      desc: 'Sprache für Menüs, Nachrichten und Handouts.',
    },
    hexLayer: {
      label: 'Hexfeld-Ebene',
      desc: 'Wo neue Hexfelder gezeichnet werden. „Auto“ versucht es mit der Vordergrundebene (über den Token) und weicht auf die Token-Ebene aus, wenn das Spiel sie nicht unterstützt.',
    },
    fillColor: {
      label: 'Füllfarbe',
      desc: 'Farbe neuer Hexfelder. Verwenden Sie rgba() für durchsichtige Hexfelder, zum Beispiel rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Randfarbe',
      desc: 'Farbe der Umrisse neuer Hexfelder.',
    },
    labelColor: {
      label: 'Beschriftungsfarbe',
      desc: 'Farbe der Nur-GM-Namensschilder auf benannten Hexfeldern.',
    },
    glimpseColor: {
      label: 'Durchsicht-Farbe',
      desc: 'Farbe, die Hexfelder annehmen, wenn sie durchsichtig werden (Aufdeckmodus „Durchsicht“). Verwenden Sie eine durchsichtige rgba()-Farbe.',
    },
    strokeWidth: {
      label: 'Randbreite',
      desc: 'Breite des Umrisses neuer Hexfelder in Pixel (0 bis 20).',
    },
    maxDistance: {
      label: 'Aufdeckungsdistanz für Hexfelder',
      desc: 'Wird beim Füllen in den Hexfeldern gespeichert, also vor dem Füllen festlegen: Spätere Änderungen wirken sich nicht auf Hexfelder aus, die bereits auf der Karte liegen. Ein Spielstein muss sich innerhalb dieser Anzahl von Hexfeldern befinden, um sie aufzudecken, egal wie weit er sehen kann; bei 0 werden sie nur aufgedeckt, wenn man sie betritt. Für Berge oder Wälder verwenden. Für keine Begrenzung leer lassen.',
    },
    revealDistance: {
      label: 'Sichtweite',
      desc: 'Wie viele Hexfelder um einen beweglichen Spielstein herum angezeigt werden (0 bis 20). 0 zeigt nur die Hexfelder an, die der Token durchquert.',
    },
    lineOfSight: {
      label: 'Sichtlinie',
      desc: 'Wenn diese Option aktiviert ist, verbergen Hexfelder, die verdeckt bleiben, etwa Berge, die mit einer Aufdeckungsdistanz für Hexfelder gefüllt wurden, die Hexfelder dahinter. Das macht nur bei einer Sichtweite von 2 oder mehr einen Unterschied.',
    },
    revealPath: {
      label: 'Entlang des Wegs aufdecken',
      desc: 'Wenn diese Option aktiviert ist, wird jedes Hexfeld, das ein Spielstein beim Ziehen durchquert (einschließlich Wegpunkte), angezeigt, nicht nur die Stelle, an der er anhält.',
    },
    revealBy: {
      label: 'Aufdeckende Token',
      desc: 'Welche Token auf der Token-Ebene Hexfelder aufdecken: Token, die von einem Spieler gesteuert werden, Token, die einen beliebigen Charakter darstellen, oder alle Token.',
    },
    revealMode: {
      label: 'Aufdeckmodus',
      desc: '„Entfernen“ entfernt Hexfelder in Sichtweite. „Durchsicht“ macht sie stattdessen durchsichtig; sie werden entfernt, sobald ein Token sie betritt.',
    },
    announce: {
      label: 'Entdeckungen ankündigen',
      desc: 'Wer sieht die Chat-Nachricht, wenn ein benannter Ort entdeckt wird?',
    },
    pingDiscoveries: {
      label: 'Entdeckungen anpingen',
      desc: 'Wenn diese Option aktiviert ist, werden Spieler an einen benannten Ort gepingt, wenn dieser entdeckt wird.',
    },
    hideCoveredTokens: {
      label: 'Verdeckte Token ausblenden',
      desc: 'Roll20 zeichnet Namen, Balken und Auren über Hexfeldern. Wenn diese Option aktiviert ist, werden der für den Spieler sichtbare Name, die Balken und die Auren von Spielsteinen unter einem abgedeckten Hexfeld ausgeschaltet und wieder eingeschaltet, wenn sie aufgedeckt werden.',
    },
  },
  status: {
    engine: 'Spiel-Engine',
    grid: 'Raster',
    layer: 'Hexfeld-Ebene',
    hexes: 'Hexfelder',
    named: 'Benannte Hexfelder',
    icons: 'Standort-Token',
    glimpsed: 'Durchsichtige Hexfelder',
    pending: 'Standorte, die auf eine Füllung warten',
    calibrated: 'Kalibriert',
    overrides: 'Seitenüberschreibungen',
    undo: 'Rückgängig möglich',
  },
  messages: {
    filled:
      'Füllen abgeschlossen. Gezeichnete Hexfelder: {created}. Neu gestaltet: {restyled}. Versteckte Standorte: {icons}.',
    revealed: 'Aufgedeckte Hexfelder: {count}.',
    revealedPage: 'Alle Hexfelder auf der Seite aufgedeckt ({count}).',
    confirmReset:
      'Alle Hexfelder aus „{page}“ ({count}) entfernen? Standort-Tokens kehren zur Token-Ebene zurück. Durch Rückgängigmachen kann dies nicht rückgängig gemacht werden.',
    resetPage: 'Von der Seite entfernte Hexfelder: {count}.',
    undone:
      'Letzte Füllung rückgängig gemacht. Entfernte Hexfelder: {removed}. Neu gestaltete Hexfelder wiederhergestellt: {restored}.',
    named: 'Hexfelder mit dem Namen „{name}“: {count}.',
    unnamed: 'Gelöschte Namen: {count}.',
    marked:
      'In vorhandenen Hexfeldern versteckte Orte: {attached}. Warten auf die nächste Füllung, die sie abdeckt: {pending}.',
    unmarked: 'Token, die keine Standorte mehr sind: {count}.',
    settingChanged: '{setting} wird auf {value} gesetzt.',
    rescanned:
      'Erneuter Scan abgeschlossen. Behalten: {kept}. Übernommen: {adopted}. Neu zugeordnet: {moved}. Fehlend und vergessen: {dropped}. Neu verknüpfte Beschriftungen: {labels}. Neu verknüpfte Standort-Token: {icons}.',
    calibrated:
      'Raster kalibriert (Spaltenschritt {colStep}px, Zeilenschritt {rowStep}px). Erneut scannen: beibehalten {kept}, neu zugeordnet {moved}, übernommen {adopted}.',
    calibrationReset:
      'Kalibrierung entfernt. Erneut scannen: beibehalten {kept}, neu zugeordnet {moved}, übernommen {adopted}.',
    journalRebuilt: 'Die Handouts „{help}“ und „{deck}“ wurden neu erstellt.',
    migrated:
      'Ihre Hexploration-1.x-Hexkarten wurden aktualisiert. Wenn dieses Spiel aus einem Legacy-Spiel kopiert wurde, führen Sie auf jeder Hexkartenseite „Erneut scannen“ aus.',
    pruned:
      'Gespeicherte Hexfelder, die nicht mehr existieren und vergessen wurden: {dropped}. Wenn dieses Spiel oder diese Seite kopiert wurde, führen Sie auf der Seite „Erneut scannen“ aus, um ihre Hexfelder wieder zu erfassen.',
    readyHint:
      'Geben Sie !hexploration ein, um das Menü aufzurufen, oder öffnen Sie das Handout "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Dieses Spiel unterstützt das Zeichnen auf der Vordergrundebene nicht, daher wurden Hexfelder auf der Tokenebene gezeichnet.',
    someFailed:
      'Hexfelder, die nicht gezeichnet werden konnten: {count}. Weitere Informationen finden Sie in der API-Konsole.',
  },
  errors: {
    noPage: 'Die Seite, an der gearbeitet werden soll, konnte nicht gefunden werden.',
    notHex: 'Diese Seite verwendet kein Hex-Raster.',
    noPolygons: 'Wählen Sie eine oder mehrere gezeichnete Formen zum Füllen aus.',
    emptyArea: 'Der ausgewählte Bereich enthält keine Hexfeld-Mittelpunkte.',
    tooMany: 'Das würde zu viele Hexfelder auf einmal erzeugen ({count}).',
    nothingToConceal:
      'Wählen Sie gezeichnete Formen oder Spielsteine aus, die Sie verbergen möchten.',
    nothingToReveal:
      'Wählen Sie Hexfelder, gezeichnete Formen oder Spielsteine aus, die Sie aufdecken möchten.',
    noTokens: 'Wählen Sie zunächst einen oder mehrere Token aus.',
    noHexes:
      'Wählen Sie zunächst ein oder mehrere Hexfelder (oder darauf stehende Spielsteine) aus.',
    nothingToUndo: 'Es gibt keine Füllung, die rückgängig gemacht werden könnte.',
    unknownCommand: 'Unbekannter Befehl: {command}',
    unknownSetting: 'Unbekannte Einstellung: {key}',
    unknownPageSetting: 'Einstellungen, die pro Seite festgelegt werden können: {keys}',
    invalidValue: '„{value}“ ist kein gültiger Wert für {key}.',
    calibrateNeedsTokens:
      'Wählen Sie ein oder zwei Token aus, die an Hexfeld-Mittelpunkten eingerastet sind.',
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
      'Hexfelder liegen auf der Vordergrund- oder Token-Ebene. Wechseln Sie zu dieser Ebene, um sie auszuwählen.',
    unknownCommand: 'Geben Sie !hexploration help ein, um die Befehle aufzulisten.',
    unknownSetting: 'Geben Sie !hexploration set ein, um alle Einstellungen anzuzeigen.',
    calibrateNeedsTokens:
      'Rasten Sie einen Spielstein in der Mitte eines Hexfelds ein und wählen Sie ihn aus. Wählen Sie ein zweites Token aus, das an einem benachbarten Hexfeld in derselben Zeile (Hex V) oder Spalte (Hex H) eingerastet ist, um auch die Hexfeldgröße zu korrigieren.',
    calibrateFailed:
      'Zwei Spielsteine müssen sich in derselben Reihe (Hex V) oder derselben Spalte (Hex H) befinden und mindestens ein Hexfeld voneinander entfernt sein.',
    unexpected: 'Details finden Sie im API-Konsolenprotokoll.',
  },
  help: {
    menu: 'Zeigen Sie das Menü an.',
    fill: 'Decken Sie die ausgewählten gezeichneten Formen mit Hexfeldern ab.',
    fillInverse: 'Bedecken Sie die gesamte Seite mit Ausnahme der ausgewählten Formen.',
    undo: 'Machen Sie die letzte Füllung, umgekehrte Füllung oder Verbergung rückgängig und stellen Sie die dabei verwendeten Formen wieder her.',
    reveal:
      'Zeigt die ausgewählten Hexfelder und die Hexfelder unter den ausgewählten Formen und Spielsteinen an.',
    revealPage: 'Decken Sie alle Hexfelder auf der Seite ohne Ankündigungen auf.',
    conceal:
      'Decken Sie den Bereich unter den ausgewählten Formen und Spielsteinen erneut mit Hexfeldern ab.',
    explore:
      'Decken Sie die Umgebung der ausgewählten Spielsteine auf, als ob sie sich gerade dorthin bewegt hätten.',
    resetPage: 'Entfernen Sie alle Hexfelder auf der Seite (mit Rückfrage).',
    name: 'Benennen Sie die ausgewählten Hexfelder oder die Hexfelder unter den ausgewählten Spielsteinen. Lassen Sie den Namen leer, um ihn zu löschen.',
    mark: 'Verwandeln Sie die ausgewählten Spielsteine in versteckte Orte.',
    unmark: 'Verhindern Sie, dass die ausgewählten Token versteckte Orte sind.',
    set: 'Ändern Sie eine Einstellung oder zeigen Sie alle Einstellungen an.',
    pageSet: 'Überschreiben Sie eine Aufdeck-Einstellung nur auf der aktuellen Seite.',
    pageClear: 'Entfernen Sie die Überschreibungen der aktuellen Seite.',
    rescan:
      'Erstellen Sie die Hexfeldliste der Seite neu, beispielsweise nach dem Kopieren einer Seite oder eines Spiels.',
    calibrate:
      'Richten Sie das Hexfeld-Raster an einem oder zwei ausgewählten Spielsteinen aus, die an Hexfeld-Mittelpunkten eingerastet sind.',
    calibrateReset: 'Entfernen Sie die Kalibrierung der aktuellen Seite.',
    status: 'Zeigen Sie, was Hexploration über die aktuelle Seite weiß.',
    journal: 'Erstellen Sie die Handouts Help und Command Deck neu.',
    help: 'Diese Liste anzeigen.',
    handout: 'Vollständige Anweisungen finden Sie im Handout „{name}“.',
  },
  deck: {
    drawDesc:
      'Zeichnen Sie Formen um einen Bereich, wählen Sie sie aus und füllen Sie sie dann. „Füllung rückgängig machen“ macht die letzte Füllung rückgängig.',
    revealDesc:
      'Wählen Sie Hexfelder, Formen oder Token aus, um sie aufzudecken oder wieder zu verdecken. „Erkunden“ deckt die Umgebung ausgewählter Token auf, als hätten sie sich bewegt.',
    locationsDesc:
      'Wählen Sie Spielsteine aus, um sie als Standorte unter Hexfeldern zu verbergen. Wählen Sie Hexfelder oder Token aus, um einem Hexfeld einen Namen zu geben.',
    toolsDesc:
      'Einstellungen, Seitenüberschreibungen, Status, erneutes Scannen kopierter Seiten und Kalibrieren des Rasters.',
    footer: 'Vollständige Anweisungen finden Sie im Handout „{help}“.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Erkundung Hexfeld für Hexfeld in Roll20',
    footer: 'Verwenden Sie das Handout „{deck}“ für Ein-Klick-Steuerungen.',
    overview: {
      heading: 'Überblick',
      body: 'Hexploration deckt eine Hexfeldkarte mit undurchsichtigen Hexfeldern ab. Während sich die Gruppe bewegt, werden die Hexfelder, die sie durchquert (und, wenn Sie möchten, die Hexfelder um sie herum), entfernt, sodass die Karte Hexfeld für Hexfeld freigelegt wird. Versteckte Orte können unter Hexfeldern platziert werden und werden bekannt gegeben, wenn sie gefunden werden. Es funktioniert in Jumpgate- und Legacy-Spielen, auf Hex (V)- und Hex (H)-Rastern jeder Größe.',
      demo: 'Sehen Sie sich eine kurze Demo an (ab Version 1)',
    },
    quickStart: {
      heading: 'Schnellstart',
      steps: [
        'Öffnen Sie eine Seite, deren Raster auf Hex (V) oder Hex (H) eingestellt ist.',
        'Zeichnen Sie eine oder mehrere Formen (Polygon, Rechteck, Ellipse oder Freihand) um den auszublendenden Bereich.',
        'Wählen Sie die Formen aus und klicken Sie im Command Deck auf Füllen (oder geben Sie !hexploration fill ein). Die Formen werden durch Hexfelder ersetzt.',
        'Optional: Wählen Sie vor dem Füllen Token für wichtige Orte aus und klicken Sie auf „Standort markieren“. Sie werden unter den Hexfeldern versteckt und bei ihrer Entdeckung angekündigt.',
        'Bewegen Sie einen Spieler-Token. Jedes Hexfeld, das er durchquert, und die Hexfelder innerhalb seiner Sichtweite werden aufgedeckt.',
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
      heading: 'Wie das Aufdecken funktioniert',
      points: [
        'Nur Token auf der Token-Ebene decken Hexfelder auf. Welche Token zählen, legt „Aufdeckende Token“ fest: standardmäßig Spieler-Token, sodass der GM Monster bewegen kann, ohne die Karte aufzudecken.',
        'Ein Token deckt jedes Hexfeld auf, das er bedeckt (große Token bedecken mehrere), und bei aktiviertem „Entlang des Wegs aufdecken“ jedes Hexfeld auf der Route, entlang der er gezogen wurde, einschließlich Wegpunkten.',
        '„Sichtweite“ deckt die Hexfelder um jedes dieser Hexfelder auf, die nächstgelegenen zuerst. Ist „Sichtlinie“ aktiviert, wird ein Hexfeld nicht aufgedeckt, solange ein verdecktes Hexfeld zwischen ihm und dem Token liegt. Nähere Hexfelder werden meist zuerst aufgedeckt, daher ändert „Sichtlinie“ in offenem Gelände nichts: Sie spielt nur bei einer „Sichtweite“ von 2 oder mehr und bei Hexfeldern eine Rolle, die verdeckt bleiben, etwa Gelände, das mit einer „Aufdeckungsdistanz für Hexfelder“ gefüllt wurde.',
        '„Aufdeckungsdistanz für Hexfelder“ wird beim Füllen in jedem Hexfeld gespeichert, legen Sie sie also vor dem Füllen fest; spätere Änderungen wirken sich nicht auf Hexfelder aus, die bereits auf der Karte liegen. Ein Token muss sich innerhalb so vieler Hexfelder befinden, um sie aufzudecken, egal wie weit es sehen kann, und bei 0 werden sie nur aufgedeckt, wenn man sie betritt. Für eine Bergkette: Setzen Sie „Aufdeckungsdistanz für Hexfelder“ auf 0, füllen Sie die Berge, setzen Sie den Wert wieder auf „keine“ zurück und füllen Sie dann das Land dahinter. Mit „Sichtweite“ 3 und aktivierter „Sichtlinie“ sieht die Gruppe das offene Gelände um sich herum, aber weder die Berge noch das, was dahinter liegt. Jedes Berg-Hexfeld wird aufgedeckt, wenn ein Token es betritt.',
        'Im Modus „Durchsicht“ werden Hexfelder in Sichtweite durchsichtig, statt zu verschwinden, und werden entfernt, sobald ein Token sie betritt. Durchsichtige Hexfelder blockieren die „Sichtlinie“ nicht.',
        'Roll20 zeichnet Token-Namen, Leisten und Auren über den Hexfeldern. Ist „Verdeckte Token ausblenden“ aktiviert, werden bei einem Token unter einem verdeckten Hexfeld der für Spieler sichtbare Name, die Leisten und die Auren ausgeschaltet, bis er aufgedeckt wird, damit versteckte Monster sich nicht verraten. Schalten Sie eines davon ein, während der Token verdeckt ist, bleibt es verborgen und wird eingeschaltet, sobald der Token aufgedeckt wird.',
        'Die API meldet keine Bewegungen anderer Mods. TokenMod-Bewegungen werden automatisch übernommen; Wählen Sie für andere Mods die Token aus und klicken Sie auf „Erkunden“ oder rufen Sie Hexploration.revealAround(token) von Ihrem eigenen Mod aus auf.',
      ],
    },
    locations: {
      heading: 'Benannte Hexfelder und Orte',
      points: [
        '„Standort markieren“ verwandelt die ausgewählten Token in versteckte Standorte. Ein Token, der bereits unter einem Hexfeld liegt, wird sofort versteckt; andernfalls wird er von der nächsten Füllung versteckt, die ihn bedeckt.',
        'Token mit der Statusmarkierung „Weißer Turm“ werden beim Ausfüllen ebenfalls als Orte behandelt, wie in Version 1.',
        'Versteckte Standortmarker werden auf die GM-Ebene verschoben. Wenn ihr Hexfeld aufgedeckt wird, kehren sie mit angezeigtem Namen zur Spielsteinebene zurück und ihre Entdeckung wird bekannt gegeben.',
        '„Hexfeld benennen“ gibt einem Hexfeld einen Namen ohne Token. Der Name wird dem GM als Beschriftung auf der GM-Ebene angezeigt und angekündigt, wenn das Hexfeld aufgedeckt wird. Jumpgate zeichnet die GM-Ebene unterhalb der Vordergrundebene, daher sind die Beschriftungen in Jumpgate nur sichtbar, wenn „Hexfeld-Ebene“ auf die Token-Ebene gesetzt ist.',
        '„Entdeckungen ankündigen“ legt fest, ob alle, nur der GM oder niemand die Ankündigung sieht. „Entdeckungen anpingen“ verschiebt außerdem die Ansicht der Spieler zum Standort.',
      ],
    },
    settings: {
      heading: 'Einstellungen',
      intro:
        'Ändern Sie Einstellungen mit !hexploration set (oder über die Schaltfläche „Einstellungen“). „Hexfeld-Ebene“, „Aufdeckende Token“ und „Sprache“ lassen sich auch auf der Einstellungsseite des Mods festlegen.',
      colKey: 'Schlüssel',
      colName: 'Einstellung',
      colDesc: 'Beschreibung',
      perPage: '(Kann pro Seite eingestellt werden.)',
    },
    jumpgate: {
      heading: 'Jumpgate und Legacy',
      points: [
        'Hexploration ermittelt, welche Engine das Spiel verwendet, und zeichnet die passende Form. In beiden Editoren gezeichnete Formen können gefüllt werden.',
        'Ist „Hexfeld-Ebene“ auf „Auto“ gesetzt, werden Hexfelder auf der Vordergrundebene über den Token gezeichnet, sodass Spieler nicht sehen können, was darunter liegt. Ist die Vordergrundebene nicht verfügbar, wird stattdessen die Token-Ebene verwendet.',
        'Jumpgate zeichnet mathematisch regelmäßige Hexfelder, deren Form leicht von Legacy-Hexfeldern abweicht. Wenn die Hexfelder nicht mit dem Raster einer Seite übereinstimmen, rasten Sie einen Token in der Mitte eines Hexfelds ein, wählen Sie ihn aus und klicken Sie auf „Kalibrieren“. Wählen Sie zwei Token in benachbarten Hexfeldern derselben Zeile (Hex V) oder Spalte (Hex H) aus, um auch die Hexfeldgröße zu korrigieren.',
        'Wenn eine Seite oder ein Spiel kopiert wird, erhalten ihre Hexfelder neue IDs. Führen Sie auf der Seite „Erneut scannen“ aus, um sie zusammen mit ihren Namensbeschriftungen und Standort-Token wieder zu erfassen.',
      ],
    },
    upgrading: {
      heading: 'Upgrade von Version 1',
      points: [
        'Version 2 benötigt PathMath, MatrixMath, Vector Math oder HTML Builder nicht mehr. Sie können sie entfernen, es sei denn, ein anderer Mod verwendet sie.',
        'Vorhandene Hexkarten, Namen, Standort-Tokens und Einstellungen werden beim ersten Start automatisch aktualisiert.',
        'Die Befehle der Version 1, einschließlich des Hexploration_menu-Makros, funktionieren weiterhin.',
        'In Version 1 konnte jeder Token, der einen Charakter darstellt, Hexfelder aufdecken. Setzen Sie „Aufdeckende Token“ auf „Charaktertoken“, um dieses Verhalten beizubehalten.',
      ],
      colV1: 'Befehl der Version 1',
      colV2: 'Befehl der Version 2',
    },
    troubleshooting: {
      heading: 'Fehlerbehebung',
      points: [
        'Nichts passiert, wenn sich ein Token bewegt: Prüfen Sie, ob der Token auf der Token-Ebene liegt und zu „Aufdeckende Token“ passt und ob die Seite Hexfelder hat (!hexploration status).',
        'Hexfelder sind gegenüber dem Raster versetzt: Verwenden Sie „Kalibrieren“ und prüfen Sie dann mit einem Token einige Hexfelder auf der Karte.',
        'Hexfelder werden nach dem Kopieren einer Seite oder eines Spiels nicht mehr aufgedeckt: Führen Sie auf der Seite „Erneut scannen“ aus.',
        '„Füllen“ meldet, dass der Bereich keine Hexfeld-Mittelpunkte enthält: Die Form muss den Mittelpunkt von mindestens einem Hexfeld enthalten.',
        'Überprüfen Sie für alles andere das API-Konsolenprotokoll und geben Sie die entsprechenden Meldungen an, wenn Sie um Hilfe bitten.',
      ],
    },
    languages: {
      heading: 'Sprachen',
      body: 'Wählen Sie eine Sprache mit !hexploration set language. Verfügbare Sprachen:',
      colLanguage: 'Sprache',
      colNative: 'Eigenbezeichnung',
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
