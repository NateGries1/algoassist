import React from "react";

type Props = {
setLcNumber: React.Dispatch<React.SetStateAction<number>>;
lcError: string;
};

export default function LcNumber({ setLcNumber, lcError }: Props) {
    return (
        <div className="w-[calc(50%-4px)]">
            <label htmlFor="title" className="block font-light">
                Leetcode Number
            </label>
            <input
                type="text"
                id="title"
                onChange={(e) => Number(e.target.value)? setLcNumber(Number(e.target.value)): setLcNumber(0)}
                placeholder="Ex: 1234"
                className="block w-full border border-gray-300 bg-neutral-700 rounded-full shadow-sm p-0.5 pl-3 appearance-none"
            />
            {lcError && <p className="text-red-500 text-[11px]">{lcError}</p>}
        </div>
    );
}