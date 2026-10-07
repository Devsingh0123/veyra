import { baseApi } from '../../../store/baseApi';

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'post',
        data: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'post',
        data: userData,
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: '/auth/me',
        method: 'get',
      }),
      providesTags: ['User'],
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: '/orders',
        method: 'get',
      }),
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'get',
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    fileReturn: builder.mutation({
      query: ({ orderId, returnData }) => ({
        url: `/orders/${orderId}/return`,
        method: 'post',
        data: returnData,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useFileReturnMutation,
} = accountApi;
