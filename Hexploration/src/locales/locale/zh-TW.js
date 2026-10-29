const TRANSLATION = {
  titles: {
    ready: "H探索已準備就緒。",
    settings: "H探索設置",
    languages: "選擇語言",
    pageSettings: "頁面設定：{page}",
    status: "H探索狀態：{page}",
    help: "探索命令",
    confirm: "請確認",
  },
  discovery: {
    title: "發現地點",
  },
  menu: {
    draw: "畫",
    reveal: "顯示和隱藏",
    locations: "地點",
    tools: "工具",
    layerInUse: "正在 {layer} 上繪製新的六角形。",
    pageSettingsHelp: "這些設定僅適用於該頁面。標記為★的設定將覆蓋全域設定。",
  },
  buttons: {
    fill: "充滿",
    fillInverse: "反向填充",
    undo: "撤銷填充",
    reveal: "揭示",
    conceal: "隱藏",
    explore: "探索",
    revealPage: "顯示頁面",
    resetPage: "重置頁面",
    mark: "標記位置",
    unmark: "取消標記",
    name: "名稱十六進位",
    settings: "設定",
    pageSettings: "頁面設定",
    status: "地位",
    rescan: "重新掃描",
    calibrate: "校準",
    calibrateReset: "重置校準",
    help: "幫助",
    change: "改變",
    menu: "選單",
    clearOverrides: "清除覆蓋",
    confirmReset: "是的，刪除所有六角形",
  },
  prompts: {
    name: "地點名稱（留空以清除）",
  },
  values: {
    on: "在",
    off: "離開",
    none: "沒有任何",
    hexLayer: {
      auto: "自動（前景，如果可用）",
      foreground: "前景層",
      objects: "令牌層",
    },
    revealBy: {
      players: "玩家代幣",
      characters: "Character tokens",
      all: "所有代幣",
    },
    revealMode: {
      clear: "清除",
      glimpse: "一瞥",
    },
    announce: {
      all: "每個人",
      gm: "限通用汽車",
      off: "離開",
    },
    orientation: {
      vertical: "六角 (V)",
      horizontal: "六角 (H)",
    },
    fillKind: {
      fill: "充滿",
      fillInverse: "反向填充",
      conceal: "隱藏",
    },
  },
  settings: {
    language: {
      label: "語言",
      desc: "選單、訊息和講義的語言。",
    },
    hexLayer: {
      label: "六角層",
      desc: "繪製新六角形的地方。自動嘗試前景層（令牌上方），如果遊戲不支持，則回退到令牌層。",
    },
    fillColor: {
      label: "填充顏色",
      desc: "新六角形的顏色。使用 rgba() 來透視十六進位，例如 rgba(0,0,0,0.8)。",
    },
    strokeColor: {
      label: "邊框顏色",
      desc: "新六邊形輪廓的顏色。",
    },
    labelColor: {
      label: "標籤顏色",
      desc: "命名六角形上僅限 GM 的名稱標籤的顏色。",
    },
    glimpseColor: {
      label: "瞥見顏色",
      desc: "瞥見時，顏色六角形會變更為（瞥見顯示模式）。使用透明的 rgba() 顏色。",
    },
    strokeWidth: {
      label: "邊框寬度",
      desc: "新六邊形輪廓的寬度，以像素為單位（0 到 20）。",
    },
    maxDistance: {
      label: "十六進位顯示距離",
      desc: "應用於繪製的六角形：令牌必須位於這麼多六角形內才能顯示它們，無論它能看到多遠。留空則無限制。",
    },
    revealDistance: {
      label: "視距",
      desc: "顯示移動令牌周圍有多少個六角形（0 到 20）。 0 僅顯示令牌經過的六角形。",
    },
    lineOfSight: {
      label: "視線",
      desc: "啟用後，僅當六角形與令牌之間沒有被覆蓋的六角形時，該六角形才會顯示。",
    },
    revealPath: {
      label: "沿路徑顯示",
      desc: "啟用後，標記在拖曳時經過的每個六角形（包括路徑點）都會顯示出來，而不僅僅是其停止的位置。",
    },
    revealBy: {
      label: "揭示的代幣",
      desc: "令牌層上的哪些令牌顯示六角形：由玩家控制的令牌、代表任何角色的令牌或每個令牌。",
    },
    revealMode: {
      label: "揭示模式",
      desc: "清除可移除視線範圍內的六角形。瞥見反而讓他們看穿；當令牌進入它們時，它們就會被刪除。",
    },
    announce: {
      label: "宣布發現",
      desc: "當發現指定位置時誰會看到聊天訊息。",
    },
    pingDiscoveries: {
      label: "平發現",
      desc: "啟用後，當發現指定位置時，玩家會被 ping 到該位置。",
    },
  },
  status: {
    engine: "遊戲引擎",
    grid: "網格",
    layer: "六角層",
    hexes: "六角形",
    named: "命名六角形",
    icons: "位置標記",
    glimpsed: "瞥見的六角形",
    pending: "等待填補的地點",
    calibrated: "已校準",
    overrides: "頁面覆蓋",
    undo: "可以撤銷",
  },
  messages: {
    filled:
      "填入完成：繪製 {created} 六角形，重新設計 {restyled} 樣式，隱藏 {icons} 位置。",
    revealed: "{count} 十六進位顯示。",
    revealedPage: "顯示頁面上的所有 {count} 十六進位。",
    confirmReset:
      "從“{page}”中刪除所有 {count} 十六進位嗎？位置令牌返回令牌層。撤銷無法逆轉此情況。",
    resetPage: "從頁面中刪除了 {count} 十六進位。",
    undone:
      "上次填入撤銷：刪除了 {removed} 六角形，恢復了 {restored} 重新設計的六角形。",
    named: "{count} 名為「{name}」的十六進位。",
    unnamed: "從 {count} 十六進位清除名稱。",
    marked:
      "{attached} 隱藏在現有六角形中的位置； {pending} 將被覆蓋它們的下一個填充隱藏。",
    unmarked: "{count} 標記不再是位置。",
    settingChanged: "{setting} 設定為 {value}。",
    rescanned:
      "重新掃描完成：保留 {kept} 十六進制，採用 {adopted}，重新歸檔 {moved}，忘記 {dropped} 缺失的十六進位，重新連結 __HEX_PLACEHOLDER_4%__HOLDER 41_ACE__HOL _HEX_",
    calibrated:
      "網格校準（列步長 {colStep}px，行步長 {rowStep}px）。重新掃描：{kept} 保留，{moved} 重新歸檔，{adopted} 採用。",
    calibrationReset:
      "校準已刪除。重新掃描：{kept} 保留，{moved} 重新歸檔，{adopted} 採用。",
    journalRebuilt: 'The "{help}" and "{deck}" handouts have been rebuilt.',
    migrated:
      "您的 Heexploration 1.x 十六進位地圖已升級。如果此遊戲是從舊版遊戲複製的，請在每個十六進位地圖頁面上執行重新掃描。",
    pruned:
      "{dropped} 保存的十六進位不再存在並被遺忘。如果該遊戲或頁面被複製，請在該頁面上執行重新掃描以再次擷取其六角形。",
    readyHint:
      "在選單中輸入 !hexploration，或開啟「Hexploration - Command Deck」講義。",
  },
  warnings: {
    foregroundUnavailable:
      "遊戲不支援在前景圖層上繪製，因此在令牌層上繪製了六角形。",
    someFailed: "無法繪製 {count} 六角形。檢查 API 控制台以了解詳細資訊。",
  },
  errors: {
    noPage: "找不到要處理的頁面。",
    notHex: "此頁面不使用六角網格。",
    noPolygons: "選擇一個或多個要填滿的繪製形狀。",
    emptyArea: "所選區域不包含任何六角形中心。",
    tooMany: "這會建立 {count} 六角形，一次性就太多了。",
    nothingToConceal: "選擇要隱藏的繪製形狀或標記。",
    nothingToReveal: "選擇要顯示的六角形、繪製的形狀或標記。",
    noTokens: "首先選擇一個或多個令牌。",
    noHexes: "首先選擇一個或多個六角形（或站在六角形上的標記）。",
    nothingToUndo: "沒有可撤消的填充。",
    unknownCommand: "未知指令：{command}",
    unknownSetting: "未知設定：{key}",
    unknownPageSetting: "每頁可設定的設定：{keys}",
    invalidValue: "“{value}”對於 {key} 不是有效值。",
    calibrateNeedsTokens: "選擇一或兩個吸附到六角形中心的標記。",
    calibrateFailed: "這些令牌不能用於校準。",
    unexpected: "出了點問題：{message}",
  },
  hints: {
    noPage: "開啟您要處理的頁面，或選擇其中的某些內容。",
    notHex: "在頁面設定中將頁面網格設定為十六進位 (V) 或十六進位 (H)。",
    noPolygons:
      "圍繞該區域繪製多邊形、矩形、橢圓形或手繪形狀，選擇它，然後重試。",
    emptyArea: "繪製更大的形狀，或檢查頁面網格設定。",
    tooMany: "填滿較小的區域，或將該區域分割成多個形狀。",
    noHexes: "六角形位於前景或令牌層；切換到該層以選擇它們。",
    unknownCommand: "鍵入 !hexploration help 以列出指令。",
    unknownSetting: "輸入 !hexploration set 查看每個設定。",
    calibrateNeedsTokens:
      "將標記捕捉到六角形的中心並選擇它。選取捕捉到同一行 (Hex V) 或列 (Hex H) 中相鄰六角形的第二個標記，也可以修正六角形大小。",
    calibrateFailed:
      "兩個標記必須位於同一行 (Hex V) 或同一列 (Hex H)，相距至少 1 個十六進位。",
    unexpected: "詳細資訊位於 API 控制台日誌中。",
  },
  help: {
    menu: "顯示選單。",
    fill: "用六角形覆蓋選定的繪製形狀。",
    fillInverse: "覆蓋除所選形狀內部之外的整個頁面。",
    undo: "Undo the last fill, inverse fill or conceal, and restore the shapes it used.",
    reveal: "顯示選定的六角形以及選定形狀和標記下的六角形。",
    revealPage: "顯示頁面上的每個十六進制，無需公告。",
    conceal: "再次用六角形覆蓋所選形狀和標記下方的區域。",
    explore: "顯示所選標記的周圍，就好像它們剛剛移動到那裡一樣。",
    resetPage: "刪除頁面上的每個十六進制（首先詢問）。",
    name: "命名選定的六角形或選定標記下的六角形。將名稱留空以將其清除。",
    mark: "將選取的標記變成隱藏位置。",
    unmark: "停止將選定的標記隱藏在位置。",
    set: "更改設定或顯示所有設定。",
    pageSet: "僅覆蓋目前頁面上的顯示設定。",
    pageClear: "刪除目前頁面的覆蓋。",
    rescan: "重建頁面的十六進位列表，例如複製頁面或遊戲後。",
    calibrate: "將六角形網格與對齊到六角形中心的一兩個選定標記對齊。",
    calibrateReset: "刪除目前頁面的校準。",
    status: "顯示 Hexploration 對目前頁面的了解。",
    journal: "重建幫助和命令平台講義。",
    help: "顯示此清單。",
    handout: "完整說明位於「{name}」講義。",
  },
  deck: {
    subtitle: "指揮台",
    drawDesc:
      "在某個區域周圍繪製形狀，選擇它們，然後填充。撤消會反轉最後一次填充。",
    revealDesc:
      "選擇六角形、形狀或標記以再次顯示或覆蓋它們。探索會顯示所選標記周圍的情況，就好像它們已移動一樣。",
    locationsDesc:
      "選擇標記以將其隱藏為六角形下的位置。選擇十六進位或標記來命名十六進位。",
    toolsDesc: "設定、頁面覆蓋、狀態、重新掃描複製的頁面和校準網格。",
    footer: "有關完整說明，請參閱“{help}”講義。",
  },
  handout: {
    versionLabel: "版本",
    subtitle: "Roll20 的逐十六進位探索",
    footer: "使用“{deck}”講義進行一鍵式控制項。",
    overview: {
      heading: "概述",
      body: "Heexploration 覆蓋了帶有不透明六角形的六角形地圖。當隊伍移動時，他們穿過的六角形（如果你願意的話，他們周圍的六角形）也會被移除，因此地圖一次會露出一個六角形。隱藏位置可以放置在六角形下，並在發現時宣布。它適用於 Jumpgate 和 Legacy 遊戲，適用於任何大小的 Hex (V) 和 Hex (H) 網格。",
      demo: "觀看簡短的演示（來自版本 1）",
    },
    quickStart: {
      heading: "快速入門",
      steps: [
        "開啟網格設定為十六進位 (V) 或十六進位 (H) 的頁面。",
        "在要隱藏的區域周圍繪製一個或多個形狀（多邊形、矩形、橢圓形或手繪）。",
        "選擇形狀並點選指令面板中的「填滿」（或鍵入 !hexploration fill）。形狀被六角形取代。",
        "可選：填寫前，選擇重要地點的標記，然後按一下「標記位置」。它們隱藏在六角形下並在被發現時宣布。",
        "移動玩家令牌。它穿過的每個六角形以及其視距內的六角形都會被顯示出來。",
      ],
    },
    commands: {
      heading: "命令",
      intro:
        "只有 GM 可以使用這些指令。大多數作用於選定的物件；其餘的將在您正在查看的頁面上進行操作。",
      colCommand: "命令",
      colDesc: "它的作用",
    },
    revealing: {
      heading: "揭示如何運作",
      points: [
        "只有令牌層上的令牌才會顯示六角形。預設情況下，哪些令牌計數由「顯示的令牌：玩家令牌」設置，因此 GM 可以在不揭開地圖的情況下移動怪物。",
        "標記會顯示它所覆蓋的每個六角形（大標記會覆蓋幾個），並且在啟用「沿路徑顯示」的情況下，會顯示它所拖曳的路線上的每個六角形，包括航路點。",
        "視距顯示每個六角形周圍的六角形。當視線打開時，只有當中間沒有被覆蓋的六角形時才會顯示六角形。",
        "六角形顯示距離在繪製時儲存在六角形上。無論令牌能看到多遠，這些六角形都只能從那麼多六角形內顯露出來。將其用於隱藏其後面的山脈或森林。",
        "在「一瞥」模式中，視線內的六角形會變得透明而不是消失，當令牌進入其中時會被移除。",
        "API 不會報告其他模組所做的動作。 TokenMod 動作會自動拾取；對於其他 mod，請選擇令牌並點擊“探索”，或從您自己的 mod 中呼叫 Heexploration.revealAround(token)。",
      ],
    },
    locations: {
      heading: "命名六角形和位置",
      points: [
        "標記位置將選定的標記轉變為隱藏位置。已經在六角形下的標記會立即隱藏；否則它會被覆蓋它的下一個填充隱藏。",
        "與版本 1 一樣，帶有白塔狀態標記的標記在您填充時也被視為位置。",
        "隱藏位置標記被移至 GM 層。當他們的十六進制被揭露時，他們返回到令牌層並顯示他們的名字，並宣布他們的發現。",
        "Name Hex 為十六進位提供一個沒有標記的名稱。該名稱作為 GM 層上的標籤顯示給 GM，並在十六進位顯示時宣布。",
        "宣布發現選擇是所有人、僅總經理還是無人看到該公告。 Ping Discoveries 也將玩家的視野移動到該位置。",
      ],
    },
    settings: {
      heading: "設定",
      intro:
        "使用 !hexploration set（或「設定」按鈕）變更設定。十六進位圖層、顯示的令牌和語言也可以在 Mod 的設定頁面上設定。",
      colKey: "鑰匙",
      colName: "環境",
      colDesc: "描述",
      perPage: "（可按頁設定。）",
    },
    jumpgate: {
      heading: "跳躍門和遺產",
      points: [
        "Hexploration 計算出遊戲使用的引擎並繪製相符的形狀。可以填滿在任一編輯器中繪製的形狀。",
        "將「六角形圖層」設定為「自動」時，六角形會繪製在令牌上方的前景圖層上，因此玩家無法看到下面的內容。如果前景層不可用，則使用令牌層。",
        "Jumpgate 繪製數學上規則的六角形，其形狀與舊版六角形略有不同。如果六角形未與頁面網格對齊，請將標記捕捉到六角形中心，選擇它並按一下校準。選擇同一行（十六進位 V）或同一列（十六進位 H）的相鄰六角形中的兩個標記也可以更正六角形大小。",
        "當頁面或遊戲被複製時，其六角形會獲得新的 ID。在頁面上執行重新掃描以再次拾取它們以及它們的名稱標籤和位置標記。",
      ],
    },
    upgrading: {
      heading: "從版本 1 升級",
      points: [
        "版本 2 不再需要 PathMath、MatrixMath、Vector Math 或 HTML Builder。您可以刪除它們，除非另一個模組使用它們。",
        "現有的十六進位地圖、名稱、位置標記和設定會在首次啟動時自動升級。",
        "版本 1 指令（包括 Heexploration_menu 巨集）仍然有效。",
        "版本 1 讓任何代表字元的標記都顯示十六進位。將「顯示的令牌」設為「角色令牌」以保留該行為。",
      ],
      colV1: "版本 1 指令",
      colV2: "版本 2 指令",
    },
    troubleshooting: {
      heading: "故障排除",
      points: [
        "令牌移動時不會發生任何事情：檢查令牌是否位於令牌層上並與「顯示的令牌」匹配，頁面是否有六角形（！h探索狀態）。",
        "六角形偏離網格：使用校準，然後用地圖上幾個六角形上的標記進行檢查。",
        "複製頁面或遊戲後，十六進位停止顯示：在頁面上執行重新掃描。",
        "Fill says the area has no hex centres: the shape must contain the centre of at least one hex.",
        "For anything else, check the API console log and include its messages when asking for help.",
      ],
    },
    languages: {
      heading: "語言",
      body: "透過 !hexploration 設定語言來選擇語言。可用語言：",
    },
    credits: {
      heading: "製作人員",
      original: "原始模組由",
      maintainer: "版本 2 維護者",
      marketplace: "Roll20 Marketplace 上的 Ada 藝術包",
      support:
        "如果您發現錯誤或有想法，請在 Roll20 Mod 論壇中發佈或在 GitHub 上提出問題，並包含 API 控制台日誌中的任何訊息。",
    },
  },
};

export default TRANSLATION;
