// Github:   https://github.com/shdwjk/Roll20API/blob/master/MonsterHitDice/MonsterHitDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

// Version:  0.1

on('ready', function(){
    on('add:graphic',function(obj){
        if(
               'graphic' == obj.get('type') 
            && 'token'   == obj.get('subtype') 
            && ''        != obj.get('represents')
        )
        {
            setTimeout(_.bind(function(id){
                var obj=getObj('graphic',id)
               
                if(
                       undefined != obj 
                    && ''        == obj.get('bar2_link')
                )
                {
                    var attrib = findObjs({
                        _type: 'attribute', 
                        _characterid:obj.get('represents'),
                        name: 'HitDice'
                    })
                    if( attrib.length )
                    {
                        sendChat('','/r '+attrib[0].get('current'),function(r){
                            var hp=0;
                            _.each(r,function(subr){
                                var val=JSON.parse(subr.content);
                                if(_.has(val,'total'))
                                {
                                    hp+=val.total;
                                }
                            });
                            obj.set({
                                bar2_value: hp,
                                bar2_max: hp
                            })
                        });
                    }
                }
                
            },this,obj.id), 100);
        }
    });
});
