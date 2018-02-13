var barValue = "bar1";
var acceptedValues = ["bar1", "bar2", "bar3"];

on('chat:message', function (msg) {
 
    if (msg.type == 'api' && msg.content.indexOf('!ChangeBar') !== -1) {
        var message = msg.content.split(" ")[1];
        log("Message: " + message);
        if (acceptedValues.includes(message)) {
            barValue = message;
            log("Blood and Dead bar value changed to " + message);
        }
    }
});


on("change:graphic:bar1_value", function(obj) {
    if(obj.get("bar1_max") === "") return;
   
    if(obj.get("bar1_value") <= obj.get("bar1_max") / 2) {
        obj.set({
              status_redmarker: true
        });
    }
    else{
        obj.set({
            status_redmarker: false
        })
    }

    if(obj.get("bar1_value") <= 0) {
      obj.set({
         status_dead: true
      });
    }
    else {
      obj.set({
        status_dead: false
      });
    }
});