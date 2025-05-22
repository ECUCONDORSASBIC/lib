"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePatientData = usePatientData;

var _firebaseClient = require("@/lib/firebase/firebaseClient");

var _firestore = require("firebase/firestore");

var _react = require("react");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Verifica si existe un documento en la colección 'patients' y lo crea si no existe
 * basado en los datos del documento en la colección 'users'.
 * @param {string} patientId - ID del paciente/usuario
 * @param {Object} firestoreDb - Instancia de Firestore
 * @returns {Promise<boolean>} - Indica si el documento existe o fue creado exitosamente
 */
function checkAndCreatePatientDoc(patientId, firestoreDb) {
  var patientRef, patientSnap, userRef, userSnap;
  return regeneratorRuntime.async(function checkAndCreatePatientDoc$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(!patientId || !firestoreDb)) {
            _context.next = 3;
            break;
          }

          console.error('checkAndCreatePatientDoc: patientId y firestoreDb son requeridos');
          return _context.abrupt("return", false);

        case 3:
          _context.prev = 3;
          patientRef = (0, _firestore.doc)(firestoreDb, 'patients', patientId);
          _context.next = 7;
          return regeneratorRuntime.awrap((0, _firestore.getDoc)(patientRef));

        case 7:
          patientSnap = _context.sent;

          if (!patientSnap.exists()) {
            _context.next = 11;
            break;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log("[usePatientData] Documento patients/".concat(patientId, " ya existe."));
          }

          return _context.abrupt("return", true);

        case 11:
          userRef = (0, _firestore.doc)(firestoreDb, 'users', patientId);
          _context.next = 14;
          return regeneratorRuntime.awrap((0, _firestore.getDoc)(userRef));

        case 14:
          userSnap = _context.sent;

          if (!userSnap.exists()) {
            _context.next = 17;
            break;
          }

          return _context.abrupt("return", true);

        case 17:
          console.warn("[usePatientData] No se encontr\xF3 el documento users/".concat(patientId, " para crear el documento del paciente."));
          return _context.abrupt("return", false);

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](3);
          console.error('[usePatientData] Error verificando/creando documento del paciente:', _context.t0);
          return _context.abrupt("return", false);

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 21]]);
}

function usePatientData(patientId) {
  var _useState = (0, _react.useState)(null),
      _useState2 = _slicedToArray(_useState, 2),
      patientData = _useState2[0],
      setPatientData = _useState2[1];

  var _useState3 = (0, _react.useState)(true),
      _useState4 = _slicedToArray(_useState3, 2),
      loading = _useState4[0],
      setLoading = _useState4[1];

  var _useState5 = (0, _react.useState)(false),
      _useState6 = _slicedToArray(_useState5, 2),
      hasAnamnesisData = _useState6[0],
      setHasAnamnesisData = _useState6[1];

  var _useState7 = (0, _react.useState)(false),
      _useState8 = _slicedToArray(_useState7, 2),
      isAnamnesisComplete = _useState8[0],
      setIsAnamnesisComplete = _useState8[1]; // Use refs to store unsubscribe functions to prevent them from triggering re-renders


  var unsubscribeUserRef = (0, _react.useRef)(null);
  var unsubscribePatientRef = (0, _react.useRef)(null);
  var unsubscribeAnamnesisRef = (0, _react.useRef)(null); // Use ref to track initialization status

  var isInitializedRef = (0, _react.useRef)(false); // Memoized function to handle profile updates from anamnesis

  var handleAnamnesisProfileUpdate = (0, _react.useCallback)(function _callee(patientId, anamnesisData) {
    var _ref, updatePatientProfile;

    return regeneratorRuntime.async(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (anamnesisData) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return");

          case 3:
            _context2.next = 5;
            return regeneratorRuntime.awrap(Promise.resolve().then(function () {
              return _interopRequireWildcard(require('@/app/services/anamnesisService'));
            }));

          case 5:
            _ref = _context2.sent;
            updatePatientProfile = _ref.updatePatientProfile;
            _context2.next = 9;
            return regeneratorRuntime.awrap(updatePatientProfile(patientId, anamnesisData));

          case 9:
            _context2.next = 14;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](0);
            console.error('[usePatientData] Error updating profile from anamnesis:', _context2.t0);

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[0, 11]]);
  }, []);
  (0, _react.useEffect)(function () {
    if (!patientId) {
      setLoading(false);
      return;
    } // Always clean up previous listeners before setting up new ones


    var cleanupListeners = function cleanupListeners() {
      if (unsubscribeUserRef.current) {
        unsubscribeUserRef.current();
        unsubscribeUserRef.current = null;
      }

      if (unsubscribePatientRef.current) {
        unsubscribePatientRef.current();
        unsubscribePatientRef.current = null;
      }

      if (unsubscribeAnamnesisRef.current) {
        unsubscribeAnamnesisRef.current();
        unsubscribeAnamnesisRef.current = null;
      }
    }; // Only proceed if we haven't already initialized for this patientId


    if (isInitializedRef.current) {
      return;
    } // Mark as initialized to prevent duplicate setups


    isInitializedRef.current = true;
    setLoading(true);

    var setupListeners = function setupListeners() {
      var patientDocEnsured, userRef, patientRefDoc, conversacionalRef;
      return regeneratorRuntime.async(function setupListeners$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return regeneratorRuntime.awrap((0, _firebaseClient.ensureFirebase)());

            case 3:
              _context4.next = 5;
              return regeneratorRuntime.awrap(checkAndCreatePatientDoc(patientId, _firebaseClient.db));

            case 5:
              patientDocEnsured = _context4.sent;

              if (!patientDocEnsured && process.env.NODE_ENV === 'development') {
                console.warn("[usePatientData] No se pudo asegurar la existencia del documento patients/".concat(patientId, ". Los listeners podr\xEDan no funcionar como se espera."));
              } // Listener para la colección 'users'


              userRef = (0, _firestore.doc)(_firebaseClient.db, 'users', patientId);
              unsubscribeUserRef.current = (0, _firestore.onSnapshot)(userRef, function (userSnapshot) {
                if (userSnapshot.exists()) {
                  var userData = userSnapshot.data();

                  if (process.env.NODE_ENV === 'development') {
                    console.log('[usePatientData] Real-time update from users collection:', {
                      userId: patientId
                    });
                  } // Actualizar patientData, manteniendo otros datos si existen


                  setPatientData(function (prevData) {
                    if (!prevData) return _objectSpread({}, userData, {
                      id: patientId
                    });
                    return _objectSpread({}, prevData, {}, userData, {
                      id: patientId
                    });
                  });
                }
              }, function (error) {
                console.error('[usePatientData] Error en escucha en tiempo real de users:', error);
              }); // Listener para la colección 'patients'

              patientRefDoc = (0, _firestore.doc)(_firebaseClient.db, 'patients', patientId);
              unsubscribePatientRef.current = (0, _firestore.onSnapshot)(patientRefDoc, function (patientSnapshot) {
                if (patientSnapshot.exists()) {
                  var currentPatientData = patientSnapshot.data();

                  if (process.env.NODE_ENV === 'development') {
                    console.log('[usePatientData] Real-time update from patients collection:', {
                      patientId: patientId
                    });
                  } // Esta es la principal fuente de verdad, sobrescribe userData si existe


                  setPatientData(function (prevData) {
                    return _objectSpread({}, prevData, {
                      id: patientId
                    }, currentPatientData);
                  });
                }
              }, function (error) {
                console.error('[usePatientData] Error en escucha en tiempo real de patients:', error);
              }); // Listener para la colección 'anamnesis'

              conversacionalRef = (0, _firestore.doc)(_firebaseClient.db, 'patients', patientId, 'anamnesis', 'conversacional');
              unsubscribeAnamnesisRef.current = (0, _firestore.onSnapshot)(conversacionalRef, function _callee2(conversacionalSnap) {
                var anamnesisData, anamnesisCollRef, anamnesisSnap, generalAnamnesisData;
                return regeneratorRuntime.async(function _callee2$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.prev = 0;

                        if (!conversacionalSnap.exists()) {
                          _context3.next = 9;
                          break;
                        }

                        anamnesisData = conversacionalSnap.data();
                        setHasAnamnesisData(true);
                        setIsAnamnesisComplete(anamnesisData.isCompleted || false); // Use memoized function for profile update

                        _context3.next = 7;
                        return regeneratorRuntime.awrap(handleAnamnesisProfileUpdate(patientId, anamnesisData));

                      case 7:
                        _context3.next = 23;
                        break;

                      case 9:
                        // Solo verificar otros documentos si el conversacional no existe
                        anamnesisCollRef = (0, _firestore.collection)(_firebaseClient.db, 'patients', patientId, 'anamnesis');
                        _context3.next = 12;
                        return regeneratorRuntime.awrap((0, _firestore.getDocs)(anamnesisCollRef));

                      case 12:
                        anamnesisSnap = _context3.sent;

                        if (anamnesisSnap.empty) {
                          _context3.next = 21;
                          break;
                        }

                        generalAnamnesisData = anamnesisSnap.docs[0].data();
                        setHasAnamnesisData(true);
                        setIsAnamnesisComplete(generalAnamnesisData.isCompleted || false); // Use memoized function for profile update

                        _context3.next = 19;
                        return regeneratorRuntime.awrap(handleAnamnesisProfileUpdate(patientId, generalAnamnesisData));

                      case 19:
                        _context3.next = 23;
                        break;

                      case 21:
                        setHasAnamnesisData(false);
                        setIsAnamnesisComplete(false);

                      case 23:
                        _context3.next = 28;
                        break;

                      case 25:
                        _context3.prev = 25;
                        _context3.t0 = _context3["catch"](0);
                        console.error('[usePatientData] Error procesando datos de anamnesis:', _context3.t0);

                      case 28:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, null, null, [[0, 25]]);
              }, function (error) {
                console.error('[usePatientData] Error en escucha en tiempo real de anamnesis:', error);
              });
              _context4.next = 19;
              break;

            case 15:
              _context4.prev = 15;
              _context4.t0 = _context4["catch"](0);
              console.error('[usePatientData] Error setting up real-time listeners:', _context4.t0);
              setPatientData(null);

            case 19:
              _context4.prev = 19;
              setLoading(false);
              return _context4.finish(19);

            case 22:
            case "end":
              return _context4.stop();
          }
        }
      }, null, null, [[0, 15, 19, 22]]);
    };

    setupListeners(); // Cleanup function when component unmounts or patientId changes

    return function () {
      if (process.env.NODE_ENV === 'development') {
        console.log('[usePatientData] Cleaning up listeners for patientId:', patientId);
      }

      cleanupListeners();
      isInitializedRef.current = false;
    };
  }, [patientId, handleAnamnesisProfileUpdate]); // Only re-run when patientId or memoized function changes

  return {
    patientData: patientData,
    loading: loading,
    hasAnamnesisData: hasAnamnesisData,
    isAnamnesisComplete: isAnamnesisComplete
  };
}