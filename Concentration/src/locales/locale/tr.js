const TRANSLATION = {
  titles: {
    ready: 'Konsantrasyon hazır.',
    menu: 'Konsantrasyon Ayarları',
    help: 'Konsantrasyon Komutları',
    status: 'Kim Konsantre Oluyor',
    advantage: 'Konsantrasyon Tasarrufu Avantajı',
    reset: 'Konsantrasyonu Sıfırla',
    concentration: 'Konsantrasyon',
    save: 'Konsantrasyon Tasarrufu',
    check: 'Konsantrasyon Kontrolü',
  },
  messages: {
    migrated:
      '1.0 sürümünden yükseltildi. Ayarlarınız ve avantaj listeniz tutuldu ve eski makrolarınız hala çalışıyor.',
    reconciled:
      'Haritayı yakaladım: konsantre jetonlar bulundu {added}, eski girişler kaldırıldı {dropped}.',
    readyHint: 'Ayarlar için {command} yazın veya Command Deck broşürünü açın.',
    settingChanged: '{setting} artık {value} oldu.',
    confirmReset:
      'Her ayarı varsayılan ayarlarına döndürüp avantaj listesini temizlemek mi istiyorsunuz? Haritadaki konsantrasyon işaretleri kalıyor.',
    reset: 'Ayarlar varsayılan değerlerine geri döndürülür.',
    journal: 'Dinleyici notları yeniden oluşturuldu: {help} ve {deck}.',
  },
  notices: {
    started: '{name} şimdi {spell} üzerinde yoğunlaşıyor.',
    startedNoSpell: '{name} şimdi konsantre oluyor.',
    switched:
      '{name}, {old} üzerinde yoğunlaşmayı bırakıyor ve şimdi {spell} üzerinde yoğunlaşıyor.',
    switchedNoSpell: '{name} şimdi konsantre oluyor.',
    ended: '{name} artık {spell} üzerinde yoğunlaşmıyor.',
    endedNoSpell: '{name} artık konsantre değil.',
    lost: '{name}, {spell} üzerindeki konsantrasyonunu kaybediyor.',
    lostNoSpell: '{name} konsantrasyonunu kaybediyor.',
    kept: '{name}, {spell} üzerinde yoğunlaşmaya devam ediyor.',
    keptNoSpell: '{name} konsantre olmaya devam ediyor.',
    zeroHp: '{name} 0 can puanına düşer ve {spell} üzerindeki konsantrasyonunu kaybeder.',
    zeroHpNoSpell: '{name} 0 can puanına düşer ve konsantrasyonunu kaybeder.',
    checkNeeded: '{name} konsantre olmaya devam etmek için Anayasa kurtarıcı atışı yapmalı: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Değiştirici',
    roll: 'Rulo',
    advantageRoll: '{first} ve {second} (avantaj)',
    success: 'Başarı',
    failure: 'Arıza',
  },
  menu: {
    concentratingCount: 'Şimdi konsantre oluyorum: {count}',
    settings: 'Ayarlar',
    footer:
      'Buraya geri dönmek için {command} yazın. Her düğme aynı zamanda "{deck}" broşüründe de bulunmaktadır.',
  },
  status: {
    none: 'Kimse konsantre olmuyor.',
  },
  advantage: {
    intro:
      'Yuvarlanmada olarak ayarlanan karakterler, War Caster becerisinde olduğu gibi konsantrasyonlarını avantajlı bir şekilde kurtarır. Bu otomatik kaydetmeler için geçerlidir.',
    none: 'Bu oyunda karakter yok.',
  },
  buttons: {
    roll: 'Rulo',
    advantage: 'Avantaj',
    status: 'Durum',
    advantageMenu: 'Avantaj Menüsü',
    help: 'Yardım',
    reset: 'Sıfırla',
    confirmReset: 'Ayarları Sıfırla',
    end: 'Son',
    menu: 'Menü',
    concentrate: 'Şuna konsantre olun…',
    toggle: 'Değiştir',
    journal: 'Ödevleri Yeniden Oluştur',
  },
  prompts: {
    spell: 'Hecelemek',
  },
  values: {
    on: 'Açık',
    off: 'Kapalı',
    bar: 'Çubuk {bar}',
    unnamed: 'İsimsiz',
    sendTo: {
      everyone: 'Herkes',
      character: 'Karakter',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Temel',
      detailed: 'Ayrıntılı',
    },
  },
  settings: {
    language: {
      label: 'Dil',
      desc: 'Sohbet mesajlarının ve bildirilerin dili.',
    },
    command: {
      label: 'Emretmek',
      desc: '"!" olmadan sohbet komutu. Sürüm 1.0 makroları konsantrasyonu kullanır.',
    },
    statusmarker: {
      label: 'Durum İşaretleyicisi',
      desc: 'Konsantrasyonu gösteren belirteç işaretçisi. Özel jeton işaretleyicileri kullanılabilir.',
    },
    bar: {
      label: 'HP Çubuğu',
      desc: 'Can puanlarını tutan jeton çubuğu. Hasar görmesi, konsantrasyon tasarrufu gerektirir.',
    },
    send_reminder_to: {
      label: 'Hatırlatıcı Gönder',
      desc: 'Konsantrasyon mesajlarını kim görür ve kaydeder: herkes, GM veya karakterin oyuncuları (GM bir kopya alır).',
    },
    auto_add_concentration_marker: {
      label: 'Otomatik Bağlantı Ekle işaretleyici',
      desc: 'Bir sayfadan konsantrasyon büyüsü yapıldığında işaretçiyi ekleyin.',
      hint: 'D&D 5e 2014 (OGL) ve 2024 sayfaları.',
    },
    auto_roll_save: {
      label: 'Otomatik Rulo Kaydetme',
      desc: 'Konsantre jeton hasar alır almaz kurtarma işlemini gerçekleştirin. Kapalıyken hatırlatıcının Döndür ve Avantaj düğmeleri bulunur.',
    },
    show_roll_button: {
      label: 'Rulo Düğmesi',
      desc: 'Otomatik Rulo Kaydetme kapalıyken hatırlatıcıya Rulo ve Avantaj düğmelerini ekleyin.',
    },
    end_at_zero: {
      label: "0 HP'de son",
      desc: 'Bir jeton 0 can puanına düştüğünde, kaydetmeden konsantrasyonu sonlandırın.',
    },
    bonus_attribute: {
      label: 'Bonus Özelliği',
      desc: 'Konsantrasyon kayıtlarına eklenen sayfa özelliği. anayasa_save_mod, D&D 5e 2014 ve 2024 sayfalarında çalışır.',
    },
    debug: {
      label: 'Hata Ayıklama Modu',
      desc: 'Destek istekleri için yazım algılama ve API konsoluna kaydetme hakkında notlar yazın.',
    },
    support_mode: {
      label: 'Destek Modu',
      desc: 'Hata Ayıklama Modu ne kadar yazar: Temel (kısa) veya Ayrıntılı.',
    },
  },
  help: {
    menu: 'Hiçbir şey seçili değilken (GM): ayarları açın. Belirteçler seçiliyken: konsantrasyonu başlatın veya sonlandırın.',
    toggle:
      'Seçilen jetonlarla büyüye odaklanmaya başlayın. Değiştirilecek farklı bir büyüye isim verin; bitirmek için tekrar çalıştırın.',
    end: 'Seçilen tokenlar için konsantrasyonu sonlandırın.',
    status: 'Bitir düğmeleriyle kimin konsantre olduğunu listeleyin.',
    config: 'Bir ayarı değiştirin, örneğin config auto_roll_save|false.',
    advantageMenu: 'Rulo konsantrasyonunun hangi karakterleri avantajla kurtaracağını seçin.',
    toggleAdvantage: 'Bir karakter için avantajı açın veya kapatın.',
    roll: 'Bir hatırlatıcının Döndür veya Avantaj düğmesinden bir kaydetme yapın.',
    journal: 'Yardım ve Komut Paneli bildirilerini yeniden oluşturun.',
    reset: 'Her ayarı varsayılana geri döndürün.',
    help: 'Bu listeyi göster.',
    footer:
      'Talimatların tamamı "{help}" broşüründe yer almaktadır; düğmeler "{deck}" broşüründedir.',
    playerFooter: 'Önce jetonunuzu seçin.',
  },
  errors: {
    noSelection: 'Önce bir jeton seçin.',
    notYours: 'Yalnızca kontrol ettiğiniz tokenların konsantrasyonunu değiştirebilirsiniz.',
    gmOnly: 'Bu komutu yalnızca GM kullanabilir.',
    notConcentrating: 'Bu jeton yoğunlaşmıyor.',
    unknownSetting: '"{key}" adında bir ayar yoktur.',
    badSettingValue: '"{value}", {key} için geçerli bir değer değil.',
    rollExpired: 'Bu düğmenin süresi doldu.',
    unknownCharacter: 'O karakter artık yok.',
    internal: 'Bir şeyler ters gitti. API konsolu ayrıntılara sahiptir.',
  },
  hints: {
    noSelection: 'Tekerin jetonunu seçin ve ardından komutu tekrar çalıştırın.',
    rollExpired:
      'Düğmeler bir kez ve 10 dakika süreyle çalışır. Yenisini almak için jetona tekrar zarar verin.',
    unknownSetting: 'Ayarları görmek için hiçbir şey seçili değilken komutu yazın.',
  },
  warnings: {
    unknownMarker:
      '"{marker}" durum işaretçisi bu oyunun işaretçilerinden biri değil. Ayarlardan başka bir tane seçin.',
  },
  deck: {
    subtitle: 'Komut Güvertesi',
    selected: 'Seçilen Tokenlar',
    selectedDesc: 'Önce uygulayıcının jetonunu seçin.',
    table: 'Masa',
    tableDesc: 'Kimin konsantre olduğunu ve kurtarışlarında kimin avantajlı olduğunu görün.',
    tools: 'Aletler',
    toolsDesc: 'Ayarlar, komut listesi ve bildiriler.',
    footer: 'Talimatların tamamı "{help}" broşüründe yer almaktadır.',
  },
  handout: {
    versionLabel: 'Sürüm',
    subtitle: 'D&D 5e için konsantrasyon işaretleri, hatırlatıcılar ve kayıtlar',
    overview: {
      heading: 'Genel Bakış',
      body: 'Konsantrasyon kimin hangi büyüye konsantre olduğunu takip eder. Kullananın jetonunun üzerine bir işaret koyar, jeton hasar aldığında bir Anayasa tasarrufu atar (veya ister) ve konsantrasyonun ne zaman sona erdiğini masaya bildirir.',
    },
    quickStart: {
      heading: 'Hızlı başlangıç',
      steps: [
        'Büyücünün jetonunu seçin ve !concentration yazın ve ardından büyüyü yapın, örneğin !concentration Bless.',
        "Çubuk balonundaki jetonun can puanlarını değiştirin. DC 10'da bir kurtarma veya daha yüksekse hasarın yarısı alınır.",
        'Konsantrasyonu sonlandırmak için aynı komutu tekrar çalıştırın veya işaretçiyi çıkarın.',
        'Ayarları açmak için hiçbir şey seçili değilken !concentration yazın.',
      ],
    },
    concentrating: {
      heading: 'Konsantre olma',
      points: [
        'Farklı bir büyüyü adlandırmak, yeni bir konsantrasyon büyüsü yapmakta olduğu gibi konsantrasyonu ona değiştirir.',
        'İşaretçiyi bir jetonun üzerine elle koymak, büyü olmadan konsantrasyonu başlatır; onu çıkarmak veya jetonu silmek onu sona erdirir.',
        'Konsantre karakterin yeni bağlantılı jetonu işaretçiyi alır ve işaretçiyi taşıyan yapıştırılmış jeton izlenir.',
        'Bağlantılı can puanı çubuğu payı konsantrasyonuna sahip bir karakterin jetonları. Bir sayfadaki goblin paketi gibi bağlantısız jetonlar kendi başlarına yoğunlaşır.',
        'Hatırlatıcıyı Gönder aksi belirtilmediği sürece konsantrasyon başladığında, değiştiğinde veya sona erdiğinde herkes bir mesaj görür.',
      ],
    },
    saves: {
      heading: 'Konsantrasyon kaydeder',
      points: [
        "DC, DC 30'a kadar, hangisi daha yüksekse, alınan hasarın 10'u veya yarısı kadardır.",
        'Değiştirici, karakterin sayfasındaki Bonus Özelliğinden gelir; eksik bir değer 0 olarak sayılır.',
        'Otomatik Rulo Ruloları bir kerede kaydedin. Kapalı olduğunda, hatırlatıcının oyuncu veya GM için Roll ve Advantage düğmeleri bulunur.',
        "Başarısız bir kaydetme konsantrasyonu sona erdirir. 0 HP'de Son açıkken, 0 can puanına düşmek kaydetmeden sona erer.",
        "Avantaj Menüsü, War Caster'ın yaptığı gibi, otomatik kaydetmelerde karakter avantajı sağlar.",
      ],
    },
    automatic: {
      heading: 'Bir sayfadan yapılan büyüler',
      points: [
        'Otomatik Ekleme ile. İşaret açıkken, D&D 5e 2014 (OGL) veya 2024 sayfasından konsantrasyon büyüsü yapmak işaretleyiciyi ekler.',
        'Sunucunun görüntüledikleri sayfadaki jetonları işaretlenmiştir; hiçbiri yoksa, herhangi bir sayfadaki jetonlar vardır.',
        "Yalnızca GM'den, başka bir Moddan veya karakterin oyuncularından birinin kartları sayılır. Aynı büyüyü tekrar yapmak hiçbir şeyi değiştirmez.",
        'War Caster becerisi gibi metninde yalnızca konsantrasyondan bahseden bir D&D 2024 kartı, konsantrasyonu başlatabilir ancak hiçbir zaman bir büyünün yerini almaz.',
        'D&D 2024 sayfaları Experimental API sunucusuna ihtiyaç duyabilir. Bir büyünün neden algılandığını veya algılanmadığını görmek için Hata Ayıklama Modunu açın.',
      ],
    },
    players: {
      heading: 'Oyuncular',
      points: [
        'Oyuncular, kontrol ettikleri jetonlar için konsantrasyonu başlatabilir ve sonlandırabilir ve kendi kayıtlarında Roll ve Advantage düğmelerini kullanabilirler.',
        "Hatırlatma Gönderimi Karakter olarak ayarlandığında, mesajlar karakterin oyuncularına ve GM'ye fısıldanır.",
      ],
    },
    commands: {
      heading: 'Komutlar',
      intro: "ScriptCard'lar gibi diğer Modlar da bu komutları gönderebilir.",
      colCommand: 'Emretmek',
      colDesc: 'Ne işe yarar',
    },
    settings: {
      heading: 'Ayarlar',
      intro:
        'Ayarları, ayarlar kartındaki düğmelerle veya config <anahtar>|<değer> ile değiştirin. Bazıları Modun sayfasında da ayarlanabilir.',
      colKey: 'Anahtar',
      colName: 'İsim',
      colDesc: 'Ne işe yarar',
    },
    upgrading: {
      heading: "Sürüm 1.0'dan yükseltme",
      points: [
        'Ayarlar, avantaj listesi ve her komut çalışmaya devam ediyor.',
        'Mesajlarda artık konsantrasyonun ne zaman ve hangi büyüde biteceği belirtiliyor.',
        'Zaten işaretçiyi taşıyan jetonlar başlangıçta alınır.',
      ],
    },
    troubleshooting: {
      heading: 'Sorun giderme',
      points: [
        'Can puanları düştüğünde kaydetme yok: jetonda işaret bulunduğunu ve HP Çubuğunun değiştirdiğiniz çubuk olup olmadığını kontrol edin. API aracılığıyla diğer Modlar tarafından yapılan değişiklikler olayları artırmaz, dolayısıyla görülmezler.',
        "Değiştirici 0'dır: Bonus Niteliğini karakterin sayfasına göre kontrol edin.",
        'Sayfadan yapılan büyüler algılanmıyor: Hata Ayıklama Modunu açın, büyüyü tekrar yapın ve API konsolunu okuyun.',
        'İki karakter aynı adı paylaşır: algılama ilk eşleşmeyi kullanır. Karakterlere benzersiz adlar verin.',
      ],
    },
    languages: {
      heading: 'Diller',
      body: 'Konsantrasyon aşağıdaki dillere çevrilmiştir. Dil ayarına sahip birini seçin.',
      colCode: 'Kod',
      colName: 'Dil',
      colNative: 'Yerel ad',
    },
    credits: {
      heading: 'Kredi',
      original: 'Orijinal Mod:',
      maintainer: 'Tarafından sürdürülüyor',
      support: "Hataları ve fikirleri Roll20 Mod forumunda veya GitHub'da bildirin.",
    },
    footer: 'Her eyleme ilişkin düğmeler "{deck}" broşüründe yer almaktadır.',
  },
};

export default TRANSLATION;
