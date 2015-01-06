on("change:token", function(obj, prev) {
    //Only do this if we actually moved.
    if(obj.get("left") == prev["left"] && obj.get("top") == prev["top"]) return;
    obj.set({
        light_radius: Math.floor(obj.get("light_radius") * 0.90)
    });
});