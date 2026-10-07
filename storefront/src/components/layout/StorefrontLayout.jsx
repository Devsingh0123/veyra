import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MegaMenu from './MegaMenu';
import MobileNav from './MobileNav';
import Footer from './Footer';
import CartDrawer from '../../features/cart/components/CartDrawer';

export default function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top sticky navigation */}
      <Header />

      {/* Category discovery subheader */}
      <MegaMenu />

      {/* Mobile drawer */}
      <MobileNav />

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer />

      {/* Main Page Canvas */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer & Trust Chrome */}
      <Footer />
    </div>
  );
}
