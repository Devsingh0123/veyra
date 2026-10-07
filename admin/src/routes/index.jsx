import React from 'react';
import { createBrowserRouter, Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import LoginForm from '@/features/auth/components/LoginForm';
import DashboardView from '@/features/dashboard/components/DashboardView';
import CatalogView from '@/features/catalog/components/CatalogView';
import InventoryView from '@/features/inventory/components/InventoryView';
import OrderView from '@/features/orders/components/OrderView';
import ReturnView from '@/features/returns/components/ReturnView';

/**
 * Root Application Router Configuration
 * Fully connected to all 5 core administrative operational domains:
 * - Dashboard (/)
 * - Product Catalog (/catalog)
 * - Inventory & Stock (/inventory)
 * - Orders Pipeline (/orders)
 * - Returns & QC (/returns)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardView />,
      },
      {
        path: 'catalog',
        element: <CatalogView />,
      },
      {
        path: 'inventory',
        element: <InventoryView />,
      },
      {
        path: 'orders',
        element: <OrderView />,
      },
      {
        path: 'returns',
        element: <ReturnView />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '*',
    element: (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-rose-500">404</h1>
          <p className="mt-3 text-lg text-slate-300">Page not found</p>
          <p className="mt-1 text-sm text-slate-500">
            The requested admin view does not exist.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    ),
  },
]);

export default router;
