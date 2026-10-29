const TRANSLATION = {
  titles: {
    ready: '탐색이 준비되었습니다.',
    settings: '탐색 설정',
    languages: '언어를 선택하세요',
    pageSettings: '페이지 설정: {page}',
    status: '탐색 상태: {page}',
    help: '탐색 명령',
    confirm: '확인해주세요',
  },
  discovery: {
    title: '발견된 위치',
  },
  menu: {
    draw: '그리다',
    reveal: '공개 및 숨기기',
    locations: '위치',
    tools: '도구',
    layerInUse: '{layer}에 새로운 헥스가 그려지고 있습니다.',
    pageSettingsHelp:
      '이 설정은 이 페이지에만 적용됩니다. ★로 표시된 설정은 전역 설정보다 우선 적용됩니다.',
  },
  buttons: {
    fill: '채우다',
    fillInverse: '역 채우기',
    undo: '채우기 실행 취소',
    reveal: '드러내다',
    conceal: '숨기다',
    explore: '탐구하다',
    revealPage: '페이지 공개',
    resetPage: '페이지 재설정',
    mark: '위치 표시',
    unmark: '표시 해제',
    name: '이름 헥스',
    settings: '설정',
    pageSettings: '페이지 설정',
    status: '상태',
    rescan: '다시 스캔',
    calibrate: '교정',
    calibrateReset: '교정 재설정',
    help: '돕다',
    change: '변화',
    menu: '메뉴',
    clearOverrides: '재정의 지우기',
    confirmReset: '예, 모든 16진수를 제거합니다.',
  },
  prompts: {
    name: '위치 이름(지우려면 비워 두세요)',
  },
  values: {
    on: '~에',
    off: '끄다',
    none: '없음',
    hexLayer: {
      auto: '자동(사용 가능한 경우 전경)',
      foreground: '전경 레이어',
      objects: '토큰 레이어',
    },
    revealBy: {
      players: '플레이어 토큰',
      characters: '캐릭터 토큰',
      all: '모든 토큰',
    },
    revealMode: {
      clear: '분명한',
      glimpse: '일견',
    },
    announce: {
      all: '모든 사람',
      gm: 'GM 전용',
      off: '끄다',
    },
    orientation: {
      vertical: '16진수(V)',
      horizontal: '16진수(H)',
    },
    fillKind: {
      fill: '채우다',
      fillInverse: '역 채우기',
      conceal: '숨기다',
    },
  },
  settings: {
    language: {
      label: '언어',
      desc: '메뉴, 메시지, 유인물에 대한 언어입니다.',
    },
    hexLayer: {
      label: '육각 레이어',
      desc: '새로운 육각형이 그려지는 곳. 자동은 전경 레이어(토큰 위)를 시도하고 게임이 지원하지 않으면 토큰 레이어로 대체합니다.',
    },
    fillColor: {
      label: '채우기 색상',
      desc: '새로운 육각형의 색상입니다. 투명한 16진수에는 rgba()를 사용합니다(예: rgba(0,0,0,0.8)).',
    },
    strokeColor: {
      label: '테두리 색상',
      desc: '새로운 육각형의 윤곽선 색상입니다.',
    },
    labelColor: {
      label: '라벨 색상',
      desc: '명명된 육각형의 GM 전용 이름 라벨 색상입니다.',
    },
    glimpseColor: {
      label: '미리보기 색상',
      desc: '엿볼 때 색상 육각형이 로 변경됩니다(Glimpse 공개 모드). 투명한 rgba() 색상을 사용하세요.',
    },
    strokeWidth: {
      label: '테두리 너비',
      desc: '새 헥스의 윤곽선 너비(픽셀 단위)(0~20).',
    },
    maxDistance: {
      label: '16진수 공개 거리',
      desc: '그려진 헥스에 적용됩니다. 토큰이 볼 수 있는 범위에 관계없이 토큰을 표시하려면 이 많은 헥스 내에 있어야 합니다. 제한이 없으면 비워 두세요.',
    },
    revealDistance: {
      label: '시거리',
      desc: '움직이는 토큰 주변의 헥스 수는 공개됩니다(0~20). 0은 토큰이 통과하는 헥스만 나타냅니다.',
    },
    lineOfSight: {
      label: '시선',
      desc: '켜져 있으면 헥스와 토큰 사이에 가려진 헥스가 없는 경우에만 헥스가 드러납니다.',
    },
    revealPath: {
      label: '경로를 따라 표시',
      desc: '켜져 있으면 토큰이 멈추는 위치뿐만 아니라 드래그되는 동안 토큰이 통과하는 모든 헥스(경유지 포함)가 표시됩니다.',
    },
    revealBy: {
      label: '공개되는 토큰',
      desc: '토큰 레이어의 토큰은 헥스(플레이어가 제어하는 ​​토큰, 모든 캐릭터를 나타내는 토큰 또는 모든 토큰)를 나타냅니다.',
    },
    revealMode: {
      label: '공개 모드',
      desc: 'Clear는 시야 내의 타일을 제거합니다. Glimpse는 대신 투명하게 만듭니다. 토큰이 입력되면 제거됩니다.',
    },
    announce: {
      label: '발견 발표',
      desc: '이름이 지정된 위치가 발견되면 채팅 메시지를 볼 수 있는 사람입니다.',
    },
    pingDiscoveries: {
      label: '핑 발견',
      desc: '켜져 있으면 이름이 지정된 위치가 발견되면 플레이어에게 해당 위치로 핑이 전송됩니다.',
    },
    hideCoveredTokens: {
      label: '적용 토큰 숨기기',
      desc: 'Roll20은 육각형 위에 이름, 막대 및 아우라를 그립니다. 켜져 있으면 덮여 있는 헥스 아래에 있는 토큰의 이름이 플레이어에게 표시되고 막대와 오라가 꺼지고, 덮혀 있으면 다시 켜집니다.',
    },
  },
  status: {
    engine: '게임 엔진',
    grid: '그리드',
    layer: '육각층',
    hexes: '헥스',
    named: '명명된 헥스',
    icons: '위치 토큰',
    glimpsed: '살짝 엿본 육각형',
    pending: '채우기를 기다리는 위치',
    calibrated: '교정됨',
    overrides: '페이지 재정의',
    undo: '실행 취소 가능',
  },
  messages: {
    filled:
      '채우기가 완료되었습니다. 그려진 헥스: {created}. 스타일이 변경되었습니다: {restyled}. 숨겨진 위치: {icons}.',
    revealed: '공개된 헥스: {count}.',
    revealedPage: '페이지의 모든 16진수가 공개되었습니다({count}).',
    confirmReset:
      '"{page}"({count})에서 모든 16진수를 제거하시겠습니까? 위치 토큰은 토큰 레이어로 돌아갑니다. 실행 취소하면 되돌릴 수 없습니다.',
    resetPage: '페이지에서 제거된 16진수: {count}.',
    undone:
      '마지막 채우기가 취소되었습니다. 제거된 16진수: {removed}. 스타일이 변경된 16진수 복원: {restored}.',
    named: '"{name}"이라는 헥스: {count}.',
    unnamed: '지워진 이름: {count}.',
    marked:
      '기존 16진수에 숨겨진 위치: {attached}. 이를 포함하는 다음 채우기를 기다리는 중: {pending}.',
    unmarked: '더 이상 위치가 아닌 토큰: {count}.',
    settingChanged: '{setting}이(가) {value}로 설정되었습니다.',
    rescanned:
      '재검색이 완료되었습니다. 유지됨: {kept}. 채택됨: {adopted}. 다시 제출됨: {moved}. 누락 및 잊혀짐: {dropped}. 다시 연결된 라벨: {labels}. 다시 연결된 위치 토큰: {icons}.',
    calibrated:
      '그리드가 보정되었습니다(열 단계 {colStep}px, 행 단계 {rowStep}px). 재스캔: {kept} 유지, {moved} 다시 제출, {adopted} 채택.',
    calibrationReset:
      '보정이 제거되었습니다. 재스캔: {kept} 유지, {moved} 다시 제출, {adopted} 채택.',
    journalRebuilt: '"{help}" 및 "{deck}" 유인물이 다시 작성되었습니다.',
    migrated:
      'Heexploration 1.x 육각형 지도가 업그레이드되었습니다. 이 게임이 레거시 게임에서 복사된 경우 각 육각형 지도 페이지에서 다시 스캔을 실행하세요.',
    pruned:
      '더 이상 존재하지 않고 잊혀진 저장된 헥스: {dropped}. 이 게임이나 페이지가 복사된 경우 페이지에서 다시 스캔을 실행하여 16진수를 다시 선택하세요.',
    readyHint: '메뉴에 !hexploration을 입력하거나 "Hexploration - Command Deck" 유인물을 엽니다.',
  },
  warnings: {
    foregroundUnavailable:
      '이 게임은 전경 레이어 그리기를 지원하지 않으므로 토큰 레이어에 육각형을 그렸습니다.',
    someFailed: '그릴 수 없는 육각형: {count}. 자세한 내용은 API 콘솔을 확인하세요.',
  },
  errors: {
    noPage: '작업할 페이지를 찾을 수 없습니다.',
    notHex: '이 페이지는 육각형 그리드를 사용하지 않습니다.',
    noPolygons: '채울 하나 이상의 그려진 도형을 선택합니다.',
    emptyArea: '선택한 영역에는 16진수 중심이 포함되어 있지 않습니다.',
    tooMany: '그러면 한 번에 너무 많은 헥스가 생성됩니다({count}).',
    nothingToConceal: '숨길 그려진 모양이나 토큰을 선택하세요.',
    nothingToReveal: '공개할 육각형, 그려진 모양 또는 토큰을 선택하세요.',
    noTokens: '먼저 하나 이상의 토큰을 선택하세요.',
    noHexes: '먼저 하나 이상의 헥스(또는 헥스 위에 있는 토큰)를 선택하세요.',
    nothingToUndo: '실행 취소할 채우기가 없습니다.',
    unknownCommand: '알 수 없는 명령: {command}',
    unknownSetting: '알 수 없는 설정: {key}',
    unknownPageSetting: '페이지별로 설정할 수 있는 설정 : {keys}',
    invalidValue: '"{value}"은(는) {key}에 유효한 값이 아닙니다.',
    calibrateNeedsTokens: '육각형 중앙에 고정된 하나 또는 두 개의 토큰을 선택합니다.',
    calibrateFailed: '해당 토큰은 보정에 사용할 수 없습니다.',
    unexpected: '문제가 발생했습니다: {message}',
  },
  hints: {
    noPage: '작업하려는 페이지를 열거나 페이지에서 항목을 선택하세요.',
    notHex: '페이지 설정에서 페이지 격자를 16진수(V) 또는 16진수(H)로 설정하세요.',
    noPolygons:
      '영역 주위에 다각형, 직사각형, 타원 또는 자유형 모양을 그리고 선택한 다음 다시 시도하십시오.',
    emptyArea: '더 큰 도형을 그리거나 페이지 그리드 설정을 확인하세요.',
    tooMany: '더 작은 영역을 채우거나 영역을 여러 모양으로 분할합니다.',
    noHexes: '육각형은 전경 또는 토큰 레이어에 있습니다. 해당 레이어로 전환하여 선택하세요.',
    unknownCommand: '명령 목록을 보려면 !heexploration help를 입력하세요.',
    unknownSetting: '모든 설정을 보려면 !heexploration set를 입력하세요.',
    calibrateNeedsTokens:
      '토큰을 육각형 중앙에 놓고 선택합니다. 동일한 행(16진수 V) 또는 열(16진수 H)의 인접한 16진수에 스냅된 두 번째 토큰을 선택하여 16진수 크기도 수정합니다.',
    calibrateFailed:
      '두 개의 토큰은 동일한 행(Hex V) 또는 동일한 열(Hex H)에 있어야 하며 최소 16진수 떨어져 있어야 합니다.',
    unexpected: '세부정보는 API 콘솔 로그에 있습니다.',
  },
  help: {
    menu: '메뉴를 보여주세요.',
    fill: '선택한 그려진 모양을 육각형으로 덮습니다.',
    fillInverse: '선택한 도형 내부를 제외하고 전체 페이지를 덮습니다.',
    undo: '마지막 채우기를 실행 취소하고, 채우기를 반전하거나 숨기고, 사용한 모양을 복원합니다.',
    reveal: '선택한 육각형과 선택한 모양 및 토큰 아래의 육각형을 표시합니다.',
    revealPage: '공지 없이 페이지의 모든 16진수를 공개합니다.',
    conceal: '선택한 모양과 토큰 아래 영역을 다시 16진수로 덮습니다.',
    explore: '선택한 토큰이 방금 그곳으로 이동한 것처럼 주변을 드러냅니다.',
    resetPage: '페이지의 모든 16진수를 제거합니다(먼저 묻습니다).',
    name: '선택한 헥스 또는 선택한 토큰 아래의 헥스의 이름을 지정합니다. 이름을 지우려면 이름을 비워 두세요.',
    mark: '선택한 토큰을 숨겨진 위치로 바꿉니다.',
    unmark: '선택한 토큰이 숨겨진 위치가 되는 것을 중지하세요.',
    set: '설정을 변경하거나 모든 설정을 표시합니다.',
    pageSet: '현재 페이지에서만 표시 설정을 재정의합니다.',
    pageClear: '현재 페이지의 재정의를 제거합니다.',
    rescan: '예를 들어 페이지나 게임을 복사한 후 페이지의 16진수 목록을 다시 작성합니다.',
    calibrate:
      '16진수 중심에 맞춰진 하나 또는 두 개의 선택된 토큰을 사용하여 16진수 그리드를 정렬합니다.',
    calibrateReset: '현재 페이지의 보정을 제거합니다.',
    status: '현재 페이지에 대해 Heexploration이 알고 있는 내용을 보여줍니다.',
    journal: '도움말 및 명령 데크 유인물을 재구성합니다.',
    help: '이 목록을 보여주세요.',
    handout: '전체 지침은 "{name}" 유인물에 있습니다.',
  },
  deck: {
    subtitle: '커맨드 덱',
    drawDesc:
      '영역 주위에 모양을 그리고 선택한 다음 채웁니다. 실행 취소는 마지막 채우기를 되돌립니다.',
    revealDesc:
      '육각형, 모양 또는 토큰을 선택하여 다시 표시하거나 덮으세요. 선택한 토큰 주변을 마치 이동한 것처럼 탐색해 보세요.',
    locationsDesc:
      '토큰을 선택하여 16진수 아래 위치로 숨기세요. 16진수 또는 토큰을 선택하여 16진수 이름을 지정하세요.',
    toolsDesc: '설정, 페이지 재정의, 상태, 복사된 페이지 다시 스캔 및 그리드 보정.',
    footer: '전체 지침은 "{help}" 유인물을 참조하세요.',
  },
  handout: {
    versionLabel: '버전',
    subtitle: 'Roll20의 16진수 탐색',
    footer: '원클릭 제어를 위해서는 "{deck}" 유인물을 사용하세요.',
    overview: {
      heading: '개요',
      body: 'Heexploration은 불투명한 육각형 지도를 포함합니다. 파티가 이동함에 따라 그들이 통과하는 헥스(원하는 경우 주변의 헥스)가 제거되므로 지도는 한 번에 한 헥스씩 발견됩니다. 숨겨진 위치는 육각형 아래에 배치할 수 있으며 발견되면 알려줍니다. Jumpgate 및 Legacy 게임, 모든 크기의 Hex(V) 및 Hex(H) 그리드에서 작동합니다.',
      demo: '짧은 데모 보기(버전 1부터)',
    },
    quickStart: {
      heading: '빠른 시작',
      steps: [
        '그리드가 16진수(V) 또는 16진수(H)로 설정된 페이지를 엽니다.',
        '숨길 영역 주위에 하나 이상의 도형(다각형, 직사각형, 타원 또는 자유형)을 그립니다.',
        '모양을 선택하고 Command Deck에서 채우기를 클릭합니다(또는 !heexploration fill을 입력). 모양이 육각형으로 대체됩니다.',
        '선택사항: 작성하기 전에 중요한 장소에 대한 토큰을 선택하고 위치 표시를 클릭하세요. 그것들은 육각형 아래에 숨겨져 있으며 발견되면 알려줍니다.',
        '플레이어 토큰을 이동합니다. 통과하는 모든 헥스와 가시 거리 내에 있는 헥스가 공개됩니다.',
      ],
    },
    commands: {
      heading: '명령',
      intro:
        'GM만이 이 명령을 사용할 수 있습니다. 대부분은 선택한 개체에 작용합니다. 나머지는 현재 보고 있는 페이지에서 수행됩니다.',
      colCommand: '명령',
      colDesc: '기능',
    },
    revealing: {
      heading: '공개 작동 방식',
      points: [
        '토큰 레이어의 토큰만 16진수를 나타냅니다. 공개하는 토큰(Tokens That Reveal)에 의해 설정된 토큰 수는 기본적으로 플레이어 토큰이므로 GM은 지도를 열지 않고도 몬스터를 이동할 수 있습니다.',
        '토큰은 해당 토큰이 포함하는 모든 헥스를 표시하며(큰 토큰은 여러 개를 포함) 경로를 따라 표시를 설정하면 웨이포인트를 포함하여 드래그된 경로의 모든 헥스를 표시합니다.',
        '시야 거리는 각 헥스 주변의 헥스를 나타냅니다. 시선이 켜진 상태에서, 가려진 헥스가 사이에 없는 경우에만 헥스가 드러납니다.',
        'Hex Reveal Distance는 그려진 헥스에 저장됩니다. 이러한 헥스는 토큰이 볼 수 있는 거리에 관계없이 그 만큼의 헥스 내에서만 드러납니다. 뒤에 있는 것이 숨겨져 있는 산이나 숲에 사용하세요.',
        'Glimpse 모드에서는 시야 내의 육각형이 사라지는 대신 투명해지며, 토큰이 들어갈 때 제거됩니다.',
        'API는 다른 모드의 움직임을 보고하지 않습니다. TokenMod 이동은 자동으로 선택됩니다. 다른 모드의 경우 토큰을 선택하고 탐색을 클릭하거나 자신의 모드에서 Hexploration.revealAround(token)를 호출하세요.',
        'API는 다른 모드의 움직임을 보고하지 않습니다. TokenMod 이동은 자동으로 선택됩니다. 다른 모드의 경우 토큰을 선택하고 탐색을 클릭하거나 자신의 모드에서 Hexploration.revealAround(token)를 호출하세요.',
      ],
    },
    locations: {
      heading: '명명된 육각형 및 위치',
      points: [
        'Mark Location은 선택한 토큰을 숨겨진 위치로 바꿉니다. 이미 헥스 아래에 있는 토큰은 즉시 숨겨집니다. 그렇지 않으면 그것을 덮는 다음 채우기에 의해 숨겨집니다.',
        '흰색 타워 상태 표시가 있는 토큰도 버전 1에서와 같이 채우기 시 위치로 처리됩니다.',
        '숨겨진 위치 토큰은 GM 레이어로 이동됩니다. 헥스가 공개되면 이름이 표시된 토큰 레이어로 돌아가고 발견이 발표됩니다.',
        'Name Hex는 토큰 없이 16진수에 이름을 부여합니다. 이름은 GM 레이어의 라벨로 GM에게 표시되며 헥스가 공개되면 알려집니다.',
        '발견 발표는 모든 사람, GM만 볼 수 있는지, 아니면 아무도 볼 수 없는지 선택합니다. Ping Discoveries는 또한 플레이어의 시야를 해당 위치로 이동시킵니다.',
      ],
    },
    settings: {
      heading: '설정',
      intro:
        '!heexploration set(또는 설정 버튼)을 사용하여 설정을 변경하세요. Hex Layer, Tokens That Reveal 및 언어도 Mod의 설정 페이지에서 설정할 수 있습니다.',
      colKey: '열쇠',
      colName: '환경',
      colDesc: '설명',
      perPage: '(페이지별로 설정 가능합니다.)',
    },
    jumpgate: {
      heading: '점프게이트와 레거시',
      points: [
        'Heexploration은 게임이 어떤 엔진을 사용하는지 알아내고 그에 맞는 모양을 그립니다. 두 편집기 중 하나에서 그린 모양을 채울 수 있습니다.',
        'Hex Layer를 Auto로 설정하면 토큰 위의 전경 레이어에 육각형이 그려지므로 플레이어는 그 아래에 무엇이 있는지 볼 수 없습니다. 전경 레이어를 사용할 수 없는 경우 토큰 레이어가 대신 사용됩니다.',
        'Jumpgate는 레거시 육각형과 모양이 약간 다른 수학적으로 규칙적인 육각형을 그립니다. 16진수가 페이지의 그리드와 일치하지 않으면 토큰을 16진수 중앙에 맞춰 선택하고 보정을 클릭하세요. 동일한 행(Hex V) 또는 열(Hex H)의 인접한 헥스에서 두 개의 토큰을 선택하여 16진수 크기도 수정합니다.',
        '페이지나 게임이 복사되면 해당 헥스에 새 ID가 부여됩니다. 페이지에서 다시 스캔을 실행하여 이름 라벨 및 위치 토큰과 함께 다시 가져옵니다.',
      ],
    },
    upgrading: {
      heading: '버전 1에서 업그레이드',
      points: [
        '버전 2에는 더 이상 PathMath, MatrixMath, Vector Math 또는 HTML Builder가 필요하지 않습니다. 다른 모드에서 사용하지 않는 한 제거할 수 있습니다.',
        '기존 16진수 지도, 이름, 위치 토큰 및 설정은 처음 시작할 때 자동으로 업그레이드됩니다.',
        'Heexploration_menu 매크로를 포함한 버전 1 명령은 여전히 ​​작동합니다.',
        '버전 1에서는 문자를 나타내는 모든 토큰이 16진수를 표시할 수 있습니다. 해당 행동을 유지하려면 공개되는 토큰을 캐릭터 토큰으로 설정하세요.',
      ],
      colV1: '버전 1 명령',
      colV2: '버전 2 명령',
    },
    troubleshooting: {
      heading: '문제 해결',
      points: [
        '토큰이 이동할 때 아무 일도 일어나지 않습니다. 토큰이 토큰 레이어에 있고 공개되는 토큰과 일치하는지, 페이지에 16진수(!hexploration 상태)가 있는지 확인하세요.',
        '육각형은 그리드에서 오프셋됩니다. 보정을 사용한 다음 지도 전체에 걸쳐 몇 개의 육각형에 대한 토큰을 확인하십시오.',
        '페이지나 게임을 복사한 후 Hexes가 표시되지 않습니다. 페이지에서 다시 검색을 실행하세요.',
        '채우기는 해당 영역에 16진수 중심이 없음을 나타냅니다. 모양에는 최소한 하나의 16진수 중심이 포함되어야 합니다.',
        '그 밖의 사항은 API 콘솔 로그를 확인하고 도움을 요청할 때 해당 메시지를 포함하세요.',
      ],
    },
    languages: {
      heading: '언어',
      body: '!heexploration set 언어로 언어를 선택하세요. 사용 가능한 언어:',
      colLanguage: '언어',
      colNative: '본명',
      colCode: '암호',
    },
    credits: {
      heading: '크레딧',
      original: '원본 모드 작성자:',
      maintainer: '버전 2는 다음에 의해 유지 관리됩니다.',
      marketplace: 'Roll20 마켓플레이스의 Ada 아트 팩',
      support:
        '버그를 발견하거나 아이디어가 있는 경우 Roll20 Mod 포럼에 게시하거나 GitHub에서 문제를 열고 API 콘솔 로그의 메시지를 포함하세요.',
    },
  },
};

export default TRANSLATION;
