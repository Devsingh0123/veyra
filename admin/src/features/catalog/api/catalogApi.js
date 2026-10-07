import { baseApi } from '../../../store/baseApi';

/**
 * Catalog API endpoints
 * Connects to the Catalog microservice via the API Gateway (/catalog/*).
 */
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /catalog/products
    getProducts: builder.query({
      query: (params = {}) => ({
        url: '/catalog/products',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.products
          ? [
              ...result.data.products.map(({ id }) => ({ type: 'Products', id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    // GET /catalog/categories
    getCategories: builder.query({
      query: () => ({
        url: '/catalog/categories',
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    // POST /catalog/products
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/catalog/products',
        method: 'POST',
        data: productData,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }, 'Dashboard'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
} = catalogApi;

export default catalogApi;
