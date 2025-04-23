import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
<footer className="bg-slate-950 border-t border-gray-500">
    <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
            <a href="/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                <Image
                  src="/algoassist-logo.png"
                  alt="Algo Assist"
                  width={256}
                  height={256}
                  className="h-12 w-12"
                />
                <div className='text-lg font-semibold'>Algo Assist</div>
            </a>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                <li>
                    <a href="https://nextjs.org/" className="hover:underline me-4 md:me-6">Built with Next.js</a>
                </li>
                <li>
                    <a href="https://opensource.org/license/mit" className="hover:underline me-4 md:me-6">MIT License</a>
                </li>
            </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a href="/" className="hover:underline">AlgoAssist™</a>. All Rights Reserved.</span>
    </div>
</footer>

    



  );
}

