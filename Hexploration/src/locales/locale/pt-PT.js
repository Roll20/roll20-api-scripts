const TRANSLATION = {
  titles: {
    ready: 'O Hexploration está pronto.',
    settings: 'Definições do Hexploration',
    languages: 'Escolha um idioma',
    pageSettings: 'Definições da página: {page}',
    status: 'Estado do Hexploration: {page}',
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
    layerInUse: 'Os novos hexágonos estão a ser desenhados na {layer}.',
    pageSettingsHelp:
      'Estas definições aplicam-se somente a esta página. As definições marcadas com ★ substituem as definições globais.',
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
    settings: 'Definições',
    pageSettings: 'Definições da página',
    status: 'Estado',
    rescan: 'Reanalisar',
    calibrate: 'Calibrar',
    calibrateReset: 'Redefinir calibração',
    help: 'Ajuda',
    change: 'Alterar',
    menu: 'Menu',
    clearOverrides: 'Limpar substituições',
    confirmReset: 'Sim, remover todos os hexágonos',
  },
  prompts: {
    name: 'Nome do local (deixar em branco para limpar)',
  },
  values: {
    on: 'Ligado',
    off: 'Desligado',
    none: 'Nenhum',
    hexLayer: {
      auto: 'Automático (primeiro plano, se disponível)',
      foreground: 'camada de primeiro plano',
      objects: 'camada de fichas',
    },
    revealBy: {
      players: 'Fichas de jogador',
      characters: 'Fichas de personagem',
      all: 'Todas as fichas',
    },
    revealMode: {
      clear: 'Limpar',
      glimpse: 'Vislumbre',
    },
    announce: {
      all: 'Toda a gente',
      gm: 'Apenas o GM',
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
      desc: 'Onde são desenhados os novos hexágonos. Automático tenta a camada de primeiro plano (acima das fichas) e recorre à camada de fichas se o jogo não a suportar.',
    },
    fillColor: {
      label: 'Cor de preenchimento',
      desc: 'Cor dos novos hexágonos. Utilize rgba() para hexágonos transparentes, por exemplo rgba(0,0,0,0.8).',
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
      label: 'Cor do vislumbre',
      desc: 'Cor que os hexágonos assumem quando vislumbrados (modo de revelação Vislumbre). Utilize uma cor rgba() transparente.',
    },
    strokeWidth: {
      label: 'Largura da borda',
      desc: 'Largura do contorno dos novos hexágonos, em pixéis (0 a 20).',
    },
    maxDistance: {
      label: 'Distância de revelação dos hexágonos',
      desc: 'Guardada nos hexágonos quando são preenchidos, por isso defina-a antes de preencher: alterá-la depois não afeta os hexágonos que já estão no mapa. Uma ficha tem de estar a, no máximo, este número de hexágonos para os revelar, por mais longe que consiga ver; com 0, só são revelados quando se entra neles. Utilize-a para montanhas ou florestas. Deixe em branco para não haver limite.',
    },
    revealDistance: {
      label: 'Distância de visão',
      desc: 'Quantos hexágonos em redor de uma ficha em movimento são revelados (0 a 20). 0 revela apenas os hexágonos pelos quais o token passa.',
    },
    lineOfSight: {
      label: 'Linha de visão',
      desc: 'Quando ativado, os hexágonos que continuam cobertos, como montanhas preenchidas com uma Distância de revelação dos hexágonos, escondem os hexágonos que estão por trás deles. Só faz diferença com uma Distância de visão de 2 ou mais.',
    },
    revealPath: {
      label: 'Revelar ao longo do percurso',
      desc: 'Quando ativado, cada hexágono que uma ficha passa enquanto é arrastada (incluindo pontos de passagem) é revelado, e não apenas onde pára.',
    },
    revealBy: {
      label: 'Fichas que revelam',
      desc: 'Quais as fichas na camada de fichas que revelam hexágonos: fichas controladas por um jogador, fichas que representam qualquer personagem ou todas as fichas.',
    },
    revealMode: {
      label: 'Modo de revelação',
      desc: 'Limpar remove os hexágonos à vista. Vislumbre torna-os transparentes; são removidos quando uma ficha entra neles.',
    },
    announce: {
      label: 'Anunciar descobertas',
      desc: 'Quem vê a mensagem do chat quando um local nomeado é descoberto.',
    },
    pingDiscoveries: {
      label: 'Pingar descobertas',
      desc: 'Quando ativado, os jogadores recebem um ping para um local nomeado quando este é descoberto.',
    },
    hideCoveredTokens: {
      label: 'Ocultar fichas cobertas',
      desc: 'Roll20 desenha nomes, barras e auras por cima dos hexágonos. Quando ativado, os tokens sob um hexágono coberto têm o seu nome, barras e auras visíveis para o jogador desligados e ligados novamente quando são descobertos.',
    },
  },
  status: {
    engine: 'Motor de jogo',
    grid: 'Grelha',
    layer: 'Camada dos hexágonos',
    hexes: 'Hexágonos',
    named: 'Hexágonos nomeados',
    icons: 'Fichas de local',
    glimpsed: 'Hexágonos vislumbrados',
    pending: 'Locais a aguardar preenchimento',
    calibrated: 'Calibrado',
    overrides: 'Substituições da página',
    undo: 'Desfazer disponível',
  },
  messages: {
    filled:
      'Preenchimento completo. Hexágonos desenhados: {created}. Reestilizado: {restyled}. Locais escondidos: {icons}.',
    revealed: 'Feitiços revelados: {count}.',
    revealedPage: 'Cada hexágono da página revelado ({count}).',
    confirmReset:
      'Remover todos os hexágonos de "{page}" ({count})? As fichas de localização regressam à camada de fichas. Esta ação não pode ser revertida com Desfazer.',
    resetPage: 'Hexágonos removidos da página: {count}.',
    undone:
      'Último preenchimento desfeito. Hexágonos removidos: {removed}. Hexágonos reestilizados restaurados: {restored}.',
    named: 'Hexágonos denominados "{name}": {count}.',
    unnamed: 'Nomes apagados: {count}.',
    marked:
      'Locais escondidos em hexágonos existentes: {attached}. Aguardam o próximo enchimento que os cobre: ​​​​{pending}.',
    unmarked: 'Tokens que já não são locais: {count}.',
    settingChanged: '{setting} definido como {value}.',
    rescanned:
      'Nova verificação concluída. Mantido: {kept}. Adoptado: {adopted}. Arquivado novamente: {moved}. Ausente e esquecido: {dropped}. Rótulos novamente ligados: {labels}. Tokens de localização novamente ligados: {icons}.',
    calibrated:
      'Grelha calibrada (etapa de coluna {colStep}px, etapa de linha {rowStep}px). Nova análise: mantido {kept}, arquivado novamente {moved}, adotado {adopted}.',
    calibrationReset:
      'Calibração removida. Nova análise: mantido {kept}, arquivado novamente {moved}, adotado {adopted}.',
    journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram reconstruídos.',
    migrated:
      'Os seus mapas de hexágonos do Hexploration 1.x foram atualizados. Se este jogo foi copiado de um jogo Legacy, execute Reanalisar em cada página com mapa de hexágonos.',
    pruned:
      'Hexágonos guardados que já não existem e foram esquecidos: {dropped}. Se este jogo ou página tiver sido copiado, execute Reanalisar na página para recuperar os seus hexágonos.',
    readyHint:
      'Escreva !hexploration para abrir o menu ou abra o folheto "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Este jogo não suporta o desenho na camada de primeiro plano, pelo que foram desenhados hexágonos na camada de tokens.',
    someFailed:
      'Hexágonos que não puderam ser desenhados: {count}. Verifique a consola da API para obter detalhes.',
  },
  errors: {
    noPage: 'Não foi possível encontrar a página para trabalhar.',
    notHex: 'Esta página não utiliza uma grelha hexagonal.',
    noPolygons: 'Selecione uma ou mais formas desenhadas para preencher.',
    emptyArea: 'A área selecionada não contém nenhum centro de hexágono.',
    tooMany: 'Isto criaria muitos hexágonos de uma só vez ({count}).',
    nothingToConceal: 'Selecione formas desenhadas ou fichas para ocultar.',
    nothingToReveal: 'Selecione hexágonos, formas desenhadas ou fichas para revelar.',
    noTokens: 'Selecione primeiro um ou mais tokens.',
    noHexes: 'Selecione primeiro um ou mais hexágonos (ou fichas sobre hexágonos).',
    nothingToUndo: 'Não há enchimento para desfazer.',
    unknownCommand: 'Comando desconhecido: {command}',
    unknownSetting: 'Configuração desconhecida: {key}',
    unknownPageSetting: 'Configurações que podem ser definidas por página: {keys}',
    invalidValue: '"{value}" não é um valor válido para {key}.',
    calibrateNeedsTokens: 'Selecione uma ou duas fichas encaixadas em centros de hexágonos.',
    calibrateFailed: 'Estes tokens não podem ser utilizados para calibrar.',
    unexpected: 'Algo correu mal: {message}',
  },
  hints: {
    noPage: 'Abra a página na qual pretende trabalhar ou selecione algo da mesma.',
    notHex: 'Defina a grelha da página para Hex (V) ou Hex (H) nas Definições da página.',
    noPolygons:
      'Desenhe um polígono, retângulo, elipse ou forma à mão livre à volta da área, selecione-o e tente novamente.',
    emptyArea: 'Desenhe uma forma maior ou verifique as definições da grelha da página.',
    tooMany: 'Preencha uma área mais pequena ou divida a área em várias formas.',
    noHexes:
      'Os hexágonos estão no primeiro plano ou na camada de tokens; mude para essa camada para os selecionar.',
    unknownCommand: 'Introduza !hexploration help para listar os comandos.',
    unknownSetting: 'Digite !hexploration set para ver todas as definições.',
    calibrateNeedsTokens:
      'Encaixe uma ficha no centro de um hexágono e selecione-a. Selecione uma segunda ficha encaixada num hexágono vizinho na mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho do hexágono.',
    calibrateFailed:
      'As duas fichas têm de estar na mesma linha (Hex V) ou na mesma coluna (Hex H), a pelo menos um hexágono de distância.',
    unexpected: 'Os detalhes estão no log da consola da API.',
  },
  help: {
    menu: 'Mostre o menu.',
    fill: 'Cubra as formas desenhadas selecionadas com hexágonos.',
    fillInverse: 'Cubra a página inteira, exceto dentro das formas selecionadas.',
    undo: 'Desfaça o último enchimento, inverta o enchimento ou ocultar e restaure as formas utilizadas.',
    reveal: 'Revele os hexágonos selecionados e os hexágonos sob as formas e fichas selecionadas.',
    revealPage: 'Revele cada hexágono da página sem anúncios.',
    conceal: 'Cubra a área sob as formas e fichas selecionadas com hexágonos novamente.',
    explore: 'Revele à volta das fichas selecionadas como se tivessem acabado de se mover para lá.',
    resetPage: 'Remova todos os hexágonos da página (pergunta primeiro).',
    name: 'Nomeie os hexágonos selecionados ou os hexágonos sob os tokens selecionados. Deixe o nome vazio para o limpar.',
    mark: 'Transforme os tokens selecionados em locais ocultos.',
    unmark: 'Impede que os tokens selecionados sejam locais ocultos.',
    set: 'Altere uma definição ou mostre todas as definições.',
    pageSet: 'Substituir uma configuração de revelação apenas na página atual.',
    pageClear: 'Remova as substituições da página atual.',
    rescan:
      'Reconstrua a lista de hexágonos da página, por exemplo, depois de copiar uma página ou um jogo.',
    calibrate:
      'Alinhe a grelha hexagonal com uma ou duas fichas selecionadas encaixadas em centros de hexágonos.',
    calibrateReset: 'Remova a calibração da página atual.',
    status: 'Mostre o que o Hexploration sabe sobre a página atual.',
    journal: 'Reconstrua os folhetos de Ajuda e do Command Deck.',
    help: 'Mostre esta lista.',
    handout: 'As instruções completas estão no folheto "{name}".',
  },
  deck: {
    drawDesc:
      'Desenhe formas à volta de uma área, selecione-as e preencha. Desfazer reverte o último preenchimento.',
    revealDesc:
      'Selecione hexágonos, formas ou fichas para os revelar ou voltar a cobrir. Explorar revela à volta das fichas selecionadas como se se tivessem movido.',
    locationsDesc:
      'Selecione fichas para as ocultar como locais sob hexágonos. Selecione hexágonos ou fichas para nomear um hexágono.',
    toolsDesc:
      'Definições, substituições de páginas, estado, nova digitalização de páginas copiadas e calibração da grelha.',
    footer: 'Consulte o folheto "{help}" para obter as instruções completas.',
  },
  handout: {
    versionLabel: 'Versão',
    subtitle: 'Exploração hexágono a hexágono para Roll20',
    footer: 'Utilize o folheto "{deck}" para controlos de um clique.',
    overview: {
      heading: 'Visão geral',
      body: 'O Hexploration cobre um mapa hexagonal com hexágonos opacos. À medida que o grupo se desloca, os hexágonos por onde passa (e, se quiser, os hexágonos à sua volta) são removidos, pelo que o mapa é descoberto um hexágono de cada vez. Podem ser colocados locais escondidos sob os hexágonos, que são anunciados quando encontrados. Funciona em jogos Jumpgate e Legacy, em grelhas Hex (V) e Hex (H) de qualquer tamanho.',
      demo: 'Assista a uma breve demonstração (da versão 1)',
    },
    quickStart: {
      heading: 'Início rápido',
      steps: [
        'Abra uma página cuja grelha esteja definida para Hex (V) ou Hex (H).',
        'Desenhe uma ou mais formas (polígono, retângulo, elipse ou à mão livre) à volta da área a ocultar.',
        'Selecione as formas e clique em Preencher no Command Deck (ou escreva !hexploration fill). As formas são substituídas por hexágonos.',
        'Opcional: antes de preencher, selecione fichas de locais importantes e clique em Marcar local. Ficam escondidas sob os hexágonos e são anunciadas quando descobertas.',
        'Mova uma ficha de jogador. Cada hexágono por onde passa e os hexágonos dentro da sua Distância de visão são revelados.',
      ],
    },
    commands: {
      heading: 'Comandos',
      intro:
        'Apenas os GMs podem usar estes comandos. A maioria atua sobre os objetos selecionados; o resto atua na página que está a visualizar.',
      colCommand: 'Comando',
      colDesc: 'O que faz',
    },
    revealing: {
      heading: 'Como funciona a revelação',
      points: [
        'Apenas as fichas na camada de fichas revelam hexágonos. Quais as fichas que contam é definido por Fichas que revelam: fichas de jogador por predefinição, para que o GM possa mover monstros sem descobrir o mapa.',
        'Uma ficha revela cada hexágono que cobre (as fichas grandes cobrem vários) e, com Revelar ao longo do percurso ativado, cada hexágono do percurso pelo qual foi arrastada, incluindo os pontos de passagem.',
        'A Distância de visão revela os hexágonos em torno de cada um destes hexágonos, começando pelos mais próximos. Com a Linha de visão ativada, um hexágono não é revelado enquanto existir um hexágono coberto entre ele e a ficha. Os hexágonos mais próximos são normalmente revelados primeiro, por isso em terreno aberto a Linha de visão não altera nada: só tem importância com uma Distância de visão de 2 ou mais e hexágonos que continuam cobertos, como terreno preenchido com uma Distância de revelação dos hexágonos.',
        'A Distância de revelação dos hexágonos é guardada em cada hexágono quando este é preenchido, por isso defina-a antes de preencher; alterá-la depois não afeta os hexágonos que já estão no mapa. Uma ficha tem de estar a, no máximo, esse número de hexágonos para os revelar, por mais longe que consiga ver, e com 0 só são revelados quando se entra neles. Para uma cordilheira: defina a Distância de revelação dos hexágonos como 0, preencha as montanhas, volte a deixá-la sem limite e depois preencha as terras mais além. Com Distância de visão 3 e Linha de visão ativada, o grupo vê o terreno aberto à sua volta, mas não as montanhas nem o que está por trás delas. Cada hexágono de montanha é revelado quando uma ficha entra nele.',
        'No modo Vislumbre, os hexágonos à vista tornam-se transparentes em vez de desaparecerem e são removidos quando uma ficha entra neles. Os hexágonos vislumbrados não bloqueiam a Linha de visão.',
        'O Roll20 desenha os nomes, barras e auras das fichas por cima dos hexágonos. Com Ocultar fichas cobertas ativado, uma ficha sob um hexágono coberto tem o nome, as barras e as auras visíveis para os jogadores desativados até ser descoberta, para que os monstros escondidos não se denunciem. Se ativar um deles enquanto a ficha estiver coberta, este continua oculto e é ativado quando a ficha for descoberta.',
        'A API não reporta movimentos feitos por outros mods. Os movimentos do TokenMod são captados automaticamente; para outros mods, selecione as fichas e clique em Explorar, ou chame Hexploration.revealAround(token) a partir do seu próprio mod.',
      ],
    },
    locations: {
      heading: 'Hexes e locais nomeados',
      points: [
        'Marcar local transforma as fichas selecionadas em locais escondidos. Uma ficha que já esteja sob um hexágono é ocultada imediatamente; caso contrário, ficará oculta pelo próximo preenchimento que a cobrir.',
        'Os tokens com o marcador de estado da torre branca também são tratados como locais quando preenche, como na versão 1.',
        'As fichas de localização oculta são movidas para a camada GM. Quando o seu hexágono é revelado, regressam à camada de token com o seu nome mostrado e a sua descoberta é anunciada.',
        'Nomear hexágono dá um nome a um hexágono sem precisar de uma ficha. O nome é mostrado ao GM como uma etiqueta na camada do GM e anunciado quando o hexágono é revelado.',
        'Anunciar descobertas escolhe se todos, apenas o GM ou ninguém vê o anúncio. Pingar descobertas também move a vista dos jogadores para o local.',
      ],
    },
    settings: {
      heading: 'Configurações',
      intro:
        'Altere as definições com !hexploration set (ou com o botão Definições). Camada dos hexágonos, Fichas que revelam e Idioma também podem ser definidos na página de definições do Mod.',
      colKey: 'Chave',
      colName: 'Definição',
      colDesc: 'Descrição',
      perPage: '(Pode ser definido por página.)',
    },
    jumpgate: {
      heading: 'Jumpgate e Legado',
      points: [
        'Hexploration descobre qual o motor que o jogo utiliza e desenha o tipo de forma correspondente. As formas desenhadas em qualquer editor podem ser preenchidas.',
        'Com a Camada dos hexágonos definida como Automático, os hexágonos são desenhados na camada de primeiro plano, por cima das fichas, para que os jogadores não consigam ver o que está por baixo. Se a camada de primeiro plano não estiver disponível, é utilizada a camada de fichas.',
        'O Jumpgate desenha hexágonos matematicamente regulares, com uma forma ligeiramente diferente dos hexágonos do Legacy. Se os hexágonos não ficarem alinhados com a grelha da página, encaixe uma ficha no centro de um hexágono, selecione-a e clique em Calibrar. Selecione duas fichas em hexágonos vizinhos da mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho do hexágono.',
        'Quando uma página ou jogo é copiado, os seus hexágonos recebem novos IDs. Execute Reanalisar na página para os voltar a apanhar, juntamente com as suas etiquetas de nome e fichas de local.',
      ],
    },
    upgrading: {
      heading: 'Atualização da versão 1',
      points: [
        'A versão 2 já não precisa de PathMath, MatrixMath, Vector Math ou HTML Builder. Pode removê-los, a menos que outro mod os utilize.',
        'Os mapas de hexágonos, nomes, fichas de localização e definições existentes são atualizados automaticamente no primeiro arranque.',
        'Os comandos da versão 1, incluindo a macro Hexploration_menu, ainda funcionam.',
        'A versão 1 permitia que qualquer ficha que representasse uma personagem revelasse hexágonos. Defina Fichas que revelam como Fichas de personagem para manter este comportamento.',
      ],
      colV1: 'Comando da versão 1',
      colV2: 'Comando da versão 2',
    },
    troubleshooting: {
      heading: 'Solução de problemas',
      points: [
        'Nada acontece quando uma ficha se move: verifique se a ficha está na camada de fichas e corresponde a Fichas que revelam, e se a página tem hexágonos (!hexploration status).',
        'Os hexágonos estão desalinhados com a grelha: use Calibrar e verifique depois com uma ficha em alguns hexágonos do mapa.',
        'Os hexágonos deixaram de ser revelados após copiar uma página ou jogo: execute Reanalisar na página.',
        'Preencher indica que a área não tem centros de hexágonos: a forma tem de conter o centro de pelo menos um hexágono.',
        'Para qualquer outra coisa, verifique o registo da consola da API e inclua as suas mensagens ao pedir ajuda.',
      ],
    },
    languages: {
      heading: 'Idiomas',
      body: 'Escolha um idioma com !hexploration set language. Idiomas disponíveis:',
      colLanguage: 'Idioma',
      colNative: 'Nome original',
      colCode: 'Código',
    },
    credits: {
      heading: 'Créditos',
      original: 'Mod original de',
      maintainer: 'Versão 2 mantida pela',
      marketplace: 'Pacotes de arte de Ada no Roll20 Marketplace',
      support:
        'Se encontrar um bug ou tiver uma ideia, publique no fórum Roll20 Mod ou abra um problema no GitHub e inclua quaisquer mensagens do registo da consola da API.',
    },
  },
};

export default TRANSLATION;
