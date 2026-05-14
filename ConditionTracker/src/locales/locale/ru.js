const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "схвачен",
      verb: "схватывает",
    },
    Restrained: {
      past: "опутан",
      verb: "опутывает",
    },
    Prone: {
      past: "сбит с ног",
      verb: "сбивает",
      suffix: "с ног",
    },
    Poisoned: {
      past: "отравлен",
      verb: "отравляет",
    },
    Stunned: {
      past: "ошеломлен",
      verb: "ошеломляет",
    },
    Blinded: {
      past: "ослеплен",
      verb: "ослепляет",
    },
    Charmed: {
      past: "очарован",
      verb: "очаровывает",
    },
    Frightened: {
      past: "испуган",
      verb: "пугает",
    },
    Incapacitated: {
      past: "недееспособен",
      verb: "делает",
      suffix: "недееспособным",
    },
    Invisible: {
      past: "невидим",
      verb: "делает",
      suffix: "невидимым",
    },
    Paralyzed: {
      past: "парализован",
      verb: "парализует",
    },
    Petrified: {
      past: "окаменел",
      verb: "окаменяет",
    },
    Unconscious: {
      past: "без сознания",
      verb: "лишает",
      suffix: "сознания",
    },
    Spell: {
      past: "под действием заклинания",
      verb: "накладывает заклинание на",
    },
    Ability: {
      past: "под действием умения",
      verb: "использует умение на",
    },
    Advantage: {
      past: "имеет преимущество",
      verb: "дает преимущество",
      noBy: true,
    },
    Disadvantage: {
      past: "имеет помеху",
      verb: "накладывает помеху",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Схвачен",
    Restrained: "Опутан",
    Prone: "Лежит ничком",
    Poisoned: "Отравлен",
    Stunned: "Ошеломлен",
    Blinded: "Ослеплен",
    Charmed: "Очарован",
    Frightened: "Испуган",
    Incapacitated: "Недееспособен",
    Invisible: "Невидим",
    Paralyzed: "Парализован",
    Petrified: "Окаменел",
    Unconscious: "Без сознания",
    Spell: "Заклинание",
    Ability: "Умение",
    Advantage: "Преимущество",
    Disadvantage: "Помеха",
    Other: "Другое",
  },
  templates: {
    display: {
      custom: "{emoji} {target} под воздействием {effect} ({source})",
      advantage: "{emoji} {source} имеет преимущество против {target}{subject}",
      disadvantage: "{emoji} {source} имеет помеху против {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} {past}",
      standard: "{emoji} {target} {past} от {source}",
    },
    apply: {
      custom: "{source} накладывает {effect} на {target}.",
      advantage: "{source} имеет преимущество против {target}{subject}.",
      disadvantage: "{source} имеет помеху против {target}{subject}.",
      self: "{target} {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} больше не находится под воздействием {effect}.",
      advantage:
        "{source} больше не имеет преимущества против {target}{subject}.",
      disadvantage: "{source} больше не имеет помехи против {target}{subject}.",
      noBy: "{target} больше не {past}.",
      self: "{target} больше не {past}.",
      standard: "{target} больше не {past} от {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Выбрать состояние",
      selectSource: "Выбрать жетон источника",
      selectTarget: "Выбрать жетон цели",
      selectSubject: "Выбрать субъект",
      selectDuration: "Выбрать длительность",
      confirmTargetTitle: "Подтвердить список целей",
      applyEffectTitle: "Применить эффект {condition}",
      noTokens: "На активной странице не найдено именованных жетонов.",
      confirmIntro: "Следующие жетоны получат состояние:",
      confirmBtn: "Подтвердить список целей",
      enterDetails: "Ввести подробности эффекта",
      noneBtn: "Нет",
      noneOrSourceBtn: "Нет или применить к источнику",
      subjectDesc: "Выберите, кто или что вызывает эффект.",
      sourceDesc:
        "Выберите существо, создающее или генерирующее состояние или эффект.",
      targetDesc: "Выберите существо, которое получит состояние или эффект.",
      otherText: "Произвольный текст состояния",
      effectDetails: "Подробности {condition}",
    },
    col: {
      players: "Игроки",
      npcs: "НИП",
      conditions: "Состояния",
      customEffects: "Пользовательские эффекты",
      permanentTurnEnd: "Постоянный / Конец хода",
      rounds: "Раунды",
      command: "Команда",
      result: "Результат",
      field: "Поле",
      value: "Значение",
      option: "Параметр",
      condition: "Состояние",
      marker: "Маркер",
      item: "Элемент",
      removed: "Удалено",
      details: "Подробности",
      description: "Описание",
      scenario: "Сценарий",
    },
    dur: {
      untilRemoved: "До удаления",
      endOfTargetTurn: "Конец следующего хода цели",
      endOfSourceTurn: "Конец следующего хода источника",
      round1: "1 раунд",
      round2: "2 раунда",
      round3: "3 раунда",
      round10: "10 раундов",
      custom: "Произвольно",
      customPrompt: "Количество раундов",
      untilRemovedDisplay: "До удаления",
      turnsRemaining: "Осталось {n} конец (концов) хода",
    },
    btn: {
      openWizard: "Открыть мастер",
      openMultiTarget: "Открыть мастер нескольких целей",
      openRemovalList: "Открыть список удаления",
      showConfig: "Показать конфигурацию",
      runCleanup: "Запустить очистку",
      reinstallMacro: "Переустановить макрос",
      reinstallHandout: "Переустановить хэндаут",
      showHelp: "Показать справку",
      reorderConditions: "Переупорядочить строки состояний",
    },
    title: {
      menu: "Меню",
      removalMenu: "Удаление состояний",
      config: "Конфигурация",
      configTracker: "Конфигурация Condition Tracker",
      help: "Справка",
      applied: "Применено",
      removed: "Состояние удалено",
      cleanup: "Очистка завершена",
      macroReinstalled: "Макрос переустановлен",
      handoutReinstalled: "Хэндаут переустановлен",
      warning: "Предупреждение",
      error: "Ошибка",
      turnOrder: "Порядок ходов",
      noConditions: "Нет состояний",
      tokenMoved: "Жетон перемещён",
      markedDead: "Помечен как мёртвый",
      zeroHp: "{name} — 0 ХП",
      moveToken: "{name} — Переместить жетон?",
      scriptReady: "Скрипт готов",
      conditionReorder: "Порядок ходов изменён",
    },
    heading: {
      quickActions: "Быстрые действия",
      settings: "Настройки",
      markerMappings: "Сопоставления маркеров",
      result: "Результат",
      info: "Информация",
      commandOptions: "Параметры команд",
      promptUi: "Интерфейс мастера",
      examples: "Примеры",
      summary: "Итог",
    },
    msg: {
      noActive: "Активных состояний не отслеживается.",
      configReset: "Конфигурация сброшена до значений по умолчанию модуля.",
      unknownConfig:
        "Неизвестный параметр конфигурации. Используйте --config для просмотра поддерживаемых настроек.",
      macroReinstalled:
        "Макросы {wizard} и {multiTarget} были переустановлены для всех текущих игроков с ролью ДМ.",
      handoutReinstalled: "Справочный хэндаут {handout} был переустановлен.",
      duplicate:
        "Точное сочетание источника, субъекта, цели, состояния и произвольного текста уже активно.",
      noTargets: "Не указаны жетоны целей для применения к нескольким целям.",
      noSelection:
        "Выберите хотя бы один жетон на поле перед использованием --multi-target.",
      invalidIds:
        "В текущем выделении не найдено допустимых идентификаторов жетонов.",
      reSelectTokens:
        "Ни один из первоначально выбранных жетонов не найден. Выберите жетоны заново и повторите попытку.",
      conditionNotFound: "Идентификатор состояния не найден.",
      gmOnly: "Команды Condition Tracker доступны только для ДМ.",
      commandFailed:
        "Команда не могла быть безопасно выполнена. Проверьте консоль API.",
      sourceTokenNotFound: "Жетон источника не найден.",
      targetTokenNotFound: "Жетон цели не найден.",
      subjectTokenNotFound: "Жетон субъекта не найден.",
      invalidCondition:
        "Состояние должно быть одним из предопределённых состояний или Другое.",
      subjectOnlyCustom:
        "--subject допустим только для Заклинания, Умения, Преимущества, Помехи и Другого.",
      subjectBypassInvalid:
        "--subjectPromptBypass ожидает значение true или false, если значение указано.",
      customDetailsRequired:
        "Подробности {condition} обязательны. Используйте --other для их указания.",
      markerConfigFormat:
        "Формат конфигурации маркера: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Конфигурация маркера требует предопределённого имени состояния.",
      markerNameRequired:
        "Конфигурация маркера требует непустого имени маркера.",
      markerSet: "Маркер {condition} установлен на {marker}.",
      healthBarSet: "Полоса здоровья установлена на {bar}.",
      boolSet: "{key} установлено на {value}.",
      expectedBoolean: "Ожидалось true или false.",
      invalidHealthBar:
        "Полоса здоровья должна быть bar1_value, bar2_value или bar3_value.",
      markersDisabled: "Маркеры отключены.",
      noMarkerConfigured: "Для данного состояния не настроен маркер.",
      markerApplied: "Маркер применён: {marker}",
      markerPresent: "Маркер уже присутствует: {marker}",
      langSet: "Язык установлен на {locale}.",
      invalidLocale: "Недопустимый язык. Поддерживаемые языки: {locales}.",
      otherDurationRequiresRounds:
        "Длительность «Другое» требует числового количества раундов, например --duration 5 rounds.",
      invalidDuration:
        "Длительность должна быть «До удаления», вариантом конца хода или положительным числом раундов.",
      zeroHpNoConditions: "{name} достиг 0 ХП и не имеет активных состояний.",
      zeroHpConditions: "{name} достиг 0 ХП. Выберите состояния для удаления:",
      removeAllBtn: "Удалить все состояния для {name}",
      markIncapacitated: "Пометить как недееспособного",
      removeFromTurnOrder: "Убрать из порядка ходов",
      alreadyIncapacitated: "{name} уже недееспособен.",
      tokenRemovedFromTurn: "{name} был убран из порядка ходов.",
      tokenNotInTurn: "{name} не найден в порядке ходов.",
      moveTokenPrompt:
        "Переместить {name} на слой карты, чтобы он оставался видимым, но не мешал другим жетонам?",
      moveTokenBtn: "Переместить {name} на слой карты",
      tokenMoved: "{name} был перемещён на слой карты.",
      tokenNotFound: "Жетон не найден.",
      noActiveConditions: "{name} не имеет активных состояний для удаления.",
      deadNoConditions:
        "{name} был помечен как мёртвый. Активных состояний не было.",
      scriptReady: "{name} активен, вы используете версию {version}.",
      reachedZeroHp: "{name} достиг 0 ХП",
      manuallyRemoved: "было удалено вручную",
      durationExpired: "длительность истекла",
      markedAsDead: "{name} был помечен как мёртвый",
      conditionReorder:
        "Порядок ходов изменился, и {count} отслеживаемая (отслеживаемых) строка состояний может быть не на своём месте. Нажмите ниже, чтобы восстановить их после назначенных жетонов.",
      conditionsReordered:
        "Строки состояний были перемещены после назначенных им жетонов.",
    },
    removal: {
      conditionField: "Состояние",
      reasonField: "Причина",
      turnRowField: "Строка отслеживания ходов",
      markerField: "Маркер",
      notConfigured: "Не настроено",
      markerRemoved: "Удалено ({marker})",
      markerRetained: "Сохранено ({marker})",
      rowRemoved: "Удалено",
      rowMissing: "Уже отсутствует",
      manualReason: "Ручное удаление",
    },
    cleanup: {
      orphaned: "Осиротевшие записи состояний",
      stale: "Устаревшие записи состояний",
      orphanedRows: "Осиротевшие строки отслеживания ходов",
      unusedMarkers: "Неиспользуемые маркеры",
    },
    apply: {
      turnAppended:
        "Цель не была в порядке ходов; строка состояния добавлена в конец.",
      turnInserted: "Строка состояния вставлена ниже жетона цели.",
    },
  },
  handout: {
    versionLabel: "Версия",
    subtitle: "Менеджер состояний D&D 5e",
    footerNote:
      "Этот хэндаут автоматически создаётся и обновляется при каждой загрузке скрипта.",
    overview: {
      heading: "Обзор",
      body: "Condition Tracker управляет состояниями D&D 5e и пользовательскими эффектами в виде подписанных строк в Трекере Ходов Roll20. Применяйте состояния к жетонам, отслеживайте длительности по порядку инициативы и автоматически удаляйте истёкшие эффекты в конце хода. Все команды доступны только для ДМ и могут вызываться из чата или через установленные макросы.",
    },
    quickStart: {
      heading: "Быстрый старт",
      colCommand: "Команда",
      colDesc: "Описание",
      rows: [
        [
          "!condition-tracker --prompt",
          "Пошаговый мастер — интерактивно выберите состояние, жетоны и длительность. Также доступен как макрос ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Применить одно состояние к нескольким жетонам одновременно. Также доступен как макрос ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Открыть главное меню управления с кнопками для применения, просмотра или удаления состояний.",
        ],
      ],
    },
    commandsRef: {
      heading: "Справочник команд",
      colFlag: "Флаг",
      colDesc: "Описание",
      rows: [
        ["--prompt", "Интерактивный пошаговый мастер"],
        [
          "--multi-target",
          "Применить состояние к нескольким жетонам цели сразу",
        ],
        ["--menu", "Показать главное меню (добавить remove для меню удаления)"],
        [
          "--source X --target Y --condition Z",
          "Применить состояние напрямую без мастера",
        ],
        [
          "--duration &lt;значение&gt;",
          "Длительность для прямого применения (например, 2 rounds)",
        ],
        [
          "--other &lt;текст&gt;",
          "Произвольный текст для типов эффектов Заклинание / Умение / Другое",
        ],
        [
          "--remove &lt;ID состояния&gt;",
          "Удалить конкретное состояние по его уникальному идентификатору",
        ],
        [
          "--config &lt;параметр&gt; &lt;значение&gt;",
          "Изменить настройки конфигурации (см. раздел Конфигурация ниже)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Переопределить subjectPromptBypass только для этой команды (также поддерживает --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Согласовать состояние — удалить осиротевшие состояния и строки Трекера Ходов",
        ],
        [
          "--reorder-conditions",
          "Вручную переместить строки условий после назначенных токенов в очереди хода",
        ],
        ["--reinstall-macro", "Пересоздать или обновить макросы ДМ"],
        [
          "--reinstall-handout",
          "Пересоздать или обновить локализованный справочный хэндаут",
        ],
        [
          "--lang &lt;язык&gt;",
          "Выводить сообщения этой команды на дополнительном языке (двуязычный режим)",
        ],
        ["--help", "Показать краткую справочную карточку в чате"],
      ],
    },
    standardConditions: {
      heading: "Стандартные состояния (D&amp;D 5e)",
      colCondition: "Состояние",
    },
    customEffects: {
      heading: "Пользовательские типы эффектов",
      colType: "Тип",
      colNotes: "Примечания",
      rows: [
        [
          "🔮 Заклинание",
          "Отслеживать именованный эффект заклинания — вам будет предложено ввести название заклинания",
        ],
        [
          "🎯 Умение",
          "Отслеживать именованное умение класса или расы — вам будет предложено ввести название",
        ],
        [
          "🍀 Преимущество",
          "Записать преимущество, предоставленное от одного жетона другому; сгруппировано с источником в инициативе",
        ],
        [
          "⬇️ Помеха",
          "Записать наложенную помеху; сгруппировано с источником в инициативе",
        ],
        [
          "📝 Другое",
          "Произвольная пользовательская метка — вам будет предложено ввести описание",
        ],
      ],
    },
    durationOptions: {
      heading: "Варианты длительности",
      intro:
        "Оставшееся число отображается в столбце pr Трекера Ходов и уменьшается, когда заканчивается ход опорного жетона.",
      colOption: "Вариант",
      colBehaviour: "Поведение",
      rows: [
        [
          "До удаления",
          "Постоянное — должно быть удалено вручную через меню или --remove",
        ],
        [
          "Конец следующего хода цели",
          "Истекает, когда заканчивается следующий ход жетона цели в инициативе",
        ],
        [
          "Конец следующего хода источника",
          "Истекает, когда заканчивается следующий ход жетона источника в инициативе",
        ],
        [
          "1 / 2 / 3 / 10 раундов",
          "Фиксированный обратный отсчёт; одно уменьшение за конец хода опорного жетона",
        ],
      ],
    },
    configuration: {
      heading: "Конфигурация",
      intro:
        "Используйте !condition-tracker --config &lt;параметр&gt; &lt;значение&gt; или кнопку Конфигурация в главном меню.",
      colOption: "Параметр",
      colValues: "Значения",
      colDesc: "Описание",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Применять маркеры состояния Roll20 к жетонам при добавлении состояния",
        ],
        [
          "useIcons",
          "true / false",
          "Показывать короткие коды иконок (например, [G]) вместо эмодзи в строках Трекера Ходов",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Пропустить необязательный шаг выбора субъекта для эффектов Заклинание / Умение / Другое",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Наблюдаемая полоса; когда опускается до 0, ДМ предлагается очистить состояния",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Язык вывода для сообщений чата и справочного хэндаута",
        ],
        [
          "marker",
          "&lt;Состояние&gt;=&lt;имя маркера&gt;",
          "Переопределить маркер состояния для конкретного состояния (например, marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Маркеры состояний по умолчанию",
      colCondition: "Состояние",
      colMarker: "Имя маркера",
    },
    availableLocales: {
      heading: "Доступные переводы",
      intro:
        "Используйте параметр конфигурации языка, чтобы задать язык сообщений чата и справочного хэндаута. Короткие псевдонимы также принимаются для en, zh и pt.",
      colLocale: "Locale",
      colLanguage: "Язык",
      colFile: "Файл перевода",
    },
  },
};

export default TRANSLATION;
