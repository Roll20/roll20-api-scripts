const TRANSLATION = {
  titles: {
    ready: 'Hexploration hazır.',
    settings: 'Hexploration Ayarları',
    languages: 'Bir Dil Seçin',
    pageSettings: 'Sayfa Ayarları: {page}',
    status: 'Hexploration Durumu: {page}',
    help: 'Hexploration Komutları',
    confirm: 'Lütfen Onaylayın',
  },
  discovery: {
    title: 'Konum Keşfedildi',
  },
  menu: {
    draw: 'Çizim',
    reveal: 'Açığa Çıkarma ve Gizleme',
    locations: 'Konumlar',
    tools: 'Araçlar',
    layerInUse: 'Yeni altıgenler şu katmana çiziliyor: {layer}.',
    pageSettingsHelp:
      'Bu ayarlar yalnızca bu sayfa için geçerlidir. ★ işaretli ayarlar genel ayarları geçersiz kılar.',
  },
  buttons: {
    fill: 'Doldur',
    fillInverse: 'Ters Doldur',
    undo: 'Doldurmayı Geri Al',
    reveal: 'Açığa Çıkar',
    conceal: 'Gizle',
    explore: 'Keşfet',
    revealPage: 'Sayfayı Açığa Çıkar',
    resetPage: 'Sayfayı Sıfırla',
    mark: 'Konumu İşaretle',
    unmark: 'İşareti Kaldır',
    name: 'Altıgeni Adlandır',
    settings: 'Ayarlar',
    pageSettings: 'Sayfa Ayarları',
    status: 'Durum',
    rescan: 'Yeniden Tara',
    calibrate: 'Kalibre Et',
    calibrateReset: 'Kalibrasyonu Sıfırla',
    help: 'Yardım',
    change: 'Değiştir',
    menu: 'Menü',
    clearOverrides: 'Geçersiz Kılmaları Temizle',
    confirmReset: 'Evet, Tüm Altıgenleri Kaldır',
  },
  prompts: {
    name: 'Konum adı (temizlemek için boş bırakın)',
  },
  values: {
    on: 'Açık',
    off: 'Kapalı',
    none: 'Hiçbiri',
    hexLayer: {
      auto: 'Otomatik (varsa ön plan)',
      foreground: 'ön plan katmanı',
      objects: 'jeton katmanı',
    },
    revealBy: {
      players: 'Oyuncu jetonları',
      characters: 'Karakter jetonları',
      all: 'Tüm jetonlar',
    },
    revealMode: {
      clear: 'Temizleme',
      glimpse: 'Bakış',
    },
    announce: {
      all: 'Herkes',
      gm: 'Yalnızca GM',
      off: 'Kapalı',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Doldurma',
      fillInverse: 'Ters Doldurma',
      conceal: 'Gizleme',
    },
  },
  settings: {
    language: {
      label: 'Dil',
      desc: 'Menüler, mesajlar ve broşürler için dil.',
    },
    hexLayer: {
      label: 'Altıgen Katmanı',
      desc: 'Yeni altıgenlerin çizildiği yer. Otomatik, ön plan katmanını (jetonların üstünde) dener; oyun bunu desteklemiyorsa jeton katmanına geri döner.',
    },
    fillColor: {
      label: 'Dolgu Rengi',
      desc: 'Yeni altıgenlerin rengi. Şeffaf altıgenler için rgba() kullanın; örneğin rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Kenarlık Rengi',
      desc: 'Yeni altıgenlerin ana hatlarının rengi.',
    },
    labelColor: {
      label: 'Etiket Rengi',
      desc: 'Adlandırılmış altıgenlerdeki yalnızca GM ad etiketlerinin rengi.',
    },
    glimpseColor: {
      label: 'Bakış Rengi',
      desc: 'Altıgenlerin Bakış modunda aldığı renk. Yarı saydam bir rgba() rengi kullanın.',
    },
    strokeWidth: {
      label: 'Kenarlık Kalınlığı',
      desc: 'Yeni altıgenlerin ana hattının genişliği, piksel cinsinden (0 ila 20).',
    },
    maxDistance: {
      label: 'Altıgen Açığa Çıkarma Mesafesi',
      desc: 'Altıgenlere çizilirken uygulanır: Bir jetonun, görebildiği kadar uzağı ortaya çıkarabilmesi için bu sayıda altıgen içinde olması gerekir. Sınırsız olarak boş bırakın.',
    },
    revealDistance: {
      label: 'Görüş Mesafesi',
      desc: 'Hareket eden bir jetonun etrafındaki kaç tane altıgen ortaya çıkar (0 ila 20). 0 yalnızca belirtecin geçtiği altıgenleri ortaya çıkarır.',
    },
    lineOfSight: {
      label: 'Görüş Hattı',
      desc: 'Açıkken, bir altıgen yalnızca onunla belirteç arasında örtülü bir altıgen bulunmadığında ortaya çıkar.',
    },
    revealPath: {
      label: 'Yol Boyunca Açığa Çıkar',
      desc: 'Açık olduğunda, bir jetonun sürüklenirken geçtiği her altıgen (ara noktalar dahil) yalnızca durduğu yer değil, ortaya çıkar.',
    },
    revealBy: {
      label: 'Açığa Çıkaran Jetonlar',
      desc: 'Jeton katmanındaki hangi jetonlar altıgenleri ortaya çıkarır: bir oyuncu tarafından kontrol edilen jetonlar, herhangi bir karakteri temsil eden jetonlar veya her jeton.',
    },
    revealMode: {
      label: 'Açığa Çıkarma Modu',
      desc: 'Temizleme, görüş alanındaki altıgenleri kaldırır. Bakış ise onları yarı saydam yapar; içlerine bir jeton girdiğinde kaldırılırlar.',
    },
    announce: {
      label: 'Keşifleri Duyur',
      desc: 'Adlandırılmış bir konum keşfedildiğinde sohbet mesajını kimler görür?',
    },
    pingDiscoveries: {
      label: 'Keşifleri Pingle',
      desc: 'Açık olduğunda, oyuncular keşfedildiklerinde adlandırılmış bir konuma ping atılır.',
    },
    hideCoveredTokens: {
      label: 'Örtülü Jetonları Gizle',
      desc: 'Roll20 altıgenlerin üzerine isimleri, çubukları ve auraları çizer. Açıkken, kapalı bir altıgen altındaki jetonların oyuncuların görebileceği adları vardır, çubuklar ve auralar kapatılır ve açığa çıktıklarında tekrar açılır.',
    },
  },
  status: {
    engine: 'Oyun motoru',
    grid: 'Izgara',
    layer: 'Altıgen katmanı',
    hexes: 'Altıgenler',
    named: 'Adlandırılmış altıgenler',
    icons: 'Konum jetonları',
    glimpsed: 'Bakış altındaki altıgenler',
    pending: 'Doldurma bekleyen konumlar',
    calibrated: 'Kalibre edildi',
    overrides: 'Sayfa geçersiz kılmaları',
    undo: 'Geri alma mevcut',
  },
  messages: {
    filled:
      'Doldurma tamamlandı. Çizilen altıgenler: {created}. Yeniden stil: {restyled}. Gizlenen konumlar: {icons}.',
    revealed: 'Büyüler ortaya çıktı: {count}.',
    revealedPage: 'Sayfadaki her altıgen ortaya çıktı ({count}).',
    confirmReset:
      '"{page}" ({count}) öğesindeki her altıgen kaldırılsın mı? Konum belirteçleri, belirteç katmanına geri döner. Geri alma işlemi bunu tersine çeviremez.',
    resetPage: 'Sayfadan kaldırılan altıgenler: {count}.',
    undone:
      'Son doldurma geri alındı. Kaldırılan altıgenler: {removed}. Yeniden biçimlendirilen altıgenler geri yüklendi: {restored}.',
    named: '"{name}" adlı altıgenler: {count}.',
    unnamed: 'İsimler temizlendi: {count}.',
    marked:
      'Mevcut altıgenlerde gizli konumlar: {attached}. Bunları kapsayan bir sonraki dolgu bekleniyor: {pending}.',
    unmarked: 'Artık konum olmayan jetonlar: {count}.',
    settingChanged: '{setting}, {value} olarak ayarlandı.',
    rescanned:
      'Yeniden tarama tamamlandı. Tutulan: {kept}. Kabul edildi: {adopted}. Yeniden dosyalandı: {moved}. Eksik ve unutulmuş: {dropped}. Etiketler yeniden bağlandı: {labels}. Konum jetonları yeniden bağlandı: {icons}.',
    calibrated:
      'Izgara kalibre edildi (sütun adımı {colStep}px, satır adımı {rowStep}px). Yeniden tarama: {kept} tutuldu, {moved} yeniden dosyalandı, {adopted} kabul edildi.',
    calibrationReset:
      'Kalibrasyon kaldırıldı. Yeniden tarama: {kept} tutuldu, {moved} yeniden dosyalandı, {adopted} kabul edildi.',
    journalRebuilt: '"{help}" ve "{deck}" broşürleri yeniden oluşturuldu.',
    migrated:
      "Hexploration 1.x altıgen haritalarınız yükseltildi. Bu oyun bir Legacy oyunundan kopyalandıysa, her altıgen harita sayfasında Yeniden Tara'yı çalıştırın.",
    pruned:
      "Artık var olmayan ve unutulan kayıtlı altıgenler: {dropped}. Bu oyun veya sayfa kopyalandıysa, altıgenlerini yeniden bulmak için sayfada Yeniden Tara'yı çalıştırın.",
    readyHint: 'Menü için !hexploration yazın veya "Hexploration - Command Deck" broşürünü açın.',
  },
  warnings: {
    foregroundUnavailable:
      'Bu oyun ön plan katmanında çizimi desteklemediğinden, simge katmanına altıgenler çizildi.',
    someFailed: 'Çizilemeyen altıgenler: {count}. Ayrıntılar için API konsolunu kontrol edin.',
  },
  errors: {
    noPage: 'Üzerinde çalışılacak sayfa bulunamadı.',
    notHex: 'Bu sayfada altıgen ızgara kullanılmamaktadır.',
    noPolygons: 'Doldurulacak bir veya daha fazla çizilmiş şekli seçin.',
    emptyArea: 'Seçilen alan herhangi bir altıgen merkez içermiyor.',
    tooMany: 'Bu, tek seferde çok fazla altıgen oluşturacaktır ({count}).',
    nothingToConceal: 'Gizlenecek çizilmiş şekilleri veya simgeleri seçin.',
    nothingToReveal: 'Ortaya çıkarmak için altıgenleri, çizilmiş şekilleri veya jetonları seçin.',
    noTokens: 'Önce bir veya daha fazla jeton seçin.',
    noHexes: 'Önce bir veya daha fazla altıgen (veya altıgenlerin üzerinde duran jetonlar) seçin.',
    nothingToUndo: 'Geri alınacak bir dolgu yok.',
    unknownCommand: 'Bilinmeyen komut: {command}',
    unknownSetting: 'Bilinmeyen ayar: {key}',
    unknownPageSetting: 'Sayfa başına ayarlanabilen ayarlar: {keys}',
    invalidValue: '"{value}", {key} için geçerli bir değer değil.',
    calibrateNeedsTokens: 'Altıgen merkezlere tutturulmuş bir veya iki jeton seçin.',
    calibrateFailed: 'Bu jetonlar kalibrasyon için kullanılamaz.',
    unexpected: 'Bir şeyler ters gitti: {message}',
  },
  hints: {
    noPage: 'Üzerinde çalışmak istediğiniz sayfayı açın veya üzerinde bir şey seçin.',
    notHex: "Sayfa Ayarları'nda sayfa ızgarasını Hex (V) veya Hex (H) olarak ayarlayın.",
    noPolygons:
      'Alanın çevresine çokgen, dikdörtgen, elips veya serbest şekil çizin, seçin ve tekrar deneyin.',
    emptyArea: 'Daha büyük bir şekil çizin veya sayfa ızgarası ayarlarını kontrol edin.',
    tooMany: 'Daha küçük bir alanı doldurun veya alanı birkaç şekle bölün.',
    noHexes: 'Altıgenler ön planda veya simge katmanındadır; bunları seçmek için o katmana geçin.',
    unknownCommand: 'Komutları listelemek için !hexploration help yazın.',
    unknownSetting: 'Her ayarı görmek için !hexploration set yazın.',
    calibrateNeedsTokens:
      'Bir altıgenin ortasına bir jeton tutturun ve onu seçin. Altıgen boyutunu da düzeltmek için aynı satırdaki (Hex V) veya sütundaki (Hex H) komşu altıgene tutturulmuş ikinci bir jeton seçin.',
    calibrateFailed:
      'İki jetonun aynı satırda (Hex V) veya aynı sütunda (Hex H) ve en az bir altıgen aralıkla olması gerekir.',
    unexpected: 'Ayrıntılar API konsolu günlüğündedir.',
  },
  help: {
    menu: 'Menüyü göster.',
    fill: 'Seçilen çizilen şekilleri altıgenlerle kaplayın.',
    fillInverse: 'Seçilen şekillerin içi hariç tüm sayfayı kaplayın.',
    undo: 'Son dolguyu geri alın, ters dolguyu ters çevirin veya gizleyin ve kullandığı şekilleri geri yükleyin.',
    reveal:
      'Seçilen altıgenleri ve seçilen şekillerin ve simgelerin altındaki altıgenleri ortaya çıkarın.',
    revealPage: 'Sayfadaki her altıgeni duyuru yapmadan ortaya çıkarın.',
    conceal: 'Seçilen şekillerin ve jetonların altındaki alanı tekrar altıgenlerle kaplayın.',
    explore: 'Seçilen jetonların etrafını sanki oraya yeni taşınmışlar gibi gösterin.',
    resetPage: 'Sayfadaki her altıgeni kaldırın (önce sorar).',
    name: 'Seçilen altıgenleri veya seçilen belirteçlerin altındaki altıgenleri adlandırın. Temizlemek için adı boş bırakın.',
    mark: 'Seçilen jetonları gizli konumlara dönüştürün.',
    unmark: 'Seçilen belirteçlerin gizli konumlar olmasını durdurun.',
    set: 'Bir ayarı değiştirin veya tüm ayarları gösterin.',
    pageSet: 'Yalnızca geçerli sayfadaki bir gösterme ayarını geçersiz kılın.',
    pageClear: 'Geçerli sayfanın geçersiz kılmalarını kaldırın.',
    rescan:
      'Sayfanın altıgen listesini yeniden oluşturun; örneğin bir sayfayı veya oyunu kopyaladıktan sonra.',
    calibrate:
      'Altıgen ızgarayı, altıgen merkezlerine tutturulmuş bir veya iki seçilmiş jetonla hizalayın.',
    calibrateReset: 'Geçerli sayfanın kalibrasyonunu kaldırın.',
    status: "Hexploration'ın geçerli sayfa hakkında bildiklerini gösterin.",
    journal: 'Yardım ve Command Deck broşürlerini yeniden oluşturun.',
    help: 'Bu listeyi göster.',
    handout: 'Talimatların tamamı "{name}" broşüründe yer almaktadır.',
  },
  deck: {
    drawDesc:
      "Bir alanın çevresine şekiller çizin, onları seçin ve Doldur'a tıklayın. Doldurmayı Geri Al, son doldurmayı geri alır.",
    revealDesc:
      'Altıgenleri, şekilleri veya jetonları açığa çıkarmak ya da yeniden örtmek için seçin. Keşfet, seçili jetonların çevresini sanki oraya yeni gitmişler gibi açığa çıkarır.',
    locationsDesc:
      'Altıgenlerin altındaki konumlar olarak gizlemek için belirteçleri seçin. Bir altıgeni adlandırmak için altıgenleri veya belirteçleri seçin.',
    toolsDesc:
      'Ayarlar, sayfa geçersiz kılmaları, durum, kopyalanan sayfaları yeniden tarama ve ızgarayı kalibre etme.',
    footer: 'Talimatların tamamı için "{help}" broşürüne bakın.',
  },
  handout: {
    versionLabel: 'Sürüm',
    subtitle: 'Roll20 için hex-hex keşif',
    footer: 'Tek tıklamayla kontroller için "{deck}" broşürünü kullanın.',
    overview: {
      heading: 'Genel Bakış',
      body: 'Hexploration, bir altıgen haritayı opak altıgenlerle kaplar. Grup ilerledikçe içinden geçtiği altıgenler (ve isterseniz çevresindeki altıgenler) kaldırılır; böylece harita altıgen altıgen ortaya çıkar. Gizli konumlar altıgenlerin altına yerleştirilebilir ve bulunduklarında duyurulur. Jumpgate ve Legacy oyunlarında, her boyuttaki Hex (V) ve Hex (H) ızgaralarında çalışır.',
      demo: "Kısa bir demo izleyin (versiyon 1'den)",
    },
    quickStart: {
      heading: 'Hızlı Başlangıç',
      steps: [
        'Izgarası Hex (V) veya Hex (H) olarak ayarlanmış bir sayfayı açın.',
        'Gizlenecek alanın çevresine bir veya daha fazla şekil (çokgen, dikdörtgen, elips veya serbest çizim) çizin.',
        "Şekilleri seçin ve Command Deck'te Doldur'a tıklayın (veya !hexploration fill yazın). Şekiller altıgenlerle değiştirilir.",
        "İsteğe bağlı: doldurmadan önce önemli yerler için jetonları seçin ve Konumu İşaretle'ye tıklayın. Altıgenlerin altında gizlenirler ve keşfedildiklerinde duyurulurlar.",
        'Bir oyuncu jetonunu taşıyın. İçinden geçtiği her altıgen ve Görüş Mesafesindeki altıgenler ortaya çıkar.',
      ],
    },
    commands: {
      heading: 'Komutlar',
      intro:
        "Bu komutları yalnızca GM'ler kullanabilir. Çoğu seçilen nesneler üzerinde hareket eder; geri kalanı görüntülediğiniz sayfada hareket eder.",
      colCommand: 'Emretmek',
      colDesc: 'Ne işe yarar',
    },
    revealing: {
      heading: 'Açığa Çıkarma Nasıl Çalışır?',
      points: [
        'Altıgenleri yalnızca jeton katmanındaki jetonlar açığa çıkarır. Hangi jetonların sayılacağını Açığa Çıkaran Jetonlar ayarı belirler: varsayılan olarak oyuncu jetonları; böylece GM haritayı açmadan canavarları hareket ettirebilir.',
        'Bir jeton kapladığı her altıgeni (büyük jetonlar birkaç altıgen kaplar) ve Yol Boyunca Açığa Çıkar açıkken, ara noktalar dahil sürüklendiği rotadaki her altıgeni açığa çıkarır.',
        'Görüş Mesafesi, bu altıgenlerin her birinin çevresindeki altıgenleri açığa çıkarır. Görüş Hattı açıkken bir altıgen yalnızca arada örtülü bir altıgen yoksa açığa çıkar.',
        'Altıgen Açığa Çıkarma Mesafesi, altıgenler çizilirken onlara kaydedilir. Bu altıgenler, bir jeton ne kadar uzağı görürse görsün, yalnızca o kadar altıgen mesafeden açığa çıkar. Arkasındakini gizleyen dağlar veya ormanlar için kullanın.',
        'Bakış modunda, görüş alanındaki altıgenler kaybolmak yerine yarı saydam olur ve içlerine bir jeton girdiğinde kaldırılır.',
        'Roll20, jeton adlarını, çubuklarını ve auralarını altıgenlerin üzerine çizer. Örtülü Jetonları Gizle açıkken, örtülü bir altıgenin altındaki jetonun oyunculara görünen adı, çubukları ve auraları açığa çıkana kadar kapatılır; böylece gizli canavarlar kendilerini belli etmez. Jeton örtülüyken bunlardan birini açarsanız gizli kalır ve jeton açığa çıktığında açılır.',
        "API, diğer modların yaptığı hareketleri bildirmez. TokenMod hareketleri otomatik olarak algılanır; diğer modlar için jetonları seçip Keşfet'e tıklayın veya kendi modunuzdan Hexploration.revealAround(token) çağırın.",
      ],
    },
    locations: {
      heading: 'Adlandırılmış Altıgenler ve Konumlar',
      points: [
        'Konumu İşaretle, seçilen jetonları gizli konumlara dönüştürür. Zaten altıgen altında olan bir jeton hemen gizlenir; aksi takdirde onu kapsayan bir sonraki dolgu tarafından gizlenir.',
        "Beyaz kule durum işaretçisine sahip jetonlar da, sürüm 1'de olduğu gibi, doldurduğunuzda konum olarak kabul edilir.",
        'Gizli konum belirteçleri GM katmanına taşınır. Altıgenleri ortaya çıktığında, adlarının gösterildiği simge katmanına geri dönerler ve keşifleri duyurulur.',
        "Altıgeni Adlandır, bir altıgene jeton olmadan ad verir. Ad, GM katmanında bir etiket olarak GM'ye gösterilir ve altıgen açığa çıktığında duyurulur.",
        "Keşifleri Duyur, duyuruyu herkesin mi, yalnızca GM'nin mi yoksa hiç kimsenin mi göreceğini seçer. Keşifleri Pingle ayrıca oyuncuların görünümünü konuma taşır.",
      ],
    },
    settings: {
      heading: 'Ayarlar',
      intro:
        "Ayarları !hexploration set ile (veya Ayarlar düğmesiyle) değiştirin. Altıgen Katmanı, Açığa Çıkaran Jetonlar ve Dil, Mod'un ayarlar sayfasından da ayarlanabilir.",
      colKey: 'Anahtar',
      colName: 'Ayar',
      colDesc: 'Tanım',
      perPage: '(Sayfa başına ayarlanabilir.)',
    },
    jumpgate: {
      heading: 'Jumpgate ve Eski',
      points: [
        'Hexploration, oyunun hangi motoru kullandığını belirler ve uygun türde şekil çizer. Her iki düzenleyicide çizilen şekiller doldurulabilir.',
        'Altıgen Katmanı Otomatik olarak ayarlandığında altıgenler ön plan katmanında, jetonların üzerine çizilir; böylece oyuncular altında ne olduğunu göremez. Ön plan katmanı kullanılamıyorsa bunun yerine jeton katmanı kullanılır.',
        "Jumpgate matematiksel olarak düzgün altıgenler çizer; bunların şekli Legacy altıgenlerinden biraz farklıdır. Altıgenler sayfanın ızgarasıyla hizalı değilse bir altıgenin merkezine bir jeton tutturun, onu seçin ve Kalibre Et'e tıklayın. Altıgen boyutunu da düzeltmek için aynı satırdaki (Hex V) veya sütundaki (Hex H) komşu altıgenlerde iki jeton seçin.",
        "Bir sayfa veya oyun kopyalandığında altıgenleri yeni kimlikler alır. Onları ad etiketleri ve konum jetonlarıyla birlikte yeniden bulmak için sayfada Yeniden Tara'yı çalıştırın.",
      ],
    },
    upgrading: {
      heading: "Sürüm 1'den yükseltme",
      points: [
        "Sürüm 2'nin artık PathMath, MatrixMath, Vector Math veya HTML Builder'a ihtiyacı yok. Başka bir mod kullanmadığı sürece bunları kaldırabilirsiniz.",
        'Mevcut altıgen haritalar, adlar, konum belirteçleri ve ayarlar ilk başlangıçta otomatik olarak yükseltilir.',
        'Hexploration_menu makrosu dahil sürüm 1 komutları hâlâ çalışır.',
        "Sürüm 1, bir karakteri temsil eden her jetonun altıgenleri açığa çıkarmasına izin veriyordu. Bu davranışı korumak için Açığa Çıkaran Jetonlar'ı Karakter jetonları olarak ayarlayın.",
      ],
      colV1: 'Sürüm 1 komutu',
      colV2: 'Sürüm 2 komutu',
    },
    troubleshooting: {
      heading: 'Sorun giderme',
      points: [
        'Bir jeton hareket ettiğinde hiçbir şey olmuyor: jetonun jeton katmanında olduğunu ve Açığa Çıkaran Jetonlar ayarına uyduğunu, sayfada da altıgenler bulunduğunu (!hexploration status) kontrol edin.',
        "Altıgenler ızgaradan kaymış: Kalibre Et'i kullanın, ardından haritanın farklı yerlerindeki birkaç altıgeni bir jetonla kontrol edin.",
        "Bir sayfayı veya oyunu kopyaladıktan sonra altıgenler açığa çıkmıyor: sayfada Yeniden Tara'yı çalıştırın.",
        'Doldur, alanda altıgen merkezi olmadığını söylüyor: şeklin en az bir altıgenin merkezini içermesi gerekir.',
        'Başka bir şey için API konsolu günlüğünü kontrol edin ve yardım isterken mesajlarını ekleyin.',
      ],
    },
    languages: {
      heading: 'Diller',
      body: '!hexploration set language ile bir dil seçin. Mevcut diller:',
      colLanguage: 'Dil',
      colNative: 'Yerel ad',
      colCode: 'Kod',
    },
    credits: {
      heading: 'Kredi',
      original: 'Orijinal modun yapımcısı',
      maintainer: 'Versiyon 2 tarafından sürdürülen',
      marketplace: "Ada'nın sanat paketleri Roll20 Marketplace'te",
      support:
        "Bir hata bulursanız veya bir fikriniz varsa Roll20 Mod forumuna gönderin veya GitHub'da bir sorun açın ve API konsolu günlüğündeki tüm mesajları ekleyin.",
    },
  },
};

export default TRANSLATION;
