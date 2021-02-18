on('ready', () => {
  let activeHandoutID = [];
  const processSingleHandout = (handout) => {
    const strip = /<[^>]*>/g;
    const sectionsByTables = /.+?<\/table>/gs ;
    const sectionContent = /.+?<table>/gs;
    const diceRoll =  /(\d+d\d+(\+\d+)?)/g;
    const leftBracket = '[[';
    const rightBracket = ']]';
    const allBold = /<(strong|b)>.+?<\/(strong|b)>/gs;
    const bodyMatch = /<tbody>.+?<\/tbody>/gs;
    const rowMatch = /tr>.+?<\/tr>/gs;

    /*
      Function declarataions
    */
    const SectionDefine = (e, notes) => {
      let sectionsByTables = notes.match(/.+?<\/table>/gs);
      if (sectionsByTables[0].match(/<h\d+>/)) {
        return e = 'headerTags';
      } else {
        return e = 'noHeaderTags';
      }
    };
    const CheckRollable = (table) => {
      let tBody = table[t].match(/<tbody>.+?<\/tbody>/gs);//grab inner text of tbody tags
      let testHeader = table[t].match(/<t[dh]>.+?<\/t[dh]>/gs);
      let testBody = tBody[0].match(/<tr>.+?<\/tr>/gs);
      let diceCheck = /d\d+/g;//matches on text such as "d8" or "d20"

      if (testHeader[0].match(diceCheck)) { //got here
         tableName = testHeader[1].replace(strip, '');
      } else {
        if (testBody[0].match(diceCheck)) {
           tableName = testBody[1].replace(strip, '');
        } else {
          tableName = null;
          // continue;
        }
      }
    };
    const NameTable = (a, b, c) => {
      if (b) {
        rollTableName = `${a} - ${b}`;
      } else {
        rollTableName = `${a} - ${c}`;
      }
    };
    const CheckForTable = (rollTableName, notes, table) => {
      let findTable = findObjs({ type: 'rollabletable', name: rollTableName });
      let rollLink = `<br><a href="\`/w gm 1t[${rollTableName}]">Whisper Roll</a></br>`;
      let recursiveLink = `<br><a href="\`!rt /w gm [[ 1t[${rollTableName}] ]]">Whisper Roll Recursive</a></br>`;
      linkTable = rollLink + recursiveLink;

      if (findTable.length) {
        if (!(notes.includes(linkTable))) {
          notesNew = notes.replace(table[t], linkTable + table[t]);
        }
        return;
      } else {
        //create new table
        let newTable = createObj('rollabletable', {
        name: rollTableName
        });
        let tableID = newTable.id;
        ParseTable(table, tableID, r, t, notes, linkTable);
      }
    };
    const ParseTable = (table, tableID, r, t, notes, linkTable) => {
      let tableBody = table[t].match(/<tbody>.+?<\/tbody>/gs);
      let row = tableBody[0].match(/tr>.+?<\/tr>/gs);
      let range, rangeB, input, weight, inputB, weightB;
      for (r = 0; r < row.length; r++) {
        //separate row[] by <td> tags as col[]
        let col = row[r].match(/<td>.+?<\/td>/gs);

        //strip col[0-1] of html syntax
        col[0] = col[0].replace(strip, '');
        col[1] = col[1].replace(strip, '');

        if (col[0].match(/d\d+/)) {
          continue;
        }

        //get range as weight and item name as input from columns
        range = col[0].split('-');
        if (range[1] !== undefined) {
          weight = parseInt(range[1], 10) - parseInt(range[0], 10) + 1;
        } else {
          weight = 1;
        } //finds range of first column
        if (col[1].match(diceRoll)) {
          input = col[1].replace(diceRoll, `${leftBracket}$1${rightBracket}`);
        } else {
          input = col[1];
        } //surrounds any dice rolls with brackets

        let numCheck = /^\d+\s/; //matches a single number at start of string
        if (input.match(numCheck)) {
          input = `&nbsp;${input}`;
        }

        if (col[3]) { //repeat process if table has four columns
          rangeB = col[2].split('-');
          col[2] = col[2].replace(strip, '');
          col[3] = col[3].replace(strip, '');
          if (rangeB[1] !== undefined) {
            weightB = parseInt(rangeB[1], 10) - parseInt(rangeB[0], 10) + 1;
          } else {
            weightB = 1;
          }
          if (col[3].match(diceRoll)) {
            inputB = col[3].replace(diceRoll, `${leftBracket}$1${rightBracket}`);
          } else {
            inputB = col[3];
          }
          let numCheck = /^\d+\s/;
          if (inputB.match(numCheck)) {
            inputB = `&nbsp;${input}`;
          }
          CreateItem(inputB,tableID,weightB);
            }
            CreateItem(input,tableID,weight);
          }

      notesNew = notes.replace(table[t], linkTable + table[t]);
      // continue; //might break here
    };
    const CreateItem = (input, tableID, weight) => {
      createObj('tableitem', {
        name: input,
        rollabletableid: tableID,
        weight: weight
      });
    };
    const HandleTable = (table,x,y,notes) => {
      for (t = 0; t < table.length; t++) {
        let r = 0;
        CheckRollable(table, notes);
        NameTable(x,y,tableName);
        CheckForTable(rollTableName, notes, table);
        // ParseTable(table, tableID, r, t, notes, linkTable);
      }
    };

    /*
      Variable declaration
    */
    const handoutName = handout.get('name');
    let tableName, headerTags, noHeaderTags, rollTableName;
    let range, rangeB, input, weight, inputB, weightB;
    let a, section, table, t, r, sectionHeader, e, notesNew, linkTable;

    handout.get('notes', (notes) => {
      notesNew = notes;
      if (notes.includes('<table>')) {
        /*
          Start procedure
        */
        let s;

        switch (SectionDefine(e, notes)) {
          case 'headerTags':
            section = notes.match(/.+?(?:(?!<h\d>).)*/gs);
            for (s = 0; s < section.length; s++) {
              let b = null;
              let h = section[s].match(/<h\d>.+?<\/h\d>/);
              if (h) {
                sectionHeader = h[0].replace(strip, '');
              }
              let table = section[s].match(/<table>.+?<\/table>/gs);
              if (table == undefined) {
                continue;
              }
              let p = table.length;
              if (p == 1) {
                HandleTable(table,handoutName,sectionHeader,notes);
              } else {
                HandleTable(table,handoutName,null,notes);
              }
            }
            activeHandoutID.push(handout.id); //cache id to stop endless loop
            handout.set('notes', notesNew);
            break;
          case 'noHeaderTags':
            section = notes.match(sectionsByTables);
            s = 0;
            for (s; s < section.length; s++) {
              let content = section[s].match(sectionContent);
              let headers = content[0].match(allBold);
              let j = headers.length;
              let sectionHeader = headers[j-1].replace(strip, '');
              let table = section[s].match(/<table>.+?<\/table>/gs);
              if (sectionHeader) {
                HandleTable(table, handoutName, sectionHeader, notes);
              } else {
                HandleTable(table, handoutName, null, notes);
              }
            }
            activeHandoutID.push(handout.id); //cache id to stop endless loop
            handout.set('notes', notesNew);

            break;
          default:
        }
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
      if (msg.type !== 'api' && msg.content !== '!rollhandout') {
        return;
      }
      processAllHandouts();
  });

  on('change:handout',onChangeHandout);

});
