"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _firebaseClient = require("./firebase/firebaseClient");

Object.keys(_firebaseClient).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _firebaseClient[key];
    }
  });
});