const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "אחוז",
      verb: "אוחז ב"
    },
    Restrained: {
      past: "מרוסן",
      verb: "מרסן את"
    },
    Prone: {
      past: "שרוע",
      verb: "מפיל את",
      suffix: "למצב שרוע"
    },
    Poisoned: {
      past: "מורעל",
      verb: "מרעיל את"
    },
    Stunned: {
      past: "המום",
      verb: "מהמם את"
    },
    Blinded: {
      past: "עיוור",
      verb: "מעוור את"
    },
    Charmed: {
      past: "מוקסם",
      verb: "מקסים את"
    },
    Frightened: {
      past: "מפוחד",
      verb: "מפחיד את"
    },
    Incapacitated: {
      past: "מנוטרל",
      verb: "מנטרל את"
    },
    Invisible: {
      past: "בלתי נראה",
      verb: "הופך את",
      suffix: "לבלתי נראה"
    },
    Paralyzed: {
      past: "משותק",
      verb: "משתק את"
    },
    Petrified: {
      past: "מאובן",
      verb: "מאבן את"
    },
    Unconscious: {
      past: "חסר הכרה",
      verb: "גורם ל",
      suffix: "לאבד הכרה"
    },
    Spell: {
      past: "מושפע מלחיש",
      verb: "מטיל לחש על"
    },
    Ability: {
      past: "מושפע מיכולת",
      verb: "משתמש ביכולת על"
    },
    Advantage: {
      past: "יש יתרון",
      verb: "מעניק יתרון ל",
      noBy: true
    },
    Disadvantage: {
      past: "יש חיסרון",
      verb: "מטיל חיסרון על",
      noBy: true
    }
  },
  condNames: {
    Grappled: "אחוז",
    Restrained: "מרוסן",
    Prone: "שרוע",
    Poisoned: "מורעל",
    Stunned: "המום",
    Blinded: "עיוור",
    Charmed: "מוקסם",
    Frightened: "מפוחד",
    Incapacitated: "מנוטרל",
    Invisible: "בלתי נראה",
    Paralyzed: "משותק",
    Petrified: "מאובן",
    Unconscious: "חסר הכרה",
    Spell: "לחש",
    Ability: "יכולת",
    Advantage: "יתרון",
    Disadvantage: "חיסרון",
    Other: "אחר"
  },
  templates: {
    display: {
      custom: "{emoji} {target} מושפע מ־{effect} ({source})",
      advantage: "{emoji} ל־{source} יש יתרון נגד {target}{subject}",
      disadvantage: "{emoji} ל־{source} יש חיסרון נגד {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} {past}",
      standard: "{emoji} {target} {past} על ידי {source}"
    },
    apply: {
      custom: "{source} מחיל את {effect} על {target}.",
      advantage: "ל־{source} יש יתרון נגד {target}{subject}.",
      disadvantage: "ל־{source} יש חיסרון נגד {target}{subject}.",
      self: "{target} {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}."
    },
    remove: {
      custom: "{target} אינו מושפע עוד מ־{effect}.",
      advantage: "ל־{source} אין עוד יתרון נגד {target}{subject}.",
      disadvantage: "ל־{source} אין עוד חיסרון נגד {target}{subject}.",
      noBy: "{target} כבר לא {past}.",
      self: "{target} כבר לא {past}.",
      standard: "{target} כבר לא {past} על ידי {source}."
    }
  },
  ui: {
    wizard: {
      selectCondition: "בחר מצב",
      selectSource: "בחר אסימון מקור",
      selectTarget: "בחר אסימון יעד",
      selectSubject: "בחר נושא",
      selectDuration: "בחר משך",
      confirmTargetTitle: "אישור רשימת יעדים",
      applyEffectTitle: "החלת אפקט {condition}",
      noTokens: "לא נמצאו אסימונים בעלי שם בעמוד הפעיל.",
      confirmIntro: "האסימונים הבאים יקבלו את המצב:",
      confirmBtn: "אשר רשימת יעדים",
      enterDetails: "הזן פרטי אפקט",
      noneBtn: "ללא",
      noneOrSourceBtn: "ללא או החל על המקור",
      subjectDesc: "בחר מי או מה מספק את האפקט.",
      sourceDesc: "בחר את היצור שיוצר או מפעיל את המצב או האפקט.",
      targetDesc: "בחר את היצור שיקבל את המצב או האפקט.",
      otherText: "טקסט מצב מותאם אישית",
      effectDetails: "פרטי {condition}"
    },
    col: {
      players: "שחקנים",
      npcs: "דב״שים",
      conditions: "מצבים",
      customEffects: "אפקטים מותאמים",
      permanentTurnEnd: "קבוע / סוף תור",
      rounds: "סיבובים",
      command: "פקודה",
      result: "תוצאה",
      field: "שדה",
      value: "ערך",
      option: "אפשרות",
      condition: "מצב",
      marker: "סמן",
      item: "פריט",
      removed: "הוסר",
      details: "פרטים",
      description: "תיאור",
      scenario: "תרחיש",
      gameSystem: "מערכת משחק",
      duration: "מֶשֶׁך"
    },
    dur: {
      untilRemoved: "עד להסרה",
      endOfTargetTurn: "סוף התור הבא של היעד",
      endOfSourceTurn: "סוף התור הבא של המקור",
      round1: "סיבוב אחד",
      round2: "2 סיבובים",
      round3: "3 סיבובים",
      round10: "10 סיבובים",
      custom: "מותאם אישית",
      customPrompt: "מספר סיבובים",
      untilRemovedDisplay: "עד להסרה",
      turnsRemaining: "נותרו {n} סוף/י תור במעקב"
    },
    btn: {
      openWizard: "פתח אשף",
      openMultiTarget: "פתח אשף רב-יעדים",
      openRemovalList: "פתח רשימת הסרה",
      showConfig: "הצג הגדרות",
      runCleanup: "הרץ ניקוי",
      reinstallMacro: "התקן מאקרו מחדש",
      reinstallHandout: "התקן דף עזרה מחדש",
      showHelp: "הצג עזרה",
      reorderConditions: "סדר מחדש שורות תנאי",
      reportToken: "דיווח על תנאי אסימון",
      savedEffects: "אפקטים שמורים",
      addSavedEffect: "הוסף אפקט שמור",
      editSaved: "לַעֲרוֹך",
      removeSaved: "לְהַסִיר",
      promoteSaved: "הוסף ל-Tur Tracker",
      snoozeSaved: "נִמנוּם",
      clearSnooze: "נקה נודניק"
    },
    title: {
      menu: "תפריט",
      removalMenu: "הסרת מצבים",
      config: "הגדרות",
      configTracker: "הגדרות Condition Tracker",
      help: "עזרה",
      applied: "הוחל",
      removed: "מצב הוסר",
      cleanup: "הניקוי הושלם",
      macroReinstalled: "מאקרו הותקן מחדש",
      handoutReinstalled: "דף העזרה הותקן מחדש",
      warning: "אזהרה",
      error: "שגיאה",
      turnOrder: "סדר תורות",
      noConditions: "אין מצבים",
      tokenMoved: "אסימון הועבר",
      markedDead: "סומן כמת",
      zeroHp: "{name} — 0 נק״פ",
      moveToken: "{name} — להעביר אסימון?",
      scriptReady: "הסקריפט מוכן",
      conditionReorder: "סדר התורות השתנה",
      tokenReport: "דוח מצב אסימון",
      savedEffects: "אפקטים שמורים",
      savedAdd: "הוסף אפקט שמור",
      savedEdit: "ערוך אפקט שמור",
      savedRemoved: "אפקט שמור הוסר",
      savedPromoted: "הוסף ל-Tur Tracker",
      savedSnoozed: "התזכורת נודניק",
      savedSnoozeCleared: "נודניק נמחק",
      hiddenEffects: "אפקטים נסתרים - {name}"
    },
    heading: {
      quickActions: "פעולות מהירות",
      settings: "הגדרות",
      markerMappings: "מיפוי סמנים",
      result: "תוצאה",
      info: "מידע",
      commandOptions: "אפשרויות פקודה",
      promptUi: "ממשק אשף",
      examples: "דוגמאות",
      summary: "סיכום",
      appliedTo: "תנאים החלים על",
      appliedBy: "התנאים החלים על ידי",
      savedEffectsFor: "אפקטים שמורים עבור {name}",
      visibility: "רְאוּת",
      snoozeOptions: "תזכורת נודניק",
      promoteOptions: "קדם ל-Turn Tracker",
      editActions: "ערוך פעולות"
    },
    msg: {
      noActive: "אין מצבים פעילים במעקב.",
      configReset: "ההגדרות אופסו לברירות המחדל של המוד.",
      unknownConfig: "אפשרות הגדרה לא מוכרת. השתמש ב־--config להצגת ההגדרות הנתמכות.",
      macroReinstalled: "המאקרואים {wizard}, {multiTarget}, {reportToken}, {saved} ו־{classify} הותקנו מחדש לכל שחקני ה־GM הנוכחיים.",
      handoutReinstalled: "דף העזרה {handout} הותקן מחדש.",
      duplicate: "אותו מקור, נושא, יעד, מצב וטקסט מותאם כבר פעילים.",
      noTargets: "לא צוינו אסימוני יעד להחלה מרובת יעדים.",
      noSelection: "בחר לפחות אסימון אחד בלוח לפני שימוש ב־--multi-target.",
      invalidIds: "לא נמצאו מזהי אסימונים תקינים בבחירה הנוכחית.",
      reSelectTokens: "לא ניתן למצוא את האסימונים שנבחרו במקור. בחר אותם שוב ונסה מחדש.",
      conditionNotFound: "מזהה המצב לא נמצא.",
      gmOnly: "פקודות Condition Tracker מיועדות ל־GM בלבד.",
      commandFailed: "לא ניתן להשלים את הפקודה בבטחה. בדוק את מסוף ה־API לפרטים.",
      sourceTokenNotFound: "אסימון המקור לא נמצא.",
      targetTokenNotFound: "אסימון היעד לא נמצא.",
      subjectTokenNotFound: "אסימון הנושא לא נמצא.",
      invalidCondition: "המצב חייב להיות אחד מהמצבים המוגדרים מראש או אחר.",
      subjectOnlyCustom: "--subject תקף רק עבור לחש, יכולת, יתרון, חיסרון ואחר.",
      subjectBypassInvalid: "--subjectPromptBypass מצפה ל־true או false כאשר מסופק ערך.",
      customDetailsRequired: "נדרשים פרטי {condition}. השתמש ב־--other כדי לספק אותם.",
      markerConfigFormat: "תבנית הגדרת סמן: --config marker Grappled=grab",
      markerPredefinedRequired: "הגדרת סמן דורשת שם מצב מוגדר מראש.",
      markerNameRequired: "הגדרת סמן דורשת שם סמן שאינו ריק.",
      markerSet: "הסמן של {condition} הוגדר ל־{marker}.",
      healthBarSet: "סרגל הבריאות הוגדר ל־{bar}.",
      boolSet: "{key} הוגדר ל־{value}.",
      expectedBoolean: "נדרש true או false.",
      invalidHealthBar: "סרגל הבריאות חייב להיות bar1_value, bar2_value או bar3_value.",
      markersDisabled: "הסמנים מושבתים.",
      noMarkerConfigured: "לא מוגדר סמן עבור מצב זה.",
      markerApplied: "סמן הוחל: {marker}",
      markerPresent: "הסמן כבר קיים: {marker}",
      langSet: "השפה הוגדרה ל־{locale}.",
      invalidLocale: "אזור שפה לא תקין. אזורי שפה נתמכים: {locales}.",
      otherDurationRequiresRounds: "משך אחר דורש מספר סיבובים, לדוגמה --duration 5 rounds.",
      invalidDuration: "משך חייב להיות עד להסרה, אפשרות סוף תור או מספר סיבובים חיובי.",
      zeroHpNoConditions: "{name} הגיע ל־0 נק״פ ואין לו מצבים פעילים.",
      zeroHpConditions: "{name} הגיע ל־0 נק״פ. בחר מצבים להסרה:",
      removeAllBtn: "הסר את כל המצבים של {name}",
      markIncapacitated: "סמן כמנוטרל",
      removeFromTurnOrder: "הסר מסדר התורות",
      alreadyIncapacitated: "{name} כבר מנוטרל.",
      tokenRemovedFromTurn: "{name} הוסר מסדר התורות.",
      tokenNotInTurn: "{name} לא נמצא בסדר התורות.",
      moveTokenPrompt: "להעביר את {name} לשכבת המפה כדי שיישאר גלוי בלי להפריע לאסימונים אחרים?",
      moveTokenBtn: "העבר את {name} לשכבת המפה",
      tokenMoved: "{name} הועבר לשכבת המפה.",
      tokenNotFound: "אסימון לא נמצא.",
      noActiveConditions: "ל־{name} אין מצבים פעילים להסרה.",
      deadNoConditions: "{name} סומן כמת. לא היו מצבים פעילים.",
      scriptReady: "{name} פעיל ואתה משתמש בגרסה {version}.",
      reachedZeroHp: "{name} הגיע ל־0 נק״פ",
      manuallyRemoved: "הוסר ידנית",
      durationExpired: "משך הזמן שלו פג",
      markedAsDead: "{name} סומן כמת",
      conditionReorder: "סדר התורות השתנה ו-{count} שורת/שורות תנאי עקובות עשויות להיות כעת במיקום שגוי. לחץ למטה כדי לשחזר אותן אחרי הטוקנים שהוקצו להן.",
      conditionsReordered: "שורות התנאי מוקמו מחדש אחרי הטוקנים שהוקצו להן.",
      noTokensSelectedReport: "בחר לפחות אסימון אחד בלוח לפני השימוש ב--report-token.",
      noConditionsAppliedTo: "{name} לא הוחלו עליו תנאים פעילים.",
      noConditionsAppliedBy: "ל-{name} לא הוחלו תנאים פעילים על אחרים.",
      noSavedEffects: "אין אפקטים שמורים שמורים עבור {name}.",
      noTokenSelectedSaved: "בחר אסימון על הלוח לפני השימוש ב--sved.",
      savedEffectAdded: "אפקט שמור נוסף עבור {name}.",
      savedEffectUpdated: "אפקט שמור עודכן.",
      savedEffectRemoved: "האפקט השמור הוסר.",
      savedEffectNotFound: "האפקט השמור לא נמצא.",
      savedInvalidVisibility: "ראות לא חוקית. השתמש ציבורי, רעולי פנים או GM.",
      savedConditionRequired: "Condition type is required. Use --condition <type>.",
      savedPromotedPublic: "אפקט נוסף ל-Turn Tracker כציבורי.",
      savedPromotedMasked: "אפקט נוסף ל-Turn Tracker כמסווה - שחקנים רואים: {publicLabel}.",
      savedPromotedGm: "ההשפעה היא GM בלבד - לא תיווצר שורה של Tracker Turner. מערכת התזכורת תעלה אותו כשאסימון זה יגיע לראש סדר התור.",
      savedSnoozed: "התזכורת הושהה: {scope}.",
      savedSnoozeCleared: "נודניק נמחק.",
      hiddenEffectsReminder: "אפקטים נסתרים פעילים ב-{name}.",
      visibilityPublicHint: "תווית מלאה גלויה לכל",
      visibilityMaskedHint: "תווית מעורפלת שמוצגת לשחקנים",
      visibilityGmHint: "לוחשת GM בלבד, ללא שורה של מסלול מעקב"
    },
    removal: {
      conditionField: "מצב",
      reasonField: "סיבה",
      turnRowField: "שורת סדר תורות",
      markerField: "סמן",
      notConfigured: "לא מוגדר",
      markerRemoved: "הוסר ({marker})",
      markerRetained: "נשמר ({marker})",
      rowRemoved: "הוסר",
      rowMissing: "כבר חסר",
      manualReason: "הסרה ידנית"
    },
    saved: {
      visibility: {
        public: "פּוּמְבֵּי",
        masked: "מוּסוֶה",
        gm: "GM בלבד"
      },
      snooze: {
        thisTurn: "התור הזה",
        oneRound: "1 סיבוב",
        threeRounds: "3 סיבובים",
        thisCombat: "הקרב הזה",
        rounds: "{n} סבבים"
      },
      field: {
        gmLabel: "תווית GM",
        publicLabel: "תווית ציבורית",
        visibility: "רְאוּת",
        source: "מָקוֹר",
        condition: "מַצָב"
      },
      prompt: {
        enterGmLabel: "תיאור האפקט המלא (GM בלבד)",
        enterPublicLabel: "תווית מעורפלת מוצגת לשחקנים"
      },
      snoozed: "נודניק"
    },
    classify: {
      title: "סיווג שחקנים",
      showTitle: "אבחון סיווג",
      showHeading: "פרטי סיווג אסימון",
      resultHeading: "עקיפה הוחלה",
      noSelection: "בחר לפחות אסימון אחד על הלוח לפני השימוש ב-‎--classify.",
      invalidType: "סוג סיווג לא חוקי: {type}. השתמש ב-pc,‏ npc,‏ ignored או auto.",
      set: "{name} → {type} (תחום: {scope})",
      cleared: "{name} עקיפה נמחקה (תחום: {scope}) — זיהוי אוטומטי שוחזר.",
      setTokenFallback: "{name} → {type} (עקיפת אסימון — לא מקושר לגיליון דמות).",
      clearedTokenFallback: "{name} עקיפת אסימון נמחקה — זיהוי אוטומטי שוחזר.",
      fieldToken: "אסימון",
      fieldType: "סיווג",
      fieldSource: "מקור",
      fieldReason: "סיבה"
    },
    cleanup: {
      orphaned: "רשומות מצב יתומות",
      stale: "רשומות מצב מיושנות",
      orphanedRows: "שורות סדר תורות יתומות",
      unusedMarkers: "סמנים שאינם בשימוש"
    },
    apply: {
      turnAppended: "היעד לא היה בסדר התורות; שורת המצב נוספה.",
      turnInserted: "שורת המצב נוספה מתחת לאסימון היעד."
    }
  },
  handout: {
    versionLabel: "גרסה",
    subtitle: "מנהל אפקטי מצב ל־D&D 5e",
    footerNote: "דף עזרה זה נוצר ומתעדכן אוטומטית בכל טעינת הסקריפט.",
    overview: {
      heading: "סקירה",
      body: "Condition Tracker מנהל מצבי D&D 5e ואפקטים מותאמים כשורות מתויגות ב־Roll20 Turn Tracker. אפשר להחיל מצבים על אסימונים, לעקוב אחר משכים לפי סדר יוזמה ולהסיר אוטומטית אפקטים שפג תוקפם בסוף תור. כל הפקודות מיועדות ל־GM בלבד."
    },
    quickStart: {
      heading: "התחלה מהירה",
      colCommand: "פקודה",
      colDesc: "תיאור",
      rows: [
        [
          "!condition-tracker --prompt",
          "אשף שלב אחר שלב לבחירת מצב, אסימונים ומשך באופן אינטראקטיבי."
        ],
        [
          "!condition-tracker --multi-target",
          "החלת מצב אחד על כמה אסימונים בו־זמנית."
        ],
        [
          "!condition-tracker --report-token",
          "בחר תחילה אסימון אחד או יותר, ולאחר מכן הפעל את הפקודה הזו כדי לקבל לחישה של GM המפרטת כל תנאי שהוחל על ועל ידי כל אסימון שנבחר. זמין גם כמאקרו ConditionTrackerReportToken."
        ],
        [
          "!condition-tracker --menu",
          "פתיחת תפריט הניהול הראשי להחלה, בדיקה או הסרה של מצבים."
        ]
      ]
    },
    commandsRef: {
      heading: "פקודות",
      colFlag: "דגל",
      colDesc: "תיאור",
      rows: [
        [
          "--לְעוֹרֵר",
          "ממשק אשף אינטראקטיבי"
        ],
        [
          "-- רב יעדים",
          "החלת מצב על כמה יעדים"
        ],
        [
          "--תַפרִיט",
          "הצגת התפריט הראשי"
        ],
        [
          "--מקור X --יעד Y --תנאי Z",
          "החלת מצב ישירות ללא אשף"
        ],
        [
          "--duration <value>",
          "משך להחלה ישירה"
        ],
        [
          "--אחר <טקסט>",
          "טקסט מותאם לאפקטים מותאמים"
        ],
        [
          "--הסר את <condition-id>",
          "הסרת מצב לפי מזהה"
        ],
        [
          "--config <אופציה> <ערך>",
          "עדכון הגדרות"
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "עקיפת שלב הנושא לפקודה זו בלבד"
        ],
        [
          "--ניקוי",
          "ניקוי רשומות ושורות יתומות"
        ],
        [
          "-- תנאי הזמנה מחדש",
          "מיקום מחדש ידני של שורות תנאי אחרי הטוקנים המוקצים בסדר התורות"
        ],
        [
          "---reinstall-macro",
          "יצירה או עדכון של מאקרואים ל־GM"
        ],
        [
          "--התקן מחדש נדב",
          "יצירה או עדכון של דף העזרה המקומי"
        ],
        [
          "--דוח-אסימון",
          "לחשו דוח מצב של GM בלבד עבור כל אסימון שנבחר (תנאים שהוחלו עליו ועל ידו)"
        ],
        [
          "-- נשמר",
          "הצג אפקטים ארוכי טווח שמורים עבור האסימון שנבחר (בחר אסימון תחילה)"
        ],
        [
          "--הוספה נשמרת",
          "הוסף אפקט שמור (קללה, מחלה וכו') לאסימון שנבחר"
        ],
        [
          "--saved edit <id>",
          "ערוך אפקט שמור קיים לפי מזהה"
        ],
        [
          "--saved remove <id>",
          "הסר אפקט שמור לפי מזהה"
        ],
        [
          "--saved promote <id> --visibility public|masked|gm",
          "העתק אפקט שמור ל-Turn Tracker (ציבורי/מסוכה) או סמן אותו כפעיל ל-GM בלבד"
        ],
        [
          "--saved snooze <id> --scope turn|rounds|combat --rounds <n>",
          "נודניק תזכורת עם אפקט שמורה לפנייה הנוכחית, N סיבובים או הקרב הזה"
        ],
        [
          "--saved snooze-clear <id>",
          "נקה נודניק פעיל על אפקט שמור"
        ],
        [
          "--lang <locale>",
          "פלט נוסף באזור שפה אחר"
        ],
        [
          "--סיווג pc|npc|התעלם",
          "עקוף את סוג השחקן עבור אסימונים נבחרים — בחר תחילה אסימון(ים). ברירת המחדל של התחום היא דמות (כותב תכונת ct_mod_actor_type); הוסף --scope token לשמירה בסטטוס הסקריפט"
        ],
        [
          "--לסווג אוטומטי",
          "הסר את עקיפת סוג השחקן ושחזר זיהוי אוטומטי עבור אסימונים נבחרים"
        ],
        [
          "--לסווג מופע",
          "לחוש אבחון סיווג עבור כל אסימון נבחר — מציג את הסוג שזוהה, מקור הזיהוי והסיבה"
        ],
        [
          "--עֶזרָה",
          "הצגת כרטיס עזרה קצר בצ׳אט"
        ]
      ]
    },
    standardConditions: {
      heading: "מצבים רגילים (D&D 5e)",
      colCondition: "מצב"
    },
    customEffects: {
      heading: "סוגי אפקטים מותאמים",
      colType: "סוג",
      colNotes: "הערות",
      rows: [
        [
          "🔮 לחש",
          "מעקב אחר אפקט לחש בשם"
        ],
        [
          "🎯 יכולת",
          "מעקב אחר יכולת מקצוע או גזע בשם"
        ],
        [
          "🍀 יתרון",
          "רישום יתרון מאסימון אחד לאחר"
        ],
        [
          "⬇️ חיסרון",
          "רישום חיסרון שהוטל"
        ],
        [
          "📝 אחר",
          "תווית מותאמת חופשית"
        ]
      ]
    },
    durationOptions: {
      heading: "אפשרויות משך",
      intro: "הספירה שנותרה מוצגת בעמודת pr של מעקב התורות ופוחתת בסוף תור אסימון העוגן.",
      colOption: "אפשרות",
      colBehaviour: "התנהגות",
      rows: [
        [
          "עד להסרה",
          "קבוע עד להסרה ידנית"
        ],
        [
          "סוף התור הבא של היעד",
          "פג בסוף התור הבא של אסימון היעד"
        ],
        [
          "סוף התור הבא של המקור",
          "פג בסוף התור הבא של אסימון המקור"
        ],
        [
          "1 / 2 / 3 / 10 סיבובים",
          "ספירה קבועה לאחור"
        ]
      ]
    },
    savedEffects: {
      heading: "אפקטים שמורים",
      intro: "אפקטים שמורים מאפשרים לך לאחסן תנאים ארוכי טווח מחוץ ל-Turn Tracker - קללות, מחלות, רעלים, הרחקות נסתרות ומצבים אחרים שאינם קרביים. הם נמשכים במצב סקריפט וניתן להעתיק אותם ל-Turn Tracker כאשר הלחימה מתחילה.",
      visibility: {
        heading: "מצבי נראות",
        rows: [
          [
            "פּוּמְבֵּי",
            "תווית האפקט המלא גלויה ב-Turn Tracker ובצ'אט הציבורי."
          ],
          [
            "מוּסוֶה",
            "תווית ציבורית מעורפלת מוצגת לשחקנים; הפרטים המלאים הם GM בלבד."
          ],
          [
            "gm",
            "אין שורה של מעקב אחר סיבובים. הפרטים המלאים מאוחסנים במצב ונלחשים ל-GM כאשר האסימון המושפע מגיע לראש היוזמה."
          ]
        ]
      },
      commands: {
        heading: "פקודות אפקטים שמורות",
        intro: "כל הפקודות שנשמרו הן ל-GM בלבד. בחר אסימון לפני הפעלת הוספה --שמורה או --שמורה.",
        rows: [
          [
            "!condition-tracker --שמר",
            "הצג אפקטים שמורים עבור האסימון שנבחר."
          ],
          [
            "!condition-tracker --שמר הוספה",
            "הפעל את אשף ההוספה-שמור-אפקט."
          ],
          [
            "!condition-tracker --saved edit <id>",
            "ערוך תוויות או נראות עבור אפקט שמור קיים."
          ],
          [
            "!condition-tracker --saved remove <id>",
            "הסר לצמיתות אפקט שמור."
          ],
          [
            "!condition-tracker --saved promote <id> --visibility public|masked|gm",
            "העתק אפקט שמור ל-Turn Tracker (ציבורי או רעולי פנים) או אשר שהוא במעקב GM בלבד."
          ],
          [
            "!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>",
            "נודניק תזכורת GM עבור התור הזה, N סיבובים או הקרב הזה."
          ],
          [
            "!condition-tracker --saved snooze-clear <id>",
            "נקה נודניק פעיל כדי שהתזכורות יתחדשו מיד."
          ]
        ]
      },
      reminders: {
        heading: "תזכורות GM",
        body: "כאשר אסימון עם GM או אפקטים שמורים במסכה מגיע לראש ה-Turn Tracker, ה-GM מקבל לחישה המפרטת את האפקטים הנסתרים עם כפתורי פעולה. תזכורות כפולות באותו תור נדחקות. השתמש בלחצני 'נודניק' כדי לדכא תזכורות עבור תור, מספר סיבובים או לשארית הקרב הנוכחי."
      }
    },
    actorClassification: {
      heading: "סיווג שחקנים",
      intro: "Condition Tracker קובע אוטומטית אם כל אסימון הוא דמות שחקן, דמות שאינה שחקן, או אובייקט מתעלם (סיכות מפה, תפאורה, תבניות לחשים). אסימונים לא מקושרים מתעלמים מהם כברירת מחדל. השתמש ב-‎--classify כדי לעקוף את הזיהוי האוטומטי עבור כל אסימון.",
      detectionOrder: {
        heading: "סדר זיהוי",
        colStep: "שלב",
        colCheck: "בדיקה",
        colResult: "תוצאה",
        rows: [
          [
            "1",
            "עקיפת מצב אסימון (--classify --scope token)",
            "pc / npc / התעלמו"
          ],
          [
            "2",
            "תכונת ct_mod_actor_type של דמות (--classify --scope character)",
            "pc / npc / התעלמו"
          ],
          [
            "3",
            "אסימון לא מקושר — אין גיליון דמות",
            "התעלמו"
          ],
          [
            "4",
            "מתאם מערכת המשחק (תכונת npc / is_npc)",
            "pc / npc"
          ],
          [
            "5",
            "סריקת תכונות NPC כלליות (npc, is_npc, npcflag, sheet_type, character_type)",
            "pc / npc"
          ],
          [
            "6",
            "גיבוי controlledby של דמות",
            "pc / npc"
          ]
        ]
      },
      types: {
        heading: "סוגי סיווג",
        colType: "סוג",
        colMeaning: "משמעות",
        rows: [
          [
            "PC",
            "דמות שחקן — תמיד נכללת כ-PC באשף ובזיהוי"
          ],
          [
            "npc",
            "דמות שאינה שחקן — תמיד נכללת כ-NPC"
          ],
          [
            "התעלמו",
            "לעולם אינה מוצגת או עוקבת — מוחרגת מבוחר האסימונים של האשף"
          ],
          [
            "לֹא יְדוּעַ",
            "זיהוי אוטומטי בלבד; לא ניתן לקבוע את הסוג (מטופל כ-NPC באשף)"
          ]
        ]
      },
      commands: {
        heading: "פקודות סיווג",
        intro: "בחר אסימון אחד או יותר לפני הפעלת פקודות --classify.",
        rows: [
          [
            "!condition-tracker --סיווג מחשב",
            "סמן אסימונים נבחרים כ-PC (תחום דמות כברירת מחדל)."
          ],
          [
            "!condition-tracker --סיווג npc",
            "סמן אסימונים נבחרים כ-NPC."
          ],
          [
            "התעלמו מ-!condition-tracker --classify",
            "הוצא אסימונים נבחרים מכל מעקב."
          ],
          [
            "!condition-tracker --סיווג אוטומטי",
            "הסר עקיפה — שחזר זיהוי אוטומטי."
          ],
          [
            "!condition-tracker --סיווג מופע",
            "הצג אבחון סיווג (סוג, מקור, סיבה) עבור כל אסימון נבחר."
          ],
          [
            "!condition-tracker --סיווג pc --scope token",
            "עקיפה ברמת האסימון השמורה בסטטוס הסקריפט — שימושית לאסימונים לא מקושרים."
          ],
          [
            "!condition-tracker --סיווג pc --תו היקף",
            "עקיפה ברמת הדמות הכתובה לתכונת ct_mod_actor_type — חלה על כל האסימונים עם אותו גיליון דמות."
          ]
        ]
      }
    },
    configuration: {
      heading: "הגדרות",
      intro: "השתמש ב־!condition-tracker --config &lt;option&gt; &lt;value&gt; או בכפתור ההגדרות בתפריט הראשי.",
      colOption: "אפשרות",
      colValues: "ערכים",
      colDesc: "תיאור",
      rows: [
        [
          "useMarkers",
          "true / false",
          "החלת סמני סטטוס של Roll20 על אסימונים"
        ],
        [
          "useIcons",
          "נכון/שקר",
          "הצגת קודי אייקון קצרים במקום אימוג׳י"
        ],
        [
          "subjectPromptBypass",
          "נכון/שקר",
          "דילוג על שלב הנושא האופציונלי"
        ],
        [
          "suppressPublicChat",
          "נכון/שקר",
          "דכא את כל הודעות הצ'אט הציבוריות (הודעות החלה והסרה). לחישות ה-GM אינן מושפעות."
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "סרגל בריאות למעקב"
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "שפת הודעות הצ׳אט ודף העזרה"
        ],
        [
          "marker",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "החלפת הסמן למצב מסוים (לדוגמה marker Grappled=grab)"
        ]
      ]
    },
    defaultMarkers: {
      heading: "סמני סטטוס ברירת מחדל",
      colCondition: "מצב",
      colMarker: "שם סמן"
    },
    availableLocales: {
      heading: "תרגומים זמינים",
      intro: "השתמש באפשרות הגדרת language כדי לקבוע את הודעות הצ'אט וחוברת העזרה בכל locale נתמך. כינויים קצרים מקובלים גם עבור en, zh ו-pt.",
      colLocale: "מקום",
      colLanguage: "שפה",
      colFile: "קובץ תרגום"
    }
  }
};

export default TRANSLATION;
