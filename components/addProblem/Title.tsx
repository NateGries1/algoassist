import React from "react";

type Props = {
  titleName: string;
handleTitleNameChange: (title: string) => void;
};

export default function Title({ handleTitleNameChange }: Props) {
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
        </div>
    );
}