'use client';

import { useRouter } from 'next/navigation';
import { Problem } from '@/types/problem'; // adjust import if needed

interface RandomProblemButtonProps {
  problems: Problem[];
}

export default function RandomProblemButton({ problems }: RandomProblemButtonProps) {
  const router = useRouter();

  const handleRandomClick = () => {
    if (problems.length === 0) return;
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    router.push(`/problems/${randomProblem.id}`);
  };

  return (
    <button
      onClick={handleRandomClick}
      className="mt-20 px-8 py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.8)] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_40px_rgba(147,51,234,1)] active:scale-95"
    >
      Random Problem
    </button>
  );
}
