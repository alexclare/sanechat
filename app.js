var app  = require('http').createServer(handler)
  , fs   = require('fs')
  , path = require('path')
  , io   = require('socket.io').listen(app);

function handler (req, res) {
  var url = './resources' + req.url;
  if (url == './resources/')
    url += 'index.html';

  var mimeType;
  switch (path.extname(url)) {
    case '.css': mimeType = 'text/css'; break;
    case '.js':  mimeType = 'text/javascript'; break;
    default:     mimeType = 'text/html';
  }
  
  fs.exists(url, function (exists) {
    if (exists) {
      fs.readFile(url, function (err, data) {
        if (err) {
          res.writeHead(500);
          res.end('Internal Server Error');
        } else {
          res.writeHead(200, {'Content-Type': mimeType});
          res.end(data, 'utf-8');
        }
      });
    } else {
      res.writeHead(404);
      res.end('File Not Found');
    }
  });
}

app.listen(3000);

io.sockets.on('connection', function (socket) {
  socket.on('nick', function(nick) {
    socket.set('nick', nick, function() { });
    socket.join('chat');
    socket.emit('registered');
    io.sockets.in('chat').emit('nick', nick);
    
    // TODO
    // on client connection, say that a new person enters the channel
    // store nickname and set timed callback for a few seconds
    // every few seconds, add to allotted characters, send to client
    // (volatile packet, perhaps), set another timed callback
  });

  socket.on('talk', function(text) {
    socket.get('nick', function(err, nick) {
      if (err) {
        io.sockets.in('chat').emit('talk', 'error', text);
      } else {
        io.sockets.in('chat').emit('talk', nick, text);
        socket.emit('recieved')
      }
    });
  });

  socket.on('disconnect', function() {
    socket.get('nick', function(err, nick) {
      if (!err) {
        io.sockets.in('chat').emit('left', nick);
      }
    });
  });
});
