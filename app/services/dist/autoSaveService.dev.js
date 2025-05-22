"use strict";
'use client';
/**
 * Auto-save service for form data
 * Provides functionality to automatically save form data at regular intervals
 * or after user interactions, with debouncing to prevent excessive saves
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _firebaseClient = require("@/lib/firebase/firebaseClient");

var _firestore = require("firebase/firestore");

var _structuredAnamnesisService = require("./structuredAnamnesisService");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AutoSaveService =
/*#__PURE__*/
function () {
  function AutoSaveService() {
    _classCallCheck(this, AutoSaveService);

    this.saveTimeout = null;
    this.lastSaveTime = Date.now();
    this.saveInterval = 30000; // 30 seconds

    this.minTimeBetweenSaves = 3000; // 3 seconds

    this.pendingSave = false;
    this.callbacks = {
      onSaveStart: null,
      onSaveSuccess: null,
      onSaveError: null
    };
  }
  /**
   * Set callback functions for save events
   * @param {Object} callbacks - Object containing callback functions
   */


  _createClass(AutoSaveService, [{
    key: "setCallbacks",
    value: function setCallbacks() {
      var callbacks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.callbacks = _objectSpread({}, this.callbacks, {}, callbacks);
    }
    /**
     * Schedule a save operation with debouncing
     * @param {string} patientId - ID of the patient
     * @param {Object} formData - Form data to save
     * @param {Object} metadata - Additional metadata for the save operation
     */

  }, {
    key: "scheduleAutoSave",
    value: function scheduleAutoSave(patientId, formData) {
      var _this = this;

      var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // Clear any existing timeout
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      this.pendingSave = true; // Schedule a new save

      this.saveTimeout = setTimeout(function () {
        _this.executeAutoSave(patientId, formData, metadata);
      }, this.minTimeBetweenSaves);
    }
    /**
     * Force an immediate save operation
     * @param {string} patientId - ID of the patient
     * @param {Object} formData - Form data to save
     * @param {Object} metadata - Additional metadata for the save operation
     * @returns {Promise} - Promise that resolves when the save is complete
     */

  }, {
    key: "forceSave",
    value: function forceSave(patientId, formData) {
      var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // Clear any existing timeout
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }

      return this.executeAutoSave(patientId, formData, metadata, true);
    }
    /**
     * Execute the actual save operation
     * @param {string} patientId - ID of the patient
     * @param {Object} formData - Form data to save
     * @param {Object} metadata - Additional metadata for the save operation
     * @param {boolean} isForced - Whether this is a forced save
     * @returns {Promise} - Promise that resolves when the save is complete
     */

  }, {
    key: "executeAutoSave",
    value: function executeAutoSave(patientId, formData) {
      var _this2 = this;

      var metadata,
          isForced,
          now,
          defaultMetadata,
          finalMetadata,
          structuredData,
          anamnesisRef,
          documentData,
          _args = arguments;
      return regeneratorRuntime.async(function executeAutoSave$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              metadata = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
              isForced = _args.length > 3 && _args[3] !== undefined ? _args[3] : false;

              if (!(!patientId || !formData || Object.keys(formData).length === 0)) {
                _context.next = 5;
                break;
              }

              this.pendingSave = false;
              return _context.abrupt("return", Promise.resolve());

            case 5:
              // Don't save if not enough time has passed since the last save (unless forced)
              now = Date.now();

              if (!(!isForced && now - this.lastSaveTime < this.minTimeBetweenSaves)) {
                _context.next = 8;
                break;
              }

              return _context.abrupt("return", new Promise(function (resolve) {
                _this2.saveTimeout = setTimeout(function () {
                  _this2.executeAutoSave(patientId, formData, metadata).then(resolve);
                }, _this2.minTimeBetweenSaves);
              }));

            case 8:
              // Mark save in progress
              this.pendingSave = true;
              this.lastSaveTime = now; // Call onSaveStart callback if provided

              if (typeof this.callbacks.onSaveStart === 'function') {
                this.callbacks.onSaveStart();
              }

              _context.prev = 11;
              // Default metadata
              defaultMetadata = {
                updatedAt: (0, _firestore.serverTimestamp)(),
                updatedBy: metadata.userId || 'unknown',
                lastModifiedStep: metadata.currentStepId || '',
                isCompleted: metadata.isCompleted || false,
                completedSteps: metadata.completedSteps || [],
                autoSaved: !isForced
              }; // Merge provided metadata with defaults

              finalMetadata = _objectSpread({}, defaultMetadata, {}, metadata); // Prepare data for Firestore if needed

              structuredData = null;

              if (metadata.visibleSteps && metadata.visibleSteps.length > 0) {
                structuredData = (0, _structuredAnamnesisService.prepareAnamnesisForFirestore)(formData, metadata.visibleSteps, {
                  uid: patientId
                });
              } // Store anamnesis data in a subcollection of the users collection


              anamnesisRef = (0, _firestore.doc)(_firebaseClient.db, 'users', patientId, 'anamnesis', 'current'); // Create the document data to save

              documentData = _objectSpread({
                formulario: formData
              }, finalMetadata); // Add structured data if available

              if (structuredData) {
                documentData.structuredData = structuredData;
              } // Save to Firestore with merge option to preserve existing data


              _context.next = 21;
              return regeneratorRuntime.awrap((0, _firestore.setDoc)(anamnesisRef, documentData, {
                merge: true
              }));

            case 21:
              // Call onSaveSuccess callback if provided
              if (typeof this.callbacks.onSaveSuccess === 'function') {
                this.callbacks.onSaveSuccess();
              }

              console.log("Auto-saved form data at ".concat(new Date().toLocaleTimeString()));
              this.pendingSave = false;
              return _context.abrupt("return", Promise.resolve());

            case 27:
              _context.prev = 27;
              _context.t0 = _context["catch"](11);
              console.error('Error auto-saving form data:', _context.t0); // Call onSaveError callback if provided

              if (typeof this.callbacks.onSaveError === 'function') {
                this.callbacks.onSaveError(_context.t0);
              }

              this.pendingSave = false;
              return _context.abrupt("return", Promise.reject(_context.t0));

            case 33:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[11, 27]]);
    }
    /**
     * Check if there's a pending save operation
     * @returns {boolean} - Whether there's a pending save operation
     */

  }, {
    key: "hasPendingSave",
    value: function hasPendingSave() {
      return this.pendingSave;
    }
    /**
     * Start periodic auto-saving
     * @param {string} patientId - ID of the patient
     * @param {Function} getFormData - Function that returns the current form data
     * @param {Function} getMetadata - Function that returns the current metadata
     * @returns {number} - Interval ID for the auto-save timer
     */

  }, {
    key: "startPeriodicAutoSave",
    value: function startPeriodicAutoSave(patientId, getFormData, getMetadata) {
      var _this3 = this;

      // Stop any existing interval
      this.stopPeriodicAutoSave(); // Start a new interval

      var intervalId = setInterval(function () {
        var formData = typeof getFormData === 'function' ? getFormData() : {};
        var metadata = typeof getMetadata === 'function' ? getMetadata() : {};

        _this3.executeAutoSave(patientId, formData, metadata);
      }, this.saveInterval);
      return intervalId;
    }
    /**
     * Stop periodic auto-saving
     * @param {number} intervalId - Interval ID returned by startPeriodicAutoSave
     */

  }, {
    key: "stopPeriodicAutoSave",
    value: function stopPeriodicAutoSave(intervalId) {
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
    /**
     * Set the interval for periodic auto-saves
     * @param {number} milliseconds - Interval in milliseconds
     */

  }, {
    key: "setAutoSaveInterval",
    value: function setAutoSaveInterval(milliseconds) {
      if (typeof milliseconds === 'number' && milliseconds >= 1000) {
        this.saveInterval = milliseconds;
      }
    }
  }]);

  return AutoSaveService;
}(); // Create a singleton instance


var autoSaveService = new AutoSaveService();
var _default = autoSaveService;
exports["default"] = _default;