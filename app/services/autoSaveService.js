'use client';

/**
 * Auto-save service for form data
 * Provides functionality to automatically save form data at regular intervals
 * or after user interactions, with debouncing to prevent excessive saves
 */
import { db } from '@/lib/firebase/firebaseClient';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { prepareAnamnesisForFirestore } from './structuredAnamnesisService';

class AutoSaveService {
  constructor() {
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
  setCallbacks(callbacks = {}) {
    this.callbacks = {
      ...this.callbacks,
      ...callbacks
    };
  }

  /**
   * Schedule a save operation with debouncing
   * @param {string} patientId - ID of the patient
   * @param {Object} formData - Form data to save
   * @param {Object} metadata - Additional metadata for the save operation
   */
  scheduleAutoSave(patientId, formData, metadata = {}) {
    // Clear any existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.pendingSave = true;

    // Schedule a new save
    this.saveTimeout = setTimeout(() => {
      this.executeAutoSave(patientId, formData, metadata);
    }, this.minTimeBetweenSaves);
  }

  /**
   * Force an immediate save operation
   * @param {string} patientId - ID of the patient
   * @param {Object} formData - Form data to save
   * @param {Object} metadata - Additional metadata for the save operation
   * @returns {Promise} - Promise that resolves when the save is complete
   */
  forceSave(patientId, formData, metadata = {}) {
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
  async executeAutoSave(patientId, formData, metadata = {}, isForced = false) {
    // Don't save if no patient ID or form data
    if (!patientId || !formData || Object.keys(formData).length === 0) {
      this.pendingSave = false;
      return Promise.resolve();
    }

    // Don't save if not enough time has passed since the last save (unless forced)
    const now = Date.now();
    if (!isForced && now - this.lastSaveTime < this.minTimeBetweenSaves) {
      return new Promise(resolve => {
        this.saveTimeout = setTimeout(() => {
          this.executeAutoSave(patientId, formData, metadata).then(resolve);
        }, this.minTimeBetweenSaves);
      });
    }

    // Mark save in progress
    this.pendingSave = true;
    this.lastSaveTime = now;

    // Call onSaveStart callback if provided
    if (typeof this.callbacks.onSaveStart === 'function') {
      this.callbacks.onSaveStart();
    }

    try {
      // Default metadata
      const defaultMetadata = {
        updatedAt: serverTimestamp(),
        updatedBy: metadata.userId || 'unknown',
        lastModifiedStep: metadata.currentStepId || '',
        isCompleted: metadata.isCompleted || false,
        completedSteps: metadata.completedSteps || [],
        autoSaved: !isForced
      };

      // Merge provided metadata with defaults
      const finalMetadata = {
        ...defaultMetadata,
        ...metadata
      };

      // Prepare data for Firestore if needed
      let structuredData = null;
      if (metadata.visibleSteps && metadata.visibleSteps.length > 0) {
        structuredData = prepareAnamnesisForFirestore(
          formData,
          metadata.visibleSteps,
          { uid: patientId }
        );
      }

      // Store anamnesis data in a subcollection of the users collection
      const anamnesisRef = doc(db, 'users', patientId, 'anamnesis', 'current');

      // Create the document data to save
      const documentData = {
        formulario: formData,
        ...finalMetadata
      };

      // Add structured data if available
      if (structuredData) {
        documentData.structuredData = structuredData;
      }

      // Save to Firestore with merge option to preserve existing data
      await setDoc(anamnesisRef, documentData, { merge: true });

      // Call onSaveSuccess callback if provided
      if (typeof this.callbacks.onSaveSuccess === 'function') {
        this.callbacks.onSaveSuccess();
      }

      console.log(`Auto-saved form data at ${new Date().toLocaleTimeString()}`);
      this.pendingSave = false;
      return Promise.resolve();
    } catch (error) {
      console.error('Error auto-saving form data:', error);

      // Call onSaveError callback if provided
      if (typeof this.callbacks.onSaveError === 'function') {
        this.callbacks.onSaveError(error);
      }

      this.pendingSave = false;
      return Promise.reject(error);
    }
  }

  /**
   * Check if there's a pending save operation
   * @returns {boolean} - Whether there's a pending save operation
   */
  hasPendingSave() {
    return this.pendingSave;
  }

  /**
   * Start periodic auto-saving
   * @param {string} patientId - ID of the patient
   * @param {Function} getFormData - Function that returns the current form data
   * @param {Function} getMetadata - Function that returns the current metadata
   * @returns {number} - Interval ID for the auto-save timer
   */
  startPeriodicAutoSave(patientId, getFormData, getMetadata) {
    // Stop any existing interval
    this.stopPeriodicAutoSave();

    // Start a new interval
    const intervalId = setInterval(() => {
      const formData = typeof getFormData === 'function' ? getFormData() : {};
      const metadata = typeof getMetadata === 'function' ? getMetadata() : {};

      this.executeAutoSave(patientId, formData, metadata);
    }, this.saveInterval);

    return intervalId;
  }

  /**
   * Stop periodic auto-saving
   * @param {number} intervalId - Interval ID returned by startPeriodicAutoSave
   */
  stopPeriodicAutoSave(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  /**
   * Set the interval for periodic auto-saves
   * @param {number} milliseconds - Interval in milliseconds
   */
  setAutoSaveInterval(milliseconds) {
    if (typeof milliseconds === 'number' && milliseconds >= 1000) {
      this.saveInterval = milliseconds;
    }
  }
}

// Create a singleton instance
const autoSaveService = new AutoSaveService();

export default autoSaveService;
