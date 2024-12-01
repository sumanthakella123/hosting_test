import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { FaHome, FaBook, FaPhone, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();

  const isActive = (href: string) => router.pathname === href;

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white fixed top-0 left-0 h-full w-64 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 bg-gray-900">
          <h2 className="text-2xl font-bold">Dashboard</h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="mt-4">
            <li>
              <Link
                href="/manager/dashboard"
                className={`block py-2 px-4 flex items-center transition-colors duration-200 ${
                  isActive('/manager/dashboard') ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                <FaHome className="mr-3" />
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/manager/dashboard/vastra-seva"
                className={`block py-2 px-4 flex items-center transition-colors duration-200 ${
                  isActive('/manager/dashboard/vastra-seva') ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                <FaBook className="mr-3" />
                Vastra Seva
              </Link>
            </li>
            <li>
              <Link
                href="/manager/dashboard/seva-bookings"
                className={`block py-2 px-4 flex items-center transition-colors duration-200 ${
                  isActive('/manager/dashboard/seva-bookings') ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                <FaBook className="mr-3" />
                Seva Bookings
              </Link>
            </li>
            <li>
              <Link
                href="/manager/dashboard/ai-call-history"
                className={`block py-2 px-4 flex items-center transition-colors duration-200 ${
                  isActive('/manager/dashboard/ai-call-history') ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                <FaPhone className="mr-3" />
                AI Call History
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: '/manager/login' })}
            className="w-full bg-red-600 py-2 rounded hover:bg-red-700 flex items-center justify-center transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="fixed top-0 left-64 right-0 bottom-0 bg-gray-100 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;