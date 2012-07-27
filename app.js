var express = require('express')
  , app = express.createServer()
  , io  = require('socket.io').listen(app);

app.use(express.static(__dirname + '/resources'));

app.get('/', function(req, res) {
  res.sendfile('./index.html');
})

app.get('/socket.io/socket.io.js', function(req, res) {
  res.sendfile('./node_modules/socket.io/lib/socket.io.js');
})

app.listen(3000);

/*
io.sockets.on('connection', function (socket) {

  socket.on('nick', function(nick) {
    socket.set('nick', nick, function() {})
    // TODO
    // on client connection, say that a new person enters the channel
    // store nickname and set timed callback for a few seconds
    // every few seconds, add to allotted characters, send to client
    // (volatile packet, perhaps), set another timed callback
  })

  socket.on('speak', function(text) {
    socket.broadcast.emit('speak', text)
    // also send back to original speaker
  })
})
*/
