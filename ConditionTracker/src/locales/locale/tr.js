const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "yakalanmış",
      verb: "yakalar",
    },
    Restrained: {
      past: "kısıtlanmış",
      verb: "kısıtlar",
    },
    Prone: {
      past: "yere düşmüş",
      verb: "yere düşürür",
    },
    Poisoned: {
      past: "zehirlenmiş",
      verb: "zehirler",
    },
    Stunned: {
      past: "sersemlemiş",
      verb: "sersemletir",
    },
    Blinded: {
      past: "kör olmuş",
      verb: "kör eder",
    },
    Charmed: {
      past: "büyülenmiş",
      verb: "büyüler",
    },
    Frightened: {
      past: "korkmuş",
      verb: "korkutur",
    },
    Incapacitated: {
      past: "etkisiz",
      verb: "etkisiz hale getirir",
    },
    Invisible: {
      past: "görünmez",
      verb: "görünmez yapar",
    },
    Paralyzed: {
      past: "felç olmuş",
      verb: "felç eder",
    },
    Petrified: {
      past: "taşlaşmış",
      verb: "taşlaştırır",
    },
    Unconscious: {
      past: "bilinçsiz",
      verb: "bilinçsiz bırakır",
    },
    Spell: {
      past: "bir büyüden etkilenmiş",
      verb: "üzerine büyü yapar",
    },
    Ability: {
      past: "bir yetenekten etkilenmiş",
      verb: "üzerinde yetenek kullanır",
    },
    Advantage: {
      past: "avantajı var",
      verb: "avantaj verir",
      noBy: true,
    },
    Disadvantage: {
      past: "dezavantajı var",
      verb: "dezavantaj verir",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Yakalanmış",
    Restrained: "Kısıtlanmış",
    Prone: "Yerde",
    Poisoned: "Zehirlenmiş",
    Stunned: "Sersemlemiş",
    Blinded: "Kör",
    Charmed: "Büyülenmiş",
    Frightened: "Korkmuş",
    Incapacitated: "Etkisiz",
    Invisible: "Görünmez",
    Paralyzed: "Felç",
    Petrified: "Taşlaşmış",
    Unconscious: "Bilinçsiz",
    Spell: "Büyü",
    Ability: "Yetenek",
    Advantage: "Avantaj",
    Disadvantage: "Dezavantaj",
    Other: "Diğer",
  },
  templates: {
    display: {
      custom: "{emoji} {target} {effect} etkisi altında ({source})",
      advantage: "{emoji} {source}, {target}{subject} karşısında avantajlı",
      disadvantage:
        "{emoji} {source}, {target}{subject} karşısında dezavantajlı",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} {past}",
      standard: "{emoji} {target} {source} tarafından {past}",
    },
    apply: {
      custom: "{source}, {target} üzerine {effect} etkisi uygular.",
      advantage: "{source}, {target}{subject} karşısında avantajlıdır.",
      disadvantage: "{source}, {target}{subject} karşısında dezavantajlıdır.",
      self: "{target} {past}.",
      withSuffix: "{source} {target} {suffix} {verb}.",
      standard: "{source} {target} {verb}.",
    },
    remove: {
      custom: "{target} artık {effect} etkisi altında değil.",
      advantage: "{source} artık {target}{subject} karşısında avantajlı değil.",
      disadvantage:
        "{source} artık {target}{subject} karşısında dezavantajlı değil.",
      noBy: "{target} artık {past} değil.",
      self: "{target} artık {past} değil.",
      standard: "{target} artık {source} tarafından {past} değil.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Durum Seç",
      selectSource: "Kaynak Token Seç",
      selectTarget: "Hedef Token Seç",
      selectSubject: "Özne Seç",
      selectDuration: "Süre Seç",
      confirmTargetTitle: "Hedef Listesini Onayla",
      applyEffectTitle: "{condition} Etkisi Uygula",
      noTokens: "Aktif sayfada adlandırılmış token bulunamadı.",
      confirmIntro: "Aşağıdaki tokenlar durumu alacak:",
      confirmBtn: "Hedef listesini onayla",
      enterDetails: "Etki ayrıntılarını girin",
      noneBtn: "Hiçbiri",
      noneOrSourceBtn: "Hiçbiri veya kaynağa uygula",
      subjectDesc: "Etkiyi kimin veya neyin yarattığını seçin.",
      sourceDesc: "Durumu veya etkiyi oluşturan yaratığı seçin.",
      targetDesc: "Durumu veya etkiyi alacak yaratığı seçin.",
      otherText: "Özel durum metni",
      effectDetails: "{condition} ayrıntıları",
    },
    col: {
      players: "Oyuncular",
      npcs: "OYK'lar",
      conditions: "Durumlar",
      customEffects: "Özel Etkiler",
      permanentTurnEnd: "Kalıcı / Tur Sonu",
      rounds: "Turlar",
      command: "Komut",
      result: "Sonuç",
      field: "Alan",
      value: "Değer",
      option: "Seçenek",
      condition: "Durum",
      marker: "İşaretçi",
      item: "Öğe",
      removed: "Kaldırıldı",
      details: "Ayrıntılar",
      description: "Açıklama",
      scenario: "Senaryo",
    },
    dur: {
      untilRemoved: "Kaldırılana kadar",
      endOfTargetTurn: "Hedefin sonraki turunun sonu",
      endOfSourceTurn: "Kaynağın sonraki turunun sonu",
      round1: "1 tur",
      round2: "2 tur",
      round3: "3 tur",
      round10: "10 tur",
      custom: "Özel",
      customPrompt: "Tur sayısı",
      untilRemovedDisplay: "Kaldırılana kadar",
      turnsRemaining: "{n} tur sonu takibi kaldı",
    },
    btn: {
      openWizard: "Sihirbazı Aç",
      openMultiTarget: "Çoklu Hedef Sihirbazını Aç",
      openRemovalList: "Kaldırma Listesini Aç",
      showConfig: "Yapılandırmayı Göster",
      runCleanup: "Temizliği Çalıştır",
      reinstallMacro: "Makroyu Yeniden Yükle",
      reinstallHandout: "El İlanını Yeniden Yükle",
      showHelp: "Yardımı Göster",
      reorderConditions: "Durum Satırlarını Yeniden Sırala",
    },
    title: {
      menu: "Menü",
      removalMenu: "Condition Tracker — Kaldırma",
      config: "Yapılandırma",
      configTracker: "Condition Tracker yapılandırması",
      help: "Yardım",
      applied: "Uygulandı",
      removed: "Durum Kaldırıldı",
      cleanup: "Temizlik Tamamlandı",
      macroReinstalled: "Makro Yeniden Yüklendi",
      handoutReinstalled: "El İlanı Yeniden Yüklendi",
      warning: "Uyarı",
      error: "Hata",
      turnOrder: "Tur Sırası",
      noConditions: "Durum Yok",
      tokenMoved: "Token Taşındı",
      markedDead: "Ölü Olarak İşaretlendi",
      zeroHp: "{name} — 0 KP",
      moveToken: "{name} — Token Taşınsın mı?",
      scriptReady: "Betik Hazır",
      conditionReorder: "Tur Sırası Değişti",
    },
    heading: {
      quickActions: "Hızlı İşlemler",
      settings: "Ayarlar",
      markerMappings: "İşaretçi Eşlemeleri",
      result: "Sonuç",
      info: "Bilgi",
      commandOptions: "Komut Seçenekleri",
      promptUi: "Sihirbaz Arayüzü",
      examples: "Örnekler",
      summary: "Özet",
    },
    msg: {
      noActive: "Takip edilen aktif durum yok.",
      configReset: "Yapılandırma mod varsayılanlarına sıfırlandı.",
      unknownConfig:
        "Bilinmeyen yapılandırma seçeneği. Desteklenen ayarları görüntülemek için --config kullanın.",
      macroReinstalled:
        "{wizard} ve {multiTarget} makroları tüm mevcut GM oyuncuları için yeniden yüklendi.",
      handoutReinstalled: "Yardım el ilanı {handout} yeniden yüklendi.",
      duplicate: "Aynı kaynak, özne, hedef, durum ve özel metin zaten aktif.",
      noTargets: "Çoklu hedef uygulaması için hedef token belirtilmedi.",
      noSelection:
        "--multi-target kullanmadan önce tabloda en az bir token seçin.",
      invalidIds: "Mevcut seçimde geçerli token kimliği bulunamadı.",
      reSelectTokens:
        "Orijinal olarak seçilen tokenların hiçbiri bulunamadı. Tokenları yeniden seçip tekrar deneyin.",
      conditionNotFound: "Durum kimliği bulunamadı.",
      gmOnly: "Condition Tracker komutları yalnızca GM'e özeldir.",
      commandFailed:
        "Komut güvenli şekilde tamamlanamadı. Ayrıntılar için API konsolunu kontrol edin.",
      sourceTokenNotFound: "Kaynak token bulunamadı.",
      targetTokenNotFound: "Hedef token bulunamadı.",
      subjectTokenNotFound: "Özne token bulunamadı.",
      invalidCondition:
        "Durum, önceden tanımlanmış durumlardan biri veya Diğer olmalıdır.",
      subjectOnlyCustom:
        "--subject yalnızca Büyü, Yetenek, Avantaj, Dezavantaj ve Diğer için geçerlidir.",
      subjectBypassInvalid:
        "--subjectPromptBypass, bir değer sağlandığında true veya false bekler.",
      customDetailsRequired:
        "{condition} ayrıntıları gereklidir. Bunları sağlamak için --other kullanın.",
      markerConfigFormat:
        "İşaretçi yapılandırma biçimi: --config marker Grappled=grab",
      markerPredefinedRequired:
        "İşaretçi yapılandırması önceden tanımlanmış bir durum adı gerektirir.",
      markerNameRequired:
        "İşaretçi yapılandırması boş olmayan bir işaretçi adı gerektirir.",
      markerSet: "{condition} işaretçisi {marker} olarak ayarlandı.",
      healthBarSet: "Sağlık çubuğu {bar} olarak ayarlandı.",
      boolSet: "{key}, {value} olarak ayarlandı.",
      expectedBoolean: "true veya false bekleniyor.",
      invalidHealthBar:
        "Sağlık çubuğu bar1_value, bar2_value veya bar3_value olmalıdır.",
      markersDisabled: "İşaretçiler devre dışı.",
      noMarkerConfigured: "Bu durum için yapılandırılmış işaretçi yok.",
      markerApplied: "İşaretçi uygulandı: {marker}",
      markerPresent: "İşaretçi zaten mevcut: {marker}",
      langSet: "Dil {locale} olarak ayarlandı.",
      invalidLocale:
        "Geçersiz yerel ayar. Desteklenen yerel ayarlar: {locales}.",
      otherDurationRequiresRounds:
        "Diğer süre, sayısal bir tur sayısı gerektirir; örneğin --duration 5 rounds.",
      invalidDuration:
        "Süre; Kaldırılana kadar, bir tur sonu seçeneği veya pozitif bir tur sayısı olmalıdır.",
      zeroHpNoConditions: "{name} 0 KP'ye ulaştı ve aktif durumu yok.",
      zeroHpConditions: "{name} 0 KP'ye ulaştı. Kaldırılacak durumları seçin:",
      removeAllBtn: "{name} için Tüm Durumları Kaldır",
      markIncapacitated: "Etkisiz Olarak İşaretle",
      removeFromTurnOrder: "Tur Sırasından Kaldır",
      alreadyIncapacitated: "{name} zaten Etkisiz.",
      tokenRemovedFromTurn: "{name} tur sırasından kaldırıldı.",
      tokenNotInTurn: "{name} tur sırasında bulunamadı.",
      moveTokenPrompt:
        "{name} görünür kalması ancak diğer tokenlara engel olmaması için harita katmanına taşınsın mı?",
      moveTokenBtn: "{name} Harita Katmanına Taşı",
      tokenMoved: "{name} harita katmanına taşındı.",
      tokenNotFound: "Token bulunamadı.",
      noActiveConditions: "{name} kaldırılacak aktif durumu yok.",
      deadNoConditions: "{name} ölü olarak işaretlendi. Aktif durum yoktu.",
      scriptReady: "{name} aktif ve {version} sürümünü kullanıyorsunuz.",
      reachedZeroHp: "{name} 0 KP'ye ulaştı",
      manuallyRemoved: "manuel olarak kaldırıldı",
      durationExpired: "süresi doldu",
      markedAsDead: "{name} ölü olarak işaretlendi",
      conditionReorder:
        "Tur sırası değişti ve {count} takip edilen durum satırı artık yanlış yerde olabilir. Bunları atanmış tokenlarının arkasına taşımak için aşağıya tıklayın.",
      conditionsReordered:
        "Durum satırları atanmış tokenlarının arkasına yeniden konumlandırıldı.",
    },
    removal: {
      conditionField: "Durum",
      reasonField: "Neden",
      turnRowField: "Tur Takibi satırı",
      markerField: "İşaretçi",
      notConfigured: "Yapılandırılmamış",
      markerRemoved: "Kaldırıldı ({marker})",
      markerRetained: "Tutuldu ({marker})",
      rowRemoved: "Kaldırıldı",
      rowMissing: "Zaten eksik",
      manualReason: "Manuel kaldırma",
    },
    cleanup: {
      orphaned: "Sahipsiz durum girişleri",
      stale: "Eski durum girişleri",
      orphanedRows: "Sahipsiz Tur Takibi satırları",
      unusedMarkers: "Kullanılmayan işaretçiler",
    },
    apply: {
      turnAppended: "Hedef tur sırasında değildi; durum satırı sona eklendi.",
      turnInserted: "Durum satırı hedef tokenın altına eklendi.",
    },
  },
  handout: {
    versionLabel: "Sürüm",
    subtitle: "D&D 5e Durum Etkisi Yöneticisi",
    footerNote:
      "Bu el ilanı, betik her yüklendiğinde otomatik olarak oluşturulur ve güncellenir.",
    overview: {
      heading: "Genel Bakış",
      body: "Condition Tracker, D&D 5e durum koşullarını ve özel efektleri Roll20 Tur Takibinde etiketli satırlar olarak yönetir. Tokenlara durum uygulayın, süreleri inisiyatif sırasına göre takip edin ve tur sona erdiğinde süresi dolan efektleri otomatik olarak kaldırın. Tüm komutlar yalnızca GM'e özeldir ve sohbetten veya yüklü makrolar aracılığıyla tetiklenebilir.",
    },
    quickStart: {
      heading: "Hızlı Başlangıç",
      colCommand: "Komut",
      colDesc: "Açıklama",
      rows: [
        [
          "!condition-tracker --prompt",
          "Adım adım sihirbaz — durumu, tokenleri ve süreyi etkileşimli olarak seçin. ConditionTrackerWizard makrosu olarak da kullanılabilir.",
        ],
        [
          "!condition-tracker --multi-target",
          "Bir durumu aynı anda birden fazla tokena uygulayın. ConditionTrackerMultiTarget makrosu olarak da kullanılabilir.",
        ],
        [
          "!condition-tracker --menu",
          "Durum uygulamak, incelemek veya kaldırmak için düğmeler içeren ana yönetim menüsünü açın.",
        ],
      ],
    },
    commandsRef: {
      heading: "Komut Referansı",
      colFlag: "Bayrak",
      colDesc: "Açıklama",
      rows: [
        ["--prompt", "Etkileşimli adım adım sihirbaz arayüzü"],
        [
          "--multi-target",
          "Bir durumu aynı anda birden fazla hedef tokena uygula",
        ],
        ["--menu", "Ana menüyü göster (kaldırma menüsü için remove ekle)"],
        [
          "--source X --target Y --condition Z",
          "Sihirbaz olmadan doğrudan durum uygula",
        ],
        [
          "--duration &lt;değer&gt;",
          "Doğrudan uygulama için süre (örn. 2 rounds)",
        ],
        [
          "--other &lt;metin&gt;",
          "Büyü / Yetenek / Diğer etki türleri için özel metin",
        ],
        [
          "--remove &lt;durum-kimliği&gt;",
          "Belirli bir durumu benzersiz kimliğiyle kaldır",
        ],
        [
          "--config &lt;seçenek&gt; &lt;değer&gt;",
          "Yapılandırma ayarlarını düzenle (aşağıdaki Yapılandırma bölümüne bakın)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Bu komut için subjectPromptBypass'ı geçersiz kıl (--subject-prompt-bypass da desteklenir)",
        ],
        [
          "--cleanup",
          "Durumu uzlaştır — sahipsiz koşulları ve Tur Takibi satırlarını kaldır",
        ],
        [
          "--reorder-conditions",
          "Tur sırasındaki koşul satırlarını atanmış tokenlarının arkasına manuel olarak yeniden konumlandır",
        ],
        ["--reinstall-macro", "GM makrolarını yeniden oluştur veya güncelle"],
        [
          "--reinstall-handout",
          "Yerelleştirilmiş yardım el ilanını yeniden oluştur veya güncelle",
        ],
        [
          "--lang &lt;yerel ayar&gt;",
          "Bu komutun mesajlarını ek bir yerel ayarda çıkart (iki dilli mod)",
        ],
        ["--help", "Sohbette kısa bir yardım kartı göster"],
      ],
    },
    standardConditions: {
      heading: "Standart Durumlar (D&amp;D 5e)",
      colCondition: "Durum",
    },
    customEffects: {
      heading: "Özel Efekt Türleri",
      colType: "Tür",
      colNotes: "Notlar",
      rows: [
        [
          "🔮 Büyü",
          "Adlandırılmış bir büyü etkisini takip edin — büyü adı sorulacak",
        ],
        [
          "🎯 Yetenek",
          "Adlandırılmış bir sınıf veya ırk yeteneğini takip edin — yetenek adı sorulacak",
        ],
        [
          "🍀 Avantaj",
          "Bir tokenden diğerine verilen avantajı kaydedin; inisiyatifte kaynakla gruplandırılır",
        ],
        [
          "⬇️ Dezavantaj",
          "Uygulanan dezavantajı kaydedin; inisiyatifte kaynakla gruplandırılır",
        ],
        ["📝 Diğer", "Serbest biçimli özel etiket — bir açıklama sorulacak"],
      ],
    },
    durationOptions: {
      heading: "Süre Seçenekleri",
      intro:
        "Kalan sayı, Tur Takibinin pr sütununda gösterilir ve çapa tokenının turu sona erdiğinde azalır.",
      colOption: "Seçenek",
      colBehaviour: "Davranış",
      rows: [
        [
          "Kaldırılana kadar",
          "Kalıcı — menü veya --remove aracılığıyla manuel olarak kaldırılmalıdır",
        ],
        [
          "Hedefin sonraki turunun sonu",
          "Hedef tokenın inisiyatifteki sonraki turu sona erdiğinde sona erer",
        ],
        [
          "Kaynağın sonraki turunun sonu",
          "Kaynak tokenın inisiyatifteki sonraki turu sona erdiğinde sona erer",
        ],
        [
          "1 / 2 / 3 / 10 tur",
          "Sabit geri sayım; çapa token tur sonunda bir azalma",
        ],
      ],
    },
    configuration: {
      heading: "Yapılandırma",
      intro:
        "!condition-tracker --config &lt;seçenek&gt; &lt;değer&gt; veya ana menüdeki Yapılandırma düğmesini kullanın.",
      colOption: "Seçenek",
      colValues: "Değerler",
      colDesc: "Açıklama",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Bir durum eklendiğinde tokenlara Roll20 durum işaretçileri uygula",
        ],
        [
          "useIcons",
          "true / false",
          "Tur Takibi satırlarında emoji yerine kısa simge kodları göster (örn. [G])",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Büyü / Yetenek / Diğer efektler için isteğe bağlı özne-token adımını atla",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "İzlenecek token çubuğu; 0'a düştüğünde GM'den durumları temizlemesi istenir",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Sohbet mesajları ve yardım el ilanı için çıktı dili",
        ],
        [
          "marker",
          "&lt;Durum&gt;=&lt;işaretçi adı&gt;",
          "Belirli bir durum için kullanılan durum işaretçisini geçersiz kıl (örn. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Varsayılan Durum İşaretçileri",
      colCondition: "Durum",
      colMarker: "İşaretçi Adı",
    },
    availableLocales: {
      heading: "Mevcut Çeviriler",
      intro:
        "Sohbet mesajlarını ve yardım el ilanını desteklenen herhangi bir yerel ayara ayarlamak için language yapılandırma seçeneğini kullanın. en, zh ve pt için kısa takma adlar da kabul edilir.",
      colLocale: "Yerel Ayar",
      colLanguage: "Dil",
      colFile: "Çeviri Dosyası",
    },
  },
};

export default TRANSLATION;
