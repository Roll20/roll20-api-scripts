const TRANSLATION = {
  titles: {
    ready: 'O Hexploration está pronto.',
    settings: 'Configurações do Hexploration',
    languages: 'Escolha um idioma',
    pageSettings: 'Configurações da página: {page}',
    status: 'Status do Hexploration: {page}',
    help: 'Comandos do Hexploration',
    confirm: 'Por favor, confirme',
  },
  discovery: {
    title: 'Local descoberto',
  },
  menu: {
    draw: 'Desenhar',
    reveal: 'Revelar e ocultar',
    locations: 'Locais',
    tools: 'Ferramentas',
    layerInUse: 'Novos hexágonos estão sendo desenhados na {layer}.',
    pageSettingsHelp:
      'Essas configurações se aplicam somente a esta página. As configurações marcadas com ★ substituem as configurações globais.',
  },
  buttons: {
    fill: 'Preencher',
    fillInverse: 'Preenchimento inverso',
    undo: 'Desfazer preenchimento',
    reveal: 'Revelar',
    conceal: 'Ocultar',
    explore: 'Explorar',
    revealPage: 'Revelar página',
    resetPage: 'Redefinir página',
    mark: 'Marcar local',
    unmark: 'Desmarcar',
    name: 'Nomear hexágono',
    settings: 'Configurações',
    pageSettings: 'Configurações da página',
    status: 'Status',
    rescan: 'Reescanear',
    calibrate: 'Calibrar',
    calibrateReset: 'Redefinir calibração',
    help: 'Ajuda',
    change: 'Alterar',
    menu: 'Menu',
    clearOverrides: 'Limpar substituições',
    confirmReset: 'Sim, remover todos os hexágonos',
  },
  prompts: {
    name: 'Nome do local (deixe em branco para limpar)',
  },
  values: {
    on: 'Ligado',
    off: 'Desligado',
    none: 'Nenhum',
    hexLayer: {
      auto: 'Automático (primeiro plano, se disponível)',
      foreground: 'camada de primeiro plano',
      objects: 'camada de tokens',
    },
    revealBy: {
      players: 'Tokens de jogador',
      characters: 'Tokens de personagem',
      all: 'Todos os tokens',
    },
    revealMode: {
      clear: 'Limpar',
      glimpse: 'Vislumbre',
    },
    announce: {
      all: 'Todos',
      gm: 'Apenas GM',
      off: 'Desligado',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Preencher',
      fillInverse: 'Preenchimento inverso',
      conceal: 'Ocultar',
    },
  },
  settings: {
    language: {
      label: 'Idioma',
      desc: 'Idioma para menus, mensagens e folhetos.',
    },
    hexLayer: {
      label: 'Camada dos hexágonos',
      desc: 'Onde novos hexágonos são desenhados. Auto tenta a camada de primeiro plano (acima dos tokens) e volta para a camada de tokens se o jogo não suportar.',
    },
    fillColor: {
      label: 'Cor de preenchimento',
      desc: 'Cor dos novos hexágonos. Use rgba() para hexágonos transparentes, por exemplo rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Cor da borda',
      desc: 'Cor do contorno dos novos hexágonos.',
    },
    labelColor: {
      label: 'Cor do rótulo',
      desc: 'Cor dos rótulos de nomes exclusivos do GM em hexágonos nomeados.',
    },
    glimpseColor: {
      label: 'Cor do vislumbre',
      desc: 'Cor que os hexágonos assumem quando vislumbrados (modo de revelação Vislumbre). Use uma cor rgba() transparente.',
    },
    strokeWidth: {
      label: 'Largura da borda',
      desc: 'Largura do contorno dos novos hexágonos, em pixels (0 a 20).',
    },
    maxDistance: {
      label: 'Distância de revelação dos hexágonos',
      desc: 'Gravada nos hexágonos quando eles são preenchidos, então defina-a antes de preencher: alterá-la depois não afeta os hexágonos que já estão no mapa. Uma ficha deve estar a no máximo este número de hexágonos para revelá-los, por mais longe que possa ver; com 0, eles só são revelados quando se entra neles. Use-a para montanhas ou florestas. Deixe em branco para não ter limite.',
    },
    revealDistance: {
      label: 'Distância de visão',
      desc: 'Quantos hexágonos ao redor de uma ficha em movimento são revelados (0 a 20). 0 revela apenas os hexágonos pelos quais o token passa.',
    },
    lineOfSight: {
      label: 'Linha de visão',
      desc: 'Quando ativado, os hexágonos que permanecem cobertos, como montanhas preenchidas com uma Distância de revelação dos hexágonos, escondem os hexágonos atrás deles. Só faz diferença com uma Distância de visão de 2 ou mais.',
    },
    revealPath: {
      label: 'Revelar ao longo do caminho',
      desc: 'Quando ativado, cada hexágono que uma ficha passa enquanto é arrastada (incluindo waypoints) é revelado, não apenas onde ela para.',
    },
    revealBy: {
      label: 'Tokens que revelam',
      desc: 'Quais fichas na camada de fichas revelam hexágonos: fichas controladas por um jogador, fichas que representam qualquer personagem ou todas as fichas.',
    },
    revealMode: {
      label: 'Modo de revelação',
      desc: 'Limpar remove os hexágonos à vista. Vislumbre os torna transparentes; eles são removidos quando um token entra neles.',
    },
    announce: {
      label: 'Anunciar descobertas',
      desc: 'Quem vê a mensagem do chat quando um local nomeado é descoberto.',
    },
    pingDiscoveries: {
      label: 'Pingar descobertas',
      desc: 'Quando ativado, os jogadores recebem um ping para um local nomeado quando ele é descoberto.',
    },
    hideCoveredTokens: {
      label: 'Ocultar tokens cobertos',
      desc: 'Roll20 desenha nomes, barras e auras acima dos hexágonos. Quando ativado, os tokens sob um hexágono coberto têm seu nome, barras e auras visíveis ao jogador desligados e ligados novamente quando são descobertos.',
    },
  },
  status: {
    engine: 'Motor de jogo',
    grid: 'Grade',
    layer: 'Camada dos hexágonos',
    hexes: 'Hexágonos',
    named: 'Hexágonos nomeados',
    icons: 'Tokens de local',
    glimpsed: 'Hexágonos vislumbrados',
    pending: 'Locais aguardando preenchimento',
    calibrated: 'Calibrado',
    overrides: 'Substituições da página',
    undo: 'Desfazer disponível',
  },
  messages: {
    filled:
      'Preenchimento completo. Hexágonos desenhados: {created}. Reestilizado: {restyled}. Locais ocultos: {icons}.',
    revealed: 'Feitiços revelados: {count}.',
    revealedPage: 'Cada hexágono da página revelado ({count}).',
    confirmReset:
      'Remover todos os hexágonos de "{page}" ({count})? Os tokens de localização voltam para a camada de tokens. Esta ação não pode ser revertida com Desfazer.',
    resetPage: 'Hexágonos removidos da página: {count}.',
    undone:
      'Último preenchimento desfeito. Hexágonos removidos: {removed}. Hexágonos reestilizados restaurados: {restored}.',
    named: 'Hexágonos chamados "{name}": {count}.',
    unnamed: 'Nomes apagados: {count}.',
    marked:
      'Locais ocultos em hexágonos existentes: {attached}. Aguardando o próximo preenchimento que os cobre: ​​{pending}.',
    unmarked: 'Tokens que não são mais locais: {count}.',
    settingChanged: '{setting} definido como {value}.',
    rescanned:
      'Nova verificação concluída. Mantido: {kept}. Adotado: {adopted}. Arquivado novamente: {moved}. Ausente e esquecido: {dropped}. Rótulos vinculados novamente: {labels}. Tokens de localização vinculados novamente: {icons}.',
    calibrated:
      'Grade calibrada (etapa de coluna {colStep}px, etapa de linha {rowStep}px). Nova varredura: mantido {kept}, arquivado novamente {moved}, adotado {adopted}.',
    calibrationReset:
      'Calibração removida. Nova varredura: mantido {kept}, arquivado novamente {moved}, adotado {adopted}.',
    journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram reconstruídos.',
    migrated:
      'Seus mapas de hexágonos do Hexploration 1.x foram atualizados. Se este jogo foi copiado de um jogo Legacy, execute Reescanear em cada página com mapa de hexágonos.',
    pruned:
      'Hexágonos salvos que não existem mais e foram esquecidos: {dropped}. Se este jogo ou página foi copiado, execute Reescanear na página para recuperar seus hexágonos.',
    readyHint:
      'Digite !hexploration para abrir o menu ou abra o folheto "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Este jogo não suporta desenho na camada de primeiro plano, então hexágonos foram desenhados na camada de token.',
    someFailed:
      'Hexágonos que não puderam ser desenhados: {count}. Verifique o console da API para obter detalhes.',
  },
  errors: {
    noPage: 'Não foi possível encontrar a página para trabalhar.',
    notHex: 'Esta página não usa uma grade hexagonal.',
    noPolygons: 'Selecione uma ou mais formas desenhadas para preencher.',
    emptyArea: 'A área selecionada não contém nenhum centro de hexágono.',
    tooMany: 'Isso criaria muitos hexágonos de uma só vez ({count}).',
    nothingToConceal: 'Selecione formas desenhadas ou fichas para ocultar.',
    nothingToReveal: 'Selecione hexágonos, formas desenhadas ou fichas para revelar.',
    noTokens: 'Selecione um ou mais tokens primeiro.',
    noHexes: 'Selecione um ou mais hexágonos (ou fichas sobre hexágonos) primeiro.',
    nothingToUndo: 'Não há preenchimento para desfazer.',
    unknownCommand: 'Comando desconhecido: {command}',
    unknownSetting: 'Configuração desconhecida: {key}',
    unknownPageSetting: 'Configurações que podem ser definidas por página: {keys}',
    invalidValue: '"{value}" não é um valor válido para {key}.',
    calibrateNeedsTokens: 'Selecione um ou dois tokens encaixados em centros de hexágonos.',
    calibrateFailed: 'Esses tokens não podem ser usados ​​para calibrar.',
    unexpected: 'Algo deu errado: {message}',
  },
  hints: {
    noPage: 'Abra a página na qual deseja trabalhar ou selecione algo nela.',
    notHex: 'Defina a grade da página como Hex (V) ou Hex (H) nas Configurações da página.',
    noPolygons:
      'Desenhe um polígono, retângulo, elipse ou forma à mão livre ao redor da área, selecione-o e tente novamente.',
    emptyArea: 'Desenhe uma forma maior ou verifique as configurações da grade da página.',
    tooMany: 'Preencha uma área menor ou divida a área em várias formas.',
    noHexes:
      'Os hexágonos estão no primeiro plano ou na camada de token; mude para essa camada para selecioná-los.',
    unknownCommand: 'Digite !hexploration help para listar os comandos.',
    unknownSetting: 'Digite !hexploration set para ver todas as configurações.',
    calibrateNeedsTokens:
      'Encaixe um token no centro de um hexágono e selecione-o. Selecione um segundo token encaixado em um hexágono vizinho na mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho do hexágono.',
    calibrateFailed:
      'Os dois tokens devem estar na mesma linha (Hex V) ou na mesma coluna (Hex H), a pelo menos um hexágono de distância.',
    unexpected: 'Os detalhes estão no log do console da API.',
  },
  help: {
    menu: 'Mostrar o menu.',
    fill: 'Cubra as formas desenhadas selecionadas com hexágonos.',
    fillInverse: 'Cubra a página inteira, exceto dentro das formas selecionadas.',
    undo: 'Desfaça o último preenchimento, inverta o preenchimento ou oculte e restaure as formas usadas.',
    reveal: 'Revele os hexágonos selecionados e os hexágonos sob as formas e fichas selecionadas.',
    revealPage: 'Revele cada hexágono da página sem anúncios.',
    conceal: 'Cubra a área sob as formas e fichas selecionadas com hexágonos novamente.',
    explore:
      'Revele ao redor dos tokens selecionados como se eles tivessem acabado de se mover para lá.',
    resetPage: 'Remova todos os hexágonos da página (pergunta antes).',
    name: 'Nomeie os hexágonos selecionados ou os hexágonos sob os tokens selecionados. Deixe o nome vazio para limpá-lo.',
    mark: 'Transforme os tokens selecionados em locais ocultos.',
    unmark: 'Impede que os tokens selecionados sejam locais ocultos.',
    set: 'Altere uma configuração ou mostre todas as configurações.',
    pageSet: 'Substituir uma configuração de revelação somente na página atual.',
    pageClear: 'Remova as substituições da página atual.',
    rescan:
      'Reconstrua a lista de hexágonos da página, por exemplo, depois de copiar uma página ou um jogo.',
    calibrate:
      'Alinhe a grade hexagonal com um ou dois tokens selecionados encaixados em centros de hexágonos.',
    calibrateReset: 'Remova a calibração da página atual.',
    status: 'Mostre o que o Hexploration sabe sobre a página atual.',
    journal: 'Reconstrua os folhetos de Ajuda e do Command Deck.',
    help: 'Mostre esta lista.',
    handout: 'As instruções completas estão no folheto "{name}".',
  },
  deck: {
    drawDesc:
      'Desenhe formas ao redor de uma área, selecione-as e preencha. Desfazer reverte o último preenchimento.',
    revealDesc:
      'Selecione hexágonos, formas ou tokens para revelá-los ou cobri-los novamente. Explorar revela ao redor dos tokens selecionados como se eles tivessem se movido.',
    locationsDesc:
      'Selecione tokens para ocultá-los como locais sob hexágonos. Selecione hexágonos ou tokens para nomear um hexágono.',
    toolsDesc:
      'Configurações, substituições de páginas, status, nova digitalização de páginas copiadas e calibração da grade.',
    footer: 'Consulte o folheto "{help}" para obter instruções completas.',
  },
  handout: {
    versionLabel: 'Versão',
    subtitle: 'Exploração hexágono a hexágono para Roll20',
    footer: 'Use o folheto "{deck}" para controles de um clique.',
    overview: {
      heading: 'Visão geral',
      body: 'O Hexploration cobre um mapa hexagonal com hexágonos opacos. À medida que o grupo se move, os hexágonos pelos quais ele passa (e, se você quiser, os hexágonos ao redor) são removidos, de modo que o mapa é descoberto um hexágono por vez. Locais ocultos podem ser colocados sob os hexágonos e são anunciados quando encontrados. Funciona em jogos Jumpgate e Legacy, em grades Hex (V) e Hex (H) de qualquer tamanho.',
      demo: 'Assista a uma breve demonstração (da versão 1)',
    },
    quickStart: {
      heading: 'Início rápido',
      steps: [
        'Abra uma página cuja grade esteja definida como Hex (V) ou Hex (H).',
        'Desenhe uma ou mais formas (polígono, retângulo, elipse ou à mão livre) ao redor da área a ser ocultada.',
        'Selecione as formas e clique em Preencher no Command Deck (ou digite !hexploration fill). As formas são substituídas por hexágonos.',
        'Opcional: antes de preencher, selecione tokens de locais importantes e clique em Marcar local. Eles ficam ocultos sob os hexágonos e são anunciados quando descobertos.',
        'Mova um token de jogador. Cada hexágono pelo qual ele passa e os hexágonos dentro da sua Distância de visão são revelados.',
      ],
    },
    commands: {
      heading: 'Comandos',
      intro:
        'Somente GMs podem usar esses comandos. A maioria atua nos objetos selecionados; o resto atua na página que você está visualizando.',
      colCommand: 'Comando',
      colDesc: 'O que isso faz',
    },
    revealing: {
      heading: 'Como funciona a revelação',
      points: [
        'Apenas tokens na camada de tokens revelam hexágonos. Quais tokens contam é definido por Tokens que revelam: tokens de jogador por padrão, para que o GM possa mover monstros sem descobrir o mapa.',
        'Um token revela cada hexágono que cobre (tokens grandes cobrem vários) e, com Revelar ao longo do caminho ativado, cada hexágono da rota pela qual foi arrastado, incluindo os pontos de passagem.',
        'A Distância de visão revela os hexágonos em torno de cada um desses hexágonos, começando pelos mais próximos. Com a Linha de visão ativada, um hexágono não é revelado enquanto houver um hexágono coberto entre ele e o token. Os hexágonos mais próximos costumam ser revelados primeiro, então em terreno aberto a Linha de visão não muda nada: ela só importa com uma Distância de visão de 2 ou mais e hexágonos que permanecem cobertos, como terreno preenchido com uma Distância de revelação dos hexágonos.',
        'A Distância de revelação dos hexágonos é gravada em cada hexágono quando ele é preenchido, então defina-a antes de preencher; alterá-la depois não afeta os hexágonos que já estão no mapa. Um token deve estar a no máximo essa quantidade de hexágonos para revelá-los, por mais longe que consiga ver, e com 0 eles só são revelados quando se entra neles. Para uma cordilheira: defina a Distância de revelação dos hexágonos como 0, preencha as montanhas, volte a deixá-la sem limite e então preencha as terras mais adiante. Com Distância de visão 3 e Linha de visão ativada, o grupo vê o terreno aberto ao seu redor, mas não as montanhas nem o que há atrás delas. Cada hexágono de montanha é revelado quando um token entra nele.',
        'No modo Vislumbre, os hexágonos à vista tornam-se transparentes em vez de desaparecer e são removidos quando um token entra neles. Os hexágonos vislumbrados não bloqueiam a Linha de visão.',
        'O Roll20 desenha nomes, barras e auras de tokens acima dos hexágonos. Com Ocultar tokens cobertos ativado, um token sob um hexágono coberto tem o nome, as barras e as auras visíveis aos jogadores desativados até ser descoberto, para que monstros escondidos não se denunciem. Se você ativar um deles enquanto o token estiver coberto, ele continua oculto e é ativado quando o token for descoberto.',
        'A API não relata movimentos feitos por outros mods. Os movimentos do TokenMod são captados automaticamente; para outros mods, selecione os tokens e clique em Explorar ou chame Hexploration.revealAround(token) do seu próprio mod.',
      ],
    },
    locations: {
      heading: 'Hexes e locais nomeados',
      points: [
        'Marcar local transforma os tokens selecionados em locais ocultos. Um token que já esteja sob um hexágono é ocultado imediatamente; caso contrário, ele será ocultado pelo próximo preenchimento que o cobrir.',
        'Os tokens com o marcador de status da torre branca também são tratados como locais quando você preenche, como na versão 1.',
        'As fichas de localização oculta são movidas para a camada GM. Quando seu hexágono é revelado, eles retornam à camada de token com seu nome mostrado e sua descoberta é anunciada.',
        'Nomear hexágono dá um nome a um hexágono sem precisar de um token. O nome é mostrado ao GM como um rótulo na camada do GM e anunciado quando o hexágono é revelado. O Jumpgate desenha a camada do GM abaixo da camada de primeiro plano, então no Jumpgate os rótulos só aparecem quando a opção Camada dos hexágonos está definida como camada de tokens.',
        'Anunciar descobertas escolhe se todos, apenas o GM ou ninguém verá o anúncio. Pingar descobertas também move a visão dos jogadores para o local.',
      ],
    },
    settings: {
      heading: 'Configurações',
      intro:
        'Altere as configurações com !hexploration set (ou com o botão Configurações). Camada dos hexágonos, Tokens que revelam e Idioma também podem ser definidos na página de configurações do Mod.',
      colKey: 'Chave',
      colName: 'Configuração',
      colDesc: 'Descrição',
      perPage: '(Pode ser definido por página.)',
    },
    jumpgate: {
      heading: 'Jumpgate e Legado',
      points: [
        'Hexploration descobre qual motor o jogo usa e desenha o tipo de forma correspondente. As formas desenhadas em qualquer editor podem ser preenchidas.',
        'Com a Camada dos hexágonos definida como Automático, os hexágonos são desenhados na camada de primeiro plano, acima dos tokens, para que os jogadores não possam ver o que está por baixo. Se a camada de primeiro plano não estiver disponível, a camada de tokens é usada no lugar.',
        'O Jumpgate desenha hexágonos matematicamente regulares, com um formato ligeiramente diferente dos hexágonos do Legacy. Se os hexágonos não se alinharem com a grade da página, encaixe um token no centro de um hexágono, selecione-o e clique em Calibrar. Selecione dois tokens em hexágonos vizinhos da mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho do hexágono.',
        'Quando uma página ou jogo é copiado, seus hexágonos recebem novos IDs. Execute Reescanear na página para recuperá-los, junto com seus rótulos de nome e tokens de local.',
      ],
    },
    upgrading: {
      heading: 'Atualizando da versão 1',
      points: [
        'A versão 2 não precisa mais de PathMath, MatrixMath, Vector Math ou HTML Builder. Você pode removê-los, a menos que outro mod os use.',
        'Os mapas de hexágonos, nomes, tokens de localização e configurações existentes são atualizados automaticamente na primeira inicialização.',
        'Os comandos da versão 1, incluindo a macro Hexploration_menu, ainda funcionam.',
        'A versão 1 permitia que qualquer token que representasse um personagem revelasse hexágonos. Defina Tokens que revelam como Tokens de personagem para manter esse comportamento.',
      ],
      colV1: 'Comando da versão 1',
      colV2: 'Comando da versão 2',
    },
    troubleshooting: {
      heading: 'Solução de problemas',
      points: [
        'Nada acontece quando um token se move: verifique se o token está na camada de tokens e corresponde a Tokens que revelam, e se a página possui hexágonos (!hexploration status).',
        'Os hexágonos são deslocados da grade: use Calibrar e verifique com um token alguns hexágonos no mapa.',
        'Os hexágonos pararam de ser revelados após copiar uma página ou jogo: execute Reescanear na página.',
        'Preencher diz que a área não tem centros de hexágonos: a forma precisa conter o centro de pelo menos um hexágono.',
        'Para qualquer outra coisa, verifique o log do console da API e inclua suas mensagens ao pedir ajuda.',
      ],
    },
    languages: {
      heading: 'Idiomas',
      body: 'Escolha um idioma com !hexploration set language. Idiomas disponíveis:',
      colLanguage: 'Linguagem',
      colNative: 'Nome original',
      colCode: 'Código',
    },
    credits: {
      heading: 'Créditos',
      original: 'Mod original por',
      maintainer: 'Versão 2 mantida por',
      marketplace: 'Pacotes de arte de Ada no Roll20 Marketplace',
      support:
        'Se você encontrar um bug ou tiver uma ideia, poste no fórum Roll20 Mod ou abra um problema no GitHub e inclua quaisquer mensagens do log do console da API.',
    },
  },
};

export default TRANSLATION;
