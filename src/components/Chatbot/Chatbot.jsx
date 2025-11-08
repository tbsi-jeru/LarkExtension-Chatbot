import { useState, useEffect, useRef } from 'react';
import { chatbotScript, getScriptById, initializeMaintenanceData } from './chatbotScript';
import Message from './../Message/Message';
import OptionButton from './../OptionButton/OptionButton';
import ThemeToggle from './../ThemeToggle/ThemeToggle';
import './Chatbot.css';

const Chatbot = () => {
  const [currentScriptId, setCurrentScriptId] = useState('start');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSelection, setCurrentSelection] = useState({
    brand: null,
    category: null,
    department: null,
    subDepartment: null
  });
  const messagesEndRef = useRef(null);

  const handleOptionClick = (option) => {
    // Update selection based on the curren t script ID
    const updateSelection = () => {
      if (currentScriptId === 'start') {
        setCurrentSelection(prev => ({ ...prev, brand: option.text }));
      } else if (currentScriptId.startsWith('category_')) {
        setCurrentSelection(prev => ({ ...prev, category: option.text }));
      } else if (currentScriptId.startsWith('department_')) {
        setCurrentSelection(prev => ({ ...prev, department: option.text }));
      } else if (currentScriptId.startsWith('subdepartment_')) {
        setCurrentSelection(prev => ({ ...prev, subDepartment: option.text }));
      }
    };

    // Don't update selection if it's a "Back" option
    if (!option.text.startsWith('Back')) {
      updateSelection();
    }

    // Add current message and user's choice to history
    const currentScript = getScriptById(currentScriptId);
    const newHistory = [
      ...conversationHistory,
      {
        type: 'bot',
        message: typeof currentScript.message === 'function' 
          ? currentScript.message(currentSelection) 
          : currentScript.message,
        timestamp: new Date()
      },
      {
        type: 'user',
        message: option.text,
        timestamp: new Date()
      }
    ];

    setConversationHistory(newHistory);
    const nextId = typeof option.nextId === 'function' ? option.nextId(currentSelection) : option.nextId;
    setCurrentScriptId(nextId);
  };

  const resetConversation = () => {
    setCurrentScriptId('start');
    setConversationHistory([]);
    setCurrentSelection({
      brand: null,
      category: null,
      department: null,
      subDepartment: null
    });
  };

  // Initialize maintenance data when component mounts
  useEffect(() => {
    const initialize = async () => {
      await initializeMaintenanceData();
      setIsInitialized(true);
    };
    initialize();
  }, []);

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
            Clear
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
          message={typeof currentScript.message === 'function' ? currentScript.message(currentSelection) : currentScript.message}
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
