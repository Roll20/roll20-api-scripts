const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "被擒抱",
      verb: "擒抱"
    },
    Restrained: {
      past: "受束縛",
      verb: "束縛"
    },
    Prone: {
      past: "倒地",
      verb: "擊倒"
    },
    Poisoned: {
      past: "中毒",
      verb: "使中毒"
    },
    Stunned: {
      past: "震懾",
      verb: "使震懾"
    },
    Blinded: {
      past: "目盲",
      verb: "使目盲"
    },
    Charmed: {
      past: "被魅惑",
      verb: "魅惑"
    },
    Frightened: {
      past: "恐懼",
      verb: "使恐懼"
    },
    Incapacitated: {
      past: "失能",
      verb: "使失能"
    },
    Invisible: {
      past: "隱形",
      verb: "使",
      suffix: "隱形"
    },
    Paralyzed: {
      past: "麻痺",
      verb: "使麻痺"
    },
    Petrified: {
      past: "石化",
      verb: "使石化"
    },
    Unconscious: {
      past: "昏迷",
      verb: "使",
      suffix: "昏迷"
    },
    Spell: {
      past: "受到法術影響",
      verb: "對其施放法術"
    },
    Ability: {
      past: "受到能力影響",
      verb: "對其使用能力"
    },
    Advantage: {
      past: "具有優勢",
      verb: "給予優勢",
      noBy: true
    },
    Disadvantage: {
      past: "具有劣勢",
      verb: "施加劣勢",
      noBy: true
    }
  },
  condNames: {
    Grappled: "擒抱",
    Restrained: "束縛",
    Prone: "倒地",
    Poisoned: "中毒",
    Stunned: "震懾",
    Blinded: "目盲",
    Charmed: "魅惑",
    Frightened: "恐懼",
    Incapacitated: "失能",
    Invisible: "隱形",
    Paralyzed: "麻痺",
    Petrified: "石化",
    Unconscious: "昏迷",
    Spell: "法術",
    Ability: "能力",
    Advantage: "優勢",
    Disadvantage: "劣勢",
    Other: "其他"
  },
  languageNames: {
    af: "南非荷蘭文",
    ca: "加泰蘭文",
    "zh-TW": "中文（台灣）",
    cs: "捷克文",
    da: "丹麥文",
    nl: "荷蘭文",
    "en-US": "英文（美國）",
    fi: "芬蘭文",
    fr: "法文",
    de: "德文",
    el: "希臘文",
    he: "希伯來文",
    hu: "匈牙利文",
    it: "義大利文",
    ja: "日文",
    ko: "韓文",
    pl: "波蘭文",
    "pt-PT": "葡萄牙文（葡萄牙）",
    "pt-BR": "葡萄牙文（巴西）",
    ru: "俄文",
    es: "西班牙文",
    sv: "瑞典文",
    tr: "土耳其文",
    uk: "烏克蘭文"
  },
  ui: {
    choice: {
      selectCondition: "選擇狀態",
      selectSource: "選擇來源 Token",
      selectTarget: "選擇目標 Token",
      selectSubject: "選擇主體",
      selectDuration: "選擇持續時間",
      confirmTargetTitle: "確認目標列表",
      applyEffectTitle: "套用 {condition} 效果",
      noTokens: "目前頁面沒有找到已命名的 Token。",
      confirmIntro: "下列 Token 將受到此狀態影響：",
      confirmBtn: "確認目標列表",
      enterDetails: "輸入效果詳細資料",
      noneBtn: "無",
      noneOrSourceBtn: "無或套用至來源",
      subjectDesc: "選擇由誰或什麼造成此效果。",
      sourceDesc: "選擇產生此狀態或效果的生物。",
      targetDesc: "選擇要受到此狀態或效果影響的生物。",
      otherText: "其他狀態文字",
      effectDetails: "{condition} 詳細資料"
    },
    col: {
      players: "玩家",
      npcs: "NPC",
      conditions: "狀態",
      customEffects: "自訂效果",
      permanentTurnEnd: "永久 / 回合結束",
      rounds: "輪數",
      command: "指令",
      result: "結果",
      field: "欄位",
      value: "值",
      option: "選項",
      condition: "狀態",
      marker: "標記",
      item: "項目",
      removed: "已移除",
      details: "詳細資料",
      description: "描述",
      scenario: "情境",
      gameSystem: "遊戲系統",
      duration: "期間"
    },
    dur: {
      untilRemoved: "直到移除",
      endOfTargetTurn: "目標下個回合結束",
      endOfSourceTurn: "來源下個回合結束",
      round1: "1 輪",
      round2: "2 輪",
      round3: "3 輪",
      round10: "10 輪",
      custom: "自訂",
      customPrompt: "輪數",
      untilRemovedDisplay: "直到移除",
      turnsRemaining: "剩餘 {n} 個追蹤回合結束"
    },
    btn: {
      openWizard: "開啟精靈",
      openMultiTarget: "開啟多目標精靈",
      openRemovalList: "開啟移除列表",
      showConfig: "顯示設定",
      runCleanup: "執行清理",
      reinstallMacro: "重新安裝巨集",
      reinstallHandout: "重新安裝講義",
      showHelp: "顯示說明",
      reorderConditions: "重新排列狀態列",
      reportToken: "報告令牌條件",
      savedEffects: "保存的效果",
      addSavedEffect: "加入已儲存的效果",
      editSaved: "編輯",
      removeSaved: "消除",
      promoteSaved: "新增到轉彎追蹤器",
      snoozeSaved: "貪睡",
      clearSnooze: "清除貪睡"
    },
    title: {
      menu: "選單",
      removalMenu: "Condition Tracker 移除",
      config: "設定",
      configTracker: "Condition Tracker 設定",
      help: "說明",
      applied: "已套用",
      removed: "狀態已移除",
      cleanup: "清理完成",
      macroReinstalled: "巨集已重新安裝",
      handoutReinstalled: "講義已重新安裝",
      warning: "警告",
      error: "錯誤",
      turnOrder: "回合順序",
      noConditions: "沒有狀態",
      tokenMoved: "Token 已移動",
      markedDead: "已標記為死亡",
      zeroHp: "{name} — 0 生命值",
      moveToken: "{name} — 移動 Token？",
      scriptReady: "腳本已就緒",
      conditionReorder: "行動順序已變更",
      tokenReport: "代幣狀況報告",
      savedEffects: "保存的效果",
      savedAdd: "加入已儲存的效果",
      savedEdit: "編輯已儲存的效果",
      savedRemoved: "已儲存的效果已刪除",
      savedPromoted: "新增到轉彎追蹤器",
      savedSnoozed: "提醒已延遲",
      savedSnoozeCleared: "貪睡已清除",
      hiddenEffects: "隱藏效果 — {name}"
    },
    heading: {
      quickActions: "快速動作",
      settings: "設定",
      markerMappings: "標記對應",
      result: "結果",
      info: "資訊",
      commandOptions: "指令選項",
      promptUi: "精靈介面",
      examples: "範例",
      summary: "摘要",
      appliedTo: "適用條件",
      appliedBy: "適用條件",
      savedEffectsFor: "已儲存 {name} 的效果",
      visibility: "能見度",
      snoozeOptions: "貪睡提醒",
      promoteOptions: "升級為轉彎追蹤器",
      editActions: "編輯動作"
    },
    msg: {
      noActive: "目前沒有追蹤中的狀態。",
      configReset: "設定已重設為模組預設值。",
      unknownConfig: "未知的設定選項。使用 --config 查看支援的設定。",
      macroReinstalled: "{wizard}、{multiTarget}、{reportToken}、{saved} 和 {classify} 巨集已為目前所有 GM 玩家重新安裝。",
      handoutReinstalled: "說明講義 {handout} 已重新安裝。",
      duplicate: "相同的來源、主體、目標、狀態和自訂文字已經存在。",
      noTargets: "未指定多目標套用的目標 Token。",
      noSelection: "使用 --multi-target 前，請先在地圖上選擇至少一個 Token。",
      invalidIds: "目前選取項目中沒有有效的 Token ID。",
      reSelectTokens: "找不到原本選取的 Token。請重新選擇 Token 後再試一次。",
      conditionNotFound: "找不到狀態 ID。",
      gmOnly: "Condition Tracker 指令僅限 GM 使用。",
      commandFailed: "無法安全完成此指令。請檢查 API 主控台。",
      sourceTokenNotFound: "找不到來源 Token。",
      targetTokenNotFound: "找不到目標 Token。",
      subjectTokenNotFound: "找不到主體 Token。",
      invalidCondition: "狀態必須是預先定義的狀態之一或 Other。",
      subjectOnlyCustom: "--subject 僅適用於 Spell、Ability、Advantage、Disadvantage 和 Other。",
      subjectBypassInvalid: "提供值時，--subjectPromptBypass 需為 true 或 false。",
      customDetailsRequired: "{condition} 需要詳細資料。使用 --other 提供內容。",
      markerConfigFormat: "標記設定格式：--config marker Grappled=grab",
      markerPredefinedRequired: "標記設定需要預先定義的狀態名稱。",
      markerNameRequired: "標記設定需要非空白的標記名稱。",
      markerSet: "{condition} 標記已設定為 {marker}。",
      healthBarSet: "生命值欄位已設定為 {bar}。",
      boolSet: "{key} 已設定為 {value}。",
      expectedBoolean: "應為 true 或 false。",
      invalidHealthBar: "生命值欄位必須是 bar1_value、bar2_value 或 bar3_value。",
      markersDisabled: "標記已停用。",
      noMarkerConfigured: "此狀態未設定標記。",
      markerApplied: "已套用標記：{marker}",
      markerPresent: "標記已存在：{marker}",
      langSet: "語言已設定為 {locale}。",
      invalidLocale: "無效的語言環境。支援的語言環境：{locales}。",
      otherDurationRequiresRounds: "其他持續時間需要數字輪數，例如 --duration 5 rounds。",
      invalidDuration: "持續時間必須是直到移除、回合結束選項，或正數輪數。",
      zeroHpNoConditions: "{name} 已降至 0 HP，且沒有 active 狀態。",
      zeroHpConditions: "{name} 已降至 0 HP。選擇要移除的狀態：",
      removeAllBtn: "移除 {name} 的所有狀態",
      markIncapacitated: "標記為失能",
      removeFromTurnOrder: "從回合順序移除",
      alreadyIncapacitated: "{name} 已經失能。",
      tokenRemovedFromTurn: "{name} 已從回合順序移除。",
      tokenNotInTurn: "在回合順序中找不到 {name}。",
      moveTokenPrompt: "要將 {name} 移至地圖圖層，使其保持可見但不干擾其他 Token 嗎？",
      moveTokenBtn: "將 {name} 移至地圖圖層",
      tokenMoved: "{name} 已移至地圖圖層。",
      tokenNotFound: "找不到 Token。",
      noActiveConditions: "{name} 沒有可移除的 active 狀態。",
      deadNoConditions: "{name} 已標記為死亡。沒有 active 狀態。",
      scriptReady: "{name} 已啟用，版本為 {version}。",
      reachedZeroHp: "{name} 達到 0 HP",
      manuallyRemoved: "已手動移除",
      durationExpired: "持續時間已結束",
      markedAsDead: "{name} 已標記為死亡",
      conditionReorder: "行動順序已變更，{count} 個追蹤中的狀態列可能已不在正確位置。點擊下方將其還原至指定代幣之後。",
      conditionsReordered: "狀態列已重新排列至其指定代幣之後。",
      noTokensSelectedReport: "在使用 --report-token 之前，至少在板上選擇一個令牌。",
      noConditionsAppliedTo: "{name} 沒有套用任何有效條件。",
      noConditionsAppliedBy: "{name} 沒有適用於其他人的有效條件。",
      noSavedEffects: "沒有為 {name} 儲存已儲存的效果。",
      noTokenSelectedSaved: "在使用 --saved 之前選擇板上的令牌。",
      savedEffectAdded: "為 {name} 增加了儲存的效果。",
      savedEffectUpdated: "已儲存的效果已更新。",
      savedEffectRemoved: "已刪除已儲存的效果。",
      savedEffectNotFound: "未找到保存的效果。",
      savedInvalidVisibility: "可見性無效。使用 public、masked 或 gm。",
      savedConditionRequired: "Condition type is required. Use --condition <type>.",
      savedPromotedPublic: "效果已作為公開添加到回合追蹤器中。",
      savedPromotedMasked: "加入回合追蹤器中的效果被遮蓋 — 玩家看到：{publicLabel}。",
      savedPromotedGm: "效果僅限 GM — 不會建立回合追蹤器行。當該標記到達回合順序的頂部時，提醒系統將顯示它。",
      savedSnoozed: "提醒已延遲：{scope}。",
      savedSnoozeCleared: "貪睡清除。",
      hiddenEffectsReminder: "隱藏效果在 {name} 上處於作用中狀態。",
      visibilityPublicHint: "所有人都可以看到完整的標籤",
      visibilityMaskedHint: "向玩家顯示的模糊標籤",
      visibilityGmHint: "僅 GM 耳語，無回合追蹤行"
    },
    removal: {
      conditionField: "狀態",
      reasonField: "原因",
      turnRowField: "回合追蹤列",
      markerField: "標記",
      notConfigured: "未設定",
      markerRemoved: "已移除（{marker}）",
      markerRetained: "保留（{marker}）",
      rowRemoved: "已移除",
      rowMissing: "已不存在",
      manualReason: "手動移除"
    },
    saved: {
      visibility: {
        public: "民眾",
        masked: "蒙面",
        gm: "限通用汽車"
      },
      snooze: {
        thisTurn: "本輪",
        oneRound: "1 輪",
        threeRounds: "3輪",
        thisCombat: "這場戰鬥",
        rounds: "{n} 輪"
      },
      field: {
        gmLabel: "通用汽車標籤",
        publicLabel: "公共標籤",
        visibility: "能見度",
        source: "來源",
        condition: "狀態"
      },
      prompt: {
        enterGmLabel: "完整效果說明（僅限GM）",
        enterPublicLabel: "向玩家顯示的模糊標籤"
      },
      snoozed: "打瞌睡"
    },
    classify: {
      title: "角色分類",
      showTitle: "分類診斷",
      showHeading: "Token 分類詳情",
      resultHeading: "已套用覆寫",
      noSelection: "使用 --classify 前，請先在版面上選取至少一個 Token。",
      invalidType: "無效的分類類型：{type}。請使用 pc、npc、ignored 或 auto。",
      set: "{name} → {type}（範圍：{scope}）",
      cleared: "{name} 覆寫已清除（範圍：{scope}）— 自動偵測已恢復。",
      setTokenFallback: "{name} → {type}（Token 覆寫 — 未連結角色卡）。",
      clearedTokenFallback: "{name} Token 覆寫已清除 — 自動偵測已恢復。",
      fieldToken: "代幣",
      fieldType: "分類",
      fieldSource: "來源",
      fieldReason: "原因"
    },
    cleanup: {
      orphaned: "孤立狀態項目",
      stale: "過期狀態項目",
      orphanedRows: "孤立回合追蹤列",
      unusedMarkers: "未使用標記"
    },
    apply: {
      turnAppended: "目標不在回合順序中；狀態列已附加。",
      turnInserted: "狀態列已插入目標 Token 下方。"
    }
  },
  handout: {
    versionLabel: "版本",
    subtitle: "D&D 5e 狀態效果管理器",
    footerNote: "此講義會在每次腳本載入時自動建立並更新。",
    overview: {
      heading: "總覽",
      body: "Condition Tracker 會在 Roll20 回合追蹤器中以標籤列管理 D&D 5e 狀態與自訂效果。你可以將狀態套用到 Token、依照先攻順序追蹤持續時間，並在回合結束時自動移除到期效果。所有指令僅限 GM 使用，可由聊天或已安裝的巨集觸發。"
    },
    quickStart: {
      heading: "快速開始",
      colCommand: "指令",
      colDesc: "描述",
      rows: [
        [
          "!條件追蹤器--提示",
          "逐步精靈 — 互動式選擇狀態、Token 與持續時間。也可使用 ConditionTrackerWizard 巨集。"
        ],
        [
          "!條件追蹤器－多目標",
          "同時將一個狀態套用到多個 Token。也可使用 ConditionTrackerMultiTarget 巨集。"
        ],
        [
          "!條件追蹤器--報告令牌",
          "首先选择一个或多个令牌，然后运行此命令以获取 GM 耳语，列出每个选定令牌所应用的每个条件。也可當 ConditionTrackerReportToken 巨集。"
        ],
        [
          "!condition-tracker --menu",
          "開啟主要管理選單，可套用、檢視或移除狀態。"
        ]
      ]
    },
    commandsRef: {
      heading: "指令參考",
      colFlag: "參數",
      colDesc: "描述",
      rows: [
        [
          " - 迅速的",
          "互動式逐步精靈介面"
        ],
        [
          "--多目標",
          "一次將狀態套用到多個目標 Token"
        ],
        [
          " - 選單",
          "顯示主選單（加入 remove 可開啟移除選單）"
        ],
        [
          "--來源X --目標Y --條件Z",
          "不使用精靈直接套用狀態"
        ],
        [
          "--持續時間<值>",
          "直接套用時的持續時間（例如 2 rounds）"
        ],
        [
          "--其他<文字>",
          "Spell / Ability / Other 效果類型的自訂文字"
        ],
        [
          "--remove <條件 ID>",
          "依唯一 ID 移除特定狀態"
        ],
        [
          "--config <選項> <值>",
          "調整設定（見下方設定章節）"
        ],
        [
          "--prompt --subjectPromptBypass true | false",
          "僅對此指令覆寫 subjectPromptBypass（也支援 --subject-prompt-bypass）"
        ],
        [
          " - 清理",
          "校正狀態 — 移除孤立狀態與回合追蹤列"
        ],
        [
          "--重新排序條件",
          "手動將狀態列重新排列到輪序中其對應代幣之後"
        ],
        [
          "--重新安裝巨集",
          "重新建立或更新 GM 巨集"
        ],
        [
          "--重新安裝講義",
          "重新建立或更新本地化說明講義"
        ],
        [
          "--報表令牌",
          "為每個選定的代幣產生僅 GM 的條件報告（應用於其並由其應用的條件）"
        ],
        [
          "--已儲存",
          "查看所選令牌保存的長期效果（首先選擇令牌）"
        ],
        [
          "--儲存新增",
          "將已儲存的效果（詛咒、疾病等）新增至所選標記"
        ],
        [
          "--saved edit <id>",
          "按 id 編輯現有已儲存效果"
        ],
        [
          "--saved remove <id>",
          "透過 id 刪除已儲存的效果"
        ],
        [
          "--saved promote <id> --visibility public|masked|gm",
          "將保存的效果複製到回合追蹤器（公共/屏蔽）中或將其標記為僅限 GM 激活"
        ],
        [
          "--saved snooze <id> --scope turn|rounds|combat --rounds <n>",
          "暫停當前回合、N 回合或本次戰鬥的已儲存效果提醒"
        ],
        [
          "--saved snooze-clear <id>",
          "清除已儲存效果的活動暫停"
        ],
        [
          "--lang <語言環境>",
          "以額外語言環境輸出此指令訊息（雙語模式）"
        ],
        [
          "--分類 pc|npc|忽略",
          "覆寫選取 Token 的角色類型 — 請先選取 Token。預設範圍為角色（寫入 ct_mod_actor_type 屬性）；加上 --scope token 可改為儲存在腳本狀態中"
        ],
        [
          "--將汽車分類",
          "移除角色類型覆寫，恢復選取 Token 的自動偵測"
        ],
        [
          "--分類顯示",
          "對每個選取的 Token 傳送分類診斷密語 — 顯示偵測到的類型、偵測來源與原因"
        ],
        [
          " - 幫助",
          "在聊天中顯示簡短說明卡"
        ]
      ]
    },
    standardConditions: {
      heading: "標準狀態（D&amp;D 5e）",
      colCondition: "狀態"
    },
    customEffects: {
      heading: "自訂效果類型",
      colType: "類型",
      colNotes: "備註",
      rows: [
        [
          "🔮 咒語",
          "追蹤具名法術效果 — 會提示輸入法術名稱"
        ],
        [
          "🎯能力",
          "追蹤具名職業或種族能力 — 會提示輸入能力名稱"
        ],
        [
          "🍀 優勢",
          "記錄一個 Token 對另一個 Token 的優勢；在先攻中與來源分組"
        ],
        [
          "⬇️缺點",
          "記錄劣勢；在先攻中與來源分組"
        ],
        [
          "📝其他",
          "自由格式自訂標籤 — 會提示輸入描述"
        ]
      ]
    },
    durationOptions: {
      heading: "持續時間選項",
      intro: "剩餘數會顯示在回合追蹤器的 pr 欄位，並在錨定 Token 的回合結束時遞減。",
      colOption: "選項",
      colBehaviour: "行為",
      rows: [
        [
          "直至移除",
          "永久 — 必須透過選單或 --remove 手動移除"
        ],
        [
          "目標下一回合結束",
          "目標 Token 的下一個回合結束時到期"
        ],
        [
          "源的下一輪結束",
          "來源 Token 的下一個回合結束時到期"
        ],
        [
          "1 / 2 / 3 / 10 輪",
          "固定倒數；每次錨定 Token 回合結束遞減一次"
        ]
      ]
    },
    savedEffects: {
      heading: "保存的效果",
      intro: "保存的效果可讓您在回合追蹤器之外儲存長期條件 - 詛咒、疾病、毒藥、隱藏的減益效果和其他非戰鬥條件。它們保留在腳本狀態中，並且可以在戰鬥開始時選擇性地複製到回合追蹤器中。",
      visibility: {
        heading: "可見性模式",
        rows: [
          [
            "民眾",
            "完整效果標籤在回合追蹤器和公共聊天中可見。"
          ],
          [
            "蒙面的",
            "向玩家顯示模糊的公共標籤；完整詳細資訊僅供 GM 參考。"
          ],
          [
            "通用汽車",
            "無轉彎追蹤器行。完整的詳細資訊儲存在狀態中，並在受影響的代幣達到計劃頂部時向 GM 低聲傳達。"
          ]
        ]
      },
      commands: {
        heading: "保存的效果命令",
        intro: "所有 --saved 指令僅適用於 GM。在執行 --saved 或 --saved add 之前選擇一個令牌。",
        rows: [
          [
            "!條件追蹤器--已儲存",
            "查看所選標記的已儲存效果。"
          ],
          [
            "!condition-tracker --saved 添加",
            "啟動新增保存效果精靈。"
          ],
          [
            "!condition-tracker --saved edit <id>",
            "編輯現有已儲存效果的標籤或可見性。"
          ],
          [
            "!condition-tracker --saved remove <id>",
            "永久刪除已儲存的效果。"
          ],
          [
            "!condition-tracker --saved promote <id> --visibility public|masked|gm",
            "將保存的效果複製到回合追蹤器（公共或屏蔽）中，或確認它是僅 GM 追蹤的。"
          ],
          [
            "!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>",
            "暫停本回合、N 輪或本次戰鬥的 GM 提醒。"
          ],
          [
            "!condition-tracker --saved snooze-clear <id>",
            "清除活動的暫停，以便立即恢復提醒。"
          ]
        ]
      },
      reminders: {
        heading: "總經理提醒",
        body: "當帶有 gm 或已儲存效果的標記到達回合追蹤器頂部時，GM 會收到一條耳語，其中列出了帶有操作按鈕的隱藏效果。同一回合內的重複提醒將會被抑制。使用「暫停」按鈕可以抑制一個回合、幾輪或當前戰鬥剩餘時間的提醒。"
      }
    },
    actorClassification: {
      heading: "角色分類",
      intro: "Condition Tracker 自動判斷每個 Token 是 PC、NPC 還是被忽略的物件（地圖標記、場景道具、法術模板）。未連結的 Token 預設為忽略。使用 --classify 可覆寫任何 Token 的自動偵測結果。",
      detectionOrder: {
        heading: "偵測順序",
        colStep: "步驟",
        colCheck: "檢查",
        colResult: "結果",
        rows: [
          [
            "1",
            "Token 狀態覆寫（--classify --scope token）",
            "pc / npc / 被忽略"
          ],
          [
            "2",
            "角色 ct_mod_actor_type 屬性（--classify --scope character）",
            "pc / npc / 被忽略"
          ],
          [
            "3",
            "未連結 Token — 無角色卡",
            "被忽略"
          ],
          [
            "4",
            "遊戲系統適配器（npc / is_npc 屬性）",
            "個人電腦/NPC"
          ],
          [
            "5",
            "通用 NPC 屬性掃描（npc, is_npc, npcflag, sheet_type, character_type）",
            "個人電腦/NPC"
          ],
          [
            "6",
            "角色 controlledby 備援",
            "個人電腦/NPC"
          ]
        ]
      },
      types: {
        heading: "分類類型",
        colType: "類型",
        colMeaning: "含義",
        rows: [
          [
            "個人電腦",
            "玩家角色 — 在精靈和偵測中始終作為 PC 包含"
          ],
          [
            "NPC",
            "非玩家角色 — 始終作為 NPC 包含"
          ],
          [
            "被忽略",
            "從不顯示或追蹤 — 從精靈 Token 選擇器中排除"
          ],
          [
            "未知",
            "僅自動偵測；無法確定類型（在精靈中視為 NPC 處理）"
          ]
        ]
      },
      commands: {
        heading: "分類指令",
        intro: "執行 --classify 指令前，請先選取一個或多個 Token。",
        rows: [
          [
            "!condition-tracker --將電腦分類",
            "將選取的 Token 標記為 PC（預設範圍：角色）。"
          ],
          [
            "!condition-tracker --對 npc 進行分類",
            "將選取的 Token 標記為 NPC。"
          ],
          [
            "!condition-tracker --classify 被忽略",
            "從所有追蹤中排除選取的 Token。"
          ],
          [
            "!condition-tracker --將汽車分類",
            "移除覆寫 — 恢復自動偵測。"
          ],
          [
            "!condition-tracker --分類顯示",
            "顯示每個選取 Token 的分類診斷（類型、來源、原因）。"
          ],
          [
            "!condition-tracker --classify pc --scope token",
            "Token 層級的覆寫儲存在腳本狀態中 — 適用於未連結的 Token。"
          ],
          [
            "!condition-tracker --classify pc --scope 字符",
            "角色層級的覆寫寫入 ct_mod_actor_type 屬性 — 適用於使用相同角色卡的所有 Token。"
          ]
        ]
      }
    },
    configuration: {
      heading: "設定",
      intro: "使用 !condition-tracker --config &lt;option&gt; &lt;value&gt;，或主選單中的設定按鈕。",
      colOption: "選項",
      colValues: "值",
      colDesc: "描述",
      rows: [
        [
          "useMarkers",
          "true / false",
          "新增狀態時將 Roll20 狀態標記套用到 Token"
        ],
        [
          "useIcons",
          "真/假",
          "在回合追蹤列中顯示短圖示代碼（例如 [G]）而非 emoji"
        ],
        [
          "subjectPromptBypass",
          "真/假",
          "略過 Spell / Ability / Other 效果的可選主體 Token 步驟"
        ],
        [
          "suppressPublicChat",
          "真/假",
          "隱藏所有公開聊天公告（施加與移除訊息）。GM 的私訊不受影響。"
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "要監控的 Token 欄位；降至 0 時提示 GM 清理狀態"
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "聊天訊息與說明講義的輸出語言"
        ],
        [
          "marker",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "覆寫特定狀態使用的狀態標記（例如 marker Grappled=grab）"
        ]
      ]
    },
    defaultMarkers: {
      heading: "預設狀態標記",
      colCondition: "狀態",
      colMarker: "標記名稱"
    },
    availableLocales: {
      heading: "可用翻譯",
      intro: "使用 language 設定選項，可將聊天訊息與說明講義切換到任何支援的語言環境。也接受 en、zh、pt 等短別名。",
      colLocale: "語言環境",
      colLanguage: "語言",
      colFile: "翻譯檔案"
    }
  },
  templates: {
    display: {
      custom: "{emoji} {target} 受到 {effect} 影響（{source}）",
      advantage: "{emoji} {source} 對 {target}{subject} 具有優勢",
      disadvantage: "{emoji} {source} 對 {target}{subject} 具有劣勢",
      noBy: "{emoji} {target} {past}（{source}）",
      self: "{target} {past}",
      standard: "{emoji} {target} 因 {source} 而{past}"
    },
    apply: {
      custom: "{source} 對 {target} 施加 {effect}。",
      advantage: "{source} 對 {target}{subject} 具有優勢。",
      disadvantage: "{source} 對 {target}{subject} 具有劣勢。",
      self: "{target} {past}。",
      withSuffix: "{source} {verb} {target} {suffix}。",
      standard: "{source} {verb} {target}。"
    },
    remove: {
      custom: "{target} 不再受到 {effect} 影響。",
      advantage: "{source} 不再對 {target}{subject} 具有優勢。",
      disadvantage: "{source} 不再對 {target}{subject} 具有劣勢。",
      noBy: "{target} 不再{past}。",
      self: "{target} 不再{past}。",
      standard: "{target} 不再因 {source} 而{past}。"
    }
  }
};

export default TRANSLATION;
