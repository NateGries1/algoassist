import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionWrapper from '@/components/SessionWrapper';
import Footer from '../components/Footer'
import Navbar from '@/components/Navbar';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AlgoAssist',
  description: 'Live AI interviewer to streamline the growth of your interview skills.',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }, // fallback
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body
          className={`${inter.className} flex max-h-screen h-screen flex-col bg-neutral-800 text-xs text-white overscroll-y-none`}
        >

          {children}
        </body>
      </html>
    </SessionWrapper>
  );
}
