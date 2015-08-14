/**
 * @file 存储<br>
 *   负责保存Websocket的客户端连接
 *   负责保存未被发送的消息
 * @author r2space@gmail.com
 * @module light.bridge.socket.storage
 * @version 1.0.0
 */


var light     = require("light-core")
  , _         = light.util.underscore
  , context   = light.framework.context
  , rider     = light.model.rider
  , constant  = require("./constant")
  ;

var datas = [];

/**
 * @desc 添加终端连接
 * @param {string} sid
 * @param {string} uid
 * @param {object} address
 * @param {Function} callback 回调函数
 */
exports.join = function (sid, uid, address, callback) {

  datas.push({
    sid: sid,
    uid: uid,
    address: address
  });
console.log(datas);
  callback(undefined, datas);
};

/**
 * @desc 删除终端连接
 * @param {string} sid
 * @param {Function} callback 回调函数
 */
exports.leave = function (sid, callback) {
  datas = _.without(datas, _.findWhere(datas, {sid: sid}));
  callback(undefined, datas);
};

/**
 * @desc 获取连接连接中得终端
 * @param {string} uid
 * @param {Function} callback 回调函数
 */
exports.clients = function (uid, callback) {
  callback(undefined, _.where(datas, {uid: uid}));
};

/**
 * @desc 获取指定用户的通知一览
 * @param {string} user
 * @param {Function} callback 回调函数
 */
exports.list = function (user, callback) {

  rider.queue.list(new context().create(user, constant.DATABASE), {condition: {user: user}}, callback);
};

/**
 * @desc 保存通知
 * @param {string} user
 * @param {string} tag
 * @param {object} message
 * @param {Function} callback 回调函数
 */
exports.save = function (user, tag, message, callback) {

  var handler = new context().create(user, constant.DATABASE)
    , data = {
      user: user,
      tag: tag,
      message: message
    };
  rider.queue.add(handler, {data: data}, callback);
};

/**
 * @desc 删除通知
 * @param {string} user
 * @param {Function} callback 回调函数
 */
exports.remove = function (user, callback) {
  rider.queue.remove(new context().create(user, constant.DATABASE), {condition: {user: user}}, callback);
};
