/**
 * @file 推送通知<br>
 *  使用socket.io实现推送<br>
 * @author r2space@gmail.com
 * @module light.bridge.socket.client
 * @version 1.0.0
 */


"use strict";

var light       = require("light-core")
  , socket      = light.util.socketclient
  , config      = light.framework.config
  , util        = light.lang.util
  , log         = light.framework.log
  ;

/**
 * @desc 给指定用户发送消息
 * @param {string} uid
 * @param {string} tag
 * @param {object} msg
 * @param {Function} callback 回调函数
 */
exports.push = function(uid, tag, msg, callback) {

  var uri = util.format("%s://%s:%s"
      , config.push.socketProtocol
      , config.push.socketServer
      , config.push.socketPort)

    , client = socket(uri, { query: "server=true", forceNew: true, timeout: 1000, reconnection: false });

  // 连接并发送消息
  client.on("connect", function() {
    client.emit("light.push", {uid: uid, tag: tag, message: msg});
  });

  // 连接出错
  client.on("connect_error", function(err) {
    log.error(err, uid);
    callback(err);
  });

  // 服务端接到消息以后断开，触发client的disconnect方法
  client.on("disconnect", function() {
    client.disconnect();
    callback();
  });
};
