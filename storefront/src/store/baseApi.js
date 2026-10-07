import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from './axiosInstance';

const axiosBaseQuery =
  () =>
  async ({ url, method = 'get', data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
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

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Cart', 'Product', 'Category', 'Order', 'User', 'Wishlist'],
  endpoints: () => ({}),
});
