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
      suffix: "propenso",
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
    Dazed: "Atordoado",
    Deafened: "Ensurdecido",
    Dominated: "Dominado",
    Dying: "Morte",
    Immobilized: "Imobilizado",
    Marked: "Marcado",
    Slowed: "Lento",
    Weakened: "Enfraquecido",
    Confused: "Confuso",
    Cowering: "Encolhendo-se",
    Dazzled: "Deslumbrado",
    Disabled: "Desativado",
    Exhausted: "Exausto",
    Fascinated: "Fascinado",
    Fatigued: "Fatigado",
    "Flat-Footed": "Pé chato",
    Helpless: "Indefeso",
    Nauseated: "Enjoado",
    Panicked: "Em pânico",
    Pinned: "Fixado",
    Shaken: "Abalado",
    Sickened: "Enjoado",
    Staggered: "Escalonado",
    Clumsy: "Desajeitado",
    Concealed: "Oculto",
    Controlled: "Controlado",
    Doomed: "Condenado",
    Drained: "Drenado",
    Encumbered: "Sobrecarregado",
    Enfeebled: "Enfraquecido",
    Fleeing: "Fugindo",
    Grabbed: "Agarrado",
    Hidden: "Oculto",
    "Off-Guard": "Desprevenido",
    Quickened: "Acelerado",
    Stupefied: "Estupefato",
    Undetected: "Não detetado",
    Wounded: "Ferido",
    Asleep: "Adormecido",
    Bleeding: "Sangramento",
    Burning: "Queimando",
    Dead: "Morto",
    "Off-Kilter": "Desequilibrado",
    "Off-Target": "Fora do alvo",
    Overburdened: "Sobrecarregado",
    Stable: "Estável",
    "Bleeding Out": "Sangrando",
    Bound: "Vinculado",
    Distracted: "Distraído",
    Berserk: "Furioso",
    "Indefinite Insanity": "Insanidade Indefinida",
    Injured: "Lesionado",
    Mania: "Mania",
    Phobia: "Fobia",
    "Seriously Wounded": "Gravemente ferido",
    "Temporary Insanity": "Insanidade Temporária",
    Ablaze: "Em chamas",
    Broken: "Partido",
    Surprised: "Surpreso",
    Bleed: "Sangrar",
    "Energy Drained": "Energia drenada",
    Entangled: "Emaranhado",
    Fear: "Medo",
    Hampered: "Prejudicado",
    "Ongoing Damage": "Danos Contínuos",
    Vulnerable: "Vulnerável",
    Diseased: "Doente",
    Held: "Agarrado",
    Compelled: "Compelido",
    Impaired: "Prejudicado",
    Panicking: "Em pânico",
    Disoriented: "Desorientado",
    Ensnared: "Enredado",
    Strained: "Tenso",
    Afraid: "Receio",
    Angry: "Zangado",
    Corrupted: "Corrompido",
    Harmed: "Prejudicado",
    Hungry: "Esfomeado",
    Infected: "Infetado",
    Isolated: "Isolado",
    "Blood Bound": "Sangue Vinculado",
    Entranced: "Em transe",
    Frenzied: "Frenético",
    Torpor: "Torpor",
    "Knocked Down": "Derrubado",
    Paradox: "Paradoxo",
    "Willpower Spent": "Força de vontade gasta",
    Bedlam: "Confusão",
    "Chimera-Touched": "Tocado pela Quimera",
    "Mortally Wounded": "Mortalmente ferido",
    Insane: "Louco",
    Debilitated: "Debilitado",
    Deprived: "Privado",
    Shocked: "Chocado",
    Intoxicated: "Intoxicado",
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
      item: "Artigo",
      removed: "Removido",
      details: "Detalhes",
      description: "Descrição",
      scenario: "Cenário",
      gameSystem: "Sistema de jogo",
      duration: "Duração",
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
      reinstallMacros: "Reinstalar macro",
      reinstallHandout: "Reinstalar documento",
      showHelp: "Mostrar ajuda",
      reorderConditions: "Reordenar linhas de condições",
      reportToken: "Reportar condições de token",
      savedEffects: "Efeitos salvos",
      addSavedEffect: "Adicionar efeito salvo",
      editSaved: "Editar",
      removeSaved: "Remover",
      promoteSaved: "Adicionar ao Rastreador de Turno",
      snoozeSaved: "Soneca",
      clearSnooze: "Limpar soneca",
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
      tokenReport: "Relatório de condição do token",
      savedEffects: "Efeitos salvos",
      savedAdd: "Adicionar efeito salvo",
      savedEdit: "Editar efeito salvo",
      savedRemoved: "Efeito salvo removido",
      savedPromoted: "Adicionar ao Rastreador de Turno",
      savedSnoozed: "Lembrete adiado",
      savedSnoozeCleared: "Soneca apagada",
      hiddenEffects: "Efeitos ocultos — {name}",
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
      appliedTo: "Condições aplicadas a",
      appliedBy: "Condições aplicadas por",
      savedEffectsFor: "Efeitos salvos para {name}",
      visibility: "Visibilidade",
      snoozeOptions: "Lembrete de soneca",
      promoteOptions: "Promover para Turn Tracker",
      editActions: "Editar ações",
    },
    msg: {
      noActive: "Não há condições activas a ser rastreadas.",
      configReset: "Configuração reposta para os valores predefinidos.",
      unknownConfig:
        "Opção de configuração desconhecida. Utilize --config para ver as definições suportadas.",
      macroReinstalled:
        "As macros {wizard}, {multiTarget}, {reportToken}, {saved} e {classify} foram reinstaladas para todos os mestres activos.",
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
      invalidGameSystem:
        "Sistema de jogo inválido. Utilize --config gameSystem &lt;id&gt;. Sistemas suportados:",
      gameSystemSet:
        "Sistema de jogo definido para {system}. Os marcadores foram redefinidos para os padrões do sistema.",
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
      noTokensSelectedReport:
        "Selecione pelo menos um token no quadro antes de usar --report-token.",
      noConditionsAppliedTo: "{name} não tem condições ativas aplicadas a ele.",
      noConditionsAppliedBy:
        "{name} não tem condições ativas aplicadas a outros.",
      noSavedEffects: "Nenhum efeito salvo armazenado para {name}.",
      noTokenSelectedSaved:
        "Selecione um token no quadro antes de usar --saved.",
      savedEffectAdded: "Efeito salvo adicionado para {name}.",
      savedEffectUpdated: "Efeito salvo atualizado.",
      savedEffectRemoved: "Efeito salvo removido.",
      savedEffectNotFound: "Efeito salvo não encontrado.",
      savedInvalidVisibility:
        "Visibilidade inválida. Use público, mascarado ou GM.",
      savedConditionRequired:
        "Condition type is required. Use --condition <type>.",
      savedPromotedPublic: "Efeito adicionado ao Turn Tracker como público.",
      savedPromotedMasked:
        "Efeito adicionado ao Turn Tracker como mascarado – os jogadores veem: {publicLabel}.",
      savedPromotedGm:
        "O efeito é apenas do GM – nenhuma linha do Turn Tracker será criada. O sistema de lembrete irá apresentá-lo quando esta ficha atingir o topo da ordem do turno.",
      savedSnoozed: "Lembrete adiado: {scope}.",
      savedSnoozeCleared: "A soneca foi apagada.",
      hiddenEffectsReminder: "Os efeitos ocultos estão ativos em {name}.",
      visibilityPublicHint: "rótulo completo visível para todos",
      visibilityMaskedHint: "rótulo vago mostrado aos jogadores",
      visibilityGmHint: "Apenas sussurro do GM, sem linha do Turn Tracker",
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
    saved: {
      visibility: {
        public: "Público",
        masked: "Mascarado",
        gm: "Apenas GM",
      },
      snooze: {
        thisTurn: "Esta vez",
        oneRound: "1 rodada",
        threeRounds: "3 rodadas",
        thisCombat: "Este combate",
        rounds: "{n} rodada(s)",
      },
      field: {
        gmLabel: "Etiqueta GM",
        publicLabel: "Etiqueta Pública",
        visibility: "Visibilidade",
        source: "Fonte",
        condition: "Doença",
      },
      prompt: {
        enterGmLabel: "Descrição completa do efeito (somente GM)",
        enterPublicLabel: "Rótulo vago mostrado aos jogadores",
      },
      snoozed: "cochilou",
    },
    classify: {
      title: "Classificação de Atores",
      showTitle: "Diagnóstico de Classificação",
      showHeading: "Detalhes de Classificação do Token",
      resultHeading: "Substituição Aplicada",
      noSelection:
        "Seleciona pelo menos um token no tabuleiro antes de usar --classify.",
      invalidType:
        "Tipo de classificação inválido: {type}. Usa pc, npc, ignored ou auto.",
      set: "{name} → {type} (âmbito: {scope})",
      cleared:
        "{name} substituição removida (âmbito: {scope}) — deteção automática restaurada.",
      setTokenFallback:
        "{name} → {type} (substituição de token — nenhuma ficha de personagem associada).",
      clearedTokenFallback:
        "{name} substituição de token removida — deteção automática restaurada.",
      fieldToken: "Símbolo",
      fieldType: "Classificação",
      fieldSource: "Fonte",
      fieldReason: "Motivo",
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
          "!condition tracker --prompt",
          "Assistente passo a passo — escolha condição, fichas e duração de forma interactiva. Disponível também como macro ConditionTrackerWizard.",
        ],
        [
          "!condition tracker --multi-target",
          "Aplique uma condição a várias fichas simultaneamente. Disponível também como macro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition tracker --report-token",
          "Selecione um ou mais tokens primeiro e, em seguida, execute este comando para obter um sussurro do GM listando todas as condições aplicadas a e por cada token selecionado. Também disponível como macro ConditionTrackerReportToken.",
        ],
        [
          "!condition-tracker --menu",
          "Abra o menu principal de gestão com botões para aplicar, rever ou remover condições.",
        ],
        [
          "!condition tracker --classify show",
          "Selecione primeiro um ou mais tokens e, em seguida, execute este comando para ver um sussurro de diagnóstico que mostra a classificação do ator, a fonte de deteção e o motivo de cada token. Utilize --classify pc|npc|ignored para substituir ou --classify auto para restaurar a deteção automática. Também disponível como macro ConditionTrackerClassify.",
        ],
        [
          "!condition tracker --menu",
          "Abra o menu principal de gestão com botões para aplicar, rever ou remover condições.",
        ],
      ],
    },
    commandsRef: {
      heading: "Referência de comandos",
      colFlag: "Opção",
      colDesc: "Descrição",
      rows: [
        ["--incitar", "Interface do assistente passo a passo"],
        [
          "--multi-alvo",
          "Aplicar uma condição a várias fichas alvo de uma vez",
        ],
        [
          "--menu",
          "Mostrar o menu principal (adicione remove para o menu de remoção)",
        ],
        [
          "--fonte X --alvo Y --condição Z",
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
          "--prompt --subjectPromptBypass verdadeiro|falso",
          "Substituir subjectPromptBypass apenas para este comando (suporta também --subject-prompt-bypass)",
        ],
        [
          "--limpar",
          "Reconciliar o estado — remover condições e linhas do registo de turnos órfãs",
        ],
        [
          "--reorder-condições",
          "Reposicionar manualmente as linhas de condição a seguir aos tokens atribuídos na ordem de turnos",
        ],
        ["--reinstalar-macro", "Recriar ou actualizar as macros do Mestre"],
        [
          "--reinstalar-apostila",
          "Recriar ou actualizar o documento de ajuda localizado",
        ],
        [
          "--report-token",
          "Sussurre um relatório de condição exclusivo do GM para cada ficha selecionada (condições aplicadas a ela e por ela)",
        ],
        [
          "--lang &lt;locale&gt;",
          "Apresentar as mensagens deste comando numa configuração regional adicional (modo bilingue)",
        ],
        [
          "--classify pc|npc|ignored",
          "Substituir o tipo de ator para os tokens selecionados — seleciona os tokens primeiro. O âmbito predefinido é o personagem (escreve o atributo ct_mod_actor_type); adiciona --scope token para armazenar no estado do script",
        ],
        [
          "--classify auto",
          "Remover a substituição do tipo de ator e restaurar a deteção automática para os tokens selecionados",
        ],
        [
          "--classify show",
          "Sussurrar um diagnóstico de classificação para cada token selecionado — mostra o tipo detetado, a fonte de deteção e o motivo",
        ],
        ["--help", "Mostrar um cartão de ajuda rápida no chat"],
        [
          "--saved sesta &lt;id&gt; --scope virar|rondas|combate --rounds &lt;n&gt;",
          "Adiar um lembrete de efeito guardado para o turno atual, N rondas ou este combate",
        ],
        [
          "--saved suspender-limpar &lt;id&gt;",
          "Limpar uma sesta ativa num efeito guardado",
        ],
        [
          "--lang &lt;locale&gt;",
          "Produza as mensagens deste comando numa localidade adicional (modo bilingue)",
        ],
        [
          "--classify pc|npc|ignorado",
          "Substitua o tipo de ator pelos tokens selecionados – selecione primeiro token(s). O âmbito por defeito é caractere (escreve o atributo ct_mod_actor_type); adicione o token --scope para guardar no estado de script",
        ],
        [
          "--classify automático",
          "Remova a substituição do tipo de ator e restaure a deteção automática dos tokens selecionados",
        ],
        [
          "--classify mostrar",
          "Sussurre um diagnóstico de classificação para cada token selecionado — mostra o tipo detetado, a fonte de deteção e o motivo",
        ],
        ["--help", "Mostrar um breve cartão de ajuda no chat"],
      ],
    },
    standardConditions: {
      heading: "Condições padrão (D&amp;D 5e)",
      colCondition: "Condição",
      none: "Nenhuma condição padrão definida para este sistema de jogo. Utilize o tipo de efeito personalizado Outro para efeitos de texto livre.",
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
    savedEffects: {
      heading: "Efeitos salvos",
      intro:
        "Os efeitos salvos permitem armazenar condições de longo prazo fora do Turn Tracker – maldições, doenças, venenos, debuffs ocultos e outras condições que não sejam de combate. Eles persistem no estado de script e podem ser opcionalmente copiados para o Turn Tracker quando o combate começa.",
      visibility: {
        heading: "Modos de visibilidade",
        rows: [
          [
            "público",
            "O rótulo completo do efeito é visível no Turn Tracker e no bate-papo público.",
          ],
          [
            "mascarado",
            "Um rótulo público vago é mostrado aos jogadores; detalhes completos são apenas para GM.",
          ],
          [
            "GM",
            "Nenhuma linha do Rastreador de Curva. Detalhes completos são armazenados no estado e sussurrados ao GM quando a ficha afetada atinge o topo da iniciativa.",
          ],
        ],
      },
      commands: {
        heading: "Comandos de efeitos salvos",
        intro:
          "Todos os comandos --saved são apenas do GM. Selecione um token antes de executar --saved ou --saved add.",
        rows: [
          [
            "!condition tracker --saved",
            "Veja os efeitos salvos para o token selecionado.",
          ],
          [
            "!condition-tracker --saved adicionar",
            "Inicie o assistente para adicionar efeitos salvos.",
          ],
          [
            "!condition-tracker --saved edit <id>",
            "Edite rótulos ou visibilidade de um efeito salvo existente.",
          ],
          [
            "!condition-tracker --saved remove <id>",
            "Remova permanentemente um efeito salvo.",
          ],
          [
            "!condition-tracker --saved promote <id> --visibility public|masked|gm",
            "Copie um efeito salvo no Turn Tracker (público ou mascarado) ou confirme se ele é rastreado apenas pelo GM.",
          ],
          [
            "!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>",
            "Adie um lembrete do GM para este turno, N rodadas ou este combate.",
          ],
          [
            "!condition-tracker --saved snooze-clear <id>",
            "Limpe uma soneca ativa para que os lembretes sejam retomados imediatamente.",
          ],
        ],
      },
      reminders: {
        heading: "Lembretes GM",
        body: "Quando uma ficha com efeitos salvos do GM ou mascarados chega ao topo do Turn Tracker, o GM recebe um sussurro listando os efeitos ocultos com botões de ação. Lembretes duplicados no mesmo turno são suprimidos. Use os botões Soneca para suprimir lembretes de um turno, de uma série de rodadas ou do restante do combate atual.",
      },
    },
    actorClassification: {
      heading: "Classificação de Atores",
      intro:
        "O Condition Tracker determina automaticamente se cada token é um PJ, PNJ ou objeto ignorado (alfinetes de mapa, cenário, moldes de magia). Tokens não associados são ignorados por predefinição. Usa --classify para substituir a deteção automática em qualquer token.",
      detectionOrder: {
        heading: "Ordem de Deteção",
        colStep: "Passo",
        colCheck: "Verificação",
        colResult: "Resultado",
        rows: [
          [
            "1",
            "Substituição de estado do token (--classify --scope token)",
            "pc/npc/ignorado",
          ],
          [
            "2",
            "Atributo ct_mod_actor_type do personagem (--classify --scope character)",
            "pc/npc/ignorado",
          ],
          ["3", "Token não associado — sem ficha de personagem", "ignorado"],
          [
            "4",
            "Adaptador do sistema de jogo (atributo npc / is_npc)",
            "computador/npc",
          ],
          [
            "5",
            "Análise de atributos NPC genéricos (npc, is_npc, npcflag, sheet_type, character_type)",
            "computador/npc",
          ],
          ["6", "Alternativa controlledby do personagem", "computador/npc"],
        ],
      },
      types: {
        heading: "Tipos de Classificação",
        colType: "Tipo",
        colMeaning: "Significado",
        rows: [
          [
            "computador",
            "Personagem jogador — sempre incluído como PJ no assistente e na deteção",
          ],
          ["NPC", "Personagem não jogador — sempre incluído como PNJ"],
          [
            "ignorado",
            "Nunca exibido ou rastreado — excluído do seletor de tokens do assistente",
          ],
          [
            "desconhecido",
            "Apenas deteção automática; tipo não pôde ser determinado (tratado como PNJ no assistente)",
          ],
        ],
      },
      commands: {
        heading: "Comandos de Classificação",
        intro:
          "Seleciona um ou mais tokens antes de executar os comandos --classify.",
        rows: [
          [
            "!condition tracker --classify pc",
            "Marcar os tokens selecionados como PJs (âmbito de personagem por predefinição).",
          ],
          [
            "!condition tracker --classify npc",
            "Marcar os tokens selecionados como PNJs.",
          ],
          [
            "!condition-tracker --classify ignorado",
            "Excluir os tokens selecionados de todo rastreamento.",
          ],
          [
            "!condition tracker --classify automático",
            "Remover a substituição — restaurar a deteção automática.",
          ],
          [
            "!condition-tracker --classify mostrar",
            "Mostrar o diagnóstico de classificação (tipo, fonte, motivo) para cada token selecionado.",
          ],
          [
            "!condition-tracker --classify pc --scope token",
            "Substituição ao nível do token no estado do script — útil para tokens não associados.",
          ],
          [
            "!condition-tracker --classify pc --scope caractere",
            "Substituição ao nível do personagem no atributo ct_mod_actor_type — aplica-se a todos os tokens com a mesma ficha de personagem.",
          ],
        ],
      },
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
          "verdadeiro/falso",
          "Mostrar códigos de ícone curtos (ex. [G]) em vez de carinhas nas linhas do Registo de Turnos",
        ],
        [
          "subjectPromptBypass",
          "verdadeiro/falso",
          "Ignorar o passo opcional da ficha sujeito para efeitos de Feitiço / Habilidade / Outro",
        ],
        [
          "suppressPublicChat",
          "verdadeiro/falso",
          "Suprimir todos os anúncios públicos no chat (mensagens de aplicação e remoção). Os sussurros do Mestre não são afetados.",
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
        [
          "marcador",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Substituir o marcador de estado utilizado para uma condição específica (por exemplo, marcador Grappled=grab)",
        ],
      ],
    },
    gameSystems: {
      heading: "Sistemas de jogos suportados",
      intro:
        "Utilize !condition-tracker --config gameSystem &lt;id&gt; para trocar de sistema. A troca redefine os mapeamentos de marcadores de token para os padrões do novo sistema. As suas condições ativas são preservadas.",
      colId: "ID do sistema",
      colName: "Sistema de jogo",
    },
    defaultMarkers: {
      heading: "Marcadores de estado predefinidos",
      colCondition: "Condição",
      colMarker: "Nome do marcador",
      none: "Não está definido nenhum marcador padrão para este sistema de jogo.",
    },
    availableLocales: {
      heading: "Traduções disponíveis",
      intro:
        "Utilize a opção de configuração language para definir as mensagens do chat e o documento de ajuda para qualquer configuração regional suportada. Os aliases curtos também são aceites para en, zh e pt.",
      colLocale: "Localidade",
      colLanguage: "Idioma",
      colFile: "Ficheiro de tradução",
    },
  },
};

export default TRANSLATION;
