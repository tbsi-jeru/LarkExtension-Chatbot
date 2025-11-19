import './TypingIndicator.css';

const TypingIndicator = ({ message = "DeeDee is thinking..." }) => {
  return (
    <div className="typing-indicator-container">
      <div className="typing-indicator-content">
        <div className="typing-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        {message && <span className="typing-message">{message}</span>}
      </div>
    </div>
  );
};

export default TypingIndicator;
