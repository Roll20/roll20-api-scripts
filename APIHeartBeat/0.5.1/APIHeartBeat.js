// Github:   https://github.com/shdwjk/Roll20API/blob/master/APIHeartBeat/APIHeartBeat.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
// Forum:    https://app.roll20.net/forum/permalink/10447182/
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.APIHeartBeat={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.APIHeartBeat.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-7);}}

const APIHeartBeat = (()=> { // eslint-disable-line no-unused-vars

    const scriptName = "APIHeartBeat";
    const version = '0.5.1';
    API_Meta.APIHeartBeat.version = version;
    const lastUpdate = 1634706237;
    const schemaVersion = 0.4;
    const beatPeriod = 200;
    const devScaleFactor = 5;
    let currentBeatPeriod=0;

    let beatInterval = false;
    let HBMacro;
    const S = () => state[scriptName];

    const assureHelpHandout = (create = false) => {
        const helpIcon = "https://s3.amazonaws.com/files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385";

        // find handout
        let props = {type:'handout', name:`Help: ${scriptName}`};
        let hh = findObjs(props)[0];
        if(!hh) {
            hh = createObj('handout',Object.assign(props, {inplayerjournals: "all", avatar: helpIcon}));
            create = true;
        }
        if(create || version !== state[scriptName].lastHelpVersion){
            hh.set({
                notes: helpParts.helpDoc({who:'handout',playerid:'handout'})
            });
            state[scriptName].lastHelpVersion = version;
            log('  > Updating Help Handout to v'+version+' <');
        }
    };

    const newTimeSegment = ()=> {
      S().timeSegments = [{start: Date.now(), end: Date.now()},...S().timeSegments].slice(0,S().config.maxSegments);
    };

    const checkInstall = () => {
      log(`-=> ${scriptName} v${version} <=-  [${new Date(lastUpdate*1000)}]`);
      if( ! _.has(state,scriptName) || S().version !== schemaVersion) {
        log('  > Updating Schema to v'+schemaVersion+' <');
        switch(S() && S().version) {
          case 0.2:
            Object.keys(S().heartBeaters).forEach(k=>{
              let color = S().heartBeaters[k].origColor;
              let player = getObj('player',k);
              if(k){
                player.set({color: color});
              }
            });

            // centralize config
            S().config = {
              devMode: S().devMode,
              macroID: false,
              spinner: 'ARROW',
              latency: true
            };

            delete state[scriptName].heartBeaters;
            delete state[scriptName].devMode;
            /* break; // intentional dropthrough */ /* falls through */

          case 0.3:
            S().timeSegments = [];
            S().config.maxSegments = 30;
            S().config.showTime = false;
            S().config.hourOffset = -5;
            /* break; // intentional dropthrough */ /* falls through */

          case 'UpdateSchemaVersion':
            S().version = schemaVersion;
            break;

          default:
            state[scriptName] = {
              version: schemaVersion,
              timeSegments: [],
              config: {
                devMode: false,
                macroID: false,
                spinner: 'ARROW',
                latency: true,
                maxSegments: 30,
                showTime: false,
                hourOffset: -5
              }
            };
        }
      }
      HBMacro = getOrCreateMacro();
      assureHelpHandout();
      newTimeSegment();
      startStopBeat();
      sendCheck('gm');
    };


    const ch = (c) => {
        const entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
            '@' : '#64',
            '{' : '#123',
            '|' : '#124',
            '}' : '#125',
            '[' : '#91',
            ']' : '#93',
            '"' : 'quot',
            '*' : 'ast',
            '/' : 'sol',
            ' ' : 'nbsp'
        };

        if( entities.hasOwnProperty(c) ){
            return `&${entities[c]};`;
        }
        return '';
    };

    const checkStyle = `font-size: 0.8em; line-height: 1em; background-color: rgba(255,0,0,.2);color: red;font-weight: bold;border-bottom: 2px solid red;border-top: 4px solid red;font-variant: small-caps;left: -5em;position: relative;padding: 0 5em;width: 100%;right: 6em;`;
    const histogramStyle = ``;
    const historyStyle = ``;
    const graphImg = "https://s3.amazonaws.com/files.d20.io/images/176281994/L28MUxhSDnieHtIl49363Q/thumb.jpg?160477139355";
    const sendCheck = (who) => sendChat('',`/w "${who}" <div style="${checkStyle}">API is Running.</div>`);

    let latencyData = [];
    const NUM_RECORDS = 600;
    const recordLatency = (t,n,i) => {
      latencyData.push({t,n,i});
      if(latencyData.length>NUM_RECORDS){
        latencyData.shift();
      }
    };

    const zPad2 = (n)=>String(n).padStart(2,'0');
    const UTCtoOffset = (n) => n + (S().config.hourOffset*HOUR_MS);
    const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const asDateString = (d) => `${monthAbbreviations[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    const asTimeString = (d) => `${zPad2(d.getHours())}:${zPad2(d.getMinutes())}:${zPad2(d.getSeconds())}`;
    const asLocalDate = (n) => asDateString(new Date(UTCtoOffset(n)));
    const asLocalTime = (n) => asTimeString(new Date(UTCtoOffset(n)));
    const getTimeSegments = () => S().timeSegments.map(ts=>({
      start: asLocalTime(ts.start),
      end: asLocalTime(ts.end),
      duration: timeIntervalString(ts),
      date: asLocalDate(ts.start)
    }));

    const timeIntervalString = (interval) => {
      const z = zPad2;
      let time = Math.round((interval.end - interval.start)/1000);
      let s = time%60;
      time=Math.floor(time/60);
      let m = time%60;
      time=Math.floor(time/60);
      let h = time%24;
      time=Math.floor(time/24);

      return `${time}:${z(h)}:${z(m)}:${z(s)}`;
    };

    const getUptime = () => timeIntervalString(S().timeSegments[0]);

    const getHistogram = ()=>{
      if(latencyData.length){
          let data = [];
          let callbackMax = 0;
          let callbackMin = 100000;
          let intervalMax = 0;
          let intervalMin = 100000;
          let gCBAccum=0;
          let gITAccum=0;
          {
              let bucket = Math.floor(latencyData[0].t/1000);
              let callbackAccum = 0;
              let callbackCount = 0;
              let intervalAccum = 0;
              let intervalCount = 0;
              latencyData.forEach( m => {
                let b = Math.floor(m.t/1000);
                if(bucket !== b){
                  let callbackMeasure = callbackAccum/callbackCount;
                  let intervalMeasure = intervalAccum/intervalCount;
                  gCBAccum+=callbackMeasure;
                  gITAccum+=intervalMeasure;
                  data.push([callbackMeasure,intervalMeasure]);

                  callbackMax = Math.max(callbackMeasure,callbackMax);
                  callbackMin = Math.min(callbackMeasure,callbackMin);
                  intervalMax = Math.max(intervalMeasure,intervalMax);
                  intervalMin = Math.min(intervalMeasure,intervalMin);
                  callbackAccum = 0;
                  callbackCount = 0;
                  intervalAccum = 0;
                  intervalCount = 0;
                  bucket = b;
                }
                callbackAccum+=m.n;
                callbackCount++;
                intervalAccum+=m.i;
                intervalCount++;
              });
              let callbackMeasure = callbackAccum/callbackCount;
              let intervalMeasure = intervalAccum/intervalCount;
              data.push([callbackMeasure,intervalMeasure]);
              callbackMax = Math.max(callbackMeasure,callbackMax);
              callbackMin = Math.min(callbackMeasure,callbackMin);
              intervalMax = Math.max(intervalMeasure,intervalMax);
              intervalMin = Math.min(intervalMeasure,intervalMin);
          }
          let gMax = Math.max(Math.ceil(callbackMax),Math.ceil(intervalMax));
          //let gMin = Math.min(Math.ceil(callbackMin),Math.ceil(intervalMin));
          // Graph is nicer with 0 as the minimum.
          let gMin = 0;
          let scale = gMax-gMin;
          const s = {
            container: `width:100%;border:1px solid #999;padding: .1em 0;background-color:#ccc;`,
            graph: `width:100%;line-height:.5em;font-size:0.5em;border:1px solid #999;padding: .5em 0;background-image: url(${graphImg});background-size: ${(10/(gMax.toFixed(0)))*100}%;`,
            barContainer: `gMax-height:1px; height:1px;position:relative;`,
            bar1: `display:inline-block;height:2px;background-color:rgba(255,0,0,1);position:absolute;top:0;left:0;`,
            bar2: `display:inline-block;height:2px;background-color:rgba(0,255,0,.6);position:absolute;top:0;left:0;`,
            title: `font-weight:bold;font-size:1.3em;`,
            header: `text-align:center;margin-bottom:.1em;padding: .1em 0 0 0;`,
            num: `font-weight:bold;border: 1px solid #999;font-size: .6em;line-height: .6em;background-color:white;border-radius:.5em;padding:.5em;`,
            leftNum: `float:left;`,
            rightNum: `float:right;`,
            clear: `clear:both`,
            legend: `float:right;width:7em;border:1px solid #999;background-color:#fff;font-size:.8em;line-height:1em;padding:.2em;margin:.2em;border-radius:.5em;`,
            entry: ``,
            data: `margin-bottom:.1em;display:inline-block;border:1px solid black;padding:.1em .4em .1em 0;border-radius:1em;`,
            data_num: `background-color:black;color:white;font-weight:bold;padding:.1em .6em .1em .5em;border:0px solid transparent;border-top-left-radius:1em;border-bottom-left-radius:1em;`,
            info: `border:1px solid #999;background-color:white;padding:.3em;margin:.1em;border-radius:.5em;font-size:.8em;line-height:1.1em;`,
            entry_color: `display:inline-block;border:2px solid #999;width:1em;border-radius:100%;float:left;margin-right:.2em;`
          };

          const e = {
            container: (...o) => `<div style="${s.container}">${o.join('')}</div>`,
            graph:     (...o) => `<div style="${s.graph}">${o.join('')}</div>`,
            leftNum:   (o) => `<div style="${s.num}${s.leftNum}">${o}</div>`,
            rightNum:  (o) => `<div style="${s.num}${s.rightNum}">${o}</div>`,
            clear:     ()  => `<div style="${s.clear}"></div>`,
            title:     ()  => `<div style="${s.title}">API Latency</div>`,
            header:    ()  => `<div style="${s.header}">${e.leftNum(`${gMin.toFixed(0)}ms`)}${e.rightNum(`${gMax.toFixed(0)}ms`)}${e.title()}${e.clear()}</div>`,
            footer:    ()  => `<div style="${s.footer}">${e.legend()}${e.info()}${e.clear()}</div>`,
            entry:     (c,l) => `<div style="${s.entry}"><span style="${s.entry_color}background-color:${c}">&nbsp;</span> ${l}</div>`,
            legend:    ()  => `<div style="${s.legend}">${e.entry('#f00','Callback Latency')}${e.entry('#0f0','Interval Latency')}</div>`, 
            data:     (n,l) => `<div style="${s.data}"><span style="${s.data_num}">${n}</span> ${l}</div>`,
            info:      () => `<div style="${s.info}">${e.data(latencyData.length,'Samples')}${e.data(data.length,'Seconds')}${e.data((gCBAccum/data.length).toFixed(1),'Avg Callback Latency')}${e.data((gITAccum/data.length).toFixed(1),'Avg Interval Latency')}${e.data(getUptime(),'Uptime')}</div>`,
            row:       (ns) => e.barContainer(e.bar(ns[0],1),e.bar(ns[1],2)),
            barContainer: (...o) => `<div style="${s.barContainer}">${o.join('')}</div>`,
            bar:       (n,i) => `<span style="width:${Math.round(((n-gMin)/scale)*100)}%;${s[`bar${i}`]}"></span>`
          };
          return e.container(e.header(),e.graph(...data.map(e.row)),e.footer());
      }
      return '';
    };

    const getHistory = () => {
      let rows = getTimeSegments();
      let begin = asDateString(new Date(UTCtoOffset(S().timeSegments.slice(-1)[0].start)));
      let end = asDateString(new Date(UTCtoOffset(Date.now())));

      const s = {
        container: `width:100%;border:1px solid #999;padding: .1em 0;background-color:#ccc;`,
        title: `font-weight:bold;font-size:1.3em;`,
        header: `text-align:center;margin-bottom:.1em;padding: .1em 0 0 0;`,
        num: `font-weight:bold;border: 1px solid #999;font-size: .6em;line-height: .6em;background-color:white;border-radius:.5em;padding:.5em;`,
        leftNum: `float:left;`,
        rightNum: `float:right;`,
        tableOuter:  `background-color: white;font-size: 0.8em;`,
        table:  `border:1px solid #999;`,
        tableHeader: `border-bottom: 3px solid #999;background-color:#000;font-weight:bold;color:white;`,
        th: `width: 33%;text-align:center;display:inline-block;`,
        td: `width: 33%;text-align:center;display:inline-block;`,
        tableRow0: `background-color: #eeeeff;`,
        tableRow1: ``,
        dateRow: `border-top: 1px solid #999; background-color: #aacccc;font-weight:bold;font-size:.8em;`,
        clear: `clear:both`
      };

      let lastDater;

      const e = {
        container: (...o) => `<div style="${s.container}">${o.join('')}</div>`,
        title:     ()  => `<div style="${s.title}">Sandbox Run Interval History</div>`,
        header:    ()  => `<div style="${s.header}">${e.leftNum(begin)}${e.rightNum(end)}${e.title()}${e.clear()}</div>`,
        leftNum:   (o) => `<div style="${s.num}${s.leftNum}">${o}</div>`,
        rightNum:  (o) => `<div style="${s.num}${s.rightNum}">${o}</div>`,
        footer:    ()  => `<div style="${s.footer}">${e.clear()}</div>`,
        clear:     ()  => `<div style="${s.clear}"></div>`,
        th:        (l) => `<div style="${s.th}">${l}</div>`,
        tableHeaders:()=> `<div style="${s.tableHeader}">${e.th('Start')}${e.th('Duration')}${e.th('End')}</div>`,
        td:        (t) => `<div style="${s.td}">${t}</div>`,
        dateRow:   (d) => `<div style="${s.dateRow}">${d}</div>`,
        dater:     (d) => (lastDater !== d ? e.dateRow(lastDater=d) : ''),
        tableRow:  (d,idx) => `${e.dater(d.date)}<div style="${s[`tableRow${idx%2}`]}">${e.td(d.start)}${e.td(d.duration)}${e.td(d.end)}</div>`,
        table:     (r) => `<div style="${s.table}">${e.tableHeaders()}${r.map(e.tableRow).join('')}</div>`
      };
      return e.container(e.header(),e.table(rows),e.footer());
    };
    const sendHistogram = (who) => sendChat('',`/w "${who}" <div style="${histogramStyle}">${getHistogram()}</div>`);
    const sendHistory = (who) => sendChat('',`/w "${who}" <div style="${historyStyle}">${getHistory()}</div>`);

    const arrowCycle = {
        [`↖️`]: `⬆️`, 
        [`⬆️`]: `↗️`, 
        [`↗️`]: `➡️`, 
        [`➡️`]: `↘️`, 
        [`↘️`]: `⬇️`, 
        [`⬇️`]: `↙️`, 
        [`↙️`]: `⬅️`, 
        [`⬅️`]: `↖️`
    };
    const arrowRegex = new RegExp(`(${Object.keys(arrowCycle).join('|')})`);

    const clockCycle = {
      [`🕛`]: `🕐`,
      [`🕐`]: `🕑`,
      [`🕑`]: `🕒`,
      [`🕒`]: `🕓` ,
      [`🕓`]: `🕔` ,
      [`🕔`]: `🕕` ,
      [`🕕`]: `🕖` ,
      [`🕖`]: `🕗` ,
      [`🕗`]: `🕘` ,
      [`🕘`]: `🕙` ,
      [`🕙`]: `🕚` ,
      [`🕚`]: `🕛` 
    };
    const clockRegex = new RegExp(`(${Object.keys(clockCycle).join('|')})`);

    const swordCycle = {
        [`⚔️`]: `🛡️`, 
        [`🛡️`]: `⛏️`, 
        [`⛏️`]: `👑`, 
        [`👑`]: `🗡️`, 
        [`🗡️`]: `🏰`, 
        [`🏰`]: `⚔️`
    };
    const swordRegex = new RegExp(`(${Object.keys(swordCycle).join('|')})`);

    const monoDigit0 = 0xff10;
    const numToFixedString = (n,pad=3)=>`${n}`.padStart(pad,'0').split('').map(i=>String.fromCharCode(monoDigit0+(parseInt(i)))).join('');
    const HOUR_MS = 60*60*1000;
    const getMonospacedTime = (n) => {
      let d = new Date(UTCtoOffset(n));
      return `${numToFixedString(d.getHours(),2)}:${numToFixedString(d.getMinutes(),2)}:${numToFixedString(d.getSeconds(),2)}`;
    };

    let lastRunTime = 0;
    
    const updateMacro = () => {
      let then = Date.now();
      S().timeSegments[0].end = then;
      let intervalLatency = lastRunTime ? (then-lastRunTime-currentBeatPeriod) : 0;
      lastRunTime = then;

      setTimeout(()=>{
        let now = Date.now();
        S().timeSegments[0].end = now;
        let label = HBMacro.get('name');

        let latency = now-then;
        recordLatency(now,latency,intervalLatency);

        let macName = '!-';
        switch(S().config.spinner){
          case 'CLOCK': {
              let lastClock = (label.match(clockRegex)||[])[1];
              let nextClock = Object.keys(clockCycle).includes(lastClock) ? clockCycle[lastClock] : `🕛`;
              macName+=nextClock;
            }
            break;

          case 'SWORD': {
              let lastSword = (label.match(swordRegex)||[])[1];
              let nextSword = Object.keys(swordCycle).includes(lastSword) ? swordCycle[lastSword] : `⚔️`;
              macName+=nextSword;
            }
            break;

          case 'ARROW':
          default: {
              let lastArrow = (label.match(arrowRegex)||[])[1];
              let nextArrow = Object.keys(arrowCycle).includes(lastArrow) ? arrowCycle[lastArrow] : `↖️`;
              macName+=nextArrow;
            }
            break;
        }

        if(S().config.latency){
          macName+=`-${numToFixedString(Math.min(latency,999))}`;
        }

        if(S().config.showTime){
          macName+=`-${getMonospacedTime(S().timeSegments[0].end)}`;
        }

        HBMacro.set({
          name: macName
        });
      },0);
    };

    const animateHeartBeat = () => {
        updateMacro();
    };

    const startStopBeat = () => {
        let online = (findObjs({
          type: 'player',
          online: true
        }).length>0);

        currentBeatPeriod = beatPeriod*( S().config.devMode ? 1 : devScaleFactor );

        if(!beatInterval && online) {
            beatInterval = setInterval(animateHeartBeat,currentBeatPeriod);
        } else if(beatInterval && !online) {
            clearInterval(beatInterval);
            beatInterval=false;
        }
    };


    const makeConfigOption = (config,command,text) => {
        const onOff = (config ? 'On' : 'Off' );
        const color = (config ? '#5bb75b' : '#faa732' );

        return _h.configRow(
            _h.floatRight( _h.makeButton(command,onOff,color)),
            text,
            _h.clearBoth()
          );
    };

    const getOptionsWithDefault = (opts, def) => {
      let keys = Object.keys(opts).filter(k=>def !== k);
      return [def,...keys].map(k=>`${opts[k]},${k}`).join('|');
    };

    const makeConfigOptionNum = (config,command,text) => {

        return _h.configRow(
            _h.floatRight( _h.makeButton(command,"Set")),
            text,
            _h.clearBoth()
          );
    };

    const SpinnerOptions = {
      CLOCK: 'Clock face with moving hands',
      ARROW: 'Spinning arrows',
      SWORD: 'Swords and shields and other things.'
    };

    const getConfigOption_SpinnerStyle = () => makeConfigOptionNum(
      S().config.spinner,
      `!api-heartbeat-config --set-spinner|?{Spinner Style|${getOptionsWithDefault(SpinnerOptions,S().config.spinner)}}`,
      `${_h.bold('Spinner Style')} controls what the activity spinner looks like.  Current setting: ${_h.bold(SpinnerOptions[S().config.spinner])}`
    );

    const getConfigOption_ShowLatency = () => makeConfigOption(
      S().config.latency,
      `!api-heartbeat-config --toggle-show-latency`,
      `${_h.bold('Show Latency')} controls if the current API latency measurement is shown next to the spinner. Current value: ${_h.bold(S().config.latency ? 'On' : 'Off')}`
    );

    const getConfigOption_ShowTime = () => makeConfigOption(
      S().config.showTime,
      `!api-heartbeat-config --toggle-show-time`,
      `${_h.bold('Show Time')} controls if the current time is shown next to the spinner. Current value: ${_h.bold(S().config.showTime ? 'On' : 'Off')}`
    );

    const getConfigOption_HourOffset = () => makeConfigOptionNum(
      S().config.hourOffset,
      `!api-heartbeat-config --set-hour-offset|?{Hour Offset (decimals accepted)|${S().config.hourOffset}}`,
      `${_h.bold('Hour Offset')} is used to adjust the UTC date/time to some reasonable local time.  This is the number of hours (with sign) that you want away from UTC.  You can use decimal numbers for fractional offsets, like ${_h.code("-3.5")} for Newfoundland.  Current setting: ${_h.bold(S().config.hourOffset)}`
    );

    const getConfigOption_MaxSegments = () => makeConfigOptionNum(
      S().config.maxSegments,
      `!api-heartbeat-config --set-max-segments|?{Interval History Size|${S().config.maxSegments}}`,
      `${_h.bold('Interval History Size')} sets the number of Run Interval History records to keep (minimum 1). Current setting: ${_h.bold(S().config.maxSegments)}`
    );


    const getConfigOption_DevMode = () => makeConfigOption(
      S().config.devMode,
      `!api-heartbeat-config --toggle-dev-mode`,
      `${_h.bold('Developer Mode')} controls how often ${scriptName} updates its widget. When Developer Mode is on, it updates 5 times per second, rather than once per second.  This is useful if you're working on developing scripts, but otherwise should be off.  Current value: ${_h.bold(S().config.devMode ? 'On' : 'Off')}`
    );

    const getAllConfigOptions = () => getConfigOption_SpinnerStyle() +
      getConfigOption_ShowLatency() +
      getConfigOption_ShowTime() +
      getConfigOption_HourOffset() +
      getConfigOption_MaxSegments() +
      getConfigOption_DevMode() ;

  const defaults = {
      css: {
          button: {
              'border': '1px solid #cccccc',
              'border-radius': '1em',
              'background-color': '#006dcc',
              'margin': '0 .1em',
              'font-weight': 'bold',
              'padding': '.1em 1em',
              'color': 'white'
          },
          configRow: {
              'border': '1px solid #ccc;',
              'border-radius': '.2em;',
              'background-color': 'white;',
              'margin': '0 1em;',
              'padding': '.1em .3em;'
          }
      }
  };

  const css = (rules) => `style="${Object.keys(rules).map(k=>`${k}:${rules[k]};`).join('')}"`;

  const _h = {
    outer: (...o) => `<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">${o.join(' ')}</div>`,
    title: (t,v) => `<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">${t} v${v}</div>`,
    subhead: (...o) => `<b>${o.join(' ')}</b>`,
    minorhead: (...o) => `<u>${o.join(' ')}</u>`,
    optional: (...o) => `${ch('[')}${o.join(` ${ch('|')} `)}${ch(']')}`,
    required: (...o) => `${ch('<')}${o.join(` ${ch('|')} `)}${ch('>')}`,
    header: (...o) => `<div style="padding-left:10px;margin-bottom:3px;">${o.join(' ')}</div>`,
    section: (s,...o) => `${_h.subhead(s)}${_h.inset(...o)}`,
    paragraph: (...o) => `<p>${o.join(' ')}</p>`,
    group: (...o) => `${o.join(' ')}`,
    items: (o) => `<li>${o.join('</li><li>')}</li>`,
    ol: (...o) => `<ol>${_h.items(o)}</ol>`,
    ul: (...o) => `<ul>${_h.items(o)}</ul>`,
    clearBoth: () => `<div style="clear:both;"></div>`,
    grid: (...o) => `<div style="padding: 12px 0;">${o.join('')}${_h.clearBoth()}</div>`,
    cell: (o) =>  `<div style="width: 130px; padding: 0 3px; float: left;">${o}</div>`,
    inset: (...o) => `<div style="padding-left: 10px;padding-right:20px">${o.join(' ')}</div>`,
    join: (...o) => o.join(' '),
    configRow: (...o) => `<div ${css(defaults.css.configRow)}>${o.join(' ')}</div>`,
    makeButton: (c, l, bc, color) => `<a ${css({...defaults.css.button,...{color,'background-color':bc}})} href="${c}">${l}</a>`,
    floatRight: (...o) => `<div style="float:right;">${o.join(' ')}</div>`,
    pre: (...o) =>`<div style="border:1px solid #e1e1e8;border-radius:4px;padding:8.5px;margin-bottom:9px;font-size:12px;white-space:normal;word-break:normal;word-wrap:normal;background-color:#f7f7f9;font-family:monospace;overflow:auto;">${o.join(' ')}</div>`,
    preformatted: (...o) =>_h.pre(o.join('<br>').replace(/\s/g,ch(' '))),
    code: (...o) => `<code>${o.join(' ')}</code>`,
    attr: {
      bare: (o)=>`${ch('@')}${ch('{')}${o}${ch('}')}`,
      selected: (o)=>`${ch('@')}${ch('{')}selected${ch('|')}${o}${ch('}')}`,
      target: (o)=>`${ch('@')}${ch('{')}target${ch('|')}${o}${ch('}')}`,
      char: (o,c)=>`${ch('@')}${ch('{')}${c||'CHARACTER UniversalVTTImporter'}${ch('|')}${o}${ch('}')}`
    },
    bold: (...o) => `<b>${o.join(' ')}</b>`,
    italic: (...o) => `<i>${o.join(' ')}</i>`,
    font: {
      command: (...o)=>`<b><span style="font-family:serif;">${o.join(' ')}</span></b>`
    }
  };

    const helpParts = {
        helpBody: (context) => _h.join(
                _h.header(
                    _h.paragraph(`${scriptName} provides visual feedback that the API is running.`)
                ),
                _h.subhead('Commands'),
                _h.inset(
                    _h.font.command(
                        `!api-heartbeat`,
                        _h.optional(
                            `--help`,
                            `--check`,
                            `--histogram`,
                            `--history`
                        )
                    ),
                    _h.ul(
                      `${_h.bold('--help')} -- Displays this help and configuration options.`,
                      `${_h.bold('--check')} -- Displays a simple message to show that the API is running.`,
                      `${_h.bold('--histogram')} -- Displays a histogram of the last 600 measurements as well as some statistical information about how the API has been running.`,
                      `${_h.bold('--history')} -- Displays a table of the previous run intervals for the API Sandbox, including start time, end time, and duration.`
                    )
                ),
                _h.subhead('Description'),
                _h.inset(
                    _h.paragraph(`${scriptName} creates a macro that is shared with all players.  The title on the macro cycles through various images and data while the API is running.  It is intended that players or the GM can add the macro to their macro bar allowing them to keep an eye on whether the API is running.  Additionally, clicking the macro button with present data about the health of the API.`)
                ),
                ( playerIsGM(context.playerid)
                    ?  _h.group(
                            _h.subhead('Configuration'),
                            getAllConfigOptions()
                        )
                    : ''
                )
            ),
        helpConfig: (context) => _h.outer(
          _h.title(scriptName, version),
          ( playerIsGM(context.playerid)
            ?  _h.group(
              _h.subhead('Configuration'),
              getAllConfigOptions()
              )
            : ''
          )
        ),
        helpDoc: (context) => _h.join(
                _h.title(scriptName, version),
                helpParts.helpBody(context)
            ),

        helpChat: (context) => _h.outer(
                _h.title(scriptName, version),
                helpParts.helpBody(context)
            )
    };

  const showHelp = (playerid) => {
    let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
    let context = {
      who,
      playerid
    };
    sendChat('', '/w "'+who+'" '+ helpParts.helpChat(context));
  };

  const showConfigHelp = (playerid) => {
    let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
    let context = {
      who,
      playerid
    };
    sendChat('', '/w "'+who+'" '+ helpParts.helpConfig(context));
  };


    const handleInput = (msg) => {
      if ( "api" === msg.type && /^!api-heartbeat(\b\s|$)/i.test(msg.content) ) {
        let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
        let args = msg.content.split(/\s+--/).slice(1);

        if( ! playerIsGM(msg.playerid)){
          while(args.length){
            let cmds =args.shift().split(/\s+/);
            switch(cmds[0]){
              default:
              case 'check':
                sendCheck(who);
                break;

              case 'histogram':
                sendHistogram(who);
                break;

              case 'history':
                sendHistory(who);
                break;
            }
          }
          return;
        } else {

          if(0 === args.length) {
            showHelp(msg.playerid);
            return;
          }

          while(args.length){
            let cmds =args.shift().split(/\s+/);
            switch(cmds[0]) {
              case 'help':
                showHelp(msg.playerid);
                return;

              case 'check':
                sendCheck(who);
                break;

              case 'histogram':
                sendHistogram(who);
                break;

              case 'history':
                sendHistory(who);
                break;

              case 'dev':
                S().config.devMode = !S().config.devMode;
                clearInterval(beatInterval);
                beatInterval=false;
                startStopBeat();
                break;
            }
          }
        }
      } else if ( "api" === msg.type && /^!api-heartbeat-config(\b\s|$)/i.test(msg.content) && playerIsGM(msg.playerid)) {
        let args = msg.content.split(/\s+--/).slice(1);
        let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
        if(args.includes('--help')) {
          showHelp(msg.playerid);
          return;
        }
        if(!args.length) {
          showConfigHelp(msg.playerid);
          return;
        }

        args.forEach((a) => {
          let opt=a.split(/\|/);
          let omsg='';
          switch(opt.shift()) {

            case 'toggle-dev-mode':
              S().config.devMode=!S().config.devMode;
              clearInterval(beatInterval);
              beatInterval=false;
              startStopBeat();
              sendChat('','/w "'+who+'" '+
                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                getConfigOption_DevMode()+
                '</div>'
              );
              break;

            case 'toggle-show-latency':
              S().config.latency=!S().config.latency;
              sendChat('','/w "'+who+'" '+
                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                getConfigOption_ShowLatency()+
                '</div>'
              );
              break;

            case 'toggle-show-time':
              S().config.showTime=!S().config.showTime;
              sendChat('','/w "'+who+'" '+
                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                getConfigOption_ShowTime()+
                '</div>'
              );
              break;

          case 'set-hour-offset':
            if(parseFloat(opt[0])) {
              S().config.hourOffset=parseFloat(opt[0]);
            } else {
              omsg='<div><b>Error:</b> Not a valid Hour Offset: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_HourOffset()+
              '</div>'
            );
            break;

          case 'set-max-segments': {
              let maxSegs = parseInt(opt[0]);
              if(maxSegs>0){
                S().config.maxSegments=maxSegs;
              } else {
                if(Number.isNaN(maxSegs)){
                  omsg='<div><b>Error:</b> Not a valid Interval History Size: '+opt[0]+'</div>';
                } else {
                  omsg='<div><b>Error:</b> Interval History Size must be 1 or greater.</div>';
                }
              }
              sendChat('','/w "'+who+'" '+
                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                  omsg+
                  getConfigOption_MaxSegments()+
                '</div>'
              );
            }
            break;

            case 'set-spinner':
              if(SpinnerOptions.hasOwnProperty(opt[0])){
                S().config.spinner=opt[0];
              } else {
                omsg='<div><b>Error:</b> Not a valid Spinner Style: '+opt[0]+'</div>';
              }
              sendChat('','/w "'+who+'" '+
                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_SpinnerStyle()+
                '</div>'
              );
              break;
          }
        });
      }
    };

    const getCreator = ()=>findObjs({type:'player'}).reduce((m,p)=>(m.id<p.id) ? m : p);

    const getOrCreateMacro = ()=>{
      let m = getObj('macro',S().macroID);
      if(!m){
        let gm = getCreator();
        m = createObj('macro',{
          playerid: gm.id,
          name: "!-Ｘ-０００",
          action: "!api-heartbeat --histogram",
          visibleto: "all"
        });
        S().macroID = m.id;
      }
      return m;
    };



      const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:player:_online', startStopBeat);
      };

      on('ready',()=>{
        checkInstall();
        registerEventHandlers();
      });

      return {
      };

})();

{try{throw new Error('');}catch(e){API_Meta.APIHeartBeat.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.APIHeartBeat.offset);}}
