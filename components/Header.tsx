'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import LoginModal from './auth/LoginModal';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-green-600">BLAQMART</h1>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {/* Cart badge - will be dynamic later */}
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  0
                </span>
              </Link>

              {/* Auth buttons */}
              {loading ? (
                <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.phone || 'Account'}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
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
