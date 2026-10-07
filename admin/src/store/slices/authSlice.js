import { createSlice } from '@reduxjs/toolkit';

// Retrieve stored token and user if available from previous sessions
const savedToken = localStorage.getItem('token');
let savedUser = null;
try {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    savedUser = JSON.parse(userJson);
  }
} catch {
  savedUser = null;
}

const initialState = {
  user: savedUser,
  token: savedToken || null,
  role: savedUser?.role || null,
  isAuthenticated: !!savedToken,
};

/**
 * Authentication Slice
 * Synchronous state tracking for user credentials, active JWT, and role.
 * Async actions & caching are managed by RTK Query's authApi.
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload || {};
      if (user !== undefined) state.user = user;
      if (token !== undefined) state.token = token;
      state.role = state.user?.role || null;
      state.isAuthenticated = !!state.token;

      if (token) {
        localStorage.setItem('token', token);
      }
      if (state.user) {
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      state.role = action.payload?.role || null;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
