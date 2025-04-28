import Banner from '@/components/Banner';
import getDocuments from '@/lib/firebase/getDocs';
import { Problem } from '@/types/problem';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import LogoClouds from '@/components/LogoClouds';
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
    <div className="relative w-full bg-slate-950">
      <Navbar/>
      {/* Background gradient behind Hero */}
      <div className="bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)]">
        <Hero targetId="Features"/>
        <div id='Features'>
          <Features/>
        </div>
      </div>
      
      {/* Styled Problem List Section */}
      <div className="py-24">
        <div className="mx-auto grid max-w-7xl gap-20 px-6 lg:px-8 xl:grid-cols-3">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-pretty text-white sm:text-4xl">
              Coding Problems
            </h2>
            <p className="mt-6 text-lg/8 text-gray-400">
              Challenge yourself with our collection of coding problems ranging from easy to hard difficulty. 
              Select a problem to start solving.
            </p>
          </div>
          <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
            {result
              .sort((a, b) => a.lc_number - b.lc_number)
              .map((doc) => (
                <li key={doc.id}>
                  <Link
                    href={`/problems/${doc.id}`}
                    className="flex items-center gap-x-6 group"
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
                        #{doc.lc_number || ''}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base/7 font-semibold tracking-tight text-gray-200 group-hover:text-indigo-600">
                        {doc.title[0].toUpperCase() + doc.title.slice(1).toLowerCase()}
                      </h3>
                      <p className={`text-sm/6 font-semibold ${
                        doc.difficulty === 'easy' 
                          ? 'text-green-500' 
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
        </div>
      </div>
      <LogoClouds/>
      <Footer/>
    </div>
  );
}