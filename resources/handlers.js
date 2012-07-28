function handlers (socket) {
  socket.on('registered', function () {
    $('#msgleft').text('Discourse:');
    $('#status').toggle();
    $('#message').empty();
  });

  socket.on('received', function (rest) {
    $('#message').text(rest);
  });

  socket.on('nick', function (nick) {
    $('#chat').append('<h3>' + nick + ' entered the chat.</h3>');
  });

  socket.on('left', function (nick) {
    $('#chat').append('<h3>' + nick + ' left the chat.</h3>');
  });

  socket.on('talk', function (who, text) {
    var chat = $('#chat');
    chat.append('<ul><li class=\"nick\">' + who + ':</li><li>' +
                     text + '</li></ul>');
    chat.scrollTop(chat.prop('scrollHeight'));
  });

  socket.on('allotment', function (allotment) {
    $('#allotment').text(allotment);
  });
}
