import React, { useState } from 'react';

type Props = {
    selectedTopics: string[];
    handleSelectTopic: (topic: string) => void;
    handleRemoveTopic: (topic: string) => void;
    allTopics: string[];
};


export default function Topics({ selectedTopics, handleSelectTopic, handleRemoveTopic, allTopics }: Props) {
    return (
        <div>
            <label htmlFor="difficulty" className="block font-light">
            Topics
            </label>
            <div className="relative">
                <select
                    value=""
                    onChange={(e) => {handleSelectTopic(e.target.value)}}
                    className="block w-full border text-[16px] border-gray-300 bg-neutral-700 rounded-full shadow-sm p-0.5 pl-3 pr-0 appearance-none"
                >
                    <option value="" disabled>
                    Select any
                    </option>
                    {allTopics
                    .filter((topic) => !selectedTopics.includes(topic))
                    .map((topic) => (
                        <option key={topic} value={topic}>
                        {topic}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute top-2 right-3 flex items-center">
                    <svg
                        width="20"
                        height="16"
                        viewBox="0 0 20 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white"
                    >
                        <path
                            d="M4 6L10 12L16 6"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div className="pt-1 flex flex-wrap gap-2">
                    {selectedTopics.map((topic) => (
                    <span
                        key={topic}
                        className="flex items-center bg-purple-600 text-white px-2 py-1 rounded-full text-sm"
                    >
                        {topic}
                        <button
                        type="button"
                        onClick={() => handleRemoveTopic(topic)}
                        className="ml-2 text-white hover:text-gray-300"
                        >
                        ✕
                        </button>
                    </span>
                    ))}
                </div>
            </div>
        </div>
    );
}