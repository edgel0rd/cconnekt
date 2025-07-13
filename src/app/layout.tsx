import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CultureConnect',
  description: 'Connect with people who share your cultural tastes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("bg-background text-foreground", inter.className)}>
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-xl font-bold">CultureConnect</Link>
              <div>
                <Link href="/discover" className="text-gray-600 hover:text-gray-800 mr-4">Discover</Link>
                <Link href="/connections" className="text-gray-600 hover:text-gray-800 mr-4">Connections</Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-800 mr-4">Profile</Link>
                <Link href="/login" className="text-gray-600 hover:text-gray-800">Login</Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
