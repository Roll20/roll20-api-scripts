const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "agarrado",
      verb: "agarra",
    },
    Restrained: {
      past: "restringido",
      verb: "restringe",
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
      past: "cego",
      verb: "cega",
    },
    Charmed: {
      past: "encantado",
      verb: "encanta",
    },
    Frightened: {
      past: "assustado",
      verb: "assusta",
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
      past: "afetado por um feitiço",
      verb: "lança um feitiço sobre",
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
      verb: "impõe desvantagem a",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Agarrado",
    Restrained: "Restringido",
    Prone: "Derrubado",
    Poisoned: "Envenenado",
    Stunned: "Atordoado",
    Blinded: "Cego",
    Charmed: "Encantado",
    Frightened: "Assustado",
    Incapacitated: "Incapacitado",
    Invisible: "Invisível",
    Paralyzed: "Paralisado",
    Petrified: "Petrificado",
    Unconscious: "Inconsciente",
    Spell: "Feitiço",
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
      custom: "{source} aplica {effect} a {target}.",
      advantage: "{source} tem vantagem contra {target}{subject}.",
      disadvantage: "{source} tem desvantagem contra {target}{subject}.",
      self: "{target} está {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} já não está afetado por {effect}.",
      advantage: "{source} já não tem vantagem contra {target}{subject}.",
      disadvantage: "{source} já não tem desvantagem contra {target}{subject}.",
      noBy: "{target} já não {past}.",
      self: "{target} já não está {past}.",
      standard: "{target} já não está {past} por {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Selecionar condição",
      selectSource: "Selecionar ficha de origem",
      selectTarget: "Selecionar ficha alvo",
      selectSubject: "Selecionar sujeito",
      selectDuration: "Selecionar duração",
      confirmTargetTitle: "Confirmar lista de alvos",
      applyEffectTitle: "Aplicar efeito {condition}",
      noTokens: "Não foram encontradas fichas com nome na página activa.",
      confirmIntro: "As seguintes fichas receberão a condição:",
      confirmBtn: "Confirmar lista de alvos",
      enterDetails: "Introduzir detalhes do efeito",
      noneBtn: "Nenhum",
      noneOrSourceBtn: "Nenhum ou aplicar à origem",
      subjectDesc: "Selecione quem ou o que aplica o efeito.",
      sourceDesc:
        "Selecione a criatura que cria ou gera a condição ou o efeito.",
      targetDesc:
        "Selecione a criatura que irá receber a condição ou o efeito.",
      otherText: "Texto de condição personalizado",
      effectDetails: "Detalhes de {condition}",
    },
    col: {
      players: "Jogadores",
      npcs: "PNJs",
      conditions: "Condições",
      customEffects: "Efeitos personalizados",
      permanentTurnEnd: "Permanente / Fim de turno",
      rounds: "Rondas",
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
      round1: "1 ronda",
      round2: "2 rondas",
      round3: "3 rondas",
      round10: "10 rondas",
      custom: "Personalizado",
      customPrompt: "Número de rondas",
      untilRemovedDisplay: "Até ser removido",
      turnsRemaining: "{n} fim(ns) de turno restante(s)",
    },
    btn: {
      openWizard: "Abrir assistente",
      openMultiTarget: "Abrir assistente multi-alvo",
      openRemovalList: "Abrir lista de remoção",
      showConfig: "Mostrar configuração",
      runCleanup: "Executar limpeza",
      reinstallMacro: "Reinstalar macro",
      reinstallHandout: "Reinstalar documento",
      showHelp: "Mostrar ajuda",
      reorderConditions: "Reordenar linhas de condições",
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
      handoutReinstalled: "Documento reinstalado",
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
      quickActions: "Acções rápidas",
      settings: "Definições",
      markerMappings: "Mapeamento de marcadores",
      result: "Resultado",
      info: "Informação",
      commandOptions: "Opções de comando",
      promptUi: "Interface do assistente",
      examples: "Exemplos",
      summary: "Resumo",
    },
    msg: {
      noActive: "Não há condições activas a ser rastreadas.",
      configReset: "Configuração reposta para os valores predefinidos.",
      unknownConfig:
        "Opção de configuração desconhecida. Utilize --config para ver as definições suportadas.",
      macroReinstalled:
        "As macros {wizard} e {multiTarget} foram reinstaladas para todos os mestres activos.",
      handoutReinstalled: "O documento de ajuda {handout} foi reinstalado.",
      duplicate:
        "Esta combinação exacta de origem, sujeito, alvo, condição e texto personalizado já está activa.",
      noTargets:
        "Não foram especificadas fichas alvo para a aplicação multi-alvo.",
      noSelection:
        "Seleccione pelo menos uma ficha no tabuleiro antes de utilizar --multi-target.",
      invalidIds:
        "Não foram encontrados IDs de ficha válidos na selecção actual.",
      reSelectTokens:
        "Nenhuma das fichas originalmente seleccionadas foi encontrada. Volte a seleccionar as fichas e tente novamente.",
      conditionNotFound: "ID de condição não encontrado.",
      gmOnly: "Os comandos do Condition Tracker são exclusivos do Mestre.",
      commandFailed:
        "O comando não pôde ser concluído com segurança. Consulte a consola da API para mais detalhes.",
      sourceTokenNotFound: "Ficha de origem não encontrada.",
      targetTokenNotFound: "Ficha alvo não encontrada.",
      subjectTokenNotFound: "Ficha do sujeito não encontrada.",
      invalidCondition:
        "A condição deve ser uma das condições predefinidas ou Outro.",
      subjectOnlyCustom:
        "--subject só é válido para Feitiço, Habilidade, Vantagem, Desvantagem e Outro.",
      subjectBypassInvalid:
        "--subjectPromptBypass espera true ou false quando um valor é fornecido.",
      customDetailsRequired:
        "São necessários detalhes de {condition}. Utilize --other para os fornecer.",
      markerConfigFormat:
        "O formato de configuração do marcador é: --config marker Grappled=grab",
      markerPredefinedRequired:
        "A configuração do marcador requer um nome de condição predefinido.",
      markerNameRequired:
        "A configuração do marcador requer um nome de marcador não vazio.",
      markerSet: "Marcador de {condition} definido para {marker}.",
      healthBarSet: "Barra de saúde definida para {bar}.",
      boolSet: "{key} definido para {value}.",
      expectedBoolean: "Esperado true ou false.",
      invalidHealthBar:
        "A barra de saúde deve ser bar1_value, bar2_value ou bar3_value.",
      markersDisabled: "Os marcadores estão desactivados.",
      noMarkerConfigured:
        "Não há nenhum marcador configurado para esta condição.",
      markerApplied: "Marcador aplicado: {marker}",
      markerPresent: "Marcador já presente: {marker}",
      langSet: "Idioma definido para {locale}.",
      invalidLocale:
        "Configuração regional inválida. Configurações regionais suportadas: {locales}.",
      otherDurationRequiresRounds:
        "A duração Outro requer um número de rondas, por exemplo --duration 5 rounds.",
      invalidDuration:
        "A duração deve ser Até ser removido, uma opção de fim de turno ou um número positivo de rondas.",
      zeroHpNoConditions: "{name} chegou a 0 PV e não tem condições activas.",
      zeroHpConditions: "{name} chegou a 0 PV. Escolha as condições a remover:",
      removeAllBtn: "Remover todas as condições de {name}",
      markIncapacitated: "Marcar como Incapacitado",
      removeFromTurnOrder: "Remover da ordem de iniciativa",
      alreadyIncapacitated: "{name} já está Incapacitado.",
      tokenRemovedFromTurn: "{name} foi removido da ordem de iniciativa.",
      tokenNotInTurn: "{name} não foi encontrado na ordem de iniciativa.",
      moveTokenPrompt:
        "Mover {name} para a camada do mapa para que permaneça visível sem interferir com outras fichas?",
      moveTokenBtn: "Mover {name} para a camada do mapa",
      tokenMoved: "{name} foi movido para a camada do mapa.",
      tokenNotFound: "Ficha não encontrada.",
      noActiveConditions: "{name} não tem condições activas para remover.",
      deadNoConditions:
        "{name} foi marcado como morto. Não havia condições activas.",
      scriptReady: "{name} está activo e está a utilizar a versão {version}.",
      reachedZeroHp: "{name} chegou a 0 PV",
      manuallyRemoved: "foi removida manualmente",
      durationExpired: "a sua duração expirou",
      markedAsDead: "{name} foi marcado como morto",
      conditionReorder:
        "A ordem de turno foi alterada e {count} linha(s) de condição rastreada(s) pode(m) estar fora do lugar. Clique abaixo para as restaurar após as fichas atribuídas.",
      conditionsReordered:
        "As linhas de condições foram reposicionadas após as fichas atribuídas.",
    },
    removal: {
      conditionField: "Condição",
      reasonField: "Motivo",
      turnRowField: "Linha do registo de turnos",
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
      orphanedRows: "Linhas órfãs do registo de turnos",
      unusedMarkers: "Marcadores não utilizados",
    },
    apply: {
      turnAppended:
        "O alvo não estava na ordem de iniciativa; a linha de condição foi adicionada no fim.",
      turnInserted: "Linha de condição inserida abaixo da ficha alvo.",
    },
  },
  handout: {
    versionLabel: "Versão",
    subtitle: "Gestor de efeitos de estado D&D 5e",
    footerNote:
      "Este documento é criado e actualizado automaticamente sempre que o script é carregado.",
    overview: {
      heading: "Visão geral",
      body: "O Condition Tracker gere as condições de estado de D&D 5e e os efeitos personalizados como linhas etiquetadas no Registo de Turnos do Roll20. Aplique condições a fichas, acompanhe as durações por ordem de iniciativa e remova automaticamente os efeitos expirados quando um turno termina. Todos os comandos são exclusivos do Mestre e podem ser activados a partir do chat ou através das macros instaladas.",
    },
    quickStart: {
      heading: "Início rápido",
      colCommand: "Comando",
      colDesc: "Descrição",
      rows: [
        [
          "!condition-tracker --prompt",
          "Assistente passo a passo — escolha condição, fichas e duração de forma interactiva. Disponível também como macro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Aplique uma condição a várias fichas simultaneamente. Disponível também como macro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Abra o menu principal de gestão com botões para aplicar, rever ou remover condições.",
        ],
      ],
    },
    commandsRef: {
      heading: "Referência de comandos",
      colFlag: "Opção",
      colDesc: "Descrição",
      rows: [
        ["--prompt", "Interface do assistente passo a passo"],
        [
          "--multi-target",
          "Aplicar uma condição a várias fichas alvo de uma vez",
        ],
        [
          "--menu",
          "Mostrar o menu principal (adicione remove para o menu de remoção)",
        ],
        [
          "--source X --target Y --condition Z",
          "Aplicar uma condição directamente sem o assistente",
        ],
        [
          "--duration &lt;valor&gt;",
          "Duração para uma aplicação directa (ex. 2 rounds)",
        ],
        [
          "--other &lt;texto&gt;",
          "Texto personalizado para os tipos de efeito Feitiço / Habilidade / Outro",
        ],
        [
          "--remove &lt;id-condição&gt;",
          "Remover uma condição específica pelo seu ID único",
        ],
        [
          "--config &lt;opção&gt; &lt;valor&gt;",
          "Ajustar as definições de configuração (consulte a secção Configuração)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Substituir subjectPromptBypass apenas para este comando (suporta também --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Reconciliar o estado — remover condições e linhas do registo de turnos órfãs",
        ],
        [
          "--reorder-conditions",
          "Reposicionar manualmente as linhas de condição a seguir aos tokens atribuídos na ordem de turnos",
        ],
        ["--reinstall-macro", "Recriar ou actualizar as macros do Mestre"],
        [
          "--reinstall-handout",
          "Recriar ou actualizar o documento de ajuda localizado",
        ],
        [
          "--lang &lt;locale&gt;",
          "Apresentar as mensagens deste comando numa configuração regional adicional (modo bilingue)",
        ],
        ["--help", "Mostrar um cartão de ajuda rápida no chat"],
      ],
    },
    standardConditions: {
      heading: "Condições padrão (D&amp;D 5e)",
      colCondition: "Condição",
    },
    customEffects: {
      heading: "Tipos de efeitos personalizados",
      colType: "Tipo",
      colNotes: "Notas",
      rows: [
        [
          "🔮 Feitiço",
          "Rastrear um efeito de feitiço com nome — ser-lhe-á pedido o nome do feitiço",
        ],
        [
          "🎯 Habilidade",
          "Rastrear uma habilidade de classe ou raça com nome — ser-lhe-á pedido o nome",
        ],
        [
          "🍀 Vantagem",
          "Registar uma vantagem concedida de uma ficha a outra; agrupada com a origem na iniciativa",
        ],
        [
          "⬇️ Desvantagem",
          "Registar uma desvantagem imposta; agrupada com a origem na iniciativa",
        ],
        [
          "📝 Outro",
          "Etiqueta personalizada livre — ser-lhe-á pedida uma descrição",
        ],
      ],
    },
    durationOptions: {
      heading: "Opções de duração",
      intro:
        "O contador restante é mostrado na coluna pr do Registo de Turnos e diminui quando o turno da ficha âncora termina.",
      colOption: "Opção",
      colBehaviour: "Comportamento",
      rows: [
        [
          "Até ser removido",
          "Permanente — deve ser removido manualmente através do menu ou --remove",
        ],
        [
          "Fim do próximo turno do alvo",
          "Expira quando o próximo turno da ficha alvo termina na iniciativa",
        ],
        [
          "Fim do próximo turno da origem",
          "Expira quando o próximo turno da ficha de origem termina na iniciativa",
        ],
        [
          "1 / 2 / 3 / 10 rondas",
          "Contagem decrescente fixa; um decréscimo por fim de turno da ficha âncora",
        ],
      ],
    },
    configuration: {
      heading: "Configuração",
      intro:
        "Utilize !condition-tracker --config &lt;opção&gt; &lt;valor&gt; ou o botão Configuração no menu principal.",
      colOption: "Opção",
      colValues: "Valores",
      colDesc: "Descrição",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Aplicar marcadores de estado Roll20 às fichas quando uma condição é adicionada",
        ],
        [
          "useIcons",
          "true / false",
          "Mostrar códigos de ícone curtos (ex. [G]) em vez de carinhas nas linhas do Registo de Turnos",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Ignorar o passo opcional da ficha sujeito para efeitos de Feitiço / Habilidade / Outro",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Barra da ficha a monitorizar; quando chega a 0 o Mestre é alertado para limpar as condições",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Idioma das mensagens do chat e do documento de ajuda",
        ],
        [
          "marker",
          "&lt;Condição&gt;=&lt;nome do marcador&gt;",
          "Substituir o marcador de estado utilizado para uma condição específica (ex. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Marcadores de estado predefinidos",
      colCondition: "Condição",
      colMarker: "Nome do marcador",
    },
    availableLocales: {
      heading: "Traduções disponíveis",
      intro:
        "Utilize a opção de configuração language para definir as mensagens do chat e o documento de ajuda para qualquer configuração regional suportada. Os aliases curtos também são aceites para en, zh e pt.",
      colLocale: "Locale",
      colLanguage: "Idioma",
      colFile: "Ficheiro de tradução",
    },
  },
};

export default TRANSLATION;
