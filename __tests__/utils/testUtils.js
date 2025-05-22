import { render } from '@testing-library/react';
import { NextRouter } from 'next/router';

// Mock data for common entities
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: '/avatars/default.jpg',
  role: 'patient',
};

export const mockDoctor = {
  id: 'test-doctor-id',
  email: 'doctor@example.com',
  displayName: 'Dr. Example',
  photoURL: '/avatars/doctor.jpg',
  specialty: 'Cardiología',
  role: 'doctor',
};

export const mockAppointment = {
  id: 'test-appointment-id',
  date: new Date().toISOString(),
  duration: 30,
  status: 'scheduled',
  type: 'telemedicina',
  reason: 'Consulta de control',
  patientId: 'test-patient-id',
  doctorId: 'test-doctor-id',
};

// Common mock functions
export const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  onSnapshot: jest.fn(),
};

// Mock next router with all commonly used methods
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  reload: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  pathname: '/',
  query: {},
  asPath: '/',
  isFallback: false,
};

// Custom render with providers and mocks
export function renderWithProviders(ui, {
  route = '/',
  router = mockRouter,
  user = null,
  ...renderOptions
} = {}) {
  // Add providers as needed (e.g., AuthProvider, ThemeProvider) 
  return {
    ...render(ui, renderOptions),
    // Add any custom queries or utilities here
    router,
  };
}

// Integration-style test helper to mock Firestore data
export function mockFirestoreData(collection, documents) {
  const mockSnapshot = {
    docs: documents.map(doc => ({
      id: doc.id,
      data: () => ({ ...doc }),
      exists: true,
    })),
    forEach: jest.fn(callback => {
      documents.forEach((doc, index) => {
        callback({
          id: doc.id,
          data: () => ({ ...doc }),
          exists: true,
        }, index);
      });
    }),
    empty: documents.length === 0,
  };
  
  mockFirestore.get.mockResolvedValue(mockSnapshot);
  mockFirestore.onSnapshot.mockImplementation(callback => {
    callback(mockSnapshot);
    return jest.fn(); // Return unsubscribe function
  });
}

// Mock service worker responses
export const mockSuccessResponse = (data) => Promise.resolve({
  ok: true,
  json: () => Promise.resolve(data),
});

export const mockErrorResponse = (status = 400, message = 'Bad request') => Promise.resolve({
  ok: false,
  status,
  statusText: message,
  json: () => Promise.resolve({ message }),
});

// Helper for testing real-time services (telemedicine, notifications)
export function mockRealtimeService() {
  return {
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    onMessage: jest.fn(),
    onStatusChange: jest.fn(),
    sendMessage: jest.fn().mockResolvedValue(true),
  };
}
