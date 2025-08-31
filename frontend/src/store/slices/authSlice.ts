import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';
import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  logoutUser,
  onAuthStateChange,
  loginWithGoogle as firebaseGoogleLogin,
  loginAnonymously as firebaseAnonymousLogin,
} from '../../config/firebase';
import apiClient from '../../config/api';
import { auth } from '../../config/firebase';

// TEMPORARY: Mock user type to replace Firebase User
// TODO: Replace with Firebase User type when backend is integrated
interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
}

// TEMPORARY: Hardcoded credentials for development
// TODO: Remove this when Firebase is properly configured
const TEMP_CREDENTIALS = {
  email: 'test@example.com',
  password: 'test123',
};

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Helper to sync user with backend
async function syncUserWithBackend(user: User) {
  if (!user) return;
  const token = await user.getIdToken();
  await apiClient.post('/users/sync', {
    firebaseUid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.photoURL,
    emailVerified: user.emailVerified,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
}

// Login with email/password
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await loginWithEmailAndPassword(credentials.email, credentials.password);
      await syncUserWithBackend(user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to login');
    }
  }
);

// Register with email/password
export const register = createAsyncThunk(
  'auth/register',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await registerWithEmailAndPassword(credentials.email, credentials.password);
      await syncUserWithBackend(user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to register');
    }
  }
);

// Login with Google
export const loginWithGoogle = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const user = await firebaseGoogleLogin();
      await syncUserWithBackend(user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to login with Google');
    }
  }
);

// Login anonymously
export const loginAnonymously = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/loginAnonymously',
  async (_, { rejectWithValue }) => {
    try {
      const user = await firebaseAnonymousLogin();
      await syncUserWithBackend(user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to login anonymously');
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to logout');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Email/Password Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Anonymous Login
      .addCase(loginAnonymously.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAnonymously.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAnonymously.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer; 