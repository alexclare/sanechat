var app  = require('http').createServer(handler)
  , fs   = require('fs')
  , path = require('path')
  , io   = require('socket.io').listen(app);

function handler (req, res) {
  var local = './resources' + req.url;
  if (local == './resources/')
    local += 'index.html';

  var mimeType;
  switch (path.extname(local)) {
    case '.css': mimeType = 'text/css'; break;
    case '.js':  mimeType = 'text/javascript'; break;
    default:     mimeType = 'text/html';
  }
  
  fs.exists(local, function (exists) {
    if (exists) {
      fs.readFile(local, function (err, data) {
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
  socket.on('nick', function (nick) {
    // Basic properties of a user: Nick and speech allotment
    socket.set('nick', nick, function () { });
    socket.set('allotment', 0);

    // Timer to increase speech allotment and its destructor
    var intid = setInterval(function () {
      socket.get('allotment', function (err, allotment) {
        if (!err) {
          socket.set('allotment', allotment+2);
          socket.volatile.emit('allotment', allotment+2);
        }
      });
    }, 1000);
    socket.set('intid', intid);

    // Finally, join the room and broadcast presence
    socket.join('chat');
    socket.emit('registered');
    io.sockets.in('chat').emit('nick', nick);
  });

  socket.on('talk', function (text) {
    if (text.length > 0) {
      socket.get('allotment', function (err, allotment) {
        if (!err && allotment > 0) {
          socket.get('nick', function (err, nick) {
            if (!err) {
              var sent = text.slice(0, allotment);
              var remnants = text.slice(allotment);
              io.sockets.in('chat').emit('talk', nick, sent);
              socket.set('allotment', allotment-sent.length);
              socket.emit('received', remnants);
            }
          });
        }
      });
    }
  });

  socket.on('disconnect', function () {
    socket.get('intid', function (err, intid) {
      if (!err) clearInterval(intid);
    });
    socket.get('nick', function (err, nick) {
      if (!err) {
        io.sockets.in('chat').emit('left', nick);
      }
    });
  });
});
