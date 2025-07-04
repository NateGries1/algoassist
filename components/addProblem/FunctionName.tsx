import React from "react";

type Props = {
    functionName: string;
    setFunctionName: React.Dispatch<React.SetStateAction<string>>;
    functionNameError: string;
};

export default function FunctionName({ functionName, setFunctionName, functionNameError }: Props) {
    return (
        <div className="w-[calc(50%-4px)]">
            <label htmlFor="title" className="block font-light">
                Function Name
            </label>
            <input
                type="text"
                id="title"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="Ex: twoSum"
                className="block w-full border border-gray-300 bg-neutral-700 rounded-full shadow-sm p-0.5 pl-3 appearance-none"
            />
            {functionNameError && <p className="text-red-500 text-[11px]">{functionNameError}</p>}
        </div>
    );
}