require("coffee-script")

var express = require('express')
  , sio = require('socket.io')
  , _ = require('underscore')
  , engine = require('./lib/game');

port = process.env.NODE_ENV == "production" ? 443 : 3000;

app = express.createServer();

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

io = sio.listen(
  app.listen(port, function () {
    console.log('   app listening on http://localhost:' + port);
  })
);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

nicknames = {};

io.sockets.on('connection', function (socket) {
  var nickname = "";
  var game = new engine.Game(io, socket);

  game.sendNicknames();
  game.sendMessageLog();

  socket.on("message", function(data) {
    console.log("     Received message: " + data.message);
    game.handleMessage(data);
  });

  socket.on("log", function() {
    game.sendMessageLog()
  });

  socket.on("typing", function() {
    console.log("     Received typing for " + nickname);
    game.handleTyping();
  });

  socket.on("nickname", function(data) {
    console.log("     Received nickname: " + data.nickname);

    game.handleNicknameUpdate(data);
  });

  socket.on('disconnect', function () {
    console.log("     Received disconnect for " + nickname);

    game.handleDisconnect();
  });
});
