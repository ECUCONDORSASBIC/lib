'use client';

import { auth, db, ensureFirebase } from '@firebase/client';
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth"; // getAuth is no longer needed as we import auth directly
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { normalizeRole } from '../utils/roleUtils';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  // auth is now imported directly from firebaseClient

  // Ensure Firebase is initialized when component mounts
  useEffect(() => {
    const initFirebase = async () => {
      try {
        await ensureFirebase();
        console.log("Firebase successfully initialized in app/contexts/AuthContext");
      } catch (err) {
        console.error("Failed to initialize Firebase in app/contexts/AuthContext:", err);
        setError("Failed to initialize authentication system");
      }
    };

    initFirebase();
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setUserData(null);
    setError(null);
    setLoading(false);
  }, []);

  const refreshUserData = useCallback(async (uid, firebaseUser = null) => {
    console.log(`AuthContext: refreshUserData - refreshing for UID: ${uid}`);
    const userToUse = firebaseUser || auth.currentUser;

    if (!userToUse || userToUse.uid !== uid) {
      console.warn("AuthContext: refreshUserData - Mismatch or no current user for UID:", uid);
      if (!userToUse) {
        setUserData(null);
        return;
      }
    }

    let roleFromClaim = null;
    let emailFromToken = userToUse.email;
    let nameFromToken = userToUse.displayName || '';

    try {
      const tokenResult = await userToUse.getIdTokenResult(true);
      roleFromClaim = tokenResult.claims.role || null;
      console.log("AuthContext: refreshUserData - Role from token claim:", roleFromClaim);
    } catch (tokenError) {
      console.error("AuthContext: refreshUserData - Error getting token result:", tokenError);
    }

    const userDocRef = doc(db, "users", uid);
    try {
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        console.log("AuthContext: refreshUserData - Firestore data:", fetchedData);

        // Usar normalizeRole para garantizar consistencia
        const normalizedRole = normalizeRole(fetchedData.role);
        fetchedData.role = normalizedRole;

        const finalUserData = {
          ...fetchedData,
          uid: uid,
          email: fetchedData.email || emailFromToken,
          name: fetchedData.name || nameFromToken,
        };
        setUserData(finalUserData);
        console.log("AuthContext: refreshUserData - UserData updated", finalUserData);
      } else {
        console.log(`AuthContext: No user document found for UID: ${uid}. Using token data.`);

        // Normalizar el rol para el usuario sin documento en Firestore
        let normalizedRole = roleFromClaim;

        const basicUserData = {
          uid: uid,
          email: emailFromToken,
          name: nameFromToken,
          role: normalizedRole,
        };
        setUserData(basicUserData);
        console.log("AuthContext: refreshUserData - UserData set with basic info (no Firestore doc)", basicUserData);
      }
    } catch (err) {
      console.error("AuthContext: Error fetching/processing user data from Firestore:", err);
      setError(err);
      setUserData(null);
    }
  }, []);

  const refreshUserDataAndToken = useCallback(async () => {
    if (auth.currentUser) {
      setLoading(true);
      setError(null);
      try {
        console.log('AuthContext: Forcing token refresh (refreshUserDataAndToken)...');
        console.log('AuthContext: Token will be refreshed by refreshUserData. Refreshing user data (refreshUserDataAndToken)...');
        await refreshUserData(auth.currentUser.uid, auth.currentUser);
      } catch (refreshError) {
        console.error("AuthContext: Error in refreshUserDataAndToken process:", refreshError);
        setError(refreshError);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("AuthContext: refreshUserDataAndToken - No current user to refresh.");
      clearAuthState();
    }
  }, [refreshUserData, clearAuthState]);
  useEffect(() => {
    setLoading(true);

    // Skip if auth isn't available yet
    if (!auth) {
      console.warn("Auth not available yet in app/contexts/AuthContext");
      return () => { };
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await refreshUserData(currentUser.uid, currentUser);
      } else {
        clearAuthState();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [refreshUserData, clearAuthState]);

  const signUp = async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: name,
        role: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Registro exitoso.');
      return firebaseUser;
    } catch (error) {
      console.error("Error en signUp:", error);
      setError(error);
      toast.error(error.message || "Error en el registro.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Inicio de sesión exitoso.');
      return userCredential.user;
    } catch (error) {
      console.error("Error en signIn:", error);
      setError(error);
      toast.error(error.message || "Error al iniciar sesión.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          role: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          provider: 'google.com',
        });
      } else {
        await updateDoc(userDocRef, {
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          name: firebaseUser.displayName || docSnap.data().name,
          email: firebaseUser.email || docSnap.data().email,
        });
      }
      toast.success('Inicio de sesión con Google exitoso.');
      return firebaseUser;
    } catch (error) {
      console.error("Error en signInWithGoogle:", error);
      setError(error);
      toast.error(error.message || "Error al iniciar sesión con Google.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      clearAuthState();
      toast.success('Sesión cerrada.');
      router.push('/login');
    } catch (error) {
      console.error("Error en signOut:", error);
      setError(error);
      toast.error(error.message || "Error al cerrar sesión.");
      throw error;
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Correo de restablecimiento enviado. Revisa tu bandeja de entrada.');
    } catch (error) {
      console.error("Error en resetPassword:", error);
      setError(error);
      toast.error(error.message || "Error al enviar correo de restablecimiento.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Value object is correctly defined here
  const value = {
    user,
    userData,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    refreshUserDataAndToken,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};