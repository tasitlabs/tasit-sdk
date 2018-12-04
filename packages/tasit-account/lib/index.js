"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tasitAccount = require("./tasitAccount");

Object.keys(_tasitAccount).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _tasitAccount[key];
    }
  });
});