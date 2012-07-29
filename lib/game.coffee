_ = require('underscore')
mongo = require('mongodb')

client = new mongo.Db('indeogram', new mongo.Server("127.0.0.1", 27017, {}))
client.open (error, client) ->
  throw error if error
  console.log("Connected to MongoDB!")

nicknames = {}
messages = []
typing = {}

class exports.Game

  constructor: (@io, @socket) ->
    @collection = new mongo.Collection(client, 'messages')

  handleMessage: (data) ->
    unless data.message.length == 0
      data = _.extend(data, { nickname: @nickname, timestamp: parseInt((new Date()).getTime() / 1000) })

      @collection.insert data, {}, (error, objects) ->
        object = _.first(objects)
        @io.sockets.emit("stoppedtyping", @nickname)
        @io.sockets.emit("received", _.extend(data, { id: object._id.toString() } ))

  sendStopTyping: ->
    stopped_username = _.first(_.keys(typing))
    if typing[stopped_username]
      @io.sockets.emit("stoppedtyping", stopped_username)
      clearTimeout(typing[stopped_username])
      typing = {}

  handleTyping: (typing_username) ->
    obj = @

    if typing[typing_username]
      clearTimeout(typing[typing_username]);

    typing[typing_username] = setTimeout((-> obj.sendStopTyping() ), 5000);

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
    @collection.find().sort({ timestamp: -1 }).limit(50).toArray (error, results) ->
      throw error if error
      io.sockets.emit("log", results.reverse())

  handleDisconnect: ->
    return if !@nickname

    delete nicknames[@nickname];

    @sendNicknames()

