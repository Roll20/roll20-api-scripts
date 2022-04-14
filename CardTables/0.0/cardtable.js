// cardtable.js - version 1.0

function parseTable(keys,values){ //This function takes an array of keys and an array of values and returns an array of objects, each object representing one row of the table
  table=[]
  for (row of values) {
    object={}
    array=row.split("\t")
    object.roll=array[0].replace(/\./g,"").trim()
    for ([idx,key] of keys.entries()){
      object[key]=array[idx+1].replace(/^([0-9]+\.)/gm,"").trim()
      object[key]=object[key][0].toUpperCase()+object[key].slice(1)
    }
    table.push(object)
  }
  return table
}

function copyRows(table){ //This function checks if any row of the table has a range of rolls and then copies the row to make a separate entry for each roll value
  for (row of table){
    if (row.roll.includes("-")){
      min=parseInt(row.roll.split("-")[0])
      max=parseInt(row.roll.split("-")[1])
      table=table.filter((el) => el!=row)
      for (i=min;i<=max;i++){
        row.roll=String(i)
        newrow=JSON.parse(JSON.stringify(row))
        table.push(newrow)
      }
    }
  }
  table.sort((a,b) => parseInt(a.roll) - parseInt(b.roll));
  return table
}

function makeMacro(namestr,table,dicestr,color,end=1,mlen=0){ // This function takes all the information from the table entered into the chat and converts into a scriptcard to be then put into a macro
  if (mlen==0){
    macro=["!scriptcard{{","--#title|"+namestr,"--#titlecardgradient|1","--#titlecardbottomborder|1px solid black","--#titleCardBackground|"+color]
  }
  else{
    macro=[]
  }
  macro.push("--=var"+mlen+"|"+dicestr)
  for (i of table) {
    compstr=i.roll
    macro.push("--? [$var"+mlen+"] -eq "+compstr+"|[")
    for (j in i){
      if (j!="roll") {
        macro.push("--+"+j+"|"+i[j])
      }
    }
    macro.push("--]|")
  }
  if (end==1){
    macro.push("}}")
  }
  return macro
}


on("chat:message", function(msg) {
  if(msg.type == "api" && msg.content.indexOf("!cardtable{{") !== -1) {
    gmid=msg.playerid
    var colors=["#cb99c9","#fdfd96","#ff6961","#ff694f","#ff9899","#ffb7ce","#ca9bf7","#87cded","#0165fc","#41fdfe","#1974d2","#24a0ed","#1ac1dd","#c4fff7","#7df9ff","#3f00ff","#00fdff","#1166ff","#15f2fd","#04d9ff","#0203e2","#0044ff","#00bffe","#010fcc","#d0ff14","#8cff9e","#cfff00","#66ff00","#87fd05","#9dff00","#c1f80a","#21fc0d","#08ff08","#00ff00","#aeff6e","#53fe5c","#56fca2","#4efd54","#aaff32","#7af9ab","#a0d404","#00fa9a","#45cea2","#39ff14","#77dd77","#19a700","#68e52f","#7ded17","#00f900","#00ff7c","#06c2ac","#0add08","#2fef10","#fea051","#fe6700","#ff7034","#ffc82a","#ff7124","#eb5030","#ed872d","#fd6f3b","#ffa600","#ee8800","#ff7f50","#ffa812","#fc642d","#ff3503","#ffcf00","#eb6123","#ff8d28","#ffa62b","#f08300","#ffa368","#ff9889","#ff9933","#ff5721","#ffa500","#ff7f00","#ffa000","#ff6f52","#fa5b3d","#fc845d","#ff7518","#fc9e21","#ff6600","#ff9300","#ff7420","#ff5f00","#fe01b1","#ff85ff","#ff7fa7","#d90166","#f4bfff","#ff0490","#fe1493","#fd3f92","#ee6d8a","#ff00cc","#ff028d","#ffb3de","#ff00ff","#ff2feb","#fe4164","#fe019a","#ff66ff","#ff1476","#f62681","#d648d7","#df4ec8","#e25098","#f6688e","#ca2c92","#fe02a2","#ff1cae","#ff6ffc","#ff878d","#f06fff","#fb5ffc","#be03fd","#ad0afd","#6600ff","#bf00ff","#8f00f1","#cb00f5","#b56edc","#bc13fe","#e0b0ff","#65318e","#b80ce3","#9f00ff","#ff000d","#e30022","#f7022a","#f2013f","#ff4040","#e60000","#d01c1f","#fe0002","#ff5555","#eb5406","#fd5956","#f1172f","#cf1020","#bc2731","#fc2847","#ff073a","#ff1b2d","#fe4401","#f43605","#f10c45","#d22d1d","#b0054b","#dd1133","#b00149","#e30b5d","#ff0000","#ee204d","#ff3f34","#fa2a55","#e40078","#fe2713","#f8481c","#fe2c54","#ca0147","#ff2400","#bb1237","#d73c26","#ff1111","#ec2d01","#b21807","#fd0d35","#bf1932","#c6174e","#ef3939","#cc0033","#ff006c","#f70d1a","#e56024","#eddd59","#fffc79","#fffd01","#ffff81","#fff600","#fcfc5d","#fcd116","#ffff31","#fedf08","#ffff33","#fffc00","#ffd700","#fff700","#f1ff62","#f0e681","#cfff04","#d1e231","#ffc324","#fada50","#eed202","#f4c430","#ffd800","#f7b718","#e8ff2a","#ffdc41","#dfff4f","#ffe302","#f7c114","#ffff00","#ffef00","#ffff11","#ffcc3a","#fcfd74","#fff000","#ffff14"]
    color=colors[Math.floor(Math.random() * colors.length)];

    var str=String(msg.content)
    str=str.replace(/(\r\n|\n|\r)/gm, "");
    str=str.split("<br/>").slice(1,-1)
    macroName=str[0]
    namestr=macroName.split("-").slice(1).map(w => w[0].toUpperCase() + w.substring(1).toLowerCase()).join(' ')
    if (macroName.split('-')[0]=="s"){ // this checks if input is a single or multi table entry

      values=str.slice(2)
      if (str[1].split("\t").length==1 && str[2].split("\t").length>1){ // This and the next few conditions check and correct for data formatting issues like not separating the rolls and values by tabs, having extra characters in the rolls column, etc.
          roller="d"+String(values.length) // This particular condition is to check if the header is not formatted correctly but the values are formatted correctly
          str[1]=roller+"\t"+str[1]
      }
      else if (str[1].split("\t").length==1 && str[2].split("\t").length==1){ // If the header and values are both formatted incorrectly
          flag=0
          for (v=0;v<values.length;v++) {
              if(/^((\[|\()* *[0-9]+ *- *[0-9]+ *(\]|\))*)|^[0-9]+/g.test(values[v])==false){
                  flag=1
                  break;
              }
          }
          if (flag==0) { // If each row value starts with a number or a range of numbers then interpret that as the roll values and separate them into a different column
              max=values.length
              for (v=0;v<values.length;v++) {
                r=values[v].match(/^((\[|\()* *[0-9]+ *- *[0-9]+ *(\]|\))*)|^[0-9]+/g)[0].replace(/(\[|\])|(\(|\))/g,"")
                mm=r.match(/[0-9]+/g).map(w => parseInt(w)).sort().reverse()[0]
                max=(mm>max)?mm:max
                val=r+"\t"+values[v].split(r)[1].replace(/^\./g,"")
                values[v]=val
             }
             roller="d"+String(max) //Correct the dice type string
          }
          else if(flag==1){ //If roll values are not present at all, assume one unique value for each row and decide a die accordingly
            for (v=0;v<values.length;v++) {
              values[v]=String(v+1)+"\t"+values[v]
            }

            roller="d"+String(values.length)
          }
          str[1]=roller+"\t"+str[1]
      }

      roller=str[1].split("\t")[0] //dice
      keys=str[1].split("\t").slice(1) //column names
      table=parseTable(keys,values)
      table=copyRows(table)
      dicestr=roller.split("+").map(w => "1"+w).join("+") //create a rollable dice string for scriptcards
      macro=makeMacro(namestr,table,dicestr,color)
    }
    else { // if the input contains multiple tables
      splitter=str.map((e,i) => e.includes("-----")?i:'').filter(String)
      tables=[]
      k=0
      for (i of splitter) { // create an array of tables
        tables.push(str.slice(k,i))
        k=i
      }
      tables.push(str.slice(k))
      macro=[]
      k=0
      for (i of tables){ //For each table, basically do everything that was done for the single table

        values=i.slice(2)
        if (i[1].split("\t").length==1 && i[2].split("\t").length>1){
          roller="d"+String(values.length)
          i[1]=roller+"\t"+i[1]
        }
        else if (i[1].split("\t").length==1 && i[2].split("\t").length==1){
            flag=0
            for (v=0;v<values.length;v++) {
                if(/^((\[|\()* *[0-9]+ *- *[0-9]+ *(\]|\))*)|^[0-9]+/g.test(values[v])==false){
                    flag=1
                    break;
                }
            }
            if (flag==0) {
                max=values.length
                for (v=0;v<values.length;v++) {
                  r=values[v].match(/^((\[|\()* *[0-9]+ *- *[0-9]+ *(\]|\))*)|^[0-9]+/g)[0].replace(/(\[|\])|(\(|\))/g,"")
                  mm=r.match(/[0-9]+/g).map(w => parseInt(w)).sort().reverse()[0]
                  max=(mm>max)?mm:max
                  val=r+"\t"+values[v].split(r)[1].replace(/^\./g,"")
                  values[v]=val
               }
               roller="d"+String(max)
            }
            else if(flag==1){
              for (v=0;v<values.length;v++) {
                values[v]=String(v+1)+"\t"+values[v]
              }

              roller="d"+String(values.length)
            }
            i[1]=roller+"\t"+i[1]
        }
        roller=i[1].split("\t")[0]  // Change this to \t in final stage
        keys=i[1].split("\t").slice(1) // Change this to \t in final stage

        table=parseTable(keys,values)
        table=copyRows(table)
        dicestr=roller.split("+").map(w => "1"+w).join("+")
        macro=macro.concat(makeMacro(namestr,table,dicestr,color,0,k))
        k+=1
      }
      macro.push("}}")
    }

    macro=macro.join("\n") // create macro
    createObj("macro",{
        name: macroName,
        action:macro,
        visibleto:"all",
        playerid: gmid,
        istokenaction: false
    });

  }
  //Help display
  else if (msg.type == "api" && ((msg.content.indexOf("!cardtable -h") !== -1 || msg.content.indexOf("!cardtable -h") !== -1) || (msg.content.indexOf("!cardtable -help") !== -1 || msg.content.indexOf("!cardtable -help")))) {
    sendChat("Cardtable help","<br><br><b>-h/-help</b>&emsp;Display this help and exit<br><br>Input data format example- <br><br><pre style='font-size: 0.8em'>!cardtable{{<br>x-table-name<br>dicetype\tkey1\tkey2\t.....<br>roll\tvalue1\tvalue2\t.....<br>.<br>.<br>.<br>-----<br>dicetype\tkey1\tkey2\t.....<br>.<br>.<br>.<br><br>}}<br><br></pre>The x in the table name needs to be replaced by s or m. s if rolling on one table is enough to generate the whole card. m if rolling on multiple tables is required (eg - weather). If using multiple tables, separate each table by a line containing \"-----\" as shown in the example format. All columns should be separated by a tab. Output is a macro with the name \"x-table-name\" and running the macro will output scriptcards")
  }
})
// Visit the <a href=\"\" style='color: blue; font-weight: bold; cursor: pointer'>wiki</a> for a more detailed guide.
