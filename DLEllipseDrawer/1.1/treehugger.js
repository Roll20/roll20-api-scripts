//treehugger.js
//Author: Tim Matchen
/*Use: Simply draw an ellipse on the dynamic lighting layer and the script 
replaces the ellipse with a n-sided polygon approximating the ellipse. The
default number of sides is 20; this can be adjusted using the command 
!treehugger n, where n is the desired number of sides. For example, 
!treehugger 10 would generate 10-sided polygons instead of 20.*/

on("ready",function(){
var gc = globalconfig && globalconfig.dlellipsedrawer;
    if(gc != undefined && isNaN(gc.N) != 1){
        var n = Math.ceil(gc.N);
    }
    else{
        var n = 20;
        log("Invalid input from globalconfig! Using n = 20")
    }
log("Treehugger is up and running!")
on("add:path",function(obj){
    //Check if new path is on path layer and if the path is elliptical
    if(obj.get("layer")=='walls'){
        var mypath = JSON.parse(obj.get("path"));
        log(mypath[1][0]);
        if(mypath[1][0]=='C'){
            //Initialize values for drawing the polygon
            var arcangle = 2*Math.PI/n;
            var anglecurr = 0;
            var xcurr = 0;
            var ycurr = 0;
            var xfirst = 0;
            var yfirst = 0;
            //Check if the path is a circle or ellipse
            if(obj.get("height")==obj.get("width")){
                var radius = obj.get("height")/2;
                log("Starting coordinates: "+mypath[0][1]+" "+mypath[0][2]);
                var newpath = [];
                //Iterate around circle, creating n vertices and drawing path
                for(var i = 0; i<n; i++){
                    log("i= "+i);
                    if(i==0){
                        log("i==0");
                        //Compute the first angular coordinates; 
                        ycurr = radius+radius*Math.cos(anglecurr);
                        xcurr = radius+Math.sin(anglecurr);
                        xfirst = xcurr;
                        yfirst = ycurr;
                        var matadd = ['M',xcurr,ycurr];
                        newpath.push(matadd);
                        log(newpath[i][0]+" "+newpath[i][1]+" "+newpath[i][2]);
                    }
                    else{
                        anglecurr = anglecurr + arcangle;
                        ycurr = radius+radius*Math.cos(anglecurr);
                        xcurr = radius+radius*Math.sin(anglecurr);
                        matadd = ['L',xcurr,ycurr];
                        newpath.push(matadd);
                        log(newpath[i][0]+" "+newpath[i][1]+" "+newpath[i][2]);
                    }
                }
            }
            //Generate path for non-circular ellipses
            else{
                //Calculate semimajor and semiminor axes
                a = obj.get("width")/2;
                b = obj.get("height")/2;
                var newpath = [];
                for(var i = 0; i<n; i++){
                    if(i==0){
                        var coeff = Math.pow(Math.sin(anglecurr)/a,2)+Math.pow(Math.cos(anglecurr)/b,2);
                        radius = Math.sqrt(1/coeff);
                        log("radius = "+radius);
                        xcurr = a + radius*Math.sin(anglecurr);
                        ycurr = b + radius*Math.cos(anglecurr);
                        xfirst = xcurr;
                        yfirst = ycurr;
                        var matadd = ['M',xcurr,ycurr];
                        newpath.push(matadd);
                        log(newpath[i][0]+" "+newpath[i][1]+" "+newpath[i][2]);
                    }
                    else{
                        anglecurr = anglecurr + arcangle;
                        coeff = Math.pow(Math.sin(anglecurr)/a,2)+Math.pow(Math.cos(anglecurr)/b,2);
                        radius = Math.sqrt(1/coeff);
                        xcurr = a + radius*Math.sin(anglecurr);
                        ycurr = b + radius*Math.cos(anglecurr);
                        matadd = ['L',xcurr,ycurr];
                        newpath.push(matadd);
                        log(newpath[i][0]+" "+newpath[i][1]+" "+newpath[i][2]);
                    }
                }
            }
            //Connect path back to beginning and create the new path
            matadd = ['L',xfirst,yfirst];
            newpath.push(matadd);
            obj.set("layer",'map')
            //log("Old rotation = "+obj.get("rotation"));
            newobj = createObj('path', {
                left: obj.get("left"),
                top: obj.get("top"),
                height: obj.get("height"),
                stroke: obj.get("stroke"),
                width: obj.get("width"),
                pageid: obj.get("pageid"),
                scaleX: obj.get("scaleX"),
                scaleY: obj.get("scaleY"),
                layer: 'walls',
                path: JSON.stringify(newpath)
                });
            //Remove the original circle
            obj.remove();
        }
    }
});
//Change the number of sides to the polygon: !treehugger n
on("chat:message",function(msg){
    if(msg.type == "api" && msg.content.indexOf("treehugger")!== -1){
        var newn = msg.content.replace("!treehugger ","");
        //Set the number of vertices to equal the integer value n
        if(isNaN(newn)!=1){
            n = Math.ceil(newn);
        }
        else{
            var caller = msg.who.split(' ')[0];
            log("Invalid input!");
            sendChat('System', '/w ' + caller + ' Treehugger requires an integer input!');
        }
    }
});
}
);
