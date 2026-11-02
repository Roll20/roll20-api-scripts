const TRANSLATION = {
  titles: {
    ready: 'A concentração está pronta.',
    menu: 'Configurações de concentração',
    help: 'Comandos de concentração',
    status: 'Quem está se concentrando',
    advantage: 'Vantagem em economia de concentração',
    reset: 'Redefinir concentração',
    concentration: 'Concentração',
    save: 'Economia de concentração',
    check: 'Verificação de concentração',
  },
  messages: {
    migrated:
      'Atualizado da versão 1.0. Suas configurações e lista de vantagens foram mantidas e suas macros antigas ainda funcionam.',
    reconciled:
      'Alcançado o mapa: tokens de concentração encontrados {added}, entradas antigas removidas {dropped}.',
    readyHint: 'Digite {command} para as configurações ou abra o folheto Command Deck.',
    settingChanged: '{setting} agora é {value}.',
    confirmReset:
      'Colocar todas as configurações de volta no padrão e limpar a lista de vantagens? Os marcadores de concentração no mapa permanecem.',
    reset: 'As configurações voltam aos seus padrões.',
    journal: 'Apostilas reconstruídas: {help} e {deck}.',
  },
  notices: {
    started: '{name} agora está concentrado em {spell}.',
    startedNoSpell: '{name} agora está se concentrando.',
    switched: '{name} para de se concentrar em {old} e agora está se concentrando em {spell}.',
    switchedNoSpell: '{name} agora está se concentrando.',
    ended: '{name} não está mais concentrado em {spell}.',
    endedNoSpell: '{name} não está mais se concentrando.',
    lost: '{name} perde a concentração em {spell}.',
    lostNoSpell: '{name} perde a concentração.',
    kept: '{name} continua concentrado em {spell}.',
    keptNoSpell: '{name} continua concentrado.',
    zeroHp: '{name} cai para 0 pontos de vida e perde a concentração em {spell}.',
    zeroHpNoSpell: '{name} cai para 0 pontos de vida e perde a concentração.',
    checkNeeded:
      '{name} deve fazer um teste de resistência de Constituição para continuar se concentrando: {dc}.',
  },
  save: {
    dc: 'CC',
    dcValue: 'DC {dc}',
    modifier: 'Modificador',
    roll: 'Rolar',
    advantageRoll: '{first} e {second} (vantagem)',
    success: 'Sucesso',
    failure: 'Falha',
  },
  menu: {
    concentratingCount: 'Concentrando-se agora: {count}',
    settings: 'Configurações',
    footer: 'Digite {command} para voltar aqui. Cada botão também está no folheto "{deck}".',
  },
  status: {
    none: 'Ninguém está concentrado.',
  },
  advantage: {
    intro:
      'Personagens configurados para ativar seus testes de concentração com vantagem, como acontece com o talento War Caster. Isso se aplica a salvamentos automáticos.',
    none: 'Não há personagens neste jogo.',
  },
  buttons: {
    roll: 'Rolar',
    advantage: 'Vantagem',
    status: 'Status',
    advantageMenu: 'Menu Vantagem',
    help: 'Ajuda',
    reset: 'Reiniciar',
    confirmReset: 'Redefinir configurações',
    end: 'Fim',
    menu: 'Menu',
    concentrate: 'Concentre-se em…',
    toggle: 'Alternar',
    journal: 'Reconstruir folhetos',
  },
  prompts: {
    spell: 'Soletrar',
  },
  values: {
    on: 'Sobre',
    off: 'Desligado',
    bar: 'Barra {bar}',
    unnamed: 'Sem nome',
    sendTo: {
      everyone: 'Todos',
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
      label: 'Linguagem',
      desc: 'O idioma das mensagens de bate-papo e folhetos.',
    },
    command: {
      label: 'Comando',
      desc: 'O comando chat, sem o "!". As macros da versão 1.0 usam concentração.',
    },
    statusmarker: {
      label: 'Marcador de status',
      desc: 'O marcador simbólico que mostra concentração. Marcadores de token personalizados podem ser usados.',
    },
    bar: {
      label: 'Barra de HP',
      desc: 'A barra de tokens que contém pontos de vida. Danos a ele exigem uma economia de concentração.',
    },
    send_reminder_to: {
      label: 'Enviar lembrete para',
      desc: 'Quem vê as mensagens de concentração e salva: todos, o GM ou os jogadores do personagem (o GM recebe uma cópia).',
    },
    auto_add_concentration_marker: {
      label: 'Adicionar Con automaticamente. Marcador',
      desc: 'Adicione o marcador quando um feitiço de concentração for lançado de uma folha.',
      hint: 'D&D 5e 2014 (OGL) e 2024 folhas.',
    },
    auto_roll_save: {
      label: 'Salvar rolagem automática',
      desc: 'Faça o salvamento assim que uma ficha de concentração sofrer dano. Quando desativado, o lembrete possui botões Roll e Advantage.',
    },
    show_roll_button: {
      label: 'Botão Rolar',
      desc: 'Adicione os botões Roll e Advantage ao lembrete quando o Auto Roll Save estiver desativado.',
    },
    end_at_zero: {
      label: 'Termina em 0 HP',
      desc: 'Finaliza a concentração sem salvar quando uma ficha chega a 0 pontos de vida.',
    },
    bonus_attribute: {
      label: 'Atributo bônus',
      desc: 'O atributo de folha adicionado aos salvamentos de concentração. Constitution_save_mod funciona nas planilhas D&D 5e 2014 e 2024.',
    },
    debug: {
      label: 'Modo de depuração',
      desc: 'Escreva notas sobre detecção ortográfica e salvamentos no console da API, para solicitações de suporte.',
    },
    support_mode: {
      label: 'Modo de suporte',
      desc: 'Quanto o modo de depuração grava: Básico (curto) ou Detalhado.',
    },
  },
  help: {
    menu: 'Sem nada selecionado (GM): abra as configurações. Com tokens selecionados: inicia ou finaliza a concentração.',
    toggle:
      'Comece a se concentrar em um feitiço com as fichas selecionadas. Nomeie um feitiço diferente para trocar; execute-o novamente para terminar.',
    end: 'Concentração final para os tokens selecionados.',
    status: 'Liste quem está se concentrando, com os botões Encerrar.',
    config: 'Altere uma configuração, por exemplo config auto_roll_save|false.',
    advantageMenu: 'Escolha quais personagens rolam os testes de concentração com vantagem.',
    toggleAdvantage: 'Ative ou desative a vantagem de um personagem.',
    roll: 'Faça um salvamento a partir do botão Rolar ou Vantagem de um lembrete.',
    journal: 'Reconstrua os folhetos da Ajuda e da Plataforma de Comando.',
    reset: 'Coloque todas as configurações de volta ao padrão.',
    help: 'Mostre esta lista.',
    footer:
      'As instruções completas estão no folheto "{help}"; os botões estão no folheto "{deck}".',
    playerFooter: 'Selecione seu token primeiro.',
  },
  errors: {
    noSelection: 'Selecione um token primeiro.',
    notYours: 'Você só pode alterar a concentração das fichas que você controla.',
    gmOnly: 'Somente o GM pode usar esse comando.',
    notConcentrating: 'Esse token não está se concentrando.',
    unknownSetting: 'Não há configuração chamada "{key}".',
    badSettingValue: '"{value}" não é um valor válido para {key}.',
    rollExpired: 'Esse botão expirou.',
    unknownCharacter: 'Esse personagem não existe mais.',
    internal: 'Algo deu errado. O console da API contém os detalhes.',
  },
  hints: {
    noSelection: 'Selecione o token do lançador e execute o comando novamente.',
    rollExpired:
      'Os botões funcionam uma vez e por 10 minutos. Danifique o token novamente para obter um novo.',
    unknownSetting: 'Digite o comando sem nada selecionado para ver as configurações.',
  },
  warnings: {
    unknownMarker:
      'O marcador de status "{marker}" não é um dos marcadores deste jogo. Escolha outro nas configurações.',
  },
  deck: {
    subtitle: 'Convés de comando',
    selected: 'Tokens Selecionados',
    selectedDesc: 'Selecione primeiro a ficha do lançador.',
    table: 'A mesa',
    tableDesc: 'Veja quem está concentrado e quem tem vantagem nas defesas.',
    tools: 'Ferramentas',
    toolsDesc: 'Configurações, a lista de comandos e os folhetos.',
    footer: 'As instruções completas estão no folheto "{help}".',
  },
  handout: {
    versionLabel: 'Versão',
    subtitle: 'Marcadores de concentração, lembretes e salvamentos para D&D 5e',
    overview: {
      heading: 'Visão geral',
      body: 'A concentração monitora quem está se concentrando em qual feitiço. Ele coloca um marcador na ficha do conjurador, rola (ou pede) um salvamento de Constituição quando aquela ficha sofre dano e informa à mesa quando a concentração termina.',
    },
    quickStart: {
      heading: 'Início rápido',
      steps: [
        'Selecione o token do lançador e digite !concentration seguido do feitiço, por exemplo !concentration Bless.',
        'Altere os pontos de vida do token na bolha da barra. Um teste de resistência é rolado com CD 10, ou metade do dano, se for maior.',
        'Execute o mesmo comando novamente ou retire o marcador para encerrar a concentração.',
        'Digite !concentration sem nada selecionado para abrir as configurações.',
      ],
    },
    concentrating: {
      heading: 'Concentrando-se',
      points: [
        'Nomear um feitiço diferente muda a concentração para ele, assim como lançar um novo feitiço de concentração faz.',
        'Colocar o marcador em uma ficha manualmente inicia a concentração sem feitiço; retirá-lo ou excluir o token encerra tudo.',
        'Um novo token vinculado de um personagem concentrador obtém o marcador, e um token colado que carrega o marcador é rastreado.',
        'Tokens de um personagem com uma barra de pontos de vida vinculada compartilham concentração. Fichas não vinculadas, como um bando de goblins de uma folha, concentram-se em si mesmas.',
        'Todos veem uma mensagem quando a concentração começa, muda ou termina, a menos que Enviar lembrete para diga o contrário.',
      ],
    },
    saves: {
      heading: 'Concentração salva',
      points: [
        'A CD é 10 ou metade do dano sofrido, o que for maior, até CD 30.',
        'O modificador vem do Atributo Bônus na ficha do personagem; um valor ausente conta como 0.',
        'Auto Roll Salve rolos de uma só vez. Quando está desligado, o lembrete possui botões Roll e Advantage para o jogador ou GM.',
        'Uma falha no salvamento encerra a concentração. Com End at 0 HP ativado, cair para 0 pontos de vida encerra sem salvar.',
        'O Menu Vantagem dá vantagem ao personagem em salvamentos automáticos, como faz o talento War Caster.',
      ],
    },
    automatic: {
      heading: 'Feitiços lançados de uma folha',
      points: [
        'Com adição automática. Marcador ativado, lançar um feitiço de concentração de uma folha D&D 5e 2014 (OGL) ou 2024 adiciona o marcador.',
        'Os marcadores do conjurador na página que ele está visualizando são marcados; se não houver nenhum, os tokens em qualquer página serão.',
        'Apenas cartas do GM, de outro Mod ou de um dos jogadores do personagem contam. Lançar o mesmo feitiço novamente não muda nada.',
        'Uma carta D&D 2024 que apenas menciona concentração em seu texto, como o talento War Caster, pode iniciar a concentração, mas nunca substitui um feitiço.',
        'As planilhas D&D 2024 podem precisar do servidor API Experimental. Ative o modo de depuração para ver por que um feitiço foi ou não detectado.',
      ],
    },
    players: {
      heading: 'Jogadores',
      points: [
        'Os jogadores podem iniciar e encerrar a concentração dos tokens que controlam e usar os botões Roll e Advantage em seus próprios salvamentos.',
        'Com Enviar lembrete para definir como Personagem, as mensagens são sussurradas para os jogadores do personagem e para o Mestre.',
      ],
    },
    commands: {
      heading: 'Comandos',
      intro: 'Outros Mods, como ScriptCards, também podem enviar esses comandos.',
      colCommand: 'Comando',
      colDesc: 'O que isso faz',
    },
    settings: {
      heading: 'Configurações',
      intro:
        'Altere as configurações com os botões no cartão de configurações ou com config <key>|<value>. Alguns também podem ser configurados na página do Mod.',
      colKey: 'Chave',
      colName: 'Nome',
      colDesc: 'O que isso faz',
    },
    upgrading: {
      heading: 'Atualizando da versão 1.0',
      points: [
        'As configurações, a lista de vantagens e todos os comandos continuam funcionando.',
        'As mensagens agora informam quando a concentração termina e em qual feitiço.',
        'Os tokens que já carregam o marcador são recolhidos na inicialização.',
      ],
    },
    troubleshooting: {
      heading: 'Solução de problemas',
      points: [
        'Não é possível salvar quando os pontos de vida caem: verifique se o token possui o marcador e se a Barra de HP é a barra que você alterou. Alterações feitas por outros Mods através da API não geram eventos, portanto não são visualizadas.',
        'O modificador é 0: compare o Atributo Bônus com a ficha do personagem.',
        'Os feitiços lançados da planilha não são detectados: ative o modo de depuração, lance o feitiço novamente e leia o console da API.',
        'Dois caracteres compartilham um nome: a detecção usa a primeira correspondência. Dê nomes exclusivos aos personagens.',
      ],
    },
    languages: {
      heading: 'Idiomas',
      body: 'A concentração está traduzida para os idiomas abaixo. Escolha um com a configuração de idioma.',
      colCode: 'Código',
      colName: 'Linguagem',
      colNative: 'Nome nativo',
    },
    credits: {
      heading: 'Créditos',
      original: 'Mod original por',
      maintainer: 'Mantido por',
      support: 'Relate bugs e ideias no fórum Roll20 Mod ou no GitHub.',
    },
    footer: 'Os botões para cada ação estão no folheto "{deck}".',
  },
};

export default TRANSLATION;
