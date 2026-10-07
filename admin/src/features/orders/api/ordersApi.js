import { baseApi } from '../../../store/baseApi';

/**
 * Orders RTK Query API slice
 * Connects to the Order Service via API Gateway (/orders/*).
 */
export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /orders/admin/all
    getAllOrders: builder.query({
      query: (params = {}) => ({
        url: '/orders/admin/all',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.orders
          ? [
              ...result.data.orders.map(({ id }) => ({ type: 'Orders', id })),
              { type: 'Orders', id: 'LIST' },
            ]
          : [{ type: 'Orders', id: 'LIST' }],
    }),

    // PATCH /orders/admin/:id/status
    updateOrderStatus: builder.mutation({
      query: ({ id, status, note }) => ({
        url: `/orders/admin/${id}/status`,
        method: 'PATCH',
        data: { status, note },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'LIST' },
        'Dashboard',
      ],
    }),

    // POST /orders/admin/:id/shipment (Assign AWB & Carrier)
    createShipment: builder.mutation({
      query: ({ id, carrier, deadWeightGrams, lengthCm, widthCm, heightCm }) => ({
        url: `/orders/admin/${id}/shipment`,
        method: 'POST',
        data: { carrier, deadWeightGrams, lengthCm, widthCm, heightCm },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'LIST' },
        'Dashboard',
      ],
    }),

    // GET /orders/:id/invoice
    getOrderInvoice: builder.query({
      query: (id) => ({
        url: `/orders/${id}/invoice`,
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useCreateShipmentMutation,
  useGetOrderInvoiceQuery,
} = ordersApi;

export default ordersApi;
