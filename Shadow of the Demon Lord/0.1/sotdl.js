on('chat:message', function(msg) {
    if(msg.type == 'api' && msg.content.indexOf('!test') !== -1)
    {
        log(globalconfig);
        sendChat(msg.who, "/direct <div>TEST</div>");
    }
});