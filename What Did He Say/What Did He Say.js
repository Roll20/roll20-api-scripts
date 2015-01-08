on("chat:message", function(msg) {
    var abolethArry = ["≤","≥","≦","≧","≨","≩","≪","≫","≬","≭","≮","≯","≰","≱","≲","≳","≴","≵","≶","≷","≸","≹","≺","≻","≼","≽","≾","≿","⊀","⊁","☇","☈"]
    var akloArry = ["ऄ","अ","आ","इ","ई","उ","ऊ","ऋ","ऌ","ऍ","ऎ","ए","ऐ","ऑ","ऒ","ओ","औ","क","ख","ग","घ","ङ","च","छ","ज","झ","ञ","ट","ठ","ड","ढ","ण","त","थ","द","ध","न","ऩ","प","फ","ब","भ","म","य","र","ऱ","ल","ळ","ऴ","व","श","ष","स","ह","क़","ख़","ग़","ज़","ड़","ढ़","फ़","य़","ॠ","ॡ","ॢ","ॣ","।","॥","०","१","२","३","४","५","६","७","८","९"]
    var aquanArry = ["ꁠ","ꁡ","ꁢ","ꁣ","ꁤ","ꁥ","ꁦ","ꁧ","ꁨ","ꁩ","ꁪ","ꁫ","ꁬ","ꁭ","ꁮ","ꁯ","ꁰ","ꁱ","ꁲ","ꁳ","ꁴ","ꁵ","ꁶ","ꁷ","ꁸ","ꁹ","ꁺ","ꁻ","ꁼ","ꁽ","ꁾ","ꁿ","ꂀ","ꂁ","ꂂ","ꂃ","ꂄ","ꂅ","ꂆ","ꂇ","ꂈ","ꂉ","ꂊ","ꂋ","ꂌ","ꂍ","ꂎ","ꂏ","ꂐ","ꂑ","ꂒ","ꂓ","ꂔ","ꂕ","ꂖ","ꂗ","ꂘ","ꂙ","ꂚ","ꂛ","ꂜ","ꂝ","ꂞ","ꂟ","ꂠ","ꂡ","ꂢ","ꂣ","ꂤ","ꂥ","ꂦ","ꂧ","ꂨ","ꂩ","ꂪ","ꂫ","ꂬ","ꂭ","ꂮ","ꂯ"]
    var auranArry = ["ꂰ","ꂱ","ꂲ","ꂳ","ꂴ","ꂵ","ꂶ","ꂷ","ꂸ","ꂹ","ꂺ","ꂻ","ꂼ","ꂽ","ꂾ","ꂿ","ꃀ","ꃁ","ꃂ","ꃃ","ꃄ","ꃅ","ꃆ","ꃇ","ꃈ","ꃉ","ꃊ","ꃋ","ꃌ","ꃍ","ꃎ","ꃏ","ꃐ","ꃑ","ꃒ","ꃓ","ꃔ","ꃕ","ꃖ","ꃗ","ꃘ","ꃙ","ꃚ","ꃛ","ꃜ","ꃝ","ꃞ","ꃟ","ꃠ","ꃡ","ꃢ","ꃣ","ꃤ","ꃥ","ꃦ","ꃧ","ꃨ","ꃩ","ꃪ","ꃫ","ꃬ","ꃭ","ꃮ","ꃯ","ꃰ","ꃱ","ꃲ","ꃳ","ꃴ","ꃵ","ꃶ","ꃷ","ꃸ","ꃹ","ꃺ","ꃻ","ꃼ","ꃽ","ꃾ","ꃿ"]
    var boggardArry = ["⊂","⊃","⊄","⊅","⊆","⊇","⊈","⊉","⊊","⊋","⊌","⊍","⊎","⋀","⋁","⋂","⋃","⋄","☉","☊","☋","☌","☍","☥","☦","☧","☨☿","♀","♁","♂","♃","♄","♅","♆","♇","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","♧","♨"]
    var celestialArry  = ["ᠠ","ᠡ","ᠢ","ᠣ","ᠤ","ᠥ","ᠦ","ᠧ","ᠨ","ᠩ","ᠪ","ᠫ","ᠬ","ᠭ","ᠮ","ᠯ","ᠰ","ᠱ","ᠲ","ᠳ","ᠴ","ᠵ","ᠶ","ᠷ","ᠸ","ᠹ","ᠺ","ᠻ","ᠼ","ᠽ","ᠾ","ᠿ","ᡀ","ᡁ","ᡂ","ᡃ","ᡄ","ᡅ","ᡆ","ᡇ","ᡈ","ᡉ","ᡊ","ᡋ","ᡌ","ᡍ","ᡎ","ᡏ","ᡐ","ᡑ","ᡒ","ᡓ","ᡔ","ᡕ","ᡖ","ᡗ","ᡘ","ᡙ","ᡚ","ᡛ","ᡜ","ᡝ","ᡞ","ᡟ","ᡠ","ᡡ","ᡢ","ᡣ","ᡤ","ᡥ","ᡦ","ᡧ","ᡨ","ᡩ","ᡪ","ᡫ","ᡬ","ᡭ","ᡮ","ᡯ","ᡰ","ᡱ","ᡲ","ᡳ","ᡴ","ᡵ","ᡶ","ᡷᢀ","ᢁ","ᢂ","ᢃ","ᢄ","ᢅ","ᢆ","ᢇ","ᢈ","ᢉ","ᢊ","ᢋ","ᢌ","ᢍ","ᢎ","ᢏ","ᢐ","ᢑ","ᢒ","ᢓ","ᢔ","ᢕ","ᢖ","ᢗ","ᢘ","ᢙ","ᢚ","ᢛ","ᢜ","ᢝ","ᢞ","ᢟ","ᢠ","ᢡ","ᢢ","ᢣ","ᢤ","ᢥ","ᢦ","ᢧ","ᢨ"]
    var draconicArry =["ϕ","ϖ","ϗ","Ϙ","ϙ","Ϛ","ϛ","Ϝ","ϝ","Ϟ","ϟ","Ϡ","ϡ","Ϣ","ϣ","Ϥ","ϥ","Ϧ","ϧ","Ϩ","ϩ","Ϫ","ϫ","Ϭ","ϭ","Ϯ","ϯϰ","ϱ","ϲ","ϳ","ϴ","ϵ","϶","Ϸ","ϸ","Ϲ","ϻ","ϼ","Ͻ","Ͼ","Ͽ"]
    var drowArry = ["☚←","☚↑","☚→","☚↓","☚↔","☚↕","☚↖","☚↗","☚↘","☚↙","☚↜","☚↝","☚↞","☚↟","☚↠","☚↡","☚↩","☚↪","☚↫","☚↬","☚↯","☚↰","☚↱","☚↲","☚↳","☚↴","☚↵","☚↶","☚↷","☚↹","☚↺","☚↻","☛←","☛↑","☛→","☛↓","☛↔","☛↕","☛↖","☛↗","☛↘","☛↙","☛↜","☛↝","☛↞","☛↟","☛↠","☛↡","☛↩","☛↪","☛↫","☛↬","☛↯","☛↰","☛↱","☛↲","☛↳","☛↴","☛↵","☛↶","☛↷","☛↹","☛↺","☛↻"]
    var druidicArry = ["ᚠ","ᚡ","ᚢ","ᚣ","ᚤ","ᚥ","ᚦ","ᚧ","ᚨ","ᚩ","ᚪ","ᚫ","ᚬ","ᚭ","ᚮ","ᚯ","ᚰ","ᚱ","ᚲ","ᚳ","ᚴ","ᚵ","ᚶ","ᚷ","ᚸ","ᚹ","ᚺ","ᚻ","ᚼ","ᚽ","ᚾ","ᚿ","ᛀ","ᛁ","ᛂ","ᛃ","ᛄ","ᛅ","ᛆ","ᛇ","ᛈ","ᛉ","ᛊ","ᛋ","ᛌ","ᛍ","ᛎ","ᛏ","ᛐ","ᛑ","ᛒ","ᛓ","ᛔ","ᛕ","ᛖ","ᛗ","ᛘ","ᛙ","ᛚ","ᛛ","ᛜ","ᛝ","ᛞ","ᛟ","ᛠ","ᛡ","ᛢ","ᛣ","ᛤ","ᛥ","ᛦ","ᛧ","ᛨ","ᛩ","ᛪ","ᛮ","ᛯ","ᛰ"]
    var dwarvenArry = ["∀","∃","∈","∉","∋","∏","⊥","Γ","Λ","Ξ","Π","λ","μ","ο","π","ϒ","ϖ","Ÿ","‡","⌈","⌉","⌊","⌋","¦","¬","±","φ","ϖ","∫"]
    var elvenArry = ["ᦀ","ᦁ","ᦂ","ᦃ","ᦄ","ᦅ","ᦆ","ᦇ","ᦈ","ᦉ","ᦊ","ᦋ","ᦌ","ᦍ","ᦎ","ᦏ","ᦐ","ᦑ","ᦒ","ᦓ","ᦔ","ᦕ","ᦖ","ᦗ","ᦘ","ᦙ","ᦚ","ᦛ","ᦜ","ᦝ","ᦞ","ᦟ","ᦠ","ᦡ","ᦢ","ᦣ","ᦤ","ᦥ","ᦦ","ᦧ","ᦨ","ᦩ"]
    var evilArry = ["₠","₡","₢","₣","₤","₥","₦","₧","₨","₩","₪","₫","€","₭","₮","₯","₰","₱","₲","₳","₴","₵","☫","☬","☠","☸"]
    var giantArry = ["−","∓","∔","∕","∖","∗","∘","∝","∞","∟","∠","∡","∢","∣","∤","∥","∦","∧","∨","∩","∪","∫","∬","∭","∮","∯","∰","∱","∲","∳","∼","∽","∾","∿","≀"]
    var gnollArry =["≁","≂","≃","≄","≅","≆","≇","≈","≉","≊","≋","≌","≍","≎","≏","≐","≑","≒","≓","≔","≕","≖","≗","≘","≙","≚","≛","≜","≝","≞","≟","≠","≡","≢","≣"]
    var gnomeArry = ["అ","ఆ","ఇ","ఈ","ఉ","ఊ","ఋ","ఌ","ఎ","ఏ","ఐ","ఒ","ఓ","ఔ","క","ఖ","గ","ఘ","ఙ","చ","ఛ","జ","ఝ","ఞ","ట","ఠ","డ","ఢ","ణ","త","థ","ద","ధ","న","ప","ఫ","బ","భ","మ","య","ర","ఱ","ల","ళ","వ","శ","ష","స","హ","ఽ","ౘ","ౙ","ౠ","ౡ","౦","౧","౨","౩","౪","౫","౬","౭","౮","౯","౸","౹","౺","౻","౼","౽","౾","౿"]
    var goblinArry = ["𐒀 ","𐒁 ","𐒂 ","𐒃 ","𐒄 ","𐒅 ","𐒆 ","𐒇 ","𐒈 ","𐒉 ","𐒊 ","𐒋 ","𐒌 ","𐒍 ","𐒎 ","𐒏","𐒐 ","𐒑 ","𐒒 ","𐒓 ","𐒔 ","𐒕","𐒖","𐒗","𐒘","𐒙","𐒚","𐒛","𐒜","𐒝","𐒠 ","𐒡 ","𐒢 ","𐒣 ","𐒤 ","𐒥 ","𐒦 ","𐒧 ","𐒨 ","𐒩"]
    var halflingArry = ["ก","ข","ฃ","ค","ฅ","ฆ","ง","จ","ฉ","ช","ซ","ฌ","ญ","ฎ","ฏ","ฐ","ฑ","ฒ","ณ","ด","ต","ถ","ท","ธ","น","บ","ป","ผ","ฝ","พ","ฟ","ภ","ม","ย","ร","ฤ","ล","ฦ","ว","ศ","ษ","ส","ห","ฬ","อ","ฮ","ฯ"]
    var ignanArry = ["ꄀ","ꄁ","ꄂ","ꄃ","ꄄ","ꄅ","ꄆ","ꄇ","ꄈ","ꄉ","ꄊ","ꄋ","ꄌ","ꄍ","ꄎ","ꄏ","ꄐ","ꄑ","ꄒ","ꄓ","ꄔ","ꄕ","ꄖ","ꄗ","ꄘ","ꄙ","ꄚ","ꄛ","ꄜ","ꄝ","ꄞ","ꄟ","ꄠ","ꄡ","ꄢ","ꄣ","ꄤ","ꄥ","ꄦ","ꄧ","ꄨ","ꄩ","ꄪ","ꄫ","ꄬ","ꄭ","ꄮ","ꄯ","ꄰ","ꄱ","ꄲ","ꄳ","ꄴ","ꄵ","ꄶ","ꄷ","ꄸ","ꄹ","ꄺ","ꄻ","ꄼ","ꄽ","ꄾ","ꄿ","ꅀ","ꅁ","ꅂ","ꅃ","ꅄ","ꅅ","ꅆ","ꅇ","ꅈ","ꅉ","ꅊ","ꅋ","ꅌ","ꅍ","ꅎ","ꅏ"]
    var orcArry = ["ㄅ","ㄆ","ㄇ","ㄈ","ㄉ","ㄊ","ㄋ","ㄌ","ㄍ","ㄎ","ㄏ","ㄐ","ㄑ","ㄒ","ㄓ","ㄔ","ㄕ","ㄖ","ㄗ","ㄘ","ㄙ","ㄚ","ㄛ","ㄜ","ㄝ","ㄞ","ㄟ","ㄠ","ㄡ","ㄢ","ㄣ","ㄤ","ㄥ","ㄦ","ㄧ","ㄨ","ㄩ"]
    var proteanArry = ["अ","ב","इ","ई","ݐ","ऊ","ݑ","ऋ","ס","ऌ","ݔ","ऎ","ݩ","औ","ݓ","क","ע","ख","ग","א","ד","घ","ݣ","ङ","च","ק","छ","ג","झ","ݘ","ञ","ट","ן","ठ","ड","ݩ","ढ","ݒ","ण","ݙ","थ","ݧ","द","ݡ","ध","ऩ","ݨ","फ","ף","ब","ݭ","भ","य","ݞ","ऱ","ݟ","ल","ץ","ऴ","व","ש","श","ל","ष","स","ह","ݗ","क़","ݜ","ख़","פ","ग़","מ","ज़","ת","ड़","ढ़","ݦ","फ़","य़","ॠ","ॡ","ॢ","ॣ","१","२","३","४","५","६","७","८","९"]
    var sphinxArry = ["᧠","᧡","᧢","᧣","᧤","᧥","᧦","᧧","᧨","᧩","᧪","᧫","᧬","᧭","᧮","᧯","᧰","᧱","᧲","᧳","᧴","᧵","᧶","᧷","᧸","᧹","᧺","᧻","᧼","᧽","᧾","᧿"]
    var sylvanArry = ["Ώ","ΐ","Γ","Δ","Ξ","","Σ","Φ","Ψ","Ω","Ϊ","Ϋ","ά","έ","ή","ί","ΰ","α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ","ν","ξ","ο","π","ρ","ς","σ","φ","χ","ψ","ω","ϊ","ϋ","ό","ύ","ώ","ϐ","ϑ","ϒ","ϓ","ϔ"]
    var tenguArry = ["Ա","Բ","Գ","Դ","Ե","Զ","Է","Ը","Թ","Ժ","Ի","Լ","Խ","Ծ","Կ","Հ","Ձ","Ղ","Ճ","Մ","Յ","Ն","Շ","Ո","Չ","Պ","Ջ","Ռ","Ս","Վ","Տ","Ր","Ց","Ւ","Փ","Ք","Օ","Ֆ","ա","բ","գ","դ","ե","զ","է","ը","թ","ժ","ի","լ","խ","ծ","կ","հ","ձ","ղ","ճ","մ","յ","ն","շ","ո","չ","պ","ջ","ռ","ս","վ","տ","ր","ց","ւ","փ","ք","օ","ֆ","և"]
    var terranArry = ["ꅐ","ꅑ","ꅒ","ꅓ","ꅔ","ꅕ","ꅖ","ꅗ","ꅘ","ꅙ","ꅚ","ꅛ","ꅜ","ꅝ","ꅞ","ꅟ","ꅠ","ꅡ","ꅢ","ꅣ","ꅤ","ꅥ","ꅦ","ꅧ","ꅨ","ꅩ","ꅪ","ꅫ","ꅬ","ꅭ","ꅮ","ꅯ","ꅰ","ꅱ","ꅲ","ꅳ","ꅴ","ꅵ","ꅶ","ꅷ","ꅸ","ꅹ","ꅺ","ꅻ","ꅼ","ꅽ","ꅾ","ꅿ","ꆀ","ꆁ","ꆂ","ꆃ","ꆄ","ꆅ","ꆆ","ꆇ","ꆈ","ꆉ","ꆊ","ꆋ","ꆌ","ꆍ","ꆎ","ꆏ","ꆐ","ꆑ","ꆒ","ꆓ","ꆔ","ꆕ","ꆖ","ꆗ","ꆘ","ꆙ","ꆚ","ꆛ","ꆜ","ꆝ","ꆞ","ꆟ"]
    var underArry = ["⊏","⊐","⊑","⊒","⊓","⊔","⊕","⊖","⊗","⊘","⊙","⊚","⊛","⊜","⊝","⊞","⊟","⊠","⊡","⊢","⊣","⊤","⊥","⊦","⊧","⊨","⊩","⊪","⊫","⊬","⊭","⊮","⊯","⊰","⊱","⊲","⊳","⊴","⊵","⊶","⊹","⊺","⊻","⊼","⊽","⊾","⊿","⋅","⋆","⋇","⋈","⋉","⋊","⋋","⋌","⋍","⋎","⋏","⋐","⋑","⋒","⋓","⋔","⋕","⋖","⋗","⋘","⋙","⋚","⋛","⋜","⋝","⋞","⋟","⋠","⋡","⋢","⋣","⋤","⋥","⋦","⋧","⋨","⋩","⋪","⋫","⋬","⋭"]
    
        var CustomRandom = function(nseed) {    
        var seed,    
        constant = Math.pow(2, 13)+1,    
        prime = 1987,    
        maximum = 1000;    
        if (nseed) {    
          seed = nseed;    
        }
        if (seed == null) {    
          seed = (new Date()).getTime();   
        }     
        return {    
            next : function(min, max) {    
                seed *= constant;    
                seed += prime;    
                
                return min && max ? min+seed%maximum/maximum*(max-min) : seed%maximum/maximum;  
                // if 'min' and 'max' are not provided, return random number between 0 & 1  
            }   
        }   
    };

        
    if(msg.type == "api"){
        var speaking = msg.who
        var msgMessage = msg.content.substr(msg.content.indexOf(' ') + 1);
        var msgApiCommand = msg.content.substr(1, msg.content.indexOf(' ')-1);
        var gibberish = ""
        switch (msgApiCommand){
            case "aboleth":
                sendChat(speaking + " in aboleth","/w aboleth " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(1,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + abolethArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "abyssal":
                sendChat(speaking + " in abyssal","/w abyssal " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(3,20));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + evilArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "aklo":
                sendChat(speaking + " in aklo","/w aklo " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(3,42));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + akloArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "aquan":
                sendChat(speaking + " in aquan","/w aquan " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(1,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + aquanArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "auran":
                sendChat(speaking + " in auran","/w auran " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(3,48));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + auranArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "boggard":
                sendChat(speaking + " in boggard","/w boggard " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(2,43));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + boggardArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "celestial":
                sendChat(speaking + " in celestial","/w celestial " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(1,23));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + celestialArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "cyclops":
                sendChat(speaking + " in cyclops","/w cyclops " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(2,33));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + giantArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "draconic":
                sendChat(speaking + " in draconic","/w draconic " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(1,40));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + draconicArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "drow":
                sendChat(speaking + " in drow-sign-language","/w drow " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,60));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + drowArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "druidic":
                sendChat(speaking + " in druidic","/w druidic " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(1,40));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + druidicArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "dwarven":
                sendChat(speaking + " in dwarven","/w dwarven " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(2,28));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + dwarvenArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "elven":
                sendChat(speaking + " in elven","/w elven " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(1,41));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + elvenArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "giant":
                sendChat(speaking + " in giant","/w giant " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + giantArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "gnoll":
                sendChat(speaking + " in gnoll","/w gnoll " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + gnollArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "gnome":
                sendChat(speaking + " in gnome","/w gnome " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + gnomeArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
              case "goblin":
                sendChat(speaking + " in goblin","/w goblin " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + goblinArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "halfling":
                sendChat(speaking + " in halfling","/w halfling " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + halflingArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "ignan":
                sendChat(speaking + " in ignan","/w ignan " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + ignanArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "infernal":
                sendChat(speaking + " in infernal","/w infernal " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(1,25));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + evilArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "orc":
                sendChat(speaking + " in orc","/w orc " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + orcArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "protean":
                sendChat(speaking + " in protean","/w protean " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(3,37));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + proteanArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "sphinx":
                sendChat(speaking + " in sphinx","/w sphinx " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + sphinxArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "sylvan":
                sendChat(speaking + " in sylvan","/w sylvan " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + sylvanArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "tengu":
                sendChat(speaking + " in tengu","/w tengu " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + tenguArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "terran":
                sendChat(speaking + " in terran","/w terran " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + terranArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "treant":
                sendChat(speaking + " in treant","/w treant " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(2,40));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + sylvanArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
            case "undercommon":
                sendChat(speaking + " in undercommon","/w undercommon " + msgMessage);
                var gibberish = ""
                for (var i=0;i<msgMessage.length;i++){
                    letterGiven = msgMessage.substr(i,1);
                    var rng = CustomRandom(letterGiven.charCodeAt(0));
                    var seedRND = Math.ceil(rng.next(4,30));
                    if(letterGiven == " "){
                       var gibberish = gibberish + "  " 
                    }else{
                    var gibberish = gibberish + underArry[seedRND]
                    };
                };
                sendChat(speaking, gibberish);
                break;
        };  
    };
})