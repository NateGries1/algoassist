import getDocument from '@/lib/firebase/getData';
import ProblemLayout from '@/components/Problem';
import { Problem } from '@/types/problem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export default async function Page({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const { result, error } = (await getDocument('unverified', params.slug)) as {
    result: Problem;
    error: string;
  };

  if (session?.user?.email) { 
    return <ProblemLayout
    result={result}
    />;
  }

  return (
    <>
    <Navbar/>
    <main className="grid min-h-full place-items-center bg-slate-950 px-6 py-24 sm:py-32 lg:px-8">   
    <div className="text-center max-w-xl">
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-white">
      You need to be signed in to view the problems.
      </h1>
      <p className="mt-6 text-sm font-medium text-pretty text-gray-400">
      Sign in using the button at the top right of the screen.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/"
          className="rounded-md bg-purple-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go back home
        </a>
      </div>
    </div>
  </main>
  </>
  );
}
