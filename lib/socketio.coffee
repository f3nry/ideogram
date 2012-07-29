
class SocketIOController
  constructor: (@socket) ->

  initListeners: ->
    if @listeners
      _.each @listeners, (listener) ->
        _.bind(listener, @)
