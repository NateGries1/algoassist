import React from "react";

type Props = {
    setDifficulty: (value: string) => void;
};

export default function Difficulty({ setDifficulty }: Props) {
    return (
        <div className="w-[calc(50%-4px)]">
            <label htmlFor="difficulty" className="block font-light">
            Difficulty
            </label>
            <div className="relative">
                <select
                    id="returnType"
                    name="returnType"
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="block w-full border text-[16px] border-gray-300 bg-neutral-700 rounded-full shadow-sm p-0.5 pl-3 pr-0 appearance-none"
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
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
            </div>
        </div>
    );
}