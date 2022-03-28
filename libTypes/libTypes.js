// Github:   https://github.com/shdwjk/Roll20API/blob/master/libTypes/libTypes.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.libTypes={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.libTypes.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const libTypes = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'libTypes';
  const version = '0.1.0';
  API_Meta.libTypes.version = version;
  const lastUpdate = 1623212510;
  const schemaVersion = 0.1;

  const checkInstall = () =>  {
    log(`-=> ${scriptName} v${version} <=-  [${new Date(lastUpdate*1000)}]`);

    if( ! state.hasOwnProperty(scriptName) || state[scriptName].version !== schemaVersion) { //eslint-disable-line no-prototype-builtins
      log(`  > Updating Schema to v${schemaVersion} <`);
      switch(state[scriptName] && state[scriptName].version) {

        case 0.1:
          /* break; // intentional dropthrough */ /* falls through */

        case 'UpdateSchemaVersion':
          state[scriptName].version = schemaVersion;
          break;

        default:
          state[scriptName] = {
            version: schemaVersion
          };
          break;
      }
    }
  };

  //////////////////////////////////////////////////
  // Begin classes
  //////////////////////////////////////////////////

  class Rect {
    static Roll20Type(o) {
      const validTypes = ['page','path','text','graphic'];
      if('function' === typeof o.get){
        let t = o.get('type');
        if(validTypes.includes(t)){
          return t;
        }
      }
    }


    static fromRoll20(roll20Obj){
      switch(Rect.Roll20Type(roll20Obj)){
        case 'page':
          return Rect.fromPage(roll20Obj);
        case 'graphic':
          return Rect.fromGraphic(roll20Obj);
        case 'path':
          return Rect.fromPath(roll20Obj);
        case 'text':
          return Rect.fromText(roll20Obj);
        default:
          return new Rect(-1,-1,-1,-1);
      }
    }

    static fromPage(roll20Page){
      let w = roll20Page.get('width')*70;
      let h = roll20Page.get('height')*70;
      return new Rect(w/2,h/2,w,h);
    }

    static fromGraphic(roll20Graphic){
      let w;
      let h;
      let r = (((parseFloat(roll20Graphic.get('rotation'))%180)+180)%180);
      switch(r){
        case 0:
          w = roll20Graphic.get('width');
          h = roll20Graphic.get('height');
          break;

        case 90:
          w = roll20Graphic.get('height');
          h = roll20Graphic.get('width');
          break;

        default: {
          let ow;
          let oh;
          let rr;
          if(r<90){
            rr = r*Math.PI/180;
            ow = parseFloat(roll20Graphic.get('width'));
            oh = parseFloat(roll20Graphic.get('height'));
          } else {
            rr = (r-90)*Math.PI/180;
            ow = parseFloat(roll20Graphic.get('height'));
            oh = parseFloat(roll20Graphic.get('width'));
          }
          let sine = Math.sin(rr);
          let cosine = Math.cos(rr);
          w = Math.ceil(( ow * cosine ) + ( oh * sine   ));
          h = Math.ceil(( ow * sine   ) + ( oh * cosine ));
        }
        break;
      }
      return new Rect(roll20Graphic.get('left'),roll20Graphic.get('top'),w,h);
    }

    static fromPath(roll20Path){
      // TODO: make this path specific, like breaking up paths to segments
      return Rect.fromGraphic(roll20Path);
    }

    static fromText(roll20Text){
      // TODO: make this text specific, like dealing with 0 width/height
      return Rect.fromGraphic(roll20Text);
    }

    static get ABOVE(){
      return 1;
    }

    static get THRU(){
      return 0;
    }

    static get BELOW(){
      return -1;
    }

    #x = 0
    #y = 0
    #halfWidth = 0
    #halfHeight = 0

    // AABB centered on (x,y)
    constructor(x,y,width,height){
      this.#x = x;
      this.#y = y;
      this.#halfWidth = width/2;
      this.#halfHeight = height/2;
    }


    get x() {
      return this.#x;
    }
    get y() {
      return this.#y;
    }
    get halfWidth() {
      return this.#halfWidth;
    }
    get halfHeight() {
      return this.#halfHeight;
    }
    get width() {
      return 2*this.#halfWidth;
    }
    get height() {
      return 2*this.#halfHeight;
    }

    intersectY(y) {
      let aboveMin = (y >= this.#y-this.#halfHeight);
      let belowMax = (y <= this.#y+this.#halfHeight);

      if(aboveMin && belowMax) {
        return Rect.THRU;
      } 
      if(aboveMin) {
        return Rect.ABOVE;
      }
      return Rect.BELOW;
    }

    intersectX(x) {
      let aboveMin = (x >= this.#x-this.#halfWidth);
      let belowMax = (x <= this.#x+this.#halfWidth);

      if(aboveMin && belowMax) {
        return Rect.THRU;
      } 
      if(aboveMin) {
        return Rect.ABOVE;
      }
      return Rect.BELOW;
    }

    contains(x,y) {
      return (Rect.THRU === this.intersectX(x)) && (Rect.THRU === this.intersectY(y)); 
    }

    toString() {
      return `(${this.#x},${this.#y})[${this.width},${this.height}]`;
    }

    toObject() {
      return {
        x:this.x,
        y:this.y,
        width:this.width,
        height:this.height
      };
    }

    toJSON() {
      return JSON.stringify(this.toObject());
    }
  }

  class Quadtree {

    ////////////////////////////////////////////////////////////////////////////////
    // Public Interface
    ////////////////////////////////////////////////////////////////////////////////

    constructor(/*Rect*/ rect, config = {}) {
      this.#id = Quadtree._QID();
      this.#bounds = rect;
      this.#config = {
        ...this.#config,
        ...config
      };
    }

    insert(/*Rect*/ rect, context ) {
      let id = this._OID();
      this._insertReal({id,rect,context,inNodes:[]});
    }

    retrieve(/*Rect*/ rect) {
      let retr = this._retrieveReal(rect);
      return Object.values(retr);
    }

    remove(func, /* Optional, Rect*/ rect ){
      if(undefined !== rect){
        this._removeInRect(func,rect);
      } else {
        this._removeByWalk(func);
      }
    }

    clear() {
      this.#objects = [];
      this.#nodes.forEach(n=>n.clear());
    }


    ////////////////////////////////////////////////////////////////////////////////
    // Magic Transform Functions
    ////////////////////////////////////////////////////////////////////////////////
    toString(padding = ''){
      return `${padding}Qt #${this.#id}-${this.#depth} [${this.#bounds}]: objects(${this.#objects.length}) ${
        this.#objects.length > 0
        ? `\n${padding}    ${this.#objects.map(o=>`#${o.id}-${o.rect}  N: [${o.inNodes.map(n=>n.#id).join(',')}] ${JSON.stringify(o.context)}`).join(`\n${padding}    `)}`
        : ''
      }${
        this.#nodes.length 
        ? `\n  ${this.#nodes.map(n=>n.toString(`${padding}  `)).join(`\n  `)}`
        : ''
      }`;
    }

    toObject() {
      return {
        bounds: this.#bounds.toObject(),
        config: this.#config,
        depth: this.#depth,
        objects: [...this.#objects.map(o=>({ id: o.id, rect: o.rect.toObject(), context: o.context, inNodes: o.inNodes.map(n=>n.#id) }))],
        nodes: [...this.#nodes.map(n=>n.toObject())]
      };
    }

    toJSON(){
      return JSON.stringify(this.toObject());
    }


    ////////////////////////////////////////////////////////////////////////////////
    // Private Implementation Details
    ////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////
    // Statics
    static #UL = 0;
    static #UR = 1;
    static #LL = 2;
    static #LR = 3;

    static #lastQID = 0;
    static _QID() {
      return ++Quadtree.#lastQID;
    }

    ////////////////////////////////////////
    // Members
    #lastOID = 0;
    #id;
    #bounds;
    #config = {maxObjects: 10, maxDepth: 4};
    #depth = 0;
    #objects = [];
    #nodes = [];

    ////////////////////////////////////////
    // Private Member Functions

    // Operation: INSERT
    _insertReal( obj ) {
      if( this.#nodes.length ) {
        let indices = this._indices(obj.rect);
        indices.forEach(idx => this.#nodes[idx]._insertReal(obj));
      } else {
        this.#objects.push(obj);
        obj.inNodes.push(this);
        if(this.#objects.length > this.#config.maxObjects && this.#depth < this.#config.maxDepth){
          this._rebalance();
        }
      }
    }

    // Operation: RETRIEVE
    _retrieveReal(/*Rect*/ rect = {}) {
      let retr = this.#objects.reduce((m,o)=>({...m,[o.id]:{rect:o.rect,context:o.context}}),{});
      let indices = this._indices(rect);
      if(this.#nodes.length){
        indices.forEach(idx => retr = {...retr, ...this.#nodes[idx]._retrieveReal(rect)});
      }
      return retr;
    }

    // Operation: REMOVE
    _removeInRect(func,rect){
      this._removeObjectsByFilter(func);
      let indices = this._indices(rect);
      if(this.#nodes.length){
        indices.forEach(idx => this.#nodes[idx]._removeInRect(func,rect) );
        if(this.#nodes.reduce((m,n)=>m+n.#objects.length,0)<=this.#config.maxObjects){
          this._rejoin();
        }
      }
    }

    _getIDsWork() {
      let ids = [];
      if(this.#nodes.length){
        this.#nodes.forEach(n=>ids=[...ids,...n._getIDs()]);
      }
      return [...ids, ...this.#objects.map(o=>o.id)];
    }

    _getIDs() {
      return [...new Set(this._getIDsWork())];
    }

    _removeByWalk(func){
      this._removeObjectsByFilter(func);
      if(this.#nodes.length){
        this.#nodes.forEach(n=>n._removeByWalk(func));
        if(this._getIDs().length<=this.#config.maxObjects){
          this._rejoin();
        }
      }
    }

    _removeByID(oid){
      this.#objects = this.#objects.filter(o=>o.id !== oid);
    }

    _removeObjectsByFilter(func){
      this.#objects = this.#objects.filter(o=>{
        if(func(o.context)){
          o.inNodes.forEach(n=>{
            if(n!==this){
              n._removeByID(o.id);
            }
          });
          return false;
        }
        return true;
      });
    }

    // Unique ID for Inserted Objects
    _OID() {
      return ++this.#lastOID;
    }

    // Divide
    _split() {
      let qw = this.#bounds.halfWidth/2;
      let qh = this.#bounds.halfHeight/2;
      this.#nodes = [
        new Quadtree(
          new Rect(
            this.#bounds.x-qw,
            this.#bounds.y-qh,
            this.#bounds.halfWidth,
            this.#bounds.halfHeight
          ),
          this.#config
        ),
        new Quadtree(
          new Rect(
            this.#bounds.x+qw,
            this.#bounds.y-qh,
            this.#bounds.halfWidth,
            this.#bounds.halfHeight
          ),
          this.#config
        ),
        new Quadtree(
          new Rect(
            this.#bounds.x-qw,
            this.#bounds.y+qh,
            this.#bounds.halfWidth,
            this.#bounds.halfHeight
          ),
          this.#config
        ),
        new Quadtree(
          new Rect(
            this.#bounds.x+qw,
            this.#bounds.y+qh,
            this.#bounds.halfWidth,
            this.#bounds.halfHeight
          ),
          this.#config
        )
      ];
      this.#nodes.forEach(n=>n.#depth = this.#depth+1);
    }

    _indices(/* Rect */ rect) {
      let indices = [];

      const ix = rect.intersectX(this.#bounds.x);
      const iy = rect.intersectY(this.#bounds.y);

      if( Rect.BELOW !== iy) {
        if(Rect.BELOW !== ix) {
          indices.push(Quadtree.#UL);
        }
        if(Rect.ABOVE !== ix) {
          indices.push(Quadtree.#UR);
        }
      }

      if( Rect.ABOVE !== iy) { 
        if(Rect.BELOW !== ix) {
          indices.push(Quadtree.#LL);
        }
        if(Rect.ABOVE !== ix) {
          indices.push(Quadtree.#LR);
        }
      }
      return indices;
    }

    _rebalance() {
      this._split();
      this.#objects.forEach(o => {
        o.inNodes=o.inNodes.filter(n=>this !== n);
        let indices = this._indices(o.rect);
        indices.forEach( idx => this.#nodes[idx]._insertReal(o) );
      });
      this.#objects = [];
    }

    _rejoin() {
      let objs = {};
      this.#nodes.forEach(n=>{
        n.#objects.forEach(o=>{
          o.inNodes=o.inNodes.filter(n2=>n2 !== n);
          objs[o.id] = o;
        });
      });
      this.#objects = Object.values(objs);
      this.#objects.forEach(o=>o.inNodes.push(this));
      this.#nodes = [];
    }

  }
  //////////////////////////////////////////////////



  on('ready', () => {
    checkInstall();
  });

  return {
    Rect,
    Quadtree
  };

})();

{try{throw new Error('');}catch(e){API_Meta.libTypes.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.libTypes.offset);}}
