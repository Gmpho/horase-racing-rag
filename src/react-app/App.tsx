import React from 'react';
import './App.css';
import Header from './components/Header';
import RaceResults from './components/RaceResults';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <RaceResults />
        <ChatBot />
      </main>
    </div>
  );
}

export default App;
