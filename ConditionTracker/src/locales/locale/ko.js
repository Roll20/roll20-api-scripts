const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "붙잡힘",
      verb: "붙잡음",
    },
    Restrained: {
      past: "구속됨",
      verb: "구속함",
    },
    Prone: {
      past: "넘어짐",
      verb: "넘어뜨림",
      suffix: "상태",
    },
    Poisoned: {
      past: "중독됨",
      verb: "중독시킴",
    },
    Stunned: {
      past: "기절함",
      verb: "기절시킴",
    },
    Blinded: {
      past: "눈이 멂",
      verb: "눈을 멀게 함",
    },
    Charmed: {
      past: "매혹됨",
      verb: "매혹함",
    },
    Frightened: {
      past: "겁에 질림",
      verb: "겁을 줌",
    },
    Incapacitated: {
      past: "무력화됨",
      verb: "무력화시킴",
    },
    Invisible: {
      past: "투명해짐",
      verb: "투명하게 만듦",
    },
    Paralyzed: {
      past: "마비됨",
      verb: "마비시킴",
    },
    Petrified: {
      past: "석화됨",
      verb: "석화시킴",
    },
    Unconscious: {
      past: "의식 불명",
      verb: "의식 불명으로 만듦",
    },
    Spell: {
      past: "주문에 걸림",
      verb: "주문을 시전함",
    },
    Ability: {
      past: "능력의 영향을 받음",
      verb: "능력을 사용함",
    },
    Advantage: {
      past: "이점을 가짐",
      verb: "이점을 부여함",
      noBy: true,
    },
    Disadvantage: {
      past: "불이익을 가짐",
      verb: "불이익을 가함",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "붙잡힘",
    Restrained: "구속됨",
    Prone: "넘어짐",
    Poisoned: "중독됨",
    Stunned: "기절함",
    Blinded: "눈이 멂",
    Charmed: "매혹됨",
    Frightened: "겁에 질림",
    Incapacitated: "무력화됨",
    Invisible: "투명화",
    Paralyzed: "마비됨",
    Petrified: "석화됨",
    Unconscious: "의식 불명",
    Spell: "주문",
    Ability: "능력",
    Advantage: "이점",
    Disadvantage: "불이익",
    Other: "기타",
  },
  templates: {
    display: {
      custom: "{emoji} {target} 이(가) {effect}의 영향을 받음 ({source})",
      advantage:
        "{emoji} {source} 이(가) {target}{subject} 에 대해 이점을 가짐",
      disadvantage:
        "{emoji} {source} 이(가) {target}{subject} 에 대해 불이익을 가짐",
      noBy: "{emoji} {target} 이(가) {past} ({source})",
      self: "{target} 이(가) {past}",
      standard: "{emoji} {target} 이(가) {source} 에 의해 {past}",
    },
    apply: {
      custom: "{source} 이(가) {target} 에게 {effect} 효과를 적용함.",
      advantage: "{source} 이(가) {target}{subject} 에 대해 이점을 가짐.",
      disadvantage: "{source} 이(가) {target}{subject} 에 대해 불이익을 가짐.",
      self: "{target} 이(가) {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} 에게 적용된 {effect} 효과가 종료됨.",
      advantage:
        "{source} 이(가) {target}{subject} 에 대해 더 이상 이점을 가지지 않음.",
      disadvantage:
        "{source} 이(가) {target}{subject} 에 대해 더 이상 불이익을 가지지 않음.",
      noBy: "{target} 이(가) 더 이상 {past} 상태가 아님.",
      self: "{target} 이(가) 더 이상 {past} 상태가 아님.",
      standard: "{target} 이(가) 더 이상 {source} 에 의해 {past} 상태가 아님.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "상태 선택",
      selectSource: "시전자 토큰 선택",
      selectTarget: "대상 토큰 선택",
      selectSubject: "주체 선택",
      selectDuration: "지속 시간 선택",
      confirmTargetTitle: "대상 목록 확인",
      applyEffectTitle: "{condition} 효과 적용",
      noTokens: "활성 페이지에서 이름이 있는 토큰을 찾을 수 없습니다.",
      confirmIntro: "다음 토큰들에 상태가 적용됩니다:",
      confirmBtn: "대상 목록 확인",
      enterDetails: "효과 상세 내용 입력",
      noneBtn: "없음",
      noneOrSourceBtn: "없음 또는 시전자에게 적용",
      subjectDesc: "효과를 전달하는 대상이나 항목을 선택하세요.",
      sourceDesc: "상태나 효과를 생성하는 생명체를 선택하세요.",
      targetDesc: "상태나 효과를 받을 생명체를 선택하세요.",
      otherText: "기타 상태 텍스트",
      effectDetails: "{condition} 상세 내용",
    },
    col: {
      players: "플레이어",
      npcs: "NPC",
      conditions: "상태",
      customEffects: "사용자 정의 효과",
      permanentTurnEnd: "영구 / 턴 종료",
      rounds: "라운드",
      command: "명령어",
      result: "결과",
      field: "필드",
      value: "값",
      option: "옵션",
      condition: "상태",
      marker: "마커",
      item: "항목",
      removed: "제거됨",
      details: "상세 내용",
      description: "설명",
      scenario: "시나리오",
    },
    dur: {
      untilRemoved: "제거될 때까지",
      endOfTargetTurn: "대상의 다음 턴 종료 시",
      endOfSourceTurn: "시전자의 다음 턴 종료 시",
      round1: "1 라운드",
      round2: "2 라운드",
      round3: "3 라운드",
      round10: "10 라운드",
      custom: "사용자 정의",
      customPrompt: "라운드 수",
      untilRemovedDisplay: "제거될 때까지",
      turnsRemaining: "{n} 개의 추적된 턴 종료 남음",
    },
    btn: {
      openWizard: "위저드 열기",
      openMultiTarget: "다중 대상 위저드 열기",
      openRemovalList: "제거 목록 열기",
      showConfig: "설정 표시",
      runCleanup: "정리 실행",
      reinstallMacro: "매크로 재설치",
      reinstallHandout: "유인물 재설치",
      showHelp: "도움말 표시",
      reorderConditions: "조건 행 재정렬",
    },
    title: {
      menu: "메뉴",
      removalMenu: "상태 추적기 제거",
      config: "설정",
      configTracker: "상태 추적기 설정",
      help: "도움말",
      applied: "적용됨",
      removed: "상태 제거됨",
      cleanup: "정리 완료",
      macroReinstalled: "매크로 재설치됨",
      handoutReinstalled: "유인물 재설치됨",
      warning: "경고",
      error: "오류",
      turnOrder: "턴 순서",
      noConditions: "상태 없음",
      tokenMoved: "토큰 이동됨",
      markedDead: "사망으로 표시됨",
      zeroHp: "{name} — 0 HP",
      moveToken: "{name} — 토큰을 이동하시겠습니까?",
      scriptReady: "스크립트 준비됨",
      conditionReorder: "턴 순서 변경됨",
    },
    heading: {
      quickActions: "빠른 작업",
      settings: "설정",
      markerMappings: "마커 매핑",
      result: "결과",
      info: "정보",
      commandOptions: "명령어 옵션",
      promptUi: "프롬프트 UI",
      examples: "예시",
      summary: "요약",
    },
    msg: {
      noActive: "추적 중인 활성 상태가 없습니다.",
      configReset: "설정이 모드 기본값으로 재설정되었습니다.",
      unknownConfig:
        "알 수 없는 설정 옵션입니다. --config 를 사용하여 지원되는 설정을 확인하세요.",
      macroReinstalled:
        "{wizard} 및 {multiTarget} 매크로가 모든 현재 GM 플레이어를 위해 재설치되었습니다.",
      handoutReinstalled: "도움말 유인물 {handout}이(가) 재설치되었습니다.",
      duplicate:
        "동일한 시전자, 주체, 대상, 상태 및 사용자 정의 텍스트가 이미 활성화되어 있습니다.",
      noTargets: "다중 대상 적용을 위한 대상 토큰이 지정되지 않았습니다.",
      noSelection:
        "--multi-target 을 사용하기 전에 보드에서 하나 이상의 토큰을 선택하세요.",
      invalidIds: "현재 선택 항목에서 유효한 토큰 ID를 찾을 수 없습니다.",
      reSelectTokens:
        "원래 선택한 토큰을 찾을 수 없습니다. 토큰을 다시 선택하고 다시 시도하세요.",
      conditionNotFound: "상태 ID를 찾을 수 없습니다.",
      gmOnly: "상태 추적기 명령어는 GM 전용입니다.",
      commandFailed:
        "명령어를 안전하게 완료할 수 없습니다. 자세한 내용은 API 콘솔을 확인하세요.",
      sourceTokenNotFound: "시전자 토큰을 찾을 수 없습니다.",
      targetTokenNotFound: "대상 토큰을 찾을 수 없습니다.",
      subjectTokenNotFound: "주체 토큰을 찾을 수 없습니다.",
      invalidCondition:
        "상태는 미리 정의된 상태 중 하나이거나 '기타'여야 합니다.",
      subjectOnlyCustom:
        "--subject 는 주문, 능력, 이점, 불이익 및 기타 효과에만 유효합니다.",
      subjectBypassInvalid:
        "--subjectPromptBypass 는 값이 제공될 때 true 또는 false를 기대합니다.",
      customDetailsRequired:
        "{condition} 상세 내용이 필요합니다. --other 를 사용하여 제공하세요.",
      markerConfigFormat: "마커 설정 형식: --config marker Grappled=grab",
      markerPredefinedRequired:
        "마커 설정에는 미리 정의된 상태 이름이 필요합니다.",
      markerNameRequired:
        "마커 설정에는 비어 있지 않은 마커 이름이 필요합니다.",
      markerSet: "{condition} 마커가 {marker} 로 설정되었습니다.",
      healthBarSet: "체력 바가 {bar} 로 설정되었습니다.",
      boolSet: "{key} 이(가) {value} 로 설정되었습니다.",
      expectedBoolean: "true 또는 false를 기대했습니다.",
      invalidHealthBar:
        "체력 바는 bar1_value, bar2_value 또는 bar3_value 여야 합니다.",
      markersDisabled: "마커가 비활성화되었습니다.",
      noMarkerConfigured: "이 상태에 대해 설정된 마커가 없습니다.",
      markerApplied: "마커 적용됨: {marker}",
      markerPresent: "마커가 이미 존재함: {marker}",
      langSet: "언어가 {locale} 로 설정되었습니다.",
      invalidLocale: "유효하지 않은 로케일입니다. 지원되는 로케일: {locales}.",
      otherDurationRequiresRounds:
        "기타 지속 시간은 숫자 라운드 수가 필요합니다. 예: --duration 5 rounds.",
      invalidDuration:
        "지속 시간은 '제거될 때까지', 턴 종료 옵션 또는 양수 라운드 수여야 합니다.",
      zeroHpNoConditions: "{name} 의 HP가 0이 되었으며 활성 상태가 없습니다.",
      zeroHpConditions:
        "{name} 의 HP가 0이 되었습니다. 제거할 상태를 선택하세요:",
      removeAllBtn: "{name} 의 모든 상태 제거",
      markIncapacitated: "무력화됨으로 표시",
      removeFromTurnOrder: "턴 순서에서 제거",
      alreadyIncapacitated: "{name} 은(는) 이미 무력화 상태입니다.",
      tokenRemovedFromTurn: "{name} 이(가) 턴 순서에서 제거되었습니다.",
      tokenNotInTurn: "{name} 을(를) 턴 순서에서 찾을 수 없습니다.",
      moveTokenPrompt:
        "{name} 을(를) 지도 레이어로 이동하여 다른 토큰을 방해하지 않으면서 가시성을 유지하시겠습니까?",
      moveTokenBtn: "{name} 을(를) 지도 레이어로 이동",
      tokenMoved: "{name} 이(가) 지도 레이어로 이동되었습니다.",
      tokenNotFound: "토큰을 찾을 수 없습니다.",
      noActiveConditions: "{name} 에 제거할 활성 상태가 없습니다.",
      deadNoConditions:
        "{name} 이(가) 사망으로 표시되었습니다. 활성 상태가 없었습니다.",
      scriptReady:
        "{name} 이(가) 활성화되었으며 버전 {version} 을(를) 사용 중입니다.",
      reachedZeroHp: "{name} 의 HP가 0에 도달함",
      manuallyRemoved: "수동으로 제거됨",
      durationExpired: "지속 시간이 만료됨",
      markedAsDead: "{name} 이(가) 사망으로 표시됨",
      conditionReorder:
        "턴 순서가 변경되어 {count}개의 추적된 조건 행이 잘못된 위치에 있을 수 있습니다. 아래를 클릭하여 지정된 토큰 뒤에 복원하세요.",
      conditionsReordered: "조건 행이 지정된 토큰 뒤로 재배치되었습니다.",
    },
    removal: {
      conditionField: "상태",
      reasonField: "이유",
      turnRowField: "턴 추적기 행",
      markerField: "마커",
      notConfigured: "설정되지 않음",
      markerRemoved: "제거됨 ({marker})",
      markerRetained: "유지됨 ({marker})",
      rowRemoved: "제거됨",
      rowMissing: "이미 누락됨",
      manualReason: "수동 제거",
    },
    cleanup: {
      orphaned: "연결이 끊긴 상태 항목",
      stale: "오래된 상태 항목",
      orphanedRows: "연결이 끊긴 턴 추적기 행",
      unusedMarkers: "사용되지 않는 마커",
    },
    apply: {
      turnAppended: "대상이 턴 순서에 없었습니다. 상태 행이 추가되었습니다.",
      turnInserted: "대상 토큰 아래에 상태 행이 삽입되었습니다.",
    },
  },
  handout: {
    versionLabel: "버전",
    subtitle: "D&D 5e 상태 효과 관리자",
    footerNote:
      "이 유인물은 스크립트가 로드될 때마다 자동으로 생성 및 업데이트됩니다.",
    overview: {
      heading: "개요",
      body: "상태 추적기(Condition Tracker)는 D&D 5e 상태 조건 및 사용자 정의 효과를 Roll20 턴 추적기의 레이블이 지정된 행으로 관리합니다. 토큰에 상태를 적용하고, 이니셔티브 순서에 따라 지속 시간을 추적하며, 턴이 종료될 때 만료된 효과를 자동으로 제거합니다. 모든 명령어는 GM 전용이며 채팅 또는 설치된 매크로를 통해 실행할 수 있습니다.",
    },
    quickStart: {
      heading: "빠른 시작",
      colCommand: "명령어",
      colDesc: "설명",
      rows: [
        [
          "!condition-tracker --prompt",
          "단계별 위저드 — 대화형으로 상태, 토큰 및 지속 시간을 선택합니다. ConditionTrackerWizard 매크로로도 사용할 수 있습니다.",
        ],
        [
          "!condition-tracker --multi-target",
          "여러 토큰에 하나의 상태를 동시에 적용합니다. ConditionTrackerMultiTarget 매크로로도 사용할 수 있습니다.",
        ],
        [
          "!condition-tracker --menu",
          "상태를 적용, 검토 또는 제거할 수 있는 버튼이 있는 메인 관리 메뉴를 엽니다.",
        ],
      ],
    },
    commandsRef: {
      heading: "명령어 참조",
      colFlag: "플래그",
      colDesc: "설명",
      rows: [
        ["--prompt", "대화형 단계별 위저드 UI"],
        ["--multi-target", "여러 대상 토큰에 동시에 상태 적용"],
        ["--menu", "메인 메뉴 표시 (제거 메뉴의 경우 remove 추가)"],
        ["--source X --target Y --condition Z", "위저드 없이 직접 상태 적용"],
        ["--duration &lt;값&gt;", "직접 적용 시 지속 시간 (예: 2 rounds)"],
        [
          "--other &lt;텍스트&gt;",
          "주문 / 능력 / 기타 효과 유형에 대한 사용자 정의 텍스트",
        ],
        ["--remove &lt;condition-id&gt;", "고유 ID로 특정 상태 제거"],
        [
          "--config &lt;옵션&gt; &lt;값&gt;",
          "구성 설정 조정 (아래 설정 섹션 참조)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "이 명령어에 대해서만 subjectPromptBypass 재정의 (--subject-prompt-bypass 도 지원)",
        ],
        ["--cleanup", "상태 조정 — 연결이 끊긴 상태 및 턴 추적기 행 제거"],
        [
          "--reorder-conditions",
          "턴 순서에서 조건 행을 할당된 토큰 뒤로 수동으로 재배치",
        ],
        ["--reinstall-macro", "GM 매크로 재생성 또는 업데이트"],
        ["--reinstall-handout", "현지화된 도움말 유인물 재생성 또는 업데이트"],
        [
          "--lang &lt;로케일&gt;",
          "이 명령어의 메시지를 추가 로케일로 출력 (이중 언어 모드)",
        ],
        ["--help", "채팅에 간단한 도움말 카드 표시"],
      ],
    },
    standardConditions: {
      heading: "표준 상태 (D&D 5e)",
      colCondition: "상태",
    },
    customEffects: {
      heading: "사용자 정의 효과 유형",
      colType: "유형",
      colNotes: "참고",
      rows: [
        [
          "🔮 주문 (Spell)",
          "명명된 주문 효과 추적 — 주문 이름을 입력하라는 메시지가 표시됩니다.",
        ],
        [
          "🎯 능력 (Ability)",
          "명명된 클래스 또는 종족 능력 추적 — 이름을 입력하라는 메시지가 표시됩니다.",
        ],
        [
          "🍀 이점 (Advantage)",
          "한 토큰에서 다른 토큰으로 부여된 이점을 기록합니다. 이니셔티브에서 시전자와 함께 그룹화됩니다.",
        ],
        [
          "⬇️ 불이익 (Disadvantage)",
          "가해진 불이익을 기록합니다. 이니셔티브에서 시전자와 함께 그룹화됩니다.",
        ],
        [
          "📝 기타 (Other)",
          "자유 형식 사용자 정의 레이블 — 설명을 입력하라는 메시지가 표시됩니다.",
        ],
      ],
    },
    durationOptions: {
      heading: "지속 시간 옵션",
      intro:
        "남은 카운트는 턴 추적기 pr 열에 표시되며 고정된 토큰의 턴이 종료될 때 감소합니다.",
      colOption: "옵션",
      colBehaviour: "동작",
      rows: [
        [
          "제거될 때까지",
          "영구적 — 메뉴 또는 --remove 를 통해 수동으로 제거해야 합니다.",
        ],
        [
          "대상의 다음 턴 종료 시",
          "이니셔티브에서 대상 토큰의 다음 턴이 종료될 때 만료됩니다.",
        ],
        [
          "시전자의 다음 턴 종료 시",
          "이니셔티브에서 시전자 토큰의 다음 턴이 종료될 때 만료됩니다.",
        ],
        [
          "1 / 2 / 3 / 10 라운드",
          "고정된 카운트다운; 고정 토큰의 턴 종료 시마다 1씩 감소합니다.",
        ],
      ],
    },
    configuration: {
      heading: "설정",
      intro:
        "!condition-tracker --config &lt;옵션&gt; &lt;값&gt; 또는 메인 메뉴의 설정 버튼을 사용하세요.",
      colOption: "옵션",
      colValues: "값",
      colDesc: "설명",
      rows: [
        [
          "useMarkers",
          "true / false",
          "상태가 추가될 때 토큰에 Roll20 상태 마커를 적용합니다.",
        ],
        [
          "useIcons",
          "true / false",
          "턴 추적기 행에 이모지 대신 짧은 아이콘 코드(예: [G])를 표시합니다.",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "주문 / 능력 / 기타 효과에 대해 선택적인 주체 토큰 단계를 건너뜁니다.",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "모니터링할 토큰 바; 0으로 떨어지면 GM에게 상태 정리를 요청합니다.",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "채팅 메시지 및 도움말 유인물의 출력 언어",
        ],
        [
          "marker",
          "&lt;상태&gt;=&lt;마커 이름&gt;",
          "특정 상태에 사용되는 상태 마커를 재정의합니다 (예: marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "기본 상태 마커",
      colCondition: "상태",
      colMarker: "마커 이름",
    },
    availableLocales: {
      heading: "사용 가능한 번역",
      intro:
        "language 설정 옵션을 사용하여 채팅 메시지와 도움말 유인물을 지원되는 locale로 설정하세요. en, zh, pt에 대한 짧은 별칭도 허용됩니다.",
      colLocale: "로케일",
      colLanguage: "언어",
      colFile: "번역 파일",
    },
  },
};

export default TRANSLATION;
