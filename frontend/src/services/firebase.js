import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBhbUzH79LYzMedoSCGKiGcKYBcaCvGzNs",
  authDomain: "nexthire-88f10.firebaseapp.com",
  projectId: "nexthire-88f10",
  storageBucket: "nexthire-88f10.firebasestorage.app",
  messagingSenderId: "1003284733501",
  appId: "1:1003284733501:web:a4bd8898d46982a8e65454",
  measurementId: "G-289NKQ5ZFT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const firebaseSignOut = () => signOut(auth);