"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDataSync = useDataSync;

var _syncService = require("@/app/services/syncService");

var _react = require("react");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Hook para gestionar la sincronización de datos entre colecciones de Firestore
 * Este hook proporciona funciones para:
 * 1. Sincronizar datos entre users y patients
 * 2. Verificar y reparar inconsistencias
 * 3. Estado de la última sincronización
 *
 * @param {string} userId - ID del usuario a sincronizar
 * @returns {Object} - Funciones y estado de sincronización
 */
function useDataSync(userId) {
  var _useState = (0, _react.useState)(null),
      _useState2 = _slicedToArray(_useState, 2),
      lastSync = _useState2[0],
      setLastSync = _useState2[1];

  var _useState3 = (0, _react.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      isSyncing = _useState4[0],
      setIsSyncing = _useState4[1];

  var _useState5 = (0, _react.useState)(null),
      _useState6 = _slicedToArray(_useState5, 2),
      syncError = _useState6[0],
      setSyncError = _useState6[1];

  var _useState7 = (0, _react.useState)({
    syncCount: 0,
    repairCount: 0,
    lastRepairResult: null
  }),
      _useState8 = _slicedToArray(_useState7, 2),
      syncStats = _useState8[0],
      setSyncStats = _useState8[1]; // Función para sincronizar datos de perfil


  var syncProfileData = function syncProfileData(profileData) {
    return regeneratorRuntime.async(function syncProfileData$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (userId) {
              _context.next = 3;
              break;
            }

            setSyncError('ID de usuario es requerido para sincronización');
            return _context.abrupt("return", false);

          case 3:
            setIsSyncing(true);
            setSyncError(null);
            _context.prev = 5;
            _context.next = 8;
            return regeneratorRuntime.awrap((0, _syncService.syncUserProfileData)(userId, profileData));

          case 8:
            setLastSync(new Date());
            setSyncStats(function (prev) {
              return _objectSpread({}, prev, {
                syncCount: prev.syncCount + 1
              });
            });
            return _context.abrupt("return", true);

          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](5);
            setSyncError(_context.t0.message || 'Error de sincronización');
            console.error('Error en sincronización:', _context.t0);
            return _context.abrupt("return", false);

          case 18:
            _context.prev = 18;
            setIsSyncing(false);
            return _context.finish(18);

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[5, 13, 18, 21]]);
  }; // Función para verificar y reparar inconsistencias


  var verifyAndRepair = function verifyAndRepair() {
    var result;
    return regeneratorRuntime.async(function verifyAndRepair$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (userId) {
              _context2.next = 3;
              break;
            }

            setSyncError('ID de usuario es requerido para reparación');
            return _context2.abrupt("return", null);

          case 3:
            setIsSyncing(true);
            setSyncError(null);
            _context2.prev = 5;
            _context2.next = 8;
            return regeneratorRuntime.awrap((0, _syncService.verifyAndRepairUserProfile)(userId));

          case 8:
            result = _context2.sent;
            setLastSync(new Date());
            setSyncStats(function (prev) {
              return _objectSpread({}, prev, {
                repairCount: prev.repairCount + 1,
                lastRepairResult: result
              });
            });
            return _context2.abrupt("return", result);

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](5);
            setSyncError(_context2.t0.message || 'Error de reparación');
            console.error('Error en reparación:', _context2.t0);
            return _context2.abrupt("return", null);

          case 19:
            _context2.prev = 19;
            setIsSyncing(false);
            return _context2.finish(19);

          case 22:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[5, 14, 19, 22]]);
  }; // Efecto para verificar automáticamente inconsistencias al montar


  (0, _react.useEffect)(function () {
    if (userId) {
      verifyAndRepair()["catch"](console.error);
    } // No incluimos verifyAndRepair en las dependencias para evitar loops
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [userId]);
  return {
    syncProfileData: syncProfileData,
    verifyAndRepair: verifyAndRepair,
    lastSync: lastSync,
    isSyncing: isSyncing,
    syncError: syncError,
    syncStats: syncStats
  };
}