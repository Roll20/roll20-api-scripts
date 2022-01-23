/*Warhammer Fantasy 4th Edition PL Scripts.
All creative credit to GW and Cubicle 7
Unofficial script base on polish translation done by Copernicus Corporation
Groundwork done by Seth Williams. Thanks!

email: m.a.d1@wp.pl

!help for help
*/


//global variables
let roll = 0;
// Conditions
const krwawienia = '<a title="1 rana na poziom na rundę.-10 do testów przeciw Ropiejącym Ranom, Infekcjom i Zatruciu Krwi. 10% * poziom krwawienia szansy na śmierć, gdy 0 Żywotności. Zmęczenie po zdjęciu wszystkich." href="https://app.roll20.net/compendium/WFRP/Bleeding#h-Bleeding"><i>Krwawienia</i></a>';
const ogluszenia = '<a title="-10 do testów słuchu. Atakujący z flanki lub tyłu +10 do trafienia przeciw postaci (nie rośnie z poziomem). Schodzi 1 poziom na koniec każdej rundy." href="https://app.roll20.net/compendium/WFRP/Deafened#h-Deafened"><i>Ogłuszenia</i></a>';
const oszolomienia = '<a title="Nie można podejmować akcji. Ruch tylko o połowę Szybkosci. Nie może się bronić Językiem Magicznym. -10 do wszystkich testów. Atakujący postać dostają +1 przewagę przed rzutem! Wymagający(+0) Test odporności ściąga 1+PS. Zmęczenie po zdjęciu wszystkich." href = "https://app.roll20.net/compendium/WFRP/Stunned#h-Stunned"><i>Oszołomienia</i></a>';
const oslepienia = '<a title="-10 do testów wzroku. Atakujący postać otrzymują +10 do trafienia. Schodzi 1 poziom co dwie rundy." href = "https://app.roll20.net/compendium/WFRP/Blinded#h-Blinded"><i>Oślepienia</i></a>';
const paniki = '<a title="Ruch i Akcja by uciec od źródła strachu. -10 do wszystkich testów nie związanych z ucieczką i ukrywaniem. Jeśli nie w walce - Test Opanowania zdejmuje 1 + PS poziomów. Pełna runda w ukryciu zdejmuje 1 poziom. Po zdjęciu ostatniego postać otrzymuje 1 poziom zmęczenia." href="https://app.roll20.net/compendium/WFRP/Broken#h-Broken"><i>Paniki</i></a>';
const pochwycenia = '<a title="Nie może wykonać Ruchu. Akcje wymagające poruszania się mają karę -10. Przeciwstawny Test siły przeciw źródłu Pochwycenia zdejmuje 1 + PS poziomów." href="https://app.roll20.net/compendium/WFRP/Entangled#h-Entangled"><i>Pochwycenia</i></a>';
const podpalenia = '<a title="1k10 Obrażeń - BWt i pancerz na najgorzej chronionej lokacji. Co najmniej 1 rana. Każdy dodatkowy poziom zwiększa obrażenia o 1. Udany test Atletyki zdejmuje 1 + PS poziomów." href="https://app.roll20.net/compendium/WFRP/Ablaze#h-Ablaze"></i>Podpalenia</i></a>';
const powalenie = '<a title="-20 do testów poruszania się. Albo wstać albo czołgać się max połowa Szybkości metrów. Jeśli żywotność 0 to tylko czołgać. Atakujący postać otrzymują +20 do trafienia. Nie ma poziomów." href="https://app.roll20.net/compendium/WFRP/Prone#h-Prone"><i>Powalenie</i></a>';
const utrataPrzyt = '<a title="Postać nie może działać. Przy atakowaniu ustala się wynik rzutu. Nie ma poziomów. Punkt determinacji ściąga tylko na Rundę. Po zdjęciu postać otrzymuje Zmęczenie i Powalenie." href="https://app.roll20.net/compendium/WFRP/Conditions:Unconscious"><i>Utrata Przytomności</i></a>';
const zaskoczona = '<a title="Postać nie może wykonać Akcji ani Ruchu. Nie może się bronić w Testach Przeciwstawnych. Atakujący postać zyskują +20. Mija na koniec Rundy albo po pierwszym ataku" href="https://app.roll20.net/compendium/WFRP/Surprised#h-Surprised"><i>Zaskoczona</i></a>';
const zatrucia = '<a title="1 Rana na koniec Rundy. -10 do wszystkich Testów. Na koniec Rundy Test Odporności zdejmuje 1 + PS poziomów. Jeśli Utraci Przytomność, po BWt rzut na Odporność przeciw śmierci. Po zdjęciu wszystkich postać otrzymuje 1 poziom Zmęczenia." href="https://app.roll20.net/compendium/WFRP/Poisoned#h-Poisoned"><i>Zatrucia</i></a>';
const zmeczenia = '<a title="-10 do Wszystkich Testów. Ściągane przez wypoczynek, zaklęcie bądź boską interwencję. Nie dotyczy otrzymaneg onp. przez Obciążenia." href="https://app.roll20.net/compendium/WFRP/Fatigued#h-Fatigued"><i>Zmęczenia</i></a>';

const conditions =
	`${krwawienia}, ${ogluszenia}, ${oszolomienia}, ${oslepienia}, ${paniki}, ${pochwycenia}, ${podpalenia}, ${powalenie}, ${utrataPrzyt}, ${zaskoczona}, ${zatrucia}, ${zmeczenia}`;

//Other descriptions
const amputacja = '<a title="Test odporności, trudność w nawiasie. Nieudany oznacza: 0PS -Powalenie, -2PS - 1 poziom Oszołomienia, -4PS - Utrata Przytomności. Wymagają leczenia Chirurgicznego. Strona 180." href="https://app.roll20.net/compendium/WFRP/Injury#h-Amputated%20Parts"><b>Amputacja</b></a>';
const pomocChir = '<a title="Udany Wydłużony Wymagający Test Leczenia z talentem Chirurgia na 5-10 PS. Zadaje k10 obrażeń. Każdy test nakłada Krwawienie. Po operacji Przeciętny (+20) Test Odporności przeciw Infekcji." href="https://app.roll20.net/compendium/WFRP/Surgery#h-Surgery"><b>Pomocy Chirurgicznej</b></a>';
const pomocMed = '<a title="Udany Test Leczenia albo bandaże, kataplazm, medykamenty, albo zaklęcie/modlitwa lecząca." href="https://app.roll20.net/compendium/WFRP/Injury#h-Medical%20Attention"><b>Pomocy Medycznej</b></a>';
const zerwanie = '<a title="Pomniejsze: 30 - BWt - PS Leczenia dni. Kara -10 do testów kończyny. Połowa szybkości jeśli noga. Poważne: 30 - BWt dni spada do pomniejszego. Kary -20. Strona 180." href="https://app.roll20.net/compendium/WFRP/Injury#h-Torn%20Muscles"><b>Zerwanie mięśni</b></a>';
const zlamanie = '<a title="Pomniejsze: 30+k10 dni. Przeciętny (+20) Test Odporności na koniec lub Leczenia w ciągu tygodnia od złamania, inaczej trwała kara -5. Poważne: +10 dni, Testy Wymagające, kara -10. Strona 179." href="https://app.roll20.net/compendium/WFRP/Injury#h-Broken%20Bones"><b>Złamanie</b></a>';



//functions
function rolld100(){return Math.floor(Math.random() * 100) +1;}

//help function
function getHelp(msg) {
    sendChat(msg.who, "HELP:");
    sendChat(msg.who, "Wpisz !critloc by wylosować miejsce i wartość trafienia krytycznego.");
    sendChat(msg.who, "Wpisz !crithead, !critarm, !critbody, or !critleg by wylosować trafienie krytyczne w daną część ciała");
    sendChat(msg.who, "Wpisz !crithead x, !critarm x, !critbody x, or !critleg x by otrzymać opis trafienia krytycznego dla danego wyniku.");
	sendChat(msg.who, "Wpisz !manifest, !manifest x, !Manifest lub !Manifest x by wylosować odpowidnio mniejszą lub większą manifestację");
    sendChat(msg.who, "Wpisz !ozez by wylosować wynik z tabeli Ożeż!.");
	sendChat(msg.who, "Wpisz !stany by wypisać listę stanów.");
    sendChat(msg.who, "Przykład: '!crithead 99' will return the result of a critical hit to the head with a roll of 99, while !crithead will give a random result for that location.");
}

//determine crit location
function critLocation(roll, less) {
    critRoll = Math.max(rolld100() - less, 1);

    if (roll < 10) {return "Trafiasz w głowę.\n" + critRoll + " " + critHead(critRoll);}
        else if (roll < 25) {return "Trafiasz w lewą rękę.\n" + critRoll + " " + critArm(critRoll);}
        else if (roll < 45) {return "Trafiasz w prawą rękę.\n" + critRoll + " " + critArm(critRoll);}
        else if (roll < 80) {return "Trafiasz w korpus.\n" + critRoll + " " + critBody(critRoll);}
        else if (roll < 90) {return "Trafiasz w lewą nogę.\n" + critRoll + " " + critLeg(critRoll);}
        else {return "Trafiasz w prawą nogę.\n" + critRoll + " " + critLeg(critRoll);}
}

//critical to the head
function critHead(roll) {
    if (roll < 11) {return `<b>Rany : 1</b>.<br/>Zawadiacka rana. Mocny cios przez czoło i policzek. Postać otrzymuje 1 poziom ${krwawienia}. Po wyleczeniu takiej rany pozostaje budząca szacunek blizna, która zapewnia premię +1<b>PS</b> do odpowiednich Testów w kontaktach społecznych. Premię można otrzymać tylko raz.`;}
        else if (roll < 21) {return `<b>Rany : 1</b>.<br/>Płytkie cięcie. Cios przecina policzek rozbryzgując dookoła krew. Postać otrzymuje 1 poziom ${krwawienia}`;}
        else if (roll < 26) {return `<b>Rany : 1</b>.<br/>Spuchnięte oko. Mocny cios trafia w oczodół. Postać otrzymuje 1 poziom ${oslepienia}`;}
        else if (roll < 31) {return `<b>Rany : 1</b>.<br/>Prosto w ucho. Cios uderza w bok głowy z olbrzymią mocą, aż dzwoni w uchu. Postać otrzymuje 1 poziom ${ogluszenia}`;}
        else if (roll < 36) {return `<b>Rany : 2</b>.<br/>Bolesne uderzenie. Cios jest na tyle mocny, że w polu widzenia pojawiają się plamki i gwiazdki. Postać otrzymuje 1 poziom ${oszolomienia}`;}
        else if (roll < 41) {return `<b>Rany : 2</b>.<br/>Podbite oko. Cios w oko jest na tyle mocny, że postać zaczyna łzawić z bólu. Postać otrzymuje 2 poziomy ${oslepienia}`;}
        else if (roll < 46) {return `<b>Rany : 2</b>.<br/>Rozcięte ucho. Cios w bok głowy jest na tyle mocny, że wrzyna się głęboko w ucho. Postać otrzymuje 2 poziomy ${ogluszenia} i 1 poziom ${krwawienia}.`;}
        else if (roll < 51) {return `<b>Rany : 2</b>.<br/>Uderzenie w czoło. Potężny cios trafia w sam środek czoła. Postać otrzymuje 2 poziomy ${krwawienia} oraz 1 poziom ${oslepienia}, który nie może zostać usunięty, póki <i>Krwawienie</i> nie zostanie wyleczone.`;}
        else if (roll < 56) {return `<b>Rany : 3</b>.<br/>Złamana szczęka. Cios z obrzydliwym chrupnięciem łamie żuchwę i zalewa twarz falą ogromnego bólu. Postać otrzymuje 2 poziomy ${oszolomienia}. Ponadto otrzymuje uraz ${zlamanie} (pomniejsze).`;}
        else if (roll < 61) {return `<b>Rany : 3</b>.<br/>Poważna rana oka. Cios łamie oczodół. Postać otrzymuje 1 poziom ${krwawienia}. Ponadto otrzymuje 1 pozoiom ${oslepienia}, który nie może zostać usunięty, póki postać nie otrzyma ${pomocMed}.`;}
        else if (roll < 66) {return `<b>Rany : 3</b>.<br/>Poważna rana ucha. Cios niszczy małżowinę uszną, co skutkuje trwałym uszkodzeniem słuchu. Wszystkie Testy związane ze słuchem otrzymują kare -20. Jeśli postać otrzyma taką ranę ponownie, cios zadawany jest w drugie ucho, co skutkuje głuchotą. Wtedy pomoże już tylko magia.`;}
        else if (roll < 71) {return `<b>Rany : 3</b>.<br/>Złamany nos. Silny cios trafia w sam środek twarzy, a postać zalewa się krwią. Postać otrzymuje 2 poziomy ${krwawienia}. Musi także zdać <b>Wymagający (+0) test Odporności</b>, w przeciwnym wypadku otrzyma również 1 poziom ${oszolomienia}. Po wyleczeniu tej rany otrzymuje +1 lub -1 PS do Testów w kontaktach społecznych (w zależności od kontekstu), chyba że podjęto Test <b>Chirurgii</b>, by nastawić i wyprostować nos.`;}
        else if (roll < 76) {return `<b>Rany : 4</b>.<br/>Zmiażdżona żuchwa. Następuje obrzydliwy trzask, a cios trafia w żuchwę od spodu, miażdżąc ją. Postać otrzymuje 3 poziomy ${oszolomienia}. Musi także zdać <b>Wymagający (+0) Test Odporności</b>, w przeciwnym wypadku otrzyma również 1 poziom ${ogluszenia}. Ponadto otrzymuje uraz ${zlamanie} (poważne).`;}
        else if (roll < 81) {return `<b>Rany : 4</b>.<br/>Wstrząśnienie mózgu. Mózg obija się wewnątrz czaski, a krew wypływa z nosa i uszu. Postać otrzymuje 1 poziom ${ogluszenia}, 2 poziomy ${krwawienia} oraz  [[d10]]  poziomów ${oszolomienia}. Ponadto na [[d10]] dni uznaje się ją również za <i>Zmęczoną</i>. Jeśli postać otrzyma kolejną <b>Ranę Krytyczną</b> w głowę, będąc jeszcze <i>Zmęczoną</i> po ostatnim wstrząśnieniu mózgu, musi wykonać <b>Przeciętny(+20) Test Odporności</b>. Jeśli ten test się nie powiedzie następuje ${utrataPrzyt}.`;}
        else if (roll < 86) {return `<b>Rany : 4</b>.<br/>Rozkwaszone usta. Cios jest na tyle mocny, że usta wypełniają się wybitymi zębami i mnóstwem krwi. Postać otrzymuje 2 poziomy ${krwawienia}. Ponadto traci [[d10]] zębów - to ${amputacja} (łatwa).`;}
        else if (roll < 91) {return `<b>Rany : 4</b>.<br/>Zgruchotane ucho. Po uchu zostaje niewiele, a cios odrywa je od ciała. Postać otrzymuje 3 poziomy ${ogluszenia} i 2 poziomy ${krwawienia}. Ponadto traci ucho - ${amputacja} (przeciętna).`;}
        else if (roll < 94) {return `<b>Rany : 5</b>.<br/>Wybite oko. Cios zupełnie niszczy gałkę oczną, wywołując niezwykle silny ból. Postać otrzymuje 3 poziomy ${oslepienia}, 2 poziomy ${krwawienia} i 2 poziomy ${oszolomienia}. Ponadto traci oko - ${amputacja} (wymagająca).`;}
        else if (roll < 97) {return `<b>Rany : 5</b>.<br/>Oszpecający cios. Uderzenie roztrzaskuje całą twarz, niszcząc oko i nos w fontannie krwi. Postać otrzymuje 3 poziomy ${oslepienia}, 3 poziomy ${krwawienia} i 2 poziomy ${oszolomienia}. Następuje utrata oka i nosa - ${amputacja} (trudna).`;}
        else if (roll < 100) {return `<b>Rany : 5</b>.<br/>Zgruchotana szczęka. Cios prawie odrywa żuchwę od ciała, niszcząc język, i rozrzuca dookoła połamane zęby w chmurze krwi. Postać otrzymuje 4 poziomy ${krwawienia} oraz 3 poziomy ${oszolomienia}. Musi także zdać <b>Bardzo Trudny (-30) Test Odporności</b>, w przeciwnym wypadku otrzyma również 1 poziom ${ogluszenia}. Ponadto otrzymuje Uraz ${zlamanie} (poważne) i traci język oraz [[d10]] zębów - ${amputacja} (trudna).`;}
        else {return `<b>Śmierć!</b><br/>Dekapitacja. Cios gładko odcina głowę, która leci w powietrze lądując [[d5]] metrów w dowolnym kierunku (patrz <b>Rozrzut</b>). Martwe, bezgłowe ciało pada na ziemię.`;}
}

//critical to arm
function critArm(roll) {
    if (roll < 11) {return `<b>Rany : 1</b>.<br/>Zdrętwiałe ramię. W wyniku ataku ramię przechodzą fale odrętwienia. Postać upuszcza wszystko, co trzymała w dłoni.`;}
        else if (roll < 21) {return `<b>Rany : 1</b>.<br/>Płytkie cięcie. Postać otrzymuje 1 poziom ${krwawienia} w wyniku cięcia w ramię.`;}
        else if (roll < 26) {return `<b>Rany : 1</b>.<br/>Skręcenie. Skręcone ramię skutkuje ${zerwanie} (pomniejszym).`;}
        else if (roll < 31) {return `<b>Rany : 1</b>.<br/>Bardzo zdrętwiałe ramię. W wyniku ataku ramię postaci zupełnie drętwieje. Postać upuszcza wszystko, co trzymała w dłoni, która przez [[d10]] Rund - <b>BWt</b> (co najmniej jedna) jest bezużyteczna. Przez ten czas należy traktować dłoń jak straconą (patrz ${amputacja}`;}
        else if (roll < 36) {return `<b>Rany : 2</b>.<br/>Zerwane mięśnie. Cios wbija się z impetem w przedramię. Postać otrzymuje 1 poziom ${krwawienia} oraz Uraz ${zerwanie} (pomniejsze)`;}
        else if (roll < 41) {return `<b>Rany : 2</b>.<br/>Krwawiąca dłoń. Głębokie cięcie sprawia, że dłoń obficie krwawi, przez co chwyt staje się śliski. Postać otrzymuje 1 poziom ${krwawienia}. Dopóki dłoń będzie krwawić, we wszystkich testach czynności, podczas których postać trzyma coś w dłoni, należy wykonać <b>Przeciętny (+20) Test Zręczności</b>. Jeśli ten się nie powiedzie, trzymany przedmiot wymyka się z dłoni.`;}
        else if (roll < 46) {return `<b>Rany : 2</b>.<br/>Wybicie stawu. Ramię prawie zostało wyrwane ze stawu. Wszystko, co było trzymane w dłoni, wypada, a ramie jest bezużyteczne przez [[d10]] Rund (patrz ${amputacja}.`;}
        else if (roll < 51) {return `<b>Rany : 3</b>.<br/>Ziejąca rana. Cios skutkuje głęboką, otwartą raną. Postać otrzymuje 2 poziomy ${krwawienia}. Dopóki rozcięcie nie zostanie zszyte dzięki ${pomocChir}, każda Rana otrzymana w to ramię skutkuje zwiększeniem ${krwawienia} o 1 poziom, ponieważ rana się otwiera i pogłębia.`;}
        else if (roll < 56) {return `<b>Rany : 3</b>.<br/>Czyste złamanie. Z donośnym trzaskiem ramię pęka w miejscu uderzenia. Postać natychmiast upuszcza wszystko co trzymała w dłoni, i otrzymuje ${zlamanie} (pomniejsze). Musi także zdać <b>Problematyczny (-10) Test Odporności</b>, w przeciwnym wypadku otrzyma również 1 poziom ${oszolomienia}.`;}
        else if (roll < 61) {return `<b>Rany : 3</b>.<br/>Zerwane więzadło. Postać natychmiast upuszcza wszystko, co trzymała w dłoni. Otrzymuje ${zerwanie} (pomniejsze).`;}
        else if (roll < 66) {return `<b>Rany : 3</b>.<br/>Głębokie cięcie. Postać otrzymuje 2 poziomy ${krwawienia} w wyniku głębokiego cięcia. Ponadto otrzymuje również 1 poziom ${oszolomienia} oraz ${zerwanie} (pomniejsze). Musi także zdać <b>Trudny (-20) Test Odporności, inaczej nastapi ${utrataPrzyt}.`;}
        else if (roll < 71) {return `<b>Rany : 4</b>.<br/>Uszkodzona tętnica. Postać otrzymuje 4 poziomy ${krwawienia}. Dopóki ktoś nie udzieli postaci ${pomocChir}, za każdym razem, gdy otrzyma ona Ranę w to ramię, dostanie dodatkowe 2 poziomy ${krwawienia}.`;}
        else if (roll < 76) {return `<b>Rany : 4</b>.<br/>Zmiażdżony łokieć. Uderzenie gruchocze łokieć, rozłupuje kości i chrząstkę. Postać natychmiast upuszcza wszystko co trzymała w dłoni, i otrzymuje ${zlamanie} (poważne).`;}
        else if (roll < 81) {return `<b>Rany : 4</b>.<br/>Wywichnięty bark. Ramie zostało wyrwane ze stawu. Postać musi zdać <b>Trudny (-20) Test Odporności</b> w przeciwnym wypadku otrzyma stany ${powalenie} i ${utrataPrzyt}. Wszystko, co było trzymane w dłoni, wypada, a ramię jest bezużyteczne i uznawane za stracone (patrz <b>Amputacje</b>). Ponadto postać otrzymuje 1 poziom ${oszolomienia}, dopóki nie zostanie udzielona jej ${pomocMed}. Jednakże nastawienie ramienia, nawet po udzieleniu pomocy, wymagać będzie <b>Wydłużonego Przeciętnego (+20) Testu Leczenia</b> w którym należy osiągnąć co najmniej 6 PS. Dopiero wtedy postać będzie mogła znów ruszać ramieniem. Testy wykonywane przy pomocy tego ramienia obarczone są karą -10 przez [[d10]] dni.`;}
        else if (roll < 86) {return `<b>Rany : 4</b>.<br/>Odcięty palec. Postać z otwartymi ustami patrzy na lecący w powietrzu własny palec. - ${amputacja} (przeciętna). Postać otrzymuje 1 poziom ${krwawienia}.`;}
        else if (roll < 91) {return `<b>Rany : 4</b>.<br/>Zmasakrowana dłoń. Cios przecina dłoń, a rana zaczyna się rozszerzać. Postać traci 1 palec - ${amputacja} (problematyczna). Ponadto otrzymuje 2 poziomy $[krwawienia} oraz 1 poziom ${oszolomienia}. W każdej następnej Rundzie, jeśli nie otrzyma ${pomocMed}, traci kolejny palec, ponieważ ranas się rozszerza, a dłoń po prostu rwie się na strzępy. Jeśli skończą się palce postać traci dłoń - ${amputacja} (trudna).`;}
        else if (roll < 94) {return `<b>Rany : 5</b>.<br/>Rozszarpany biceps. Cios niemal oddziela biceps i ścięgna od kości, co skutkuje paskudną raną i krwią bryzgającą na wszystkich dookoła. Postać automatycznie upuszcza wszystko, co trzymała w dłoni, i otrzymuje Uraz ${zerwanie} (poważne), 2 poziomy ${krwawienia} oraz 1 poziom ${oszolomienia}.`;}
        else if (roll < 97) {return `<b>Rany : 5</b>.<br/>Zgruchotana dłoń. Dłoń postaci jest zgruchotaną, krwawiącą papką Postać traci dłoń - ${amputacja} (trudna)</b> - i otrzymuje 2 poziomy ${krwawienia}. Musi zdać <b>Trudny (-20) Test Odporności</b>, w przeciwnym wypadku otrzyma stany ${powalenie} i ${utrataPrzyt}.`;}
        else if (roll < 100) {return `<b>Rany : 5</b>.<br/>Przecięte ścięgna. Cios przecina ścięgna, a ramię zwisa bezwładnie - ${amputacja} (bardzo trudna) </b>. Postać otrzymuje stany: ${powalenie}, 3 poziomy ${krwawienia} i 1 poziom ${oszolomienia}. Musi także zdać <b>Trudny (-20) Test Odporności</b>, w przeciwnym wypadku nastapi ${utrataPrzyt}.`;}
        else {return `<b>Śmierć!</b>.<br/>Odcięte ramię. Ramię odlatuje od ciała na [[d5]] metrów w losowym kierunku (patrz <b>Rozrzut</b>), rozbryzgując tętniczą krew, a cios przebija się przez klatkę piersiową.`;}
}

//critical to the body
function critBody(roll) {
    if (roll < 11) {return `<b>Rany : 1</b>.<br/>Ledwie draśnięcie. Postać otrzymuje 1 poziom ${krwawienia}.`;}
        else if (roll < 21) {return `<b>Rany : 1</b>.<br/>Cios w bebechy. Postać otrzymuje 1 poziom ${oszolomienia}. Musi również wykonać <b>Łatwy (+40) Test Odporności</b>. Jeśli ten się nie uda, postać zwymiotuje i otrzyma stan ${powalenie}.`;}
        else if (roll < 26) {return `<b>Rany : 1</b>.<br/>Poniżej pasa! Postać musi wykonać <b>Trudny (-20) Test Odporności</b>. Jeśli się jej nie powiedzie otrzymuje 3 poziomy ${oszolomienia}.`;}
        else if (roll < 31) {return `<b>Rany : 1</b>.<br/>Cios w krzyż. Postać otrzymuje Uraz ${zerwanie} (pomniejsze).`;}
        else if (roll < 36) {return `<b>Rany : 2</b>.<br/>Bez tchu. Postać otrzymuje 1 poziom ${oszolomienia}. Musi również zdać <b>Przeciętny (+20) Test Odporności</b> albo otrzyma stan ${powalenie}. Szybkość zmniejsza się o połowę na [[d10]] Rund, czyli dopóki postać nie zacznie oddychać normalnie.`;}
        else if (roll < 41) {return `<b>Rany : 2</b>.<br/>Stłuczone żebra. Wszystkie testy zwinności otrzymują karę -10 na [[d10]] dni.`;}
        else if (roll < 46) {return `<b>Rany : 2</b>.<br/>Stłuczony obojczyk. Losowo wyznacz ramię. Wszystko, co było trzymane w dłoni po tej stronie ciała, wypada, a ramię jest bezużyteczne przez [[d10]] Rund (patrz <b>Amputacje</b>).`;}
        else if (roll < 51) {return `<b>Rany : 2</b>.<br/>Nierówne cięcie. Postać otrzymuje 2 poziomy ${krwawienia}`;}
        else if (roll < 56) {return `<b>Rany : 3</b>.<br/>Połamane żebra. Cios łamie jedno lub kilka żeber. Postać otrzymuje 1 poziom ${oszolomienia}. Ponadto otrzymuje Uraz ${zlamanie} (pomniejsze).`;}
        else if (roll < 61) {return `<b>Rany : 3</b>.<br/>Ziejąca rana. Postać otrzymuje 3 poziomy ${krwawienia}. Dopóki ktoś nie udzieli jej ${pomocChir}, za każdym razem, gdy poostać otrzyma Ranę w korpus, otrzymuje dodatkowy poziom ${krwawienia}, gdyż rozcięcie się otwiera.`;}
        else if (roll < 66) {return `<b>Rany : 3</b>.<br/>Bolesne cięcie. Postać otrzymuje 2 poziomy ${krwawienia}. oraz 1 poziom ${oszolomienia}. Musi także zdać <b>Trudny (-20) Test Odporności</b>, w przeciwnym wypadku nastąpi ${utrataPrzyt} z powodu bólu. Jeśli Test nie zakończy się co najmniej 4 PS, postać wyje z bólu.`;}
        else if (roll < 71) {return `<b>Rany : 3</b>.<br/>Uszkodzenie tętnicy. Postać otrzymuje 4 poziomy ${krwawienia}. Dopóki ktoś nie udzieli jej ${pomocChir}, za każdym razem gdy postać otrzyma ranę w korpus, otrzymuje dodatkowe 2 poziomy ${krwawienia}.`;}
        else if (roll < 76) {return `<b>Rany : 4</b>.<br/>Naderwane mięśnie pleców. Plecy przemieniają sięw jedną wielką strefę obezwładniającego bólu. Postać otrzymuje Uraz ${zerwanie} (pomniejsze).`;}
        else if (roll < 81) {return `<b>Rany : 4</b>.<br/>Złamane biodro. Postać otrzymuje 1 poziom ${oszolomienia}. Musi także zdać <b>Wymagający (+0) Test Odporności</b>, w przeciwnym wypadku otrzyma stan ${powalenie}. Ponadto otrzymuje Uraz ${zlamanie} (pomniejsze)`;}
        else if (roll < 86) {return `<b>Rany : 4</b>.<br/>Poważna rana klatki piersiowej. Postać otrzymuje poważny cios w klatkę piersiową, który oddziela skórę od mięśni i ścięgien. Otrzymuje 4 poziomy ${krwawienia}. Dopóki ktoś nie udzieli jej ${pomocChir} i nie zszyje rany, za każdym razem gdy postać otrzyma Ranę w korpus, otrzymuje dodatkowy poziom ${krwawienia}, a rana się otwiera.`;}
        else if (roll < 91) {return `<b>Rany : 4</b>.<br/>Rana brzucha. Cios skutkuje zadaniem <i>Ropiejącej Rany</i> (patrz <b>Choroby i infekcje</b> i otrzymaniem 2 poziomów ${krwawienia}.`;}
        else if (roll < 94) {return `<b>Rany : 5</b>.<br/>Strzaskana klatka piersiowa. Postać otrzymuje 1 poziom ${oszolomienia}, który można jedynie usunąć, udzielając ${pomocMed}, a także Uraz ${zlamanie} (poważne).`;}
        else if (roll < 97) {return `<b>Rany : 5</b>.<br/>Złamany obojczyk. Postać pada na ziemię w Stanie ${utrataPrzyt} i nie ocknie się, dopóki nie zostanie udzielona ${pomocMed}, a ponadto otrzymuje Uraz ${zlamanie} (poważne).`;}
        else if (roll < 100) {return `<b>Rany :5</b>.<br/>Krwotok wewnętrzny. Postać otrzymuje 1 poziom ${krwawienia}, który można usunąć jedynie za pomocą <b>Chirurgii</b>. Ponadto Rana skutkuje także <i>Zatruciem Krwi</i> (patrz <b>Choroby i infekcje</b>).`;}
        else {return `<b>Śmierć!</b>.<br/>Rozpłatanie. Postać zostaje przecięta na dwoje. Górna połowa korpusu pada w losowym kierunku, a wszystkie postaci w promieniu dwóch metrów zostają skąpane w fontannie krwi.`;}
}

//critical to the leg
function critLeg(roll) {
    if (roll < 11) {return `<b>Rany : 1</b>.<br/>Stłuczony palec. W wyniku starcia postać otrzymuje bolesne uderzenie w paluch. Należy przeprowadzić <b>Przeciętny (+20) Test Odporności</b>, a jesli ten się nie powiedzie, do końca następnej Rundy wszystkie Testy Zwinności obarczone będą karą -10.`;}
        else if (roll < 21) {return `<b>Rany : 1</b>.<br/>Skręcona kostka. Niepewny krok kończy się skręceniem kostki. Wszystkie Testy Zwinności obarczone są karą -10 na [[d10]] dni.`;}
        else if (roll < 26) {return `<b>Rany : 1</b>.<br/>Płytkie cięcie. Postać otrzymuje 1 poziom ${krwawienia}`;}
        else if (roll < 31) {return `<b>Rany : 1</b>.<br/>Utrata równowagi. W wyniku szamotaniny postać traci równowagę. Musi także zdać <b>Wymagający (+0) Test Odporności</b>, w przeciwnym wypadku otrzyma stan ${powalenie}.`;}
        else if (roll < 36) {return `<b>Rany : 2</b>.<br/>Cios w udo. Bolesny cios uderza prosto w górną część uda, tuż przy biodrze. Postać otrzymuje 1 poziom ${krwawienia}, musi również wykonać <b>Przeciętny (+20) Test Odporności</b>, a jeśli się jej nie uda, otrzyma stan ${powalenie}.`;}
        else if (roll < 41) {return `<b>Rany : 2</b>.<br/>Zwichnięta kostka. W wyniku zwichnięcia postać otrzymuje Uraz ${zerwanie} (pomniejsze).`;}
        else if (roll < 46) {return `<b>Rany : 2</b>.<br/>Nadwyrężone kolano. Z powodu niezdarnego kroku kolano nie wytrzymuje. Wszystkie Testy Zwinności otrzymują karę -20 na [[d10]] dni.`;}
        else if (roll < 51) {return `<b>Rany : 2</b>.<br/>Paskudnie przecięty paluch. Postać otrzymuje 1 poziom ${krwawienia}. Musi także zdać <b>Wymagający (+0) Test Odporności</b>. Jeśli ten się uda, postać traci 1 palec u nogi ${amputacja} (przeciętna).`;}
        else if (roll < 56) {return `<b>Rany : 3</b>.<br/>Paskudne cięcie. Postać otrzymuje 2 poziomy ${krwawienia}, a na jej łydce pojawia się głębokie otwarte rozcięcie. Musi także zdać <b>Wymagający (+0) Test Odporności</b>, w przeciwnym wypadku otrzyma stan ${powalenie}.`;}
        else if (roll < 61) {return `<b>Rany : 3</b>.<br/>Skręcone kolano. Postać, próbując uniknąć ciosu przeciwnika, odskakuje, ale manewr kończy się poważnym skręceniem kolana. Otrzymuje Uraz ${zerwanie}(poważne)`;}
        else if (roll < 66) {return `<b>Rany : 3</b>.<br/>Porąbana noga. Cios wgryza się głęboko w biodro. Postać otrzymuje stany ${powalenie} oraz 2 poziomy ${krwawienia}. Zyskuje też uraz ${zlamanie} (pomniejsze). Musi takze zdać <b>Wymagający (+0) Test Odporności</b>, w przeciwnym wypadku otrzyma również 1 poziom ${oszolomienia}.`;}
        else if (roll < 71) {return `<b>Rany : 3</b>.<br/>Poszarpane udo. Postać otrzymuje 3 poziomy ${krwawienia}, a cios odrywa kawał mięśni z jej uda. Musi także zdać <b>Wymagający (+0) Test Odporności</b> , w przeciwnym wypadku otrzyma stan ${powalenie}. Dopóki postać nie otrzyma ${pomocChir} i udo nie zostanie zszyte, kazda Rana otrzymana w tę nogę będzie skutkować zwiększeniem ${krwawienia} o 1 poziom.`;}
        else if (roll < 76) {return `<b>Rany : 4</b>.<br/>Zerwane ścięgno. W wyniku zerwania ścięgna w nodze postać otrzymuje Stany ${powalenie} i ${oszolomienia}. Musi także zdać <b>Trudny (-20) Test Odporności</b>, w przeciwnym wypadku nastąpi ${utrataPrzyt}. Noga jest bezwładna (patrz <b>Amputacje</b>), a cios skutkuje Urazem ${zerwanie} (poważne).`;}
        else if (roll < 81) {return `<b>Rany : 4</b>.<br/>Rozerwana łydka. Cios trafia czysto pod kolano, rozcinając mięście i ścęgna aż do kości. Postć otrzymuje Stany ${powalenie} i 1 poziom ${oszolomienia}. Ponadto zyskuje urazy ${zerwanie} (pomniejsze) oraz ${zlamanie} (pomniejsze).`;}
        else if (roll < 86) {return `<b>Rany : 4</b>.<br/>Strzaskane kolano. Cios roztrzaskuje rzepkę, której fragmenty wbijają się w mięśnie i staw, Postaćotrzymuje stany: ${powalenie}, 1 poziom ${krwawienia}, i 1 poziom ${oszolomienia} oraz Uraz ${zlamanie} (poważne), padając na ziemię i trzymając się za strzaskane kolano.`;}
        else if (roll < 91) {return `<b>Rany : 4</b>.<br/>Zwichnięte kolano. Kolano zostaje wyrwane ze stawu. Postać otrzymuje stan ${powalenie} i pada na ziemię. Musi zdać <b>Trudny (20) Test Odporności</b>, w przeciwnym wypadku otrzyma 1 poziom ${oszolomienia}, którego nie można zdjąc, dopóki nie zostanie jej udzielona ${pomocMed}. Jednakże nastawienie kolana, nawet po udzieleniu Pomocy medycznej, wymagać będzie <b>Wydłużonego Przeciętnego (+20) Testu Leczenia</b>, w którym należy osiągnąć co najmniej 6 PS. Dopiero wtedy postać będzie znów mogła ruszać nogą. Szybkość spada o połowę, a wszystkie testy, w których wykorzystywana jest noga, otrzymują karę -10 prez [[d10]] dni.`;}
        else if (roll < 94) {return `<b>Rany : 5</b>.<br/>Zmiażdżona stopa. Cios miażdży stopę postaci. Ta musi również wykonać <b>Przeciętny (+20) Test odporności</b>, a jeśli sięjej nie uda, otrzyma stan ${powalenie}, straci 1 palec u nogi, a także dodatkowy palec za każdy PS poniżej 0 - ${amputacja} (przeciętna). Postać otrzymuje 2 poziomy ${krwawienia}. Jeśli w ciągu [[d10]] dnie nie zostanie przeprowadzona ${pomocChir}, będzie trzeba amputowaćcałą stopę.`;}
        else if (roll < 97) {return `<b>Rany : 5</b>.<br/>Odcięta stopa. Cios odcina stopę, która odlatuje na [[d5]] metrów w losowym kierunku (patrz <b>Rozrzut</b>) - ${amputacja} (trudna). Postać otrzymuje stany: ${powalenie}, 3 poziomy ${krwawienia} i 2 poziomy ${oszolomienia}.`;}
        else if (roll < 100) {return `<b>Rany : 5</b>.<br/>Przecięte ścięgna. Ważne ścięgno w nodze zostaje przecięte. Kończyna nie wytrzymuje ciężaru ciała, a postać pada na ziemię, wrzeszcząc z bólu. Otrzymuje stany ${powalenie}, 2 poziomy ${krwawienia}, 2 poziomy ${oszolomienia} i z przerażeniem patrzy na swoją bezwładną nogę - ${amputacja} (bardzo trudna).`;}
        else {return `<b>Śmierć!</b>.<br/>Strzaskana miednica. Cios miażdży miednicę, odcinając jedną nogę i wrzynając się w drugą. Ból, szok i utrata krwi są tak duże, że postać pada martwa na ziemię.`;}
}

//minor miscast
function miscast(roll) {

    if (roll < 6) {return `<b>Wiedźmi znak:</b> Pierwsza istota, która urodzi się w promieniu dwóch kilometrów, będzie zmutowana`;}
        else if (roll < 11) {return `<b>Skwaśniałe mleko:</b> Wszrlkie mleko w promieniu [[d100]] metrów natychmiast kwaśnieje.`;}
        else if (roll < 16) {return `<b>Nieurodzaj:</b> Liczbę pól uprawnych równą <b>BSW</b> w promieniu <b>BSW</b> kilometrów dotyka klęska żywiołowa i w ciągu jednej nocy wszystkie plony gniją.`;}
        else if (roll < 21) {return `<b>Woskowina:</b> Uszy czarodzieja natychmiast zatykają się przez nadmiar gęstej woskowiny. Postać otrzymuje 1 poziom ${ogluszenia}, który nie może zostać usunięty, dopóki ktoś nie wyczyści uszu postaci(udany Test leczenia).`;}
        else if (roll < 26) {return `<b>Wiedźmi blask:</b> na [[d10]] Rund postać żarzy się dziwnym blaskiem, który emituje tyle światła, co ognisko. Kolor zależny jest od Tradycji zaklęcia.`;}
        else if (roll < 31) {return `<b>Straszliwe szepty:</b> Wykonaj <b>Przeciętny (+20) Test Siły Woli</b>. Jeśli się nie powiedzie, postać otrzymuje 1 Punkt Zepsucia.`;}
        else if (roll < 36) {return `<b>Krwotok:</b> Nos, oczy i uszy zaczynają obficie krwawić. Postać otrzymuje [[d10]] poziomów ${krwawienia}.`;}
        else if (roll < 41) {return `<b>Trzęsienie duszy:</b> Postać otrzymuje stan ${powalenie}.`;}
        else if (roll < 46) {return `<b>Otwarcie:</b> Wszystkie klamry i troki przy ciele rzucającego rozpinają się i rozwiązują, co powoduje, że spadająpasy, otwierają sięsakwy i torby, odpadają kawałki pancerza itd.`;}
        else if (roll < 51) {return `<b>Krnąbrne odzienie:</b> Ubrania postaci zaczynają sięskręcać, jakby nagle otrzymały wolną wolę. Postać otrzymuje 1 poziom ${pochwycenia}, którego siła równa jest [[d10 *5]].`;}
        else if (roll < 56) {return `<b>Klątwa abstynencji:</b> Wszelki alkohol w promieniu [[d100]] metrów psuje się, staje sięgorzki i paskudny w smaku.`;}
        else if (roll < 61) {return `<b>Wyssanie duszy:</b> Postać otrzymuje 1 poziom ${zmeczenia}, który utrzymuje się przez [[d10]] godzin.`;}
        else if (roll < 66) {return `<b>Rozproszenie uwagi:</b> Jeśli postać zaangażowana jest w walkę, staje się ${zaskoczona}. Jeśli nie jest to scena walki, postać ogarnia strach, serce wali jej jak młotem, nie jest w stanie skupić się na niczym przez kilka chwil.`;}
        else if (roll < 71) {return `<b>Bezbożne wizje:</b> Przez krótką chwilę postać nawiedzają bluźniercze i bezbożne wizje. Postaćotrzymuje 1 poziom ${oslepienia} i musi zdać <b>Wymagający (+0) Test Opanowania</b> albo otrzymuje kolejny poziom ${oslepienia}.`;}
        else if (roll < 76) {return `<b>Język w supeł:</b> Wszystkie Testy językowe (w tym Testy Rzucania Zaklęć) otrzymują karę -10 na [[d10]] Rund.`;}
        else if (roll < 81) {return `<b>Zgroza!:</b> Postać musi zdać <b>Trudny (-20) Test Opanowania</b> albo otrzymuje 1 poziom ${paniki}.`;}
        else if (roll < 86) {return `<b>Klątwa zepsucia:</b> Postać otrzymuje 1 Punkt Zepsucia.`;}
        else if (roll < 91) {return `<b>Przesunięcie:</b> Efekt rzuconego zaklęcia pojawia się [[2d10]] kilometrów od rzucającego. W zależności od MG, jeśli to możliwe, taka sytuacja powinna mieć odpowiednie konsekwencje.`;}
        else if (roll < 96) {return `<b>Wielopech:</b> Wykonaj dwa rzuty i zastosuj odpowiednie efekty obydwu. Przerzuć jeśli kolejny wynik będzie miescił się w przedziale 91-100.`;}
        else {return `<b>Fala Chaosu:</b> Rzuć ponownie, ale tym razem porównaj efekt z <b>Tabelą Większych Manifestacji</b>`;}
}

//major miscast
function Miscast (roll) {

    if (roll < 6) {return `<b>Upiorne głosy:</b> Każdy w promieniu tylu metrów, ile wynosi Siła Woli postaci, słyszy mroczne, nęcące podszepty, które są emanacją Dziedziny Chaosu. Wszystkie myślące stworzenia muszą zdać <b>Przeciętny (+20) Test Opanowania</b> albo otrzymają 1 Punkt Zepsucia.`;}
        else if (roll < 11) {return `<b>Przeklęty wzrok:</b> Oczy postaci nabierają nienaturalnego koloru, odpowiednio dla Tradycji zaklęcia, na [[d10]] godzin. W tym czasie postać cierpi z powodu 1 poziomu ${oslepienia}, co nie może zostać wyleczone ani rozproszone żadnym sposobem.`;}
        else if (roll < 16) {return `<b>Wstrząs Eteru:</b> Postać otrzymuje [[d10]] obrażeń, które ignorują Bonus z Wytrzymałości oraz Punkty Pancerza. Musi także zdać <b>Przeciętny (+20) Test Odporności </b>, w przeciwnym wypadku otrzyma również 1 poziom ${oszolomienia}.`;}
        else if (roll < 21) {return `<b>Spacer śmierci:</b> Wszędzie, gdzie stąpa postać, pojawia się śmierć. Przez najbliższe [[d10]] godzin wszelkie rośliny obok postaci usychają i gniją.`;}
        else if (roll < 26) {return `<b>Żołądkowa rewolucja:</b> Wnętrzności zaczynają poruszać się w niekontrolowany sposób, a postać wypróżnia się wbrew swojej woli. Otrzymuje 1 poziom ${zmeczenia}, którego nie da się usunąć inaczej niż kapielą i zmianą ubrania.`;}
        else if (roll < 31) {return `<b>Ogień duszy:</b> Postać otrzymuje 1 poziom ${podpalenia}., trawiona przez potworne płomienie w kolorze Tradycji zaklęcia.`;}
        else if (roll < 36) {return `<b>Dar języków:</b> Postać przez [[d10]] Rund trajkocze niezrozumiale. Podczas trwania tego efektu nie może porozumiewać się werbalnie ani podejmować Testów Rzucania Zaklęć, choć oprócz tego zachowuje się zupełnie normalnie.`;}
        else if (roll < 41) {return `<b>Rój:</b> Postać zostaje zatakowana przez chmurę eterycznych szczurów, gigantycznych pająków, węży lub innych podobnych stworzeń (decyduje MG). Użyj standardowych charakterystyk, odpowiednich dla danego gatunku stworzeia, dodając Cechę <i>Rój</i>. Po [[d10]] Rundach, jeśli nie zostały zniszczone wcześniej, stwory znikają.`;}
        else if (roll < 46) {return `<b>Szmaciana lalka:</b> Postać zostaje wyrzucona w powietrze i leci [[d10]] metrów w losowym kieunku. Otrzymuje [[d10]] Obrażeń ignorujących Punkty Pancerza, otrzymuje również stan ${powalenie}.`;}
        else if (roll < 51) {return `<b>Zmrożone kończyny:</b> Jedna kończyna (losowa) zostaje zamrożona na [[d10]] godzin. Przez ten czas jest zupełnie bezużyteczna, jakby została <b>Amputowana</b>(patrz strona 180).`;}
        else if (roll < 56) {return `<b>Mroczna ślepota:</b> Na [[d10]] godzin postać traci swój Talent <i>Precepcja Magiczna</i>. Wszelkie Testy Splatania Magii otrzymują karę -20.`;}
        else if (roll < 61) {return `<b>Chaotyczna dalekowzroczność:</b> Otrzymujesz premiową pulę [[d10]] Punktów Szczęścia (które mogą przekroczyć normalny limit). Za każdym razem gdy postać korzysta z tych punktów, otrzymuje 1 Punkt Zepsucia. Wszystkie zdobyte w ten sposób Punkty Szczęścia przepadają po zakończeniu sesji gry.`;}
        else if (roll < 66) {return `<b>Lewitacja:</b> Wiatry Magii porywająpostać w powietrze. Na [[d10]] minut unosi [[d10]] metrów nad ziemią. Inne postaci mogą ją przemieszczać siłą. Ponadto postać może poruszać się sama dzięki zaklęciom. skrzydłom i innym zabiegom. Jeśli zostanie pozostawiona sama sobie, uniesie się z powrotem jak balonik. Lewitacja kończy się upadkiem (patrz strona 166).`;}
        else if (roll < 71) {return `<b>Wymioty:</b> Postać wymiotuje, wyrzucając z siebie o wiele więcej odrażająco śmierdzących wymiocin, niż mogłoby pomieścić ciało. Postać otrzymuje 1 poziom ${oszolomienia} który utrzymuje się [[d10]] Rund.`;}
        else if (roll < 76) {return `<b>Trzęsienie Chaosu:</b> Wszystkie stworzenia w promieniu [[d100]] metrów muszą zdać <b>Przeciętny (+20) Test Atletyki</b> albo otrzymają stan ${powalenie}.`;}
        else if (roll < 81) {return `<b>Zdrada w sercu:</b> Mroczni Bogowie nakłaniają postado wybitnie perfidnego czynu. Jeśli postać zaatakuje bądź w inny sposób zdradzi sojusznika (z całą mocą i bez ograniczeń), odzyskuje wszystkie Punkty Szczęścia. Jeśli zmusi inną postać do wydania Punktu Przeznaczenia, sama uzyskuje 1 Punkt Przeznaczenia.`;}
        else if (roll < 86) {return `<b>Plugawa niemoc:</b> Postać otrzymuje 1 Punkt Zepsucia, 1 poziom ${zmeczenia} i ${powalenie}.`;}
        else if (roll < 91) {return `<b>Odór z piekła rodem:</b> To jest dopiero smród! Postać otrzymuje cechę stworzenia <i>Dekoncentrujący</i> (patrz strona 338), a najpewniej też wrogość czegokolwiek, co ma zmysł powonienia. Efekt utrzymuje się [[d10]] godzin.`;}
        else if (roll < 96) {return `<b>Wyssanie mocy:</b> Przez [[d10]] minut postać nie jest w stanie używać Talentów związanych z rzucaniem czarów (zazwyczaj Magii Tajemnej, choć może ro byćrównież Magia chaosu lub podobny talent).`;}
        else {return `<b>Reakcja Eteru:</b> każdy - wróg czy przyjaciel - w promieniu tylu metrów, ile wynosi Bonus Siły Woli postaci, otrzymuje [[d10]] Obrażeń, które ignoruję Bonus z Wytrzymałości i Punkty Pancerza. Wszyscy w tym promieniu otrzymują stan ${powalenie}. Jeśli na tym obszarze nie ma żadnych celów, magia nie ma się gdzie ulotnić, więc wzbiera wewnątrz czaszki, rozsadzając ją od środka. Postać ginie natychmiast.`;}
}

//oops! table
function oops(roll) {

    if (roll < 21) {return "Podczas swojego ataku postać uderza w jakąś część własnego ciała (może z tego wyniknąć mnóstwo śmiechu!) - otrzymuje jedną ranę, ignorując <b>BWt</b> i pancerz";}
        else if (roll < 41) {return "Słychać straszny zgrzyt. Broń szerbi się, nadłamuje albo zacina i otrzymuje <b>1 Punkt Uszkodzeń</b>. W następnej Rundzie, niezależnie od Inicjatywy, Talentów i innych specjalnych zasad, postać wykonuje swoją turę ostatnia, ponieważ musi dojść do siebie (patrz strona 156).";}
        else if (roll < 61) {return "Postać źle skalkulowała manewr, przez co mocno się odsłania. W przypadku broni dystansowej - o mały włos, a wypadłaby z rąk. W następnej Rundzie każda <b>Akcja</b> postaci otrzymuje karę -10.";}
        else if (roll < 71) {return "Postać potyka się, ledwie utrzymując równowagę. W następnej Rundzie nie wykonuje <b>Ruchu</b>.";}
        else if (roll < 81) {return "Postać nieostrożnie obchodzi się z bronią, przez co ta mało jej nie wypada lub amunicja dosłownie leci jej z rąk. W następnej rundzie nie może wykonać <b>Akcji</b>.";}
        else if (roll < 91) {return `Postać potyka się, robi zbyt długi wypad lub krok i skręca kostkę. Otrzymuje Uraz ${zerwanie} (pomniejsze). Liczy się jako <b>Rana Krytyczna</b>.`;}
        else {return `Atak jest kompletną porażką, postać trafia w jednego losowego sojusznika w zasięgu. Użyj kości jedności by określić <b>PS</b> ciosu. Jeśli to niewykonalne postać w jakiś sposób zadaje sobie cios w głowę, co skutkuje stanem ${oszolomienia}`;}

}


on("chat:message", function(chatMsg) {

    if (chatMsg.type === "api") {
        
        roll = parseInt(chatMsg.content.split(/\s+/u)[1]) || rolld100();
		let less = 0;
		chatMsg.content.split(/\s+/u)[1] == "less" ? less = 20 : less = 0;  
		
        if (chatMsg.content.startsWith("!critloc")) {sendChat(chatMsg.who, roll + ", " + critLocation(roll, less));}
		else if (chatMsg.content.startsWith("!miscast") || chatMsg.content.startsWith("!manifest")) {sendChat(chatMsg.who, roll + ", " + miscast(roll));}
		else if (chatMsg.content.startsWith("!Miscast") || chatMsg.content.startsWith("!Manifest")) {sendChat(chatMsg.who, roll + ", " + Miscast(roll));}
		else if (chatMsg.content.startsWith("!ozez") || chatMsg.content.startsWith("!oops")) {sendChat(chatMsg.who, roll + ", " + oops(roll));}
		else if (chatMsg.content.startsWith("!crithelp")) {getHelp(chatMsg);}
		else if (chatMsg.content.startsWith("!stany") || chatMsg.content.startsWith("!cond")) {sendChat(chatMsg.who, conditions);}
            else 
            {
                roll = Math.max(roll-less,1);
                if (chatMsg.content.startsWith("!crithead")) {sendChat(chatMsg.who, roll + ", " + critHead(roll));}
                else if (chatMsg.content.startsWith("!critarm")) {sendChat(chatMsg.who, roll + ", " + critArm(roll));}
                else if (chatMsg.content.startsWith("!critbody")) {sendChat(chatMsg.who, roll + ", " + critBody(roll));}
                else if (chatMsg.content.startsWith("!critleg")) {sendChat(chatMsg.who, roll + ", " + critLeg(roll));}
            }
    }
});
