_ = require('underscore')

nicknames = {}
messages = []

class exports.Game

  constructor: (@io, @socket) ->

  handleMessage: (data) ->
    unless data.message.length == 0
      data = _.extend(data, { nickname: @nickname, timestamp: parseInt((new Date()).getTime() / 1000) })
      messages.push(data)
      @io.sockets.emit("stoppedtyping", @nickname)
      @io.sockets.emit("received", data)

  handleTyping: ->
    @io.sockets.emit("istyping", @nickname)

  handleNicknameUpdate: (data) ->
    if nicknames[@nickname]
      nicknames[@nickname] = data.nickname
    else
      nicknames[data.nickname] = data.nickname

    @nickname = data.nickname

    @sendNicknames()

  sendNicknames: ->
    io.sockets.emit('nicknames', _.values(nicknames))

  sendMessageLog: ->
    io.sockets.emit("log", _.last(messages, 50))

  handleDisconnect: ->
    return if !@nickname

    delete nicknames[@nickname];

    @sendNicknames()

