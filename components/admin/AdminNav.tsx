'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, ShieldCheck, Star, Home } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navItems = [
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/drivers', label: 'Drivers', icon: Users },
    { href: '/admin/reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <nav className="bg-white border-b shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-green-600">BLAQMART</h1>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
              ADMIN
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Back to Store */}
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ml-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            {/* Sign Out */}
            <button
              onClick={() => signOut()}
              className="ml-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
