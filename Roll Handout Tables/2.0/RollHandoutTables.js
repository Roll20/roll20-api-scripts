on('ready', () => {
  let activeHandoutID = [];
  const processSingleHandout = (handout) => {
    const leftBracket = '[[';
    const rightBracket = ']]';
    const re_bold = /<(strong|b)>.+?<(\/\1)>/gsmi;
    const re_DR_Add = /(\dd\d\+\d+d\d+)/;
    const re_DR_TwoDice = /(d\d+\/d\d+)/;
    const re_DR_OneDice = /(d\d+)/;
    const re_DR_MultDice = /(\d+d\d+)/;
    const re_Header = /<(h\d)>.+?<\/\1>/gs;
    const re_diceRoll = /(\d+d\d+((\+|\s*[x×]\s*)\d+)?)/gmi;// (e.g. 1d6,1d6+10,1d4 x 10)
    const re_multipy = /(\[\[\d+?d\d+?)\s*[x×]\s*(\d+?\]\])/g;
    const re_drTrailingCalc = /(\d+d\d+(\+\d+)?)\s\(\d+?\)/gmi;// (e.g. '1d6 (3)')
    const re_drLeadingCalc = /\d+?\s\((\d+d\d+(\+\d+)?)\)/gmi;// (e.g. '3 (1d6)')
    const re_sectByRollable = /.+?<\/roll>/gms;
    const re_tableRow = /<(thead|tr)>.+?<\/(thead|tr)>/gmis;
    const re_tableCell = /<t(h|d)>.+?<\/t(h|d)>/gmis;
    const re_spaceReplace = /&nbsp;/gs;
    const re_taggingTables = /<table>(((?!<table>).)*(>\d*d\d+?)<.+?)<\/table>/gmis;
    const re_findRoll = /<roll.+?<\/roll/gmis;
    const strip = /<[^>]*>/g;
    const re_range = /^(\d+?|\d+?[-–]\d+?)$/;
    const re_dash = /[-–]/;

    /*
      Function declarataions
    */
    function TableConstructor(tableName, tableItems) {
      this.Name = tableName;
      this.Items = tableItems;
    }
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
    const TxtCleaner = (str) => {
      str = str.trim();
      str = str.replace(/\s/gmi, '_');
      str = str.replace(/[\:\(\)\,]/gmi,'');
      return str;
    };
    const TableNaming = (element) => {
      let hdrs = element.match(re_Header);
      let bool_handoutUsed = false;
      let randomID = Math.floor(Math.random() * 999);
      if (backupName == ''){backupName = randomID.toString()}
      if (hdrs) {
        let lastHdr = hdrs[hdrs.length-1].replace(strip,'');
        if (lastHdr) {
          if(!handoutTblNames.includes(lastHdr)){
            lastHdr = TxtCleaner(lastHdr);
            newTableName = lastHdr;
          }
        }
      } else {
        let bold = element.match(re_bold);
        if (bold) {
          let altHdr = TxtCleaner(bold[0].replace(strip,''));
          newTableName = altHdr;
        }
      }
      if (!newTableName.length || handoutTblNames.includes(newTableName)) {
        backupName = TxtCleaner(backupName);
        newTableName = `${handoutName}_${backupName}`;
        bool_handoutUsed = true;
      }
      if (handoutTblNames.includes(newTableName)) {
        newTableName = `${handoutName}_${randomID}`;
        bool_handoutUsed = true;
      }
      if (newTableName.split('_').length < 3 && !bool_handoutUsed) {
        newTableName = `${handoutName}_${newTableName}`;
      }
      newTableName = TxtCleaner(newTableName);
      return newTableName;
    };
    const RangeChecker = (obj) => {
      let columnPoints = [];
      let newObj = obj;
      for (let x = 0, y = obj[1].length; x < y; x++) {
        if (re_range.test(obj[1][x])) {
          columnPoints.push(x);
        }
      }
      if (columnPoints.length > 1) {
        newObj = [];
        for (let i = 0, j = obj.length; i < j; i++) {
          for (a = 0, b = columnPoints.length; a < b; a++) {
            let replace = obj[i].slice(columnPoints[a], columnPoints[a+1]);
            newObj.push(replace);
          }
        }
      }
      obj = newObj;
      return obj;
    };
    const ConstructTableObject = (name, items) => {
      let newTbl = new TableConstructor(name, items);
      tbls.push(newTbl);
      handoutTblNames.push(newTbl.Name);
      return tbls;
    };
    const BuildTableItems = (element) => {
      objTable = [];
      let rows = element.match(re_tableRow);
      let objRows = [];
      for (i = 0, j = rows.length; i < j; i++) {
        let row = [];
        let cells = rows[i].match(re_tableCell);
        for (a = 0, b = cells.length; a < b; a++) {
          let cell = cells[a].replace(strip, '').trim();
          row.push(cell);
        }
        objTable.push(row);
      }
      return objTable;
    };
    const PullRollTables = (element) => {
      htmlTable = element.match(re_findRoll)[0];
      return htmlTable;
    };
    const SendError = (msg, from) => {
			if (from === undefined){from = "RollHandoutTables"};
			// sendChat(from, msg, null, {
			// 	noarchive: true
      // });
    }
    const GetTableNames = () =>  {
      let tableNames = [];
      let tables = findObjs({type: 'rollabletable'});
      _.each(tables, function(obj) {
        tableNames.push(obj.get("name"));
      });
      return tableNames;
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
        if (name) {
          newTable = createObj('rollabletable', {
            name: name
          });
          let tableID = newTable.id;
          for (let i = 0, j = ele.Items.length; i < j; i++) {
            let weight = ele.Items[i][0];
            let item = ele.Items[i][1];
            CreateItem(weight, item, tableID);
          }
        } else {
          log(`error processing ${rawHandoutName}`)
        }
        l++;
      });
    };
    const BuildTableLink = (name) => {
      let whisperLink = `<br><a href="\`!rt /w gm [[ 1t[${name}] ]]">Whisper Roll Recursive</a></br>`;
      let loudLink = `<br><a href="\`!rt [[ 1t[${name}] ]]">Roll Recursive</a></br>`;
      return whisperLink + loudLink;
    };
    const PlaceTableLink = (txt) => {
      let resetTxt = txt.replace(/<!>/gsmi,'');
      let cnt = txt.match(/<!>/gmi);
      if (cnt){cnt = cnt.length;}
      if (txt.includes(handoutTblNames[i])){return resetTxt;}
      for (let i = 0, j = cnt; i < j; i++) {
        let name = handoutTblNames[i];
        let links = BuildTableLink(name);
        if (!txt.includes(name)) {
          txt = txt.replace(/<!>/, links);
        } else {
          return txt = resetTxt;
        }
      }
      return txt;
    };
    const SwitchDiceCheck = (obj, i) => {
      let ele = obj[i][0];
      switch (true) {
        case re_DR_TwoDice.test(ele):
        tblDie = ele.match(re_DR_TwoDice)[0].split('/');
        tblDie = tblDie[0];
        tblDieB = tblDie[1];
        return [tblDie, tblDieB];
        break;
        case re_DR_Add.test(ele):
        tblDie = ele.match(re_DR_Add).split('+');
        return 1;
        break;
        case re_DR_OneDice.test(ele):
        tblDie = ele.match(re_DR_OneDice)[0];
        return [tblDie];
        break;
        case re_DR_MultDice.test(ele):
        tblDie = ele.match(re_DR_MultDice)[0];
        return [tblDie];
        break;
        default:
        return 1;
      }
    };
    const HandleTwoDice = (dieToRoll, obj) => {
      let altName;
      for (let x = 0; x < j; x++) {
        max = parseInt(dieToRoll[0].replace('d',''));
        altRng = GetWeight(obj[x][0]);
        if(altRng){
          if (altRng[2] <= max) {
            PushItem(obj[x], altTableItems, altRng[0])
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
    const GetWeight = (data) => {
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
        let args = [itemWeight, range[0], range[1]]
        return args;
      }
    };
    const PushItem = (row, arr, weight) => {
      let itemDesc = row.slice(1).join('; ');
      itemDesc = itemDesc.replace(re_drTrailingCalc, `$1`);
      itemDesc = itemDesc.replace(re_drLeadingCalc, `$1`);
      itemDesc = itemDesc.replace(re_diceRoll, `${leftBracket}$1${rightBracket}`);
      itemDesc = itemDesc.replace(re_multipy, `$1*$2`);
      arr.push([weight,itemDesc]);
    }
    const SetBackupName = (row) => {
      let headerFromRow = row[1];
      if (headerFromRow) {
        backupName = headerFromRow.trim();
      } else {
        backupName = "Error finding table name";
      }
      return backupName;
    };
    const GetTables = (element) => {
      htmlTable = element.match(re_findRoll)[0];
      return htmlTable;
    };
    const ParseTable = (obj) => {
      tableItems = [];
      altTableItems = [];
      // Check for mulitple ranges and rearrange items
      obj = RangeChecker(obj);
      // For each row in html object
      for (let i = 0, j = obj.length; i < j; i++) {
        let objRow = obj[i];
        let itemWeight;
        let tblDie;
        let tblDieB;
        let dieToRoll = 1;
        let max;
        // Check first or second row for a die (e.g. d20, d12/d20, d8+d20)
        if (i < 2) {
          dieToRoll = SwitchDiceCheck(obj, i);
        } else {
          dieToRoll = [];
        }
        // Get item weight from row
        rangeArgs = GetWeight(objRow[0]);
        if (rangeArgs) {
          itemWeight = rangeArgs[0];
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
        if (dieToRoll.length == 2) {
          HandleTwoDice(dieToRoll, obj);
        }
      }
      tableItems = tableItems.filter(ele => {
        if (ele[0] !==undefined && ele[1] !== undefined) {
          return true;
        }
      });
      return tableItems;
    };
    const ParseSections = (element, index, array) => {
      let backupName;
      let tableItems = [];
      let altTableItems = [];
      GetTables(element); // returns a rollable html Table
      BuildTableItems(htmlTable); // returns table as an obj
      tableItems = ParseTable(objTable);
      TableNaming(element);
      let name = newTableName;
      ConstructTableObject(name, tableItems);
    };

    /*
      Variable declaration
    */
    const rawHandoutName = handout.get('name');
    let tempName = rawHandoutName.replace(/\s/g,'_').replace(/[\:\(\)\,]/g,'');
    if (tempName == 'Stocking_a_Dungeon'){
      tempName = 'Dungeon';
    } else {
      tempName = tempName;
    }
    const handoutName = tempName;
    let newTableName = '';
    let backupName = '';
    let tbls = [];
    let handoutTblNames = [];
    let tblNames = GetTableNames();
    handout.get('notes', (notes) => {
      const HandleNotes = new Promise((resolve, reject) => {
        const tempFunc = () => {
          notes = notes.replace(re_spaceReplace,'');
          let tempNotes = notes;
          if(notes.includes(`<table>`)) {
            let rollableTbls = tempNotes.match(re_taggingTables);
            tempNotes = tempNotes.replace(re_taggingTables, '<!><roll>$1</roll>');
            let sections = tempNotes.match(re_sectByRollable);
            if(sections) {
              sections.forEach(ParseSections); // Returns array of tables for handout;
            }
            WriteRollableTable();
            tempNotes = tempNotes.replace(/<roll>/gmi,`<table>`).replace(/<\/roll>/gmi, `</table>`);
            tempNotes = PlaceTableLink(tempNotes);
            resolve(tempNotes);
          } else {
            reject('error');
          }
        };
        setTimeout(tempFunc, 0);
      });
      if(notes){
        HandleNotes.then(
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

  on('change:handout',onChangeHandout);

});
