import React, { useState } from 'react';
type Props = {
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    descriptionError: string;
}

export default function Description({ description, setDescription, descriptionError }: Props) {
    return (
        <div className="flex flex-col h-full">
            <label htmlFor="description" className="block font-light mb-1">
                Problem Description
            </label>
            <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Markdown supported. Use # for headings, - for bullet points, and ` for inline code."
                className="flex-1 min-h-[150px] resize-none overflow-auto border border-gray-300 bg-neutral-700 rounded-xl shadow-sm p-2"
            ></textarea>
            {descriptionError && <p className="text-red-500 text-[11px]">{descriptionError}</p>}
        </div>
    );
}
