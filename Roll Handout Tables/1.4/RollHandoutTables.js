on('ready', () => {
  let activeHandoutID = [];
  const processSingleHandout = (handout) => {
    // do stuff here with handout
    const strip = /<[^>]*>/g;
    const diceRoll = /(\d+d\d+(\+\d+)?)/g;
    const leftBracket = '[[';
    const rightBracket = ']]';
    const handoutName = handout.get('name');
    let notesNew;

    handout.get('notes', (notes) => {

      notesNew = notes;

      if (notes.includes('<table>')) {
        //Separate handout as sections by <h#> tags, keeping tags
        let section = notes.match(/.+?(?:(?!<h\d>).)*/gs);

        //For each section,
        for (let s = 0; s < section.length; s++) {
          //If section has a table
          if (section[s].includes('<table>')) {
            //separate section into table[] by <table> tags, pass <h#> as sectionHeader
            let table = section[s].match(/<table>.+?<\/table>/gs); //grabs inner text of table
            let e = section[s].match(/<h\d>.+?<\/h\d>/); //take text such as "<h4>Header</h4>"
            let sectionHeader = e[0].replace(strip, ''); //strip text of html
            let tableName = 'error';
            let tableID;

            //For each table,
            for (let t = 0; t < table.length; t++) {
              let tBody = table[t].match(/<tbody>.+?<\/tbody>/gs);//grab inner text of tbody tags
              let testHeader = table[t].match(/<t[dh]>.+?<\/t[dh]>/gs);
              let testBody = tBody[0].match(/<tr>.+?<\/tr>/gs);//header matches on <td>/<th> tags
              let diceCheck = /d\d+/g;//matches on text such as "d8" or "d20"

              //check whether table is rollable
              if (!(testHeader[0].match(diceCheck)) && !(testBody[0].match(diceCheck))) {
                continue;
              } //if table is rollable

              //reset r
              let r = 0;

              //Table[] contains <thead>
              if (table[t].includes('<thead>')) {
                  if (!(table[t].includes('<thead></thead>'))) {
                    //Separate tableHeader by <thead> tags
                    let tableHeader = table[t].match(/<thead>.+?<\/thead>/);
                    //Separate tableHeader into h by <th> tags
                    let h = tableHeader[0].match(/<t[hd]>.+?<\/t[hd]>/gs);

                    //Strip h[0], Strip h[1]
                    if (h[0] && h[1]) {
                      h[0] = h[0].replace(strip, '');
                      h[1] = h[1].replace(strip, '');
                    } else {
                      h[0] = '';//make h[0] not null/undefined but keep length of 0
                    }

                    if (h[0].length === 0) { //can be changed to if not statement

                    } else {
                      tableName = `${handoutName} - ${h[1]}`;
                    }
                  } //end if includes <thead></thead>

                  //check first row of table for dice, catches cases with blank headers
                  let d = table[t].match(/<tr>.+?<\/tr>/gs);
                  let g = d[0].match(/<t[dh]>.+?<\/t[dh]>/gs);

                  if (g[1]) {
                  g[1] = g[1].replace(strip, '');
                  } else {
                  g[1] = g[0].replace(strip, '');
                }//if dice is in the second row, use it, else use first row

                  if ((d[0].match(/d\d+/))) { //matches on "3d4" or "1d6+2"
                    tableName = `${handoutName} - ${g[1]}`;
                  } else {
                    r = 1;
                    tableName = `${handoutName} - ${sectionHeader}`;
                  }
              } else {//if table doesn't include <thead>
                  tableName = sectionHeader;

                  if (!(tableName.match(/\s/))) {
                   tableName = `${handoutName} - ${tableName}`;
                  } else {
                      tableName = sectionHeader;
                  }

                  r = 1;
              }

              //check if tableName exists and continue;
              let findTable = findObjs({ type: 'rollabletable', name: tableName });
              let rollLink = `<br><a href="\`/r 1t[${tableName}]">Roll</a></br>`;
              let recursiveLink = `<br><a href="\`!rt [[ 1t[${tableName}] ]]">Roll Recursive</a></br>`;
              let linkTable = rollLink + recursiveLink;

              if (findTable.length) {
                if (!(notes.includes(linkTable))) {
                  notesNew = notes.replace(table[t], linkTable + table[t]);
                }
                continue;
              } else {
                //create new table
                let newTable = createObj('rollabletable', {
                name: tableName
                });
                tableID = newTable.id;
              }

              //extract tableBody by <table> tags, then separate as row[] by <tr> tags
              let tableBody = table[t].match(/<tbody>.+?<\/tbody>/gs);
              let row = tableBody[0].match(/tr>.+?<\/tr>/gs);
              let range, rangeB, input, weight, inputB, weightB;

              //for each row
              for (r; r < row.length; r++) {
                //separate row[] by <td> tags as col[]
                let col = row[r].match(/<td>.+?<\/td>/gs);

                //strip col[0-1] of html syntax
                col[0] = col[0].replace(strip, '');
                col[1] = col[1].replace(strip, '');

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

                if (col[2]) { //repeat process if table has four columns
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

                  //add weight/items from third/fourth column
                  createObj('tableitem', {

                    name: inputB,
                    rollabletableid: tableID,
                    weight: weightB

                  }); // end create obj B
                } // end if 3rd column exists

                //add item to table
                createObj('tableitem', {

                  name: input,
                  rollabletableid: tableID,
                  weight: weight

                }); // end create obj A
              }//end for each row loop

                //replace old notes with new notes that include roll link
                notesNew = notes.replace(table[t], linkTable + table[t]);
                continue;
            }//end table loop?
          } else {
            continue;
          }// end if section includes table
        } //end for each section

      activeHandoutID.push(handout.id); //cache id to stop endless loop
      handout.set('notes', notesNew);
      }//end if Handout has <table>
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
  }

  on('chat:message',(msg)=>{
    // some chat stuff that calls processAllHandouts()

      if (msg.type !== 'api' && msg.content !== '!rollhandout') {
        return;
      }

      processAllHandouts();
  });

  on('change:handout',onChangeHandout);

});
