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
    updateCartItem: builder.mutation({
      query: ({ variantId, quantity }) => ({
        url: `/cart/items/${variantId}`,
        method: 'patch',
        data: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (variantId) => ({
        url: `/cart/items/${variantId}`,
        method: 'delete',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/cart/clear',
        method: 'delete',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
