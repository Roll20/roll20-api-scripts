const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "agarrado",
      verb: "agarra",
    },
    Restrained: {
      past: "contido",
      verb: "contém",
    },
    Prone: {
      past: "derrubado",
      verb: "derruba",
    },
    Poisoned: {
      past: "envenenado",
      verb: "envenena",
    },
    Stunned: {
      past: "atordoado",
      verb: "atordoa",
    },
    Blinded: {
      past: "cegado",
      verb: "cega",
    },
    Charmed: {
      past: "encantado",
      verb: "encanta",
    },
    Frightened: {
      past: "apavorado",
      verb: "apavora",
    },
    Incapacitated: {
      past: "incapacitado",
      verb: "incapacita",
    },
    Invisible: {
      past: "invisível",
      verb: "torna",
      suffix: "invisível",
    },
    Paralyzed: {
      past: "paralisado",
      verb: "paralisa",
    },
    Petrified: {
      past: "petrificado",
      verb: "petrifica",
    },
    Unconscious: {
      past: "inconsciente",
      verb: "deixa",
      suffix: "inconsciente",
    },
    Spell: {
      past: "afetado por uma magia",
      verb: "lança uma magia em",
    },
    Ability: {
      past: "afetado por uma habilidade",
      verb: "usa uma habilidade em",
    },
    Advantage: {
      past: "tem vantagem",
      verb: "concede vantagem a",
      noBy: true,
    },
    Disadvantage: {
      past: "tem desvantagem",
      verb: "impõe desvantagem em",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Agarrado",
    Restrained: "Contido",
    Prone: "Derrubado",
    Poisoned: "Envenenado",
    Stunned: "Atordoado",
    Blinded: "Cegado",
    Charmed: "Encantado",
    Frightened: "Apavorado",
    Incapacitated: "Incapacitado",
    Invisible: "Invisível",
    Paralyzed: "Paralisado",
    Petrified: "Petrificado",
    Unconscious: "Inconsciente",
    Spell: "Magia",
    Ability: "Habilidade",
    Advantage: "Vantagem",
    Disadvantage: "Desvantagem",
    Other: "Outro",
  },
  templates: {
    display: {
      custom: "{emoji} {target} afetado por {effect} ({source})",
      advantage: "{emoji} {source} tem vantagem contra {target}{subject}",
      disadvantage: "{emoji} {source} tem desvantagem contra {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} está {past}",
      standard: "{emoji} {target} {past} por {source}",
    },
    apply: {
      custom: "{source} aplica {effect} em {target}.",
      advantage: "{source} tem vantagem contra {target}{subject}.",
      disadvantage: "{source} tem desvantagem contra {target}{subject}.",
      self: "{target} está {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} não está mais afetado por {effect}.",
      advantage: "{source} não tem mais vantagem contra {target}{subject}.",
      disadvantage:
        "{source} não tem mais desvantagem contra {target}{subject}.",
      noBy: "{target} não está mais {past}.",
      self: "{target} não está mais {past}.",
      standard: "{target} não está mais {past} por {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Selecionar condição",
      selectSource: "Selecionar ficha de origem",
      selectTarget: "Selecionar ficha alvo",
      selectSubject: "Selecionar sujeito",
      selectDuration: "Selecionar duração",
      reinstallHandout: "Reinstalar livreto",
      confirmTargetTitle: "Confirmar lista de alvos",
      applyEffectTitle: "Aplicar efeito {condition}",
      noTokens: "Nenhuma ficha nomeada encontrada na página ativa.",
      confirmIntro: "As seguintes fichas receberão a condição:",
      confirmBtn: "Confirmar lista de alvos",
      enterDetails: "Inserir detalhes do efeito",
      noneBtn: "Nenhum",
      noneOrSourceBtn: "Nenhum ou aplicar à origem",
      subjectDesc: "Selecione quem ou o que aplica o efeito.",
      sourceDesc:
        "Selecione a criatura que está criando ou gerando a condição ou efeito.",
      targetDesc: "Selecione a criatura que receberá a condição ou efeito.",
      otherText: "Texto de condição personalizada",
      effectDetails: "Detalhes de {condition}",
    },
    col: {
      players: "Jogadores",
      npcs: "NPCs",
      conditions: "Condições",
      customEffects: "Efeitos personalizados",
      permanentTurnEnd: "Permanente / Fim de turno",
      rounds: "Rodadas",
      command: "Comando",
      result: "Resultado",
      field: "Campo",
      value: "Valor",
      option: "Opção",
      condition: "Condição",
      marker: "Marcador",
      item: "Item",
      removed: "Removido",
      details: "Detalhes",
      description: "Descrição",
      scenario: "Cenário",
    },
    dur: {
      untilRemoved: "Até ser removido",
      endOfTargetTurn: "Fim do próximo turno do alvo",
      endOfSourceTurn: "Fim do próximo turno da origem",
      round1: "1 rodada",
      round2: "2 rodadas",
      round3: "3 rodadas",
      round10: "10 rodadas",
      custom: "Personalizado",
      customPrompt: "Número de rodadas",
      untilRemovedDisplay: "Até ser removido",
      turnsRemaining: "{n} fim(ns) de turno restante(s)",
    },
    btn: {
      openWizard: "Abrir assistente",
      openMultiTarget: "Abrir assistente multialvo",
      openRemovalList: "Abrir lista de remoção",
      showConfig: "Mostrar configuração",
      runCleanup: "Executar limpeza",
      reinstallMacro: "Reinstalar macro",
      reinstallHandout: "Reinstalar livreto",
      showHelp: "Mostrar ajuda",
      reorderConditions: "Reordenar linhas de condição",
    },
    title: {
      menu: "Menu",
      removalMenu: "Remoção — Condition Tracker",
      config: "Configuração",
      configTracker: "Configuração — Condition Tracker",
      help: "Ajuda",
      applied: "Aplicado",
      removed: "Condição removida",
      cleanup: "Limpeza concluída",
      macroReinstalled: "Macro reinstalada",
      handoutReinstalled: "Livreto reinstalado",
      warning: "Aviso",
      error: "Erro",
      turnOrder: "Ordem de iniciativa",
      noConditions: "Sem condições",
      tokenMoved: "Ficha movida",
      markedDead: "Marcado como morto",
      zeroHp: "{name} — 0 PV",
      moveToken: "{name} — Mover ficha?",
      scriptReady: "Script pronto",
      conditionReorder: "Ordem de turno alterada",
    },
    heading: {
      quickActions: "Ações rápidas",
      settings: "Configurações",
      markerMappings: "Mapeamento de marcadores",
      result: "Resultado",
      info: "Informações",
      commandOptions: "Opções de comando",
      promptUi: "Interface do assistente",
      examples: "Exemplos",
      summary: "Resumo",
    },
    msg: {
      noActive: "Nenhuma condição ativa está sendo rastreada.",
      configReset: "Configuração redefinida para os padrões do mod.",
      unknownConfig:
        "Opção de configuração desconhecida. Use --config para ver as configurações disponíveis.",
      macroReinstalled:
        "As macros {wizard} e {multiTarget} foram reinstaladas para todos os GMs atuais.",
      handoutReinstalled: "O livreto de ajuda {handout} foi reinstalado.",
      duplicate:
        "Essa combinação exata de origem, sujeito, alvo, condição e texto personalizado já está ativa.",
      noTargets: "Nenhuma ficha alvo especificada para aplicação múltipla.",
      noSelection:
        "Selecione pelo menos uma ficha no tabuleiro antes de usar --multi-target.",
      invalidIds: "Nenhum ID de ficha válido encontrado na seleção atual.",
      reSelectTokens:
        "Nenhuma das fichas selecionadas originalmente pôde ser encontrada. Selecione novamente e tente de novo.",
      conditionNotFound: "ID de condição não encontrado.",
      gmOnly: "Os comandos do Condition Tracker são exclusivos para o GM.",
      commandFailed:
        "O comando não pôde ser concluído com segurança. Verifique o console da API.",
      sourceTokenNotFound: "A ficha de origem não foi encontrada.",
      targetTokenNotFound: "A ficha alvo não foi encontrada.",
      subjectTokenNotFound: "A ficha do sujeito não foi encontrada.",
      invalidCondition: "A condição deve ser uma das predefinidas ou Outro.",
      subjectOnlyCustom:
        "--subject só é válido para Magia, Habilidade, Vantagem, Desvantagem e Outro.",
      subjectBypassInvalid:
        "--subjectPromptBypass espera true ou false quando um valor é fornecido.",
      customDetailsRequired:
        "Os detalhes de {condition} são obrigatórios. Use --other para fornecê-los.",
      markerConfigFormat:
        "Formato de configuração do marcador: --config marker Grappled=grab",
      markerPredefinedRequired:
        "A configuração do marcador requer um nome de condição predefinido.",
      markerNameRequired:
        "A configuração do marcador requer um nome de marcador não vazio.",
      markerSet: "Marcador de {condition} definido como {marker}.",
      healthBarSet: "Barra de saúde definida como {bar}.",
      boolSet: "{key} definido como {value}.",
      expectedBoolean: "Era esperado true ou false.",
      invalidHealthBar:
        "A barra de saúde deve ser bar1_value, bar2_value ou bar3_value.",
      markersDisabled: "Os marcadores estão desativados.",
      noMarkerConfigured:
        "Nenhum marcador está configurado para esta condição.",
      markerApplied: "Marcador aplicado: {marker}",
      markerPresent: "Marcador já presente: {marker}",
      langSet: "Idioma definido como {locale}.",
      invalidLocale: "Locale inválida. Locales suportadas: {locales}.",
      otherDurationRequiresRounds:
        "A duração Outro requer um número de rodadas, por exemplo --duration 5 rounds.",
      invalidDuration:
        "A duração deve ser Até ser removido, uma opção de fim de turno ou uma contagem positiva de rodadas.",
      zeroHpNoConditions: "{name} chegou a 0 PV e não tem condições ativas.",
      zeroHpConditions: "{name} chegou a 0 PV. Escolha as condições a remover:",
      removeAllBtn: "Remover todas as condições de {name}",
      markIncapacitated: "Marcar como incapacitado",
      removeFromTurnOrder: "Remover da ordem de iniciativa",
      alreadyIncapacitated: "{name} já está incapacitado.",
      tokenRemovedFromTurn: "{name} foi removido da ordem de iniciativa.",
      tokenNotInTurn: "{name} não foi encontrado na ordem de iniciativa.",
      moveTokenPrompt:
        "Mover {name} para a camada do mapa para que permaneça visível sem interferir com outras fichas?",
      moveTokenBtn: "Mover {name} para a camada do mapa",
      tokenMoved: "{name} foi movido para a camada do mapa.",
      tokenNotFound: "Ficha não encontrada.",
      noActiveConditions: "{name} não tem condições ativas para remover.",
      deadNoConditions:
        "{name} foi marcado como morto. Nenhuma condição estava ativa.",
      scriptReady: "{name} está ativo e você está usando a versão {version}.",
      reachedZeroHp: "{name} chegou a 0 PV",
      manuallyRemoved: "remoção manual",
      durationExpired: "sua duração expirou",
      markedAsDead: "{name} foi marcado como morto",
      conditionReorder:
        "A ordem de turno mudou e {count} linha(s) de condição rastreada(s) pode(m) estar fora do lugar. Clique abaixo para restaurá-las após os tokens atribuídos.",
      conditionsReordered:
        "As linhas de condição foram reposicionadas após seus tokens atribuídos.",
    },
    removal: {
      conditionField: "Condição",
      reasonField: "Motivo",
      turnRowField: "Linha de iniciativa",
      markerField: "Marcador",
      notConfigured: "Não configurado",
      markerRemoved: "Removido ({marker})",
      markerRetained: "Mantido ({marker})",
      rowRemoved: "Removido",
      rowMissing: "Já ausente",
      manualReason: "Remoção manual",
    },
    cleanup: {
      orphaned: "Entradas de condição órfãs",
      stale: "Entradas de condição obsoletas",
      orphanedRows: "Linhas de iniciativa órfãs",
      unusedMarkers: "Marcadores não utilizados",
    },
    apply: {
      turnAppended:
        "O alvo não estava na ordem de iniciativa; a linha de condição foi adicionada.",
      turnInserted: "Linha de condição inserida abaixo da ficha alvo.",
    },
  },
  handout: {
    versionLabel: "Versão",
    subtitle: "Gerenciador de efeitos de status de D&D 5e",
    footerNote:
      "Este livreto é criado e atualizado automaticamente cada vez que o script é carregado.",
    overview: {
      heading: "Visão geral",
      body: "Condition Tracker gerencia condições de status do D&D 5e e efeitos personalizados como linhas rotuladas no rastreador de turno do Roll20. Aplique condições a fichas, rastreie durações por ordem de iniciativa e remova automaticamente os efeitos expirados ao final de um turno. Todos os comandos são exclusivos para o GM.",
    },
    quickStart: {
      heading: "Início rápido",
      colCommand: "Comando",
      colDesc: "Descrição",
      rows: [
        [
          "!condition-tracker --prompt",
          "Assistente passo a passo — escolha condição, fichas e duração de forma interativa. Também disponível como macro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Aplicar uma condição a várias fichas simultaneamente. Também disponível como macro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Abrir o menu principal para aplicar, revisar ou remover condições.",
        ],
      ],
    },
    commandsRef: {
      heading: "Referência de comandos",
      colFlag: "Opção",
      colDesc: "Descrição",
      rows: [
        ["--prompt", "Interface do assistente passo a passo"],
        ["--multi-target", "Aplicar uma condição a várias fichas alvo"],
        [
          "--menu",
          "Mostrar menu principal (adicionar remove para o menu de remoção)",
        ],
        [
          "--source X --target Y --condition Z",
          "Aplicar uma condição diretamente sem o assistente",
        ],
        [
          "--duration &lt;valor&gt;",
          "Duração para aplicação direta (ex. 2 rounds)",
        ],
        [
          "--other &lt;texto&gt;",
          "Texto personalizado para tipos Magia / Habilidade / Outro",
        ],
        [
          "--remove &lt;id-condição&gt;",
          "Remover uma condição específica pelo seu ID único",
        ],
        [
          "--config &lt;opção&gt; &lt;valor&gt;",
          "Ajustar opções de configuração",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Substituir subjectPromptBypass somente para este comando (também aceita --subject-prompt-bypass)",
        ],
        ["--cleanup", "Reconciliar estado — remover condições e linhas órfãs"],
        [
          "--reorder-conditions",
          "Reposicionar manualmente as linhas de condição após os tokens atribuídos na ordem de iniciativa",
        ],
        ["--reinstall-macro", "Recriar ou atualizar as macros do GM"],
        [
          "--reinstall-handout",
          "Recriar ou atualizar o livreto de ajuda localizado",
        ],
        [
          "--lang &lt;locale&gt;",
          "Emitir as mensagens deste comando em uma locale adicional (modo bilingüe)",
        ],
        ["--help", "Mostrar um cartão de ajuda breve no chat"],
      ],
    },
    standardConditions: {
      heading: "Condições padrão (D&D 5e)",
      colCondition: "Condição",
    },
    customEffects: {
      heading: "Tipos de efeitos personalizados",
      colType: "Tipo",
      colNotes: "Notas",
      rows: [
        [
          "🔮 Magia",
          "Rastrear um efeito de magia nomeado — você será solicitado a inserir o nome da magia",
        ],
        [
          "🎯 Habilidade",
          "Rastrear uma habilidade de classe ou raça — você será solicitado a inserir o nome",
        ],
        [
          "🍀 Vantagem",
          "Registrar vantagem concedida de uma ficha a outra; agrupada com a origem na iniciativa",
        ],
        [
          "⬇️ Desvantagem",
          "Registrar desvantagem imposta; agrupada com a origem na iniciativa",
        ],
        [
          "📝 Outro",
          "Rótulo personalizado livre — você será solicitado a inserir uma descrição",
        ],
      ],
    },
    durationOptions: {
      heading: "Opções de duração",
      intro:
        "O contador restante é exibido na coluna pr do rastreador de turno e diminui quando o turno da ficha âncora termina.",
      colOption: "Opção",
      colBehaviour: "Comportamento",
      rows: [
        [
          "Até ser removido",
          "Permanente — deve ser removido manualmente pelo menu ou --remove",
        ],
        [
          "Fim do próximo turno do alvo",
          "Expira quando o próximo turno do alvo termina na iniciativa",
        ],
        [
          "Fim do próximo turno da origem",
          "Expira quando o próximo turno da origem termina na iniciativa",
        ],
        [
          "1 / 2 / 3 / 10 rodadas",
          "Contagem regressiva fixa; um decremento por cada fim de turno da âncora",
        ],
      ],
    },
    configuration: {
      heading: "Configuração",
      intro:
        "Use !condition-tracker --config &lt;opção&gt; &lt;valor&gt; ou o botão Configuração no menu principal.",
      colOption: "Opção",
      colValues: "Valores",
      colDesc: "Descrição",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Aplicar marcadores de status do Roll20 às fichas ao adicionar uma condição",
        ],
        [
          "useIcons",
          "true / false",
          "Exibir códigos de ícone curtos (ex. [G]) nas linhas do rastreador de turno",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Ignorar a etapa de sujeito opcional para efeitos Magia / Habilidade / Outro",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Barra a monitorar; quando chega a 0 o GM é solicitado a limpar as condições",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Idioma das mensagens de chat e do livreto de ajuda",
        ],
        [
          "marker",
          "&lt;Condição&gt;=&lt;nome do marcador&gt;",
          "Substituir o marcador usado para uma condição específica (ex. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Marcadores de status padrão",
      colCondition: "Condição",
      colMarker: "Nome do marcador",
    },
    availableLocales: {
      heading: "Traduções disponíveis",
      intro:
        "Use a opção de configuração language para definir as mensagens de chat e o livreto de ajuda em qualquer locale suportado. Aliases curtos também são aceitos para en, zh e pt.",
      colLocale: "Locale",
      colLanguage: "Idioma",
      colFile: "Arquivo de tradução",
    },
  },
};

export default TRANSLATION;
