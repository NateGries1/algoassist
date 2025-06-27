import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import SessionWrapper from '@/components/SessionWrapper';
const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

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
          className={`${inter.className} ${poppins.variable} flex max-h-screen h-screen flex-col bg-neutral-800 text-white overscroll-y-none`}
        >
          {children}
        </body>
      </html>
    </SessionWrapper>
  );
}
