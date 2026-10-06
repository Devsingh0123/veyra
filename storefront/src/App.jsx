import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <header className="bg-veyra-charcoal text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-wider text-veyra-gold">VEYRA</span>
          <span className="text-xs uppercase tracking-widest text-gray-400">Storefront</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#catalog" className="hover:text-veyra-gold transition">Catalog</a>
          <a href="#cart" className="hover:text-veyra-gold transition">Bag</a>
          <a href="#account" className="hover:text-veyra-gold transition">Account</a>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-extrabold text-veyra-charcoal mb-4">
          Curated Indian Multi-Category Marketplace
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Clothing, Electronics, Spiritual & Puja, Jewelry, Beauty, and Home Goods.
          Crafted for reliability, speed, and production excellence.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          System Operational: Phase 0 Infrastructure Ready
        </div>
      </main>

      <footer className="bg-gray-100 text-gray-500 text-xs py-6 text-center border-t">
        © {new Date().getFullYear()} Veyra Technologies Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
}
