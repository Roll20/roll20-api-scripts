const TRANSLATION = {
  titles: {
    ready: '집중이 준비되었습니다.',
    menu: '농도 설정',
    help: '집중 명령',
    status: '누가 집중하고 있는가',
    advantage: '집중 저장에 대한 이점',
    reset: '집중력 재설정',
    concentration: '집중',
    save: '집중저장',
    check: '집중력체크',
  },
  messages: {
    migrated:
      '버전 1.0에서 업그레이드되었습니다. 귀하의 설정과 이점 목록은 그대로 유지되었으며 이전 매크로도 여전히 작동합니다.',
    reconciled:
      '지도를 따라잡았습니다. 집중 토큰이 {added}에서 발견되었으며, 이전 항목이 {dropped}에서 제거되었습니다.',
    readyHint: '설정에 {command}을 입력하거나 Command Deck 유인물을 엽니다.',
    settingChanged: '{setting}은(는) 이제 {value}입니다.',
    confirmReset:
      '모든 설정을 기본값으로 되돌리고 이점 목록을 삭제하시겠습니까? 지도의 집중 표시가 유지됩니다.',
    reset: '설정이 기본값으로 돌아갑니다.',
    journal: '유인물이 재구성되었습니다: {help} 및 {deck}.',
  },
  notices: {
    started: '{name}은(는) 현재 {spell}에 집중하고 있습니다.',
    startedNoSpell: '{name}은(는) 지금 집중 중입니다.',
    switched: '{name}은(는) {old}에 집중하는 것을 멈추고 이제 {spell}에 집중하고 있습니다.',
    switchedNoSpell: '{name}은(는) 지금 집중 중입니다.',
    ended: '{name}은(는) 더 이상 {spell}에 집중하지 않습니다.',
    endedNoSpell: '{name}은(는) 더 이상 집중하지 않습니다.',
    lost: '{name}은(는) {spell}에 대한 집중력을 잃습니다.',
    lostNoSpell: '{name}이(가) 집중력을 잃습니다.',
    kept: '{name}은(는) {spell}에 계속 집중하고 있습니다.',
    keptNoSpell: '{name}은(는) 계속 집중하고 있습니다.',
    zeroHp: '{name}은 체력이 0으로 떨어지고 {spell}에 대한 집중력을 잃습니다.',
    zeroHpNoSpell: '{name}의 체력이 0으로 떨어지고 집중력을 잃습니다.',
    checkNeeded: '{name}은(는) 계속 집중하기 위해 체질 내성 굴림을 해야 합니다: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: '수정자',
    roll: '연타',
    advantageRoll: '{first} 및 {second}(장점)',
    success: '성공',
    failure: '실패',
  },
  menu: {
    concentratingCount: '지금 집중 중: {count}',
    settings: '설정',
    footer: '여기로 돌아오려면 {command}을 입력하세요. 모든 버튼은 "{deck}" 유인물에도 있습니다.',
  },
  status: {
    none: '아무도 집중하지 않습니다.',
  },
  advantage: {
    intro:
      'On Roll로 설정된 캐릭터는 War Caster feat와 마찬가지로 집중력을 유리하게 저장합니다. 이는 자동 저장에 적용됩니다.',
    none: '이 게임에는 캐릭터가 없습니다.',
  },
  buttons: {
    roll: '연타',
    advantage: '이점',
    status: '상태',
    advantageMenu: '장점 메뉴',
    help: '돕다',
    reset: '다시 놓기',
    confirmReset: '설정 재설정',
    end: '끝',
    menu: '메뉴',
    concentrate: '집중하다…',
    toggle: '비녀장',
    journal: '유인물 다시 작성',
  },
  prompts: {
    spell: '주문',
  },
  values: {
    on: '~에',
    off: '끄다',
    bar: '바 {bar}',
    unnamed: '이름 없음',
    sendTo: {
      everyone: '모든 사람',
      character: '성격',
      gm: 'GM',
    },
    supportMode: {
      basic: '기초적인',
      detailed: '상세한',
    },
  },
  settings: {
    language: {
      label: '언어',
      desc: '채팅 메시지 및 유인물의 언어입니다.',
    },
    command: {
      label: '명령',
      desc: '"!"가 없는 채팅 명령입니다. 버전 1.0 매크로는 집중을 사용합니다.',
    },
    statusmarker: {
      label: '상태 마커',
      desc: '집중력을 나타내는 토큰 마커입니다. 사용자 정의 토큰 마커를 사용할 수 있습니다.',
    },
    bar: {
      label: 'HP 바',
      desc: '체력을 보유하는 토큰 바입니다. 손상을 입으면 집중 저장이 필요합니다.',
    },
    send_reminder_to: {
      label: '알림 보내기',
      desc: '집중 메시지를 보고 저장하는 사람: 모든 사람, GM 또는 캐릭터의 플레이어(GM이 사본을 얻습니다).',
    },
    auto_add_concentration_marker: {
      label: '자동 추가 연결 채점자',
      desc: '시트에서 집중 주문을 시전할 때 마커를 추가합니다.',
      hint: 'D&D 5e 2014(OGL) 및 2024 시트.',
    },
    auto_roll_save: {
      label: '자동 롤 저장',
      desc: '집중 토큰이 피해를 입는 즉시 저장을 굴립니다. 꺼져 있으면 알림에 Roll 및 Advantage 버튼이 있습니다.',
    },
    show_roll_button: {
      label: '롤 버튼',
      desc: '자동 롤 저장이 꺼진 경우 알림에 롤 및 이점 버튼을 추가합니다.',
    },
    end_at_zero: {
      label: '0HP에서 종료',
      desc: '토큰의 체력이 0으로 떨어지면 저장하지 않고 집중을 종료합니다.',
    },
    bonus_attribute: {
      label: '보너스 속성',
      desc: '집중에 추가된 시트 속성이 저장됩니다. Constitution_save_mod는 D&D 5e 2014 및 2024 시트에서 작동합니다.',
    },
    debug: {
      label: '디버그 모드',
      desc: '지원 요청을 위해 철자 감지에 대한 메모를 작성하고 API 콘솔에 저장합니다.',
    },
    support_mode: {
      label: '지원 모드',
      desc: '디버그 모드에서 쓰는 양: 기본(간단) 또는 상세.',
    },
  },
  help: {
    menu: '아무것도 선택하지 않은 상태(GM): 설정을 엽니다. 토큰을 선택한 경우: 집중 시작 또는 종료.',
    toggle:
      '선택한 토큰으로 주문에 집중하세요. 전환할 다른 주문의 이름을 지정하세요. 다시 실행하여 종료하세요.',
    end: '선택한 토큰에 대한 최종 집중입니다.',
    status: '집중하고 있는 사람을 종료 버튼으로 나열하세요.',
    config: '설정을 변경합니다(예: config auto_roll_save|false).',
    advantageMenu: '어떤 캐릭터의 롤 집중이 유리하게 저장되는지 선택하십시오.',
    toggleAdvantage: '한 캐릭터의 장점을 켜거나 끕니다.',
    roll: '미리 알림의 Roll 또는 Advantage 버튼에서 저장을 굴립니다.',
    journal: '도움말 및 명령 데크 유인물을 재구성합니다.',
    reset: '모든 설정을 기본값으로 되돌립니다.',
    help: '이 목록을 보여주세요.',
    footer: '전체 지침은 "{help}" 유인물에 있습니다. 버튼은 "{deck}" 유인물에 있습니다.',
    playerFooter: '먼저 토큰을 선택하세요.',
  },
  errors: {
    noSelection: '먼저 토큰을 선택하세요.',
    notYours: '당신이 조종하는 토큰의 농도만 변경할 수 있습니다.',
    gmOnly: 'GM만이 해당 명령을 사용할 수 있습니다.',
    notConcentrating: '그 토큰은 집중하고 있지 않습니다.',
    unknownSetting: '"{key}"이라는 설정이 없습니다.',
    badSettingValue: '"{value}"은(는) {key}에 유효한 값이 아닙니다.',
    rollExpired: '해당 버튼은 만료되었습니다.',
    unknownCharacter: '해당 캐릭터는 더 이상 존재하지 않습니다.',
    internal: '문제가 발생했습니다. API 콘솔에 세부정보가 있습니다.',
  },
  hints: {
    noSelection: '시전자의 토큰을 선택한 후 명령을 다시 실행하십시오.',
    rollExpired: '버튼은 한 번에 10분 동안 작동합니다. 새 토큰을 위해 토큰을 다시 손상시키십시오.',
    unknownSetting: '설정을 보려면 아무것도 선택하지 않고 명령을 입력하십시오.',
  },
  warnings: {
    unknownMarker:
      '상태 마커 "{marker}"은(는) 이 게임의 마커 중 하나가 아닙니다. 설정에서 다른 것을 선택하세요.',
  },
  deck: {
    subtitle: '커맨드 덱',
    selected: '선택된 토큰',
    selectedDesc: '시전자의 토큰을 먼저 선택하세요.',
    table: '테이블',
    tableDesc: '누가 집중하고 있는지, 누가 저장에 유리한지 확인하세요.',
    tools: '도구',
    toolsDesc: '설정, 명령 목록 및 유인물.',
    footer: '전체 지침은 "{help}" 유인물에 있습니다.',
  },
  handout: {
    versionLabel: '버전',
    subtitle: 'D&D 5e의 집중력 표시, 알림 및 저장',
    overview: {
      heading: '개요',
      body: '집중은 누가 어떤 주문에 집중하고 있는지 추적합니다. 시전자의 토큰에 마커를 놓고 해당 토큰이 피해를 입으면 건강 내성을 굴리고(또는 요청하고) 집중이 끝나면 테이블에 알립니다.',
    },
    quickStart: {
      heading: '빠른 시작',
      steps: [
        '시전자의 토큰을 선택하고 !concentration을 입력한 다음 주문을 입력합니다(예: !concentration Bless).',
        '막대 버블에서 토큰의 체력을 변경합니다. 세이브는 DC 10에서 굴리며, DC 10이 높으면 데미지의 절반입니다.',
        '집중을 종료하려면 동일한 명령을 다시 실행하거나 마커를 제거하세요.',
        '설정을 열려면 아무것도 선택하지 않은 상태에서 !concentration을 입력하세요.',
      ],
    },
    concentrating: {
      heading: '집중하다',
      points: [
        '새로운 집중 주문을 시전하는 것처럼 다른 주문의 이름을 지정하면 집중이 해당 주문으로 전환됩니다.',
        '손으로 토큰에 마커를 놓으면 주문 없이 집중이 시작됩니다. 떼어내거나 토큰을 삭제하면 종료됩니다.',
        '집중하는 캐릭터의 새로운 연결된 토큰이 마커를 가져오고, 마커를 운반하는 붙여넣은 토큰이 추적됩니다.',
        '연결된 체력 막대가 있는 한 캐릭터의 토큰은 집중을 공유합니다. 한 장의 고블린 무리와 같이 연결되지 않은 토큰은 자체적으로 집중됩니다.',
        'Send Reminder To(알림 보내기)가 달리 명시되지 않는 한 집중이 시작, 전환 또는 종료될 때 모든 사람이 메시지를 봅니다.',
      ],
    },
    saves: {
      heading: '집중력이 절약됩니다',
      points: [
        'DC는 10 또는 받은 피해의 절반 중 더 높은 값이며 최대 DC 30입니다.',
        '수정자는 캐릭터 시트의 보너스 속성에서 나옵니다. 누락된 값은 0으로 계산됩니다.',
        '자동 롤 저장 롤을 한 번에 저장합니다. 꺼져 있으면 알림에 플레이어나 GM을 위한 Roll 및 Advantage 버튼이 있습니다.',
        '저장에 실패하면 집중력이 종료됩니다. End at 0 HP를 켜면 체력이 0으로 떨어지면 세이브 없이 종료됩니다.',
        '장점 메뉴는 War Caster 업적과 마찬가지로 자동 저장 시 캐릭터 이점을 제공합니다.',
      ],
    },
    automatic: {
      heading: '시트에서 시전되는 주문',
      points: [
        '자동 추가 연결 포함. 마커를 켜면 D&D 5e 2014(OGL) 또는 2024 시트에서 집중 주문을 시전하면 마커가 추가됩니다.',
        '보고 있는 페이지에 시전자의 토큰이 표시됩니다. 토큰이 없으면 모든 페이지에 토큰이 있습니다.',
        'GM, 다른 모드 또는 캐릭터 플레이어 중 한 명의 카드만 계산됩니다. 같은 주문을 다시 시전해도 아무런 변화가 없습니다.',
        'War Caster 업적과 같이 텍스트에서 집중만 언급하는 D&D 2024 카드는 집중을 시작할 수 있지만 주문을 대체할 수는 없습니다.',
        'D&D 2024 시트에는 실험적 API 서버가 필요할 수 있습니다. 디버그 모드를 켜서 주문이 감지되거나 감지되지 않은 이유를 확인하세요.',
      ],
    },
    players: {
      heading: '플레이어',
      points: [
        '플레이어는 자신이 제어하는 ​​토큰에 대해 집중을 시작하고 종료할 수 있으며, 자신의 저장 시 Roll 및 Advantage 버튼을 사용할 수 있습니다.',
        '알림 보내기를 사용하면 캐릭터로 설정하면 해당 캐릭터의 플레이어와 GM에게 메시지가 귓속말로 전달됩니다.',
      ],
    },
    commands: {
      heading: '명령',
      intro: 'ScriptCard와 같은 다른 Mod도 이러한 명령을 보낼 수 있습니다.',
      colCommand: '명령',
      colDesc: '기능',
    },
    settings: {
      heading: '설정',
      intro:
        '설정 카드의 버튼을 사용하거나 config <key>|<value>를 사용하여 설정을 변경합니다. 일부는 Mod 페이지에서 설정할 수도 있습니다.',
      colKey: '열쇠',
      colName: '이름',
      colDesc: '기능',
    },
    upgrading: {
      heading: '버전 1.0에서 업그레이드',
      points: [
        '설정, 이점 목록 및 모든 명령이 계속 작동합니다.',
        '이제 집중이 언제 끝나는지, 어떤 주문이 ​​적용되는지 메시지가 표시됩니다.',
        '이미 마커가 있는 토큰은 시작 시 선택됩니다.',
      ],
    },
    troubleshooting: {
      heading: '문제 해결',
      points: [
        '체력이 떨어지면 저장되지 않습니다. 토큰에 마커가 있고 HP 바가 변경한 바인지 확인하세요. API를 통해 다른 Mod에 의해 변경된 사항은 이벤트를 발생시키지 않으므로 표시되지 않습니다.',
        '수정자는 0입니다. 캐릭터 시트와 비교하여 보너스 속성을 확인하세요.',
        '시트에서 시전된 주문은 감지되지 않습니다. 디버그 모드를 켜고 다시 주문을 시전한 후 API 콘솔을 읽으세요.',
        '두 문자가 이름을 공유합니다. 감지에서는 첫 번째 일치 항목을 사용합니다. 캐릭터에게 고유한 이름을 부여하세요.',
      ],
    },
    languages: {
      heading: '언어',
      body: '농도는 아래 언어로 번역됩니다. 언어 설정이 있는 것을 선택하세요.',
      colCode: '암호',
      colName: '언어',
      colNative: '본명',
    },
    credits: {
      heading: '크레딧',
      original: '원본 모드 작성자:',
      maintainer: '유지관리자',
      support: 'Roll20 Mod 포럼이나 GitHub에 버그와 아이디어를 보고하세요.',
    },
    footer: '모든 작업에 대한 버튼은 "{deck}" 유인물에 있습니다.',
  },
};

export default TRANSLATION;
