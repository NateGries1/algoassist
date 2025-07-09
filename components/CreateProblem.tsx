"use client";
import { useState } from 'react';
import { useRouter} from 'next/navigation';
import { Problem as ProblemType} from '@/types/problem';
import Problem from './Problem';
import { Testcase } from '@/types/testcase';
import Navbar from './Navbar';
import Description from './addProblem/Description';
import Difficulty from './addProblem/Difficulty';
import Parameters from './addProblem/Parameters';
import ReturnType from './addProblem/ReturnType';
import AddTestcases from './addProblem/AddTestcases';
import Title from './addProblem/Title';
import Topics from './addProblem/Topics';
import LcNumber from './addProblem/LcNumber';
import FunctionName from './addProblem/FunctionName';
import { TestcaseForm } from '@/types/testcaseForm';
import { FormData } from '@/types/formData';
import keywords from '@/lib/keywords';

const paramMappings: Record<string, string> = {
    'int': 'number',
    'vector<int>': 'array',
    'ListNode*': 'array',
    'string': 'string',
};

export default function CreateProblem() {
    const initialForm: FormData = {
        titleName: '',
        titleError: '',
        functionName: '',
        functionNameError: '',
        lcNumber: 0,
        lcError: '',
        returnType: 'int',
        parameters: [],
        paramNames: [],
        paramError: '',
        testcaseForms: [],
        testcases: [],
        testcaseError: '',
        description: '',
        descriptionError: '',
        difficulty: 'easy',
        selectedTopics: [],
        topicError: '',
    };

    const [formData, setFormData] = useState<FormData>(initialForm);
    const [viewPreview, setViewPreview] = useState<boolean>(false);
    const [problemPreview, setProblemPreview] = useState<ProblemType | null>(null);
    const allTopics = ['Arrays', 'Strings', 'Recursion', 'Trees', 'Graphs', 'Linked Lists', 'Dynamic Programming', 'Sorting', 'Searching', 'Hashing', 'Greedy Algorithms', 'Backtracking', 'Bit Manipulation', 'Mathematics'];
    
    const router = useRouter();

    const handleTitleNameChange = (value: string) => {
        const generateFunctionName = (input: string) =>
            input
                .replace(/[_-]/g, ' ')
                .trim()
                .split(/\s+/)
                .map((w, i) =>
                    i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()
                )
                .join('');

        const newFunctionName = generateFunctionName(value);
        const oldFunctionName = generateFunctionName(formData.titleName);

        const shouldUpdateFunctionName =
            !formData.functionName || formData.functionName === oldFunctionName;

        setFormData({
            ...formData,
            titleName: value,
            functionName: shouldUpdateFunctionName ? newFunctionName : formData.functionName,
        });
    };


    const handleSelectTopic = (topic: string) => {
        if (!formData.selectedTopics.includes(topic)) {
            setFormData({ ...formData, selectedTopics: [...formData.selectedTopics, topic] });
        }
    }

    const handleRemoveTopic = (topic: string) => {
        setFormData({ ...formData, selectedTopics: formData.selectedTopics.filter(t => t !== topic) });
    }

    const handleParamChange = (index: number, value: string) => {
        const updated = [...formData.parameters];
        updated[index] = value;
        setFormData({ ...formData, parameters: updated });
        console.log("Updated params:", updated);
    };

    const handleParamNameChange = (index: number, value: string) => {
        const updated = [...formData.paramNames];
        updated[index] = value;
        setFormData({ ...formData, paramNames: updated });
    };

    const addParameter = () => {
        setFormData({ ...formData, parameters: [...formData.parameters, 'int'], paramNames: [...formData.paramNames, ''] });
    };

    const removeParameter = (index: number) => {
        //console.log(formData.parameters.length, formData.paramNames.length);
        const updated = formData.parameters.filter((_, i) => i !== index);
        const updatedNames = formData.paramNames.filter((_, i) => i !== index);
        //console.log(updated.length, updatedNames.length);
        setFormData({ ...formData, parameters: updated, paramNames: updatedNames });
    };

    const handleTestcaseInputChange = (index: number, value: string) => {
        const updated = [...formData.testcaseForms];
        updated[index].in = value;
        try {
            const fullInput = "[" + value + "]";
            const parsedInput = JSON.parse(fullInput);
            formData.testcases[index].in = parsedInput;
            setFormData({ ...formData, testcases: [...formData.testcases] });
        } catch (error) {}
        setFormData({ ...formData, testcaseForms: updated });
    };

    const handleTestcaseOutputChange = (index: number, value: string) => {
        const updated = [...formData.testcaseForms];
        updated[index].out = value;
        console.log("Output value:", value);
        try {
            const parsedOutput = JSON.parse(value);
            formData.testcases[index].out = parsedOutput;
            console.log("Output length:", parsedOutput.length, parsedOutput);
            setFormData({ ...formData, testcases: [...formData.testcases] });
        } catch (error) {}
        setFormData({ ...formData, testcaseForms: updated });
    };

    const addTestcase = () => {
        setFormData({ ...formData, testcaseForms: [...formData.testcaseForms, { in: '', out: '' }], testcases: [...formData.testcases, { in: [], out: null }] });
    };

    const removeTestcase = (index: number) => {
        const updated = formData.testcases.filter((_, i) => i !== index);
        const updatedForms = formData.testcaseForms.filter((_, i) => i !== index);
        setFormData({ ...formData, testcaseForms: updatedForms, testcases: updated });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!ValidateProblem(formData, setFormData)) {
                throw new Error('Validation errors occurred. Please fix them before submitting.');
            }

            const problemData: ProblemType = {
                content: formData.description,
                difficulty: formData.difficulty,
                title: formData.titleName,
                topic: formData.selectedTopics,
                lc_number: formData.lcNumber,
                function: formData.functionName,
                testcases: JSON.stringify(formData.testcases),
                params: formData.paramNames.join(', '),
                param_type: formData.parameters,
                output_type: formData.returnType,
            };

            const response = await fetch('/api/db/addProblem', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(problemData)
            });

            const data = await response.json();
            if (!data.error) {
                console.log("Added problem successfully:", data);
                setProblemPreview(problemData);
            } else {
                console.error("Error adding problem:", data.error);
            }
        } catch (error) {
            console.error("Error adding problem:", error);
        }
    };

    if (viewPreview && problemPreview) {
        return (
            <Problem
                result={problemPreview}
            />
        );
    }

    if (problemPreview) {
        return (
            <div className="flex h-[100vh] justify-center items-center flex-wrap gap-4">
                <button
                onClick={() => { setFormData(initialForm); setViewPreview(false); setProblemPreview(null); }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                Create Another Problem
                </button>
                <button
                onClick={() => router.push('/problems')}
                className="px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-800 transition"
                >
                View All Problems
                </button>
                {!viewPreview && (
                <button
                    onClick={() => setViewPreview(true)}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                >
                    Preview Problem
                </button>
                )}
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-center mt-12 px-1 mx-auto">
                <h1 className="mx-auto text-[48px] text-center pt-10 bg-gradient-to-r from-purple-600 to-white bg-clip-text text-transparent">Create a New Problem!</h1>
                <p className="text-[16px] text-center text-gray-200 mb-8">Build your own problem for others to check out and try! You can also check out other problems.</p>
                <form
                    className="relative mx-auto bg-[#1f1f1f] max-w-full w-[1100px] rounded-2xl p-4 shadow-sm"
                    onSubmit={handleSubmit}
                >
                    {/* Border */}
                    <div className="absolute inset-0 rounded-xl glass-border pointer-events-none" />
                    <div className="flex flex-wrap justify-between gap-x-8 pt-4 z-1 gap-y-3">
                        {/* Left */}
                        <div className="min-w-[300px] flex-1 flex flex-col gap-y-3">
                            <Title
                                handleTitleNameChange={handleTitleNameChange}
                                titleError={formData.titleError}
                            />
                            <div className="flex justify-between">
                                <FunctionName
                                    setFunctionName={(name) => setFormData({ ...formData, functionName: name })}
                                    functionName={formData.functionName}
                                    functionNameError={formData.functionNameError}
                                />
                                <LcNumber
                                    setLcNumber={(number) => setFormData({ ...formData, lcNumber: number })}
                                    lcError={formData.lcError}
                                />
                            </div>
                            <div className="flex justify-between">
                                <ReturnType
                                    setReturnType={(type) => setFormData({ ...formData, returnType: type })}
                                />
                                <Difficulty
                                    setDifficulty={(value) => setFormData({ ...formData, difficulty: value })}
                                />
                            </div>
                            
                            <Topics
                                selectedTopics={formData.selectedTopics}
                                handleSelectTopic={handleSelectTopic}
                                handleRemoveTopic={handleRemoveTopic}
                                allTopics={allTopics}
                                topicError={formData.topicError}
                            />
                        </div>
                        {/* Middle */}
                        <div className="min-w-[300px] flex-1">
                            <Description
                                description={formData.description}
                                setDescription={(description) => setFormData({ ...formData, description })}
                                descriptionError={formData.descriptionError}
                            />
                        </div>
                        {/* Right */}
                        <div className="min-w-[300px] flex-1 flex flex-col gap-y-3">
                            <Parameters
                                parameters={formData.parameters}
                                paramNames={formData.paramNames}
                                handleParamNameChange={handleParamNameChange}
                                handleParamChange={handleParamChange}
                                removeParameter={removeParameter}
                                addParameter={addParameter}
                                paramError={formData.paramError}
                            />
                            <AddTestcases
                                functionName={formData.functionName}
                                testcaseForms={formData.testcaseForms}
                                testcases={formData.testcases}
                                handleTestcaseInputChange={handleTestcaseInputChange}
                                handleTestcaseOutputChange={handleTestcaseOutputChange}
                                addTestcase={addTestcase}
                                removeTestcase={removeTestcase}
                                parameters={formData.parameters}
                                returnType={formData.returnType}
                                testcaseError={formData.testcaseError}
                            />
                        </div>
                    </div>
                    {/* Bottom */}
                    <div className="flex justify-center mt-8">
                        <button
                        type="submit"
                        className="px-3 py-1 mt-4 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                        >
                            Create Problem
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

const ValidateProblem = (formData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>) => {
    let hasError = false;
    const titleRegex = /^[a-zA-Z0-9 ]+$/;
    // Title validation
    if (!formData.titleName) {
        setFormData({ ...formData, titleError: 'Enter a title' });
        hasError = true;
    } else if (!titleRegex.test(formData.titleName)) {
        setFormData({ ...formData, titleError: 'Title can only contain alphanumeric characters and spaces.' });
        hasError = true;
    } else if (keywords.has(formData.titleName)) {
        setFormData({ ...formData, titleError: 'Title cannot be a reserved keyword.' });
        hasError = true;
    } else {
        setFormData({ ...formData, titleError: '' });
    }

    // Function name validation
    const functionNameRegex = /^[a-z][a-zA-Z]*$/;
    if (!formData.functionName) {
        setFormData({ ...formData, functionNameError: 'Include a function name' });
        hasError = true;
    } else if (!functionNameRegex.test(formData.functionName)) {
        setFormData({ ...formData, functionNameError: 'Title must be in camelCase and contain no numbers.' });
        hasError = true;
    } else if (keywords.has(formData.functionName)) {
        setFormData({ ...formData, functionNameError: 'Title cannot be a reserved keyword.' });
        hasError = true;
    } else {
        setFormData({ ...formData, functionNameError: '' });
    }

    // Leetcode number validation
    if (formData.lcNumber == 0) {
        setFormData({ ...formData, lcError: 'Enter a valid Leetcode number.' });
        hasError = true;
    } else {
        setFormData({ ...formData, lcError: '' });
    }

    // Parameter validation
    const paramRegex = /^[a-z][a-zA-Z0-9_]*$/;
    if (formData.parameters.length === 0) {
        setFormData({ ...formData, paramError: 'Please add at least one parameter.' });
        hasError = true;
    } else if (formData.paramNames.some(param => !paramRegex.test(param))) {
        setFormData({ ...formData, paramError: 'Parameters can only contain letters and underscores.' });
        hasError = true;
    } else {
        setFormData({ ...formData, paramError: '' });
    }

    // Description validation
    if (formData.description.trim() === '') {
        setFormData({ ...formData, descriptionError: 'Description cannot be empty.' });
        hasError = true;
    } else {
        setFormData({ ...formData, descriptionError: '' });
    }

    // Topics validation
    if (formData.selectedTopics.length === 0) {
        setFormData({ ...formData, topicError: 'Please select at least one topic.' });
        hasError = true;
    } else {
        setFormData({ ...formData, topicError: '' });
    }

    // Testcases validation
    if (formData.testcases.length < 3) {
        setFormData({ ...formData, testcaseError: 'Please add at least 3 testcases.' });
        hasError = true;
    } else {
        setFormData({ ...formData, testcaseError: '' });
    }

    for (const testcase of formData.testcases) {
        const args = testcase.in;
        if (args.length !== formData.parameters.length) {
            setFormData({ ...formData, testcaseError: `Testcase ${formData.testcases.indexOf(testcase) + 1} input length mismatch. Expected ${formData.parameters.length}, got ${args.length}.` });
            hasError = true;
            break;
        }

        for (let i = 0; i < args.length; ++i) {
            console.log(i, formData.parameters[i]);
            const expectedType = paramMappings[formData.parameters[i]];
            if (expectedType === 'array') {
                if (Array.isArray(args[i]) == false) {
                    setFormData({ ...formData, testcaseError: `Testcase ${formData.testcases.indexOf(testcase) + 1} input type mismatch for parameter ${i+1}. Expected ${expectedType}, got ${typeof args[i]}.` });
                    hasError = true;
                }
            } else {
                if (typeof args[i] !== expectedType) {
                    setFormData({ ...formData, testcaseError: `Testcase ${formData.testcases.indexOf(testcase) + 1} input type mismatch for parameter ${i+1}. Expected ${expectedType}, got ${typeof args[i]}.` });
                    hasError = true;
                }
            }
        }

        if (paramMappings[formData.returnType] === 'array') {
            if (!Array.isArray(testcase.out)) {
                setFormData({ ...formData, testcaseError: `Testcase ${formData.testcases.indexOf(testcase) + 1} output type mismatch. Expected array, got ${typeof testcase.out}.` });
                hasError = true;
            }
        } else if (typeof testcase.out !== paramMappings[formData.returnType]) {
            setFormData({ ...formData, testcaseError: `Testcase ${formData.testcases.indexOf(testcase) + 1} output type mismatch. Expected ${paramMappings[formData.returnType]}, got ${typeof testcase.out}.` });
            hasError = true;
        }
        if (hasError) break;
    }

    return !hasError;
};
