import { useState, useRef, useEffect } from "react";
import LoadingDots from './LoadingDots';

type MessageInputProps = {
  onSendMessage: (message: string) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  hintLoading: boolean;
};

export default function MessageInput({ onSendMessage, message, setMessage, hintLoading }: MessageInputProps) {
    const recognitionRef = useRef<
        (typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition) | null
    >(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            console.log("SpeechRecognition:", SpeechRecognition);

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.continuous = false;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const text = event.results[0][0].transcript;
                console.log("Speech recognition captured:", text);
                setMessage(text);
            };
            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Error:', event.error);
            };

            recognition.onend = () => {
                console.log('Recognition ended');
            };

            recognitionRef.current = recognition;
            } else {
                console.warn('Speech Recognition API is not supported in this browser.');
            }
        }
    }, []);

    const startRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
        } else {
            console.warn('Speech Recognition is not available.');
        }
    };

    const handleSend = () => {
        if (message.trim() !== "") {
            onSendMessage(message);
            setMessage(""); // Clear input after sending
        }
    };

  return (
    <div className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg">
      <textarea
        className="flex-1 resize-none p-2 text-white bg-neutral-700 rounded-lg focus:outline-none"
        rows={2}
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <button onClick={startRecognition} className="bg-purple-600 hover:bg-purple-800 text-white font-bold p-2 rounded-full">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z" fill="currentColor"/>
        <path d="M19 11C19 14.3137 16.3137 17 13 17H11C7.68629 17 5 14.3137 5 11H7C7 13.2091 8.79086 15 11 15H13C15.2091 15 17 13.2091 17 11H19Z" fill="currentColor"/>
        <path d="M12 22V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 22H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      </button>
      <button
        className="bg-purple-600 hover:bg-purple-800 text-white font-bold p-2 rounded-full"
        onClick={handleSend}
        disabled={message.trim() === ""}
      >
        {hintLoading ?
            <LoadingDots />
        :
            <svg width="18" height="18" viewBox="0 0 170 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M73.5 180C73.5 186.351 78.6487 191.5 85 191.5C91.3513 191.5 96.5 186.351 96.5 180L73.5 180ZM93.1317 3.86827C88.6407 -0.622757 81.3593 -0.622757 76.8683 3.86827L3.68272 77.0538C-0.808312 81.5449 -0.808312 88.8263 3.68272 93.3173C8.17375 97.8083 15.4551 97.8083 19.9462 93.3173L85 28.2635L150.054 93.3173C154.545 97.8083 161.826 97.8083 166.317 93.3173C170.808 88.8262 170.808 81.5448 166.317 77.0538L93.1317 3.86827ZM85 180L96.5 180L96.5 20L85 20L73.5 20L73.5 180L85 180Z" fill="white"/>
            </svg>
        }
      </button>
    </div>
  );
}
