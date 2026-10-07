import { baseApi } from '../../../store/baseApi';
import { setCredentials, logout as clearAuth } from '../../../store/slices/authSlice';

/**
 * RTK Query Auth Endpoints
 * Injected into baseApi to leverage centralized caching, token attachments, and tag invalidation.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /auth/login - authenticate with email and password
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
      // Automatically sync user and accessToken with Redux authSlice & localStorage
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const authData = data?.data || data;
          const user = authData?.user;
          const token = authData?.accessToken || authData?.token;
          if (token) {
            dispatch(setCredentials({ user, token }));
          }
        } catch {
          // Handled in component catch/unwrap
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // GET /auth/me - fetch profile using Bearer JWT
    getProfile: builder.query({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['Auth'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const user = data?.data?.user || data?.user;
          if (user) {
            const token = localStorage.getItem('token');
            dispatch(setCredentials({ user, token }));
          }
        } catch {
          // Token could be expired
        }
      },
    }),

    // POST /auth/logout - revoke refresh token and clear client session
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearAuth());
        }
      },
      invalidatesTags: ['Auth'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useLogoutMutation,
} = authApi;

export default authApi;
