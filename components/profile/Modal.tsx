'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import OpenProfile from './OpenProfile';
import { Session } from 'next-auth';
import Image from 'next/image';
import { Button, buttonVariants } from '../Button';
import { signOut } from 'next-auth/react';

type Props = {
  session: Session;
};

export default function Profile({ session }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const openProfile = () => setIsOpen(true);
  const closeProfile = () => setIsOpen(false);

  if (!session) return null;

  return (
    <>
      <button onClick={openProfile} aria-label="Open profile">
        <OpenProfile session={session} />
      </button>
      <Transition show={isOpen}>
      <Dialog
  onClose={closeProfile}
  className="fixed inset-0 z-30 flex items-start justify-end p-4"
>
  <Transition.Child
    as={Fragment}
    enter="transition-all ease-in-out duration-300"
    enterFrom="opacity-0 backdrop-blur-none"
    enterTo="opacity-100 backdrop-blur-[.5px]"
    leave="transition-all ease-in-out duration-200"
    leaveFrom="opacity-100 backdrop-blur-[.5px]"
    leaveTo="opacity-0 backdrop-blur-none"
  >
    <Dialog.Panel className="mt-[40px] w-full max-w-xs p-4 rounded-xl border-2 border-white bg-white/20 backdrop-blur-sm">
      
              <div className="flex items-center gap-4">
                <Image
                  src={session.user?.image as string}
                  alt={session.user?.name as string}
                  width={64}
                  height={64}
                  className={`h-16 w-16 rounded-full`}
                />
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold leading-none">{session.user?.name}</h2>
                  <p className="text-gray-00">{session.user?.email}</p>
                </div>
              </div>
              <div></div>
              <div className='mt-3'>
                <Button
                  className={buttonVariants({
                    variant: 'ghost',
                    className: 'w-full',
                    size: 'sm'
                  })}
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
