import React, { useState } from "react";
import { IoIosSend } from "react-icons/io";

interface InputContainerProps {
  onSendMessage: (message: string) => void;
}

const InputContainer: React.FC<InputContainerProps> = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center mx-auto">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your message here"
        className="flex-1 bg-[#2a3041] text-white rounded-md py-3 px-4 focus:outline-none"
      />

      <button
        type="submit"
        className="p-2 ml-2 text-gray-400 hover:text-white"
        disabled={!inputText.trim()}
      >
        <IoIosSend className="h-6 w-6" />
      </button>
    </form>
  );
};

export default InputContainer;
