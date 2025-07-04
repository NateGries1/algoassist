"use client";
import { collection, query, where, getDocs } from "firebase/firestore";
import addData from '@/lib/firebase/addData';
import getDocument from '@/lib/firebase/getData';
import { useState } from 'react';
import { Problem } from '@/types/problem';
import { Testcases } from '@/types/testcases';
import Navbar from './Navbar';
import getProblems from '@/lib/firebase/getProblem';
import Description from './addProblem/Description';
import Difficulty from './addProblem/Difficulty';
import Parameters from './addProblem/Parameters';
import ReturnType from './addProblem/ReturnType';
import AddTestcases from './addProblem/AddTestcases';
import Title from './addProblem/Title';
import Topics from './addProblem/Topics';
import LcNumber from './addProblem/LcNumber';
import FunctionName from './addProblem/FunctionName';

type TestcaseForm = {
    in: string;
    out: string;
};

const typeMappings: Record<string, string> = {
  'int': 'int',
  'vector/list': 'vector<int>',
  'linked list': 'ListNode*',
};

const paramMappings: Record<string, string> = {
    'int': 'number',
    'vector/list': 'array',
    'linked list': 'array',
    'string': 'string',
};

export default function CreateProblem() {
    const [titleName, setTitleName] = useState<string>('');
    const [titleError, setTitleError] = useState<string>('');
    const [functionName, setFunctionName] = useState<string>('');
    const [functionNameError, setFunctionNameError] = useState<string>('');
    const [lcNumber, setLcNumber] = useState<number>(0);
    const [lcError, setLcError] = useState<string>('');
    const [returnType, setReturnType] = useState<string>('int');
    const [parameters, setParameters] = useState<string[]>([]);
    const [paramNames, setParamNames] = useState<string[]>([]);
    const [paramError, setParamError] = useState<string>('');
    const [testcaseForms, setTestcaseForms] = useState<TestcaseForm[]>([]);
    const [testcases, setTestcases] = useState<Testcases>([]);
    const [testcaseError, setTestcaseError] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [descriptionError, setDescriptionError] = useState<string>('');
    const [difficulty, setDifficulty] = useState<string>('easy');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [topicError, setTopicError] = useState<string>('');

    const allTopics = ['Arrays', 'Strings', 'Recursion', 'Trees', 'Graphs'];

    const handleTitleNameChange = (value: string) => {
        const oldFunctionName = titleName && titleName
            .replace(/[_-]/g, ' ')
            .trim()
            .split(/\s+/)
            .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
            .join('');
        setTitleName(value);

        if (!functionName || oldFunctionName == functionName) {
            const newFunctionName = value
                .replace(/[_-]/g, ' ')
                .trim()
                .split(/\s+/) 
                .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
                .join('');
            setFunctionName(newFunctionName);
        }
        
    };

    const handleSelectTopic = (topic: string) => {
        if (!selectedTopics.includes(topic)) {
            setSelectedTopics([...selectedTopics, topic]);
        }
    }

    const handleRemoveTopic = (topic: string) => {
        setSelectedTopics(selectedTopics.filter(t => t !== topic));
    }

    const handleParamChange = (index: number, value: string) => {
        const updated = [...parameters];
        updated[index] = value;
        setParameters(updated);
        console.log("Updated params:", updated);
    };

    const handleParamNameChange = (index: number, value: string) => {
        const updated = [...paramNames];
        updated[index] = value;
        setParamNames(updated);
    };

    const addParameter = () => {
        setParameters([...parameters, 'int']);
        setParamNames([...paramNames, '']);
    };

    const removeParameter = (index: number) => {
        const updated = parameters.filter((_, i) => i !== index);
        setParameters(updated);
        const updatedNames = paramNames.filter((_, i) => i !== index);
        setParamNames(updatedNames);
    };

    const handleTestcaseInputChange = (index: number, value: string) => {
        const updated = [...testcaseForms];
        updated[index].in = value;
        try {
            const fullInput = "[" + value + "]";
            const parsedInput = JSON.parse(fullInput);
            testcases[index].in = parsedInput;
            setTestcases([...testcases]);
        } catch (error) {}
        setTestcaseForms(updated);
    };

    const handleTestcaseOutputChange = (index: number, value: string) => {
        const updated = [...testcaseForms];
        updated[index].out = value;
        try {
            const parsedOutput = JSON.parse(value);
            testcases[index].out = parsedOutput;
            setTestcases([...testcases]);
        } catch (error) {}
        setTestcaseForms(updated);
    };

    const addTestcase = () => {
        setTestcaseForms([...testcaseForms, { in: '', out: '' }]);
        setTestcases([...testcases, { in: [], out: [] }]);
    };

    const removeTestcase = (index: number) => {
        const updated = testcases.filter((_, i) => i !== index);
        const updatedForms = testcaseForms.filter((_, i) => i !== index);
        setTestcaseForms(updatedForms);
        setTestcases(updated);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            let hasError = false;

            const titleRegex = /^[a-zA-Z0-9 ]+$/;
            if (!titleName) {
                setTitleError('Enter a title');
                hasError = true;
            } else if (!titleRegex.test(titleName)) {
                setTitleError('Title can only contain alphanumeric characters and spaces.');
                hasError = true;
            } else {
                setTitleError('');
            }

            const reservedWords = new Set([
                "and","as","assert","auto","bitand","bitor","bool","break","case","catch","char","class","compl","const","continue","default","delete","do","double","else","enum","export","extern","false","float","for","friend","goto","if","import","inline","int","long","mutable","namespace","new","not","or","private","protected","public","register","return","short","signed","sizeof","static","struct","super","switch","template","this","throw","true","try","typedef","typeid","typename","union","unsigned","using","virtual","void","volatile","while"
            ]); // one-word keywords for JS, C++, and Python
            const functionNameRegex = /^[a-z][a-zA-Z]*$/;
            if (!functionName) {
                setFunctionNameError('Include a function name');
                hasError = true;
            } else if (!functionNameRegex.test(functionName)) {
                setFunctionNameError('Title must be in camelCase.');
                hasError = true;
            } else if (reservedWords.has(functionName)) {
                setFunctionNameError('Title cannot be a reserved keyword.');
                hasError = true;
            } else {
                setFunctionNameError('');
            }

            if (lcNumber == 0) {
                setLcError('Enter a valid Leetcode number.');
                hasError = true;
            } else {
                setLcError('');
            }

            if (parameters.length === 0) {
                setParamError('Please add at least one parameter.');
                hasError = true;
            } else {
                setParamError('');
            }

            const paramRegex = /^[a-z][a-zA-Z0-9_]*$/;
            if (paramNames.some(param => !paramRegex.test(param))) {
                setParamError('Parameters can only contain letters and underscores.');
                hasError = true;
            }

            if (description.trim() === '') {
                setDescriptionError('Description cannot be empty.');
                hasError = true;
            } else {
                setDescriptionError('');
            }

            if (selectedTopics.length === 0) {
                setTopicError('Please select at least one topic.');
                hasError = true;
            } else {
                setTopicError('');
            }

            if (testcases.length < 3) {
                setTestcaseError('Please add at least 3 testcases.');
                hasError = true;
            } else {
                setTestcaseError('');
            }

            for (const testcase of testcases) {
                const args = testcase.in;
                for (let i = 0; i < args.length; ++i) {
                    const expectedType = paramMappings[parameters[i]];
                    if (expectedType === 'array') {
                        if (Array.isArray(args[i]) == false) {
                            setTestcaseError(`Testcase ${testcases.indexOf(testcase) + 1} input type mismatch for parameter ${i+1}. Expected ${expectedType}, got ${typeof args[i]}.`);
                            hasError = true;
                        }
                    } else {
                        if (typeof args[i] !== expectedType) {
                            setTestcaseError(`Testcase ${testcases.indexOf(testcase) + 1} input type mismatch for parameter ${i+1}. Expected ${expectedType}, got ${typeof args[i]}.`);
                            hasError = true;
                        }
                    }
                }
            }

            // if (hasError) {
            //     throw new Error('Validation errors occurred. Please fix them before submitting.');
            // }

            const problemData: Problem = {
                content: description,
                difficulty: difficulty,
                title: titleName,
                topic: selectedTopics,
                lc_number: lcNumber,
                function: functionName,
                testcases: JSON.stringify(testcases),
                params: paramNames.join(', '),
                param_type: parameters.map((param) => typeMappings[param] || 'int'),
                output_type: typeMappings[returnType],
            };

            const response = await fetch('/api/db/addProblem', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(problemData)
            });

            const {data, error} = await response.json();
            if (data && !error) {
                console.log("Added problem successfully:", data);
            }
        }
        catch(error){
            console.error("Error adding problem:", error);
        }
    };

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
                                titleError={titleError}
                            />
                            <div className="flex justify-between">
                                <FunctionName
                                    setFunctionName={setFunctionName}
                                    functionName={functionName}
                                    functionNameError={functionNameError}
                                />
                                <LcNumber
                                    setLcNumber={setLcNumber}
                                    lcError={lcError}
                                />
                            </div>
                            <div className="flex justify-between">
                                <ReturnType
                                    setReturnType={setReturnType}
                                />
                                <Difficulty
                                setDifficulty={setDifficulty}
                            />
                            </div>
                            
                            <Topics
                                selectedTopics={selectedTopics}
                                handleSelectTopic={handleSelectTopic}
                                handleRemoveTopic={handleRemoveTopic}
                                allTopics={allTopics}
                                topicError={topicError}
                            />
                        </div>
                        {/* Middle */}
                        <div className="min-w-[300px] flex-1">
                            <Description
                                description={description}
                                setDescription={setDescription}
                                descriptionError={descriptionError}
                            />
                        </div>
                        {/* Right */}
                        <div className="min-w-[300px] flex-1 flex flex-col gap-y-3">
                            <Parameters
                                parameters={parameters}
                                paramNames={paramNames}
                                handleParamNameChange={handleParamNameChange}
                                handleParamChange={handleParamChange}
                                removeParameter={removeParameter}
                                addParameter={addParameter}
                                paramError={paramError}
                            />
                            <AddTestcases
                                functionName={functionName}
                                testcaseForms={testcaseForms}
                                testcases={testcases}
                                handleTestcaseInputChange={handleTestcaseInputChange}
                                handleTestcaseOutputChange={handleTestcaseOutputChange}
                                addTestcase={addTestcase}
                                removeTestcase={removeTestcase}
                                parameters={parameters}
                                returnType={returnType}
                                testcaseError={testcaseError}
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