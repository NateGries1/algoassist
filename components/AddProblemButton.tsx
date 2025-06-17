'use client';

import { useRouter } from 'next/navigation';

export default function AddProblemButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/add`);
  };

  return (
    <button
      onClick={handleClick}
      className="mt-20 px-8 py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.8)] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_40px_rgba(147,51,234,1)] active:scale-95"
    >
      Add Problem
    </button>
  );
}