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
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
const storage = getStorage(app);
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

export const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
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

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Storage functions
export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('Firebase uploadProfilePhoto called with:', { fileName: file.name, userId, fileSize: file.size });
    
    const fileName = `profile-photos/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    
    console.log('Storage reference created:', fileName);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('File uploaded successfully:', snapshot);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    console.error('Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      serverResponse: (error as any)?.serverResponse
    });
    throw error;
  }
};

export const deleteProfilePhoto = async (photoUrl: string): Promise<void> => {
  try {
    const photoRef = ref(storage, photoUrl);
    await deleteObject(photoRef);
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    throw error;
  }
};

export const updateUserProfile = async (user: User, updates: { displayName?: string; photoURL?: string }): Promise<void> => {
  try {
    await updateProfile(user, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export { auth, storage };
export default app; 