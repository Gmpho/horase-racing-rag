import React, { useState } from 'react';

const ChatBot = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In the future, this will send the message to the backend RAG pipeline
    setResponse('This is a placeholder response.');
    setMessage('');
  };

  return (
    <div>
      <h2>Chat with the AI</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your question..."
        />
        <button type="submit">Send</button>
      </form>
      <p>Response: {response}</p>
    </div>
  );
};

export default ChatBot;