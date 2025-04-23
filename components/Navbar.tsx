'use client';

import Link from 'next/link';
import MemoryIcon from '@mui/icons-material/Memory';
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
    <nav className="fixed z-10 w-full">
      <div className="mx-auto flex h-[60px] w-full items-center justify-between p-10">
        <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="sr-only">LCPilot</span>
          <Image
            src="/algoassist-logo.png"
            alt="LCPilot Logo"
            width={256}
            height={256}
            className="h-8 w-8 text-purple-500"
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
