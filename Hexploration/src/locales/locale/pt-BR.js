const TRANSLATION = {
  titles: {
    ready: 'A Hexploração está pronta.',
    settings: 'Configurações de exploração',
    languages: 'Escolha um idioma',
    pageSettings: 'Configurações da página: {page}',
    status: 'Status de exploração: {page}',
    help: 'Comandos de Hexploração',
    confirm: 'Por favor confirme',
  },
  discovery: {
    title: 'Localização descoberta',
  },
  menu: {
    draw: 'Empate',
    reveal: 'Revelar e ocultar',
    locations: 'Locais',
    tools: 'Ferramentas',
    layerInUse: 'Novos hexágonos estão sendo desenhados em {layer}.',
    pageSettingsHelp:
      'Essas configurações se aplicam somente a esta página. As configurações marcadas com ★ substituem as configurações globais.',
  },
  buttons: {
    fill: 'Preencher',
    fillInverse: 'Preenchimento Inverso',
    undo: 'Desfazer preenchimento',
    reveal: 'Revelar',
    conceal: 'Esconder',
    explore: 'Explorar',
    revealPage: 'Revelar página',
    resetPage: 'Redefinir página',
    mark: 'Marcar localização',
    unmark: 'Desmarcar',
    name: 'Nome hexadecimal',
    settings: 'Configurações',
    pageSettings: 'Configurações de página',
    status: 'Status',
    rescan: 'Digitalizar novamente',
    calibrate: 'Calibrar',
    calibrateReset: 'Redefinir calibração',
    help: 'Ajuda',
    change: 'Mudar',
    menu: 'Menu',
    clearOverrides: 'Limpar substituições',
    confirmReset: 'Sim, remover todos os hexágonos',
  },
  prompts: {
    name: 'Nome do local (deixe em branco para limpar)',
  },
  values: {
    on: 'Sobre',
    off: 'Desligado',
    none: 'Nenhum',
    hexLayer: {
      auto: 'Automático (primeiro plano, se disponível)',
      foreground: 'camada de primeiro plano',
      objects: 'camada de token',
    },
    revealBy: {
      players: 'Tokens de jogador',
      characters: 'Fichas de personagem',
      all: 'Todos os tokens',
    },
    revealMode: {
      clear: 'Claro',
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
      fillInverse: 'Preenchimento Inverso',
      conceal: 'Esconder',
    },
  },
  settings: {
    language: {
      label: 'Linguagem',
      desc: 'Idioma para menus, mensagens e folhetos.',
    },
    hexLayer: {
      label: 'Camada hexadecimal',
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
      label: 'Cor da etiqueta',
      desc: 'Cor dos rótulos de nomes exclusivos do GM em hexágonos nomeados.',
    },
    glimpseColor: {
      label: 'Vislumbre de cor',
      desc: 'Os hexágonos coloridos mudam para quando vislumbrados (modo de revelação de vislumbre). Use uma cor rgba() transparente.',
    },
    strokeWidth: {
      label: 'Largura da borda',
      desc: 'Largura do contorno dos novos hexágonos, em pixels (0 a 20).',
    },
    maxDistance: {
      label: 'Distância de revelação hexadecimal',
      desc: 'Aplicado aos hexágonos à medida que são desenhados: uma ficha deve estar dentro deste número de hexágonos para revelá-los, por mais longe que possa ver. Deixe em branco sem limite.',
    },
    revealDistance: {
      label: 'Distância de visão',
      desc: 'Quantos hexágonos ao redor de uma ficha em movimento são revelados (0 a 20). 0 revela apenas os hexágonos pelos quais o token passa.',
    },
    lineOfSight: {
      label: 'Linha de visão',
      desc: 'Quando ativado, um hexágono só é revelado se nenhum hexágono coberto estiver entre ele e a ficha.',
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
      desc: 'Limpar remove hexágonos à vista. O vislumbre os torna transparentes; eles são removidos quando um token entra neles.',
    },
    announce: {
      label: 'Anuncie descobertas',
      desc: 'Quem vê a mensagem do chat quando um local nomeado é descoberto.',
    },
    pingDiscoveries: {
      label: 'Descobertas de ping',
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
    layer: 'Camada hexadecimal',
    hexes: 'Feitiços',
    named: 'Hexágonos nomeados',
    icons: 'Tokens de localização',
    glimpsed: 'Feitiços vislumbrados',
    pending: 'Locais aguardando preenchimento',
    calibrated: 'Calibrado',
    overrides: 'Substituições de página',
    undo: 'Desfazer disponível',
  },
  messages: {
    filled:
      'Preenchimento completo. Hexágonos desenhados: {created}. Reestilizado: {restyled}. Locais ocultos: {icons}.',
    revealed: 'Feitiços revelados: {count}.',
    revealedPage: 'Cada hexágono da página revelado ({count}).',
    confirmReset:
      'Remover todos os hexadecimais de "{page}" ({count})? Os tokens de localização retornam para a camada de tokens. Desfazer não pode reverter isso.',
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
      'Seus mapas hexadecimais do Hexploration 1.x foram atualizados. Se este jogo foi copiado de um jogo Legacy, execute Rescan em cada página do mapa hexadecimal.',
    pruned:
      'Hexágonos salvos que não existem mais e foram esquecidos: {dropped}. Se este jogo ou página foi copiado, execute uma nova varredura na página para recuperar seus hexágonos novamente.',
    readyHint: 'Digite !hexploration no menu ou abra o folheto "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Este jogo não suporta desenho na camada de primeiro plano, então hexágonos foram desenhados na camada de token.',
    someFailed:
      'Hexágonos que não puderam ser desenhados: {count}. Verifique o console da API para obter detalhes.',
  },
  errors: {
    noPage: 'Não foi possível encontrar a página para trabalhar.',
    notHex: 'Esta página não usa uma grade hexadecimal.',
    noPolygons: 'Selecione uma ou mais formas desenhadas para preencher.',
    emptyArea: 'A área selecionada não contém centros hexadecimais.',
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
    calibrateNeedsTokens: 'Selecione um ou dois tokens encaixados nos centros hexadecimais.',
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
      'Encaixe um token no centro de um hexágono e selecione-o. Selecione um segundo token ajustado a um hexadecimal vizinho na mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho hexadecimal.',
    calibrateFailed:
      'Dois tokens devem estar na mesma linha (Hex V) ou na mesma coluna (Hex H), separados por pelo menos um hexadecimal.',
    unexpected: 'Os detalhes estão no log do console da API.',
  },
  help: {
    menu: 'Mostre o cardápio.',
    fill: 'Cubra as formas desenhadas selecionadas com hexágonos.',
    fillInverse: 'Cubra a página inteira, exceto dentro das formas selecionadas.',
    undo: 'Desfaça o último preenchimento, inverta o preenchimento ou oculte e restaure as formas usadas.',
    reveal: 'Revele os hexágonos selecionados e os hexágonos sob as formas e fichas selecionadas.',
    revealPage: 'Revele cada hexágono da página sem anúncios.',
    conceal: 'Cubra a área sob as formas e fichas selecionadas com hexágonos novamente.',
    explore: 'Revele os tokens selecionados como se eles tivessem acabado de se mudar para lá.',
    resetPage: 'Remova todos os hexadecimais da página (pergunta primeiro).',
    name: 'Nomeie os hexágonos selecionados ou os hexágonos sob os tokens selecionados. Deixe o nome vazio para limpá-lo.',
    mark: 'Transforme os tokens selecionados em locais ocultos.',
    unmark: 'Impede que os tokens selecionados sejam locais ocultos.',
    set: 'Altere uma configuração ou mostre todas as configurações.',
    pageSet: 'Substituir uma configuração de revelação somente na página atual.',
    pageClear: 'Remova as substituições da página atual.',
    rescan:
      'Reconstrua a lista hexadecimal da página, por exemplo, após copiar uma página ou jogo.',
    calibrate:
      'Alinhe a grade hexadecimal com um ou dois tokens selecionados encaixados nos centros hexadecimais.',
    calibrateReset: 'Remova a calibração da página atual.',
    status: 'Mostre o que o Hexploration sabe sobre a página atual.',
    journal: 'Reconstrua os folhetos da Ajuda e da Plataforma de Comando.',
    help: 'Mostre esta lista.',
    handout: 'As instruções completas estão no folheto "{name}".',
  },
  deck: {
    subtitle: 'Convés de Comando',
    drawDesc:
      'Desenhe formas ao redor de uma área, selecione-as e preencha. Desfazer reverte o último preenchimento.',
    revealDesc:
      'Selecione hexágonos, formas ou fichas para revelá-los ou cobri-los novamente. Explore as revelações em torno dos tokens selecionados como se eles tivessem se movido.',
    locationsDesc:
      'Selecione fichas para ocultá-las como locais sob hexágonos. Selecione hexágonos ou tokens para nomear um hexágono.',
    toolsDesc:
      'Configurações, substituições de páginas, status, nova digitalização de páginas copiadas e calibração da grade.',
    footer: 'Consulte o folheto "{help}" para obter instruções completas.',
  },
  handout: {
    versionLabel: 'Versão',
    subtitle: 'Exploração hexadecimal para Roll20',
    footer: 'Use o folheto "{deck}" para controles de um clique.',
    overview: {
      heading: 'Visão geral',
      body: 'Hexploração cobre um mapa hexadecimal com hexágonos opacos. À medida que o grupo se move, os hexágonos pelos quais eles passam (e, se preferir, os hexágonos ao seu redor) são removidos, então o mapa é descoberto um hexágono de cada vez. Locais ocultos podem ser colocados em hexágonos e são anunciados quando encontrados. Funciona em jogos Jumpgate e Legacy, em grades Hex (V) e Hex (H) de qualquer tamanho.',
      demo: 'Assista a uma breve demonstração (da versão 1)',
    },
    quickStart: {
      heading: 'Início rápido',
      steps: [
        'Abra uma página cuja grade esteja definida como Hex (V) ou Hex (H).',
        'Desenhe uma ou mais formas (polígono, retângulo, elipse ou à mão livre) ao redor da área a ser ocultada.',
        'Selecione as formas e clique em Preencher no painel de comandos (ou digite !hexploration fill). As formas são substituídas por hexágonos.',
        'Opcional: antes de preencher, selecione tokens de locais importantes e clique em Marcar Localização. Eles estão escondidos sob os hexágonos e anunciados quando descobertos.',
        'Mova uma ficha de jogador. Cada hexágono que ele passa e os hexágonos dentro de sua Distância de Visão são revelados.',
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
        'Apenas os tokens na camada de tokens revelam hexágonos. A contagem de fichas é definida por Tokens That Reveal: fichas de jogador por padrão, para que o Mestre possa mover monstros sem descobrir o mapa.',
        'Uma ficha revela cada hexágono que cobre (fichas grandes cobrem vários) e, com Revelar ao longo do caminho ativado, cada hexágono na rota pela qual foi arrastado, incluindo pontos de referência.',
        'A Distância de Visão revela os hexágonos em torno de cada um desses hexágonos. Com a Linha de Visão ativada, um hexágono só é revelado se não houver nenhum hexágono coberto entre eles.',
        'A distância de revelação hexadecimal é armazenada em hexadecimais à medida que são desenhados. Esses hexágonos só são revelados dentro daquele número de hexágonos, não importa quão longe uma ficha possa ver. Use-o para montanhas ou florestas que escondem o que está por trás delas.',
        'No modo Glimpse, os hexágonos à vista tornam-se transparentes em vez de desaparecer e são removidos quando uma ficha entra neles.',
        'The API does not report moves made by other mods. TokenMod moves are picked up automatically; for other mods, select the tokens and click Explore, or call Hexploration.revealAround(token) from your own mod.',
        'A API não relata movimentos feitos por outros mods. Os movimentos do TokenMod são captados automaticamente; para outros mods, selecione os tokens e clique em Explorar ou chame Hexploration.revealAround(token) do seu próprio mod.',
      ],
    },
    locations: {
      heading: 'Hexes e locais nomeados',
      points: [
        'Mark Location transforma os tokens selecionados em locais ocultos. Uma ficha que já esteja sob um hexágono é ocultada imediatamente; caso contrário, ele ficará oculto pelo próximo preenchimento que o cobre.',
        'Os tokens com o marcador de status da torre branca também são tratados como locais quando você preenche, como na versão 1.',
        'As fichas de localização oculta são movidas para a camada GM. Quando seu hexágono é revelado, eles retornam à camada de token com seu nome mostrado e sua descoberta é anunciada.',
        'Name Hex dá um nome hexadecimal sem um token. O nome é mostrado ao GM como um rótulo na camada do GM e anunciado quando o hexágono é revelado.',
        'Anunciar Descobertas escolhe se todos, apenas o GM, ou ninguém verá o anúncio. Ping Discoveries também move a visão dos jogadores para o local.',
      ],
    },
    settings: {
      heading: 'Configurações',
      intro:
        'Altere as configurações com !hexploration set (ou o botão Configurações). Camada hexadecimal, tokens que revelam e idioma também podem ser definidos na página de configurações do Mod.',
      colKey: 'Chave',
      colName: 'Contexto',
      colDesc: 'Descrição',
      perPage: '(Pode ser definido por página.)',
    },
    jumpgate: {
      heading: 'Jumpgate e Legado',
      points: [
        'Hexploration descobre qual motor o jogo usa e desenha o tipo de forma correspondente. As formas desenhadas em qualquer editor podem ser preenchidas.',
        'Com a camada hexadecimal definida como Automático, os hexágonos são desenhados na camada de primeiro plano, acima dos tokens, para que os jogadores não possam ver o que está por baixo. Se a camada de primeiro plano não estiver disponível, a camada de token será usada.',
        'Jumpgate desenha hexágonos matematicamente regulares, que têm uma forma ligeiramente diferente dos hexágonos Legacy. Se os hexágonos não estiverem alinhados com a grade da página, encaixe um token em um centro hexadecimal, selecione-o e clique em Calibrar. Selecione dois tokens em hexágonos vizinhos da mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho hexadecimal.',
        'Quando uma página ou jogo é copiado, seus hexágonos recebem novos IDs. Execute Rescan na página para pegá-los novamente, junto com seus rótulos de nome e tokens de localização.',
      ],
    },
    upgrading: {
      heading: 'Atualizando da versão 1',
      points: [
        'A versão 2 não precisa mais de PathMath, MatrixMath, Vector Math ou HTML Builder. Você pode removê-los, a menos que outro mod os use.',
        'Mapas hexadecimais, nomes, tokens de localização e configurações existentes são atualizados automaticamente na primeira inicialização.',
        'Os comandos da versão 1, incluindo a macro Hexploration_menu, ainda funcionam.',
        'A versão 1 permitiu que qualquer token que representasse um personagem revelasse hexágonos. Defina Tokens que Revelam como tokens de Personagem para manter esse comportamento.',
      ],
      colV1: 'Comando da versão 1',
      colV2: 'Comando da versão 2',
    },
    troubleshooting: {
      heading: 'Solução de problemas',
      points: [
        'Nada acontece quando um token se move: verifique se o token está na camada de token e corresponde aos Tokens That Reveal e se a página possui hexágonos (status !hexploration).',
        'Os hexágonos são deslocados da grade: use Calibrar e verifique com um token alguns hexágonos no mapa.',
        'Os hexágonos pararam de ser revelados após copiar uma página ou jogo: execute uma nova varredura na página.',
        'Fill diz que a área não tem centros hexadecimais: a forma deve conter o centro de pelo menos um hexadecimal.',
        'Para qualquer outra coisa, verifique o log do console da API e inclua suas mensagens ao pedir ajuda.',
      ],
    },
    languages: {
      heading: 'Idiomas',
      body: 'Escolha um idioma com !hexploration set language. Idiomas disponíveis:',
      colLanguage: 'Linguagem',
      colNative: 'Nome nativo',
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
