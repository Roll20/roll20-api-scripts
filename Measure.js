// Github:   https://github.com/shdwjk/Roll20API/blob/master/Measure/Measure.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

// Version:  0.1

on('read',function(){
	'use strict';

    log('measure: ready');
    on('sendChat',function(msg){
        var args;

		if (msg.type !== "api") {
			return;
		}

		args = msg.content.split(/\s+/);
		switch(args[0]) {
            case '!measure':
                _.chain(args)
                    .rest()
					.uniq()
					.map(function(t){
						return getObj('graphic',t);
					})
					.reject(_.isUndefined)
                    .tap(log)
                    .reduce(m,function(t){
                        if(!m.root){
                            m.root=t;
                            m.msgs.push('Root Node: '+t.get('name')+' ('+t.get('left')+','+t.get('top')+')');
                        } else {
                            var rx = m.root.get('left'),
                                ry = m.root.get('top'),
                                rcx =(rx+m.root.get('width')/2),
                                rcy= (ry+m.root.get('height')/2),
                                tx = t.get('left'),
                                ty = t.get('top'),
                                tcx =(tx+t.get('width')/2),
                                tcy = (ty+t.get('height')/2),
                                d = Math.sqrt( Math.pow( (rx-tx),2)+Math.pow( (ry-ty),2)),
                                cd =  Math.sqrt( Math.pow( (rcx-tcx),2)+Math.pow( (rcy-tcy),2));
                            m.msgs.push('Root -> '+t.get('name')+': [corner] '+d);
                            m.msgs.push('Root -> '+t.get('name')+': [center] '+cd);
                        }
                        return m;
                    },{root: false, msgs: []})
                    .each(function(o){
                        sendChat('Measure','/direct '+o.msgs.join('<br>'));
                    });
                    
                break;
		}
    });
});
