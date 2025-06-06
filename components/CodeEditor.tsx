'use client';

import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { Button } from './Button';
import LoadingDots from './LoadingDots';
import { ExecutionResult } from '@/types/executionResult';
import { AIMessage } from '@/types/aiMessage';
import { Problem } from '@/types/problem';

enum SupportedLanguages {
  cpp = 'cpp',
  python = 'python'
  // java = 'java',
  // typescript = 'typescript'
}

const languageLabels: Record<SupportedLanguages, string> = {
  [SupportedLanguages.cpp]: 'C++',
  [SupportedLanguages.python]: 'Python'
};

const snippets = {
  "ListNode*": {
      "python": [
        '# Definition for singly-linked list.',
        '# You may extend the class, but all test cases use the constructor below.',
        '',
        "class ListNode:",
        "    def __init__(self, val=0, next=None):",
        "        self.val = val",
        "        self.next = next"
      ],
      "cpp": [
        '// Definition for singly-linked list.',
        '// You may extend the class, but all test cases use the constructor below.',
        '',
          "struct ListNode {",
          "    int val;",
          "    ListNode *next;",
          "    ListNode(int x, ListNode* ptr=nullptr) : val(x), next(ptr) {}",
          "};"
      ],
  }
}

type TestCase = {
  in: any[];
  out: any[];
};

type Props = {
  problem: Problem;
  onChange?: (value: string | undefined, event: editor.IModelContentChangedEvent) => void;
  setExecutionResult: React.Dispatch<React.SetStateAction<ExecutionResult>>;
  currentLanguage: SupportedLanguages;
  setCurrentLanguage: React.Dispatch<React.SetStateAction<SupportedLanguages>>;
  setTabIndex: React.Dispatch<React.SetStateAction<number>>;
  codeValue: string;
  setCodeValue: React.Dispatch<React.SetStateAction<string>>;
  hasStarted: boolean;
};

export default function CodeEditor({
  problem,
  onChange,
  setExecutionResult,
  currentLanguage,
  setCurrentLanguage,
  setTabIndex,
  codeValue,
  setCodeValue,
  hasStarted
}: Props) {
  const outputType = problem.output_type;
  const functionName = problem.function;
  const params = problem.params;
  const testcases = JSON.parse(problem.testcases);
  const param_type = problem.param_type;

  let prefix = "";
  if (param_type.includes("ListNode*")) {
    prefix += snippets['ListNode*'][currentLanguage].join('\n') + "\n\n";
  }

  const starterCodes = {
    cpp: `${outputType} ${functionName}(${params.split(',').map((name, i) => `${param_type[i]} ${name}`).join(', ')}) {\n    \n}`,
    python: `def ${functionName}(${params}):\n    `,
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}',
    typescript: 'console.log("Hello, TypeScript!");'
  };

  const [runLoading, setRunLoading] = useState<boolean>(false);

  const runCode = async () => {
    setRunLoading(true);
    const payload = {
      language: currentLanguage,
      code: codeValue,
      problem_name: functionName,
      testcases: testcases,
      param_type: param_type,
      output_type: outputType
    };

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      setExecutionResult(data);
      setRunLoading(false);
      setTabIndex(1);
    } catch (error) {
      setRunLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if(hasStarted){
      setCodeValue(prefix + starterCodes[currentLanguage]);
    }
  }, [currentLanguage, setCodeValue, hasStarted]);

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex w-full justify-between bg-neutral-800">
        <select
          id="language_selector"
          className="rounded border border-transparent bg-transparent px-2 text-xs shadow-xl hover:cursor-pointer hover:bg-neutral-700 focus:outline-none"
          onChange={(e) => setCurrentLanguage(e.target.value as SupportedLanguages)}
          value={currentLanguage}
        >
          {Object.entries(SupportedLanguages).map(([key, value]) => (
            <option key={key} value={value}>
              {languageLabels[key as SupportedLanguages]}
            </option>
          ))}
        </select>
        <Button
          className="border border-transparent hover:cursor-pointer hover:bg-neutral-700"
          type="button"
          title="Reset to default code"
          onClick={() => setCodeValue(prefix + starterCodes[currentLanguage])}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.85355 2.14645C5.04882 2.34171 5.04882 2.65829 4.85355 2.85355L3.70711 4H9C11.4853 4 13.5 6.01472 13.5 8.5C13.5 10.9853 11.4853 13 9 13H5C4.72386 13 4.5 12.7761 4.5 12.5C4.5 12.2239 4.72386 12 5 12H9C10.933 12 12.5 10.433 12.5 8.5C12.5 6.567 10.933 5 9 5H3.70711L4.85355 6.14645C5.04882 6.34171 5.04882 6.65829 4.85355 6.85355C4.65829 7.04882 4.34171 7.04882 4.14645 6.85355L2.14645 4.85355C1.95118 4.65829 1.95118 4.34171 2.14645 4.14645L4.14645 2.14645C4.34171 1.95118 4.65829 1.95118 4.85355 2.14645Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
      <Editor
        defaultLanguage={currentLanguage}
        language={currentLanguage}
        theme="vs-dark"
        options={{
          selectOnLineNumbers: true,
          tabCompletion: 'off',
          minimap: { enabled: false }
        }}
        onChange={(newValue, e) => {
          setCodeValue(newValue || '');
          if (onChange) onChange(newValue, e);
        }}
        value={codeValue}
        className={'h-full'}
      />
      <Button
        disabled={runLoading}
        size={'sm'}
        className="transiiton-all fixed bottom-0 right-0 m-4 bg-purple-600 px-2 py-1 duration-300 ease-in-out hover:cursor-pointer hover:bg-purple-800 disabled:bg-purple-800"
        onClick={runCode}
      >
        {runLoading ? <LoadingDots /> : 'Run'}
      </Button>
    </div>
  );
}
