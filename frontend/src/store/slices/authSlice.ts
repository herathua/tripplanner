import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';
import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  logoutUser,
  loginWithGoogle as firebaseGoogleLogin,
  resetPassword as firebaseResetPassword,
} from '../../config/firebase';
import apiClient from '../../config/api';

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

// Reset password
export const resetPassword = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await firebaseResetPassword(email);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send password reset email');
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
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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