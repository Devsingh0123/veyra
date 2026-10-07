import React from 'react';
import { createBrowserRouter, Link } from 'react-router-dom';
import StorefrontLayout from '../components/layout/StorefrontLayout';
import HomeView from '../features/home/components/HomeView';

/**
 * Storefront Browser Router Configuration
 * Uses standard `createBrowserRouter` with StorefrontLayout chrome.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      {
        index: true,
        element: <HomeView />,
      },
      {
        path: '*',
        element: (
          <div className="flex-1 flex items-center justify-center py-24 text-center px-4">
            <div>
              <h1 className="text-6xl font-black text-rose-500">404</h1>
              <p className="mt-3 text-lg font-semibold text-slate-200">Page not found</p>
              <p className="mt-1 text-xs text-slate-400">
                The product or page you are looking for does not exist or has been moved.
              </p>
              <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        ),
      },
    ],
  },
]);

export default router;
