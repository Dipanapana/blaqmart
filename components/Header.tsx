'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, LogOut, Package, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import LoginModal from './auth/LoginModal';
import CartButton from './cart/CartButton';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <>
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">
                BLAQ<span className="text-blue-500">MART</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/#products"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Dashcams
              </Link>
              <Link
                href="/#products"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Accessories
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Orders (only show when logged in) */}
              {user && (
                <Link
                  href="/orders"
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="My orders"
                >
                  <Package className="w-5 h-5 text-slate-300" />
                </Link>
              )}

              {/* Cart */}
              <CartButton />

              {/* Auth buttons */}
              {loading ? (
                <div className="w-20 h-9 bg-slate-800 rounded-lg animate-pulse" />
              ) : user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-300" />
                    <span className="text-sm font-medium text-slate-300">
                      {user.phone || 'Account'}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Sign In
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-300" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-slate-800 space-y-2">
              <Link
                href="/#products"
                className="block px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashcams
              </Link>
              <Link
                href="/#products"
                className="block px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
