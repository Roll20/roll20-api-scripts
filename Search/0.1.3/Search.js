// Github:   https://github.com/shdwjk/Roll20API/blob/master/Search/Search.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.Search={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.Search.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const Search = (() => { //eslint-disable-line no-unused-vars

  const version = '0.1.3';
  const lastUpdate = 1679512696;
  API_Meta.Search.version = version;
  const schemaVersion = 0.1;

  // Minified Porter Stemmer from: http://tartarus.org/~martin/PorterStemmer/js.txt
  /* eslint-disable */
  const stemmer=function(){var e={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},i={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},t="[^aeiou]",s="[aeiouy]",a=t+"[^aeiouy]*",l=s+"[aeiou]*",n="^("+a+")?"+l+a,o="^("+a+")?"+l+a+"("+l+")?$",c="^("+a+")?"+l+a+l+a,r="^("+a+")?"+s;return function(t){var l,u,x,$,p,v,g;if(t.length<3)return t;if(x=t.substr(0,1),"y"==x&&(t=x.toUpperCase()+t.substr(1)),$=/^(.+?)(ss|i)es$/,p=/^(.+?)([^s])s$/,$.test(t)?t=t.replace($,"$1$2"):p.test(t)&&(t=t.replace(p,"$1$2")),$=/^(.+?)eed$/,p=/^(.+?)(ed|ing)$/,$.test(t)){var f=$.exec(t);$=new RegExp(n),$.test(f[1])&&($=/.$/,t=t.replace($,""))}else if(p.test(t)){var f=p.exec(t);l=f[1],p=new RegExp(r),p.test(l)&&(t=l,p=/(at|bl|iz)$/,v=new RegExp("([^aeiouylsz])\\1$"),g=new RegExp("^"+a+s+"[^aeiouwxy]$"),p.test(t)?t+="e":v.test(t)?($=/.$/,t=t.replace($,"")):g.test(t)&&(t+="e"))}if($=/^(.+?)y$/,$.test(t)){var f=$.exec(t);l=f[1],$=new RegExp(r),$.test(l)&&(t=l+"i")}if($=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,$.test(t)){var f=$.exec(t);l=f[1],u=f[2],$=new RegExp(n),$.test(l)&&(t=l+e[u])}if($=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,$.test(t)){var f=$.exec(t);l=f[1],u=f[2],$=new RegExp(n),$.test(l)&&(t=l+i[u])}if($=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,p=/^(.+?)(s|t)(ion)$/,$.test(t)){var f=$.exec(t);l=f[1],$=new RegExp(c),$.test(l)&&(t=l)}else if(p.test(t)){var f=p.exec(t);l=f[1]+f[2],p=new RegExp(c),p.test(l)&&(t=l)}if($=/^(.+?)e$/,$.test(t)){var f=$.exec(t);l=f[1],$=new RegExp(c),p=new RegExp(o),v=new RegExp("^"+a+s+"[^aeiouwxy]$"),($.test(l)||p.test(l)&&!v.test(l))&&(t=l)}return $=/ll$/,p=new RegExp(c),$.test(t)&&p.test(t)&&($=/.$/,t=t.replace($,"")),"y"==x&&(t=x.toLowerCase()+t.substr(1)),t}}();
  /* eslint-enable */

  // Stopwords list taken from http://www.ranks.nl/stopwords
  const stopwords = ['',"a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"];
    const stopStems = stopwords.map(stemmer);

  class Permissions{
    constructor() {
      this.values = new Uint32Array(1);
      this.all = false;
    }

    get(i) {
      let index = (i / 32) | 0;
      let bit = i % 32;
      return this.all || (this.values[index] & (1 << bit)) !== 0;
    }

    set(i) {
      if('all'===i){
        this.all=true;
      } else {
        let index = (i / 32) | 0;
        let bit = i % 32;
        if(this.values.length<(index+1)){
          let buf=new Uint32Array(Math.max(index+1,(this.values.length*2)||2));
          buf.set(this.values);
          this.values=buf;
        }
        this.values[index] |= 1 << bit;
      }
    }

    unset(i) {
      if('all'===i){
        this.all=false;
      } else {
        let index = (i / 32) | 0;
        let bit = i % 32;
        this.values[index] &= ~(1 << bit);
      }
    }
  }

  const tune = {
    k1 : 1.2, /* 1.2 to 2.0 :: lower is faster saturation */
    b : 0.3, /* 0 to 1 :: percentage normalized */
    delta : 0.1 /* a weighting to make documents with a match rank higher with ones that don't */
  };

  const role = Object.freeze({
      required: 1,
      normal: 0,
      prohibited: -1
    });

  const blankCorpus = ()=>({
      status: {
        ready: false,
        startBuild: 0,
        endBuild: 0
      },
      documents: {},
      fields: [],
      categories: [],
      terms: {},
      termInverseIndex: {},
      stats: {
        docs: 0,
        termCount: 0,
        avgTermCount: 0
      }
    });

  let corpus = blankCorpus();

  const tokenizer = (text) => {
    return (text||'').toLowerCase().replace(/<[^>]*>|\d+|&[a-zA-Z0-9#]*;/g,' ').trim().split(/[\W\s]+/)
      .map(stemmer)
      .filter((w)=>!stopStems.includes(w))
      ;
  };

  const isString = (s) => (typeof s === 'string' || s instanceof String);
  const isValidNumber = (n) => (typeof n === 'number' && !Number.isNaN(n));

  const valid = (entry) => {
    return isString(entry) || isValidNumber(entry);
  };

  const message = (msg, who='gm') => {
    sendChat('',`/w "${who}" <div style="border-radius:.2em;font-size: .6em; background-color:#eee;color:#333; font-weight: bold; text-align: center;border: 1px solid #333;">${msg}</div>`);
  };

  const termFreq = (terms) => {
    /*
    let countMap = terms.reduce((m,w)=>({...m,[w]:(m[w]||0)+1}),{});
    return Object.keys(countMap).reduce((m,w)=>({...m,[w]:{count:countMap[w],freq: countMap[w]/terms.length}}),{});
    */
    return _.mapObject(_.countBy(terms),(c)=>({
      count:c,
      freq:(c/terms.length)
    }));
  };

  const addDocument = (document) => {
    if( valid(document.id) && valid(document.category) && valid(document.field)){

      let doc={
        corpusid: `${document.category}|${document.id}|${document.field}${document.name?`|${document.name}`:''}`,
        id: document.id,
        category: document.category.toLowerCase(),
        field: document.field.toLowerCase(),
        parentid: document.parentid || '',
        name: document.name || '',
        permission: document.permission,
        //    body: document.text,
        tokens: tokenizer(document.text),
        terms: {}
      };
      doc.terms=termFreq(doc.tokens);

      // add document to corpus
      corpus.documents[doc.corpusid]=doc;
      corpus.stats.docs++;
      corpus.stats.termCount+=doc.tokens.length;
      corpus.stats.avgTermCount=corpus.stats.termCount/corpus.stats.docs;
      // record categories and fields
      corpus.categories.push(doc.category);
      corpus.fields.push(doc.field); 

      Object.keys(doc.terms).forEach(term=>{
        corpus.terms[term]=(corpus.terms[term]||{n:0,idf:0});
        corpus.terms[term].n++;
        corpus.termInverseIndex[term]=(corpus.termInverseIndex[term]||{});
        corpus.termInverseIndex[term][doc.corpusid]=doc;
      });
    } else {
      log(`Rejected document: [${document.id}][${document.category}][${document.field}]`);
    }
  };

  const updateIDF = () => {
    Object.keys(corpus.terms).forEach( term => {
      corpus.terms[term].idf=Math.max(Math.log10((corpus.stats.docs - corpus.terms[term].n + 0.5) / (corpus.terms[term].n+0.5)), 0.01);
    });
  };

  const rank = (term,stats,doc) => {
    return stats.idf * (
      (
        ( doc.terms[term].count * (tune.k1+1) ) 
        /
        ( doc.terms[term].count + ( tune.k1 * (1-tune.b + (tune.b * doc.tokens.length / corpus.stats.avgTermCount))))
      ) + tune.delta
    );
  };

  const search = (operations) => {
    const requiredTermMap={};
    const player=operations.player;
    const isGM=operations.isGM;
    let terms = Object.keys(operations).reduce((m,key) => {
        switch(key){
          case 'terms':
            _.each(operations[key],(obj,term)=>{
              m[term]=(m[term]||{categories:[],categoryfields:[],fields:[],global:false});
              m[term].global=true;
              if(obj.role===role.required){
                requiredTermMap['*']=_.union(requiredTermMap['*']||[],[term]);
              }
            });
            break;

          case 'categories':
            _.each(operations[key], (catData,category)=>{
              _.each(catData.terms,(obj,term)=>{
                m[term]=(m[term]||{categories:[],categoryfields:[],fields:[],global:false});
                m[term].categories.push(category);
                if(obj.role===role.required){
                  requiredTermMap[`C:${category}`]=_.union(requiredTermMap[`C:${category}`]||[],[term]);
                }
              });
              _.each(catData.fields,(fieldData,field)=>{
                _.each(fieldData.terms,(obj,term)=>{
                  m[term]=(m[term]||{categories:[],categoryfields:[],fields:[],global:false});
                  m[term].categoryfields.push(`${category}.${field}`);
                  if(obj.role===role.required){
                    requiredTermMap[`${category}.${field}`]=_.union(requiredTermMap[`${category}.${field}`]||[],[term]);
                  }
                });
              });
            });
            break;

          case 'fields':
            _.each(operations[key],(fieldData,field)=>{
              _.each(fieldData.terms,(obj,term)=>{
                m[term]=(m[term]||{categories:[],categoryfields:[],fields:[],global:false});
                m[term].fields.push(field);
                if(obj.role===role.required){
                  requiredTermMap[`F:${field}`]=_.union(requiredTermMap[`F:${field}`]||[],[term]);
                }
              });
            });
            break;
        }
        return m;
      },{});

    return _.chain(_.keys(terms))
      .reduce((fullSearchResults,currentTerm)=>{
        if(_.has(corpus.terms,currentTerm)){
          let stats = corpus.terms[currentTerm],
            docs = corpus.termInverseIndex[currentTerm];


          fullSearchResults=_.reduce(docs,(docSearchResults,doc)=>{
            let
            oid=doc.parentid||doc.id,
              field=doc.field,
              score=rank(currentTerm,stats,doc),
              opts={
                role: role.normal,
                weight: 1
              };

            if(!isGM && !doc.permission.get(player)){
              return docSearchResults; // early out for permission
            }


            // find most specific applicable search case.
            if(_.contains(terms[currentTerm].categoryfields,`${doc.category}.${doc.field}`)){
              opts.weight = (
                operations.categories[doc.category].fields[doc.field].terms[currentTerm].weight *
                operations.categories[doc.category].fields[doc.field].weight *
                operations.categories[doc.category].weight *
                opts.weight 
              );
              opts.role = (
                operations.categories[doc.category].fields[doc.field].terms[currentTerm].role ||
                operations.categories[doc.category].fields[doc.field].role || 
                operations.categories[doc.category].role ||
                opts.role
              );
            } else if( _.contains(terms[currentTerm].fields,doc.field)){
              opts.weight = (
                operations.fields[doc.field].terms[currentTerm].weight *
                operations.fields[doc.field].weight *
                opts.weight 
              );
              opts.role = (
                operations.fields[doc.field].terms[currentTerm].role ||
                operations.fields[doc.field].role || 
                opts.role
              );
            } else if( _.contains(terms[currentTerm].categories,doc.category)){
              opts.weight = (
                operations.categories[doc.category].terms[currentTerm].weight *
                operations.categories[doc.category].weight *
                opts.weight 
              );
              opts.role = (
                operations.categories[doc.category].terms[currentTerm].role ||
                operations.categories[doc.category].role ||
                opts.role
              );
            } else if( terms[currentTerm].global ){
              opts.weight = (
                operations.terms[currentTerm].weight *
                opts.weight 
              );
              opts.role = (
                operations.terms[currentTerm].role ||
                opts.role
              );
            } else {
              return docSearchResults; // early out for skipped
            }


            docSearchResults[oid]=(docSearchResults[oid]||{id:oid, category: doc.category, total: 0, termScores: {}, termCounts: {}, fieldScores:{},fieldCounts:{},reject:false,required:{}});

            _.each(['*',`${doc.category}.${doc.field}`,`C:${doc.category}`,`F:${doc.field}`],(rule)=>{
              if(_.has(requiredTermMap,rule)){
                docSearchResults[oid].required[rule]=(docSearchResults[oid].required[rule]||{});
                _.each(requiredTermMap[rule],(v)=>{
                  docSearchResults[oid].required[rule][v]=(
                    docSearchResults[oid].required[rule][v] || v===currentTerm
                  );
                });
              }
            });

            score*=opts.weight;

            docSearchResults[oid].reject = (opts.role===role.prohibited) || docSearchResults[oid].reject;
            docSearchResults[oid].fieldScores[field]=(docSearchResults[oid].fieldScores[field]||0)+score;
            docSearchResults[oid].fieldCounts[field]=(docSearchResults[oid].fieldCounts[field]||0)+1;
            docSearchResults[oid].termScores[currentTerm]=(docSearchResults[oid].termScores[currentTerm]||0)+score;
            docSearchResults[oid].termCounts[currentTerm]=(docSearchResults[oid].termCounts[currentTerm]||0)+1;
            docSearchResults[oid].total+=score;
            return docSearchResults;
          },fullSearchResults);
        }
        return fullSearchResults;
      },{})
      .filter((d)=>{
        return !d.reject && _.reduce(d.required,(m,v)=>m&&_.reduce(v,(m2,v2)=>m2&&v2,true),true);
      })
      .sortBy((o)=>-o.total)
      .value()
    ;
  };

  const buildOperations = (options) => {
    let tokenList = options.replace(/\s*:\s*/g,':').replace(/([()])/g,' $1 ').trim().split(/\s+/);
    const regex={
      open:     /^\($/,
      close:    /^\)$/,
      oncat:    /^on:([+\-*~]?)([a-zA-Z0-9]+)(?:\^(-?[\d.]*))?$/,
      infield:  /^in:([+\-*~]?)([a-zA-Z0-9]+)(?:\^(-?[\d.]*))?$/,
      term:     /^([+\-*~]?)([a-zA-Z0-9]+)(?:\^(-?[\d.]*))?$/
    },
      permitted = {
        'all':     ['oncat','infield','term'],
        'oncat':   ['infield','term','open','close'],
        'infield': ['term','open','close']
      };
    let modeStack = ['all'];
    let onCategory = false;
    let inField = false;
    let tokenCount = 0;

    let parsed = {
      terms: {},
      categories: {},
      fields: {},
      mesgs: [],
      errors: 0
    };

    tokenList.forEach((tok)=>{
      let type;
      let match;
      let mode=modeStack[modeStack.length-1].split(/:/)[0];
      const matchers = (Object.prototype.hasOwnProperty.call(permitted,mode) ? _.pick(regex,permitted[mode]) : regex);

      ++tokenCount;

      if(_.some(matchers,(r,l)=>{
        type=l;
        return match=r.exec(tok);
      })){
        switch(type){
          case 'open':
            if(modeStack.length>1){ // only enter parenthesis if we aren't in the all mode
              switch(modeStack[modeStack.length-1]){
                case 'oncat':
                case 'infield': {
                  let baseMode = modeStack.pop();
                  modeStack.push(`${baseMode}:open`);
                }
                  break;

                default:
                  ++parsed.errors;
                  parsed.mesgs.push(`Error: Token ${tokenCount}: Misplaced "${tok}" -- already inside a parenthetical block.`);
                  break;
              }
            } 
            break;

          case 'close':
            switch(modeStack[modeStack.length-1]){
              case 'infield:open':
                inField=false;
                modeStack.pop();
                if('oncat'!==modeStack[modeStack.length-1]){
                  break;
                }
                /* eslint-disable: no-fallthrough */
              case 'oncat:open':
                /* eslint-enable: no-fallthrough */
                onCategory=false;
                modeStack.pop();
                break;

              default:
                ++parsed.errors;
                parsed.mesgs.push(`Error: Token ${tokenCount}: Misplaced "${tok}" -- not inside a parenthetical block.`);
                break;
            }
            break;

          case 'oncat': {
            let categoryName=match[2].toLowerCase();

            if(_.contains(corpus.categories,categoryName)){
              onCategory=categoryName;

              let operation = match[1],
                weight = parseFloat(match[3])||1,
                catObj = (parsed.categories[categoryName]||{
                  name:categoryName,
                  role: role.normal,
                  weight:weight,
                  fields:{},
                  terms:{}
                });

              switch(operation){
                case '*': catObj.role   = role.required; break;
                case '~': catObj.role   = role.prohibited; break;
                case '-': catObj.weight = Math.abs(catObj.weight)*(-1); break;
                case '+': catObj.weight = Math.abs(catObj.weight)*(2); break;
              }

              parsed.categories[categoryName]=catObj;

              modeStack.push(type);
            } else {
              ++parsed.errors;
              parsed.mesgs.push(`Error: Token ${tokenCount}: Invalid category "${tok}" -- Available categories are: ${corpus.categories.join(', ')}`);
            }
          }
            break;

          case 'infield': {
            let fieldName=match[2].toLowerCase();

            if(_.contains(corpus.fields,fieldName)){
              inField=fieldName;

              let operation = match[1],
                weight = parseFloat(match[3])||1,
                fieldObj = ((onCategory ? parsed.categories[onCategory].fields : parsed.fields)[fieldName]||{
                  name:fieldName,
                  role: role.normal,
                  weight:weight,
                  terms:{}
                });

              switch(operation){
                case '*': fieldObj.role   = role.required; break;
                case '~': fieldObj.role   = role.prohibited; break;
                case '-': fieldObj.weight = Math.abs(fieldObj.weight)*(-1); break;
                case '+': fieldObj.weight = Math.abs(fieldObj.weight)*(2); break;
              }

              (onCategory ? parsed.categories[onCategory].fields : parsed.fields)[fieldName] = fieldObj;

              modeStack.push(type);
            } else {
              ++parsed.errors;
              parsed.mesgs.push(`Error: Token ${tokenCount}: Invalid field "${tok}" -- Available fields are: ${corpus.fields.join(', ')}`);
            }
          }

            break;

          case 'term': {
            let operation = match[1],
            termOrig = match[2],
            term = tokenizer(match[2]),
            weight = parseFloat(match[3])||1;
            if(term.length){
              let termObj={
                orig: termOrig,
                term: term[0],
                role: role.normal,
                weight: weight
              };
              switch(operation){
                case '*': termObj.role   = role.required; break;
                case '~': termObj.role   = role.prohibited; break;
                case '-': termObj.weight = Math.abs(termObj.weight)*(-1); break;
                case '+': termObj.weight = Math.abs(termObj.weight)*(2); break;
              }

              if(onCategory){
                if(inField){
                  parsed.categories[onCategory].fields[inField].terms[termObj.term]=termObj;
                } else {
                  parsed.categories[onCategory].terms[termObj.term]=termObj;
                }
              } else if(inField){
                parsed.fields[inField].terms[termObj.term]=termObj;
              } else {
                parsed.terms[termObj.term]=termObj;
              }

              switch(modeStack[modeStack.length-1]){
                case 'infield':
                  inField=false;
                  modeStack.pop();
                  if('oncat'!==modeStack[modeStack.length-1]){
                    break;
                  }
                  /* eslint-disable: no-fallthrough */
                case 'oncat':
                  /* eslint-enable: no-fallthrough */
                  onCategory=false;
                  modeStack.pop();
                  break;
              }

            } else {
              parsed.mesgs.push(`Notice: Token ${tokenCount}: Rejected stop word: "${tok}" -- stop words are not indexed.`);
            }
          }
            break;
        }
      } else {
        ++parsed.errors;
        parsed.mesgs.push(`Error: Token ${tokenCount}: Misplaced or incorrectly formatted item "${tok}"`);
      }

    });
    ++tokenCount;

    if(modeStack.length>1){
      ++parsed.errors;
      parsed.mesgs.push(`Error: Token ${tokenCount}: Unfinished command -- close all parenthsis and supply terms and fields where needed.`);
    }

    return parsed;
  };

  const getA = (obj,attr) => {
    return new Promise((resolve)=>{
      switch(obj.get('type')){
        case 'character':
          if(_.contains(['bio','gmnotes'],attr)){
            obj.get(attr,(value)=>{
              resolve(value);
            });
          } else {
            resolve(obj.get(attr));
          }
          break;
        case 'handout':
          if(_.contains(['notes','gmnotes'],attr)){
            obj.get(attr,(value)=>{
              resolve(value);
            });
          } else {
            resolve(obj.get(attr));
          }
          break;
        default:
          resolve(obj.get(attr));
          break;
      }
    });
  };

  const getPlayerBit = (() => {
    let players=[];
    return (playerid) => {
      if('all'===playerid){
        return 'all';
      }
      let idx=players.indexOf(playerid);
      if(idx>-1){
        return idx;
      }
      players.push(playerid);
      return players.length-1;
    };
  })();

  const getPermissions = (ids) => {
    let p=new Permissions();
    if(_.contains(ids,'all')){
      p.set('all');
      return p;
    }
    _.each(ids,(id)=>p.set(getPlayerBit(id)));
    return p;
  };

  const loadCorpus = () => {
    // find all the docs of interest
    corpus=blankCorpus();

    let docs=[
      ...findObjs({type: 'handout'}),
      ...findObjs({type: 'character'}),
      ...findObjs({type: 'attribute'})
    ];

    let permissionLookup = {};
    let count = 0;
    let total = docs.length;

    const loadDocument = async () => {
        if(docs.length){
          let doc = docs.shift();
          switch(doc.get('type')){
            case 'handout': 
              permissionLookup[doc.id]=getPermissions(_.union(doc.get('inplayerjournals').split(/,/),doc.get('controlledby').split(/,/)));

              ['name','notes','gmnotes'].forEach(async (attr)=>{
                let text = await getA(doc,attr);
                addDocument({
                  id: doc.id,
                  category: 'handout',
                  field: attr,
                  permission: ('gmnotes' !==attr ? permissionLookup[doc.id] : new Permissions()),
                  text: text 
                });
              });
              break;

            case 'character':
              permissionLookup[`${doc.id}|view`]=getPermissions(doc.get('inplayerjournals').split(/,/));
              permissionLookup[`${doc.id}|full`]=getPermissions(doc.get('controlledby').split(/,/));

              _.each(['name','bio','gmnotes'],async (attr)=>{
                let text = await getA(doc,attr);
                addDocument({
                  id: doc.id,
                  category: 'character',
                  field: attr,
                  permission: ('gmnotes' !==attr ? permissionLookup[`${doc.id}|view`] : new Permissions()),
                  text: text 
                });
              });
              break;

            case 'attribute': {
              let perm = permissionLookup[`${doc.get('characterid')}|full`];

              _.each(['name','current','max'],async (attr)=>{
                let text = await getA(doc,attr);
                addDocument({
                  id: doc.id,
                  category: 'character',
                  field: 'attribute',
                  parentid: doc.get('characterid'),
                  permission: perm,
                  name: attr,
                  text: `${text}`
                });
              });
            }
              break;
          }
          ++count;
          if(count && !(count%1000)){
            log(`Load Corpus: ${count}/${total}... (${((_.now()-corpus.status.startBuild)/1000).toFixed(2)} seconds)`);
          }
          setTimeout(loadDocument,1);
        } else {
          log(`Load Corpus: ${count}/${total}... (${((_.now()-corpus.status.startBuild)/1000).toFixed(2)} seconds)`);
          log(`Updating IDF values for ${_.keys(corpus.terms).length} terms.`);
          updateIDF();
          corpus.status.endBuild=_.now();
          corpus.status.ready=true;
          log(`Corpus ready after ${((corpus.status.endBuild-corpus.status.startBuild)/1000).toFixed(2)} seconds.`);

          message(`Search Indexing Finished. (${((corpus.status.endBuild-corpus.status.startBuild)/1000).toFixed(2)}s)`);
        }
      };

    corpus.status.startBuild=_.now();
    log(`Load Corpus: ${count}/${total}...`);
    setTimeout(loadDocument,1);
  };

  const checkInstall = () => {
    log('-=> Search v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

    if( ! Object.prototype.hasOwnProperty.call(state,'Search') || state.Search.version !== schemaVersion) {
      log('  > Updating Schema to v'+schemaVersion+' <');
      state.Search = {
        version: schemaVersion
      };
    }

    loadCorpus();
  };

  const ch = (c) => {
    let entities = {
      '<' : 'lt',
      '>' : 'gt',
      "'" : '#39',
      '*' : '#42',
      '@' : '#64',
      '{' : '#123',
      '|' : '#124',
      '}' : '#125',
      '[' : '#91',
      ']' : '#93',
      '"' : 'quot',
      '-' : 'mdash',
      ' ' : 'nbsp'
    };

    if(_.has(entities,c) ){
      return ('&'+entities[c]+';');
    }
    return '';
  };

  const showHelp = (who) => {

    sendChat('',`/w "${who}" `+
`<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">`+
      `<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">`+
      `Search v`+version+
      `</div>`+
      `<div style="padding-left:10px;margin-bottom:3px;">`+
      `<p>Search provides full text searching across handouts and characters (including`+
      `attributes). Search uses an Okapi BM25F+ search engine with Porter stemming and`+
      `stop word removal to provide fast results after building initial indexes. Index`+
      `construction occurs at API startup, in the background. The GM is notified when`+
      `indexing is finished. Indexing can take a few minutes, but won't slow down any`+
      `other processes due to a great deal of deferring of processing.</p>`+

      `<p>Search respects permissions on handouts and characters. GMs can search on all`+
      `things, where as players can only search based on what they can see. Seeing a`+
      `handout allows a player to search on it's name and notes fields. Seeing a`+
      `character allows a player to search on it's name and bio fields. Controlling a`+
      `character allows searching on it's attributes as well. Only GMs can search on`+
      `gmnotes.</p>`+
      `</div>`+
      `<b>Commands</b>`+
      `<div style="padding-left:10px;">`+
      `<b><span style="font-family: serif;">!search [--help]|--reindex|${ch('<')}query${ch('>')}</span></b>`+
      `<div style="padding-left: 10px;padding-right:20px">`+
      `<p>Provides the search interface, or this help.</p>`+
      `<ul>`+
      `<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">`+
      `<b><span style="font-family: serif;">--help</span></b> ${ch('-')} Shows the Help screen.`+
      `</li> `+
      `<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">`+
      `<b><span style="font-family: serif;">--reindex</span></b> `+
      `${ch('-')}  Rebuilds the search index. This can take a `+
      `minute or two and is only necessary when you've made changes `+
      `(like permissions) (GM Only).`+
      `</li> `+
      `<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">`+
      `<b><span style="font-family: serif;">${ch('<')}query${ch('>')}</span></b> ${ch('-')} a `+
      ` collection of terms and modifiers to define what is important. See Search Query below for full details.`+
      `</li> `+
      `</ul>`+
      `</div>`+
      `</div>`+
      `<b>Search Query</b>`+
      `<div style="padding-left:10px;">`+
      `At it's simplest, a Search Query is just a list of words you're interested in:`+
      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search sun blade`+
      `</pre>`+
      `</div>`+

      `<b>Terms</b>`+
      `<div style="padding-left:10px;">`+

      `<p>There are 6 basic ways to enter terms:</p>`+
      `<ol>`+
      `<li><code>term</code> -- Just a bare word will rank as normal.</li>`+
      `<li><code>+term</code> -- Prepending with + marks a word as important, and it will be weighted double.</li>`+
      `<li><code>-term</code> -- Prepending with - marks a word as detracting, and it's weight will be subtracted, lowering the document's score.</li>`+
      `<li><code>${ch('*')}term</code> -- Prepending with ${ch('*')} marks a word as required, and a document will be rejected if it doesn't have a match.</li>`+
      `<li><code>~term</code> -- Prepending with ~ marks a word as prohibited, and a document with a match will be rejected.</li>`+
      `<li><code>term^N</code> -- Appending a ^ with a number will multiply the weight of a term by that number. Numbers can be proceeded by a - to make the term detract, and may have a decimal place. The leading zero may be omitted.</li>`+
      `</ol>`+
      `<p>Here is an example using each modifier:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search knight ${ch('*')}king ~queen +prince -princess chamberlain^1.1 maid^-.3`+
      `</pre>`+
      `<p>This will search for knight, require a match for king, reject any document that matches queen, reduce the score of for matching princess, rank chamberlain 1.1 times higher than normal and reduce the score for matching maid at about 1/3 the weight.</p>`+

      `<p>Prepended modifiers can also be combine with direct weighting:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search ${ch('*')}king^.5 throne`+
      `</pre>`+
      `<p>Must match king, but at half it's relative weight. throne is weighted normally.</p>`+
      `</div>`+

      `<b>Fields</b>`+
      `<div style="padding-left:10px;">`+

      `<p>You can specify search terms to apply only to a specific field using the in:<field> syntax:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search in:bio parents`+
      `</pre>`+
      `<p>Searches for parents in just the bio field.</p>`+

      `<p>The in:<field> syntax only applies to the next term listed.</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search in:bio parents dragon`+
      `</pre>`+
      `<p>Searches for parents in jut the bio field, and dragon in any field.</p>`+

      `<p>If you want to search for multiple terms in a field, you can surround them in parenthsis:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search in:bio ( parents siblings brother sister )`+
      `</pre>`+
      `<p>Search for parents, siblings, brother, and sister in the bio field.</p>`+

      `<p>Anywhere you place terms, you can apply modifiers:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search in:bio ( parents siblings +brother sister^3 )`+
      `</pre>`+
      `<p>Additionally, you can apply the same modifiers to the field name to apply them to all the specified terms:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search in:bio^2 ( brother sister ) dragon`+
      `</pre>`+
      `<p>Both sister and brother in the bio field are weighted double what dragon is in all fields.</p>`+

      `<p>You can specify different weighting for terms in a field and out of it:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search in:bio ( +dragon ) dragon`+
      `</pre>`+
      `<p>the most spcific rule is applied. dragon in bio will be ranked double what dragon elsewhere is.</p>`+

      `<p>If you modify the field and the term, they are combined in the ways you would expected:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search in:+bio ( +dragon wyvern ) dragon wyvern`+
      `</pre>`+
      `<p>dragon in bio is x4, wyvern in bio is x2, dragon and wyvern elsewhere are normally weighted.</p>`+
      `</div>`+

      `<b>Categories</b>`+
      `<div style="padding-left:10px;">`+

      `<p>You can specify search terms to apply only to a specific category using the on:<category> syntax:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search on:handout gemstone`+
      `</pre>`+
      `<p>Search for gemstone in all fields of handouts.</p>`+

      `<p>Just like with in:<field>, you can use parenthesis to group terms:</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search on:character( knight paladin )`+
      `</pre>`+
      `<p>Search for knight and paladin in all fields of characters.</p>`+

      `<p>Also like fields, the category can be modified just like terms and passes the modifications down the same way.</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search on:character^1.2( knight paladin ) knight paladin`+
      `</pre>`+
      `<p>knight and paladin are ranked x1.2 when on a character.</p>`+

      `<p>You can nest in:<field> rules in on:<category> rules.</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search on:character^1.3( in:name +dragon dragon ) dragon`+
      `</pre>`+
      `<p>dragon in character name is worth x2.6, elsewhere on character is worth x1.2, and anywhere else is worth normal.</p>`+

      `<p>You can get as complicated as you like with this.</p>`+

      `<pre style="white-space:normal;word-break:normal;word-wrap:normal;">`+
      `!search on:character( in:name( dragon -wyvern ~snake) +snake in:gmnotes^3 secret ) on:handout( ${ch('*')}treasure ${ch('*')}gold )`+
      `</pre>`+
      `<p>Search for characters with dragon, preverably not wyvern, and flat out not metion of snake in the name, but rank higher for snake elsewhere and secret in gmnotes is x3. Also include any handouts that mention both treasure and gold.</p>`+
      `</div>`+

      `<b>Results</b>`+
      `<div style="padding-left:10px;">`+

      `<p>The results are sorted based on the combination of the weights of all the terms they matched, then the top 30 are whispered to the user in the chat.</p>`+

      `<p>Each result row contains a circle with an H for handout or C for character, followed by the name of the matching document with the folder it is in in smaller lettering above it. The name of the document is a link that will open it. At the top right is the total score for the document. Along the bottom of each row are the terms the document matched, with the number of unique fields it matched in, followed by the portion of the score it contributed. This is followed by a list of fields with the number of unique terms matched and the contribution to the score. Looking at these details can help you fine tune your search.</p>`+
      `</div>`+
`</div>`
    );
  };

  const buildLookup = (data) => {
    const dataTree=JSON.parse(data||'{}'),
      pathSep=' > ';

    let lookup = {};

    const treeBuilder=(obj,path)=>{
      _.each(obj,(n)=>{
        if(_.isString(n)){
          lookup[n]=path.join(pathSep);
        } else {
          path.push(n.n);
          treeBuilder(n.i,path);
          path.pop();
        }
      });
    };

    treeBuilder(dataTree,[]);

    return lookup;
  };

  const formatResults = (results,context) => {

    const styles={
      common: {
        'border'        : '1px solid black',
        'border-radius' : '1em',
        'display'       : 'inline-block',
        'color'         : 'white',
        'font-weight'   : 'bold',
        'padding'       : '.1em .2em',
        'min-width'     : '1em'
      },
      commonSpot: {
        'margin-right'  : '.3em',
        'float'         : 'left',
        'text-align'    : 'center'
      },
      hSpot: {
        'background-color':'#ffa500'
      },
      cSpot: {
        'background-color':'#008000'
      },
      score: {
        'border'        : '1px solid black',
        'border-bottom-left-radius' : '1em',
        'display'       : 'inline-block',
        'color'         : 'white',
        'font-weight'   : 'bold',
        'padding'       : '.1em .1em .1em 1em',
        'background-color' : '#808080',
        'float'            : 'right'
      },
      dir: {
        'font-size': '.7em',
        'line-height': '1.1em',
        'margin-top' : '.1em',
        'font-family': 'sans-serif'
      },
      link: {
        'text-decoration': 'underline',
        'color':'#0000a0'
      },
      record: {
        'border': '1px solid #888',
        'border-radius': '.2em',
        'background-color': '#fefcff',
        'margin-bottom': '1px'
      },
      termFieldScore: {
        'font-size'     : '.7em',
        'line-height'   : '1em',
        'margin-right'  : '.1em',
        'font-family'   : 'sans-serif',
        'border'        : '1px solid #333',
        'border-radius' : '.1em .5em .5em .1em',
        'display'       : 'inline-block',
        'color'         : '#333',
        'font-weight'   : 'bold',
        'padding'       : '.1em .5em .05em .1em',
        'float'         : 'left',
        'white-space'   : 'nowrap'
      },
      term: {
        'background-color': '#e9cfec'
      },
      field: {
        'background-color': '#ebdde2'
      }
    },
      s=(st)=>_.map(st,(v,k)=>`${k}:${v};`).join('');

    return _.chain(results)
      .map((o)=>({
        obj: getObj(o.category,o.id),
        res: o
      }))
      .reject((o)=>_.isUndefined(o.obj))
      .first(context.limit)
      .map((o)=>{
        let spot = {
          h: `<span style="${s(styles.common)}${s(styles.commonSpot)}${s(styles.hSpot)}">H</span>`,
          c: `<span style="${s(styles.common)}${s(styles.commonSpot)}${s(styles.cSpot)}">C</span>`
        }[o.res.category.charAt(0)],
          score = `<span style="${s(styles.score)}">${o.res.total.toFixed(3)}</span>`,
          terms=_.reduce(o.res.termCounts,(m,c,t)=>{
            m.push(`<span style="${s(styles.termFieldScore)}${s(styles.term)}">${t}(${c}): ${o.res.termScores[t].toFixed(3)}</span>`);
            return m;
          },[]).join(''),
          fields=_.reduce(o.res.fieldCounts,(m,c,t)=>{
            m.push(`<span style="${s(styles.termFieldScore)}${s(styles.field)}">${t}(${c}): ${o.res.fieldScores[t].toFixed(3)}</span>`);
            return m;
          },[]).join('')
        ;

        return `<div style="${s(styles.record)}">`+
          `${spot}${score}`+
          `<div style="${s(styles.dir)}">${context.folders[o.obj.id]}</div>`+
          `<a style="${s(styles.link)}" href="http://journal.roll20.net/${o.res.category}/${o.res.id}">${o.obj.get('name')}</a>`+
          `<div style="clear:both;"></div>`+
          `${terms}${fields}`+
          `<div style="clear:both;"></div>`+
          `</div>`;
      })
      .value()
    ;
  };

  const handleInput = (msg) => {
    if('api'!==msg.type || !/^!search(\b\s|$)/i.test(msg.content)){
      return;
    }

    const who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

    let args = msg.content.split(/\s+/).slice(1);
    if(0===args.length || args.includes('--help')){
      showHelp(who);
      return;
    }

    if(args.includes('--reindex')){
      if(playerIsGM(msg.playerid)){
        if(corpus.status.ready){
          loadCorpus();
          message('Rebuilding Search Index.',who);
        } else {
          message('Search Index is already in the process of rebuilding.',who);
        }
      } else {
        message('Only GMs may Rebuild the Search Index.',who);
      }
      return;
    }

    if(corpus.status.ready){
      let parsed=buildOperations(args.join(' '));

      if(parsed.mesgs.length){
        if(parsed.errors){
          parsed.mesgs.push('Please correct the above Errors and resubmit your command.');
        }
        message(parsed.mesgs.join('<br>'),who);
      }

      if(parsed.errors){
        return;
      }

      parsed.isGM=playerIsGM(msg.playerid);
      parsed.player=getPlayerBit(msg.playerid);
      let locationLookup=buildLookup(Campaign().get('journalfolder'));

      let res = search(parsed);
      let context={
        limit: 30,
        folders: locationLookup
      };
      let formattedResults=formatResults(res,context);
      sendChat('Search',`/w "${who}" <div><div>Showing ${formattedResults.length}/${res.length} results.</div><div>${formattedResults.join('')}</div></div>`);
    } else {
      message('Search Index is still being built.  Please wait a few minutes and try again.',who);
    }
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
  };


  on('ready',() => {
    checkInstall();
    registerEventHandlers();
  });


  return {};

})();

{try{throw new Error('');}catch(e){API_Meta.Search.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.Search.offset);}}
