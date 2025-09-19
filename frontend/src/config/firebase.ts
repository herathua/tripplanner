import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';

// Your web app's Firebase configuration
// TODO: Replace with your Firebase config object
const firebaseConfig = {
    apiKey: "AIzaSyCkd1INtaVbv7zUoK35aRotDC1G3p3Wdic",
    authDomain: "chatbot-3be85.firebaseapp.com",
    projectId: "chatbot-3be85",
    storageBucket: "chatbot-3be85.firebasestorage.app",
    messagingSenderId: "698958722407",
    appId: "1:698958722407:web:f357f8d381d5cbd205abc2",
    measurementId: "G-YNEBZ1BK3V"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const registerWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const sendEmailVerificationToUser = async (user: User) => {
  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const verifyEmailWithCode = async (code: string) => {
  try {
    await applyActionCode(auth, code);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const checkEmailVerificationCode = async (code: string) => {
  try {
    const info = await checkActionCode(auth, code);
    return { success: true, info };
  } catch (error) {
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };
export default app; 