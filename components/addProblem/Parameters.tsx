type Props = {
    parameters: string[];
    paramNames: string[];
    handleParamNameChange: (index: number, name: string) => void;
    handleParamChange: (index: number, type: string) => void;
    removeParameter: (index: number) => void;
    addParameter: () => void;
    paramError: string;
};


export default function Parameters({ parameters, paramNames, handleParamNameChange, handleParamChange, removeParameter, addParameter, paramError }: Props) {
    return (
        <div>
            <label htmlFor="returnType" className="block font-light">
            Parameters
            </label>
            {parameters.map((param, index) => (
                <div key={index} className="flex items-center space-x-2 text-white pb-2">
                    <div className="relative w-[25%]">
                        <select
                            id="paramType"
                            name="paramType"
                            onChange={(e) => handleParamChange(index, e.target.value)}
                            className="block w-full border text-[16px] border-gray-300 bg-neutral-700 rounded-full shadow-sm p-0.5 pl-3 pr-0 appearance-none"
                        >
                            <option value="int">int</option>
                            <option value="list">vector/list</option>
                            <option value="sll">linked list</option>
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
                    <input
                        type="text"
                        value={paramNames[index] || ''}
                        onChange={(e) => handleParamNameChange(index, e.target.value)}
                        placeholder={`variable name`}
                        className="block w-[60%] border border-gray-300 bg-neutral-700 rounded-full shadow-sm p-0.5 pl-3 appearance-none"
                    />
                    <button
                        type="button"
                        onClick={() => removeParameter(index)}
                        className="text-neutral-300 hover:text-red-700"
                    >
                        ✕
                    </button>
                </div>
            ))}
            <div className="flex justify-start">
                <button
                    type="button"
                    onClick={addParameter}
                    className="inline-block px-3 py-1 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                >
                    + Add Parameter
                </button>
            </div>
            {paramError && <p className="text-red-500 text-[11px]">{paramError}</p>}
        </div>
    );
}