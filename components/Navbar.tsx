'use client';

import Link from 'next/link';
import { Button, buttonVariants } from './Button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Suspense } from 'react';
import OpenProfile from './profile/OpenProfile';
import Profile from './profile/Modal';
import Image from 'next/image';

type Props = {};

const Navbar = (props: Props) => {
  const { data: session } = useSession();

  return (
    <nav className="absolute z-10 w-full">
      <div className="flex h-[60px] w-full items-center justify-between px-5 py-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="sr-only">AlgoAssist</span>
            <Image
              src="/algoassist-logo.png"
              alt="AlgoAssist Logo"
              width={256}
              height={256}
              className="h-12 w-12 text-purple-500"
            />
          </Link>
        </div>
        <div className="relative flex items-center">
          {session ? (
            <Suspense fallback={<OpenProfile session={session} />}>
              <Profile session={session} />
            </Suspense>
          ) : (
            <Button
              onClick={() => signIn('github')}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
