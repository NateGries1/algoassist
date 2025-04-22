import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="flex h-[40px] w-full items-center justify-between bg-white/10 px-4 text-xs">
      <div>
        Built with{' '}
        <Link href="https://nextjs.org/" target="_blank" className="underline hover:no-underline">
          Next.js
        </Link>
      </div>
      <Link
        href="https://opensource.org/license/mit"
        target="_blank"
        className="underline hover:no-underline"
      >
        MIT License
      </Link>
    </footer>
  );
}
