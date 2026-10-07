import { createSlice } from '@reduxjs/toolkit';
import { getOrCreateGuestSessionId } from '../axiosInstance';

const initialState = {
  isCartOpen: false,
  sessionId: getOrCreateGuestSessionId(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    refreshSessionId: (state) => {
      state.sessionId = getOrCreateGuestSessionId();
    },
  },
});

export const { openCart, closeCart, toggleCart, refreshSessionId } = cartSlice.actions;
export default cartSlice.reducer;
