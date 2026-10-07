import { baseApi } from '../../../store/baseApi';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({
        url: '/cart',
        method: 'get',
      }),
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: ({ variantId, quantity = 1 }) => ({
        url: '/cart/items',
        method: 'post',
        data: { variantId, quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const { useGetCartQuery, useAddToCartMutation } = cartApi;
