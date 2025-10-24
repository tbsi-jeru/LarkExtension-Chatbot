import { useState, useEffect, useRef } from 'react';
import { chatbotScript, getScriptById } from './chatbotScript';
import Message from './Message';
import OptionButton from './OptionButton';
import ThemeToggle from './ThemeToggle';
import './Chatbot.css';

const Chatbot = () => {
  const [currentScriptId, setCurrentScriptId] = useState('start');
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const handleOptionClick = (option) => {
    // Add current message and user's choice to history
    const currentScript = getScriptById(currentScriptId);
    const newHistory = [
      ...conversationHistory,
      {
        type: 'bot',
        message: currentScript.message,
        timestamp: new Date()
      },
      {
        type: 'user',
        message: option.text,
        timestamp: new Date()
      }
    ];

    setConversationHistory(newHistory);
    setCurrentScriptId(option.nextId);
  };

  const resetConversation = () => {
    setCurrentScriptId('start');
    setConversationHistory([]);
  };

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, currentScriptId]);

  const currentScript = getScriptById(currentScriptId);

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>DeeDee Assistant</h2>
        <div className="header-controls">
          <ThemeToggle />
          <button onClick={resetConversation} className="reset-button">
            Start Over
          </button>
        </div>
      </div>
      
      <div className="chatbot-messages">
        {conversationHistory.map((entry, index) => (
          <Message
            key={index}
            type={entry.type}
            message={entry.message}
            timestamp={entry.timestamp}
          />
        ))}
        
        {/* Current bot message */}
        <Message
          type="bot"
          message={currentScript.message}
          timestamp={new Date()}
        />
        
        {/* Options displayed inside chat */}
        <div className="chatbot-options-inline">
          {currentScript.options.map((option, index) => (
            <OptionButton
              key={index}
              text={option.text}
              onClick={() => handleOptionClick(option)}
            />
          ))}
        </div>
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Chatbot;
