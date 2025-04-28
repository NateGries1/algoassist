'use client';

import { Problem as ProblemType } from '@/types/problem';
import React, { useEffect, useRef } from 'react';
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
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Navbar from './Navbar';

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
  const [tabIndex, setTabIndex] = React.useState<number>(2);
  const [codeValue, setCodeValue] = useState<string>("");
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguages>(SupportedLanguages.python);
  const [chatHistory, setChatHistory] = React.useState<AIMessage[]>([]);
  const [messageLog, setMessageLog] = useState<ChatMessage[]>([]);
  const [timeLeft, setTimeLeft] = useState(60 * 30); // 30 minutes in seconds
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<number>(0);

  const handleSetInitialPrompt = (newValue:number) => {
    setInitialPrompt(newValue)
  };

  useEffect(() => {
    if (!hasStarted)
     return;

    if (timeLeft <= 0 ){
      setIsFinished(true)
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [hasStarted, timeLeft]);
  

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleRestart = () => {
    setTimeLeft(60 * 30); // Reset the timer to 60 seconds (or your desired starting time)
    setIsFinished(false); // Hide the "interview over" message
    setCodeValue("")
    setChatHistory([])
    setMessageLog([])
    setHasStarted(false)
    setTabIndex(2)
    setInitialPrompt(0)
    setCurrentLanguage(SupportedLanguages.python)
  };
  const handleStart = () => {
    setHasStarted(true)
    handleSetInitialPrompt(1)
  }
  // Handle the results functionality (navigate to home page)
  const handleResults = () => {
    const currentPath = window.location.pathname;
    window.location.href = `${currentPath}/results`;
  };

  useEffect(() => {
    if (isFinished) {
      localStorage.setItem('currentLangugage', currentLanguage);
      localStorage.setItem('codeValue', codeValue);
      localStorage.setItem('problemName', result.title);
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

    }
  }, [isFinished]);
  return (
    <div className="relative h-screen w-full grid md:grid-cols-2">
      {!hasStarted && (
        <div className="fixed inset-0 z-50 bg-slate-950 bg-opacity-50 backdrop-blur-md flex items-center justify-center">
          <div className="bg-black/50 border border-gray-500 text-white rounded-lg p-8 max-w-xl w-full text-center space-y-6">
            <h2 className="text-4xl font-bold pt-5 px-5">Ready to start your interview? </h2>
            <p className="text-lg text-gray-300">This interview will take {Math.floor(timeLeft / 60)} minutes to complete.</p>
            <div className="flex justify-center space-x-4 pb-5">
              <button
                onClick={handleStart}
                className="bg-purple-500 hover:bg-purple-600 text-white text-sm px-6 py-2 rounded-lg transition duration-300"
              >
                Start Interview
              </button>
              <a
                href="/problems"
                className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-6 py-2 rounded-lg transition duration-300"
              >
                Cancel
              </a>
            </div>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-75 flex flex-col justify-center items-center z-50 p-8">
  {/* Main message */}
  <div className="bg-black/50 border border-gray-500 rounded-md p-10 flex flex-col justify-center items-center w-full max-w-xl">
    <h2 className="text-white text-4xl font-semibold mb-4 text-center">
      Your interview session has concluded.
    </h2>

    {/* Subheading with encouragement */}
    <p className="text-gray-300 mb-6 text-lg max-w-lg text-center">
      You have completed the interview—great job! Now, take a moment to review your performance and see where you can improve.
    </p>

    {/* Buttons for next actions */}
    <div className="flex space-x-6 mb-6">
      <button
        onClick={handleResults}
        className="bg-purple-500 text-sm text-white px-8 py-3 rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out"
      >
        View Results
      </button>
      <button
        onClick={handleRestart}
        className="bg-gray-600 text-sm text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition duration-300 ease-in-out"
      >
        Start a New Interview
      </button>
    </div>
  </div>
</div>
      )}
      {/* Left side: Problem description and testcases/output/chat */}
      <div className="h-screen overflow-hidden">
        <PanelGroup direction="vertical">
          <Panel defaultSize={65}>
            <div className="overflow-y-auto bg-neutral-800 p-4 h-full">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">
                  {result.lc_number}: {result.title[0].toUpperCase() + result.title.slice(1).toLowerCase()}
                </h1>
                <div className='space-x-5'>
                <a href="/" className="text-white bg-purple-500 font-semibold px-3 py-2 rounded-lg">Home</a>
                <button onClick={() =>setIsFinished(true)} className="text-white bg-red-500 font-semibold px-3 py-2 rounded-lg">End Interview</button>
                </div>
               </div>
              <p className="text-2xl mt-4">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
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
          </Panel>

          <PanelResizeHandle className="h-2 bg-neutral-900 hover:bg-neutral-600 cursor-row-resize" />

          <Panel defaultSize={35}>
            <div className="bg-neutral-800 h-full flex flex-col">
              <div className="flex items-center bg-neutral-800 pt-4 px-4 space-x-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Button
                    key={index}
                    className={`rounded-md px-4 py-2 hover:cursor-pointer hover:bg-neutral-700 ${tabIndex === index ? 'bg-neutral-700' : ''}`}
                    onClick={() => setTabIndex(index)}
                  >
                    {index === 0 ? 'Testcases' : index === 1 ? 'Output' : index === 2 ? 'Chat' : ''}
                  </Button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {tabIndex === 0 ? (
                  <Testcases testcases={result.testcases} params={result.params} />
                ) : tabIndex === 2 ? (
                  <div className="h-full w-full">
                    <Chat
                      codeValue={codeValue}
                      functionName={result.title}
                      currentLanguage={currentLanguage}
                      chatHistory={chatHistory}
                      setChatHistory={setChatHistory}
                      messageLog={messageLog}
                      setMessageLog={setMessageLog}
                      initialPrompt= {initialPrompt}
                      setInitialPrompt={setInitialPrompt}
                      timeLeft={timeLeft}
                    />
                  </div>
                ) : tabIndex === 1 && executionResult.language ? (
                  <div className="flex h-full w-full flex-col">
                    <div className="flex items-center"></div>
                    <Output
                      testcases={result.testcases}
                      params={result.params}
                      output_type = {result.output_type}
                      stdout={executionResult.run.stdout}
                      stderr={executionResult.run.stderr}
                    />
                  </div>
                ) : (
                  <div>No output yet</div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Right side: Code editor */}
      <div className="h-screen">
        <DyanmicCodeEditor
          problem={result}
          setExecutionResult={setExecutionResult}
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          setTabIndex={setTabIndex}
          codeValue={codeValue}
          setCodeValue={setCodeValue}
          hasStarted={hasStarted}
        />
      </div>
    </div>
  );
}