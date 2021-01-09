// Roll Handout tables
// Version 2.0

on('ready', () => {
  let activeHandoutID = [];
  let linkToggle = true;
    const ToggleLinks = (input) => {
      if (!(/on|off/.test(input))){return;}
      if (input == 'off') {
        linkToggle = false;
        sendChat('Roll Handout Tables','/w gm Writing links to handouts has been turned OFF');
      } else {
        linkToggle = true;
        sendChat('Roll Handout Tables','/w gm Writing links to handouts has been turned ON');
      }
    };
  const processSingleHandout = (handout) => {
    /*
      Format/HTML Regex
    */
    const leftBracket = '[[';
    const rightBracket = ']]';
    const re_Lower = /^(\d+?) or lower$/i;
    const re_Higher = /^(\d+?) or higher$/i;
    const re_artifact = /Artifacts_Property(_error)*/i;
    const re_bold = /<(strong|b)>.+?<(\/\1)>/gsmi;
    const re_boldHeader = /<(strong|b)>.+?<(\/\1)>.+?<roll>/gsmi;
    const re_findRoll = /<roll.+?<\/roll/gmis;
    const re_dash = /[-–]/;
    const re_Header = /<(h\d)>.+?<\/\1>/gs;
    const re_para = /<p>.+?<\/p>/gsmi;
    const re_range = /^(\d+?|\d+?[-–]\d+?)$/;
    const re_sectByRollable = /.+?<\/roll>/gms;
    const re_spaceReplace = /&nbsp;/gs;
    const re_tableRow = /<(thead|tr)>.+?<\/(thead|tr)>/gmis;
    const re_tableCell = /<t(h|d)>.+?<\/t(h|d)>/gmis;
    const re_taggingTables = /<table>(((?!<table>).)*(>\d*d\d+?(\/d\d+?|\s*\+\s*\w+?)*)<.+?)<\/table>/gmis;
    const strip = /<[^>]*>/g;
    /*
      Dice related Regex
    */
    const re_anyDice = /\d*d\d+?/i;
    const re_diceRoll = /(\d+d\d+((\+|\s*[x×]\s*)\d+)?)/gmi;// (e.g. 1d6,1d6+10,1d4 x 10)
    const re_DR_Add = /(\dd\d\+\d+d\d+)/i;
    const re_DR_TwoDice = /(d\d+\/d\d+)/i;
    const re_DR_OneDice = /(d\d+)/i;
    const re_DR_MultDice = /(\d+d\d+)/i;
    const re_drLeadingCalc = /\d+?\s\((\d+d\d+(\+\d+)?)\)/gmi;// (e.g. '3 (1d6)')
    const re_drTrailingCalc = /(\d+d\d+(\+\d+)?)\s\(\d+?\)/gmi;// (e.g. '1d6 (3)')
    const re_multipy = /(\[\[\d+?d\d+?)\s*[x×]\s*(\d+?\]\])/gi;
    const d_3d8_Weight = [
      0,0,1,3,6,10,15,21,27,35,41,45,47,47,45,41,35,27,21,15,10,6,3,1
    ];
    const d_2d6_Weight = [
      0,1,2,3,4,5,6,5,4,3,2,1
    ];
    const d_3d6_Weight = [
      0,0,1,3,6,10,15,21,25,27,27,25,21,15,10,6,3,1
    ];
    const d_3d4_Weight = [
      0,0,1,3,6,10,12,12,10,6,3,1
    ];
    const diceIndexArr = ['3d4','2d6','3d6','3d8'];
    const diceWeightArr = [d_3d4_Weight, d_2d6_Weight, d_3d6_Weight, d_3d8_Weight];
    const Sum = (total, num) => {
      return total + num;
    };
    const GetMultiWeight = (arr, rng) => {
      let multiWeight;
      if (rng[0]){
        if (rng[1]){
          multiWeight = arr.slice(rng[0]-1,rng[1]-1);
        } else {
          multiWeight = arr.slice(rng[0]-1, rng[0]);
        }
      } else {
        if (rng[1]){
          multiWeight = arr.slice(rng[1]-1, rng[1]);
        }
      }
      return multiWeight.reduce(Sum);
    };

    /*
      Function declarataions (Roll20)
    */
    const SetNotes = (txt) => {
      activeHandoutID.push(handout.id); //cache id to stop endless loop
      handout.set('notes', txt);
    };
    const CreateItem = (weight, input, tableID) => {
      createObj('tableitem', {
        name: input,
        rollabletableid: tableID,
        weight: weight
      });
    };
    const BuildTableLink = (name) => {
      let whisperLink = `<br><a href="\`!rt /w gm [[ 1t[${name}] ]]">Whisper Roll Recursive</a></br>`;
      let loudLink = `<br><a href="\`!rt [[ 1t[${name}] ]]">Roll Recursive</a></br>`;
      return whisperLink + loudLink;
    };
    const PlaceTableLink = (txt) => {
      let cnt = txt.match(/<!>/gmi);
      if (cnt){cnt = cnt.length;}
      for (let i = 0, j = cnt; i < j; i++) {
        if (txt.includes(`[${handoutTblNames[i]}]`)){
          txt = txt.replace(/<!>/,'');
          continue;
        }
        let name = handoutTblNames[i];
        let links;
        if (name != '<@>' && name !== undefined) {
          links = BuildTableLink(name);
        } else {
          links = '';
        }
        if (!txt.includes(name)) {
          txt = txt.replace(/<!>/, links);
        }
      }
      return txt;
    };
    const SendError = (msg, from) => {
      if (from === undefined){from = "RollHandoutTables";}
      // sendChat(from, msg, null, {
        // 	noarchive: true
        // });
      };
    const WriteRollableTable = () => {
      if(!tbls.length){
        return;
      }
      let l = 0;
      tbls.forEach(ele => {
        if (tblNames.includes(ele.Name)) {
          let msg = `Duplicate table found for ${ele.Name}, skipping creation`;
          SendError(msg);
          return;
        }
        let name = ele.Name;
        let newTable;
        if (name && name != '<@>') {
          newTable = createObj('rollabletable', {
            name: name
          });
          let tableID = newTable.id;
          if (ele.Items != undefined) {
            let j = ele.Items.length;
            for (let i = 0; i < j; i++) {
              let weight = ele.Items[i][0];
              let item = ele.Items[i][1];
              CreateItem(weight, item, tableID);
            }
          } else {
            log('error processing table - no ranges found for table in: ' + rawHandoutName);
          }
        }
        l++;
      });
    };
    const GetTableNames = () =>  {
      let tableNames = [];
      let tables = findObjs({type: 'rollabletable'});
      _.each(tables, function(obj) {
        tableNames.push(obj.get("name"));
      });
      return tableNames;
    };
    /*
      Independent Function Declarations
    */

    /*
      Variable declaration
    */
    const rawHandoutName = handout.get('name');
    let tempName = rawHandoutName.replace(/\s/g,'_')
      .replace(/[\:\(\)\,]/g,'')
      .replace(/_Tables/i,'');
    switch (true) {
        case tempName == 'Stocking_a_Dungeon':
            tempName = 'Dungeon';
            break;
        // case /Customization/.test(tempName):
        //     tempName = '';
        //     break;
        case tempName == 'Mapping_a_Wilderness':
            tempName = 'Wilderness';
            break;
        case tempName == 'Random_Settlements':
            tempName = 'Settlement';
            break;
        case tempName == 'Random_Ships':
            tempName = 'Ship';
            break;
        default:
        tempName = tempName;
    }
    let handoutName = tempName;
    let newTableName = '';
    let backupName = '';
    let tbls = [];
    let handoutTblNames = [];
    let tblNames = GetTableNames();
    handout.get('notes', (notes) => {
      const CallHandler = new Promise((resolve, reject) => {
        const HandleNotes = () => {
          function TableConstructor(tableName, tableItems) {
            this.Name = tableName;
            this.Items = tableItems;
          }
          const BuildTableItems = (element) => {
            let objTable = [];
            let rows = element.match(re_tableRow);
            for (let i = 0, j = rows.length; i < j; i++) {
              let row = [];
              let cells = rows[i].match(re_tableCell);
              for (let a = 0, b = cells.length; a < b; a++) {
                let cell = cells[a].replace(strip, '').trim();
                row.push(cell);
              }
              objTable.push(row);
            }
            return objTable;
          };
          const ConstructTableObject = (name, items) => {
            if (items == undefined){
              name = '<@>';
              items = 'error';
          }
            let newTbl = new TableConstructor(name, items);
            tbls.push(newTbl);
            handoutTblNames.push(newTbl.Name);
            return tbls;
          };
          const FinalNameCleaner = (str) => {
            str = str.replace(/^\d\._/,'')
            .replace(/_Complications|_and_Appointments/,'')
            .replace(/_Customization/,'')
            .replace(/Sentient_Magic_Items/,'Sentient_Item')
            .replace(/Personal_Decisions*/,'Motivation')
            .replace(/Adventurer_Story/,'Story')
            .replace(/Downtime_Activities/, 'Downtime')
            .replace(/Treasure_Challenge/,'Treasure')
            .replace(/Hoard_Challenge/, 'Hoard')
            .replace(/Attitude_and_Race/,'Ship_Attitude')
            .replace(/Encounters*/, 'Enctr')
            .replace(/Dungeons*/gi,'Dungeon')
            .replace(/Levels*/, 'Lvl')
            .replace(/^(Purpose_)/,handoutName + '_$1')
            .replace(/Purpose_of_Raid/i,handoutName + '_Raid_Purpose')
            .replace(/Clan's_Notable_Trait/,handoutName + '_Notable_Trait')
            .replace(/Random/i,'Rndm')
            .replace(/_Tables/i,'')
            .replace(/Artifacts_Property/i,'Artifact_Minor_Beneficial')
            .replace(/_Propert(y|ies)/i, '')
            // .replace(/Minor_Beneficial_Properties_error/i,'Major_Beneficial_Property')
            // .replace(/Artifacts_death_slaad/i,'Major_Detrimental_Property')
            .replace(/(Creator)_or_Intended_User/i,'$1')
            .replace(/^(\w+?)_(\1)/i,'$2');
            return str;
          };
          const GetWeight = (data) => {
            let itemWeight;
            if (re_range.test(data)) {
              let range = data.split(re_dash);
              if (range[1] !== undefined) {
                if (range[1] == '00') {
                  range[1] = 100;
                }
                itemWeight = parseInt(range[1], 10) - parseInt(range[0], 10) + 1;
              } else {
                itemWeight = 1;
              }
              let args = [itemWeight, parseInt(range[0]), parseInt(range[1])];
              return args;
            } else {
              if (re_Lower.test(data)){
                let upper = parseInt(data.match(/\d+?/)[0]);
                itemWeight = (upper - 1);
                let args = [itemWeight, 1, upper];
              }
              if(re_Higher.test(data)){
                let lower = parseInt(data.match(/\d+?/)[0]);
                itemWeight = (100 - lower);
                let args = [itemWeight, lower, 100];
              }
            }
          };
          const GetTables = (element) => {
            let htmlTable = element.match(re_findRoll)[0];
            return htmlTable;
          };
          const HandleOneDie = (dieToRoll, obj) => {
            let tableItems = [];
            for (let i = 0, j = obj.length; i < j; i++) {
              let objRow = obj[i];
              if (re_anyDice.test(objRow[0])) {
                if (objRow[0] != '') {
                  backupName = SetBackupName(objRow);
                } else {
                  backupName = SetBackupName(obj[i+1]);
                }
                continue;
              }
              let itemWeight;
              let max;
              let rangeArgs;
              rangeArgs = GetWeight(objRow[0]);
              if (rangeArgs) {
                itemWeight = rangeArgs[0];
                // Double Dice Handling
                max = parseInt(dieToRoll[0].replace('d',''));
                if (dieToRoll.length == 2 && rangeArgs[2] == max) {
                  HandleTwoDice(dieToRoll, obj, max);
                }
              }
              // Write item description from html row
              if (i > 0) {
                PushItem(objRow, tableItems, itemWeight);
              }
            }
            tableItems = tableItems.filter(ele => {
              if (ele[0] !==undefined && ele[1] !== undefined) {
                return true;
              }
            });
            return tableItems;
          };
          const HandleMultiDice = (dieToRoll, obj) => {
            let tableItems = [];
            let index = diceIndexArr.indexOf(dieToRoll);
            let diceWeight = diceWeightArr[index];
            for (let i = 0, j = obj.length; i < j; i++) {
              let objRow = obj[i];
              if (re_anyDice.test(objRow[0])) {
                continue;
              }
              let itemWeight;
              let rangeArgs;
              rangeArgs = GetWeight(objRow[0]);
              if (rangeArgs) {
                itemWeight = GetMultiWeight(diceWeight, [rangeArgs[1], rangeArgs[2]]);
                // Double Dice Handling
              } else {
                itemWeight = 1;
              }
              // Write item description from html row
              if (i > 0) {
                PushItem(objRow, tableItems, itemWeight);
              } else {
                if (objRow[0] != '') {
                  backupName = SetBackupName(objRow);
                } else {
                  backupName = SetBackupName(obj[i+1]);
                }
              }
            }
            tableItems = tableItems.filter(ele => {
              if (ele[0] !==undefined && ele[1] !== undefined) {
                return true;
              }
            });
            return tableItems;
          };
          const HandleTwoDice = (dieToRoll, obj, max) => {
            let altName;
            let altTableItems = [];
            for (let x = 0, j = obj.length; x < j; x++) {
              let altRng = GetWeight(obj[x][0]);
              if(altRng){
                if (altRng[2] <= max) {
                  PushItem(obj[x], altTableItems, altRng[0]);
                  if (backupName){
                    altName = `${handoutName}_${backupName}_${dieToRoll[0]}`;
                  } else {
                    altName = `${handoutName}_${dieToRoll[0]}`;
                  }
                }
              }
            }
            ConstructTableObject(altName, altTableItems);
          };
          const HeaderCheck = (element, index) => {
            if (Check(element, index) == false) return headerOverride = true;
          }
          const Check = (element, index) => {
            if(!element.match(re_Header)){
              return false;
            }
          };
          const ParseSections = (element, index, array) => {
            let tableItems = [];
            let htmlTable = GetTables(element); // returns a rollable html Table
            let objTable = BuildTableItems(htmlTable); // returns table as an obj
            tableItems = ParseTable(objTable);
            TableNaming(element);
            let name = newTableName;
            ConstructTableObject(name, tableItems);
          };
          const ParseTable = (obj) => {
            // Check for mulitple ranges and rearrange items
            obj = RangeChecker(obj);
            for (let i = 0, j = 2; i < j; i++) {
              let tblItems = SwitchDiceCheck(obj, i);
              if (tblItems!=false){return tblItems;} else{continue;}
            }
            // For each row in html object
          };
          const PushItem = (row, arr, weight) => {
            let itemDesc = row.slice(1).join('; ');
            itemDesc = itemDesc.replace(re_drTrailingCalc, `$1`);
            itemDesc = itemDesc.replace(re_drLeadingCalc, `$1`);
            itemDesc = itemDesc.replace(re_diceRoll, `${leftBracket}$1${rightBracket}`);
            itemDesc = itemDesc.replace(re_multipy, `$1*$2`);
            arr.push([weight,itemDesc]);
          };
          const RangeChecker = (obj) => {
            /*
              Fails if there are multiple ranges and all columns contain numbers
              No reports yet of a table that meets that criteria
            */
            let columnPoints = [];
            let newObj = obj;
            for (let x = 0, y = obj[1].length; x < y; x++) {
              if (re_range.test(obj[1][x]) && !re_range.test(obj[1][x-1])) {
                columnPoints.push(x);
              } else {
                if (obj[10]){
                  if (re_range.test(obj[10][x]) && !re_range.test(obj[10][x-1])) {
                    columnPoints.push(x);
                  }
                }
              }
            }
            if (columnPoints.length > 1) {
              newObj = [];
              for (let i = 0, j = obj.length; i < j; i++) {
                for (let a = 0, b = columnPoints.length; a < b; a++) {
                  let replace = obj[i].slice(columnPoints[a], columnPoints[a+1]);
                  newObj.push(replace);
                }
              }
            }
            obj = newObj;
            return obj;
          };
          const SetBackupName = (row) => {
            let headerFromRow = row[1];
            if (headerFromRow) {
              backupName = headerFromRow.trim();
            } else {
              backupName = "Error finding table name";
            }
            return backupName;
          };
          const SwitchDiceCheck = (obj, i) => {
            let ele = obj[i][0];
            let tblDie;
            switch (true) {
              case re_DR_MultDice.test(ele):
              return HandleMultiDice(ele, obj);
              case re_DR_TwoDice.test(ele):
              tblDie = ele.match(re_DR_TwoDice)[0].split('/');
              tblDie = tblDie[0];
              let tblDieB = tblDie[1];
              return HandleOneDie([tblDie, tblDieB], obj);
              case re_DR_Add.test(ele):
              tblDie = ele.match(re_DR_Add).split('+');
              return HandleOneDie([tblDie], obj);
              case re_DR_OneDice.test(ele):
              tblDie = ele.match(re_DR_OneDice)[0];
              return HandleOneDie([tblDie], obj);
              default:
              return false;
            }
          };
          const TableNaming = (element) => {
            let hdrs = element.match(re_Header);
            let boldHdr;
            if (re_boldHeader.test(element)){
              boldHdr = element.match(re_boldHeader)[0];
              boldHdr = boldHdr.match(re_bold);
              boldHdr = boldHdr[boldHdr.length-1];
            }
            let bool_handoutUsed = false;
            if ((/Names/i).test(handoutName)){handoutName ='';}
            if (backupName == ''){backupName = 'error';}
            if (!headerOverride) {
              if (hdrs) {
                let lastHdr = hdrs[hdrs.length-1].replace(strip,'');
                if (lastHdr) {
                  if(!handoutTblNames.includes(lastHdr)){
                    lastHdr = TxtCleaner(lastHdr);
                    newTableName = lastHdr;
                  }
                }
              }
            } else {
              let lastResort = element.match(re_para);
              if (boldHdr !== undefined) {

                let altHdr = TxtCleaner(boldHdr.replace(strip,''));
                newTableName = altHdr;
              } else {
                backupName = TxtCleaner(backupName);
                newTableName = `${handoutName}_${backupName}`;
                bool_handoutUsed = true;
              }
              if(lastResort) {
                lastResort = lastResort[lastResort.length-1].replace(strip,'');
                log('last resort set as: '+ lastResort);
                if (re_artifact.test(newTableName) && lastResort.length) {
                  newTableName = `${handoutName}_${TxtCleaner(lastResort)}`
                }
              }
            }
            if (handoutTblNames.includes(newTableName)) {
              newTableName = `${newTableName}_error`;
            }
            if (!newTableName.length || handoutTblNames.includes(newTableName) || newTableName.split('_').length > 4) {
              backupName = TxtCleaner(backupName);
              newTableName = `${handoutName}_${backupName}`;
              bool_handoutUsed = true;
              log('Table naming may need to be addressed: ' + newTableName);
            }
            if (newTableName.split('_').length < 3 && !bool_handoutUsed) {
              newTableName = `${handoutName}_${newTableName}`;
            }
            newTableName = TxtCleaner(newTableName);
            newTableName = FinalNameCleaner(newTableName);
            return newTableName;
          };
          const TxtCleaner = (str) => {
            str = str.trim();
            str = str.replace(/\s/gmi, '_');
            str = str.replace(/[\:\(\)\,]/gmi,'');
            str = str.replace(/\u{2013}/gu,'-');
            str = str.replace(/[^\x00-\x7F]/gmi,'');
            str = str.replace(/^_|_$/,'');
            return str;
          };
          notes = notes.replace(re_spaceReplace,'');
          let tempNotes = notes;
          var headerOverride = false;
          if(notes.includes(`<table>`)) {
            tempNotes = tempNotes.replace(re_taggingTables, '<!><roll>$1</roll>');
            let allHdrs = tempNotes.match(re_Header);
            let sections = tempNotes.match(re_sectByRollable);
            if (sections) {
              sections.forEach(HeaderCheck);
              sections.forEach(ParseSections);
            }
            WriteRollableTable();
            tempNotes = tempNotes.replace(/<roll>/gmi,`<table>`).replace(/<\/roll>/gmi, `</table>`);
            tempNotes = PlaceTableLink(tempNotes);
            resolve(tempNotes);
          } else {
            reject('error');
          }
        };
        setTimeout(HandleNotes, 0);
      });
      if(notes && linkToggle){
        CallHandler.then(
          (txt) => {SetNotes(txt);},
          (err) => {}
        );
      }
    });
  };

  const processAllHandouts = () => {
    let handouts = findObjs({type: 'handout' });
    const parseOneHandout = () => {
      if (handouts.length) {
        let handout = handouts.shift();
        processSingleHandout(handout);
        // defer next handout
        setTimeout(parseOneHandout, 0);
      }
    };
    // start the deferred processing
    parseOneHandout();
  };

  const onChangeHandout = (obj, prev) => {
    if (activeHandoutID.includes(obj.id)) {
        activeHandoutID.splice(obj.id);
        return;
    }
    processSingleHandout(obj);
  };

  on('chat:message',(msg)=>{
      let command = /^!rollhandout$/i;
      if (msg.type !== 'api' || !command.test(msg.content)) {
        return;
      }
      processAllHandouts();
  });
  on('chat:message',(msg)=>{
      let command = /^!handoutlinks (on|off)$/i;
      if (msg.type !== 'api' || !command.test(msg.content)) {
        return;
      }
      ToggleLinks(msg.content.replace(command,'$1'));
  });

    if('undefined' === typeof RecursiveTable){
        setTimeout(()=>sendChat('Roll Handout Tables',`/w gm <div style="background:#ff9999;padding:.5em;border:3px solid darkred;border-radius:1em;line-height:1em;color:darkred;"><b>Roll Handout Tables</b> requires the script RecursiveTable, which can be installed from the 1-Click Script Library.</div>`),1000);
    }

  on('change:handout',onChangeHandout);

});
