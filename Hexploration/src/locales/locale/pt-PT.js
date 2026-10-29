const TRANSLATION = {
  titles: {
    ready: 'A Hexploração está pronta.',
    settings: 'Configurações de exploração',
    languages: 'Escolha um idioma',
    pageSettings: 'Definições da página: {page}',
    status: 'Estado de exploração: {page}',
    help: 'Comandos de Hexploração',
    confirm: 'Por favor confirme',
  },
  discovery: {
    title: 'Localização descoberta',
  },
  menu: {
    draw: 'Desenhar',
    reveal: 'Revelar e ocultar',
    locations: 'Locais',
    tools: 'Ferramentas',
    layerInUse: 'Novos hexágonos estão a ser desenhados em {layer}.',
    pageSettingsHelp:
      'Estas definições aplicam-se somente a esta página. As definições marcadas com ★ substituem as definições globais.',
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
    status: 'Estatuto',
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
    name: 'Nome do local (deixar em branco para limpar)',
  },
  values: {
    on: 'Em',
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
      glimpse: 'Relance',
    },
    announce: {
      all: 'Toda a gente',
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
      label: 'Idioma',
      desc: 'Idioma para menus, mensagens e folhetos.',
    },
    hexLayer: {
      label: 'Camada hexadecimal',
      desc: 'Onde são desenhados novos hexágonos. O Auto tenta a camada de primeiro plano (acima dos tokens) e volta à camada de tokens se o jogo não o suportar.',
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
      label: 'Vislumbre de cor',
      desc: 'Os hexágonos coloridos mudam para quando vislumbrados (modo de revelação de vislumbre). Utilize uma cor rgba() transparente.',
    },
    strokeWidth: {
      label: 'Largura da borda',
      desc: 'Largura do contorno dos novos hexágonos, em pixéis (0 a 20).',
    },
    maxDistance: {
      label: 'Distância de revelação hexadecimal',
      desc: 'Aplicado aos hexágonos à medida que são desenhados: uma ficha deve estar dentro deste número de hexágonos para os revelar, por mais longe que possa ver. Deixe em branco sem limite.',
    },
    revealDistance: {
      label: 'Distância de visão',
      desc: 'Quantos hexágonos em redor de uma ficha em movimento são revelados (0 a 20). 0 revela apenas os hexágonos pelos quais o token passa.',
    },
    lineOfSight: {
      label: 'Linha de visão',
      desc: 'Quando ativado, um hexágono só é revelado se nenhum hexágono coberto estiver entre ele e a ficha.',
    },
    revealPath: {
      label: 'Revelar ao longo do percurso',
      desc: 'Quando ativado, cada hexágono que uma ficha passa enquanto é arrastada (incluindo pontos de passagem) é revelado, e não apenas onde pára.',
    },
    revealBy: {
      label: 'Tokens que revelam',
      desc: 'Quais as fichas na camada de fichas que revelam hexágonos: fichas controladas por um jogador, fichas que representam qualquer personagem ou todas as fichas.',
    },
    revealMode: {
      label: 'Modo de revelação',
      desc: 'Limpar remove os hexágonos à vista. O vislumbre torna-os transparentes; são removidos quando um token entra neles.',
    },
    announce: {
      label: 'Anuncie descobertas',
      desc: 'Quem vê a mensagem do chat quando um local nomeado é descoberto.',
    },
    pingDiscoveries: {
      label: 'Descobertas de ping',
      desc: 'Quando ativado, os jogadores recebem um ping para um local nomeado quando este é descoberto.',
    },
    hideCoveredTokens: {
      label: 'Ocultar tokens cobertos',
      desc: 'Roll20 desenha nomes, barras e auras por cima dos hexágonos. Quando ativado, os tokens sob um hexágono coberto têm o seu nome, barras e auras visíveis para o jogador desligados e ligados novamente quando são descobertos.',
    },
  },
  status: {
    engine: 'Motor de jogo',
    grid: 'Rede',
    layer: 'Camada hexadecimal',
    hexes: 'Feitiços',
    named: 'Hexágonos nomeados',
    icons: 'Fichas de localização',
    glimpsed: 'Feitiços vislumbrados',
    pending: 'Locais a aguardar preenchimento',
    calibrated: 'Calibrado',
    overrides: 'Substituições de página',
    undo: 'Desfazer disponível',
  },
  messages: {
    filled:
      'Preenchimento completo. Hexágonos desenhados: {created}. Reestilizado: {restyled}. Locais escondidos: {icons}.',
    revealed: 'Feitiços revelados: {count}.',
    revealedPage: 'Cada hexágono da página revelado ({count}).',
    confirmReset:
      'Remover todos os hexadecimais de "{page}" ({count})? Os tokens de localização regressam à camada de tokens. Desfazer não pode reverter isso.',
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
      'Os seus mapas hexadecimais do Hexploration 1. x foram atualizados. Se este jogo foi copiado de um jogo Legacy, execute Rescan em cada página do mapa hexadecimal.',
    pruned:
      'Hexágonos salvos que já não existem e foram esquecidos: {dropped}. Se este jogo ou página tiver sido copiado, execute uma nova verificação na página para recuperar os seus hexágonos novamente.',
    readyHint: 'Digite !hexploration no menu ou abra o folheto "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Este jogo não suporta o desenho na camada de primeiro plano, pelo que foram desenhados hexágonos na camada de tokens.',
    someFailed:
      'Hexágonos que não puderam ser desenhados: {count}. Verifique a consola da API para obter detalhes.',
  },
  errors: {
    noPage: 'Não foi possível encontrar a página para trabalhar.',
    notHex: 'Esta página não utiliza uma grelha hexadecimal.',
    noPolygons: 'Selecione uma ou mais formas desenhadas para preencher.',
    emptyArea: 'A área selecionada não contém centros hexadecimais.',
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
    calibrateNeedsTokens: 'Selecione um ou dois tokens encaixados nos centros hexadecimais.',
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
      'Encaixe um token no centro de um hexágono e seleccione-o. Selecione um segundo token ajustado a um hexadecimal vizinho na mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho hexadecimal.',
    calibrateFailed:
      'Dois tokens devem estar na mesma linha (Hex V) ou na mesma coluna (Hex H), separados por pelo menos um hexadecimal.',
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
    explore: 'Revele os tokens selecionados como se tivessem acabado de se mudar para lá.',
    resetPage: 'Remova todos os hexadecimais da página (pergunta primeiro).',
    name: 'Nomeie os hexágonos selecionados ou os hexágonos sob os tokens selecionados. Deixe o nome vazio para o limpar.',
    mark: 'Transforme os tokens selecionados em locais ocultos.',
    unmark: 'Impede que os tokens selecionados sejam locais ocultos.',
    set: 'Altere uma definição ou mostre todas as definições.',
    pageSet: 'Substituir uma configuração de revelação apenas na página atual.',
    pageClear: 'Remova as substituições da página atual.',
    rescan:
      'Reconstrua a lista hexadecimal da página, por exemplo, após copiar uma página ou jogo.',
    calibrate:
      'Alinhe a grelha hexadecimal com um ou dois tokens selecionados encaixados nos centros hexadecimais.',
    calibrateReset: 'Remova a calibração da página atual.',
    status: 'Mostre o que o Hexploration sabe sobre a página atual.',
    journal: 'Reconstrua os folhetos da Ajuda e da Plataforma de Comando.',
    help: 'Mostre esta lista.',
    handout: 'As instruções completas estão no folheto "{name}".',
  },
  deck: {
    subtitle: 'Convés de Comando',
    drawDesc:
      'Desenhe formas à volta de uma área, selecione-as e preencha. Desfazer reverte o último enchimento.',
    revealDesc:
      'Selecione hexágonos, formas ou fichas para os revelar ou cobrir novamente. Explore as revelações em torno dos tokens selecionados como se se tivessem movido.',
    locationsDesc:
      'Selecione fichas para as ocultar como locais sob hexágonos. Selecione hexágonos ou tokens para nomear um hexágono.',
    toolsDesc:
      'Definições, substituições de páginas, estado, nova digitalização de páginas copiadas e calibração da grelha.',
    footer: 'Consulte o folheto "{help}" para obter as instruções completas.',
  },
  handout: {
    versionLabel: 'Versão',
    subtitle: 'Exploração hexadecimal para Roll20',
    footer: 'Utilize o folheto "{deck}" para controlos de um clique.',
    overview: {
      heading: 'Visão geral',
      body: 'Hexploração cobre um mapa hexadecimal com hexágonos opacos. À medida que o grupo se move, os hexágonos por onde passam (e, se preferir, os hexágonos à sua volta) são removidos, pelo que o mapa é descoberto um hexágono de cada vez. Os locais ocultos podem ser colocados em hexágonos e são anunciados quando encontrados. Funciona em jogos Jumpgate e Legacy, em grelhas Hex (V) e Hex (H) de qualquer tamanho.',
      demo: 'Assista a uma breve demonstração (da versão 1)',
    },
    quickStart: {
      heading: 'Início rápido',
      steps: [
        'Abra uma página cuja grelha esteja definida para Hex (V) ou Hex (H).',
        'Desenhe uma ou mais formas (polígono, retângulo, elipse ou à mão livre) à volta da área a ocultar.',
        'Selecione as formas e clique em Preencher no painel de comandos (ou escreva !hexploration fill). As formas são substituídas por hexágonos.',
        'Opcional: antes de preencher, selecione tokens de locais importantes e clique em Marcar Localização. Estão escondidos sob os hexágonos e anunciados quando descobertos.',
        'Mover uma ficha de jogador. Cada hexágono que ele passa e os hexágonos dentro da sua Distância de Visão são revelados.',
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
        'Apenas os tokens na camada de tokens revelam hexágonos. A contagem de fichas é definida por Tokens That Reveal: fichas de jogador por defeito, para que o Mestre possa mover monstros sem descobrir o mapa.',
        'Uma ficha revela cada hexágono que cobre (as fichas grandes cobrem vários) e, com Revelar ao longo do caminho ativado, cada hexágono na rota pela qual foi arrastado, incluindo pontos de referência.',
        'A Distância de Visão revela os hexágonos em torno de cada um destes hexágonos. Com a Linha de Visão ativada, um hexágono só é revelado se não existir nenhum hexágono coberto entre eles.',
        'A distância de revelação hexadecimal é armazenada em hexadecimais à medida que são desenhados. Estes hexágonos só são revelados dentro desse número de hexágonos, por mais longe que uma ficha consiga ver. Utilize-o para montanhas ou florestas que escondem o que está por trás delas.',
        'No modo Glimpse, os hexágonos à vista tornam-se transparentes em vez de desaparecerem e são removidos quando uma ficha entra neles.',
        'The API does not report moves made by other mods. TokenMod moves are picked up automatically; for other mods, select the tokens and click Explore, or call Hexploration.revealAround(token) from your own mod.',
        'A API não reporta movimentos feitos por outros mods. Os movimentos do TokenMod são captados automaticamente; para outros mods, selecione os tokens e clique em Explorar ou chame Hexploration.revealAround(token) do seu próprio mod.',
      ],
    },
    locations: {
      heading: 'Hexes e locais nomeados',
      points: [
        'O Mark Location transforma os tokens selecionados em locais escondidos. Uma ficha que já esteja sob um hexágono é imediatamente ocultada; caso contrário, ficará oculto pelo próximo enchimento que o cobrir.',
        'Os tokens com o marcador de estado da torre branca também são tratados como locais quando preenche, como na versão 1.',
        'As fichas de localização oculta são movidas para a camada GM. Quando o seu hexágono é revelado, regressam à camada de token com o seu nome mostrado e a sua descoberta é anunciada.',
        'Name Hex dá um nome hexadecimal sem um token. O nome é mostrado ao GM como um rótulo na camada do GM e anunciado quando o hexágono é revelado.',
        'Anunciar Descobertas escolhe se todos, apenas o GM, ou ninguém verá o anúncio. O Ping Discoveries também move a visão dos jogadores para o local.',
      ],
    },
    settings: {
      heading: 'Configurações',
      intro:
        'Altere as definições com !hexploration set (ou o botão Definições). A camada hexadecimal, os tokens que revelam e o idioma também podem ser definidos na página de definições do Mod.',
      colKey: 'Chave',
      colName: 'Definição',
      colDesc: 'Descrição',
      perPage: '(Pode ser definido por página.)',
    },
    jumpgate: {
      heading: 'Jumpgate e Legado',
      points: [
        'Hexploration descobre qual o motor que o jogo utiliza e desenha o tipo de forma correspondente. As formas desenhadas em qualquer editor podem ser preenchidas.',
        'Com a camada hexadecimal definida como Automático, os hexágonos são desenhados na camada de primeiro plano, acima dos tokens, para que os jogadores não consigam ver o que está por baixo. Se a camada de primeiro plano não estiver disponível, será utilizada a camada de token.',
        'Jumpgate desenha hexágonos matematicamente regulares, que têm uma forma ligeiramente diferente dos hexágonos Legacy. Se os hexágonos não estiverem alinhados com a grelha da página, encaixe um token num centro hexadecimal, seleccione-o e clique em Calibrar. Selecione dois tokens em hexágonos vizinhos da mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho hexadecimal.',
        'Quando uma página ou jogo é copiado, os seus hexágonos recebem novos IDs. Execute Rescan na página para os voltar a apanhar, juntamente com os seus rótulos de nome e tokens de localização.',
      ],
    },
    upgrading: {
      heading: 'Atualização da versão 1',
      points: [
        'A versão 2 já não precisa de PathMath, MatrixMath, Vector Math ou HTML Builder. Pode removê-los, a menos que outro mod os utilize.',
        'Os mapas hexadecimais, os nomes, os tokens de localização e as definições existentes são atualizados automaticamente na primeira inicialização.',
        'Os comandos da versão 1, incluindo a macro Hexploration_menu, ainda funcionam.',
        'A versão 1 permitia que qualquer token que representasse uma personagem revelasse hexágonos. Defina os Tokens que Revelam como tokens de Personagem para manter este comportamento.',
      ],
      colV1: 'Comando da versão 1',
      colV2: 'Comando da versão 2',
    },
    troubleshooting: {
      heading: 'Solução de problemas',
      points: [
        'Nada acontece quando um token se move: verifique se o token está na camada de token e corresponde aos Tokens That Reveal e se a página tem hexágonos (status !hexploration).',
        'Os hexágonos são deslocados da grelha: usa Calibrar e verifica com um token alguns hexágonos no mapa.',
        'Os hexágonos deixaram de ser revelados após copiar uma página ou jogo: execute uma nova verificação na página.',
        'Fill diz que a área não tem centros hexadecimais: a forma deve conter o centro de pelo menos um hexadecimal.',
        'Para qualquer outra coisa, verifique o registo da consola da API e inclua as suas mensagens ao pedir ajuda.',
      ],
    },
    languages: {
      heading: 'Idiomas',
      body: 'Escolha um idioma com !hexploration set language. Idiomas disponíveis:',
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
