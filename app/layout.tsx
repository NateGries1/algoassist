import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import SessionWrapper from '@/components/SessionWrapper';
import Footer from '../components/Footer'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AlgoAssist',
  description: 'Live AI assistant to streamline the growth of your algorithmic skill.'
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
          className={`${inter.className} flex max-h-screen h-screen flex-col bg-neutral-950 text-xs text-white`}
        >
          <Navbar />
          {children}
          <Footer/>
        </body>
      </html>
    </SessionWrapper>
  );
}
