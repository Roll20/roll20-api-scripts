/*
 * WorldAwareNPC v1.1.0
 * Roll20 Mod Script
 * Created by Kingkiller546 — Roll20 ID 2978722
 *
 * Commands:
 *   !npc          Generate an NPC and whisper it to the GM.
 *   !npc-menu     Open the origin/race selector.
 *   !npc-config   Open the GM-only Setup Manager.
 *   !npc-check    Check the installation.
 *
 * See README.md for installation and configuration.
 */
var WorldAwareNPC = WorldAwareNPC || (function () {
    'use strict';

    var VERSION = '1.1.0';
    var STATE_KEY = 'WORLD_AWARE_NPC';
    var REQUIRED_TABLES = [
        'NPC-Race', 'NPC-Age', 'NPC-Sex', 'NPC-Origin',
        'NPC-Affluence', 'NPC-Influence', 'NPC-Faction'
    ];

    // Canonical language-name pools supplied by Language Forge.
    var LANGUAGE_NAMES = {"Kharzun":{"male":["Borin Durdun","Harek Lodbar","Keld Urtor","Borin Gromkhar"],"female":["Dagna Norgvalk","Thora Tharforg","Brynja Kharnar","Dagna Garnhul"]},"Aeltharyn":{"neutral":["Elval en Valnor","Elnor en Rithnor","Daurval en Vaelnor","Rival en Elosnor","Elsae en Saevon","Risae en Lyrri","Rivael en Daurri","Saelyr en Nurnor"]},"Shaltek":{"neutral":["Lethani","Letantha","Shalem","Murem","Qetem","Karem","Torem","Kelem"]},"Druumeg":{"neutral":["Ak-Thal","Ghor-Bal","Tham-Ral","Gor-Rak Ak-Ral Brum-Bar","Kol-Rem","Rem-Teg","Kol-Rog","Ash-Bal Ral-Khan"]},"Tivri":{"neutral":["Miri Grimkin","Ziri Tikikin","Veko Prikkin","Tora Sholakin","Lumi Vashikin","Niva Lirakin","Boma Felikin","Sori Favakin"]},"Lethwynn":{"male":["Merrin Halowyn","Pello Belpota","Tavin Savaroda","Loro Rivaira"],"female":["Mina Avalmere","Letha Halowyn","Bessa Belpota","Nori Rivaira"]},"Rha'Savari":{"male":["Rhazur","Khazarek","Tharnok","Gorvahar"],"female":["Zanara","Lahsavar","Mirzhen","Vashara"],"neutral":["Savarun","Zurren","Rhashen","Haskari"]},"Ghorvakh":{"neutral":["Gurak Rakdor","Rakak Ghazdor","Durak Gurdor","Ghazak Vashdor","Zhulak Mazhdor","Grumak Khardor","Nurgak Nurgdor","Zharak Dazhdor"]},"Druvo":{"neutral":["Aelvan Endara","Darael Yewrin","Saelir Varken","Calmen Endara","Virel Varken","Hirador Yewrin","Aelvan Yewrin","Calmen Varken"]},"Kaaril":{"neutral":["FinraAakraRokru","FinraAakraYeki","EralanRishaErshe","IhariAashaIhashe","SholinRiskraShekhaar","EralanAashaYeki","IhariRishaRokru","SholinAakraErshe"]},"Gorazhul":{"neutral":["Goru","Raku","Dreg","Vrak","Kordtaz","Grazrak","Ghulrak","Ghulezz"]},"Aelhael":{"neutral":["Aelir","Miriel","Shaelir","Maelir","Thirir","Haeliel","Seriel","Raeniel"]},"Uul'Qhess":{"neutral":["Xhul'rress Vaal'qil","Ilith'uur Khaan'ssek","Ghez'ulq Thuun'esh","Qhul'vra Ssek'ek","Qa'orr Gorr'korr","Qhazh'vra Raath'orr","Ovv'qa Zzor'gorr","Orrul'qa Korr'vaal"]},"Kharzul":{"neutral":["Varkesh Thur-Zar","Kharvorn Thur-Draak","Zhurak Thur-Qarn","Drekhazh Thur-Sek","Sarveth Thur-Mazh","Qorvan Thur-Zar","Neshkara Thur-Draak","Varkesh Thur-Mazh"]},"Grik-Tak":{"neutral":["Grikash","Zrakun","Skurog","Tikish","Tikash","Zrakash","Kribash","Rukash"]},"Kharzra":{"neutral":["Drazir","Kraek","Vrash","Zharir","Sekra","Keshir","Torir","Ghulir"]},"Ishkarul":{"neutral":["Vazun Ish","Sorun Zhek","Nerun Vek","Garun Kran","Rekun Eth","Zamun Sher","Khalun Mal","Vorun Sul"]},"Vaeliri":{"neutral":["Lathiel","Vaelthar","Mirael","Aelwen","Thalorun","Sovarel","Selarael","Taenlir"]},"Xulvryn":{"neutral":["Zhaunryl d'Zhaunoth","Xulvrae d'Ssathluth","Ilzhaera d'Ilzhdrath","Thalvess d'Qorvhal","Vrynkael d'Zhaunoth","Yathzhael d'Ssathluth","Matrilzha d'Ilzhdrath","Qathraez d'Qorvhal"]},"Uraval":{"neutral":["Uraveth","Raketh","Haeleth","Osheth","Doreth","Kireth","Shaeth","Avureth"]},"Oshuren":{"neutral":["Oshon Oshkarun","Loramel Melon","Maoren Oshkarun","Vollen Melon","Geronen Oshkarun","Shoen Melon","Veronen Oshkarun","Melen Melon"]},"Selayin":{"neutral":["Selai Haelil","Haelin Nuvil","Lirien Sifil","Aesif Haelil","Hirilin Nuvil","Virilin Sifil","Melin Haelil","Savarilin Nuvil"]},"Avarakh":{"neutral":["Rakhar Rakhun","Avarak Zankarun","Zansha Ashkarun","Kirtham Rakhun","Raketh Zankarun","Kireth Ashkarun","Shahreth Rakhun","Safareth Zankarun"]},"Durnak":{"neutral":["Durnak Dorkar","Grumdar Gromar","Kardum Karnar","Thurgan Drelgar","Durbar Dorkar","Grumkarn Gromar","Kirtam Karnar","Shaukmir Drelgar"]}};

    // Human name pools retained from the previous generator.
    var HUMAN_NAMES = {"african":{"boy":["Abadom","Abayomrunkoje","Abegunde","Abidugun","Abomeli","Achutebe","Adeboye","Adefolake","Adeleye","Adewemimo","Aduba","Agusiobo","Aisosa","Ajeigbe","Akin","Akinrinade","Akoni","Alitash","Amadia","Anah","Assefa","Atuona","Ayana","Ayobami","Babafemi","Banele","Bekele","Berhane","Berta","Bongani","Botle","Chikezie","Chimezie","Chinenyenwa","Chisomaga","Daniele","Demissie","Dikgang","Dintle","Dzingai","Egwuchi","Ekwuaju","Enofe","Esosa","Ezediugwu","Falashina","Fethee","Funi","Hagos","Ifechi","Ifetundun","Ilozumba","Isoken","Iyasu","Josefa","Kagiso","Katleho","Kelechi","Khumbu","Kokumo","Kutlwano","Leabua","Lefa","Litsoanelo","Lulama","Maduenu","Masingita","Melaku","Mobo","Mohau","Molahlehi","Mutshutshudzi","Nana","Ndidi","Nduvho","Neo","Nkem","Nkhumbuleni","Nnaji","Nnyadzeni","Nothembi","Nthatisi","Ntombifuthi","Obiefune","Odogwu","Okpere","Oladosu","Olisa","Olugbala","Oluwadunmininu","Oluwagbenga","Oluwarogbayi","Oluwatobatayin","Oluwatumishe","Omolade","Omowale","Onwuazo","Oreoluwa","Osaloni","Osinachi","Phathu","Rabe","Rayowa","Refilwe","Retta","Rudzi","Sangodele","Sehlolo","Semhar","Sibusiso","Siphelele","Sizwe","Sopuruchi","Tambara","Tau","Tejumola","Thabisa","Thanduxolo","Thuso","Tlhokomelo","Tochukwu","Tsebo","Tshinyalani","Tumisang","Udo","Utibe","Vuyo","Wushe","Yejide","Yonas","Zere","Zere Yacob"],"girl":["Abadom","Achutebe","Adankwo","Adebamgbe","Aderinola","Adesola","Adewemimo","Adigun","Afiba","Agbonkhina","Agusiobo","Akani","Akoni","Amadia","Amhara","Anesu","Aniyan","Anwilichukwu","Aretta","Assefa","Ayana","Ayobami","Ayotunde","Azwihangwisi","Banele","Bhekizizwe","Buyisiwe","Cheren","Chidubem","Chisomaga","Chukwuma","Daniele","Dawit","Dowe","Edzai","Egwuchi","Emem","Enofe","Ezediugwu","Falashina","Farirai","Filemone","Gebre","Gugu","Hakym","Humbe","Ibironke","Ifetundun","Ikechukwu","Iretomiwa","Jaiyesimi","Jeso","Kagiso","Kentoroabasi","Kess","Leabua","Lentswe","Letsie","Likengkeng","Lindidwe","Majobo","Makeda","Mandera","Masingita","Mattheu","Melaku","Merille","Mmaabo","Mobo","Monjolaoluwa","Moreri","Moshe","Motlalentwa","Msizi","Nana","Neo","Nkhumbuleni","Nokresimesi","Nomfazwe","Nonkululeko","Ntombifuthi","Ntsumi","Nwachukwu","Nyala","Oba","Odogwu","Ogbonna","Oisaghie","Okpere","Olaoluwajuwon","Olugbala","Olusola","Oluwatobatayin","Omowale","Oreoluwa","Osaloni","Osinachi","Oyakhirome","Palesa","Philani","Popoola","Retta","Selamawit","Shandukani","Sibusiso","Tefer","Temitope","Teruworq","Thembeka","Tochukwu","Tshediso","Tshinyalani","Ugoulo","Yejide","Zauna","Zithembe"]},"arabic":{"boy":["Aban","Abbas","Abbudin","Abdul","Abdul-Ahad","Abdul-Aziz","Abdul-Badi","Abdul-Basir","Aladdin","Amin","Amir","Anis","Ansari","Asad","As'ad","Asadel","Ashraf","Asif","Asim","Aswad","Ata' Allah","Badi","Badr","Badr al Din","Badri","Bahij","Bahir","Bakr","Bakri","Baligh","Bandar","Barakah","Barir","Bashir","Bashshar","Basim","Bayhas","Bilal","Bishr","Boulos","Budail","Cemal","Coman","Dabir","Dani","Darwish","Dawud","Dhakir","Dhakwan","Dirar","Emir","Fadi","Fadil","Fahad","Fakhir","Fakih","Falah","Falih","Faraj","Fareeq","Farhan","Farid","Farook","Fathi","Ferran","Fida","Fikri","Gadil","Gamali","Ghalib","Ghanim","Ghassan","Ghawth","Ghazi","Ghazwan","Ghiyath","Ginton","Givon","Habbab","Habib","Hadad","Hakim","Hamal","Hamalah","Hamas","Hamid","Hanbal","Hasim","Hassan","Hatim","Haydar","Haytham","Hayyan","Hazim","Hilal / Hilel","Hilmi","Hisham","Ibrahim","Id","Idris","Ihsan","Ihtisham","Ikrimah","Ilias","Imad","Imad al Din","Imam","Imtiyaz","In'am","Iqbal","Irfan","Ishaq","Isma'il","Issam","Iyad","Izz al Din","Jabbar","Jabir","Jafar","Jalal","Jaleel","Jalil","Jamal","Jameel","Jarir","Jasim","Jaul","Jaun","Jawad","Jawhar","Jed","Jibril","Jihad","Kadeen","Kadeer","Kadin","Kadir","Kahil","Kalb","Kalil","Kaliq","Kamal","Kameel","Kaniel","Karam","Kardal","Karif","Karim","Kaseem","Kasib","Kateb","Kedar","Khalil","Labib","Laith","Latif","Layth","Leron","Lu'ay","Lubaid","Lutfi","Madani","Mahbub","Mahdi","Mahir","Mahjub","Mahmud","Mahomet","Majid","Malik","Mamdouh","Ma'mun","Mandhur","Mansur","Marid","Ma'ruf","Mashhur","Masud","Mazhar","Mohammed","Mufid","Muhammad","Muhib","Muhsin","Muhtadi","Nabeel","Nabhan","Nabih","Nadim","Nadir","Nahid","Najeeb","Naji","Najjar","Na'man","Namir","Nashwan","Nasib","Nasir","Omar","Osman","Qabil","Qadim","Qadir","Qamar","Qasim","Qatadah","Quasim","Qudamah","Qusay","Qutb","Rafid","Raja","Rajih","Rakin","Ramadan","Rami","Ramzi","Rani","Rashad","Rasil","Rasin","Rasmi","Rasul","Ratib","Rayhan","Rayyan","Razin","Rihab","Rimon","Ruhi","Rushd","Rushdi","Ruwayd","Saad","Sa'adah","Sabir","Sa'd al Din","Sadid","Sadiq","Safiy al Din","Safuh","Sahib","Sahir","Sa'ib","Sajid","Sakhr","Salah","Salamah","Saleh","Salman","Sameer","Sami","Samien","Samih","Saqr","Sariyah","Sarni","Saud","Seif","Selim","Seyed","Shadi","Shadin","Taj","Talal","Talib","Tamam","Tamir","Tarif","Ubaid","Umar","Umarah","Urwah","Wadi","Wajdi","Wajid","Wajih","Wakil","Walid","Yazan","Yazeed","Yoonus","Youssef","Yushua","Yusri","Yusuf","Zafar","Zaid","Zaim","Zakwan","Zarif","Zayn","Zimraan","Zoltan","Zubayr"],"girl":["Abida","Abla","Adelmira","Adila","Adra","Afiya","Ahlam","Akeylah","Akila","Akira","Alawi","Aleaha","Alhina","Alima","Alleah","Almeda","Almira","Alyas","Aman","Amani","Amapola","Ameena","Amina","Amira","Andala","Annisa","Ara","Arqa","Aruba","Asha","Ashia","Asiya","Asta","Atiya","Atocha","Aza","Azia","Azima","Azucena","Badia","Bahi","Ban","Bassma","Bibi","Bushra","Buthanaya","Cantara","Celmira","Clemira","Derifa","Dunia","Eman","Emani","Ezina","Fadila","Faiza","Farah","Farida","Fariha","Fatema","Fatima","Fatina","Fukayna","Ghada","Ghazala","Hayat","Hayfa","Hiba","Husniya","Ieesha","Iman","Imoni","Indamira","Jada","Jadara","Jaleela","Jameela","Jamila","Janna","Jarita","Jasara","Jasura","Jazmin","Jemila","Jenna","Jhazala","Johara","Jumana","Kadeejah","Kadija","Kadira","Kahla","Kalah","Kalifa","Kalima","Kareema","Karima","Kayla","Keila","Ketifa","Khadijah","Khalifa","Khalila","Khalilah","Khayla","Laela","Laila","Lamis","Latifah","Layia","Letifa","Liesha","Lilah","Lilly","Lisha","Lujayn","Lulu","Mahira","Maisara","Maisha","Maizah","Majida","Makina","Manar","Mariyan","Marjani","Martiza","Marya","Masarra","Massarra","Maya","Maysa","Medina","Mocha","Mouna","Mumtaz","Munira","Munirah","Mushira","Nabiha","Nabila","Nada","Nada","Nadeah","Nadima","Nafisa","Nagia","Naila","Naila","Nailah","Naima","Naja","Najee","Najla","Najma","Nakea","Nakeya","Nakia","Nakia","Nakiya","Natara","Natori","Naylila","Nazira","Nedira","Nekia","Nikia","Nisa","Nykia","Oraida","Qadesa","Qadira","Qamra","Qawaya","Qawiya","Qodra","Qubilah","Querima","Raashida","Rabia","Rabiah","Radeyah","Radia","Rafika","Raidah","Rajah","Rajiya","Randa","Rania","Raniyah","Rasha","Rashida","Rawiya","Raziya","Reema","Rida","Rima","Rukan","Saarah","Sabah","Sabiya","Sabriyya","Sadia","Sadika","Sadiqa","Sadiya","Safa","Safia","Safiyya","Sahar","Sahara","Saida","Sajia","Sakina","Salem","Salima","Salma","Sama","Samia","Samiah","Samir","Samira","Samya","Sana","Saree","Sarra","Selma","Shadia","Shadiya","Shahar","Shahina","Shakala","Shakela","Shakeria","Shakila","Shakira","Shakyra","Shamara","Shamaria","Shaqira","Shaquille","Shaza","Shula","Sky","Suhayla","Surayya","Tahani","Tahira","Tahiyya","Takeia","Takeya","Takia","Takiya","Talitha","Tamkin","Taobra","Taqiyya","Tekia","Thana","Thurayya","Ulima","Uma","Uzza","Vega","Waheeda","Wajida","Walaa","Walad","Xavier","Yamilet","Yaminah","Yaqiza","Yasmin","Yemena","Yesenia","Yessenia","Zada","Zafina","Zafirah","Zahiya","Zaidee","Zakiya","Zakiyya","Zarifa","Zayna","Zaynah","Zeina","Zidan","Zubaida","Zubaidah","Zuella","Zulecia","Zuleika","Zuleima","Zulema","Zulima","Zuly","Zurafa","Zurisaday"]},"asian":{"boy":["Aika","Aki","Akihiro","Akiko","Amaya","Anka","Annaisha","Anzu","Asami","Asuka","Ayano","Biyu","Bohai","Bolin","Changchang","Changming","Changpu","Changying","Chao","Chenglei","Chenguang","Chieko","Chiharu","Chikako","China","Chuntao","Cuifen","Da","Daichi","Dandan","Délì","Deming","Den","Dingxiang","Dong","Donghai","Duyi","Ehuang","Eichi","Eiko","Emiko","Emiyo","Enlai","Erity","Etsuko","Fang","Fenfang","Fuhua","Fujita","Fumiko","Gang","Gen","Genghis","Genki","Gina","Goro","Guang","Gui","Guiren","Guoliang","Guotin","Guozhi","Hachiro","Hajime","Hana","Hanako","Hanan","Haneen","Haru","Haruki","Haruo","Hayami","He","Heng","Hide","Hiroki","Hiroyuki","Hisoka","Ho","Hop","Hotaru","Hu","Hualing","Huan","Hui","Huian","Huidai","Huifang","Huiliang","Huiqing","Huojin","Iku","Ine","Jianjun","Jianyu","Jiao","Jie","Jing","Jingguo","Jinhai","Jinjing","Joben","Juan","Jun","Kameko","Kang","Kano","Katashi","Katsumi","Kawa","Kei","Kiko","Kikuko","Kimiko","Kin","Kiyo","Kojika","Komako","Kong","Koshiro","Kumi","Kuni","Kura","Kurva","Kyoto","Lan","Liang","Lien","Lihua","Lin","Madoka","Mai","Manzo","Masahiro","Masako","Masanori","Meixiu","Michiya","Mieko","Mikia","Mikki","Mine","Ming-húa","Misumi","Mitsuo","Morina","Moto","Nani","Naoki","Naoko","Nikko","Noriko","On","Park","Ping","Qi","Qiao","Qiaolian","Qiqiang","Qiu","Quan","Quon","Ran","Rei","Renshu","Renxiang","Rikona","Rou","Ruolan","Ryo","Ryoko","Ryu","Sadao","Sakae","Sakiya","Satoshi","Seki","Setsuko","Shan","Shi","Shigeko","Shin'ichi","Shirong","Shoi-Ming","Shoichi","Shoma","Shu","Shuang","Shuji","Shun","Song","Sora","Sueh-Yén","Suki","Suyin","Sying","Tadame","Taigen","Taiyo","Takane","Takara","Take","Tama","Tao","Tatsuo","Tenchi","Tengfei","Teru","Teruma","Tingzhe","Tomi","Tomiko","Toshi-shita","Tozen","Tsuna","Tsutomu","Tu","Tung","Ume","Umi","Urano","Uta","Weici","Weimin","Weisheng","Wen","Wenqian","Wing","Xiaofan","Xiaojing","Xiaosheng","Xiaotong","Xiaowen","Xiasheng","Xing","Xiu","Xiulan","Xue","Xueqin","Yanlin","Yasuko","Yi","Ying","Yingjie","Yo","Yongrui","Yori","Yoshi","Yoshikazu","Yoshinori","You","Yu","Yuan","Yue","Yuki","Yumena","Yunru","Yunxu","Yuriko","Yusheng","Yuudai","Zenguang","Zhen","Zhengsheng","Zhensheng","Zhiqiang","Zhu","Zi","Zongying"],"girl":["Ah Cy","Ah Kum","Ah Lam","Ai","Aiguo","Aimi","Aiya","Akane","Akasuki","Akemi","Akihiko","Akina","Akira","Amaterasu","Amida","An","Angúo","Annya","Arakan","Arata","Arisu","Asa","Atsushi","Au","Ayaka","Ayako","Ayumi","Azami","Azumi","Bai","Bao","Baozhai","Bingwen","Bo","Bojing","Boqin","Bunko","Chaoxiang","Cheng","Chiasa","Chinami","Chitose","Chiyo","Chizu","Cho","Chongan","Chongkun","Chonglin","Chu Hua","Chuanli","Chunhua","Dai","Daisuke","Daitan","Daiyu","Delun","Déshì","Déwei","Dingbang","Dongmei","Ena","Eri","Etsu","Ezume","Fa","Fai","Feng","Fengge","Fu","Fudo","Gan","Geming","Guangli","Guowei","Hai","Hideko","Hideyo","Hikaru","Hiro","Hiromi","Hisano","Hong","Honghui","Hongqi","Hoshi","Howin","Hua","Huang Fu","Huifen","Huilang","Huizhong","Hulin","Hung","Isao","Ito","Izanagi","Jaw-Long","Jia","Jian","Jiang","Jianguo","Jiayi","Jiaying","Jin","Jinghua","Junjie","Junko","Kaede","Kaiyo","Kana","Kane","Kaori","Kazashi","Kazuhiko","Kazuko","Keiko","Ken","Kenji","Kentaro","Kibo","Kichi","Kioshi","Kishi","Kitaro","Kiyoshi","Koemi","Kohana","Kono","Kotone","Kozue","Kueng","Lanying","Lee","Li","Lì","Lijuan","Liling","Ling","Linh","Liqiu","Liu","Liwei","Lok","Longwei","Luli","Machi","Maimi","Maki","Mako","Mana","Mani","Maria","Maru","Masaaki","Masashi","Masayuki","Masuyo","Mayumi","Mei","Meifeng","Meihui","Meilin","Meirong","Meiying","Michi","Mikazuki","Mingli","Mingxia","Mingyu","Minori","Minsheng","Minzhe","Mirai","Misaki","Miya","Miyo","Mizuki","Momoko","Monterio","Nagisa","Namiyo","Nari","Natsuko","Nen","Ning","Ninghong","Nobu","Nobuyuki","Nuo","Nuwa","Nyoko","Osamu","Ozuru","Peizhi","Peng","Qianfan","Qiang","Qing","Qingling","Qingshan","Qingzhao","Rai","Renjiro","Ringo","Roku","Rong","Ronin","Ru","Ruomei","Saburo","Sachio","Sango","Sato","Sayuri","Seijun","Senichi","Shaiming","Shamon","Shanyuan","Shen","Shig","Shiho","Shikha","Shìlín","Shin","Shing","Shino","Shiori","Shizu","Shunyuan","Sin'ichi","Siyu","Sumiye","Sute","Suzuki","Taishiro","Taiwan","Takahiro","Takeo","Takiyo","Tamako","Tame","Tamiko","Tanaka","Tani","Taro","Tetsip","Tetsuya","Ting","Tomo","Tomoni","Torio","Toshi","Toshiko","Ushi","Utano","Wakumi","Wang","Wattan","Weiyuan","Wencheng","Wenyan","Wuzhou","Xiang","Xiaobo","Xiaodan","Xiaohui","Xiaojian","Xiaolian","Xiaoling","Xiaozhi","Xin","Xiurong","Xueyou","Yan","Yang","Yanyu","Yaochuan","Yaozu","Yasashiku","Yayoi","Ye","Yenay","Yingtai","Yoichi","Yong","Yongnian","Yoshie","Yoshimasa","Yoshito","Yuanjun","Yubi","Yuji","Yuko","Yumiko","Yuming","Zedong","Zengguang","Zhaohui","Zhenzhen","Zhilan","Zhìyuan","Zhong","Zian","Zihao","Zinan","Zixin","Zongmeng"]},"english":{"boy":["AARON","ABEL","ABELARDO","ABRAHAM","ABRAM","ADALBERTO","ADAM","ADAN","ADDISON","ADITYA","ADOLFO","ADONIS","ADRIAN","ADRIEN","AGUSTIN","AHMAD","AHMED","AIDAN","AIDEN","ALAN","ALBERT","ALBERTO","ALDO","ALEC","ALEJANDRO","ALESSANDRO","ALEX","ALEXANDER","ALEXANDRE","ALEXANDRO","ALEXIS","ALFONSO","ALFRED","ALFREDO","ALI","ALLAN","ALLEN","ALONSO","ALONZO","ALVARO","ALVIN","AMIR","ANDRE","ANDREAS","ANDRES","ANDREW","ANDY","ANGEL","ANGELO","ANTHONY","ANTOINE","ANTON","ANTONIO","ANTONY","ARIC","ARIEL","ARJUN","ARMAN","ARMAND","ARMANDO","ARMANI","ARNOLD","ARNULFO","ARON","ARRON","ARTHUR","ARTURO","ASHER","ASHTON","AUGUST","AUGUSTINE","AURELIO","AUSTEN","AUSTIN","AVERY","AXEL","BAILEY","BARRY","BEAU","BEN","BENITO","BENJAMIN","BENNETT","BENNY","BERNARD","BERNARDO","BILL","BILLY","BLAINE","BLAKE","BOBBY","BRAD","BRADEN","BRADLEY","BRADY","BRANDEN","BRANDO","BRANDON","BRAULIO","BRAXTON","BRAYAN","BRAYDEN","BRENDAN","BRENDEN","BRENDON","BRENNAN","BRENNEN","BRENT","BRET","BRETT","BRIAN","BRICE","BROCK","BRODY","BROOKS","BRUCE","BRUNO","BRYAN","BRYANT","BRYCE","BRYSON","BYRON","CADE","CADEN","CAESAR","CALEB","CALVIN","CAMERON","CARL","CARLO","CARLOS","CARSON","CARTER","CASEY","CEASAR","CEDRIC","CESAR","CHAD","CHANCE","CHANDLER","CHARLES","CHARLIE","CHASE","CHAZ","CHRIS","CHRISTIAN","CHRISTOPHER","CLARENCE","CLARK","CLAUDIO","CLAY","CLAYTON","CLIFFORD","CLINTON","COBY","CODY","COLBY","COLE","COLEMAN","COLIN","COLLIN","COLTON","CONNER","CONNOR","CONOR","CONRAD","COOPER","CORBIN","COREY","CORY","CRAIG","CRISTIAN","CRISTOBAL","CRISTOPHER","CRUZ","CURTIS","CYRUS","D'ANGELO","DAKOTA","DALE","DALLAS","DALTON","DAMIAN","DAMIEN","DAMION","DAMON","DAN","DANE","DANIEL","DANNY","DANTE","DARIAN","DARIEN","DARIN","DARIO","DARIUS","DARNELL","DARRELL","DARREN","DARRYL","DARWIN","DARYL","DAVID","DAVIN","DAVION","DAVIS","DAVON","DEAN","DEANDRE","DEION","DEJON","DEMETRIUS","DENNIS","DENNY","DENZEL","DEON","DEREK","DERICK","DERRICK","DESHAWN","DESMOND","DEVAN","DEVANTE","DEVEN","DEVIN","DEVON","DEVONTE","DEVYN","DIEGO","DILLON","DIMITRI","DION","DOMINGO","DOMINIC","DOMINICK","DOMINIK","DOMINIQUE","DON","DONALD","DONOVAN","DONTE","DORIAN","DOUGLAS","DRAKE","DREW","DUNCAN","DUSTIN","DWAYNE","DWIGHT","DYLAN","EARL","EDDIE","EDDY","EDGAR","EDGARDO","EDMUND","EDSON","EDUARDO","EDWARD","EDWIN","EFRAIN","EFREN","ELEAZAR","ELI","ELIAS","ELIJAH","ELISEO","ELISHA","ELLIOT","ELLIOTT","ELLIS","ELMER","ELTON","ELVIS","EMANUEL","EMILIANO","EMILIO","EMMANUEL","ENRIQUE","ERIBERTO","ERIC","ERICK","ERIK","ERNEST","ERNESTO","ERNIE","ERWIN","ESTEBAN","ESTEVAN","ETHAN","EUGENE","EVAN","EVERARDO","EVERETT","EZEKIEL","EZEQUIEL","EZRA","FABIAN","FAUSTO","FAVIAN","FEDERICO","FELIPE","FELIX","FERMIN","FERNANDO","FIDEL","FILIBERTO","FLAVIO","FORREST","FRANCIS","FRANCISCO","FRANCO","FRANK","FRANKIE","FRANKLIN","FRED","FREDDIE","FREDDY","FREDERICK","FREDY","GABRIEL","GAGE","GARETT","GARRET","GARRETT","GARY","GAVIN","GENARO","GENE","GEOFFREY","GEORGE","GEOVANNI","GEOVANNY","GEOVANY","GERALD","GERARDO","GERMAN","GERSON","GIANNI","GILBERT","GILBERTO","GINO","GIOVANI","GIOVANNI","GIOVANNY","GLEN","GLENN","GONZALO","GORDON","GRAHAM","GRANT","GRAYSON","GREGORIO","GREGORY","GRIFFIN","GUADALUPE","GUILLERMO","GUNNAR","GUSTAVO","GUY","HANS","HARLEY","HAROLD","HARRISON","HARRY","HARVEY","HASSAN","HAYDEN","HECTOR","HENRY","HERBERT","HERIBERTO","HERMAN","HERNAN","HOLDEN","HORACIO","HOWARD","HUGO","HUMBERTO","HUNTER","IAN","IBRAHIM","IGNACIO","IMMANUEL","IRVIN","IRVING","ISAAC","ISAAK","ISAC","ISAI","ISAIAH","ISAIAS","ISIAH","ISIDRO","ISMAEL","ISRAEL","ISSAC","IVAN","IZAIAH","JACE","JACK","JACKIE","JACKSON","JACKY","JACOB","JADEN","JAIME","JAIRO","JAKE","JAKOB","JALEN","JAMAL","JAMES","JAMIE","JARED","JAROD","JARON","JARRED","JARRETT","JARROD","JASON","JASPER","JAVIER","JAVON","JAY","JAYDEN","JAYLEN","JAYSON","JEAN","JEFF","JEFFERSON","JEFFERY","JEFFREY","JEREMIAH","JEREMY","JERMAINE","JEROME","JERROD","JERRY","JESSE","JESSIE","JESSY","JESUS","JIM","JIMMY","JOAQUIN","JOE","JOEL","JOEY","JOHAN","JOHN","JOHNATHAN","JOHNATHON","JOHNNIE","JOHNNY","JON","JONAH","JONAS","JONATAN","JONATHAN","JONATHON","JORDAN","JORDEN","JORDI","JORDON","JORGE","JOSE","JOSE LUIS","JOSEPH","JOSH","JOSHUA","JOSIAH","JOSUE","JOVAN","JOVANI","JOVANNI","JOVANNY","JOVANY","JUAN","JUAN CARLOS","JULIAN","JULIEN","JULIO","JULIUS","JUNIOR","JUSTICE","JUSTIN","JUVENAL","JUWAN","KADE","KADEN","KAI","KALEB","KAMERON","KAREEM","KARL","KASEY","KEANU","KEATON","KEEGAN","KEENAN","KEITH","KELLEN","KELLY","KELVIN","KEN","KENDALL","KENDRICK","KENNEDY","KENNETH","KENNY","KENT","KEVEN","KEVIN","KHALIL","KIAN","KIERAN","KIRK","KOBE","KOBY","KODY","KOREY","KORY","KRISTIAN","KRISTOFER","KRISTOPHER","KURT","KURTIS","KYLE","KYLER","LANCE","LANDON","LANE","LARRY","LAWRENCE","LEE","LEO","LEON","LEONARD","LEONARDO","LEONEL","LEOPOLDO","LEROY","LEVI","LEWIS","LIAM","LISANDRO","LOGAN","LORENZO","LOUIE","LOUIS","LUCAS","LUCIANO","LUCIO","LUIS","LUIS ANGEL","LUIZ","LUKAS","LUKE","MACKENZIE","MALACHI","MALCOLM","MALIK","MANUEL","MARC","MARCEL","MARCELINO","MARCELO","MARCO","MARCO ANTONIO","MARCOS","MARCUS","MARIANO","MARIO","MARK","MARK ANTHONY","MARKUS","MARLON","MARQUES","MARQUIS","MARQUISE","MARSHALL","MARTIN","MARVIN","MASON","MATEO","MATHEW","MATTEO","MATTHEW","MAURICE","MAURICIO","MAURO","MAX","MAXIMILIAN","MAXIMILIANO","MAXIMILLIAN","MAXWELL","MELVIN","MICAH","MICHAEL","MICHEAL","MIGUEL","MIGUEL ANGEL","MIKE","MILAN","MILES","MILTON","MISAEL","MITCHEL","MITCHELL","MOHAMED","MOHAMMAD","MOHAMMED","MOISES","MORGAN","MOSES","MYLES","NATHAN","NATHANAEL","NATHANIEL","NATHEN","NEAL","NEIL","NELSON","NESTOR","NICHOLAS","NICK","NICKOLAS","NICO","NICOLAS","NIGEL","NIKHIL","NIKKO","NIKO","NIKOLAS","NOAH","NOE","NOEL","NOLAN","NORMAN","OCTAVIO","OLIVER","OMAR","ORION","ORLANDO","OSBALDO","OSCAR","OSVALDO","OSWALDO","OWEN","PABLO","PAOLO","PARKER","PATRICK","PAUL","PAYTON","PEDRO","PETER","PEYTON","PHILIP","PHILLIP","PIERCE","PRESTON","QUENTIN","QUINCY","QUINN","QUINTIN","QUINTON","RAFAEL","RAHUL","RALPH","RAMIRO","RAMON","RANDALL","RANDY","RAPHAEL","RASHAD","RAUL","RAY","RAYMOND","RAYMUNDO","REECE","REED","REGINALD","REID","RENE","REUBEN","REX","REY","REYES","REYMUNDO","REYNALDO","RICARDO","RICHARD","RICK","RICKEY","RICKY","RIGOBERTO","RILEY","RIVER","ROBERT","ROBERTO","ROBIN","ROCKY","RODERICK","RODNEY","RODOLFO","RODRIGO","ROGELIO","ROGER","ROHAN","ROLAND","ROLANDO","ROMAN","ROMEO","RONALD","RONALDO","RONNIE","RORY","ROSS","ROY","RUBEN","RUDY","RUSSELL","RYAN","SAGE","SAHIL","SALVADOR","SAM","SAMIR","SAMMY","SAMSON","SAMUEL","SANTIAGO","SANTINO","SANTOS","SAUL","SAWYER","SCOTT","SEAN","SEBASTIAN","SERGIO","SETH","SHANE","SHANNON","SHAUN","SHAWN","SHEA","SHELDON","SIDNEY","SIMON","SKYLAR","SKYLER","SOLOMON","SONNY","SPENCER","STANLEY","STEFAN","STEPHAN","STEPHEN","STEPHON","STERLING","STEVE","STEVEN","STONE","STUART","SUNNY","TALON","TANNER","TATE","TAYLOR","TERRANCE","TERRELL","TERRENCE","TERRY","TEVIN","THEODORE","THOMAS","TIMOTHY","TOBIAS","TOBY","TODD","TOM","TOMAS","TOMMY","TONY","TRAVIS","TRENT","TRENTON","TREVON","TREVOR","TREY","TRISTAN","TRISTEN","TRISTIAN","TRISTIN","TRISTON","TROY","TUCKER","TY","TYLER","TYLOR","TYREE","TYRELL","TYRONE","TYSON","UBALDO","ULICES","ULISES","ULYSSES","URIEL","VALENTIN","VICENTE","VICTOR","VIDAL","VINCENT","VLADIMIR","WADE","WALKER","WALTER","WARREN","WAYNE","WESLEY","WESTON","WILFREDO","WILL","WILLIAM","WILLIE","WILSON","WINSTON","WYATT","XAVIER","ZACHARIAH","ZACHARY","ZACHERY","ZACKARY","ZACKERY","ZANE","ZECHARIAHA"],"girl":["AADHYA","AADYA","AALEYAH","AALIAH","AALIYAH","AANYA","AARNA","AAROHI","AARYA","AASHVI","ABBEY","ABBIE","ABBIGAIL","ABBY","ABBYGAIL","ABELLA","ABIGAIL","ABRIANNA","ABRIELLE","ABRIL","ABYGAIL","ACACIA","ADA","ADALEE","ADALENE","ADALIA","ADALIE","ADALINA","ADALINE","ADALY","ADALYN","ADALYNN","ADAMARI","ADAMARIS","ADARA","ADDALYN","ADDELYN","ADDIE","ADDILYN","ADDILYNN","ADDISON","ADDISYN","ADDYSON","ADELA","ADELAIDE","ADELE","ADELINA","ADELINE","ADELLE","ADELYN","ADELYNN","ADILENE","ADILYN","ADILYNN","ADINA","ADITI","ADLEY","ADRIANA","ADRIANNA","ADRIELLE","ADRIENNE","ADRINA","AERIS","AGNES","AIDA","AILA","AILANI","AILEE","AILEEN","AILIN","AILYN","AIMEE","AINARA","AINE","AINSLEY","AIRAM","AISHA","AISLIN","AISLINN","AISLYN","AISLYNN","AITANA","AIYANA","AIYANNA","AIZA","AKEMI","AKIRA","AKSHARA","ALAIA","ALAINA","ALANA","ALANAH","ALANI","ALANIS","ALANNA","ALANNAH","ALANY","ALAYA","ALAYAH","ALAYNA","ALAYSIA","ALBA","ALEAH","ALEEAH","ALEENA","ALEENAH","ALEIDA","ALEJANDRA","ALEKSANDRA","ALENA","ALESSA","ALESSANDRA","ALESSIA","ALEX","ALEXA","ALEXANDRA","ALEXANDRIA","ALEXI","ALEXIA","ALEXIS","ALEXXA","ALEYAH","ALEYDA","ALEYNA","ALEYZA","ALI","ALIA","ALIAH","ALIANA","ALIANNA","ALICE","ALICIA","ALIJAH","ALINA","ALINAH","ALINE","ALINNA","ALISA","ALISHA","ALISON","ALISSA","ALISSON","ALITZEL","ALIVIA","ALIYA","ALIYAH","ALIYANA","ALIZA","ALIZAY","ALIZE","ALLEGRA","ALLIE","ALLISON","ALLISSON","ALLY","ALLYSON","ALMA","ALONDRA","ALORA","ALTHEA","ALY","ALYA","ALYANA","ALYANNA","ALYNA","ALYNNA","ALYSON","ALYSSA","ALYSSON","ALYZA","AMAIA","AMAIRA","AMAIRANI","AMAIRANY","AMALIA","AMANDA","AMANI","AMARA","AMARI","AMARIAH","AMARIE","AMARIS","AMAYA","AMAYAH","AMBAR","AMBER","AMBERLY","AMEENA","AMEERA","AMELIA","AMELIE","AMERICA","AMERIE","AMETHYST","AMIA","AMIAH","AMILIA","AMINA","AMINAH","AMIRA","AMIRAH","AMIYA","AMIYAH","AMOR","AMORA","AMORETTE","AMY","AMYA","AN","ANA","ANABEL","ANABELL","ANABELLA","ANABELLE","ANAHI","ANAI","ANAIAH","ANAIS","ANAIYA","ANAIYAH","ANALEAH","ANALEE","ANALEIGH","ANALI","ANALIA","ANALIAH","ANALISA","ANALISE","ANALIYAH","ANANYA","ANASOFIA","ANASTASIA","ANAYA","ANAYAH","ANAYELI","ANDI","ANDIE","ANDREA","ANDROMEDA","ANGEL","ANGELA","ANGELIA","ANGELICA","ANGELINA","ANGELINE","ANGELIQUE","ANGELY","ANGELYN","ANGIE","ANI","ANIAH","ANIKA","ANISA","ANISHA","ANISSA","ANITA","ANIYA","ANIYAH","ANJALI","ANN","ANNA","ANNABEL","ANNABELL","ANNABELLA","ANNABELLE","ANNABETH","ANNALEAH","ANNALEE","ANNALEIGH","ANNALIA","ANNALIE","ANNALIESE","ANNALISA","ANNALISE","ANNALY","ANNE","ANNELIESE","ANNELISE","ANNETTE","ANNIE","ANNIKA","ANTONELLA","ANTONIA","ANVI","ANVIKA","ANYA","APRIL","ARABELLA","ARABELLE","ARACELI","ARACELY","ARANTZA","ARANZA","ARAYA","ARDEN","ARELI","ARELY","ARI","ARIA","ARIADNA","ARIADNE","ARIAH","ARIANA","ARIANNA","ARIANNE","ARIANNY","ARIBELLA","ARIE","ARIEL","ARIELA","ARIELLA","ARIELLE","ARIES","ARISBETH","ARISSA","ARIYA","ARIYAH","ARLEEN","ARLENE","ARLET","ARLETH","ARLETTE","ARLYN","ARMANI","ARROW","ARTEMIS","ARWEN","ARYA","ARYAH","ARYANA","ARYANNA","ASHA","ASHLEE","ASHLEY","ASHLY","ASHLYN","ASHLYNN","ASHTON","ASHTYN","ASIA","ASPEN","ASTRID","ATHENA","ATZIRI","AUBREE","AUBREY","AUBRI","AUBRIANA","AUBRIANNA","AUBRIE","AUBRIELLA","AUBRIELLE","AUBRY","AUDRA","AUDREE","AUDREY","AUDRIANA","AUDRIANNA","AUDRIE","AUDRINA","AUGUST","AULANI","AURA","AUREA","AURELIA","AURORA","AUSTIN","AUSTYN","AUTUMN","AVA","AVAH","AVALON","AVALYN","AVALYNN","AVANI","AVARIE","AVARY","AVELINE","AVEN","AVERI","AVERIE","AVERY","AVIA","AVIANA","AVIANNA","AVIGAIL","AVILA","AVIVA","AVLEEN","AVNEET","AVNI","AVRIL","AYA","AYAH","AYANA","AYANNA","AYELEN","AYESHA","AYLA","AYLEEN","AYLIN","AYUMI","AYVA","AYVAH","AZALEA","AZARIA","AZARIAH","AZENETH","AZUCENA","AZUL","BABY GIRL","BAILEE","BAILEY","BARBARA","BAYLEE","BEATRICE","BEATRIX","BEATRIZ","BECKY","BELEN","BELINDA","BELLA","BELLAMY","BELLAROSE","BELLE","BENTLEY","BERENICE","BERKELEY","BERLIN","BERNADETTE","BERNICE","BETHANY","BETSABE","BETSAIDA","BETTY","BEVERLY","BEXLEY","BIANCA","BILLIE","BIRDIE","BLAIR","BLAIRE","BLAKE","BLAKELY","BLANCA","BLESSING","BLOSSOM","BLYTHE","BOBBIE","BONNIE","BOWIE","BRAELYN","BRAELYNN","BRAYLEE","BREANNA","BREE","BRENDA","BRENNA","BRIA","BRIANA","BRIANNA","BRIAR","BRIDGET","BRIDGETTE","BRIELLA","BRIELLE","BRIGITTE","BRINLEY","BRISA","BRISEIDA","BRISEIS","BRISEYDA","BRISSA","BRISTOL","BRITNEY","BRITTANY","BRITTNEY","BROOKE","BROOKLYN","BROOKLYNN","BRYANA","BRYANNA","BRYCE","BRYLEE","BRYN","BRYNLEE","BRYNLEY","BRYNN","CADENCE","CAIA","CAILEY","CAILYN","CAITLIN","CAITLYN","CALI","CALIANA","CALISTA","CALLA","CALLIE","CALLIOPE","CAMBRIA","CAMDEN","CAMELLIA","CAMERON","CAMILA","CAMILLA","CAMILLE","CAMRYN","CANDACE","CANDICE","CANDY","CAPRI","CARA","CARINA","CARISSA","CARLA","CARLEE","CARLEY","CARLI","CARLIE","CARLY","CARMELA","CARMEN","CAROL","CAROLINA","CAROLINE","CAROLYN","CARRIE","CARTER","CASEY","CASSANDRA","CASSIA","CASSIDY","CASSIE","CATALEYA","CATALINA","CATERINA","CATHERINE","CATHY","CATTALEYA","CATTLEYA","CAYDENCE","CAYLA","CAYLEE","CECELIA","CECILIA","CECILY","CELESTE","CELIA","CELINA","CELINE","CHANDLER","CHANEL","CHANELLE","CHARISMA","CHARITY","CHARLEE","CHARLEIGH","CHARLENE","CHARLESTON","CHARLEY","CHARLI","CHARLIE","CHARLIZE","CHARLOTTE","CHAYA","CHELSEA","CHELSEY","CHERISH","CHERRY","CHERYL","CHEVELLE","CHEYANNE","CHEYENNE","CHIARA","CHLOE","CHRISTINA","CHRISTINE","CHRISTY","CIARA","CIELO","CIENNA","CIERRA","CINDY","CITLALI","CITLALLI","CITLALY","CLAIRE","CLARA","CLARE","CLARISSA","CLAUDIA","CLEMENTINE","CLEO","CLIO","CLOVER","COCO","COLBIE","COLETTE","COLLETTE","COLLINS","CONNIE","CONSTANCE","CONSTANZA","CORA","CORAL","CORALIE","CORALINE","CORDELIA","CORINA","CORINNE","COSETTE","COURTNEY","CRISTAL","CRISTINA","CRYSTAL","CYNTHIA","DAENERYS","DAFNE","DAHLIA","DAIANA","DAISY","DAKOTA","DALARY","DALEYSA","DALEYZA","DALIA","DALIAH","DALILA","DALILAH","DALLAS","DAMARIS","DANA","DANAE","DANI","DANIA","DANICA","DANIELA","DANIELLA","DANIELLE","DANIKA","DANNA","DANNI","DAPHNE","DARA","DARCY","DARIA","DARIANA","DARLA","DARLENE","DARYA","DASHA","DAVINA","DAYANA","DAYANARA","DAYANI","DAYANNA","DEANNA","DEBORA","DEBORAH","DEISY","DEJA","DELANEY","DELANIE","DELANY","DELIA","DELILAH","DELLA","DELYLAH","DEMI","DENISE","DENISSE","DESIRAE","DESIREE","DESTINEE","DESTINY","DEVIN","DEVYN","DIAMOND","DIANA","DIANE","DIANNA","DINA","DINAH","DIOR","DISHA","DIVINA","DIVINE","DIYA","DOMINIQUE","DONNA","DORA","DORIS","DOROTHY","DREW","DULCE","DYLAN","ECHO","EDEN","EDIE","EDITH","EGYPT","EILEEN","EISLEY","EIZA","ELA","ELAINA","ELAINE","ELAYNA","ELEANOR","ELENA","ELENI","ELIA","ELIANA","ELIANNA","ELIN","ELINA","ELINOR","ELISA","ELISABETH","ELISE","ELISHA","ELISSA","ELIZA","ELIZABETH","ELLA","ELLE","ELLEN","ELLENA","ELLERY","ELLIA","ELLIANA","ELLIANNA","ELLIE","ELLINGTON","ELLIOT","ELLIOTT","ELLIS","ELLISON","ELLORA","ELLY","ELODIE","ELOISA","ELOISE","ELORA","ELSA","ELSIE","ELSY","ELVIA","ELVIRA","ELYANA","ELYANNA","ELYSE","ELYSIA","ELYSSA","ELYZA","EMA","EMALEE","EMAN","EMANI","EMBER","EMELIA","EMELY","EMELYN","EMERALD","EMERI","EMERIE","EMERSON","EMERSYN","EMERY","EMI","EMIKO","EMILEE","EMILIA","EMILIANA","EMILIE","EMILY","EMMA","EMMAH","EMMALEE","EMMALINE","EMMALYN","EMMALYNN","EMMANUELLE","EMMARIE","EMME","EMMELINE","EMMERSON","EMMIE","EMMY","EMORY","EMRY","ENYA","ERICA","ERICKA","ERIKA","ERIN","ERIS","ESME","ESMERALDA","ESPERANZA","ESSENCE","ESTEFANI","ESTEFANIA","ESTEFANY","ESTELA","ESTELLA","ESTELLE","ESTER","ESTHER","ESTRELLA","ETTA","EUNICE","EVA","EVALINA","EVALYN","EVALYNN","EVAN","EVANGELINA","EVANGELINE","EVE","EVELIN","EVELINA","EVELYN","EVELYNN","EVER","EVERLEE","EVERLEIGH","EVERLEY","EVERLY","EVIE","EVOLET","EZRA","FABIOLA","FAITH","FALLON","FANNY","FARAH","FARRAH","FATIMA","FATIMAH","FAYE","FELICIA","FELICITY","FERNANDA","FINLEY","FINNLEY","FIONA","FIORELLA","FLORA","FLORENCE","FRANCES","FRANCESCA","FRANCINE","FRANCIS","FRANKIE","FREYA","FREYJA","FRIDA","GABRIELA","GABRIELLA","GABRIELLE","GAIA","GALA","GALILEA","GALILEE","GEMA","GEMMA","GENESIS","GENEVA","GENEVIE","GENEVIEVE","GEORGIA","GEORGIANA","GEORGINA","GERALDINE","GIA","GIADA","GIANA","GIANNA","GIAVANNA","GILLIAN","GINA","GINGER","GIOVANNA","GISELA","GISELE","GISELL","GISELLE","GISSEL","GISSELLE","GIULIANA","GIULIANNA","GIULIETTA","GIZELLE","GLADYS","GLORIA","GOLDIE","GRACE","GRACELYN","GRACELYNN","GRACIE","GRACIELA","GRACYN","GRAYSON","GRECIA","GRETA","GRETCHEN","GRETEL","GRETTEL","GRISELDA","GUADALUPE","GUINEVERE","GURLEEN","GURNOOR","GWEN","GWENDOLYN","GWENYTH","GWYNETH","HADASA","HADASSA","HADASSAH","HADLEY","HAFSA","HAILEE","HAILEY","HAILIE","HALEY","HALLE","HALLIE","HALO","HANA","HANNA","HANNAH","HARLEE","HARLEEN","HARLEIGH","HARLEY","HARLIE","HARLOW","HARMONY","HARNOOR","HARPER","HATTIE","HAVANA","HAVEN","HAYA","HAYDEE","HAYDEN","HAYLEE","HAYLEY","HAYLIE","HAZEL","HEATHER","HEAVEN","HEAVENLY","HEIDI","HEIDY","HELEN","HELENA","HELLEN","HENLEY","HENNESSY","HILARY","HILLARY","HOLLAND","HOLLY","HONESTY","HONOR","HOPE","HOSANNA","HUDSON","HUNTER","IDA","ILA","ILEANA","ILENE","ILIANA","ILIANNA","ILY","ILYANA","IMAN","IMANI","IMOGEN","INAAYA","INARA","INAYA","INDIA","INDIANA","INDIE","INDIGO","INES","INEZ","INGRID","IRA","IRELAND","IRENE","IRIE","IRINA","IRIS","IRLANDA","IRMA","ISABEL","ISABELA","ISABELL","ISABELLA","ISABELLE","ISADORA","ISAMAR","ISELA","ISHA","ISIS","ISLA","ITALIA","ITALY","ITZAYANA","ITZEL","IVANA","IVANNA","IVETTE","IVORY","IVY","IYLA","IZABEL","IZABELLA","IZABELLE","IZEL","IZZABELLA","JACEY","JACIE","JACKELINE","JACKELYN","JACKIE","JACKLYN","JACLYN","JACQUELIN","JACQUELINE","JACQUELYN","JADA","JADE","JADELYN","JADEN","JADYN","JAEL","JAELYN","JAELYNN","JAIDA","JAILYN","JAILYNE","JAINA","JALIYAH","JAMIE","JANA","JANAE","JANE","JANELLE","JANELLY","JANELY","JANESSA","JANET","JANETH","JANETTE","JANICE","JANIE","JANIYAH","JANNAH","JANNEY","JAPJI","JAQUELIN","JAQUELINE","JARETZY","JASLEEN","JASLENE","JASLYN","JASLYNN","JASMIN","JASMINE","JATZIRI","JATZIRY","JAYCEE","JAYDA","JAYDE","JAYDEN","JAYLA","JAYLAH","JAYLANI","JAYLEE","JAYLEEN","JAYLEN","JAYLENE","JAYLIN","JAYLINE","JAYLYN","JAYLYNN","JAYMIE","JAZELLE","JAZLEEN","JAZLENE","JAZLYN","JAZLYNN","JAZMIN","JAZMINE","JAZMYN","JAZZLYN","JEAN","JEANETTE","JEANNE","JEMMA","JENELLE","JENESIS","JENESSA","JENEVIEVE","JENNA","JENNI","JENNIE","JENNIFER","JENNY","JESIAH","JESSA","JESSALYN","JESSICA","JESSIE","JESSLYN","JEWEL","JEWELS","JHENE","JIA","JIANNA","JILLIAN","JIMENA","JISELLE","JIYA","JOAN","JOANN","JOANNA","JOANNE","JOCELYN","JOCELYNE","JOCELYNN","JOELLE","JOEY","JOHANA","JOHANNA","JOLENE","JOLIE","JORDAN","JORDIN","JORDYN","JORDYNN","JOSEFINA","JOSELINE","JOSELYN","JOSEPHINE","JOSETTE","JOSIE","JOSLYN","JOSSELYN","JOURNEE","JOURNEY","JOY","JOYCE","JUANA","JUBILEE","JUDE","JUDITH","JUDY","JULIA","JULIANA","JULIANNA","JULIANNE","JULIE","JULIET","JULIETA","JULIETH","JULIETTA","JULIETTE","JULISA","JULISSA","JUNE","JUNIPER","JUNO","JURNEE","JUSTICE","JUSTINE","KACEY","KACI","KACIE","KADENCE","KAELANI","KAELY","KAELYN","KAELYNN","KAI","KAIA","KAILA","KAILAH","KAILANI","KAILEA","KAILEE","KAILEY","KAILI","KAILY","KAILYN","KAILYNN","KAIRA","KAIRI","KAITLIN","KAITLYN","KAITLYNN","KAIYA","KALANI","KALEA","KALEAH","KALEIA","KALEIGH","KALEY","KALI","KALIA","KALINA","KALIYAH","KALLIE","KAMILA","KAMILAH","KAMILLA","KAMILLE","KAMIYAH","KAMRYN","KARA","KAREENA","KARELY","KAREN","KARIME","KARINA","KARIS","KARISSA","KARLA","KARLEE","KARLIE","KARLY","KARMA","KAROL","KAROLINA","KAROLINE","KARSYN","KARTER","KASEY","KASSANDRA","KASSIDY","KATALEYA","KATALINA","KATARINA","KATE","KATELYN","KATELYNN","KATERINA","KATHERIN","KATHERINE","KATHERYN","KATHLEEN","KATHRYN","KATHY","KATIA","KATIE","KATRINA","KATY","KAVYA","KAYA","KAYCEE","KAYDEN","KAYDENCE","KAYLA","KAYLAH","KAYLANI","KAYLEE","KAYLEEN","KAYLEIGH","KAYLEN","KAYLENE","KAYLEY","KAYLI","KAYLIE","KAYLIN","KAYLYN","KAYLYNN","KEHLANI","KEILA","KEILANI","KEILLY","KEILY","KEILYN","KEIRA","KEIRY","KELLY","KELSEY","KELSIE","KENDAL","KENDALL","KENDRA","KENIA","KENLEY","KENNA","KENNEDI","KENNEDY","KENSINGTON","KENSLEY","KENYA","KENZI","KENZIE","KEREN","KEYLA","KEZIAH","KHADIJA","KHALEESI","KHALI","KHALIA","KHLOE","KHLOEE","KHUSHI","KIANA","KIANNA","KIARA","KIERA","KIERRA","KILEY","KIM","KIMBER","KIMBERLY","KIMORA","KINGSLEY","KINLEY","KINSEY","KINSLEE","KINSLEY","KIRA","KIRRA","KIRSTEN","KIYOMI","KLARISSA","KORA","KORI","KORRA","KOURTNEY","KRISHA","KRISTA","KRISTEN","KRISTIN","KRISTINA","KRISTINE","KRYSTAL","KYA","KYARA","KYLA","KYLEE","KYLEIGH","KYLIE","KYNLEE","KYRA","KYRIE","LACEY","LAILA","LAILAH","LAINEY","LANA","LANEY","LANI","LANIYAH","LARA","LARISSA","LARKIN","LAURA","LAUREL","LAUREN","LAURYN","LAVINIA","LAYA","LAYAN","LAYLA","LAYLAH","LAYLANI","LEA","LEAH","LEANNA","LEANNE","LEEAH","LEELA","LEEN","LEENA","LEGACY","LEIA","LEIAH","LEIGHTON","LEILA","LEILAH","LEILANI","LEILANIE","LEILANY","LELA","LENA","LENNON","LENNOX","LEONA","LESLEY","LESLIE","LESLY","LETICIA","LEXA","LEXI","LEXIE","LEXY","LEYA","LEYLA","LEYLANI","LEYNA","LIA","LIAH","LIAN","LIANA","LIANNA","LIBBY","LIBERTY","LIDIA","LILA","LILAH","LILI","LILIA","LILIAN","LILIANA","LILIANNA","LILITH","LILLIAN","LILLIANA","LILLIANNA","LILLIE","LILLY","LILLYANA","LILLYANNA","LILY","LILYANA","LILYANN","LILYANNA","LINA","LINCOLN","LINDA","LINDSAY","LINDSEY","LINNEA","LISA","LITZY","LIV","LIVIA","LIYA","LIZBETH","LIZETH","LIZETTE","LLUVIA","LOGAN","LOIS","LOLA","LONDON","LONDYN","LONDYNN","LORELAI","LORELEI","LOREN","LORENA","LORETTA","LORI","LORRAINE","LOTUS","LOUISA","LOUISE","LOURDES","LOVE","LUCCA","LUCERO","LUCIA","LUCIANA","LUCIANNA","LUCIE","LUCILLE","LUCINDA","LUCY","LUELLA","LUISA","LULU","LUNA","LUPITA","LUX","LUZ","LYA","LYDIA","LYLA","LYLAH","LYNETTE","LYNN","LYRA","LYRIC","MABEL","MACI","MACIE","MACKENZIE","MACY","MADALYN","MADALYNN","MADDIE","MADDISON","MADELEINE","MADELINE","MADELYN","MADELYNE","MADELYNN","MADILYN","MADILYNN","MADISON","MADISYN","MADYSON","MAE","MAEVE","MAGALI","MAGALY","MAGDALENA","MAGGIE","MAGNOLIA","MAI","MAIA","MAIAH","MAILE","MAILEN","MAIRA","MAISIE","MAISY","MAITE","MAIYA","MAKAILA","MAKAYLA","MAKAYLAH","MAKENA","MAKENNA","MAKENZIE","MALAIKA","MALAK","MALANI","MALAYA","MALAYAH","MALAYSIA","MALEAH","MALENA","MALENY","MALIA","MALIAH","MALINA","MALIYA","MALIYAH","MALLORY","MALORIE","MANASVI","MANDY","MANEH","MANREET","MAPLE","MARA","MARBELLA","MARCELA","MARCELINE","MARCELLA","MARELY","MAREN","MARGARET","MARGARITA","MARGAUX","MARGO","MARGOT","MARI","MARIA","MARIAH","MARIAJOSE","MARIAM","MARIAN","MARIANA","MARIANNA","MARIANNE","MARIBEL","MARIBELLE","MARICELA","MARIE","MARIEL","MARIELA","MARIELLA","MARIGOLD","MARILYN","MARILYNN","MARIN","MARINA","MARION","MARISA","MARISELA","MARISOL","MARISSA","MARITZA","MARIYAH","MARJORIE","MARLEE","MARLEN","MARLENE","MARLEY","MARLIE","MARLOWE","MARTHA","MARWA","MARY","MARYAM","MARYANN","MARYJANE","MATHILDA","MATILDA","MATTIE","MAVIS","MAXINE","MAY","MAYA","MAYAH","MAYLA","MAYLANI","MAYLEE","MAYLEEN","MAYLEN","MAYLIN","MAYRA","MAYTE","MAZIE","MCKAYLA","MCKENNA","MCKENZIE","MCKINLEY","MEADOW","MEDHA","MEERA","MEGAN","MEGHAN","MEHER","MEI","MEILANI","MELANI","MELANIA","MELANIE","MELANNIE","MELANNY","MELANY","MELE","MELIA","MELINA","MELINDA","MELISSA","MELODIE","MELODY","MERCEDES","MERCY","MEREDITH","MERIDA","MIA","MIABELLA","MIAH","MICAELA","MICAH","MICHAELA","MICHELE","MICHELLE","MIKA","MIKAELA","MIKAELLA","MIKAYLA","MILA","MILAGROS","MILAH","MILAN","MILANA","MILANI","MILANIA","MILDRED","MILEENA","MILENA","MILEY","MILIANA","MILIANI","MILLA","MILLER","MILLIE","MILLY","MINA","MINDY","MINERVA","MIRA","MIRABELLE","MIRACLE","MIRANDA","MIREYA","MIRIAM","MISHA","MISHKA","MIYA","MIYAH","MOLLY","MONA","MONICA","MONIKA","MONIQUE","MONROE","MONSERRAT","MONSERRATH","MONTSERRAT","MORGAN","MORIAH","MYA","MYAH","MYLA","MYLAH","MYRA","McKENNA","NADIA","NADINE","NADYA","NAHLA","NAHOMY","NAILA","NAILAH","NAIMA","NAIRA","NAIRI","NAIYA","NALA","NALANI","NALLELY","NANCY","NAOMI","NAOMY","NARA","NARIAH","NATALEE","NATALI","NATALIA","NATALIE","NATALY","NATALYA","NATASHA","NATHALIA","NATHALIE","NATHALY","NAVA","NAVY","NAVYA","NAYA","NAYELI","NAYELLI","NAYLA","NAYOMI","NEDA","NEELA","NELLIE","NELLY","NERIAH","NEVAEH","NEVEAH","NIA","NIAH","NICHOLE","NICO","NICOLE","NICOLETTE","NICOLLE","NIKA","NIKITA","NIKKI","NIKOLE","NILA","NIMRAT","NINA","NIRVANA","NIYA","NIYAH","NOA","NOAH","NOEL","NOELANI","NOELIA","NOELLA","NOELLE","NOEMI","NOLA","NOOR","NORA","NORAH","NORI","NORMA","NOUR","NOVA","NOVALEE","NUBIA","NYA","NYAH","NYLA","NYLAH","NYOMI","OCEAN","OCTAVIA","ODALYS","ODETTE","OFELIA","OLGA","OLIVE","OLIVIA","OONA","OPAL","OPHELIA","ORIANA","PAIGE","PAISLEE","PAISLEY","PAITYN","PALOMA","PAMELA","PAOLA","PARIS","PARKER","PATIENCE","PATRICIA","PAULA","PAULETTE","PAULINA","PAULINE","PAYTON","PEARL","PENELOPE","PENNY","PEPPER","PERLA","PERSEPHONE","PETRA","PEYTON","PHOEBE","PHOENIX","PIA","PIPER","POLINA","POPPY","PRECIOUS","PRESLEE","PRESLEY","PRINCESS","PRISCILA","PRISCILLA","PRISHA","PRIYA","PROMISE","QUEENA","QUEENIE","QUETZALLI","QUINCY","QUINN","RACHAEL","RACHEL","RAE","RAEGAN","RAELYN","RAELYNN","RAIN","RAINA","RAINE","RAMONA","RAQUEL","RAVEN","RAYA","RAYLENE","RAYNA","RAYNE","REAGAN","REBECA","REBECCA","REBEKAH","REECE","REEM","REESE","REGAN","REGINA","REIGN","REINA","REMI","REMINGTON","REMY","RENATA","RENEE","RENESMEE","REYA","REYNA","RHEA","RHIANNON","RIA","RIHANNA","RILEY","RILYNN","RIPLEY","RITA","RIVER","RIYA","ROBIN","ROBYN","ROCIO","ROMINA","ROMY","RORI","RORY","ROSA","ROSABELLA","ROSALEE","ROSALIA","ROSALIE","ROSALINA","ROSALIND","ROSALINDA","ROSALYN","ROSALYNN","ROSARIO","ROSE","ROSELYN","ROSELYNN","ROSEMARIE","ROSEMARY","ROSIE","ROSLYN","ROSY","ROWAN","ROWEN","ROXANA","ROXANNA","ROXANNE","ROXY","ROYA","ROYAL","ROYALTY","RUBI","RUBY","RUMI","RUTH","RYA","RYAN","RYANN","RYDER","RYLAN","RYLEE","RYLEIGH","RYLIE","RYLIN","RYLYNN","SAANVI","SABELLA","SABINA","SABINE","SABRINA","SADIE","SAFA","SAGE","SAHANA","SAHARA","SAIGE","SAILOR","SAIRA","SAKURA","SALEM","SALLY","SALMA","SAMAIRA","SAMANTHA","SAMARA","SAMARAH","SAMIRA","SAMIYA","SANA","SANAA","SANAI","SANAYA","SANDRA","SANDY","SANIYAH","SANJANA","SANTANA","SANVI","SAOIRSE","SAORI","SAPPHIRE","SARA","SARAH","SARAHI","SARAHY","SARAI","SARAY","SARAYU","SARIAH","SARINA","SARIYAH","SASHA","SAVANAH","SAVANNA","SAVANNAH","SAWYER","SAYA","SAYDEE","SAYLOR","SAYURI","SCARLET","SCARLETT","SCARLETTE","SCOUT","SEERAT","SEHAJ","SELAH","SELENA","SELENE","SELINA","SENNA","SEQUOIA","SERAFINA","SERAPHINA","SERENA","SERENE","SERENITY","SERINA","SHAE","SHAILA","SHANAYA","SHANNON","SHARON","SHAY","SHAYLA","SHAYLEE","SHEA","SHEILA","SHELBY","SHERLYN","SHERRY","SHEYLA","SHILOH","SHIRLEY","SHREYA","SHRIYA","SHYANNE","SIA","SIDNEY","SIENA","SIENNA","SIERRA","SILVANA","SILVIA","SIMONE","SIMRAN","SINAI","SIRENA","SIYA","SKARLETT","SKY","SKYE","SKYLA","SKYLAR","SKYLEE","SKYLER","SKYLYNN","SLOAN","SLOANE","SOFIA","SOFIE","SOL","SOLANA","SOLEDAD","SOLEIL","SONIA","SONYA","SOPHIA","SOPHIE","SORAYA","SPENCER","STACEY","STACY","STAR","STEFANIE","STEFANY","STELLA","STEPHANIE","STEPHANY","STEVIE","SUMMER","SUNNY","SUNSHINE","SURI","SUSAN","SUSANA","SUSANNA","SUSIE","SUTTON","SUZANNA","SUZETTE","SWARA","SYDNEY","SYLVIA","SYLVIE","SYMPHONY","TABITHA","TALA","TALIA","TALIAH","TALIYAH","TALLULAH","TALYA","TAMAR","TAMARA","TAMIA","TANIA","TANVI","TANYA","TARA","TARYN","TATIANA","TATIANNA","TATUM","TAYA","TAYLOR","TAYTUM","TEAGAN","TEEGAN","TEGAN","TEMPERANCE","TENLEY","TERESA","TERRA","TESLA","TESS","TESSA","THALIA","THEA","THERESA","TIA","TIANA","TIANNA","TIARA","TIFFANY","TINA","TINSLEY","TONI","TORI","TRINITY","TRISHA","TYLER","UMA","UNIQUE","VADA","VALENTINA","VALERIA","VALERIE","VALERY","VANELLOPE","VANESA","VANESSA","VANIA","VANYA","VEDA","VENICE","VENUS","VERA","VERONICA","VERONIKA","VESPER","VIANEY","VIANNA","VIANNEY","VIBHA","VICKY","VICTORIA","VIDA","VIENNA","VIKTORIA","VIOLA","VIOLET","VIOLETA","VIOLETTA","VIOLETTE","VIRGINIA","VIVIAN","VIVIANA","VIVIANNA","VIVIANNE","VIVIEN","VIVIENNE","WAVERLY","WENDY","WHITNEY","WILHELMINA","WILLA","WILLOW","WINIFRED","WINNIE","WINTER","WREN","WYNTER","XENA","XIMENA","XIOMARA","XITLALI","XITLALY","XOCHITL","XYLA","YADIRA","YAEL","YAMILET","YAMILETH","YANA","YANELI","YANELY","YARA","YARELI","YARELY","YARENI","YARETZI","YARETZY","YARITZA","YASMEEN","YASMIN","YASMINE","YATZIL","YATZIRI","YATZIRY","YAZAIRA","YAZMIN","YESENIA","YESSENIA","YETZALI","YOLANDA","YOSELIN","YSABELLA","YUI","YULIANA","YULIANNA","YULISSA","YUNA","YURI","YURIDIA","YURITZI","YVETTE","YVONNE","ZADIE","ZAHARA","ZAHRA","ZAIDA","ZAINA","ZAINAB","ZAIRA","ZAMIRA","ZANIYAH","ZARA","ZARIA","ZARIAH","ZARINA","ZARIYAH","ZAYA","ZAYDA","ZAYLA","ZAYLAH","ZAYLEE","ZAYNA","ZAYNAB","ZAYRA","ZELDA","ZELLA","ZENDAYA","ZIA","ZINNIA","ZION","ZIVA","ZOE","ZOEY","ZOIE","ZOLA","ZOOEY","ZORA","ZOYA","ZULEMA","ZULEYKA","ZURI","ZURY","ZYLA","ZYLAH"]},"germanic":{"boy":["Adalberht","Adalbern","Adalbert","Adalfarus","Adalfuns","Adalhard","Adalwin","Adalwolf","Adelmar","Adolf","Adolphus","Ælfgar","Ælfheah","Ælfnoð","Ælfræd","Ælfric","Ælfsige","Ælfstan","Ælfweard","Ælfwig","Ælfwine","Ælred","Æsc","Æþelbeorht","Æðelberht","Æðelfrið","Æðelmær","Æthelnoð","Æðelræd","Æþelræd","Æthelred","Æðelric","Æthelric","Æðelstan","Æthelstan","Æthelweard","Æðelwine","Æthelwine","Aghi","Agi","Agilulf","Agmundr","Agnarr","Áki","Alard","Alaric","Alberich","Albert","Albertus","Alboin","Aldebrand","Aldegar","Aldhard","Aldo","Aldric","Aldwin","Áleifr","Alfarr","Alfbern","Alfhard","Alfher","Alfons","Alfwin","Aliprand","Altwidus","Alwin","Amalbert","Amalric","Andebert","Angilberct","Ansehelm","Anselm","Ansgar","Ansigar","Anso","Ansobert","Ansovald","Anthelm","Anzo","Archembald","Ari","Arminius","Arnfinnr","Árni","Arnifrid","Arnold","Arnórr","Arnþórr","Arnulf","Arnviðr","Ásbjörn","Ascelin","Asco","Ásgeirr","Ásketill","Ásmundr","Ásvaldr","Aðalsteinn","Athanaric","Athaulf","Audamar","Audo","Audovacar","Bada","Badulf","Badurad","Baggi","Baldarich","Baldo","Baldomar","Baldovin","Baldwin","Bárðr","Baugulf","Beorhtric","Beorhtsige","Beornræd","Berahthraban","Berahthram","Berard","Berengar","Berhtoald","Berinhard","Bernard","Bernhard","Bertilo","Bertram","Bertrand","Birgir","Bjarni","Bjartr","Björn","Blanchard","Brando","Brandr","Bruno","Brynjarr","Búi","Burchard","Burkhard","Burkhart","Carlman","Carloman","Carolus","Ceadda","Cenhelm","Cenric","Ceolmund","Cerdic","Chariovalda","Chlodochar","Chlodovech","Chlodulf","Chlothar","Clodovicus","Clovis","Cola","Colobert","Conrad","Cuthberht","Cynebald","Cynefrith","Cynefrið","Cyneheard","Cynemær","Cyneric","Cynesige","Cyneweard","Dagfinnr","Dagr","Danr","Deorwine","Dudda","Dunstan","Eadberht","Eadgar","Eadmund","Eadric","Eadweard","Eadwig","Eadwine","Eadwulf","Ealdræd","Ealdwine","Ealhhere","Ealhstan","Eardwulf","Eastmund","Eberhard","Eburwin","Ecgberht","Egilhard","Egill","Egino","Eileifr","Einarr","Eindriði","Eiríkr","Ekkebert","Ekkehard","Ellanher","Emelrich","Emmerich","Engel","Engelbert","Engilram","Eoforwine","Ercanbald","Erhard","Erlendr","Erlingr","Ermenrich","Erminigild","Ernust","Erwin","Ewald","Eysteinn","Eyvindr","Faramund","Ferdinand","Filibert","Finnr","Folcher","Fólki","Franco","Fredenand","Fridenot","Friduhelm","Friduman","Fridumar","Friduric","Fridwald","Friðþjófr","Fróði","Fulbert","Fulco","Gasto","Gaufrid","Gautselin","Gautstafr","Gebahard","Gebhard","Geirr","Gerbern","Gerfrid","Gerhard","Gerlach","Gernot","Gero","Gerold","Gerulf","Gervas","Gervasius","Gilbert","Giltbert","Gisbert","Giselbert","Gisilbert","Gisilfrid","Gislenus","Gislin","Glædwine","Godafrid","Godascalc","Godehard","Godric","Godwine","Goteleib","Gozzo","Gulbrandr","Gumarich","Gundahar","Gundhram","Gundisalvus","Gunnarr","Gunni","Guðbrandr","Guðfriðr","Guðleifr","Guðmundr","Hadufuns","Hagano","Haimo","Hákon","Hálfdan","Hallbjörn","Halli","Hallr","Hallsteinn","Hallþórr","Hallvarðr","Haraldr","Hardman","Hardmod","Harduwich","Hardwin","Haribert","Hariman","Hariwald","Hariwini","Hartmut","Hartwig","Hartwin","Hávarðr","Heard","Heimirich","Heinrich","Helgi","Helmfrid","Helmo","Helmold","Helmut","Hemingr","Hengist","Henricus","Hereward","Hereweald","Herleifr","Herman","Hermanus","Hildebrand","Hildefons","Hildiberht","Hildræd","Hjálmarr","Hludowig","Hólmgeirr","Horsa","Hrafn","Hreiðarr","Hróaldr","Hróarr","Hrodebert","Hroderich","Hrodger","Hrodland","Hrodpreht","Hrodulf","Hrœrekr","Hrolf","Hrólfr","Hroðgar","Hrothgar","Hróðgeirr","Hróðólfr","Hroðulf","Hrothulf","Hróðvaldr","Hruodnand","Hubert","Hubertus","Hughard","Hugleikr","Hugo","Hugubert","Huguo","Hulderic","Humbert","Hunberct","Hunfrid","Ingi","Ingimárr","Ingo","Ingólfr","Ingomar","Ingulf","Isa","Isbrand","Ívarr","Ivo","Jarl","Jordanes","Kári","Karl","Ketill","Knútr","Kóri","Kunibert","Kuno","Lambert","Lamprecht","Landebert","Lanzo","Leifr","Leobwin","Leofdæg","Leofric","Leofsige","Leofstan","Leofwine","Leonard","Leudagar","Leudbald","Leudoberct","Leuthar","Leutwin","Liupold","Lothar","Ludolf","Ludovicus","Magni","Manno","Meginfrid","Meginhard","Meginrat","Meino","Meinrad","Milo","Njáll","Norbert","Norman","Odalric","Oddr","Odilo","Odo","Odoacer","Odovacar","Ortwin","Osbeorn","Osberht","Osgar","Osmund","Oswald","Oswine","Othmar","Otmar","Otto","Pæga","Pipin","Pippin","Raban","Radobod","Radulf","Raganhar","Ragemprand","Raginald","Raginhard","Raginmar","Raginmund","Ragnarr","Ragnvaldr","Raimund","Rainard","Rainer","Rambert","Ramirus","Randulf","Randúlfr","Ráðúlfr","Regin","Reinald","Reiner","Reinhard","Reinhold","Richard","Ricohard","Robert","Rocco","Rochus","Romilda","Rudesind","Rúni","Sæwine","Sigdag","Sigeberht","Sigeweard","Sigfrøðr","Sigibert","Sigifrid","Sigihard","Sigiheri","Sigimund","Sigismund","Sigivald","Sigiward","Sigmundr","Sigsteinn","Sigurðr","Sindri","Siward","Snorri","Somarliðr","Steinarr","Steinn","Stígandr","Stigr","Svantepolk","Sveinn","Sverrir","Swiðhun","Thancmar","Thankarat","Theobald","Theoderich","Theodoar","Theodoard","Theodoricus","Theothelm","Theotleip","Theotman","Theudemar","Theudhar","Theudobald","Theudofrid","Theudoricus","Theutrich","Thiemo","Thietmar","Þiudreiks","Þórarinn","Þórbjörn","Þórfastr","Þórfreðr","Þórgeirr","Þórgísl","Þórgnýr","Þórir","Þórketill","Þórleifr","Þórleikr","Þórmóðr","Þórsteinn","Þórvaldr","Þróndr","Tófi","Tryggvi","Úlfr","Ulrich","Valdimárr","Veremund","Vígi","Víkingr","Vragi","Vulferam","Vulfgang","Walahfrid","Waldhar","Waldo","Waldobert","Waldomar","Walherich","Walter","Walther","Wandal","Wandalin","Waramunt","Warin","Warinhari","Wazo","Wealdmær","Wealhmær","Wemba","Wendelin","Werdheri","Widald","Wido","Widogast","Widukind","Wigand","Wigberht","Wigbrand","Wigheard","Wigmar","Wigmund","Wigstan","Wilfrith","Wilfrið","Wilheard","Wilhelm","Willabert","Willahelm","Willamar","Willifrid","Willihard","Wilmǣr","Wine","Winfrith","Winfrið","Winifrid","Wolf","Wolfgang","Wulfnoð","Wulfric","Wulfsige","Wulfstan","Wynnstan","Yngvarr"],"girl":["Adalheidis","Adela","Adelais","Adelina","Æbbe","Ælfgifu","Ælfswiþ","Ælfþryð","Ælfthryth","Aenor","Æðelflæd","Æthelflæd","Æðelind","Æðelþryð","Æthelthryth","Alba","Alda","Aldegund","Alfhildr","Alia","Allovera","Amalasuintha","Amalia","Amelia","Amelina","Arnbjörg","Ása","Ásdís","Áslaug","Ásta","Ástríðr","Aðalbjörg","Auda","Auðrhildr","Ava","Avelina","Aveza","Avila","Berengaria","Bergljót","Berhta","Bertha","Björg","Borghildr","Bóthildr","Brunhild","Brunhilde","Brunihild","Brynhildr","Brynja","Chlotichilda","Clothildis","Cunigund","Cyneburg","Cyneburga","Dagmær","Dagný","Dagrún","Eadburg","Eadburga","Eadgyð","Ealdgyð","Edda","Emma","Eoforhild","Ermendrud","Ermingard","Erminhilt","Erminlinda","Eydís","Frida","Fríða","Friðuswiþ","Genovefa","Geretrudis","Gerhild","Gerlind","Gertrud","Gisila","Godeliva","Godgifu","Godiva","Grímhildr","Grimhilt","Gulla","Gunda","Gunna","Gunnbjörg","Gunnhildr","Gunnvör","Guðlaug","Guðleif","Guðríðr","Guðrún","Gyða","Hadewig","Hailwic","Hallþóra","Helewidis","Helga","Herleva","Hild","Hilda","Hildegard","Hildigardis","Hilditrut","Hildr","Hjördís","Hlíf","Hreiðunn","Hrodohaidis","Hrotsuitha","Ida","Ima","Inga","Ingeburg","Ingibjörg","Ingigerðr","Ingríðr","Ingvildr","Irma","Ishild","Iðunn","Jórunnr","Judda","Ketilriðr","Leofflæd","Leutgard","Linda","Linza","Luitgard","Lutgardis","Magnhildr","Mahthildis","Mathilda","Mildburg","Mildgyð","Mildþryð","Myrgjöl","Oda","Odila","Odilia","Raganhildis","Ragna","Ragnbjörg","Ragnfríðr","Ragnheiðr","Ragnhildr","Romilda","Roslindis","Rosmunda","Rothaid","Roza","Rúna","Saxa","Sigihild","Sigilind","Signý","Sigríðr","Sigrún","Sólveig","Sunngifu","Svanhildr","Swanahilda","Theudelinda","Þone","Þóra","Þórbjörg","Þórdís","Þórfríðr","Þórhildr","Þórný","Þórveig","Þórví","Þýri","Tófa","Unnr","Valdís","Vígdís","Waldeburg","Waldedrudis","Wassa","Wigburg","Wilburg","Wilburh","Yngvildr"]},"hindi":{"boy":["Aakash","Abhijay","Adarsh","Adil","Adit","Advay","Amal","Amalesh","Aman","Balbir","Banaj","Bandhu","Banke","Bansi","Barid","Barsaat","Barun","Bijoy","Bimal","Bir","Birbal","Chahel","Chakradev","Champak","Chatura","Chetan","Chitanya","Chitt","Daiwik","Dakshi","Daman","Damodar","Danvir","Darpan","Darshan","Debjit","Deep","Deepak","Dev","Devraj","Devrat","Dhairya","Dinesh","Dipendu","Diptanshu","Divyesh","Dulal","Edi","Ednit","Ehimay","Eka","Ekbal","Etash","Gadadhar","Gagan","Gajendra","Gandhi","Gandhik","Ganesh","Ganpati","Garud","Gaurang","Gaurav","Gaurhari","Gaurkeshav","Gaurnitai","Gaurshakti","Gaursundar","Gautam","Giri","Giridhar","Gopal","Gopesh","Gopinath","Goral","Govind","Hanuman","Hardik","Hari","Haridas","Harij","Harikesh","Haripreet","Hasmukh","Hayagriv","Hemant","Hemdev","Hemen","Hiranya","Hiresh","Hitendra","Hriday","Indrajit","Iraj","Iravan","Iravat","Ishaan","Ishat","Ishayu","Jagadanand","Jagannath","Jagdeep","Jaideep","Jaiman","Jaivant","Janardan","Jay","Jayesh","Jaygopal","Jayin","Jigar","Jignesh","Jitendra","Jiva","Kairav","Kalyan","Kanaiya","Kanvar","Kapil","Keshav","Kewal","Khushal","Kiran","Kirit","Kirtan","Kirti","Kripal","Krishna","Kritanu","Kumar","Kunsh","Kunwar","Labh","Lahar","Lakshman","Layak","Lekh","Loknath","Madan","Mahit","Malank","Manas","Manik","Manish","Manit","Manmohan","Mannan","Manu","Martand","Maruti","Meet","Mehal","Mehul","Mihir","Mikul","Miland","Mohan","Nayan","Nibodh","Nihal","Nikash","Nikhil","Nikunj","Nil Madhav","Nilay","Nimai","Nimish","Nipun","Nirad","Nirahankar","Nirav","Nirbhay","Nirek","Nirmal","Nirmay","Nishith","Nitai","Nitai Charan","Nitin","Nityanand","Nridev","Nrsingh","Omkar","Ojayit","Omprakash","Palash","Pallav","Panav","Parag","Param","Paran","Parth","Patag","Patit Pavan","Pavanaj","Pradhi","Pradyun","Prahalad","Prahlad","Prajit","Prakash","Prakrit","Prakul","Prasad","Pravin","Pravit","Prem","Premal","Pukhraj","Puneet","Punit","Puran","Purushottam","Raahi","Radha Govind","Rajdeep","Rajeev","Rajesh","Rajit","Ramai","Ramanuj","Ramaprasad","Rana","Ranajay","Ravish","Rishabdev","Rishabh","Rishi","Rishit","Rohak","Rohini Kumar","Rohinish","Ruhan","Rukminesh","Rushabh","Rushil","Saanjh","Sabal","Sachet","Sachiv","Sadar","Sadavir","Sharat","Siddharth","Sinha","Sohan","Somdev","Sridatta","Srivas","Sudhir","Sudhit","Sulek","Sunay","Swami","Taksheel","Tamal","Tanak","Tanav","Tanish","Tanmay","Tribang","Tuhin","Tushar","Udant","Udarsh","Udbal","Unnabh","Upendra","Utkarsh","Uttam","Vaibhav","Vaikunth","Valmiki","Vaman","Vayun","Venkatesh","Vibodh","Vikrant","Vilas","Vimal","Vinay","Vir","Viraj","Viral","Virat","Vishal","Vishesh","Vishnu","Vivek","Vrajalal","Vrajesh","Yadav","Yaduraj","Yaduvir","Yajna","Yamaraj","Yamir","Yash","Yatin","Yuvraj"],"girl":["Aarti","Aditi","Aiyanna","Ajah","Ajia","Akshara","Alisha","Aloki","Amirana","Amishi","Amithi","Amlika","Amolika","Amrita","Anamitra","Anandani","Anandini","Anila","Anisha","Anjali","Anjuli","Anmol","Anuja","Aparajita","Aradhana","Arpana","Arshia","Artha","Ashna","Ashwina","Asmita","Avatari","Ayan","Ayati","Ayushi","Balendra","Banhi","Basanti","Bel","Bhadra","Bhaktipriya","Bhaktivashya","Bhanuni","Bharati","Bhava","Bhavna","Bhumika","Bimala","Binita","Bishakha","Chahna","Chameli","Chanda","Chandi","Chandni","Chandrima","Charita","Charu","Chintamani","Chitra","Chunni","Damyanti","Darshana","Daru","Deepa","Deva","Devaki","Devanshi","Devyani","Dharini","Dhruva","Dhwani","Dishita","Diya","Draupadi","Dyala","Edha","Eesha","Ekani","Ekantika","Falguni","Fulmala","Ganesa","Ganga","Ganika","Gayatri","Geet","Gopi","Grishma","Gulika","Hara","Indira","Jai","Jan","Janaki","Jibon","Jivana","Kailash","Kalindi","Kama","Kamala","Karuna","Kaveri","Kavi","Kavita","Keshika","Kirana","Kirsi","Komal","Lajila","Lakiya","Lakme","Latika","Leela","Leena","Mahesa","Makara","Malini","Mandara","Manijala","Matrika","Mayah","Mela","Meraita","Mesha","Monika","Naina","Nanda","Naseem","Navani","Naya","Nayika","Nayna","Niara","Nilay","Nilisha","Nirveli","Oditi","Oma","Padmaja","Padmani","Panchali","Pari","Pariyat","Pavrita","Prabha","Prakriti","Pranali","Pranjal","Prateeka","Pratiti","Praveen","Prianka","Prithika","Priti","Purnima","Radha","Raja","Rajanya","Rajeshri","Raksha","Ramana","Ramanika","Ranee","Rani","Ranya","Raveena","Rebha","Reena","Reshma","Rewa","Rhea / Ria","Rishima","Rocana","Roka","Roopa","Roshana","Ruchika","Ruhi","Ruhin","Saajan","Sadhana","Sagara","Sajjana","Sakina","Sakti","Samali","Samina","Samiya","Sanika","Sanjula","Sansita","Sarika","Sarita","Sarojini","Satvari","Satvi","Saura","Savitri","Sevita","Shailesha","Shaivi","Shaka","Shalalu","Shalika","Shalini","Shanti","Sharanee","Shari","Sharvari","Sheela","Sherni","Shirina","Shiuli","Shona","Shresth","Shreya","Shrimayi","Shushma","Shyla","Simbala","Sita","Sitara","Somendra","Sonal","Sonali","Sudarshini","Sudeena","Suki","Suman","Sumati","Sumita","Sunaina","Sunaina","Sundara","Suneeta","Sunetra","Suravi","Surila","Suriya","Sushila","Suvali","Svara","Syreeta","Taija","Taijasa","Tamani","Tamanna","Tanirika","Tanmaya","Tanushri","Tara","Taralita","Tarana","Tarjani","Taruna","Taruni","Tavasa","Tehya","Timila","Tisya","Trisala","Tulsi","Uday","Udyati","Ujvala","Unma","Upadhriti","Upasna","Urja","Urmika","Urmila","Ushana","Usra","Utalika","Vainavi","Valini","Vanhi","Vanika","Varali","Varini","Varsha","Vedanti","Veena","Venya","Vija","Vinamra","Vinanti","Vipanchi","Vishaka","Vishva","Vyonna","Yahvi","Yamika","Yamya","Yashodhara","Yashwina","Zaad","Zara","Zarna"]},"medieval":{"boy":["Ackerley","Adney","Aeduuard","Aeduuin","Aelfraed","Aland","Alderney","Aldis","Aldred","Aldrich","Aldwin","Algernon","Alistair","Allard","Allister","Alston","Amherst","Archer","Arledge","Arley","Arnette","Arthur","Arundel","Ascot","Ashton","Atherton","Atkins","Atwater","Auden","Audrey","Audric","Averey","Aylmer","Aylwin","Badrick","Bancroft","Barden","Barlow","Barney","Barric","Barrington","Barse","Bartley","Bartram","Bassett","Baul","Bavol","Baxter","Bayard","Beaman","Beasley","Beaver","Bentley","Berkeley","Berwick","Beval","Bickford","Birkitt","Birley","Birney","Birtle","Blakely","Blaxton","Blythe","Bolton","Booker","Bosley","Boswell","Bowman","Bradburn","Braden","Bradford","Bradshaw","Bradyn","Brainard","Bramwell","Brandon","Brantley","Branton","Brawley","Braxton","Brayden","Brayton","Brenner","Brentley","Bridgely","Brigham","Brinley","Brishen","Brockton","Bronson","Buckminster","Burbank","Burdan","Burleigh","Burne","Byram","Cadby","Caldwell","Carleton","Carlisle","Carlyle","Carnell","Carsen","Cartland","Cartwright","Cederic","Chancellor","Chandler","Channing","Chanse","Charlton","Chaucey","Cheston","Chilton","Clayborne","Clayton","Cleavon","Clifford","Clifton","Clinton","Colton","Courtney","Cranley","Cuthbert","Dalton","Darby","Darren","Darthmouth","Darwyn","Davidson","Dawson","Dayton","Delbert","Denver","Denzel","Devon","Drake","Dudley","Durriken","Durwin","Dwennon","Easton","Edgar","Edmundus","Egbert","Eldon","Elton","Erwan","Filmore","Franklin","Galore","Galorian","Garman","Garrett","Garrick","Garridan","Garroway","Gerard","Godwin","Golding","Gordon","Hadden","Haelan","Hammond","Harding","Hartley","Haylan","Hazlitt","Hearst","Heathcliff","Heathcote","Holden","Houston","Howard","Hunter","Hyde","Irving","Irwin","Jackson","Jagger","Jamie","Jamison","Jarrett","Jaxon","Jayden","Jeffrey","Jerald","Jeremy","Jerold","Jerrard","Johnson","Judson","Keaton","Kelton","Kelvin","Kendall","Kipling","Kirby","Kolby","Lander","Landon","Lanford","Langston","Layne","Leland","London","Lyman","Lyndon","Macon","Maddox","Madison","Malin","Manfield","Manley","Manning","Marden","Maven","Mavis","Maxwell","Meldon","Mendel","Mitchell","Moreland","Nilson","Oakes","Oakley","Paige","Parker","Payton","Pearson","Peyton","Pierson","Preston","Quentin","Radley","Ramsey","Randall","Raymond","Rhett","Richard","Ricker","River","Robert","Robinson","Robyn","Rodney","Roldan","Royston","Rudd","Rudyard","Rylan","Sawyer","Sedgewick","Severin","Shelton","Sherman","Sherrod","Silas","Sinjin","Somerville","Southwell","Spalding","Spencer","Sterling","Stewart","Strong","Stuart","Tanner","Tilton","Trowbridge","Twyford","Udolf","Ulmer","Unwin","Upton","Upwood","Usher","Walden","Wallace","Warden","Warrick","Wayland","Waylon","Wayne","Wesley","Weston","Whitcombe","Whitfield","Willard","William","Winston","Winthrop","Witter","Wolfe","Woodruff","Woolsey","Wylie","Wymer","Yates"],"girl":["Abellana","Aelfgifu","Aelflaed","Aethelburh","Aetheldaeg","Aetheldreda","Aethelfled","Aethelfrith","Aethelgifu","Aethelgyth","Aethelswith","Aethelu","Aethylswith","Afreda","Ailith","Alditha","Aldyth","Alfreda","Alvar","Alvina","Amice","Amity","Anice","Annis","Arethusa","Arietta","Ashton","Avellana","Avery","Balthilda","Batilda","Bega","Beverly","Bliss","Blossom","Braeden","Breena","Brighton","British","Brucie","Cade","Carling","Cedrica","Ceola","Channel","Chauncey","Cinnamon","Codie","Corliss","Cwenburg","Cwenburh","Cwenhild","Cyneburg","Cyneburh","Dae","Daisy","Daralis","Dawn","Delight","Dena","Deorwynn","Devon","Diana","Doanne","Donella","Duette","Dulcina","Eadburg","Eadburga","Eadburgh","Eadburh","Eadgifu","Eadu","Eadwynn","Eald","Easter","Ebba","Eda","Edeva","Edith","Edmunda","Edwena","Edwina","Egberta","Eglantine","Elfreda","Elfredda","Elfrida","Elfrieda","Elga","Elgifu","Ella","Ellette","Elmina","Elvina","Eolande","Eostre","Erline","Ermengard","Ethelberga","Ethelburg","Ethelburga","Ethelburh","Etheldreda","Ethelfleda","Ethelfrith","Ethelgifu","Ethelgyth","Ethelinda","Evelyn","Everild","Everilda","Faerydae","Farah","Fay","Faye","Fayette","Faylinn","Fayre","Fira","Fleta","Forestyne","Garnet","Gelsey","Geretrudis","Gidget","Githa","Gode","Godelief","Godeliff","Godeliva","Godelva","Godgifu","Godgyth","Goditha","Golda","Golde","Goldevia","Goldwine","Gullveig","Gunilda","Gunnhild","Gytha","Hadley","Harley","Hawkins","Hazel","Helewis","Helewise","Héloise","Hereswith","Hilaria","Hildred","Hodierna","Hollis","Hopkins","Hulda","Idla","Ingrede","Ingrith","Ivy","Jetta","Jolecia","Jolenta","Kandi","Kauanoe","Keaton","Kelby","Kenley","Kinsey","Kip","Kyneburg","Laila","Langgifu","Lark","Lee","Letha","Leuedai","Liliana","Lilli","Lilly","Lily","Linden","Lindsey","Linsey","Long","Lorelle","Lorica","Lovedaia","Lovedaya","Lovedie","Luella","Lufu","Lulie","Madison","Magge","Marden","Marigold","Marigold","Marlow","Maurelle","Maven","Mercia","Merewald","Merry","Mildburg","Mildgyth","Mildred","Misty","Myla","Naida","Nerida","Nerida","Nissa","Nixie","Norma","Nyx","Odile","Oletha","Orla","Osgifu","Oswalda","Payton","Peace","Posy","Princess","Questa","Radella","Raisa","Raisie","Randall","Raven","Rhiannon","Rhoslyn","Rhoswen","Rhyannon","Rikki","Rosa","Rosalba","Rosalie","Rosetta","Rosina","Rossa","Roxanne","Royale","Rusalka","Sable","Saelufu","Sapphire","Sebille","Shaylee","Shea","Shelby","Sigourney","Sinnie","Siusan","Stanburg","Stanburh","Star","Storm","Sungyevo","Sunngifu","Sunny","Susane","Susanna","Suzanne","Suzette","Swete","Tana","Tandy","Tania","Tanya","Tatiana","Taylor","Tenanye","Theode","Tianna","Timothea","Titania","Tuesday","Unity","Utta","Velma","Vulpine","Wasila","Wesley","Whitney","Will","Willow","Windy","Wren","Wynflaeth","Wynnfrith","Xantho","Zanna","Zenith","Zuzana","Abelena"]},"sanskrit":{"boy":["Ambar","Amrit","Anand","Anil","Arjun","Arun","Ashok","Bharat","Bhima","Chandan","Chandra","Damodar","Deepak","Dev","Devdan","Devi","Dinesh","Ganesh","Gautama","Gopal","Govinda","Hari","Indra","Isa","Jagdish","Jay","Jitender","Jyotis","Kama","Karan","Kiran","Krishna","Kumar","Lai","Lakshman","Laxman","Ljluka","Mahendra","Mahesh","Mani","Mohan","Mohinder","Nanda","Narayan","Narendra","Prakash","Prasad","Prem","Raj","Rajendra","Rajiv","Ramesh","Ranjit","Rarna","Ravi","Rohan","Sanjay","Sankara","Shankar","Sharma","Sher","Shiva","Siddartha","Siva","Suman","Suresh","Surya","Tarun","Ushnisha","Varuna","Vasudeva","Vidya","Vijay","Vimal","Vishnu","Vyasa","Wassily"],"girl":["Aarti","Akshara","Amala","Anandini","Anisha","Anjuli","Arpita","Ayati","Banni","Bhadrapriya","Bhanu","Bhargavi","Binita","Chakori","Chandi","Charusheela","Chunni","Darshana","Devaki","Dhara","Diksha","Ekaja","Fulmala","Ganika","Gita","Gul","Harini","Hemani","Hemavati","Iksha","Indurekha","Ishita","Jasum","Joshika","Kala","Kalyani","Kamini","Karuna","Kashyapi","Kimaya","Kishori","Kshirin","Kusumita","Lakshanya","Lalita","Leena","Madhumati","Mahika","Malika","Manjula","Mayuri","Mili","Monisha","Mythri","Naishadha","Navya","Neha","Nidhi","Ninarika","Nishka","Nitya","Nupoor","Pallavi","Pradnya","Prasheila","Prisha","Ragini","Ramya","Raveena","Revati","Rita","Ruchika","Rupashi","Samiya","Sansita","Satvari","Savitri","Shalika","Sharvari","Shila","Shrika","Siddhangana","Sonali","Sunita","Sutara","Taj","Tanmaya","Taruni","Trisha","Udipta","Upadhriti","Urmila","Utalika","Vanhi","Varsha","Venya","Vinanti","Vishaka","Yahvi","Yashodhara"]},"thai":{"boy":["Aat","Aawut","Anada","Ananada","Anuman","Anurak","Aran","Aroon","Asnee","Atid","A-wut","Boon-Mee","Boon-Nam","Chai Son","Chaisai","Chaiya","Chaiyo","Chakan","Chalerm","Chalermchai","Chaloem","Channarong","Chao Fah","Charn Chai","Charoen","Charong","Chatalerm","Chatchom","Chatri","Chayan","Chet","Chompoo","Chongrak","Choochai","Chuachai","Chuanchen","Chula","Chulamai","Decha","Kamnan","Kasem","Kasemchai","Khemkhaeng","Kiet","Kit","Kitti","Kittibun","Kittichai","Kittichat","Kla","Kla Han","Klaew Kla","Klahan","Kob Chai","Kob Khun","Kob Sinn","Kob Sook","Kovit","Kraisee","Kraisingha","Kriang Krai","Kriang Sak","Kris","Kukrit","Kusa","Kwanchai","Lamon","Lek","Mee Noi","Mongkut","Narong","Ngoen","Niran","Paitoon","Phanumas","Phassakorn","Phet","Phichai","Phichit","Pichai","Piyabutr","Pravat","Prayut","Pricha","Pu Yai Bahn","Puenthai","Rama","Ritthirong","Rom Ran","Ruang Rit","Ruang Sak","Runrot","Sajja","Sakda","Santichai","Sanun","San'ya","Sap","Sataheep","Satra","Seni","Sin","Som Phon","Som Phong","Somchair","Son Chai","Sonchai","Su Suk","Sud","Sud Saming","Sum","Sumatra","Sunan","Sunti","Thahan","Thaklaew","Tham-Boon","Thanom","Thapthim","Thinnakorn","Thong Daeng","Thong Di","Thong Kon","Thong Thaeng","Thuanthong","Ti Nung Cha","Vidura","Virote","Xuwicha","Yod Rak","Yuthakon"],"girl":["Achara","Adranuch","A-gun","Ambhom","Anchali","Apasra","Apsara","Benjakalyani","Boribun","Bun Ma","Buppha","Busaba","Bussaba","Chaem Choi","Chai Charoen","Chailai","Chaisee","Chalermwan","Chaloem Chai","Chantana","Chanthira","Charanya","Chariya","Charoen","Charoenrasamee","Charunee","Chatchada","Chatmanee","Chatrasuda","Chaveevan","Chimlin","Chinda","Chintana","Chirawan","Chomechai","Chomesri","Chuachan","Chuasiri","Chuenchai","Churai","Dao","Dara","Daw","Dok Mai","Dok Phi Sua","Dok Rak","Dok-Ban-Yen","Dusadi","Fa Ying","Han","Hansa","Hanuman","Hom","Isra","Ittiporn","Kaew","Kalaya","Kamala","Kamlai","Kanchana","Kannika","Kanok","Kanya","Karawek","Karnchana","Khiew Wan","Khun Mae","Kohsoom","Kosum","Kulap","Kwang","Kwanjai","Lamai","Lawan","Madee","Mae Noi","Malee","Mali","Malee","Malivalaya","Maliwan","Mani","Mayuree","Mekhala","Muan Nang","Ngam-Chit","Nin","Nong Yao","On","On Choi","Pakpao","Pen-Chan","Pensri","Phaibun","Phailin","Phairoh","Phawta","Phitsamai","Phloi","Phueng","Pimchan","Prija","Prisana","Pundit","Ratana","Ratanaporn","Rochana","Saengdao","Samorn","Sanan Nam","Sanoh","Sanouk","Sarai","Sarakit","Sawatdi","Si","Si Fah","Si Mok","Sinn","Solada","Som","Som Chai","Som Kid","Som Wang","Songsuda","Sopa","Sroy","Suchada","Suchin","Suda","Sukhon","Sukonta","Sumalee","Sumana","Sunee","Sunstra","Sup","Taeng","Tansanee","Tha Kai Bok","Thai","Thong","Thong Dam","Thong Khao","Thong Thaem","Thong Thao","Tida","Totsaken","Tukata","Ubol","Udom","Vanida","Waan","Waen","Wila","Winai","Wipa","Ya Chai","Yindee","Ying","Yong-Yut","Yu-Pha","Yu-Phin"]}};

    /*
     * Origin-to-human-pool mapping. NPC-Origin entries may be regions or places.
     * Add settlement names to aliases when you want an exact regional mapping.
     * Unmapped origins use the everywhere-available Medieval pool.
     */
    var ORIGIN_PROFILES = [
        { keys: ['central kingdoms'], pools: ['english', 'medieval'], assumed: ['Human', 'Dwarf', 'Gnome', 'Halfling', 'Half-Elf'] },
        { keys: ['northern kingdoms'], pools: ['germanic', 'medieval'], assumed: ['Human', 'Dwarf', 'Goliath', 'Dragonborn'] },
        { keys: ['western freeholds'], pools: ['germanic', 'medieval'], assumed: ['Human', 'Dwarf', 'Gnome', 'Dragonborn'] },
        { keys: ['southern continent'], pools: ['african', 'asian', 'hindi', 'medieval'], assumed: ['Human', 'Halfling', 'Gnome', 'Half-Elf'] },
        { keys: ['island nations'], pools: ['arabic', 'thai', 'medieval'], assumed: ['Human', 'Halfling', 'Gnome'] },
        { keys: ['floating isles'], pools: ['sanskrit', 'medieval'], assumed: ['Human', 'Aarakocra', 'Aasimar'] },
        { keys: ['elven realms'], pools: ['english', 'medieval'], assumed: ['Elf', 'Eladrin', 'Half-Elf', 'Human'] },
        { keys: ['orc territories'], pools: ['germanic', 'medieval'], assumed: ['Orc', 'Half-Orc', 'Human'] }
    ];

    var RACE_TONGUES = {
        'aarakocra': 'Kaaril',
        'aasimar': 'Aelhael',
        'ademic': 'Shaltek',
        'chromatic dragonborn': 'Kharzul',
        'dragonborn': 'Kharzul',
        'metallic dragonborn': 'Kharzul',
        'deep gnome': 'Tivri',
        'dwarf': 'Kharzun',
        'eladrin': 'Aeltharyn',
        'elf': 'Aeltharyn',
        'firbolg': 'Druumeg',
        'giant': 'Druumeg',
        'gnoll': 'Kharzra',
        'gnome': 'Tivri',
        'goblin': 'Grik-Tak',
        'goliath': 'Druumeg',
        'halfling': 'Lethwynn',
        'leonin': "Rha'Savari",
        'orc': 'Ghorvakh'
    };

    var DEFAULT_TABLES = {
        'NPC-Race': [
            ['Human', 64], ['Dwarf', 50], ['Gnome', 45], ['Tabaxi', 20],
            ['Chromatic Dragonborn', 15], ['Metallic Dragonborn', 15],
            ['Goliath', 15], ['Aarakocra', 10], ['Deep Gnome', 10],
            ['Half-Elf', 8], ['Eladrin', 6], ['Elf', 6], ['Firbolg', 6],
            ['Half-Orc', 4], ['Aasimar', 4], ['Orc', 2], ['Changeling', 1]
        ],
        'NPC-Age': [
            ['Adult', 20], ['Child', 10], ['Elder', 10],
            ['Teen', 20], ['Very Old', 10], ['Young Adult', 20]
        ],
        'NPC-Sex': [['Female', 50], ['Male', 50]],
        'NPC-Origin': [
            ['Central Kingdoms', 25], ['Northern Kingdoms', 15],
            ['Western Freeholds', 15], ['Southern Continent', 15],
            ['Island Nations', 10], ['Floating Isles', 5],
            ['Elven Realms', 8], ['Orc Territories', 7]
        ],
        'NPC-Affluence': [
            ['Common (Obvious)', 59], ['Modest Wealth (Discreet)', 8],
            ['Modest Wealth (Obvious)', 8], ['Squalid (Obvious)', 12],
            ['Very Wealthy (Discreet)', 3], ['Very Wealthy (Obvious)', 2],
            ['Wealthy (Discreet)', 4], ['Wealthy (Obvious)', 4]
        ],
        'NPC-Influence': [
            ['Fair Influence (Discreet)', 4], ['Fair Influence (Obvious)', 6],
            ['Major Influence (Discreet)', 1], ['Major Influence (Obvious)', 2],
            ['Minor Influence (Discreet)', 8], ['Minor Influence (Obvious)', 6],
            ['No Influence', 72]
        ],
        'NPC-Faction': [
            ['Crown', 10], ['Royal Council', 2], ['City Guard', 10],
            ['National Military', 10], ['Imperial Navy', 6], ['Merchant Fleet', 8],
            ['Noble House', 12], ['Merchant Guild', 12], ['Artisans Guild', 10],
            ['Assassins Guild', 3], ['Thieves Guild', 5], ['Healers Order', 5],
            ['Temple Order', 8], ['Mercenary Company', 7], ['Free Armada', 4],
            ['Explorer Society', 4], ['Courier Network', 5], ['Tribal Council', 8],
            ['Warrior Clan', 8], ['Secret Society', 2], ['Slaver Network', 1]
        ]
    };


    function normalise(value) {
        return String(value || '').trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function randomChoice(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function getTable(name) {
        return findObjs({ _type: 'rollabletable', name: name })[0] || null;
    }

    function getWeightedItems(name) {
        var table = getTable(name);
        if (!table) {
            throw new Error('Missing Rollable Table: ' + name);
        }
        var items = findObjs({ _type: 'tableitem', _rollabletableid: table.id });
        if (!items.length) {
            throw new Error('Rollable Table has no items: ' + name);
        }
        return items.map(function (item) {
            var weight = parseInt(item.get('weight'), 10);
            return { name: item.get('name'), weight: isNaN(weight) || weight < 1 ? 1 : weight };
        });
    }

    function weightedRoll(name) {
        var items = getWeightedItems(name);
        var total = items.reduce(function (sum, item) { return sum + item.weight; }, 0);
        var roll = randomInteger(total);
        var running = 0;
        for (var i = 0; i < items.length; i++) {
            running += items[i].weight;
            if (roll <= running) return items[i].name;
        }
        return items[items.length - 1].name;
    }

    function originProfile(origin) {
        var key = normalise(origin);
        for (var i = 0; i < ORIGIN_PROFILES.length; i++) {
            if (ORIGIN_PROFILES[i].keys.some(function (part) { return key.indexOf(part) !== -1; })) {
                return ORIGIN_PROFILES[i];
            }
        }
        return { pools: ['medieval'], assumed: ['Human'] };
    }

    function humanName(origin, sex) {
        var profile = originProfile(origin);
        var gender = normalise(sex) === 'female' ? 'girl' : 'boy';
        var regional = profile.pools.filter(function (pool) { return pool !== 'medieval'; });
        var poolName = regional.length && randomInteger(100) <= 80
            ? randomChoice(regional)
            : 'medieval';
        var pool = HUMAN_NAMES[poolName] && HUMAN_NAMES[poolName][gender];
        if (!pool || !pool.length) pool = HUMAN_NAMES.medieval[gender];
        var value = randomChoice(pool);
        return value.toLowerCase().replace(/(^|[\\s'-])([a-z])/g, function (_, lead, letter) {
            return lead + letter.toUpperCase();
        });
    }

    function languageName(tongue, sex) {
        var profile = LANGUAGE_NAMES[tongue];
        if (!profile) return null;
        var gender = normalise(sex);
        var pool = profile[gender] || profile.neutral;
        if (!pool || !pool.length) {
            pool = [].concat(profile.neutral || [], profile.male || [], profile.female || []);
        }
        return pool.length ? randomChoice(pool) : null;
    }

    function isOrcOrigin(origin) {
        return /orc|horde|thunderfist|tribe/i.test(String(origin || ''));
    }

    function isElvenOrigin(origin) {
        return /wendlyn|elf|elven|doranelle/i.test(String(origin || ''));
    }

    function assumedRace(origin) {
        return randomChoice(originProfile(origin).assumed);
    }

    function generateName(race, origin, sex) {
        var raceKey = normalise(race);
        var visibleRace = race;

        if (raceKey === 'changeling') {
            visibleRace = assumedRace(origin);
            return {
                name: generateName(visibleRace, origin, sex).name,
                raceDisplay: 'Changeling — posing as ' + visibleRace
            };
        }

        if (raceKey === 'human') {
            return { name: humanName(origin, sex), raceDisplay: race };
        }

        if (raceKey === 'half-elf') {
            return {
                name: isElvenOrigin(origin) ? languageName('Aeltharyn', sex) : humanName(origin, sex),
                raceDisplay: race
            };
        }

        if (raceKey === 'half-orc') {
            return {
                name: isOrcOrigin(origin) ? languageName('Ghorvakh', sex) : humanName(origin, sex),
                raceDisplay: race
            };
        }

        var tongue = RACE_TONGUES[raceKey];
        return {
            name: languageName(tongue, sex) || humanName(origin, sex),
            raceDisplay: race
        };
    }

    function row(label, value, shaded) {
        return '<tr style="background:' + (shaded ? '#171717' : '#0d0d0d') + ';">' +
            '<td style="width:34%;padding:7px 9px;border-bottom:1px solid #2b2b2b;color:#a9a9a9;font-size:10px;font-weight:bold;letter-spacing:0.7px;text-transform:uppercase;vertical-align:middle;">' +
            escapeHtml(label) + '</td>' +
            '<td style="padding:7px 9px;border-bottom:1px solid #2b2b2b;color:#f4f1e8;font-size:13px;font-weight:bold;vertical-align:middle;">' +
            escapeHtml(value) + '</td></tr>';
    }

    function button(label, command) {
        return '<a style="display:inline-block;background:#2a2a2a;border:1px solid #666;color:#ff6262;padding:7px 9px;margin:2px;text-decoration:none;border-radius:4px;font-size:12px;font-weight:bold;" href="' +
            command + '">' + escapeHtml(label) + '</a>';
    }

    function commandValue(value) {
        return String(value == null ? '' : value).replace(/"/g, '\\"');
    }

    function tableChoices(name) {
        return getWeightedItems(name).map(function (item) { return item.name; });
    }

    function queryFor(label, tableName) {
        var choices = tableChoices(tableName).map(function (value) {
            return escapeHtml(value) + ',' + escapeHtml(value);
        });
        return '?{' + label + '|Random,Random|' + choices.join('|') + '}';
    }

    function selectorButton(label, origin, race) {
        var command = '!npc';
        if (origin) command += ' --origin &quot;' + commandValue(origin) + '&quot;';
        if (race) command += ' --race &quot;' + commandValue(race) + '&quot;';
        return button(label, command);
    }

    function showMenu() {
        var originQuery = queryFor('Origin', 'NPC-Origin');
        var raceQuery = queryFor('Race', 'NPC-Race');
        var html = '<div style="background:#080808;border:1px solid #315f42;border-radius:9px;overflow:hidden;font-family:Arial,sans-serif;box-shadow:0 2px 5px #000;">' +
            '<div style="background:#111;padding:8px 10px;border-bottom:2px solid #c92f2f;color:#cfcfcf;font-size:9px;font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;">NPCgen &bull; Selector</div>' +
            '<div style="padding:11px 10px 4px;color:#fff4dc;font-family:Georgia,serif;font-size:19px;font-weight:bold;text-align:center;">Create an NPC</div>' +
            '<div style="padding:2px 10px 9px;color:#aaa;font-size:11px;text-align:center;">Choose how much you want to control.</div>' +
            '<div style="padding:0 7px 10px;text-align:center;">' +
            selectorButton('Fully Random', '', '') +
            selectorButton('Choose Origin', originQuery, '') +
            selectorButton('Choose Race', '', raceQuery) +
            selectorButton('Choose Both', originQuery, raceQuery) +
            button('Setup', '!npc-config') + '</div></div>';
        sendChat('NPC Generator', '/w gm ' + html, null, { noarchive: true });
    }

    function repeatCommand(selection) {
        var command = '!npc';
        if (selection.origin) command += ' --origin &quot;' + escapeHtml(selection.origin) + '&quot;';
        if (selection.race) command += ' --race &quot;' + escapeHtml(selection.race) + '&quot;';
        return command;
    }

    function render(npc, selection) {
        var html = '<div style="background:#080808;border:1px solid #315f42;border-radius:9px;padding:0;overflow:hidden;font-family:Arial,sans-serif;box-shadow:0 2px 5px #000;">' +
            '<div style="background:#111;padding:7px 10px;border-bottom:2px solid #c92f2f;color:#cfcfcf;font-size:9px;font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;">NPCgen &bull; World-Aware NPC</div>' +
            '<div style="padding:11px 10px 10px;color:#fff4dc;font-family:Georgia,serif;font-size:20px;font-weight:bold;line-height:1.1;text-align:center;">' +
            escapeHtml(npc.name) + '</div>' +
            '<table style="width:100%;border-collapse:collapse;margin:0;">' +
            row('Sex', npc.sex, false) + row('Race', npc.race, true) +
            row('Origin', npc.origin, false) + row('Age', npc.age, true) +
            row('Affluence', npc.affluence, false) + row('Influence', npc.influence, true);

        if (npc.faction) html += row('Faction', npc.faction, false);

        html += '</table><div style="padding:8px 6px 9px;text-align:center;background:#111;">' +
            button((selection.origin || selection.race) ? 'Repeat Selection' : 'Generate Another', repeatCommand(selection)) +
            button('New Selection', '!npc-menu') +
            button('Setup', '!npc-config') + '</div></div>';
        sendChat('NPC Generator', '/w gm ' + html, null, { noarchive: true });
    }

    function parseOptions(content) {
        var options = {};
        String(content || '').replace(/--(origin|race)\s+(?:"([^"]+)"|'([^']+)'|([^\s]+))/gi,
            function (_, key, doubleQuoted, singleQuoted, bare) {
                options[key.toLowerCase()] = doubleQuoted || singleQuoted || bare;
                return '';
            });
        return options;
    }

    function tableSelection(tableName, requested) {
        if (!requested || normalise(requested) === 'random') return weightedRoll(tableName);
        var items = getWeightedItems(tableName);
        for (var i = 0; i < items.length; i++) {
            if (normalise(items[i].name) === normalise(requested)) return items[i].name;
        }
        throw new Error('Unknown ' + tableName.replace('NPC-', '').toLowerCase() + ': ' + requested);
    }

    function generate(options) {
        options = options || {};
        // Influence is intentionally rolled before faction. No Influence suppresses faction.
        var sex = weightedRoll('NPC-Sex');
        var race = tableSelection('NPC-Race', options.race);
        var origin = tableSelection('NPC-Origin', options.origin);
        var identity = generateName(race, origin, sex);
        var influence = weightedRoll('NPC-Influence');
        var faction = (!configState().factionsEnabled || /^no influence/i.test(influence))
            ? null
            : weightedRoll('NPC-Faction');

        render({
            name: identity.name,
            sex: sex,
            race: identity.raceDisplay,
            origin: origin,
            age: weightedRoll('NPC-Age'),
            affluence: weightedRoll('NPC-Affluence'),
            influence: influence,
            faction: faction
        }, {
            origin: options.origin && normalise(options.origin) !== 'random' ? origin : '',
            race: options.race && normalise(options.race) !== 'random' ? race : ''
        });
    }

    function check() {
        var lines = REQUIRED_TABLES.map(function (name) {
            try {
                return '✓ ' + name + ' (' + getWeightedItems(name).length + ' items)';
            } catch (error) {
                return '✗ ' + error.message;
            }
        });
        sendChat('NPC Generator', '/w gm <div style="background:#090909;color:#eee;border:1px solid #315f42;border-radius:8px;padding:8px;"><b>NPCgen ' + VERSION + '</b><br>' + lines.join('<br>') + '</div>', null, { noarchive: true });
    }

    function configState() {
        if (!state[STATE_KEY] || state[STATE_KEY].schemaVersion !== 1) {
            state[STATE_KEY] = { schemaVersion: 1, factionsEnabled: true };
        }
        return state[STATE_KEY];
    }

    function createTable(name) {
        var table = createObj('rollabletable', { name: name, showplayers: false });
        DEFAULT_TABLES[name].forEach(function (entry) {
            createObj('tableitem', {
                _rollabletableid: table.id,
                name: entry[0],
                weight: entry[1]
            });
        });
        return table;
    }

    function installMissingTables() {
        var created = [];
        REQUIRED_TABLES.forEach(function (name) {
            if (!getTable(name)) {
                createTable(name);
                created.push(name);
            }
        });
        showSetup(created.length ? 'Created: ' + created.join(', ') : 'All required tables already exist.');
    }

    function repairTables() {
        var added = 0;
        REQUIRED_TABLES.forEach(function (name) {
            var table = getTable(name) || createTable(name);
            var existing = findObjs({ _type: 'tableitem', _rollabletableid: table.id }).map(function (item) {
                return normalise(item.get('name'));
            });
            DEFAULT_TABLES[name].forEach(function (entry) {
                if (existing.indexOf(normalise(entry[0])) === -1) {
                    createObj('tableitem', { _rollabletableid: table.id, name: entry[0], weight: entry[1] });
                    added += 1;
                }
            });
        });
        showSetup(added ? 'Added ' + added + ' missing default item(s).' : 'No missing default items found.');
    }

    function statusLines() {
        return REQUIRED_TABLES.map(function (name) {
            try {
                return '<span style="color:#71c98b;">&#10003;</span> ' + escapeHtml(name) +
                    ' <span style="color:#999;">(' + getWeightedItems(name).length + ' items)</span>';
            } catch (error) {
                return '<span style="color:#ff6b6b;">&#10007;</span> ' + escapeHtml(error.message);
            }
        }).join('<br>');
    }

    function showSetup(notice) {
        var config = configState();
        var html = '<div style="background:#080808;border:1px solid #315f42;border-radius:9px;overflow:hidden;font-family:Arial,sans-serif;">' +
            '<div style="background:#111;padding:8px 10px;border-bottom:2px solid #c92f2f;color:#eee;font-weight:bold;">World-Aware NPC Setup</div>' +
            (notice ? '<div style="padding:7px 9px;background:#18251c;color:#bde5c8;border-bottom:1px solid #315f42;">' + escapeHtml(notice) + '</div>' : '') +
            '<div style="padding:9px;color:#ddd;line-height:1.5;">' + statusLines() + '</div>' +
            '<div style="padding:0 7px 8px;text-align:center;">' +
            button('Install Missing Tables', '!npc-config --install') +
            button('Repair Defaults', '!npc-config --repair') +
            button('Factions: ' + (config.factionsEnabled ? 'On' : 'Off'), '!npc-config --toggle-factions') +
            button('NPC Selector', '!npc-menu') +
            button('Generate NPC', '!npc') + '</div></div>';
        sendChat('NPC Setup', '/w gm ' + html, null, { noarchive: true });
    }

    function handleConfig(content) {
        var config = configState();
        if (/--install\b/i.test(content)) return installMissingTables();
        if (/--repair\b/i.test(content)) return repairTables();
        if (/--toggle-factions\b/i.test(content)) {
            config.factionsEnabled = !config.factionsEnabled;
            return showSetup('Faction generation ' + (config.factionsEnabled ? 'enabled.' : 'disabled.'));
        }
        showSetup('');
    }

    function handleInput(msg) {
        if (msg.type !== 'api') return;
        var command = msg.content.trim().split(/\s+/)[0].toLowerCase();
        try {
            if (command === '!npc') generate(parseOptions(msg.content));
            if (command === '!npc-menu') showMenu();
            if (command === '!npc-config') handleConfig(msg.content);
            if (command === '!npc-check') check();
        } catch (error) {
            sendChat('NPC Generator', '/w gm <div style="background:#300;color:#fff;border:1px solid #d55;padding:7px;"><b>NPC Generator Error</b><br>' + escapeHtml(error.message) + '</div>');
            log('NPCgen: ' + error.stack);
        }
    }

    on('ready', function () {
        configState();
        on('chat:message', handleInput);
        log('World-Aware NPC Generator v' + VERSION + ' ready.');
    });

    return { version: VERSION };
}());
