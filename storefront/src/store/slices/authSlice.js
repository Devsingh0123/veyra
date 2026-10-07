import { createSlice } from '@reduxjs/toolkit';

const getStoredCustomer = () => {
  try {
    const raw = localStorage.getItem('veyra_customer_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getStoredCustomer(),
  token: localStorage.getItem('veyra_customer_token') || null,
  isAuthenticated: Boolean(localStorage.getItem('veyra_customer_token')),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      if (token) localStorage.setItem('veyra_customer_token', token);
      if (user) localStorage.setItem('veyra_customer_user', JSON.stringify(user));
    },
    logoutCustomer: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('veyra_customer_token');
      localStorage.removeItem('veyra_customer_user');
    },
  },
});

export const { setCredentials, logoutCustomer } = authSlice.actions;
export default authSlice.reducer;
