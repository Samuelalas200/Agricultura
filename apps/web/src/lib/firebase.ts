/**
 * Configuración de Firebase para Campo360 Manager
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD6HjXv2YoamA7yE1VyBkUcZNZxvQ8euiQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campo360-manager.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campo360-manager",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campo360-manager.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1041866584630",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1041866584630:web:7bb30f1f2d854067ea9e97",
  measurementId: "G-C0QGCYY2DZ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Auth y obtener referencia al servicio
export const auth = getAuth(app);

// Inicializar Firestore y obtener referencia a la base de datos
export const db = getFirestore(app);

// Inicializar Analytics (opcional)
export const analytics = getAnalytics(app);

export default app;
