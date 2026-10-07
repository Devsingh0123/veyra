import { baseApi } from '../../../store/baseApi';

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderQuote: builder.mutation({
      query: (data) => ({
        url: '/orders/quote',
        method: 'post',
        data,
      }),
    }),
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/orders',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),
    createPaymentIntent: builder.mutation({
      query: (data) => ({
        url: '/payments/create-intent',
        method: 'post',
        data,
      }),
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: '/payments/verify',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),
  }),
});

export const {
  useGetOrderQuoteMutation,
  useCreateOrderMutation,
  useCreatePaymentIntentMutation,
  useVerifyPaymentMutation,
} = checkoutApi;
