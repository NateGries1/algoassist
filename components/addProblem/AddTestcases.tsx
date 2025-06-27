const examples: Record<string, string> = {
  'int': '420',
  'list': '[1, 2, 3]',
  'sll': '[1, 2, 3]',
  'str': `"hello"`,
};

const returnPlaceholders: Record<string, string> = {
    'int': '42',
    'list': '[1, 2, 3]',
    'sll': '[1, 2, 3]',
    'str': '"hello"',
};

type Props = {
    functionName: string;
    testcaseForms: { in: string; out: string }[];
    testcases: { in: any[]; out: any[] }[];
    handleTestcaseInputChange: (index: number, value: string) => void;
    handleTestcaseOutputChange: (index: number, value: string) => void;
    addTestcase: () => void;
    removeTestcase: (index: number) => void;
    parameters: string[];
    returnType: string;
};


    
export default function AddTestcases({
    functionName,
    testcaseForms,
    testcases,
    handleTestcaseInputChange,
    handleTestcaseOutputChange,
    addTestcase,
    removeTestcase,
    parameters,
    returnType
}: Props) {
    return (
        <>
            <h2>Testcases (Add at least 3)</h2>
            {testcaseForms.map((testcase, index) => (
                <div key={index} className="flex flex-col font-light">
                    <span className="text-center">Testcase {index + 1}</span>
                    <div
                        key={index}
                        className="flex justify-between items-center w-full gap-x-2 text-white"
                    >
                        <div className="flex flex-col gap-y-2 max-w-[calc(100%-10px)]">
                            {/* First Section */}
                            <div className="flex items-center gap-x-1 whitespace-nowrap">
                                <span>{functionName}(</span>
                                <input
                                type="text"
                                value={testcase.in || ''}
                                onChange={(e) => handleTestcaseInputChange(index, e.target.value)}
                                placeholder={parameters.length ? "Ex: " + parameters.map(param => examples[param]).join(', ') : "Add Parameters First"}
                                className="w-full min-w-[100px] border border-gray-300 bg-neutral-700 rounded-full shadow-sm px-2 py-1 appearance-none"
                                />
                                <span>)</span>
                            </div>

                            {/* Second Section */}
                            <div className="flex items-center gap-x-1 mb-2">
                                <span>Output: </span>
                                <input
                                type="text"
                                value={testcase.out || ''}
                                onChange={(e) => handleTestcaseOutputChange(index, e.target.value)}
                                placeholder={returnType? returnPlaceholders[returnType] : ""}
                                className="w-full min-w-[100px] border border-gray-300 bg-neutral-700 rounded-full shadow-sm px-2 py-1 appearance-none"
                                />
                            </div>
                        </div>


                        {/* Right: ✕ button */}
                        <button
                        type="button"
                        onClick={() => removeTestcase(index)}
                        className="text-neutral-300 hover:text-red-700 flex-shrink-0"
                        >
                        ✕
                        </button>
                    </div>
                </div>
            ))}


            <div className="flex justify-start mb-2">
                <button
                    type="button"
                    onClick={addTestcase}
                    className="inline-block px-3 py-1 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                >
                    + Add Testcase
                </button>
            </div>
        </>
    );
}