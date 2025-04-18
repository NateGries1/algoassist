'use client';

import { Problem as ProblemType } from '@/types/problem';
import React, { useEffect } from 'react';
import MdxLayout from './MdxLayout';
import Testcases from './Testcases';
import dynamic from 'next/dynamic';
import { ExecutionResult } from '@/types/executionResult';
import { Button } from './Button';
import { AIMessage } from '@/types/aiMessage';
import { HMR_ACTIONS_SENT_TO_BROWSER } from 'next/dist/server/dev/hot-reloader-types';
import Chat from './Chat';
import { useState } from 'react';
import { ChatMessage } from '@/types/chatMessage';
import Output from './Output';

enum SupportedLanguages {
  // cpp = 'cpp',
  python = 'python'
  // java = 'java',
  // typescript = 'typescript'
}

type Props = {
  result: ProblemType;
};

const DyanmicCodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false
});

export default function Problem({ result }: Props) {
  const [executionResult, setExecutionResult] = React.useState<ExecutionResult>({
    language: '',
    version: '',
    run: {
      stdout: '',
      stderr: '',
      code: 0,
      signal: '',
      output: ''
    }
  });
  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const [codeValue, setCodeValue] = useState<string>("");
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguages>(
      SupportedLanguages.python
    );
  const [chatHistory, setChatHistory] = React.useState<AIMessage[]>([]);
  const [messageLog, setMessageLog] = useState<ChatMessage[]>([]);
  const [timeLeft, setTimeLeft] = useState(30*60); // 30 minutes in seconds
  const [isFinished, setIsFinished] = useState(false);
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleRestart = () => {
    setTimeLeft(60); // Reset the timer to 60 seconds (or your desired starting time)
    setIsFinished(false); // Hide the "interview over" message
  };

  // Handle the results functionality (navigate to home page)
  const handleResults = () => {
    window.location.href = '/'; // This will navigate to the homepage
  };

  return (
    <div className="relative grid h-[calc(100vh-80px)] w-full md:grid-cols-2 md:grid-rows-[3fr_1fr_3fr]">
            {isFinished && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50 p-4">
          <p className="text-white text-4xl font-bold mb-6">The interview is over</p>
          <div className="flex space-x-4">
            <button
              onClick={handleResults}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Results
            </button>
            <button
              onClick={handleRestart}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out"
            >
              Restart
            </button>
          </div>
        </div>
      )}
      <div className="row-span-2 overflow-y-scroll bg-neutral-900 p-4">
        <h1 className="text-3xl font-bold">
          {result.lc_number}: {result.title[0].toUpperCase() + result.title.slice(1).toLowerCase()}
        </h1>
          <p className="text-2xl mt-4">
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </p>
        <div
          className={`w-max rounded-xl bg-neutral-700 px-2 py-1 text-xs
          ${result.difficulty === 'easy' ? 'text-green-500' : result.difficulty === 'medium' ? 'text-yellow-500' : result.difficulty === 'hard' ? 'text-red-500' : 'text-gray-500'}
        `}
        >
          {result.difficulty[0].toUpperCase() + result.difficulty.slice(1).toLowerCase()}
        </div>
        <MdxLayout>{`${result.content.replaceAll('\\n', '\n')}`}</MdxLayout>
      </div>
      <div className="bg-neutral-900 md:row-start-3">
        <div className="flex items-center">
          {Array.from({ length: 3 }).map((_, index) => (
            <Button
              key={index}
              className={`rounded-none px-4 py-2 hover:cursor-pointer hover:bg-neutral-700 ${tabIndex === index ? 'bg-neutral-700' : ''}`}
              onClick={() => setTabIndex(index)}
            >
              {index === 0 ? 'Testcases' : index === 1 ? 'Output' : index === 2 ? 'Chat' : ''}
            </Button>
          ))}
        </div>
        <div className="relative overflow-y-scroll p-4 w-full h-full">
          {tabIndex === 0 ? (
            <Testcases testcases={result.testcases} params={result.params} />
          ) : tabIndex === 2 ? (
            <div className="h-full w-full pb-4">
              <Chat
                codeValue={codeValue}
                functionName={result.title}
                currentLanguage={currentLanguage}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                messageLog={messageLog}
                setMessageLog={setMessageLog}
              />
            </div>
          ) : tabIndex === 1 && executionResult.language ? (
            <div className="flex h-full w-full flex-col">
              <div className="flex items-center">
              </div>
              <div className="rounded-lg">
                <Output testcases={result.testcases} params={result.params} stdout={executionResult.run.stdout} stderr={executionResult.run.stderr} />
              </div>
            </div>
          ) : (
            <div>No output yet</div>
          )}
        </div>
      </div>

      <div className="md:row-span-3">
        <DyanmicCodeEditor
          functionName={result.function}
          params={result.params}
          testcases={JSON.parse(result.testcases)}
          setExecutionResult={setExecutionResult}
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          setTabIndex={setTabIndex}
          codeValue={codeValue}
          setCodeValue={setCodeValue}
        />
      </div>
    </div>
  );
}

const formatStdOut = (stdout: string) => {
  let result = stdout;
  result
    .replace(/Input:/g, '\nInput:')
    .replace(/Expected:/g, 'Expected:')
    .replace(/Got:/g, 'Got:')
    .trim();
    console.log("result", result);
    return (
      <span>{JSON.stringify(result)}</span>
    )

  return result.split('\n').map((line, index) => {
    if (line.startsWith('Input:') || line.startsWith('Expected:') || line.startsWith('Got:')) {
      return (
        <span key={index}>
          {line}
          <br />
        </span>
      );
    }
    return <span key={index}>{line}</span>;
  });
};