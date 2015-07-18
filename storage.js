/**
 * @file 存储
 * @author r2space@gmail.com
 * @module light.bridge.socket.storage
 * @version 1.0.0
 */


var light     = require("light-core")
  , conn      = light.framework.mongoconn
  , _         = light.util.underscore
  , constant  = require("./constant")
  ;

var datas = [];

/**
 * @desc 添加终端连接
 * @param {string} uid
 * @param {string} tag
 * @param {object} msg
 * @param {Function} callback 回调函数
 */
exports.join = function(sid, uid, address, callback) {

  datas.push({
    sid: sid,
    uid: uid,
    address: address
  });

  callback(undefined, datas);
};

/**
 * @desc 删除终端连接
 * @param {string} uid
 * @param {Function} callback 回调函数
 */
exports.leave = function(sid, callback) {
  datas = _.without(datas, _.findWhere(datas, {sid: sid}));
  callback(undefined, datas);
};

/**
 * @desc 获取连接连接中得终端
 * @param {string} uid
 * @param {Function} callback 回调函数
 */
exports.clients = function(uid, callback) {
  callback(undefined, _.where(datas, {uid: uid}));
};

/**
 * @desc 获取指定用户的通知一览
 * @param {string} uid
 * @param {Function} callback 回调函数
 */
exports.list = function(uid, callback) {
  conn.nativedb(constant.DATABASE).open(function(err, db) {
    db.collection(constant.COLLECTION_NOTICE).find({uid: uid}).toArray(function(err, result) {
      db.close();
      callback(err, result);
    });
  });
};

/**
 * @desc 保存通知
 * @param {string} uid
 * @param {string} tag
 * @param {object} msg
 * @param {Function} callback 回调函数
 */
exports.save = function(uid, tag, message, callback) {
  conn.nativedb(constant.DATABASE).open(function(err, db) {
    var data = {
      uid: uid,
      tag: tag,
      message: message,
      valid: 1,
      createAt: new Date(),
      createBy: uid
    };
    db.collection(constant.COLLECTION_NOTICE).insert(data, {w: 1}, function(err, result) {
      db.close();
      callback(err, result);
    });
  });
};

/**
 * @desc 删除通知
 * @param {string} uid
 * @param {Function} callback 回调函数
 */
exports.remove = function(uid, callback) {
  conn.nativedb(constant.DATABASE).open(function(err, db) {
    db.collection(constant.COLLECTION_NOTICE).remove({uid: uid}, {w: 1}, function(err, result) {
      db.close();
      callback(err, result);
    });
  });
};
