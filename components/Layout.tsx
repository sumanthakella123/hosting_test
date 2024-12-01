import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 relative">
      <main className="w-full max-w-4xl bg-white border border-gray-300 p-6 mt-6 mb-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
