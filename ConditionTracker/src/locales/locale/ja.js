const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "つかまれた",
      verb: "つかむ",
    },
    Restrained: {
      past: "拘束された",
      verb: "拘束する",
    },
    Prone: {
      past: "伏せ状態",
      verb: "伏せ状態にする",
      suffix: "傾向のある",
    },
    Poisoned: {
      past: "毒を受けた",
      verb: "毒を与える",
    },
    Stunned: {
      past: "朦朧状態",
      verb: "朦朧状態にする",
    },
    Blinded: {
      past: "盲目状態",
      verb: "盲目状態にする",
    },
    Charmed: {
      past: "魅了状態",
      verb: "魅了する",
    },
    Frightened: {
      past: "恐怖状態",
      verb: "恐怖状態にする",
    },
    Incapacitated: {
      past: "無力状態",
      verb: "無力状態にする",
    },
    Invisible: {
      past: "不可視状態",
      verb: "不可視状態にする",
      suffix: "見えない",
    },
    Paralyzed: {
      past: "麻痺状態",
      verb: "麻痺状態にする",
    },
    Petrified: {
      past: "石化状態",
      verb: "石化状態にする",
    },
    Unconscious: {
      past: "気絶状態",
      verb: "気絶状態にする",
      suffix: "無意識",
    },
    Spell: {
      past: "呪文の影響下",
      verb: "呪文をかける",
    },
    Ability: {
      past: "能力の影響下",
      verb: "能力を使う",
    },
    Advantage: {
      past: "有利を持つ",
      verb: "有利を与える",
      noBy: true,
    },
    Disadvantage: {
      past: "不利を持つ",
      verb: "不利を与える",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "つかみ",
    Restrained: "拘束",
    Prone: "伏せ",
    Poisoned: "毒",
    Stunned: "朦朧",
    Blinded: "盲目",
    Charmed: "魅了",
    Frightened: "恐怖",
    Incapacitated: "無力",
    Invisible: "不可視",
    Paralyzed: "麻痺",
    Petrified: "石化",
    Unconscious: "気絶",
    Dazed: "放心状態",
    Deafened: "耳が聞こえない",
    Dominated: "支配された",
    Dying: "瀕死",
    Immobilized: "固定化された",
    Marked: "マークあり",
    Slowed: "遅くなった",
    Weakened: "弱体化した",
    Confused: "混乱した",
    Cowering: "縮こまる",
    Dazzled: "眩しい",
    Disabled: "無効",
    Exhausted: "疲れ果てた",
    Fascinated: "魅了された",
    Fatigued: "疲れた",
    "Flat-Footed": "偏平足",
    Helpless: "無力",
    Nauseated: "吐き気がする",
    Panicked: "パニックになった",
    Pinned: "固定された",
    Shaken: "揺れた",
    Sickened: "病気になった",
    Staggered: "千鳥状",
    Clumsy: "不器用",
    Concealed: "隠された",
    Controlled: "制御された",
    Doomed: "運命の",
    Drained: "排水された",
    Encumbered: "負担がある",
    Enfeebled: "弱体化",
    Fleeing: "逃走中",
    Grabbed: "掴まれた",
    Hidden: "隠れた",
    "Off-Guard": "油断",
    Quickened: "速くなった",
    Stupefied: "呆然とした",
    Undetected: "未検出",
    Wounded: "負傷者",
    Asleep: "眠っている",
    Bleeding: "出血",
    Burning: "燃焼",
    Dead: "死んだ",
    "Off-Kilter": "オフキルター",
    "Off-Target": "的外れ",
    Overburdened: "過重な負担",
    Stable: "安定した",
    "Bleeding Out": "出血",
    Bound: "バウンド",
    Distracted: "気が散る",
    Berserk: "ベルセルク",
    "Indefinite Insanity": "無限の狂気",
    Injured: "怪我した",
    Mania: "マニア",
    Phobia: "恐怖症",
    "Seriously Wounded": "重傷",
    "Temporary Insanity": "一時的な狂気",
    Ablaze: "燃え上がる",
    Broken: "壊れた",
    Surprised: "驚いた",
    Bleed: "ブリード",
    "Energy Drained": "エネルギーの消耗",
    Entangled: "もつれた",
    Fear: "恐れ",
    Hampered: "妨げられた",
    "Ongoing Damage": "継続的なダメージ",
    Vulnerable: "脆弱",
    Diseased: "病気の",
    Held: "開催",
    Compelled: "強制",
    Impaired: "障害のある",
    Panicking: "パニック状態",
    Disoriented: "見当識障害",
    Ensnared: "罠にかかった",
    Strained: "緊張した",
    Afraid: "恐れている",
    Angry: "怒り",
    Corrupted: "破損した",
    Harmed: "被害を受けた",
    Hungry: "お腹がすいた",
    Infected: "感染した",
    Isolated: "孤立した",
    "Blood Bound": "ブラッドバウンド",
    Entranced: "うっとり",
    Frenzied: "狂乱の",
    Torpor: "昏睡状態",
    "Knocked Down": "ノックダウン",
    Paradox: "パラドックス",
    "Willpower Spent": "消費された意志力",
    Bedlam: "ひどく騒ぐ",
    "Chimera-Touched": "キメラタッチ",
    "Mortally Wounded": "致命傷を負った",
    Insane: "非常識な",
    Debilitated: "衰弱した",
    Deprived: "剥奪された",
    Shocked: "ショックを受けた",
    Intoxicated: "酔った",
    Spell: "呪文",
    Ability: "能力",
    Advantage: "有利",
    Disadvantage: "不利",
    Other: "その他",
  },
  templates: {
    display: {
      custom: "{emoji} {target}は{effect}の影響下にある（{source}）",
      advantage: "{emoji} {source}は{target}{subject}に対して有利を持つ",
      disadvantage: "{emoji} {source}は{target}{subject}に対して不利を持つ",
      noBy: "{emoji} {target}は{past}（{source}）",
      self: "{target}は{past}",
      standard: "{emoji} {target}は{source}によって{past}",
    },
    apply: {
      custom: "{source}は{target}に{effect}を適用した。",
      advantage: "{source}は{target}{subject}に対して有利を持つ。",
      disadvantage: "{source}は{target}{subject}に対して不利を持つ。",
      self: "{target}は{past}。",
      withSuffix: "{source}は{target}を{suffix}状態にした（{verb}）。",
      standard: "{source}は{target}を{verb}。",
    },
    remove: {
      custom: "{target}はもはや{effect}の影響を受けていない。",
      advantage: "{source}はもはや{target}{subject}に対して有利を持たない。",
      disadvantage: "{source}はもはや{target}{subject}に対して不利を持たない。",
      noBy: "{target}はもはや{past}ではない。",
      self: "{target}はもはや{past}ではない。",
      standard: "{target}はもはや{source}によって{past}ではない。",
    },
  },
  ui: {
    wizard: {
      selectCondition: "状態を選択",
      selectSource: "ソーストークンを選択",
      selectTarget: "ターゲットトークンを選択",
      selectSubject: "対象を選択",
      selectDuration: "継続時間を選択",
      confirmTargetTitle: "ターゲットリストを確認",
      applyEffectTitle: "{condition}の効果を適用",
      noTokens: "アクティブなページに名前付きトークンが見つかりません。",
      confirmIntro: "以下のトークンが状態を受け取ります：",
      confirmBtn: "ターゲットリストを確認",
      enterDetails: "効果の詳細を入力",
      noneBtn: "なし",
      noneOrSourceBtn: "なし、または発生源に適用",
      subjectDesc: "効果をもたらすものを選択してください。",
      sourceDesc: "状態または効果を生み出すクリーチャーを選択してください。",
      targetDesc: "状態または効果を受け取るクリーチャーを選択してください。",
      otherText: "カスタム状態テキスト",
      effectDetails: "{condition}の詳細",
    },
    col: {
      players: "プレイヤー",
      npcs: "NPC",
      conditions: "状態",
      customEffects: "カスタム効果",
      permanentTurnEnd: "恒久的 / ターン終了",
      rounds: "ラウンド",
      command: "コマンド",
      result: "結果",
      field: "フィールド",
      value: "値",
      option: "オプション",
      condition: "状態",
      marker: "マーカー",
      item: "項目",
      removed: "削除済み",
      details: "詳細",
      description: "説明",
      scenario: "シナリオ",
      gameSystem: "ゲームシステム",
      duration: "間隔",
    },
    dur: {
      untilRemoved: "削除されるまで",
      endOfTargetTurn: "ターゲットの次のターン終了時",
      endOfSourceTurn: "ソースの次のターン終了時",
      round1: "1ラウンド",
      round2: "2ラウンド",
      round3: "3ラウンド",
      round10: "10ラウンド",
      custom: "カスタム",
      customPrompt: "ラウンド数",
      untilRemovedDisplay: "削除されるまで",
      turnsRemaining: "残りターン終了数：{n}",
    },
    btn: {
      openWizard: "ウィザードを開く",
      openMultiTarget: "マルチターゲットウィザードを開く",
      openRemovalList: "削除リストを開く",
      showConfig: "設定を表示",
      runCleanup: "クリーンアップを実行",
      reinstallMacro: "マクロを再インストール",
      reinstallHandout: "ハンドアウトを再インストール",
      showHelp: "ヘルプを表示",
      reorderConditions: "状態行を並び替え",
      reportToken: "レポートトークンの条件",
      savedEffects: "保存されたエフェクト",
      addSavedEffect: "保存したエフェクトを追加",
      editSaved: "編集",
      removeSaved: "取り除く",
      promoteSaved: "ターントラッカーに追加",
      snoozeSaved: "スヌーズ",
      clearSnooze: "クリアスヌーズ",
    },
    title: {
      menu: "メニュー",
      removalMenu: "Condition Tracker — 削除",
      config: "設定",
      configTracker: "Condition Tracker 設定",
      help: "ヘルプ",
      applied: "適用済み",
      removed: "状態削除済み",
      cleanup: "クリーンアップ完了",
      macroReinstalled: "マクロ再インストール済み",
      handoutReinstalled: "ハンドアウト再インストール済み",
      warning: "警告",
      error: "エラー",
      turnOrder: "ターン順序",
      noConditions: "状態なし",
      tokenMoved: "トークン移動済み",
      markedDead: "死亡としてマーク",
      zeroHp: "{name} — HP 0",
      moveToken: "{name} — トークンを移動しますか？",
      scriptReady: "スクリプト準備完了",
      conditionReorder: "ターン順序変更",
      tokenReport: "トークン状態レポート",
      savedEffects: "保存されたエフェクト",
      savedAdd: "保存したエフェクトを追加",
      savedEdit: "保存されたエフェクトを編集する",
      savedRemoved: "保存されたエフェクトが削除されました",
      savedPromoted: "ターントラッカーに追加",
      savedSnoozed: "リマインダーがスヌーズされました",
      savedSnoozeCleared: "スヌーズが解除されました",
      hiddenEffects: "隠し効果 — {name}",
    },
    heading: {
      quickActions: "クイックアクション",
      settings: "設定",
      markerMappings: "マーカーマッピング",
      result: "結果",
      info: "情報",
      commandOptions: "コマンドオプション",
      promptUi: "ウィザードUI",
      examples: "例",
      summary: "まとめ",
      appliedTo: "適用される条件",
      appliedBy: "適用される条件",
      savedEffectsFor: "{name} の保存済みエフェクト",
      visibility: "可視性",
      snoozeOptions: "スヌーズリマインダー",
      promoteOptions: "ターントラッカーに昇格",
      editActions: "アクションの編集",
    },
    msg: {
      noActive: "追跡中のアクティブな状態はありません。",
      configReset: "設定がMODのデフォルトにリセットされました。",
      unknownConfig:
        "不明な設定オプションです。--configを使用してサポートされている設定を確認してください。",
      macroReinstalled:
        "{wizard}、{multiTarget}、{reportToken}、{saved}および{classify}マクロが現在のすべてのGMプレイヤーに再インストールされました。",
      handoutReinstalled:
        "ヘルプハンドアウト{handout}が再インストールされました。",
      duplicate:
        "同一のソース、対象、ターゲット、状態、カスタムテキストの組み合わせがすでにアクティブです。",
      noTargets:
        "マルチターゲット適用のためのターゲットトークンが指定されていません。",
      noSelection:
        "--multi-targetを使用する前に、ボード上で少なくとも1つのトークンを選択してください。",
      invalidIds: "現在の選択に有効なトークンIDが見つかりません。",
      reSelectTokens:
        "元々選択されたトークンが見つかりません。トークンを再選択してもう一度お試しください。",
      conditionNotFound: "状態IDが見つかりません。",
      gmOnly: "Condition TrackerのコマンドはGM専用です。",
      commandFailed:
        "コマンドを安全に完了できませんでした。詳細はAPIコンソールを確認してください。",
      sourceTokenNotFound: "ソーストークンが見つかりません。",
      targetTokenNotFound: "ターゲットトークンが見つかりません。",
      subjectTokenNotFound: "対象トークンが見つかりません。",
      invalidGameSystem:
        "無効なゲームシステムです。 --config ゲームシステム &lt;id&gt; を使用してください。サポートされているシステム:",
      gameSystemSet:
        "ゲーム システムは {system} に設定されました。マーカーはシステムのデフォルトにリセットされました。",
      invalidCondition:
        "状態は事前定義された状態またはその他のいずれかである必要があります。",
      subjectOnlyCustom:
        "--subjectは呪文、能力、有利、不利、その他にのみ有効です。",
      subjectBypassInvalid:
        "--subjectPromptBypassは値が指定された場合、trueまたはfalseを期待します。",
      customDetailsRequired:
        "{condition}の詳細が必要です。--otherを使用して指定してください。",
      markerConfigFormat: "マーカー設定の形式：--config marker Grappled=grab",
      markerPredefinedRequired:
        "マーカー設定には事前定義された状態名が必要です。",
      markerNameRequired: "マーカー設定には空でないマーカー名が必要です。",
      markerSet: "{condition}のマーカーを{marker}に設定しました。",
      healthBarSet: "ヘルスバーを{bar}に設定しました。",
      boolSet: "{key}を{value}に設定しました。",
      expectedBoolean: "trueまたはfalseが必要です。",
      invalidHealthBar:
        "ヘルスバーはbar1_value、bar2_value、またはbar3_valueである必要があります。",
      markersDisabled: "マーカーは無効になっています。",
      noMarkerConfigured: "この状態に設定されたマーカーはありません。",
      markerApplied: "マーカーを適用しました：{marker}",
      markerPresent: "マーカーはすでに存在します：{marker}",
      langSet: "言語を{locale}に設定しました。",
      invalidLocale:
        "無効なロケールです。サポートされているロケール：{locales}。",
      otherDurationRequiresRounds:
        "その他の継続時間には数値のラウンド数が必要です（例：--duration 5 rounds）。",
      invalidDuration:
        "継続時間は「削除されるまで」、ターン終了オプション、または正のラウンド数である必要があります。",
      zeroHpNoConditions:
        "{name}はHP0になりましたが、アクティブな状態はありません。",
      zeroHpConditions:
        "{name}はHP0になりました。削除する状態を選択してください：",
      removeAllBtn: "{name}のすべての状態を削除",
      markIncapacitated: "無力状態としてマーク",
      removeFromTurnOrder: "ターン順序から削除",
      alreadyIncapacitated: "{name}はすでに無力状態です。",
      tokenRemovedFromTurn: "{name}がターン順序から削除されました。",
      tokenNotInTurn: "{name}はターン順序に見つかりませんでした。",
      moveTokenPrompt:
        "{name}を表示したまま他のトークンの邪魔にならないよう、マップレイヤーに移動しますか？",
      moveTokenBtn: "{name}をマップレイヤーに移動",
      tokenMoved: "{name}がマップレイヤーに移動されました。",
      tokenNotFound: "トークンが見つかりません。",
      noActiveConditions: "{name}には削除するアクティブな状態がありません。",
      deadNoConditions:
        "{name}は死亡としてマークされました。アクティブな状態はありませんでした。",
      scriptReady:
        "{name}はアクティブで、バージョン{version}を使用しています。",
      reachedZeroHp: "{name}がHP0に達しました",
      manuallyRemoved: "手動で削除されました",
      durationExpired: "継続時間が終了しました",
      markedAsDead: "{name}が死亡としてマークされました",
      conditionReorder:
        "ターン順序が変更され、追跡中の{count}件の状態行が正しい位置にない可能性があります。割り当てられたトークンの後に復元するには以下をクリックしてください。",
      conditionsReordered:
        "状態行が割り当てられたトークンの後に再配置されました。",
      noTokensSelectedReport:
        "--report-token を使用する前に、ボード上で少なくとも 1 つのトークンを選択してください。",
      noConditionsAppliedTo:
        "{name} にはアクティブな条件が適用されていません。",
      noConditionsAppliedBy:
        "{name} には、他に適用されるアクティブな条件がありません。",
      noSavedEffects: "{name} には保存されたエフェクトが保存されていません。",
      noTokenSelectedSaved:
        "--saved を使用する前に、ボード上のトークンを選択してください。",
      savedEffectAdded: "{name} の保存済みエフェクトが追加されました。",
      savedEffectUpdated: "保存されたエフェクトが更新されました。",
      savedEffectRemoved: "保存されたエフェクトが削除されました。",
      savedEffectNotFound: "保存されたエフェクトが見つかりません。",
      savedInvalidVisibility:
        "無効な可視性。 public、masked、または gm を使用します。",
      savedConditionRequired:
        "Condition type is required. Use --condition <type>.",
      savedPromotedPublic:
        "エフェクトがターン トラッカーにパブリックとして追加されました。",
      savedPromotedMasked:
        "マスクされた効果がターン トラッカーに追加されました — プレイヤーは次を参照してください: {publicLabel}。",
      savedPromotedGm:
        "効果は GM のみです。ターン トラッカー行は作成されません。このトークンがターン順序の一番上に達すると、リマインダー システムによって表示されます。",
      savedSnoozed: "リマインダーがスヌーズされました: {scope}。",
      savedSnoozeCleared: "スヌーズが解除されました。",
      hiddenEffectsReminder: "隠し効果は{name}で有効になります。",
      visibilityPublicHint: "完全なラベルは全員に表示されます",
      visibilityMaskedHint: "プレーヤーに表示される曖昧なラベル",
      visibilityGmHint: "GM ささやきのみ、ターントラッカー列なし",
    },
    removal: {
      conditionField: "状態",
      reasonField: "理由",
      turnRowField: "ターントラッカー行",
      markerField: "マーカー",
      notConfigured: "未設定",
      markerRemoved: "削除済み（{marker}）",
      markerRetained: "保持（{marker}）",
      rowRemoved: "削除済み",
      rowMissing: "すでに存在しない",
      manualReason: "手動削除",
    },
    saved: {
      visibility: {
        public: "公共",
        masked: "マスクされた",
        gm: "GMのみ",
      },
      snooze: {
        thisTurn: "このターン",
        oneRound: "1ラウンド",
        threeRounds: "3ラウンド",
        thisCombat: "この戦闘",
        rounds: "{n} ラウンド",
      },
      field: {
        gmLabel: "GMラベル",
        publicLabel: "パブリックラベル",
        visibility: "可視性",
        source: "ソース",
        condition: "状態",
      },
      prompt: {
        enterGmLabel: "完全な効果の説明 (GM のみ)",
        enterPublicLabel: "プレイヤーに表示される曖昧なラベル",
      },
      snoozed: "居眠りした",
    },
    classify: {
      title: "アクター分類",
      showTitle: "分類診断",
      showHeading: "トークン分類の詳細",
      resultHeading: "上書きが適用されました",
      noSelection:
        "--classify を使用する前に、ボード上のトークンを少なくとも1つ選択してください。",
      invalidType:
        "無効な分類タイプ: {type}。pc、npc、ignored、または auto を使用してください。",
      set: "{name} → {type}（スコープ: {scope}）",
      cleared:
        "{name} 上書きがクリアされました（スコープ: {scope}）— 自動検出が復元されました。",
      setTokenFallback:
        "{name} → {type}（トークン上書き — キャラクターシートが未リンク）。",
      clearedTokenFallback:
        "{name} トークン上書きがクリアされました — 自動検出が復元されました。",
      fieldToken: "トークン",
      fieldType: "分類",
      fieldSource: "ソース",
      fieldReason: "理由",
    },
    cleanup: {
      orphaned: "孤立した状態エントリ",
      stale: "古くなった状態エントリ",
      orphanedRows: "孤立したターントラッカー行",
      unusedMarkers: "未使用のマーカー",
    },
    apply: {
      turnAppended:
        "ターゲットはターン順序にありませんでした。状態行を末尾に追加しました。",
      turnInserted: "ターゲットトークンの下に状態行を挿入しました。",
    },
  },
  handout: {
    versionLabel: "バージョン",
    subtitle: "D&D 5e ステータス効果マネージャー",
    footerNote:
      "このハンドアウトはスクリプトが読み込まれるたびに自動的に作成・更新されます。",
    overview: {
      heading: "概要",
      body: "Condition TrackerはD&D 5eのステータス状態およびカスタム効果を、Roll20のターントラッカー内のラベル付き行として管理します。トークンに状態を適用し、イニシアチブ順に継続時間を追跡し、ターン終了時に期限切れの効果を自動的に削除します。すべてのコマンドはGM専用で、チャットまたはインストール済みマクロから実行できます。",
    },
    quickStart: {
      heading: "クイックスタート",
      colCommand: "コマンド",
      colDesc: "説明",
      rows: [
        [
          "!condition-tracker --プロンプト",
          "ステップバイステップのウィザード — 状態、トークン、継続時間をインタラクティブに選択します。ConditionTrackerWizardマクロとしても利用できます。",
        ],
        [
          "!condition-tracker --マルチターゲット",
          "1つの状態を複数のトークンに同時に適用します。ConditionTrackerMultiTargetマクロとしても利用できます。",
        ],
        [
          "!条件トラッカー --レポートトークン",
          "まず 1 つ以上のトークンを選択し、次にこのコマンドを実行して、選択した各トークンに適用されるすべての条件をリストする GM ウィスパーを取得します。 ConditionTrackerReportToken マクロとしても使用できます。",
        ],
        [
          "!condition-tracker --menu",
          "状態の適用・確認・削除ボタンを含むメインメニューを開きます。",
        ],
        [
          "!コンディショントラッカー --classify ショー",
          "まず 1 つ以上のトークンを選択し、このコマンドを実行すると、各トークンのアクター分類、検出ソース、および理由を示す診断ウィスパーが表示されます。 --classify pc|npc|ignored を使用してオーバーライドするか、--classify auto を使用して自動検出を復元します。 ConditionTrackerClassify マクロとしても使用できます。",
        ],
        [
          "!条件トラッカー --menu",
          "条件を適用、確認、または削除するボタンのあるメイン管理メニューを開きます。",
        ],
      ],
    },
    commandsRef: {
      heading: "コマンドリファレンス",
      colFlag: "フラグ",
      colDesc: "説明",
      rows: [
        [" - プロンプト", "インタラクティブなステップバイステップウィザードUI"],
        ["--マルチターゲット", "複数のターゲットトークンに状態を一括適用"],
        [" - メニュー", "メインメニューを表示（削除メニューにはremoveを追加）"],
        [
          "--ソース X --ターゲット Y --条件 Z",
          "ウィザードを使わずに直接状態を適用",
        ],
        ["--duration &lt;値&gt;", "直接適用時の継続時間（例：2 rounds）"],
        [
          "--other &lt;テキスト&gt;",
          "呪文・能力・その他の効果タイプ用のカスタムテキスト",
        ],
        ["--remove &lt;状態ID&gt;", "一意のIDで特定の状態を削除"],
        [
          "--config &lt;オプション&gt; &lt;値&gt;",
          "設定を変更する（下記の設定セクションを参照）",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "このコマンドのみsubjectPromptBypassを上書き（--subject-prompt-bypassも使用可）",
        ],
        [" - 掃除", "状態を整合する — 孤立した状態とターントラッカー行を削除"],
        [
          "--再注文条件",
          "ターン順序において条件行を割り当てられたトークンの後ろに手動で再配置します",
        ],
        ["--reinstall-マクロ", "GMマクロを再作成または更新"],
        [
          "--reinstall-handout",
          "ローカライズされたヘルプハンドアウトを再作成または更新",
        ],
        [
          "--レポートトークン",
          "選択した各トークンの GM のみの条件レポートをウィスパーします (トークンに適用される条件、およびトークンによって適用される条件)",
        ],
        [
          "--lang &lt;ロケール&gt;",
          "このコマンドのメッセージを追加のロケールで出力（バイリンガルモード）",
        ],
        [
          "--classify pc|npc|ignored",
          "選択したトークンのアクタータイプを上書きします — 先にトークンを選択してください。デフォルトのスコープはキャラクター（ct_mod_actor_type 属性を書き込む）です；--scope token を追加してスクリプト状態に保存することもできます",
        ],
        [
          "--classify auto",
          "アクタータイプの上書きを削除し、選択したトークンの自動検出を復元します",
        ],
        [
          "--classify show",
          "選択した各トークンの分類診断をウィスパーします — 検出されたタイプ、検出ソース、理由を表示します",
        ],
        ["--help", "チャットに簡単なヘルプカードを表示"],
        [
          "--saved スヌーズ &lt;id&gt; --scope ターン|ラウンド|戦闘 --rounds &lt;n&gt;",
          "現在のターン、N ラウンド、またはこの戦闘の保存された効果のリマインダーをスヌーズします",
        ],
        [
          "--saved スヌーズ解除 &lt;id&gt;",
          "保存されたエフェクトのアクティブなスヌーズをクリアする",
        ],
        [
          "--lang &lt;locale&gt;",
          "このコマンドのメッセージを追加のロケールで出力します (バイリンガル モード)",
        ],
        [
          "--classify pc|npc|無視されました",
          "選択したトークンのアクター タイプをオーバーライドします。最初にトークンを選択します。デフォルトのスコープは文字です (ct_mod_actor_type 属性を書き込みます)。代わりにスクリプト状態に保存する --scope トークンを追加します",
        ],
        [
          "--classify 自動",
          "アクタータイプのオーバーライドを削除し、選択したトークンの自動検出を復元します",
        ],
        [
          "--classify ショー",
          "選択した各トークンの分類診断をウィスパーします - 検出されたタイプ、検出ソース、および理由を表示します",
        ],
        ["--help", "チャットで簡単なヘルプ カードを表示する"],
      ],
    },
    standardConditions: {
      heading: "標準状態（D&amp;D 5e）",
      colCondition: "状態",
      none: "このゲーム システムには標準条件が定義されていません。フリーテキスト効果には、その他のカスタム効果タイプを使用します。",
    },
    customEffects: {
      heading: "カスタム効果タイプ",
      colType: "タイプ",
      colNotes: "備考",
      rows: [
        [
          "🔮 呪文",
          "名前付き呪文効果を追跡します — 呪文名の入力を求められます",
        ],
        [
          "🎯 能力",
          "名前付きクラスまたは種族能力を追跡します — 能力名の入力を求められます",
        ],
        [
          "🍀 有利",
          "あるトークンから別のトークンへ付与された有利を記録します。イニシアチブではソースとグループ化されます",
        ],
        [
          "⬇️ 不利",
          "課された不利を記録します。イニシアチブではソースとグループ化されます",
        ],
        ["📝 その他", "自由形式のカスタムラベル — 説明の入力を求められます"],
      ],
    },
    durationOptions: {
      heading: "継続時間オプション",
      intro:
        "残数はターントラッカーのpr列に表示され、アンカートークンのターン終了時に減少します。",
      colOption: "オプション",
      colBehaviour: "動作",
      rows: [
        ["削除されるまで", "恒久的 — メニューまたは--removeで手動削除が必要"],
        [
          "ターゲットの次のターン終了時",
          "イニシアチブでターゲットトークンの次のターンが終了したときに失効",
        ],
        [
          "ソースの次のターン終了時",
          "イニシアチブでソーストークンの次のターンが終了したときに失効",
        ],
        [
          "1 / 2 / 3 / 10 ラウンド",
          "固定カウントダウン。アンカートークンのターン終了ごとに1減少",
        ],
      ],
    },
    savedEffects: {
      heading: "保存されたエフェクト",
      intro:
        "保存されたエフェクトを使用すると、呪い、病気、毒、隠れたデバフ、その他の非戦闘状態など、ターン トラッカーの外側に長期的な状態を保存できます。これらはスクリプト状態に保持され、戦闘開始時にオプションでターン トラッカーにコピーできます。",
      visibility: {
        heading: "可視性モード",
        rows: [
          [
            "公共",
            "完全な効果ラベルはターン トラッカーとパブリック チャットに表示されます。",
          ],
          [
            "マスクされた",
            "曖昧な公開ラベルがプレイヤーに表示されます。詳細は GM のみに公開されています。",
          ],
          [
            "GM",
            "ターントラッカー行はありません。完全な詳細は状態に保存され、影響を受けるトークンがイニシアチブの最上位に到達したときに GM にささやかれます。",
          ],
        ],
      },
      commands: {
        heading: "保存されたエフェクトコマンド",
        intro:
          "すべての --saved コマンドは GM 専用です。 --saved または --saved add を実行する前にトークンを選択してください。",
        rows: [
          [
            "!条件トラッカー -- 保存済み",
            "選択したトークンの保存された効果を表示します。",
          ],
          [
            "!条件トラッカー --saved 追加",
            "保存済みエフェクトの追加ウィザードを起動します。",
          ],
          [
            "!condition-tracker --saved edit <id>",
            "既存の保存済みエフェクトのラベルまたは表示設定を編集します。",
          ],
          [
            "!condition-tracker --saved remove <id>",
            "保存したエフェクトを永久に削除します。",
          ],
          [
            "!condition-tracker --saved promote <id> --visibility public|masked|gm",
            "保存したエフェクトをターン トラッカー (パブリックまたはマスク) にコピーするか、それが GM のみで追跡されていることを確認します。",
          ],
          [
            "!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>",
            "このターン、N ラウンド、またはこの戦闘の GM リマインダーをスヌーズします。",
          ],
          [
            "!condition-tracker --saved snooze-clear <id>",
            "アクティブなスヌーズを解除すると、リマインダーがすぐに再開されます。",
          ],
        ],
      },
      reminders: {
        heading: "GM リマインダー",
        body: "GM またはマスクされた保存済み効果を持つトークンがターン トラッカーの上部に到達すると、GM はアクション ボタンで隠された効果をリストするささやき声を受け取ります。同じターン内の重複したリマインダーは抑制されます。スヌーズ ボタンを使用して、ターン、ラウンド数、または現在の戦闘の残りのリマインダーを抑制します。",
      },
    },
    actorClassification: {
      heading: "アクター分類",
      intro:
        "Condition Tracker は各トークンがPC、NPC、または無視されるオブジェクト（マップピン、背景、呪文テンプレート）かどうかを自動的に判断します。リンクされていないトークンはデフォルトで無視されます。--classify を使用して、任意のトークンの自動検出を上書きしてください。",
      detectionOrder: {
        heading: "検出順序",
        colStep: "ステップ",
        colCheck: "チェック",
        colResult: "結果",
        rows: [
          [
            "1",
            "トークン状態の上書き（--classify --scope token）",
            "PC / NPC / 無視",
          ],
          [
            "2",
            "キャラクターの ct_mod_actor_type 属性（--classify --scope character）",
            "PC / NPC / 無視",
          ],
          [
            "3",
            "未リンクのトークン — キャラクターシートなし",
            "無視されました",
          ],
          [
            "4",
            "ゲームシステムアダプター（npc / is_npc 属性）",
            "パソコン/NPC",
          ],
          [
            "5",
            "汎用NPC属性スキャン（npc、is_npc、npcflag、sheet_type、character_type）",
            "パソコン/NPC",
          ],
          ["6", "キャラクターの controlledby フォールバック", "パソコン/NPC"],
        ],
      },
      types: {
        heading: "分類タイプ",
        colType: "タイプ",
        colMeaning: "意味",
        rows: [
          [
            "パソコン",
            "プレイヤーキャラクター — ウィザードと検出で常にPCとして含まれる",
          ],
          ["NPC", "ノンプレイヤーキャラクター — 常にNPCとして含まれる"],
          [
            "無視されました",
            "表示または追跡されない — ウィザードのトークンピッカーから除外",
          ],
          [
            "未知",
            "自動検出のみ；タイプを特定できなかった（ウィザードでNPCとして扱われる）",
          ],
        ],
      },
      commands: {
        heading: "分類コマンド",
        intro:
          "--classify コマンドを実行する前に、1つ以上のトークンを選択してください。",
        rows: [
          [
            "!condition-tracker --pc を分類",
            "選択したトークンをPCとしてマークします（デフォルトスコープ：キャラクター）。",
          ],
          [
            "!condition-tracker --npc を分類する",
            "選択したトークンをNPCとしてマークします。",
          ],
          [
            "!condition-tracker --classify は無視されました",
            "選択したトークンをすべてのトラッキングから除外します。",
          ],
          [
            "!条件トラッカー --classify 自動",
            "上書きを削除 — 自動検出を復元します。",
          ],
          [
            "!condition-tracker --classify ショー",
            "各選択トークンの分類診断（タイプ、ソース、理由）を表示します。",
          ],
          [
            "!condition-tracker --classify pc --scope トークン",
            "スクリプト状態に保存されたトークンレベルの上書き — 未リンクのトークンに便利です。",
          ],
          [
            "!condition-tracker --classify pc --scope 文字",
            "ct_mod_actor_type 属性に書き込まれたキャラクターレベルの上書き — 同じキャラクターシートを使用するすべてのトークンに適用されます。",
          ],
        ],
      },
    },
    configuration: {
      heading: "設定",
      intro:
        "!condition-tracker --config &lt;オプション&gt; &lt;値&gt;またはメインメニューの設定ボタンを使用してください。",
      colOption: "オプション",
      colValues: "値",
      colDesc: "説明",
      rows: [
        [
          "useMarkers",
          "true / false",
          "状態追加時にトークンへRoll20ステータスマーカーを適用する",
        ],
        [
          "useIcons",
          "真 / 偽",
          "ターントラッカー行で絵文字の代わりに短いアイコンコード（例：[G]）を表示する",
        ],
        [
          "subjectPromptBypass",
          "真 / 偽",
          "呪文・能力・その他の効果でオプションの対象トークン手順をスキップする",
        ],
        [
          "suppressPublicChat",
          "真 / 偽",
          "すべての公開チャット告知（適用・削除メッセージ）を非表示にします。GMのウィスパーは影響を受けません。",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "監視するトークンバー。0になるとGMに状態のクリーンアップを促す",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "チャットメッセージとヘルプハンドアウトの出力言語",
        ],
        [
          "marker",
          "&lt;状態&gt;=&lt;マーカー名&gt;",
          "特定の状態に使用するステータスマーカーを上書き（例：marker Grappled=grab）",
        ],
        [
          "マーカー",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "特定の条件に使用されるステータス マーカーをオーバーライドします (例: マーカー Grappled=grab)",
        ],
      ],
    },
    gameSystems: {
      heading: "サポートされているゲームシステム",
      intro:
        "システムを切り替えるには、!condition-tracker --config gameSystem &lt;id&gt; を使用します。切り替えると、トークン マーカー マッピングが新しいシステムのデフォルトにリセットされます。アクティブな状態が維持されます。",
      colId: "システムID",
      colName: "ゲームシステム",
    },
    defaultMarkers: {
      heading: "デフォルトステータスマーカー",
      colCondition: "状態",
      colMarker: "マーカー名",
      none: "このゲーム システムにはデフォルトのマーカーは定義されていません。",
    },
    availableLocales: {
      heading: "利用可能な翻訳",
      intro:
        "languageの設定オプションを使用して、チャットメッセージとヘルプハンドアウトをサポートされている任意のロケールに設定できます。en、zh、ptの短縮エイリアスも使用できます。",
      colLocale: "ロケール",
      colLanguage: "言語",
      colFile: "翻訳ファイル",
    },
  },
};

export default TRANSLATION;
