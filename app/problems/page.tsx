import getDocuments from '@/lib/firebase/getDocs';
import { Problem } from '@/types/problem';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RandomProblemButton from '@/components/RandomProblemButton';
import AddProblemButton from '@/components/AddProblemButton';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const {
    result,
    error
  }: {
    result: Problem[];
    error: unknown;
  } = await getDocuments('problem');
  
  if (error) {
    return <div>{String(error)}</div>;
  }
  
  return (
    <>
    <div className="fixed inset-0 w-full min-h-screen bg-slate-950 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60rem_60rem_at_center,#6d28d9_0%,#0f172a_100%)] opacity-30" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-indigo-500 blur-[120px] opacity-25" />
    </div>
    <div>
      <Navbar/>
      <main className="grid place-items-center px-6 py-24 sm:py-32 lg:px-8 z-10">

        <div className="text-center">
          <p className="text-base font-semibold text-purple-600">Start Learning</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
          Coding Problems
          </h1>
          <div className="mt-6 text-lg font-medium text-gray-400 sm:text-xl/8 text-balance">
          <p>Challenge yourself with our collection of coding problems ranging from easy to hard difficulty.</p> 
          <p>Select a problem to start solving.</p>
          </div>
          <ul role="list" className="mt-20 grid gap-x-8 gap-y-8 sm:grid-cols-2 xl:col-span-2 ">
            {result
              .sort((a, b) => a.lc_number - b.lc_number)
              .map((doc) => (
                <li key={doc.id}>
                  <Link
                    href={`/problems/${doc.id}`}
                    className="flex items-center gap-x-6 group border bg-white/30 hover:bg-white/40 border-gray-500 p-4 rounded-lg"
                  >
                    <div className={`flex items-center justify-center size-16 rounded-full ${
                      doc.difficulty === 'easy' 
                        ? 'bg-green-100' 
                        : doc.difficulty === 'medium'
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                    }`}>
                      <span className={`text-lg font-medium ${
                        doc.difficulty === 'easy' 
                          ? 'text-green-600' 
                          : doc.difficulty === 'medium' 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                      }`}>
                        #{doc.lc_number}
                      </span>
                    </div>
                    <div >
                      <h3 className="text-base/7 font-semibold tracking-tight text-gray-200 ">
                        {doc.title[0].toUpperCase() + doc.title.slice(1).toLowerCase()}
                      </h3>
                      <p className={`text-sm/6 font-semibold text-left ${
                        doc.difficulty === 'easy' 
                          ? 'text-green-500 ' 
                          : doc.difficulty === 'medium' 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                      }`}>
                        {doc.difficulty[0].toUpperCase() + doc.difficulty.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              
          </ul>

          <div className="flex gap-4 justify-center mx-auto">
            <RandomProblemButton problems={result} />
            <AddProblemButton />
          </div>

        </div>
      </main>
      <Footer/>
    </div>
    </>
  );
}