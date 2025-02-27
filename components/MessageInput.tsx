import { useState } from "react";

type MessageInputProps = {
  onSendMessage: (message: string) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};

export default function MessageInput({ onSendMessage, message, setMessage }: MessageInputProps) {

  const handleSend = () => {
    if (message.trim() !== "") {
      onSendMessage(message);
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
      <textarea
        className="flex-1 resize-none p-2 text-white bg-gray-700 rounded-lg focus:outline-none"
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
      <button
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        onClick={handleSend}
        disabled={message.trim() === ""}
      >
        Send
      </button>
    </div>
  );
}
