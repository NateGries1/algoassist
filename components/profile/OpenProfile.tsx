'use client';

import { Session } from 'next-auth';
import Image from 'next/image';

type Props = {
  session: Session;
};

export default function OpenProfile({ session }: Props) {
  if (!session) return null;

  return (
    <Image
      width={64}
      height={64}
      src={session.user?.image as string}
      alt={session.user?.name as string}
      className={`h-9 w-9 rounded-full`}
    />
  );
}
