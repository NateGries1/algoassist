import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { AIMessage } from '@/types/aiMessage';

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
    chatHistory: AIMessage[];
};

export default function Chat({ chatHistory }: Props) {
    return (
      <div className="flex flex-col space-y-2 p-4 bg-gray-900 text-white rounded-lg w-full max-w-lg h-[500px] overflow-y-auto">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg break-words ${
              message.role === "user" ? "bg-blue-700 text-white self-end" : "bg-gray-700 text-white self-start"
            }`}
          >
            {message.parts[0].text}
          </div>
        ))}
      </div>
    );
}
