/**
 * Module dependencies.
 */

"use strict";

global.light = require("light-core");

var log           = light.framework.log
  , cache         = light.framework.cache
  , rider         = light.model.rider
  , server        = require("./lib/server")
  , constant      = require("./lib/constant");

cache.manager.init(constant.DATABASE, function(err) {
  if (err) {
    log.error(err);
    return process.exit(1);  // 初始化出错，拒绝启动
  }

  // 初始化rider
  rider.init();

  // 启动服务
  server.start();

});
