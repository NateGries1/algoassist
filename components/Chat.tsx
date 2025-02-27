import React, { useState, useEffect} from 'react';
import Link from 'next/link';
import { AIMessage } from '@/types/aiMessage';
import { Button } from './Button';
import LoadingDots from './LoadingDots';

/*
const payload = {
      language: currentLanguage,
      code: codeValue,
      problemName: functionName,
      chat: null,
      history: chatHistory
    };
*/

type Props = {
    codeValue: string;
    functionName: string;
    currentLanguage: string;
    chatHistory: AIMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<AIMessage[]>>;
};

export default function Chat({ currentLanguage, codeValue, functionName, chatHistory, setChatHistory }: Props) {
    const [hintLoading, setHintLoading] = useState<boolean>(false);

    const getHint = async () => {
        console.log(chatHistory);
        setHintLoading(true);
        const payload = {
            language: currentLanguage,
            code: codeValue,
            problemName: functionName,
            chat: null,
            history: chatHistory? chatHistory : [] as AIMessage[]
        };

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            setHintLoading(false);
            setChatHistory(data.newHistory); // Update chatHistory with the new history
            console.log(chatHistory);
        } catch (error) {
            setHintLoading(false);
            console.error(error);
        }
    };

    return (
      <div className="flex flex-col space-y-2 p-4 bg-gray-900 text-white rounded-lg w-full max-w-lg h-[500px] overflow-y-auto">
        {!chatHistory || chatHistory.length === 0 ? (
            <div>No chat history yet.</div> // Optional fallback message when chat history is empty
            ) : (
            chatHistory.map((message, index) => (
                <div
                key={index}
                className={`p-3 rounded-lg break-words ${
                    message.role === "user" ? "bg-blue-700 text-white self-end" : "bg-gray-700 text-white self-start"
                }`}
                >
                {message.parts[0].text}
                </div>
            ))
        )}

        <Button
            disabled={hintLoading}
            size={'sm'}
            className="absolute bottom-0 left-0 m-4 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 transition-all duration-300 ease-in-out hover:cursor-pointer hover:to-pink-400 disabled:bg-neutral-800"
            onClick={() => getHint()}
        >
            {hintLoading ? <LoadingDots /> : 'Hint'}
        </Button>
      </div>
    );
}
