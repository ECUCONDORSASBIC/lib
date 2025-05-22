"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAuth = void 0;

var _AuthContext = require("@/app/contexts/AuthContext");

// Wrapper para el hook de autenticación real
var useAuth = _AuthContext.useAuth;
exports.useAuth = useAuth;