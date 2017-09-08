var express = require('express'),
    http = require('http'),
    app = express(),
    port = process.env.PORT || 3000,
    server = http.createServer(app);

app.configure(function(){
    app.use(express.static(__dirname + '/static'));
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(port, function() {
    console.log('Server running on port ' + port);
});