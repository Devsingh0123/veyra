import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-veyra-charcoal text-white flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xl font-bold tracking-wider text-veyra-gold">VEYRA</span>
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">ADMIN</span>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <a href="#dashboard" className="px-3 py-2 rounded bg-gray-800 text-white font-medium">Dashboard</a>
            <a href="#catalog" className="px-3 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition">Catalog & SKUs</a>
            <a href="#inventory" className="px-3 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition">Inventory Matrix</a>
            <a href="#orders" className="px-3 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition">Orders & Dispatch</a>
            <a href="#returns" className="px-3 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition">Returns & Refunds</a>
            <a href="#gst" className="px-3 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition">GST Reports</a>
          </nav>
        </div>
        <div className="text-xs text-gray-500 border-t border-gray-800 pt-4">
          Logged in as: <span className="text-gray-300">superadmin@veyra.in</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between pb-6 border-b border-gray-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operations Control Center</h1>
            <p className="text-sm text-gray-500">System governance, RBAC permissions, and fulfillment pipelines.</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All 6 Services Healthy
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Products</div>
            <div className="text-2xl font-bold text-gray-900">0 Active</div>
            <div className="text-xs text-gray-400 mt-2">Multi-Category Schema Ready</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Reserved Stock</div>
            <div className="text-2xl font-bold text-gray-900">0 SKUs</div>
            <div className="text-xs text-gray-400 mt-2">15-min Lock Engine Ready</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Pending Orders</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-400 mt-2">FSM Pipeline Initialized</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Razorpay Ledger</div>
            <div className="text-2xl font-bold text-gray-900">₹0.00</div>
            <div className="text-xs text-gray-400 mt-2">Webhook Receiver Standby</div>
          </div>
        </div>
      </main>
    </div>
  );
}
