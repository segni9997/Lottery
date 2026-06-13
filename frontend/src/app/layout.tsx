import React from 'react';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import '../styles/globals.css';
import Providers from '../components/Providers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Berhan Staff Lottery Management Platform',
  description: 'Official digital lottery management system for Berhan Bank staff. Participate in holiday campaigns, view installments, and watch live draws.',
  keywords: 'Berhan Bank, Lottery, Staff, Ethiopia, Banking, Promotion',
  authors: [{ name: 'Berhan Bank IT Division' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lottery.berhanbanket.com',
    title: 'Berhan Staff Lottery Management Platform',
    description: 'Official digital lottery management system for Berhan Bank staff.',
    siteName: 'Berhan Staff Lottery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berhan Staff Lottery Management Platform',
    description: 'Official digital lottery management system for Berhan Bank staff.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full`}>
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
        <Providers>
          <Navbar />
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
