var socket = io.connect('http://' + document.domain + ":443/");

$(document).ready(function() {

  var nickname = "";

  var reset_typing = function(test_nickname) {
    $("div.person").each(function() {
      $(this).text($(this).data('nickname'));

      if($(this).data('nickname') == test_nickname) {
        $(this).text($(this).text() + " is typing");
      }
    });
  };

  var send_nickname = function(el) {
    var new_nickname = $(el).val();

    if(new_nickname) {
      nickname = new_nickname;
      socket.emit("nickname", { nickname: nickname });
    }
  };

  var appendMessage = function(message) {
    var nickname_td = $("<td/>").text(message.nickname);
    var message_td = $("<td/>").text(message.message);
    $("<tr></tr>").append(nickname_td).append(message_td).prependTo($("#message-table").find("tbody"));
  };

  var typing = {};

  $("#message").keypress(function(e) {
    console.log(_.size(typing));
    console.log(typing[nickname]);
    console.log(nickname);

    if(_.size(typing) > 0 && !typing[nickname]) {
      return false;
    }

    if(e.keyCode == 13) {
      var val = $(this).val();
      if(val.length) {
        socket.emit("message", { message: $(this).val() });
        $(this).val("");
      }
    } else if(e.keyCode != 8) {
      socket.emit("typing");
    }
  });

  $("#nickname").blur(function() { send_nickname(this); });
  $("#nickname").keypress(function(e) { if(e.keyCode == 13) { send_nickname(this); } });

  socket.on("istyping", function(nickname) {
    console.log(nickname + " is typing");

    reset_typing(nickname);

    if(typing[nickname]) {
      clearTimeout(typing[nickname]);
    }

    typing[nickname] = setTimeout(function() { reset_typing(); typing = {}; }, 5000);
    console.log(typing);
  });

  socket.on("log", function(messages) {
    _.each(messages, function(message) {
      appendMessage(message);
    });
  });

  socket.on("stoppedtyping", function(nickname) {
    reset_typing();

    if(typing[nickname]) {
      clearTimeout(typing[nickname]);
      typing = {};
    }
  });

  socket.on("received", function(data) {
    appendMessage(data);
  });

  socket.on("nicknames", function(nicknames) {
    console.log(nicknames);
    $("#people").html("");
    for(i in nicknames) {
      person_nickname = nicknames[i];
      $("#people").append($("<div class='person'></div>").attr("data-nickname", person_nickname).html(person_nickname));
    }
  });
});
