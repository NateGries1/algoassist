'use client';

import React, { useState } from 'react';
import { Button, buttonVariants } from './Button';
import { Testcase } from '@/types/testcase';

type Props = {
  testcases: Testcase[];
  params: string;
};

export default function Testcases({ testcases, params }: Props) {
  const [selected, setSelected] = useState<number>(0);

  // Adjusting the type to match the new structure
  if (!testcases) return null;

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
            Case {i + 1}
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
          <div className="flex flex-col gap-2">
            <h3>Output</h3>
            {/* Displaying the output array */}
            <span className="rounded bg-neutral-700 p-2">
              {JSON.stringify(testcases[selected].out)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}