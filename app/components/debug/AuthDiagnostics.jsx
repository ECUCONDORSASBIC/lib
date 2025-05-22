"use client";

import { auth, ensureFirebase, getFirebaseStatus } from '@/lib/firebase/firebaseClient';
import { useEffect, useState } from 'react';

/**
 * Auth Diagnostics Component
 *
 * A simple component to help diagnose authentication issues.
 * Can be included in auth-related pages to provide debug information.
 */
const AuthDiagnostics = ({ showDetails = false }) => {
  const [status, setStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      try {
        // Ensure Firebase is initialized
        await ensureFirebase();

        // Get Firebase status
        const fbStatus = getFirebaseStatus();
        setStatus(fbStatus);

        // Check current user
        setCurrentUser(auth?.currentUser || null);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="text-xs text-gray-500">Checking auth status...</div>;
  }

  const isAuthAvailable = status?.services?.auth === true;
  const isUserAuthenticated = !!currentUser;

  return (
    <div className="text-xs bg-gray-100 p-2 rounded border border-gray-300 mt-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">Auth Status:</span>
        <span className={isAuthAvailable ? "text-green-600" : "text-red-600"}>
          {isAuthAvailable ? "Available" : "Unavailable"}
        </span>

        <span className="mx-2">|</span>

        <span className="font-medium">User:</span>
        <span className={isUserAuthenticated ? "text-green-600" : "text-yellow-600"}>
          {isUserAuthenticated ? "Authenticated" : "Not Authenticated"}
        </span>
      </div>

      {showDetails && (
        <div className="mt-2 space-y-1">
          {isUserAuthenticated && (
            <>
              <p><span className="font-medium">Email:</span> {currentUser.email}</p>
              <p><span className="font-medium">UID:</span> {currentUser.uid}</p>
              {currentUser.emailVerified !== undefined && (
                <p><span className="font-medium">Email Verified:</span> {currentUser.emailVerified ? "Yes" : "No"}</p>
              )}
            </>
          )}

          <p className="font-medium mt-2">Firebase Status:</p>
          <pre className="text-xs bg-gray-50 p-1 rounded overflow-x-auto">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthDiagnostics;
