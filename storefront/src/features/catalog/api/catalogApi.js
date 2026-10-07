import { baseApi } from '../../../store/baseApi';

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => ({
        url: '/catalog/categories',
        method: 'get',
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Category', id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    getProducts: builder.query({
      query: (params = {}) => ({
        url: '/catalog/products',
        method: 'get',
        params,
      }),
      providesTags: (result) =>
        result?.data?.products
          ? [
              ...result.data.products.map(({ id }) => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductBySlug: builder.query({
      query: (slug) => ({
        url: `/catalog/products/${slug}`,
        method: 'get',
      }),
      providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetProductBySlugQuery,
} = catalogApi;
