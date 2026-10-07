import { baseApi } from '../../../store/baseApi';

/**
 * Returns & Reverse Logistics RTK Query API slice
 * Connects to the Order Service via API Gateway (/orders/returns/*).
 */
export const returnsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /orders/returns/all
    getReturns: builder.query({
      query: (params = {}) => ({
        url: '/orders/returns/all',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...(Array.isArray(result.data) ? result.data : result.data.returns || []).map(
                ({ id }) => ({ type: 'Returns', id })
              ),
              { type: 'Returns', id: 'LIST' },
            ]
          : [{ type: 'Returns', id: 'LIST' }],
    }),

    // PATCH /orders/admin/returns/:returnId/status
    updateReturnStatus: builder.mutation({
      query: ({ returnId, status, adminNote }) => ({
        url: `/orders/admin/returns/${returnId}/status`,
        method: 'PATCH',
        data: { status, adminNote },
      }),
      invalidatesTags: (result, error, { returnId }) => [
        { type: 'Returns', returnId },
        { type: 'Returns', id: 'LIST' },
        'Orders',
        'Dashboard',
      ],
    }),

    // GET /orders/returns/:returnId/credit-note/html
    getCreditNoteHtml: builder.query({
      query: (returnId) => ({
        url: `/orders/returns/${returnId}/credit-note/html`,
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReturnsQuery,
  useUpdateReturnStatusMutation,
  useGetCreditNoteHtmlQuery,
} = returnsApi;

export default returnsApi;
