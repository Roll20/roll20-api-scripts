const lightSources = {
    'Candle': {
        bright_light_distance: 2,
        low_light_distance: 7,
        lightColor: '#ff9900',
        has_directional_bright_light: false,
        has_directional_dim_light: false
    },
    'Lamp': {
        bright_light_distance: 15,
        low_light_distance: 30,
        lightColor: '#ffd966',
        has_directional_bright_light: false,
        has_directional_dim_light: false
    },
    'Torch': {
        bright_light_distance: 20,
        low_light_distance: 40,
        lightColor: '#ffd966',
        has_directional_bright_light: false,
        has_directional_dim_light: false
    },
    'Hooded Lantern': {
        bright_light_distance: 30,
        low_light_distance: 60,
        lightColor: '#ffd966',
        has_directional_bright_light: false,
        has_directional_dim_light: false
    },
    'Hooded Lantern - Lowered': {
        bright_light_distance: 0,
        low_light_distance: 5,
        lightColor: '#e69138',
        has_directional_bright_light: false,
        has_directional_dim_light: false
    },
    'Bullseye Lantern': {
        bright_light_distance: 60,
        low_light_distance: 120,
        lightColor: '#ffe599',
        has_directional_bright_light: true,
        directional_bright_light_center: 0,
        directional_bright_light_total: 90,
        has_directional_dim_light: true
    },
    'Light Cantrip': {
        bright_light_distance: 20,
        low_light_distance: 40,
        lightColor: '#fff2cc',
        has_directional_bright_light: false,
        has_directional_dim_light: false
    },
    'Daylight Spell': {
        bright_light_distance: 60,
        low_light_distance: 120,
        lightColor: '#fff2cc',
        has_directional_bright_light: false,
        has_directional_dim_light: false
    },
    'Faerie Fire - Blue': {
        bright_light_distance: 0,
        low_light_distance: 10,
        lightColor: '#6fa8dc',
        has_directional_bright_light: false,
        has_directional_dim_light: false
    },
    'Faerie Fire - Green': {
        bright_light_distance: 0,
        low_light_distance: 10,
        lightColor: '#00f00',
        has_directional_bright_light: false,
        has_directional_dim_light: false,
        flickering: false
    },
    'Faerie Fire - Violet': {
        bright_light_distance: 0,
        low_light_distance: 10,
        lightColor: '#ff00ff',
        has_directional_bright_light: false,
        has_directional_dim_light: false
    }
};

const methods = {
    "setLightSource": setLightSource,
    "toggleLight": toggleLight
};

on("chat:message", function(msg){
    if(msg.type == "api" && msg.content.startsWith("!torchlight")) {
        if (!msg.selected || !msg.selected.length) {
            sendChat("TorchLight", "No tokens selected.");
        } else {
            let commands = msg.content.split(" --");
            commands.shift();
            for (command of commands) {
                for (method in methods){
                    if (command.startsWith(method)) {
                        methods[method](command, msg.selected);
                    }
                }
            }
        }
    }
})
    
function setLightSource(command, objs) {
    if (command.split("|").length === 1) {
        let chatMessage = "Select Light Source:<br>";
        for (lightSource in lightSources) {
            chatMessage += "[" + lightSource + "](!torchlight --setLightSource|" + lightSource + ")<br>";
        }
        sendChat("TorchLight", chatMessage);
    } else {
        let lightSource = lightSources[command.split("|")[1]];
        for (obj of objs) {
            let token = getObj(obj._type, obj._id);
            for (prop in lightSource) {
                if (prop === "flickering" && lightSource[prop]) {
                    const flickerId = setFlickering(token);
                    state.TORCHLIGHT.flickeringTokenIds[obj._id] = String(flickerId);
                } else {
                    token.set(prop, lightSource[prop]);
                }
            }
        }
    }
}

function toggleLight(command, objs) {
    for (obj of objs) {
        let token = getObj(obj._type, obj._id);
        token.set("emits_bright_light", !token.get("emits_bright_light"));
        token.set("emits_low_light", !token.get("emits_low_light"));
    }
}