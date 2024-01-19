
/***
 * applies a given effect to a single token
 ***/
on('ready',()=>{
  function dieEffect(dieToken, effect) {
    let dieProps = {
      left: dieToken.get('left'),
      top: dieToken.get('top')
    }
    spawnFx(dieProps.left, dieProps.top, effect);
  }

  /***
   * sets a die token to a given value
   ***/
  function setDieValue(dieToken, value) {
    const boundedVal = Math.min(Math.max(value,0),5)
    const sides = dieToken.get('sides').replaceAll('%3A', ':').replaceAll('%3F', '?').split('|')
    const sideImg = sides[boundedVal]
    dieToken.set({
      imgsrc: sideImg,
      currentSide: boundedVal
    })
  }

  /***
   * regex statements used to match commands
   ***/
  const ampedRegex = new RegExp(/^!amped/)
  const onFireRegex = new RegExp(/^!onFire\|/)
  const digitRegex = new RegExp(/(?<=\|)\d/)

  //images used for sides of a d6
  const d6Sides = [
    'images/779533',
    'images/779535',
    'images/779534',
    'images/779531',
    'images/779532',
    'images/779536'
    ]

  /***
   * recognizes d6s dragged from the chat window onto the tabletop and sets them to be controlled by all players
   ***/
  on('add:token', tok=>{
    if(_.every(d6Sides, side => {
      return tok.get('sides').includes(side)
    })) {
      /*****/ log('VG: setting controlledby:all...')
      tok.set('controlledby', 'all')
    }
  })

  /***
   * powers !amped and !onFire|* statements.
   * !amped rerolls all 1s in the selected dice
   * !onFire|* sets all 1s in the selection to the value inidcated by *
   * both apply a visual effect to the dice
   ***/
  on("chat:message", msg => {
    if(msg.type === 'api' &&  msg.selected){
      msg.selected.forEach(die =>{
        if (die._type === 'graphic') {
          let dieToken = getObj('graphic', die._id)
          if(dieToken.get('currentSide')===0){
            if(msg.content.match(ampedRegex)){
              /*****/ log('VG: amped die...')
              dieEffect(dieToken, 'explode-charm')
              const newValue = Math.floor(Math.random() * 6)
              setDieValue(dieToken, newValue)
            }
            if(msg.content.match(onFireRegex)){
              /*****/ log('VG: onFire die...')
              const requestedValue = msg.content.match(digitRegex)
              if(requestedValue && requestedValue[0]) {
                setDieValue(dieToken, parseInt(requestedValue)-1)
                dieEffect(dieToken, 'burst-fire')
              }
            }
          }
        }
      })
    }
  })

})
