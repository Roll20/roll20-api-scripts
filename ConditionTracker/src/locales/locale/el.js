const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "αρπαγμένος",
      verb: "αρπάζει",
    },
    Restrained: {
      past: "περιορισμένος",
      verb: "περιορίζει",
    },
    Prone: {
      past: "πεσμένος πρηνηδόν",
      verb: "ρίχνει",
      suffix: "πρηνηδόν",
    },
    Poisoned: {
      past: "δηλητηριασμένος",
      verb: "δηλητηριάζει",
    },
    Stunned: {
      past: "ζαλισμένος",
      verb: "ζαλίζει",
    },
    Blinded: {
      past: "τυφλωμένος",
      verb: "τυφλώνει",
    },
    Charmed: {
      past: "γοητευμένος",
      verb: "γοητεύει",
    },
    Frightened: {
      past: "φοβισμένος",
      verb: "φοβίζει",
    },
    Incapacitated: {
      past: "ανίκανος",
      verb: "καθιστά",
      suffix: "ανίκανο",
    },
    Invisible: {
      past: "αόρατος",
      verb: "καθιστά",
      suffix: "αόρατο",
    },
    Paralyzed: {
      past: "παραλυμένος",
      verb: "παραλύει",
    },
    Petrified: {
      past: "πετρωμένος",
      verb: "πετρώνει",
    },
    Unconscious: {
      past: "αναίσθητος",
      verb: "καθιστά",
      suffix: "αναίσθητο",
    },
    Spell: {
      past: "υπό επίδραση ξορκιού",
      verb: "ρίχνει ξόρκι σε",
    },
    Ability: {
      past: "υπό επίδραση ικανότητας",
      verb: "χρησιμοποιεί ικανότητα σε",
    },
    Advantage: {
      past: "έχει πλεονέκτημα",
      verb: "δίνει πλεονέκτημα σε",
      noBy: true,
    },
    Disadvantage: {
      past: "έχει μειονέκτημα",
      verb: "επιβάλλει μειονέκτημα σε",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Αρπαγμένος",
    Restrained: "Περιορισμένος",
    Prone: "Πρηνής",
    Poisoned: "Δηλητηριασμένος",
    Stunned: "Ζαλισμένος",
    Blinded: "Τυφλωμένος",
    Charmed: "Γοητευμένος",
    Frightened: "Φοβισμένος",
    Incapacitated: "Ανίκανος",
    Invisible: "Αόρατος",
    Paralyzed: "Παραλυμένος",
    Petrified: "Πετρωμένος",
    Unconscious: "Αναίσθητος",
    Spell: "Ξόρκι",
    Ability: "Ικανότητα",
    Advantage: "Πλεονέκτημα",
    Disadvantage: "Μειονέκτημα",
    Other: "Άλλο",
  },
  templates: {
    display: {
      custom: "{emoji} {target} υπό επίδραση {effect} ({source})",
      advantage: "{emoji} {source} έχει πλεονέκτημα εναντίον {target}{subject}",
      disadvantage:
        "{emoji} {source} έχει μειονέκτημα εναντίον {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} είναι {past}",
      standard: "{emoji} {target} {past} από {source}",
    },
    apply: {
      custom: "{source} εφαρμόζει {effect} στον {target}.",
      advantage: "{source} έχει πλεονέκτημα εναντίον {target}{subject}.",
      disadvantage: "{source} έχει μειονέκτημα εναντίον {target}{subject}.",
      self: "{target} είναι {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} δεν επηρεάζεται πλέον από {effect}.",
      advantage:
        "{source} δεν έχει πλέον πλεονέκτημα εναντίον {target}{subject}.",
      disadvantage:
        "{source} δεν έχει πλέον μειονέκτημα εναντίον {target}{subject}.",
      noBy: "{target} δεν είναι πλέον {past}.",
      self: "{target} δεν είναι πλέον {past}.",
      standard: "{target} δεν είναι πλέον {past} από {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Επιλογή Κατάστασης",
      selectSource: "Επιλογή Token Πηγής",
      selectTarget: "Επιλογή Token Στόχου",
      selectSubject: "Επιλογή Υποκειμένου",
      selectDuration: "Επιλογή Διάρκειας",
      confirmTargetTitle: "Επιβεβαίωση Λίστας Στόχων",
      applyEffectTitle: "Εφαρμογή Εφέ {condition}",
      noTokens: "Δεν βρέθηκαν ονομαστά tokens στην ενεργή σελίδα.",
      confirmIntro: "Τα παρακάτω tokens θα λάβουν την κατάσταση:",
      confirmBtn: "Επιβεβαίωση λίστας στόχων",
      enterDetails: "Εισαγωγή λεπτομερειών εφέ",
      noneBtn: "Κανένα",
      noneOrSourceBtn: "Κανένα ή εφαρμογή στην πηγή",
      subjectDesc: "Επιλέξτε ποιος ή τι παράγει το εφέ.",
      sourceDesc:
        "Επιλέξτε το πλάσμα που δημιουργεί ή παράγει την κατάσταση ή το εφέ.",
      targetDesc: "Επιλέξτε το πλάσμα που θα λάβει την κατάσταση ή το εφέ.",
      otherText: "Προσαρμοσμένο κείμενο κατάστασης",
      effectDetails: "Λεπτομέρειες {condition}",
    },
    col: {
      players: "Παίκτες",
      npcs: "ΜΠΧ",
      conditions: "Καταστάσεις",
      customEffects: "Προσαρμοσμένα Εφέ",
      permanentTurnEnd: "Μόνιμο / Τέλος Γύρου",
      rounds: "Γύροι",
      command: "Εντολή",
      result: "Αποτέλεσμα",
      field: "Πεδίο",
      value: "Τιμή",
      option: "Επιλογή",
      condition: "Κατάσταση",
      marker: "Δείκτης",
      item: "Στοιχείο",
      removed: "Αφαιρέθηκε",
      details: "Λεπτομέρειες",
      description: "Περιγραφή",
      scenario: "Σενάριο",
    },
    dur: {
      untilRemoved: "Μέχρι αφαίρεσης",
      endOfTargetTurn: "Τέλος επόμενης σειράς στόχου",
      endOfSourceTurn: "Τέλος επόμενης σειράς πηγής",
      round1: "1 γύρος",
      round2: "2 γύροι",
      round3: "3 γύροι",
      round10: "10 γύροι",
      custom: "Προσαρμοσμένο",
      customPrompt: "Αριθμός γύρων",
      untilRemovedDisplay: "Μέχρι αφαίρεσης",
      turnsRemaining: "{n} εναπομείναντα τέλη σειράς",
    },
    btn: {
      openWizard: "Άνοιγμα Οδηγού",
      openMultiTarget: "Άνοιγμα Οδηγού Πολλών Στόχων",
      openRemovalList: "Άνοιγμα Λίστας Αφαίρεσης",
      showConfig: "Εμφάνιση Ρυθμίσεων",
      runCleanup: "Εκτέλεση Εκκαθάρισης",
      reinstallMacro: "Επανεγκατάσταση Macro",
      reinstallHandout: "Επανεγκατάσταση Handout",
      showHelp: "Εμφάνιση Βοήθειας",
      reorderConditions: "Αναδιάταξη Σειρών Κατάστασης",
    },
    title: {
      menu: "Μενού",
      removalMenu: "Condition Tracker — Αφαίρεση",
      config: "Ρυθμίσεις",
      configTracker: "Condition Tracker — Ρυθμίσεις",
      help: "Βοήθεια",
      applied: "Εφαρμόστηκε",
      removed: "Κατάσταση Αφαιρέθηκε",
      cleanup: "Εκκαθάριση Ολοκληρώθηκε",
      macroReinstalled: "Το Macro Επανεγκαταστάθηκε",
      handoutReinstalled: "Το Handout Επανεγκαταστάθηκε",
      warning: "Προειδοποίηση",
      error: "Σφάλμα",
      turnOrder: "Σειρά Πρωτοβουλίας",
      noConditions: "Καμία Κατάσταση",
      tokenMoved: "Το Token Μετακινήθηκε",
      markedDead: "Σημειώθηκε ως Νεκρός",
      zeroHp: "{name} — 0 ΒΖ",
      moveToken: "{name} — Μετακίνηση Token;",
      scriptReady: "Το Script Είναι Έτοιμο",
      conditionReorder: "Η Σειρά Πρωτοβουλίας Άλλαξε",
    },
    heading: {
      quickActions: "Γρήγορες Ενέργειες",
      settings: "Ρυθμίσεις",
      markerMappings: "Αντιστοιχίσεις Δεικτών",
      result: "Αποτέλεσμα",
      info: "Πληροφορίες",
      commandOptions: "Επιλογές Εντολών",
      promptUi: "Διεπαφή Οδηγού",
      examples: "Παραδείγματα",
      summary: "Σύνοψη",
    },
    msg: {
      noActive: "Δεν παρακολουθούνται ενεργές καταστάσεις.",
      configReset: "Οι ρυθμίσεις επαναφέρθηκαν στις προεπιλογές.",
      unknownConfig:
        "Άγνωστη επιλογή ρύθμισης. Χρησιμοποιήστε --config για να δείτε τις υποστηριζόμενες ρυθμίσεις.",
      macroReinstalled:
        "Τα macros {wizard} και {multiTarget} επανεγκαταστάθηκαν για όλους τους τρέχοντες παίκτες-DM.",
      handoutReinstalled: "Το handout βοήθειας {handout} επανεγκαταστάθηκε.",
      duplicate:
        "Αυτός ακριβώς ο συνδυασμός πηγής, υποκειμένου, στόχου, κατάστασης και προσαρμοσμένου κειμένου είναι ήδη ενεργός.",
      noTargets: "Δεν ορίστηκαν tokens-στόχοι για πολλαπλή εφαρμογή.",
      noSelection:
        "Επιλέξτε τουλάχιστον ένα token στο ταμπλό πριν χρησιμοποιήσετε --multi-target.",
      invalidIds: "Δεν βρέθηκαν έγκυρα IDs tokens στην τρέχουσα επιλογή.",
      reSelectTokens:
        "Κανένα από τα αρχικά επιλεγμένα tokens δεν βρέθηκε. Επαναλάβετε την επιλογή tokens και προσπαθήστε ξανά.",
      conditionNotFound: "Το ID κατάστασης δεν βρέθηκε.",
      gmOnly: "Οι εντολές Condition Tracker είναι αποκλειστικά για DM.",
      commandFailed:
        "Η εντολή δεν μπόρεσε να ολοκληρωθεί με ασφάλεια. Ελέγξτε την κονσόλα API για λεπτομέρειες.",
      sourceTokenNotFound: "Το token πηγής δεν βρέθηκε.",
      targetTokenNotFound: "Το token στόχου δεν βρέθηκε.",
      subjectTokenNotFound: "Το token υποκειμένου δεν βρέθηκε.",
      invalidCondition:
        "Η κατάσταση πρέπει να είναι μία από τις προκαθορισμένες καταστάσεις ή Άλλο.",
      subjectOnlyCustom:
        "--subject ισχύει μόνο για Ξόρκι, Ικανότητα, Πλεονέκτημα, Μειονέκτημα και Άλλο.",
      subjectBypassInvalid:
        "--subjectPromptBypass αναμένει true ή false όταν παρέχεται τιμή.",
      customDetailsRequired:
        "Απαιτούνται λεπτομέρειες για {condition}. Χρησιμοποιήστε --other για να τις δώσετε.",
      markerConfigFormat:
        "Μορφή ρύθμισης δείκτη: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Η ρύθμιση δείκτη απαιτεί προκαθορισμένο όνομα κατάστασης.",
      markerNameRequired: "Η ρύθμιση δείκτη απαιτεί μη κενό όνομα δείκτη.",
      markerSet: "Ο δείκτης για {condition} ορίστηκε σε {marker}.",
      healthBarSet: "Η μπάρα υγείας ορίστηκε σε {bar}.",
      boolSet: "Το {key} ορίστηκε σε {value}.",
      expectedBoolean: "Αναμένεται true ή false.",
      invalidHealthBar:
        "Η μπάρα υγείας πρέπει να είναι bar1_value, bar2_value ή bar3_value.",
      markersDisabled: "Οι δείκτες είναι απενεργοποιημένοι.",
      noMarkerConfigured: "Δεν έχει ρυθμιστεί δείκτης για αυτήν την κατάσταση.",
      markerApplied: "Ο δείκτης εφαρμόστηκε: {marker}",
      markerPresent: "Ο δείκτης υπάρχει ήδη: {marker}",
      langSet: "Η γλώσσα ορίστηκε σε {locale}.",
      invalidLocale: "Μη έγκυρη locale. Υποστηριζόμενες locales: {locales}.",
      otherDurationRequiresRounds:
        "Η προσαρμοσμένη διάρκεια απαιτεί αριθμητικό πλήθος γύρων, π.χ. --duration 5 rounds.",
      invalidDuration:
        "Η διάρκεια πρέπει να είναι Μέχρι αφαίρεσης, επιλογή τέλους σειράς ή θετικός αριθμός γύρων.",
      zeroHpNoConditions:
        "{name} έφτασε στα 0 ΒΖ και δεν έχει ενεργές καταστάσεις.",
      zeroHpConditions:
        "{name} έφτασε στα 0 ΒΖ. Επιλέξτε καταστάσεις για αφαίρεση:",
      removeAllBtn: "Αφαίρεση Όλων των Καταστάσεων για τον {name}",
      markIncapacitated: "Σήμανση ως Ανίκανος",
      removeFromTurnOrder: "Αφαίρεση από τη Σειρά Πρωτοβουλίας",
      alreadyIncapacitated: "{name} είναι ήδη Ανίκανος.",
      tokenRemovedFromTurn: "{name} αφαιρέθηκε από τη σειρά πρωτοβουλίας.",
      tokenNotInTurn: "{name} δεν βρέθηκε στη σειρά πρωτοβουλίας.",
      moveTokenPrompt:
        "Μετακίνηση του {name} στο επίπεδο χάρτη ώστε να παραμένει ορατό χωρίς να παρεμβάλλεται με άλλα tokens;",
      moveTokenBtn: "Μετακίνηση {name} στο Επίπεδο Χάρτη",
      tokenMoved: "{name} μετακινήθηκε στο επίπεδο χάρτη.",
      tokenNotFound: "Το token δεν βρέθηκε.",
      noActiveConditions: "{name} δεν έχει ενεργές καταστάσεις για αφαίρεση.",
      deadNoConditions:
        "{name} σημειώθηκε ως νεκρός. Δεν υπήρχαν ενεργές καταστάσεις.",
      scriptReady: "{name} είναι ενεργό και χρησιμοποιείτε έκδοση {version}.",
      reachedZeroHp: "{name} έφτασε στα 0 ΒΖ",
      manuallyRemoved: "αφαιρέθηκε χειροκίνητα",
      durationExpired: "η διάρκεια έληξε",
      markedAsDead: "{name} σημειώθηκε ως νεκρός",
      conditionReorder:
        "Η σειρά πρωτοβουλίας άλλαξε και {count} παρακολουθούμενη/ες σειρά/ές κατάστασης μπορεί να είναι εκτός θέσης. Κάντε κλικ παρακάτω για να τις επαναφέρετε μετά τα αντίστοιχα tokens.",
      conditionsReordered:
        "Οι σειρές κατάστασης επανατοποθετήθηκαν μετά τα αντίστοιχα tokens.",
    },
    removal: {
      conditionField: "Κατάσταση",
      reasonField: "Αιτία",
      turnRowField: "Σειρά Turn Tracker",
      markerField: "Δείκτης",
      notConfigured: "Μη ρυθμισμένο",
      markerRemoved: "Αφαιρέθηκε ({marker})",
      markerRetained: "Διατηρήθηκε ({marker})",
      rowRemoved: "Αφαιρέθηκε",
      rowMissing: "Ήδη απούσα",
      manualReason: "Χειροκίνητη αφαίρεση",
    },
    cleanup: {
      orphaned: "Ορφανές καταχωρήσεις κατάστασης",
      stale: "Παλιές καταχωρήσεις κατάστασης",
      orphanedRows: "Ορφανές σειρές Turn Tracker",
      unusedMarkers: "Αχρησιμοποίητοι δείκτες",
    },
    apply: {
      turnAppended:
        "Ο στόχος δεν ήταν στη σειρά πρωτοβουλίας· η σειρά κατάστασης προστέθηκε στο τέλος.",
      turnInserted: "Η σειρά κατάστασης εισήχθη κάτω από το token στόχου.",
    },
  },
  handout: {
    versionLabel: "Έκδοση",
    subtitle: "Διαχειριστής Καταστάσεων D&D 5e",
    footerNote:
      "Αυτό το handout δημιουργείται και ενημερώνεται αυτόματα κάθε φορά που φορτώνει το script.",
    overview: {
      heading: "Επισκόπηση",
      body: "Το Condition Tracker διαχειρίζεται καταστάσεις D&D 5e και προσαρμοσμένα εφέ ως επονομαζόμενες σειρές στον Turn Tracker του Roll20. Εφαρμόστε καταστάσεις σε tokens, παρακολουθήστε διάρκειες κατά σειρά πρωτοβουλίας και αφαιρέστε αυτόματα τα εφέ που έληξαν όταν τελειώνει μια σειρά. Όλες οι εντολές είναι αποκλειστικά για DM και μπορούν να εκτελεστούν από το chat ή μέσω των εγκατεστημένων macros.",
    },
    quickStart: {
      heading: "Γρήγορη Έναρξη",
      colCommand: "Εντολή",
      colDesc: "Περιγραφή",
      rows: [
        [
          "!condition-tracker --prompt",
          "Οδηγός βήμα-βήμα — επιλέξτε κατάσταση, tokens και διάρκεια διαδραστικά. Διατίθεται επίσης ως macro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Εφαρμογή μιας κατάστασης σε πολλά tokens ταυτόχρονα. Διατίθεται επίσης ως macro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Άνοιγμα του κύριου μενού διαχείρισης με κουμπιά για εφαρμογή, εξέταση ή αφαίρεση καταστάσεων.",
        ],
      ],
    },
    commandsRef: {
      heading: "Αναφορά Εντολών",
      colFlag: "Σημαία",
      colDesc: "Περιγραφή",
      rows: [
        ["--prompt", "Διαδραστικός οδηγός βήμα-βήμα"],
        [
          "--multi-target",
          "Εφαρμογή κατάστασης σε πολλά tokens-στόχους ταυτόχρονα",
        ],
        [
          "--menu",
          "Εμφάνιση κύριου μενού (προσθέστε remove για μενού αφαίρεσης)",
        ],
        [
          "--source X --target Y --condition Z",
          "Εφαρμογή κατάστασης απευθείας χωρίς τον οδηγό",
        ],
        [
          "--duration &lt;τιμή&gt;",
          "Διάρκεια για απευθείας εφαρμογή (π.χ. 2 rounds)",
        ],
        [
          "--other &lt;κείμενο&gt;",
          "Προσαρμοσμένο κείμενο για τύπους εφέ Ξόρκι / Ικανότητα / Άλλο",
        ],
        [
          "--remove &lt;condition-id&gt;",
          "Αφαίρεση συγκεκριμένης κατάστασης με το μοναδικό της ID",
        ],
        [
          "--config &lt;option&gt; &lt;value&gt;",
          "Προσαρμογή ρυθμίσεων (βλ. ενότητα Ρυθμίσεων παρακάτω)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Παράκαμψη subjectPromptBypass μόνο για αυτήν την εντολή (υποστηρίζεται επίσης --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Εναρμόνιση κατάστασης — αφαίρεση ορφανών καταστάσεων και σειρών Turn Tracker",
        ],
        [
          "--reorder-conditions",
          "Χειροκίνητη επανατοποθέτηση γραμμών συνθηκών μετά τα εκχωρημένα τεκμήρια στη σειρά στροφών",
        ],
        ["--reinstall-macro", "Εκ νέου δημιουργία ή ενημέρωση των GM macros"],
        [
          "--reinstall-handout",
          "Εκ νέου δημιουργία ή ενημέρωση του τοπικοποιημένου handout βοήθειας",
        ],
        [
          "--lang &lt;locale&gt;",
          "Εξαγωγή μηνυμάτων αυτής της εντολής σε πρόσθετη locale (δίγλωσση λειτουργία)",
        ],
        ["--help", "Εμφάνιση σύντομης κάρτας βοήθειας στο chat"],
      ],
    },
    standardConditions: {
      heading: "Τυπικές Καταστάσεις (D&amp;D 5e)",
      colCondition: "Κατάσταση",
    },
    customEffects: {
      heading: "Προσαρμοσμένοι Τύποι Εφέ",
      colType: "Τύπος",
      colNotes: "Σημειώσεις",
      rows: [
        [
          "🔮 Ξόρκι",
          "Παρακολούθηση ονομαστού εφέ ξορκιού — θα σας ζητηθεί το όνομα του ξορκιού",
        ],
        [
          "🎯 Ικανότητα",
          "Παρακολούθηση ονομαστής ικανότητας κλάσης ή φυλής — θα σας ζητηθεί το όνομά της",
        ],
        [
          "🍀 Πλεονέκτημα",
          "Καταγραφή πλεονεκτήματος που δόθηκε από ένα token σε άλλο· ομαδοποιείται με την πηγή στην πρωτοβουλία",
        ],
        [
          "⬇️ Μειονέκτημα",
          "Καταγραφή επιβληθέντος μειονεκτήματος· ομαδοποιείται με την πηγή στην πρωτοβουλία",
        ],
        [
          "📝 Άλλο",
          "Ελεύθερη προσαρμοσμένη ετικέτα — θα σας ζητηθεί περιγραφή",
        ],
      ],
    },
    durationOptions: {
      heading: "Επιλογές Διάρκειας",
      intro:
        "Η εναπομένουσα μέτρηση εμφανίζεται στη στήλη pr του Turn Tracker και μειώνεται όταν τελειώνει η σειρά του token-αγκύρου.",
      colOption: "Επιλογή",
      colBehaviour: "Συμπεριφορά",
      rows: [
        [
          "Μέχρι αφαίρεσης",
          "Μόνιμο — πρέπει να αφαιρεθεί χειροκίνητα μέσω του μενού ή --remove",
        ],
        [
          "Τέλος επόμενης σειράς στόχου",
          "Λήγει όταν τελειώσει η επόμενη σειρά του token-στόχου στην πρωτοβουλία",
        ],
        [
          "Τέλος επόμενης σειράς πηγής",
          "Λήγει όταν τελειώσει η επόμενη σειρά του token-πηγής στην πρωτοβουλία",
        ],
        [
          "1 / 2 / 3 / 10 γύροι",
          "Σταθερή αντίστροφη μέτρηση· μία μείωση ανά τέλος σειράς του token-αγκύρου",
        ],
      ],
    },
    configuration: {
      heading: "Ρυθμίσεις",
      intro:
        "Χρησιμοποιήστε !condition-tracker --config &lt;option&gt; &lt;value&gt; ή το κουμπί Ρυθμίσεις στο κύριο μενού.",
      colOption: "Επιλογή",
      colValues: "Τιμές",
      colDesc: "Περιγραφή",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Εφαρμογή δεικτών κατάστασης Roll20 σε tokens όταν προστίθεται κατάσταση",
        ],
        [
          "useIcons",
          "true / false",
          "Εμφάνιση σύντομων κωδικών εικονιδίων (π.χ. [G]) αντί emoji στις σειρές Turn Tracker",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Παράλειψη του προαιρετικού βήματος υποκειμένου για εφέ Ξόρκι / Ικανότητα / Άλλο",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Μπάρα token προς παρακολούθηση· όταν πέσει στο 0 ο DM ειδοποιείται να εκκαθαρίσει καταστάσεις",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Γλώσσα εξόδου για μηνύματα chat και το handout βοήθειας",
        ],
        [
          "marker",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Αντικατάσταση του δείκτη κατάστασης για συγκεκριμένη κατάσταση (π.χ. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Προεπιλεγμένοι Δείκτες Κατάστασης",
      colCondition: "Κατάσταση",
      colMarker: "Όνομα Δείκτη",
    },
    availableLocales: {
      heading: "Διαθέσιμες Μεταφράσεις",
      intro:
        "Χρησιμοποιήστε την επιλογή ρύθμισης language για να ορίσετε τα μηνύματα chat και το handout βοήθειας σε οποιαδήποτε υποστηριζόμενη locale. Σύντομα ψευδώνυμα γίνονται επίσης δεκτά για en, zh και pt.",
      colLocale: "Locale",
      colLanguage: "Γλώσσα",
      colFile: "Αρχείο Μετάφρασης",
    },
  },
};

export default TRANSLATION;
