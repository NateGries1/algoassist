'use client';

import React, { useState } from 'react';
import { Button, buttonVariants } from './Button';

type Props = {
  testcases: string;
  params: string;
  stdout: string;
  stderr: string;
};

export default function Output({ testcases, params, stdout, stderr }: Props) {
  const [selected, setSelected] = useState<number>(0);

  if (stderr)
    return (
      <div className="rounded-lg bg-red-400 p-2">
        <span className="font-mediump-1 rounded text-sm text-black">{stderr}</span>
      </div>
    );

  const result: {
    in: any[];
    out: number[];
  }[] = JSON.parse(testcases);

  if (!testcases) return null;

  const output = JSON.parse(stdout.trim());

  const compareArrays = (expected: any[], actual: any[]): boolean => {
    return (
      output &&
      expected.length === actual.length &&
      expected.every((value, index) => value === actual[index])
    );
  }

  const isTestCaseValid = (expected: number[], output: number[], type: string): boolean => {
    switch (type) {
      case 'array':
        return compareArrays(expected, output);
      default:
        return false;
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto font-mono text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {result.map((_, i) => (
          <Button
            key={i}
            onClick={() => setSelected(i)}
            className={buttonVariants({
              variant: 'ghost',
              size: 'sm',
              className: selected === i ? 'bg-neutral-700' : ''
            })}
          >
            <ul
              className={`list-inside list-disc ${isTestCaseValid(output[i].expected, output[i].output, 'array') ? 'marker:text-green-600' : 'marker:text-red-600'}`}
            >
              <li>Case {i + 1}</li>
            </ul>
          </Button>
        ))}
      </div>
      {result[selected] && (
        <div className="flex flex-col gap-4 font-mono">
          <div className="flex flex-col gap-2">
            <h3>Input</h3>

            {params.split(',').map((param, i) => (
              <span key={i} className="rounded bg-neutral-700 p-2">
                {param}: {JSON.stringify(result[selected].in[i])}
              </span>
            ))}
          </div>
          {output[selected].stdout && (
            <div className="flex flex-col gap-2">
              <h3>Stdout</h3>
              <span className="rounded bg-neutral-700 p-2">{output[selected].stdout}</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h3>Output</h3>
            <span className="rounded bg-neutral-700 p-2">
              <pre>{JSON.stringify(output[selected].output)}</pre>
            </span>
            <div>Expected: </div>
            <span className="rounded bg-neutral-700 p-2">
              {JSON.stringify(result[selected].out)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
