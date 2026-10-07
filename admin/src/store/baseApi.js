import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from './axiosInstance';

/**
 * Custom baseQuery that routes all RTK Query operations through axiosInstance.
 * This ensures centralized token handling, base URL resolution, and interceptors.
 */
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method = 'GET', data, body, params, headers }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        // Support both `data` and `body` payload keys
        data: data || body,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

/**
 * Root RTK Query API slice for the Admin portal.
 * Feature modules will inject their own endpoints into this base API via .injectEndpoints().
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Auth', 'Dashboard', 'Products', 'Inventory', 'Orders', 'Returns'],
  endpoints: () => ({}),
});

export default baseApi;
