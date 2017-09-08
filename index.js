var express = require('express'),
    app = express.createServer(),
    port = process.env.PORT || 3000;

app.configure(function(){
    app.use(express.static(__dirname + '/static'));
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.listen(port);