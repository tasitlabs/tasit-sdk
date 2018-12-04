"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tasitSdk = require("./tasitSdk");

Object.keys(_tasitSdk).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _tasitSdk[key];
    }
  });
});