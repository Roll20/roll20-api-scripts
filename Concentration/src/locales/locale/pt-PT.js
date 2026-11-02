const TRANSLATION = {
  titles: {
    ready: 'A concentração está pronta.',
    menu: 'Configurações de concentração',
    help: 'Comandos de concentração',
    status: 'Quem está a concentrar-se',
    advantage: 'Vantagem em economia de concentração',
    reset: 'Redefinir concentração',
    concentration: 'Concentração',
    save: 'Economia de concentração',
    check: 'Verificação da concentração',
  },
  messages: {
    migrated:
      'Atualizado a partir da versão 1.0. As suas definições e lista de vantagens foram mantidas e as suas macros antigas ainda funcionam.',
    reconciled:
      'Alcançado o mapa: tokens de concentração encontrados {added}, entradas antigas removidas {dropped}.',
    readyHint: 'Introduza {command} para as definições ou abra o folheto Command Deck.',
    settingChanged: '{setting} é agora {value}.',
    confirmReset:
      'Colocar todas as definições de volta no padrão e limpar a lista de vantagens? Os marcadores de concentração no mapa mantêm-se.',
    reset: 'As definições voltam aos seus padrões.',
    journal: 'Apostilas reconstruídas: {help} e {deck}.',
  },
  notices: {
    started: '{name} está agora concentrado em {spell}.',
    startedNoSpell: '{name} está agora a concentrar-se.',
    switched: '{name} deixa de se concentrar em {old} e está agora a concentrar-se em {spell}.',
    switchedNoSpell: '{name} está agora a concentrar-se.',
    ended: '{name} já não está concentrado em {spell}.',
    endedNoSpell: '{name} já não se está a concentrar.',
    lost: '{name} perde a concentração em {spell}.',
    lostNoSpell: '{name} perde a concentração.',
    kept: '{name} continua concentrado em {spell}.',
    keptNoSpell: '{name} continua concentrado.',
    zeroHp: '{name} desce para 0 pontos de vida e perde a concentração em {spell}.',
    zeroHpNoSpell: '{name} desce para 0 pontos de vida e perde a concentração.',
    checkNeeded:
      '{name} deve fazer um teste de resistência de Constituição para continuar a concentrar-se: {dc}.',
  },
  save: {
    dc: 'CC',
    dcValue: 'DC {dc}',
    modifier: 'Modificador',
    roll: 'Rolo',
    advantageRoll: '{first} e {second} (vantagem)',
    success: 'Sucesso',
    failure: 'Falha',
  },
  menu: {
    concentratingCount: 'Concentrando-se agora: {count}',
    settings: 'Configurações',
    footer: 'Introduza {command} para voltar aqui. Cada botão está também no folheto "{deck}".',
  },
  status: {
    none: 'Ninguém está concentrado.',
  },
  advantage: {
    intro:
      'Personagens configuradas para ativar os seus testes de concentração com vantagem, como acontece com o talento War Caster. Isto aplica-se a salvamentos automáticos.',
    none: 'Não existem personagens neste jogo.',
  },
  buttons: {
    roll: 'Rolo',
    advantage: 'Vantagem',
    status: 'Estatuto',
    advantageMenu: 'Menu Vantagem',
    help: 'Ajuda',
    reset: 'Reiniciar',
    confirmReset: 'Redefinir as configurações',
    end: 'Fim',
    menu: 'Menu',
    concentrate: 'Concentre-se em…',
    toggle: 'Alternar',
    journal: 'Reconstruir folhetos',
  },
  prompts: {
    spell: 'Feitiço',
  },
  values: {
    on: 'Em',
    off: 'Desligado',
    bar: 'Barra {bar}',
    unnamed: 'Sem nome',
    sendTo: {
      everyone: 'Toda a gente',
      character: 'Personagem',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Básico',
      detailed: 'Detalhado',
    },
  },
  settings: {
    language: {
      label: 'Idioma',
      desc: 'O idioma das mensagens de chat e dos folhetos.',
    },
    command: {
      label: 'Comando',
      desc: 'O comando chat, sem o comando "!". As macros da versão 1.0 utilizam a concentração.',
    },
    statusmarker: {
      label: 'Marcador de estado',
      desc: 'O marcador simbólico que mostra concentração. Podem ser utilizados marcadores de token personalizados.',
    },
    bar: {
      label: 'Barra de HP',
      desc: 'A barra de tokens que contém pontos de vida. Os danos nele exigem uma economia de concentração.',
    },
    send_reminder_to: {
      label: 'Enviar lembrete para',
      desc: 'Quem vê as mensagens de concentração e guarda: todos, o GM ou os jogadores da personagem (o GM recebe uma cópia).',
    },
    auto_add_concentration_marker: {
      label: 'Adicionar Con automaticamente. Marcador',
      desc: 'Adicione o marcador quando um feitiço de concentração é lançado a partir de uma folha.',
      hint: 'D&D 5e 2014 (OGL) e 2024 folhas.',
    },
    auto_roll_save: {
      label: 'Guardar rolagem automática',
      desc: 'Faz o salvamento assim que uma ficha de concentração sofrer dano. Quando desativado, o lembrete possui botões Roll e Advantage.',
    },
    show_roll_button: {
      label: 'Botão Rolar',
      desc: 'Adicione os botões Roll e Advantage ao lembrete quando o Auto Roll Save estiver desativado.',
    },
    end_at_zero: {
      label: 'Termina em 0 HP',
      desc: 'Termina a concentração sem guardar quando uma ficha atinge 0 pontos de vida.',
    },
    bonus_attribute: {
      label: 'Atributo bónus',
      desc: 'O atributo de folha adicionado aos salvamentos de concentração. Constitution_save_mod funciona nas folhas de cálculo D&D 5e 2014 e 2024.',
    },
    debug: {
      label: 'Modo de depuração',
      desc: 'Escreva notas sobre deteção ortográfica e salvamentos na consola da API, para pedidos de suporte.',
    },
    support_mode: {
      label: 'Modo de suporte',
      desc: 'Quanto o modo de depuração grava: Básico (curto) ou Detalhado.',
    },
  },
  help: {
    menu: 'Sem nada selecionado (GM): abra as definições. Com tokens selecionados: inicia ou termina a concentração.',
    toggle:
      'Comece a concentrar-se num feitiço com as fichas selecionadas. Nomeie um feitiço diferente para trocar; execute-o novamente para terminar.',
    end: 'Concentração final para os tokens selecionados.',
    status: 'Liste quem se está a concentrar, com os botões Encerrar.',
    config: 'Altere uma configuração, por exemplo config auto_roll_save|false.',
    advantageMenu:
      'Escolha quais as personagens que realizam os testes de concentração com vantagem.',
    toggleAdvantage: 'Ative ou desative a vantagem de uma personagem.',
    roll: 'Faça um guardar a partir do botão Rolar ou Vantagem de um lembrete.',
    journal: 'Reconstrua os folhetos da Ajuda e da Plataforma de Comando.',
    reset: 'Coloque todas as definições de volta ao padrão.',
    help: 'Mostre esta lista.',
    footer:
      'As instruções completas estão no folheto "{help}"; os botões estão no folheto "{deck}".',
    playerFooter: 'Selecione primeiro o seu token.',
  },
  errors: {
    noSelection: 'Selecione primeiro um token.',
    notYours: 'Só pode alterar a concentração das fichas que controla.',
    gmOnly: 'Apenas o GM pode usar este comando.',
    notConcentrating: 'Esse token não está a concentrar-se.',
    unknownSetting: 'Não existe nenhuma configuração chamada "{key}".',
    badSettingValue: '"{value}" não é um valor válido para {key}.',
    rollExpired: 'Esse botão expirou.',
    unknownCharacter: 'Esse personagem já não existe.',
    internal: 'Algo correu mal. A consola da API contém os detalhes.',
  },
  hints: {
    noSelection: 'Selecione o token do lançador e execute novamente o comando.',
    rollExpired:
      'Os botões funcionam uma vez e durante 10 minutos. Danifique novamente o token para obter um novo.',
    unknownSetting: 'Introduza o comando sem nada selecionado para ver as definições.',
  },
  warnings: {
    unknownMarker:
      'O marcador de estado "{marker}" não é um dos marcadores deste jogo. Escolha outro nas definições.',
  },
  deck: {
    subtitle: 'Convés de comando',
    selected: 'Tokens Selecionados',
    selectedDesc: 'Selecione primeiro a ficha do lançador.',
    table: 'A mesa',
    tableDesc: 'Veja quem está concentrado e quem tem vantagem nas defesas.',
    tools: 'Ferramentas',
    toolsDesc: 'Definições, a lista de comandos e os folhetos.',
    footer: 'As instruções completas estão no folheto "{help}".',
  },
  handout: {
    versionLabel: 'Versão',
    subtitle: 'Marcadores de concentração, lembretes e salvamentos para D&D 5e',
    overview: {
      heading: 'Visão geral',
      body: 'A concentração monitoriza quem se está a concentrar em qual feitiço. Coloca um marcador na ficha do conjurador, lança (ou pede) um salvamento de Constituição quando essa ficha sofre dano e informa a mesa quando a concentração termina.',
    },
    quickStart: {
      heading: 'Início rápido',
      steps: [
        'Selecione o token do lançador e digite !concentration seguido do feitiço, por exemplo !concentration Bless.',
        'Altere os pontos de vida do token na bolha da barra. Um teste de resistência é lançado com CD 10, ou metade do dano, se for superior.',
        'Execute novamente o mesmo comando ou retire o marcador para terminar a concentração.',
        'Digite !concentration sem nada selecionado para abrir as definições.',
      ],
    },
    concentrating: {
      heading: 'Concentrando-se',
      points: [
        'Nomear um feitiço diferente muda a concentração para ele, tal como lançar um novo feitiço de concentração faz.',
        'Colocar o marcador numa ficha manualmente inicia a concentração sem feitiço; retirá-lo ou apagar o token encerra tudo.',
        'Um novo token ligado de um personagem concentrador obtém o marcador, e um token colado que transporta o marcador é rastreado.',
        'Os tokens de uma personagem com uma barra de pontos de vida ligada partilham a concentração. As fichas não ligadas, como um bando de duendes de uma folha, concentram-se em si mesmas.',
        'Todos veem uma mensagem quando a concentração começa, muda ou termina, a menos que Enviar lembrete para diga o contrário.',
      ],
    },
    saves: {
      heading: 'Concentração salva',
      points: [
        'A CD é 10 ou metade do dano sofrido, consoante o que for mais elevado, até CD 30.',
        'O modificador vem do Atributo Bónus na ficha da personagem; um valor em falta conta como 0.',
        'Auto Roll Guarde os rolos de uma só vez. Quando está desligado, o lembrete tem botões Roll e Advantage para o jogador ou GM.',
        'Uma falha no salvamento termina a concentração. Com End at 0 HP activado, descer para 0 pontos de vida termina sem guardar.',
        'O Menu Vantagem dá vantagem à personagem nos auto-saves, tal como faz o talento War Caster.',
      ],
    },
    automatic: {
      heading: 'Feitiços lançados de uma folha',
      points: [
        'Com adição automática. Marcador ativado, lançar um feitiço de concentração de uma folha D&D 5e 2014 (OGL) ou 2024 adiciona o marcador.',
        'Os marcadores do conjurador na página que está a visualizar são marcados; se não houver nenhum, os tokens em qualquer página serão.',
        'Apenas as cartas do GM, de outro Mod ou de um dos jogadores da personagem contam. Lançar novamente o mesmo feitiço não muda nada.',
        'Uma carta D&D 2024 que apenas menciona concentração no seu texto, como o talento War Caster, pode iniciar a concentração, mas nunca substitui um feitiço.',
        'As folhas de cálculo D&D 2024 podem necessitar do servidor API Experimental. Ative o modo de depuração para ver porque é que um feitiço foi ou não detetado.',
      ],
    },
    players: {
      heading: 'Jogadores',
      points: [
        'Os jogadores podem iniciar e terminar a concentração dos tokens que controlam e utilizar os botões Roll e Advantage nos seus próprios saves.',
        'Com Enviar lembrete para definir como Personagem, as mensagens são sussurradas aos jogadores da personagem e ao Mestre.',
      ],
    },
    commands: {
      heading: 'Comandos',
      intro: 'Outros Mods, como os ScriptCards, também podem enviar estes comandos.',
      colCommand: 'Comando',
      colDesc: 'O que faz',
    },
    settings: {
      heading: 'Configurações',
      intro:
        'Altere as definições com os botões do cartão de definições ou com config <key>|<value>. Alguns também podem ser configurados na página Mod.',
      colKey: 'Chave',
      colName: 'Nome',
      colDesc: 'O que faz',
    },
    upgrading: {
      heading: 'Atualização da versão 1.0',
      points: [
        'As definições, a lista de vantagens e todos os comandos continuam a funcionar.',
        'As mensagens informam agora quando a concentração termina e em que feitiço.',
        'Os tokens que já carregam o marcador são recolhidos no arranque.',
      ],
    },
    troubleshooting: {
      heading: 'Solução de problemas',
      points: [
        'Não é possível guardar quando os pontos de vida caem: verifique se o token tem o marcador e se a Barra de HP é a barra que alterou. As alterações efetuadas por outros Mods através da API não geram eventos, pelo que não são visualizadas.',
        'O modificador é 0: compare o Atributo Bónus com a ficha da personagem.',
        'Os feitiços lançados a partir da folha de cálculo não são detetados: ative o modo de depuração, lance o feitiço novamente e leia a consola da API.',
        'Dois caracteres partilham um nome: a deteção utiliza a primeira correspondência. Dê nomes únicos às personagens.',
      ],
    },
    languages: {
      heading: 'Idiomas',
      body: 'A concentração está traduzida para as línguas abaixo. Escolha um com a definição de idioma.',
      colCode: 'Código',
      colName: 'Idioma',
      colNative: 'Nome nativo',
    },
    credits: {
      heading: 'Créditos',
      original: 'Mod original de',
      maintainer: 'Mantido por',
      support: 'Reporte bugs e ideias no fórum Roll20 Mod ou no GitHub.',
    },
    footer: 'Os botões de cada ação estão no folheto "{deck}".',
  },
};

export default TRANSLATION;
