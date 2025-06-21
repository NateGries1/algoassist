"use client";
import { collection, query, where, getDocs } from "firebase/firestore";
import addData from '@/lib/firebase/addData';
import getDocument from '@/lib/firebase/getData';
import { useState } from 'react';
import { Problem } from '@/types/problem';
import { Testcases } from '@/types/testcases';
import Navbar from './Navbar';
import getProblems from '@/lib/firebase/getProblem';
import addProblem from '@/lib/firebase/addProblem';


type TestcaseForm = {
    in: string;
    out: string;
};

const typeMappings: Record<string, string> = {
  'int': 'int',
  'vector/list': 'vector<int>',
  'linked list': 'ListNode*',
};

export default function CreateProblem() {
    const [titleName, setTitleName] = useState<string>('');
    const [functionName, setFunctionName] = useState<string>('');
    const [parameters, setParameters] = useState<string[]>([]);
    const [paramNames, setParamNames] = useState<string[]>([]);
    const [testcaseForms, setTestcaseForms] = useState<TestcaseForm[]>([]);
    const [testcases, setTestcases] = useState<Testcases>([]);
    const [description, setDescription] = useState<string>('');
    const [returnType, setReturnType] = useState<string>('int');
    const [difficulty, setDifficulty] = useState<string>('easy');

    const handleTitleNameChange = (value: string) => {
        setTitleName(value);
        const newFunctionName = value
            .replace(/[_-]/g, ' ')
            .trim()
            .split(' ')
            .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
            .join('');
        setFunctionName(newFunctionName);
    };

    const handleParamChange = (index: number, value: string) => {
        const updated = [...parameters];
        updated[index] = value;
        setParameters(updated);
    };

    const handleTestcaseInputChange = (index: number, value: string) => {
        const updated = [...testcaseForms];
        updated[index].in = value;
        try {
            const parsedInput = JSON.parse("[" + value + "]");
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

    const handleParamNameChange = (index: number, value: string) => {
        const updated = [...paramNames];
        updated[index] = value;
        setParamNames(updated);
    };

    const addParameter = () => {
        setParameters([...parameters, '']);
        setParamNames([...paramNames, '']);
    };

    const addTestcase = () => {
        setTestcaseForms([...testcaseForms, { in: '', out: '' }]);
        setTestcases([...testcases, { in: [], out: [] }]);
    };

    const removeParameter = (index: number) => {
        const updated = parameters.filter((_, i) => i !== index);
        setParameters(updated);
        const updatedNames = paramNames.filter((_, i) => i !== index);
        setParamNames(updatedNames);
    };

    const removeTestcase = (index: number) => {
        const updated = testcases.filter((_, i) => i !== index);
        const updatedForms = testcaseForms.filter((_, i) => i !== index);
        setTestcaseForms(updatedForms);
        setTestcases(updated);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const problemData: Problem = {
            content: description,
            difficulty: difficulty,
            title: titleName,
            topic: '',
            lc_number: 0,
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
        //const document = await getProblems(problemData.function);
        //console.log("Document:", document);
    };

    return (
        <>
            <Navbar />
            <h1 className="poppins font-medium mb-4 text-center text-[36px] pt-10">Create a New Problem</h1>
            <form
             className="flex flex-col justify-center"
             onSubmit={handleSubmit}
            >
                <div className="grid grid-cols-2">
                    <div className="left-side px-4">
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium">
                                Problem Name
                            </label>
                            <input
                                type="text"
                                id="title"
                                onChange={(e) => handleTitleNameChange(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 bg-neutral-700 rounded-md shadow-sm p-2"
                            />
                            <label htmlFor="returnType" className="block text-sm font-medium">
                                Return Type
                            </label>
                            <select
                             id="returnType"
                             name="returnType"
                             onChange={(e) => setReturnType(e.target.value)}
                             className="mt-1 block border border-gray-300 bg-neutral-700 rounded-md shadow-sm p-2"
                            >
                                <option value="int">int</option>
                                <option value="list">vector/list</option>
                                <option value="sll">linked list</option>
                            </select>
                            {/* Difficulty */}
                            <label htmlFor="difficulty" className="block text-sm font-medium">
                                Difficulty
                            </label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="mt-1 block border border-gray-300 bg-neutral-700 rounded-md shadow-sm p-2"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>

                            {/* Parameters Section */}
                            <h2 className="text-lg font-semibold">Parameters</h2>
                            {parameters.map((param, index) => (
                                <div key={index} className="flex items-center space-x-2 text-black">
                                <input
                                    type="text"
                                    value={paramNames[index] || ''}
                                    onChange={(e) => handleParamNameChange(index, e.target.value)}
                                    placeholder={`Name ${index + 1}`}
                                    className="border px-3 py-1 rounded w-full"
                                />
                                <select
                                  value={param}
                                  onChange={(e) => handleParamChange(index, e.target.value)}
                                  id="returnType"
                                  name="returnType"
                                  className="mt-1 block w-full border border-gray-300 bg-neutral-700 text-white rounded-md shadow-sm p-2">
                                    <option value="int">int</option>
                                    <option value="list">vector/list</option>
                                    <option value="sll">linked list</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => removeParameter(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addParameter}
                                className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                            >
                                + Add Parameter
                            </button>

                            {/* Testcases Section */}
                            <h2 className="text-lg font-semibold">Testcases</h2>
                            {testcaseForms.map((testcase, index) => (
                                <div key={index} className="flex items-center space-x-2 text-white">
                                    {functionName}
                                    ( &nbsp;
                                    <div>
                                        <input
                                            type="text"
                                            value={testcase.in || ''}
                                            onChange={(e) => handleTestcaseInputChange(index, e.target.value)}
                                            placeholder={`Input ${index + 1}`}
                                            className="border px-3 py-1 rounded w-full text-black"
                                        />
                                    </div>
                                    &nbsp; ) &nbsp; = &nbsp;
                                    <div>
                                        <input
                                            type="text"
                                            value={testcase.out || ''}
                                            onChange={(e) => handleTestcaseOutputChange(index, e.target.value)}
                                            placeholder={`Output ${index + 1}`}
                                            className="border px-3 py-1 rounded w-full p-2 text-black"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeTestcase(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addTestcase}
                                className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                            >
                                + Add Testcase
                            </button>
                        </div>
                    </div>
                    <div className="right-side px-4">
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium">
                                Problem Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 bg-neutral-700 rounded-md shadow-sm p-2"
                            ></textarea>
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mx-auto px-2"
                >
                    Create Problem
                </button>
            </form>
        </>
    )
}