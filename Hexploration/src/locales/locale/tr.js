const TRANSLATION = {
  titles: {
    ready: 'Keşif hazır.',
    settings: 'Keşif Ayarları',
    languages: 'Bir Dil Seçin',
    pageSettings: 'Sayfa Ayarları: {page}',
    status: 'Keşif Durumu: {page}',
    help: 'Keşif Komutları',
    confirm: 'Lütfen Onaylayın',
  },
  discovery: {
    title: 'Konum Keşfedildi',
  },
  menu: {
    draw: 'Çizmek',
    reveal: 'Göster ve Gizle',
    locations: 'Konumlar',
    tools: 'Aletler',
    layerInUse: '{layer} üzerinde yeni altıgenler çiziliyor.',
    pageSettingsHelp:
      'Bu ayarlar yalnızca bu sayfa için geçerlidir. ★ işaretli ayarlar genel ayarları geçersiz kılar.',
  },
  buttons: {
    fill: 'Doldurmak',
    fillInverse: 'Ters Doldurma',
    undo: 'Doldurmayı Geri Al',
    reveal: 'Ortaya çıkarmak',
    conceal: 'Gizle',
    explore: 'Keşfetmek',
    revealPage: 'Sayfayı Göster',
    resetPage: 'Sayfayı Sıfırla',
    mark: 'Konumu İşaretle',
    unmark: 'İşareti kaldır',
    name: 'Ad Hex',
    settings: 'Ayarlar',
    pageSettings: 'Sayfa Ayarları',
    status: 'Durum',
    rescan: 'Yeniden tara',
    calibrate: 'Kalibre et',
    calibrateReset: 'Kalibrasyonu Sıfırla',
    help: 'Yardım',
    change: 'Değiştirmek',
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
      auto: 'Otomatik (varsa ön planda)',
      foreground: 'ön plan katmanı',
      objects: 'belirteç katmanı',
    },
    revealBy: {
      players: 'Oyuncu jetonları',
      characters: 'Karakter belirteçleri',
      all: 'Tüm jetonlar',
    },
    revealMode: {
      clear: 'Temizlemek',
      glimpse: 'Kısa bakış',
    },
    announce: {
      all: 'Herkes',
      gm: 'Yalnızca GM',
      off: 'Kapalı',
    },
    orientation: {
      vertical: 'Altıgen (V)',
      horizontal: 'Altıgen (H)',
    },
    fillKind: {
      fill: 'Doldurmak',
      fillInverse: 'Ters Doldurma',
      conceal: 'Gizle',
    },
  },
  settings: {
    language: {
      label: 'Dil',
      desc: 'Menüler, mesajlar ve bildiriler için dil.',
    },
    hexLayer: {
      label: 'Altıgen Katman',
      desc: 'Yeni altıgenlerin çizildiği yer. Otomatik, ön plan katmanını (belirteçlerin üstünde) dener ve oyun desteklemiyorsa simge katmanına geri döner.',
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
      desc: 'Renk altıgenleri, göz atıldığında (Glimpse ortaya çıkarma modu) olarak değişir. Şeffaf bir rgba() rengi kullanın.',
    },
    strokeWidth: {
      label: 'Kenar Genişliği',
      desc: 'Yeni altıgenlerin ana hattının genişliği, piksel cinsinden (0 ila 20).',
    },
    maxDistance: {
      label: 'Hex Ortaya Çıkma Mesafesi',
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
      label: 'Yol Boyunca Ortaya Çıkar',
      desc: 'Açık olduğunda, bir jetonun sürüklenirken geçtiği her altıgen (ara noktalar dahil) yalnızca durduğu yer değil, ortaya çıkar.',
    },
    revealBy: {
      label: 'Ortaya Çıkan Tokenlar',
      desc: 'Jeton katmanındaki hangi jetonlar altıgenleri ortaya çıkarır: bir oyuncu tarafından kontrol edilen jetonlar, herhangi bir karakteri temsil eden jetonlar veya her jeton.',
    },
    revealMode: {
      label: 'Ortaya Çıkarma Modu',
      desc: 'Clear, görüş alanındaki altıgenleri kaldırır. Glimpse onların içini görmelerini sağlar; bir jeton onlara girdiğinde kaldırılırlar.',
    },
    announce: {
      label: 'Keşifleri Duyurun',
      desc: 'Adlandırılmış bir konum keşfedildiğinde sohbet mesajını kimler görür?',
    },
    pingDiscoveries: {
      label: 'Ping Keşifleri',
      desc: 'Açık olduğunda, oyuncular keşfedildiklerinde adlandırılmış bir konuma ping atılır.',
    },
    hideCoveredTokens: {
      label: 'Kapalı Jetonları Gizle',
      desc: 'Roll20 altıgenlerin üzerine isimleri, çubukları ve auraları çizer. Açıkken, kapalı bir altıgen altındaki jetonların oyuncuların görebileceği adları vardır, çubuklar ve auralar kapatılır ve açığa çıktıklarında tekrar açılır.',
    },
  },
  status: {
    engine: 'Oyun motoru',
    grid: 'Izgara',
    layer: 'Altıgen katman',
    hexes: 'Altıgenler',
    named: 'Adlandırılmış altıgenler',
    icons: 'Konum belirteçleri',
    glimpsed: 'Kısa bir bakış altıgenler',
    pending: 'Doldurulmayı bekleyen yerler',
    calibrated: 'Kalibre edildi',
    overrides: 'Sayfa geçersiz kılmaları',
    undo: 'Geri alma seçeneği mevcut',
  },
  messages: {
    filled:
      'Doldurma tamamlandı. Çizilen altıgenler: {created}. Yeniden stil: {restyled}. Gizlenen konumlar: {icons}.',
    revealed: 'Büyüler ortaya çıktı: {count}.',
    revealedPage: 'Sayfadaki her altıgen ortaya çıktı ({count}).',
    confirmReset:
      '"{page}" ({count}) öğesindeki her altıgen kaldırılsın mı? Konum belirteçleri, belirteç katmanına geri döner. Geri alma işlemi bunu tersine çeviremez.',
    resetPage: 'Onaltılıklar sayfadan kaldırıldı: {count}.',
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
    journalRebuilt: '"{help}" ve "{deck}" bildirileri yeniden oluşturuldu.',
    migrated:
      'Heexploration 1.x hex haritalarınız yükseltildi. Bu oyun Eski bir oyundan kopyalanmışsa, her altıgen harita sayfasında Yeniden Taramayı çalıştırın.',
    pruned:
      "Artık mevcut olmayan ve unutulan kayıtlı altıgenler: {dropped}. Bu oyun veya sayfa kopyalandıysa, altıgenleri tekrar almak için sayfada Yeniden Tarama'yı çalıştırın.",
    readyHint: 'Menüye !hexploration yazın veya "Hexploration - Command Deck" broşürünü açın.',
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
      'Bir altıgenin ortasına bir jeton tutturun ve onu seçin. Onaltılı boyutu da düzeltmek için aynı satırdaki (Hex V) veya sütundaki (Hex H) komşu altıgenlere tutturulmuş ikinci bir jeton seçin.',
    calibrateFailed:
      'İki jetonun aynı satırda (Hex V) veya aynı sütunda (Hex H) ve en az bir onaltılık aralıkta olması gerekir.',
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
      'Örneğin bir sayfayı veya oyunu kopyaladıktan sonra sayfanın onaltılı listesini yeniden oluşturun.',
    calibrate:
      'Altıgen ızgarayı, altıgen merkezlerine tutturulmuş bir veya iki seçilmiş jetonla hizalayın.',
    calibrateReset: 'Geçerli sayfanın kalibrasyonunu kaldırın.',
    status: "Heexploration'ın mevcut sayfa hakkında bildiklerini gösterin.",
    journal: 'Yardım ve Komut Paneli bildirilerini yeniden oluşturun.',
    help: 'Bu listeyi göster.',
    handout: 'Talimatların tamamı "{name}" broşüründe yer almaktadır.',
  },
  deck: {
    subtitle: 'Komut Güvertesi',
    drawDesc:
      'Bir alanın etrafına şekiller çizin, bunları seçin ve ardından doldurun. Geri al, son dolguyu tersine çevirir.',
    revealDesc:
      'Tekrar ortaya çıkarmak veya kaplamak için altıgenleri, şekilleri veya jetonları seçin. Seçili tokenların etrafındaki gösterimleri sanki hareket etmişler gibi keşfedin.',
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
      body: 'Heexploration, opak altıgenlere sahip bir altıgen haritayı kapsar. Grup ilerledikçe içinden geçtikleri altıgenler (ve isterseniz etraflarındaki altıgenler) kaldırılır, böylece harita her seferinde bir altıgen olarak ortaya çıkar. Gizli konumlar altıgenlerin altına yerleştirilebilir ve bulunduğunda duyurulur. Jumpgate ve Legacy oyunlarında, her boyuttaki Hex (V) ve Hex (H) ızgaralarında çalışır.',
      demo: "Kısa bir demo izleyin (versiyon 1'den)",
    },
    quickStart: {
      heading: 'Hızlı Başlangıç',
      steps: [
        'Izgarası Hex (V) veya Hex (H) olarak ayarlanmış bir sayfayı açın.',
        'Gizlenecek alanın çevresine bir veya daha fazla şekil (çokgen, dikdörtgen, elips veya serbest çizim) çizin.',
        "Şekilleri seçin ve Komut Panelinde Doldur'a tıklayın (veya !hexploration fill yazın). Şekillerin yerini altıgenler alır.",
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
        'Yalnızca jeton katmanındaki jetonlar altıgenleri ortaya çıkarır. Hangi jetonların sayılacağı, Ortaya Çıkarılan Jetonlar tarafından belirlenir: varsayılan olarak oyuncu jetonları, böylece GM, haritayı açığa çıkarmadan canavarları hareket ettirebilir.',
        'Bir jeton, kapsadığı her altıgeni (büyük jetonlar birkaçını kapsar) ve Yol Boyunca Göster açıkken, ara noktalar da dahil olmak üzere sürüklendiği rotadaki her altıgeni ortaya çıkarır.',
        'Görüş Mesafesi, bu altıgenlerin her birinin etrafındaki altıgenleri ortaya çıkarır. Görüş Hattı açıkken, bir altıgen yalnızca arada kapalı bir altıgen bulunmadığında ortaya çıkar.',
        'Hex Reveal Distance, altıgenler çizildikçe depolanır. Bu büyüler, bir jetonun görebileceği kadar uzağa, yalnızca o kadar çok büyünün içinden ortaya çıkar. Arkalarında olanı gizleyen dağlar veya ormanlar için kullanın.',
        'Bakış modunda, görüş alanındaki altıgenler kaybolmak yerine şeffaf hale gelir ve içlerine bir jeton girdiğinde kaldırılır.',
        'The API does not report moves made by other mods. TokenMod moves are picked up automatically; for other mods, select the tokens and click Explore, or call Hexploration.revealAround(token) from your own mod.',
        "API, diğer modların yaptığı hareketleri raporlamaz. TokenMod hareketleri otomatik olarak alınır; diğer modlar için belirteçleri seçin ve Araştır'a tıklayın veya kendi modunuzdan Heexploration.revealAround(token) öğesini çağırın.",
      ],
    },
    locations: {
      heading: 'Adlandırılmış Altıgenler ve Konumlar',
      points: [
        'Konumu İşaretle, seçilen jetonları gizli konumlara dönüştürür. Zaten altıgen altında olan bir jeton hemen gizlenir; aksi takdirde onu kapsayan bir sonraki dolgu tarafından gizlenir.',
        "Beyaz kule durum işaretçisine sahip jetonlar da, sürüm 1'de olduğu gibi, doldurduğunuzda konum olarak kabul edilir.",
        'Gizli konum belirteçleri GM katmanına taşınır. Altıgenleri ortaya çıktığında, adlarının gösterildiği simge katmanına geri dönerler ve keşifleri duyurulur.',
        "Name Hex, onaltılıya belirteci olmayan bir ad verir. İsim, GM katmanında bir etiket olarak GM'ye gösterilir ve altıgen ortaya çıktığında duyurulur.",
        "Announce Discoveries, duyuruyu herkesin mi, yalnızca GM'nin mi yoksa hiç kimsenin mi görmeyeceğini seçer. Ping Discoveries ayrıca oyuncuların görünümünü konuma taşır.",
      ],
    },
    settings: {
      heading: 'Ayarlar',
      intro:
        '!hexploration setiyle (veya Ayarlar düğmesiyle) ayarları değiştirin. Hex Katmanı, Ortaya Çıkan Tokenlar ve Dil ayrıca Modun ayarlar sayfasından da ayarlanabilir.',
      colKey: 'Anahtar',
      colName: 'Ayar',
      colDesc: 'Tanım',
      perPage: '(Sayfa başına ayarlanabilir.)',
    },
    jumpgate: {
      heading: 'Jumpgate ve Eski',
      points: [
        'Heexploration, oyunun hangi motoru kullandığını bulur ve ona uygun şekli çizer. Her iki düzenleyicide de çizilen şekiller doldurulabilir.',
        'Hex Layer Auto (Otomatik) olarak ayarlandığında, altıgenler ön plan katmanında jetonların üzerine çizilir, böylece oyuncular altta ne olduğunu göremez. Ön plan katmanı mevcut değilse bunun yerine simge katmanı kullanılır.',
        "Jumpgate, Eski altıgenlerden biraz farklı bir şekle sahip olan matematiksel olarak düzenli altıgenler çizer. Altıgenler sayfanın ızgarasıyla aynı hizada değilse, altıgen merkeze bir jeton tutturun, onu seçin ve Kalibre Et'e tıklayın. Onaltılı boyutu da düzeltmek için aynı satırdaki (Hex V) veya sütundaki (Hex H) komşu altıgenlerden iki jeton seçin.",
        "Bir sayfa veya oyun kopyalandığında altıgenleri yeni kimlikler alır. Bunları ad etiketleri ve konum belirteçleriyle birlikte yeniden almak için sayfada Yeniden Tarama'yı çalıştırın.",
      ],
    },
    upgrading: {
      heading: "Sürüm 1'den yükseltme",
      points: [
        "Sürüm 2'nin artık PathMath, MatrixMath, Vector Math veya HTML Builder'a ihtiyacı yok. Başka bir mod kullanmadığı sürece bunları kaldırabilirsiniz.",
        'Mevcut altıgen haritalar, adlar, konum belirteçleri ve ayarlar ilk başlangıçta otomatik olarak yükseltilir.',
        'Heexploration_menu makrosu da dahil olmak üzere sürüm 1 komutları hala çalışıyor.',
        'Sürüm 1, bir karakteri temsil eden herhangi bir jetonun altıgenleri ortaya çıkarmasına izin veriyor. Bu davranışı korumak için Ortaya Çıkan Jetonları Karakter jetonlarına ayarlayın.',
      ],
      colV1: 'Sürüm 1 komutu',
      colV2: 'Sürüm 2 komutu',
    },
    troubleshooting: {
      heading: 'Sorun giderme',
      points: [
        'Bir jeton hareket ettiğinde hiçbir şey olmuyor: jetonun jeton katmanında olduğunu, Ortaya Çıkan Jetonlarla eşleştiğini ve sayfada altıgenlerin (!hexploration durumu) bulunduğunu kontrol edin.',
        "Altıgenler ızgaradan kaydırılmıştır: Kalibre Et'i kullanın, ardından haritadaki birkaç altıgeni bir jetonla kontrol edin.",
        "Bir sayfayı veya oyunu kopyaladıktan sonra Hexes'in görüntülenmesi durduruldu: Sayfada Yeniden Tarama'yı çalıştırın.",
        'Fill, alanda altıgen merkezinin bulunmadığını söylüyor: şeklin en az bir altıgen merkezi içermesi gerekiyor.',
        'Başka bir şey için API konsolu günlüğünü kontrol edin ve yardım isterken mesajlarını ekleyin.',
      ],
    },
    languages: {
      heading: 'Diller',
      body: '!hexploration set diliyle bir dil seçin. Mevcut diller:',
    },
    credits: {
      heading: 'Kredi',
      original: 'Orijinal mod',
      maintainer: 'Versiyon 2 tarafından sürdürülen',
      marketplace: "Ada'nın sanat paketleri Roll20 Marketplace'te",
      support:
        "Bir hata bulursanız veya bir fikriniz varsa Roll20 Mod forumuna gönderin veya GitHub'da bir sorun açın ve API konsolu günlüğündeki tüm mesajları ekleyin.",
    },
  },
};

export default TRANSLATION;
