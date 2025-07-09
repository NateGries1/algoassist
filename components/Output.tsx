'use client';

import React, { useState } from 'react';
import { Button, buttonVariants } from './Button';
import { Testcase } from '@/types/testcase';

type Props = {
  testcases: Testcase[];
  params: string;
  stdout: string;
  stderr: string;
  output_type: string;
};

export default function Output({ testcases, params, stdout, stderr, output_type }: Props) {
  const [selected, setSelected] = useState<number>(0);

  stdout = stdout.trim();
  const fixed = stdout.replace(/(?<!\\)\n/g, "\\n");
  const output = JSON.parse(fixed.trim());

  try {
    if (stderr)
      return (
        <div className="rounded-lg bg-red-400 p-2">
          <span className="font-medium p-1 rounded text-sm text-black whitespace-pre-wrap">{stderr}</span>
        </div>
      );

    if (!testcases) return null;

    const compareArrays = (expected: any[], actual: any[]): boolean => {
      return JSON.stringify(expected) === JSON.stringify(actual);
    }

    const isTestCaseValid = (expected: number[], output: number[], type: string): boolean => {
      return compareArrays(expected, output);
    };

    return (
      <div className="flex h-full flex-col gap-4 text-xs overflow-y-auto font-mono pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {testcases.map((_, i) => (
            <Button
              key={i}
              onClick={() => setSelected(i)}
              className={buttonVariants({
                variant: 'ghost',
                size: 'md',
                className: selected === i ? 'bg-neutral-700' : ''
              })}
            >
              <ul
                className={`list-inside list-disc ${isTestCaseValid(testcases[i].out, output[i].output, output_type) ? 'marker:text-green-600' : 'marker:text-red-600'}`}
              >
                <li>Case {i + 1}</li>
              </ul>
            </Button>
          ))}
        </div>
        {testcases[selected] && (
          <div className="flex flex-col gap-4 font-mono">
            <div className="flex flex-col gap-2">
              <h3>Input</h3>

              {params.split(',').map((param, i) => (
                <span key={i} className="rounded bg-neutral-700 p-2">
                  {param}: {JSON.stringify(testcases[selected].in[i])}
                </span>
              ))}
            </div>
            {output[selected].stdout && (
              <div className="flex flex-col gap-2">
                <h3>Stdout</h3>
                <span className="rounded bg-neutral-700 p-2 whitespace-pre-wrap">{output[selected].stdout}</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <h3>Output</h3>
              <span className="rounded bg-neutral-700 p-2">
                <pre>{JSON.stringify(output[selected].output)}</pre>
              </span>
              <div>Expected: </div>
              <span className="rounded bg-neutral-700 p-2">
                {JSON.stringify(testcases[selected].out)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  } catch (e) {
    console.error("Error parsing stdout:", e);
    return (
      <div className="rounded-lg bg-red-400 p-2">
        <span className="font-medium p-1 rounded text-sm text-black whitespace-pre-wrap">Error parsing stdout: {stdout}</span>
      </div>
    );
  }
}
