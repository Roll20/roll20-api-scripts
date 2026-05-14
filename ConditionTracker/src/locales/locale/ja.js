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
    },
    msg: {
      noActive: "追跡中のアクティブな状態はありません。",
      configReset: "設定がMODのデフォルトにリセットされました。",
      unknownConfig:
        "不明な設定オプションです。--configを使用してサポートされている設定を確認してください。",
      macroReinstalled:
        "{wizard}および{multiTarget}マクロが現在のすべてのGMプレイヤーに再インストールされました。",
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
          "!condition-tracker --prompt",
          "ステップバイステップのウィザード — 状態、トークン、継続時間をインタラクティブに選択します。ConditionTrackerWizardマクロとしても利用できます。",
        ],
        [
          "!condition-tracker --multi-target",
          "1つの状態を複数のトークンに同時に適用します。ConditionTrackerMultiTargetマクロとしても利用できます。",
        ],
        [
          "!condition-tracker --menu",
          "状態の適用・確認・削除ボタンを含むメインメニューを開きます。",
        ],
      ],
    },
    commandsRef: {
      heading: "コマンドリファレンス",
      colFlag: "フラグ",
      colDesc: "説明",
      rows: [
        ["--prompt", "インタラクティブなステップバイステップウィザードUI"],
        ["--multi-target", "複数のターゲットトークンに状態を一括適用"],
        ["--menu", "メインメニューを表示（削除メニューにはremoveを追加）"],
        [
          "--source X --target Y --condition Z",
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
        [
          "--cleanup",
          "状態を整合する — 孤立した状態とターントラッカー行を削除",
        ],
        [
          "--reorder-conditions",
          "ターン順序において条件行を割り当てられたトークンの後ろに手動で再配置します",
        ],
        ["--reinstall-macro", "GMマクロを再作成または更新"],
        [
          "--reinstall-handout",
          "ローカライズされたヘルプハンドアウトを再作成または更新",
        ],
        [
          "--lang &lt;ロケール&gt;",
          "このコマンドのメッセージを追加のロケールで出力（バイリンガルモード）",
        ],
        ["--help", "チャットに簡単なヘルプカードを表示"],
      ],
    },
    standardConditions: {
      heading: "標準状態（D&amp;D 5e）",
      colCondition: "状態",
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
          "true / false",
          "ターントラッカー行で絵文字の代わりに短いアイコンコード（例：[G]）を表示する",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "呪文・能力・その他の効果でオプションの対象トークン手順をスキップする",
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
      ],
    },
    defaultMarkers: {
      heading: "デフォルトステータスマーカー",
      colCondition: "状態",
      colMarker: "マーカー名",
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
