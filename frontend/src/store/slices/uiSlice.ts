import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface UIState {
  loading: {
    [key: string]: boolean;
  };
  notifications: Notification[];
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
  sidebar: {
    isOpen: boolean;
  };
}

const initialState: UIState = {
  loading: {},
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  sidebar: {
    isOpen: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({ ...action.payload, id });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setModal: (state, action: PayloadAction<{ isOpen: boolean; type?: string; data?: any }>) => {
      state.modal = {
        isOpen: action.payload.isOpen,
        type: action.payload.type || null,
        data: action.payload.data || null,
      };
    },
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
  },
});

export const {
  setLoading,
  addNotification,
  removeNotification,
  setModal,
  toggleSidebar,
} = uiSlice.actions;

export default uiSlice.reducer; 