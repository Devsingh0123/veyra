import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMobileNavOpen: false,
  isSearchModalOpen: false,
  searchQuery: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileNav: (state) => {
      state.isMobileNavOpen = !state.isMobileNavOpen;
    },
    closeMobileNav: (state) => {
      state.isMobileNavOpen = false;
    },
    openMobileNav: (state) => {
      state.isMobileNavOpen = true;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    toggleSearchModal: (state) => {
      state.isSearchModalOpen = !state.isSearchModalOpen;
    },
    closeSearchModal: (state) => {
      state.isSearchModalOpen = false;
    },
  },
});

export const {
  toggleMobileNav,
  closeMobileNav,
  openMobileNav,
  setSearchQuery,
  toggleSearchModal,
  closeSearchModal,
} = uiSlice.actions;

export default uiSlice.reducer;
