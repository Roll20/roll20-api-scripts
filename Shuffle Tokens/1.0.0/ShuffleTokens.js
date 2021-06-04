function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function average(a){
    var sum = 0;
    for(i = 0;i<a.length;i++){
        sum += a[i];
    }
    return parseInt(sum/a.length);
}

on("chat:message", function(msg){
    shufflemsg(msg,3);
} );



function shufflemsg(msg,more) {
    if(more <=0){
        return;
    }
    var message = '';
    // Determine the contents of `message'
    var positions = [];
    var obj;
    if(msg.type == "api" && msg.content.indexOf("!shuffle") !== -1){
        if (!msg.selected) return;
        var aleft = [];
        var atop = [];
        var awidth = [];
        var aheight = [];
        var arotation = [];
        for(i=0;i<msg.selected.length;i++){
                obj = getObj(msg.selected[i]._type, msg.selected[i]._id);
                positions.push({"left":obj.get("left"),"top":obj.get("top"),"height":obj.get("height"),"width":obj.get("width"),"rotation":obj.get("rotation")});
                aleft.push(obj.get("left"));
                atop.push(obj.get("top"));
                awidth.push(obj.get("width"));
                aheight.push(obj.get("height"));
                arotation.push(obj.get("rotation"));
        }
        
        
        for(d=0;d<msg.selected.length;d++){
                obj = getObj(msg.selected[d]._type, msg.selected[d]._id);
                obj.set("left",average(aleft));
                obj.set("top",average(atop));
                obj.set("width",average(awidth));
                obj.set("height",average(aheight));
                obj.set("rotation",average(arotation));
        }
        shuffle(positions);
        
        for(f=0;f<msg.selected.length;f++){
            var b = f;
            obj = getObj(msg.selected[b]._type, msg.selected[b]._id);
            if(Math.random()>0.5){
                toFront(obj);
            }else{
                toBack(obj);
            }
        }
        
        
        setTimeout(function(){
        for(i=0;i<msg.selected.length;i++){
                obj = getObj(msg.selected[i]._type, msg.selected[i]._id);
                obj.set("left",positions[i]["left"]);
                obj.set("top",positions[i]["top"]);
                obj.set("width",positions[i]["width"]);
                obj.set("height",positions[i]["height"]);
                obj.set("rotation",positions[i]["rotation"]);
        }
        shufflemsg(msg,more-1);
        }, 500); 
    }
}