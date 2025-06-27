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
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    const allTopics = ['Arrays', 'Strings', 'Recursion', 'Trees', 'Graphs'];

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
    };

    return (
        <>
            <Navbar />
            <div className="mt-12 px-1 mx-auto">
                <h1 className="text-[48px] text-center pt-10 bg-gradient-to-r from-purple-500 to-white bg-clip-text text-transparent">Create a New Problem!</h1>
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
                                titleName={titleName}
                                handleTitleNameChange={handleTitleNameChange}
                            />
                            <ReturnType
                                setReturnType={setReturnType}
                            />
                            <Difficulty
                                setDifficulty={setDifficulty}
                            />
                            <Topics
                                selectedTopics={selectedTopics}
                                handleSelectTopic={handleSelectTopic}
                                handleRemoveTopic={handleRemoveTopic}
                                allTopics={allTopics}
                            />
                        </div>
                        {/* Middle */}
                        <div className="min-w-[300px] flex-1">
                            <Description
                                description={description}
                                setDescription={setDescription}
                            />
                        </div>
                        {/* Right */}
                        <div className="min-w-[300px] flex-1">
                            <Parameters
                            parameters={parameters}
                            paramNames={paramNames}
                            handleParamNameChange={handleParamNameChange}
                            handleParamChange={handleParamChange}
                            removeParameter={removeParameter}
                            addParameter={addParameter}
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
                            />
                        </div>
                    </div>
                    {/* Bottom */}
                    <div className="flex justify-center mt-2">
                        <button
                        type="submit"
                        className="px-3 py-1 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                        >
                            Create Problem
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}