/**
 * @file Websocket的服务器实现<br>
 *  接受客户端的连接，并保留连接状态。这个连接用用户ID保存。
 *  主要负责长时处理结束等需要后台主动通知客户端的处理。
 * @author r2space@gmail.com
 * @module light.bridge.socket.server
 * @version 1.0.0
 */


"use strict";

var io          = require("socket.io")()
  , _           = light.util.underscore
  , config      = light.framework.config
  , async       = light.util.async
  , log         = light.framework.log
  , storage     = require("./storage")
  , constant    = require("./constant")
  ;

module.exports = {

  start: function() {
    this.listen();
  },

  /**
   * @desc 监听客户的连接请求
   */
  listen: function() {
    var self = this;

    io.on("connection", function(socket) {

      // 从服务器连接，则向客户端转发通知
      var server = socket.handshake.query.server;
      if (server) {

        socket.on(constant.TAG_PUSH, function (data) {
          log.debug(data.tag, data.uid);

          // 发送通知
          self.emit(data.uid, data.tag, data.message);

          // 接受通知，切断与客户端的连接
          socket.disconnect();
        });

        return;
      }

      // 保存客户端连接
      self.join(socket);

      // 客户端断开连接，删除连接
      socket.on("disconnect", function() {
        self.leave(socket);
      });

    });

    io.listen(config.push.socketPort);
    log.debug("WebSocket server listening on port " + config.push.socketPort);
  },

  /**
   * @desc 客户端接入，保存连接<br>
   *   如果有未发送到客户端的消息，则在这个时间点发送给客户端
   * @param {Object} socket 连接实例
   */
  join: function(socket) {
    var self = this
      , address = socket.handshake.address
      , uid = socket.handshake.query.uid;

    // TODO: To obtain the user ID from session
    storage.join(socket.id, uid, address, function(err) {
      if (err) {
        return log.error(err);
      }

      // 当有新客户端接入时，获取未发送的消息
      storage.list(uid, function(err, result) {
        async.forEachSeries(result, function(item, loop) {
          self.emit(item.uid, item.tag, item.message);
          storage.remove(uid, loop);
        });
      });
    });
  },

  /**
   * @desc 客户端离开，删除连接
   * @param {Object} socket 连接实例
   */
  leave: function(socket) {
    storage.leave(socket.id, function(err) {
      if (err) {
        log.error(err);
      }
    });
  },

  /**
   * @desc 给指定的客户端发通知，客户端用UserID来识别，如果客户端是多个，则向所有客户端发送消息<br>
   *   只要有一个客户端在线，则认为消息送达<br>
   *   如果，客户端离线，则暂时在服务器端保存消息，并在客户端在线时发送
   *   TODO: 需要明确指定是否保留消息
   *   TODO: 保留的消息要有实效
   * @param {string} uid 用户ID
   * @param {string} tag 消息分类
   * @param {object} message 消息体
   */
  emit: function(uid, tag, message) {
    storage.clients(uid, function(err, sockets) {

      // 非活跃客户端，先保存到数据库
      if (sockets.length <= 0) {
        storage.save(uid, tag, message, function(err) {
          if (err) {
            return log.error(err);
          }
          log.debug("Message successfully saved. " + tag)
        });
        return;
      }

      // 如果客户端是活跃的，则发送消息
      _.each(sockets, function(socket) {
        io.sockets.connected[socket.sid].emit(tag, message);
      });
      log.debug("Message is successfully sent. " + tag)
    });
  }
};
