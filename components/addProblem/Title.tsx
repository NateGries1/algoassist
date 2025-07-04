import React from "react";

type Props = {
    handleTitleNameChange: (title: string) => void;
    titleError: string;
};

export default function Title({ handleTitleNameChange, titleError }: Props) {
    return (
        <div>
            <label htmlFor="title" className="block font-light">
                Problem Name
            </label>
            <input
                type="text"
                id="title"
                onChange={(e) => handleTitleNameChange(e.target.value)}
                placeholder="Ex: Two Sum"
                className="block w-full border border-gray-300 bg-neutral-700 rounded-full shadow-sm p-0.5 pl-3 appearance-none"
            />
            {titleError && <p className="text-red-500 text-[11px]">{titleError}</p>}
        </div>
    );
}