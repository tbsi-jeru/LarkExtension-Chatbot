import './Message.css';

const Message = ({ type, message, timestamp }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${type === 'bot' ? 'bot-message' : 'user-message'}`}>
      <div className="message-content">
        <div className="message-text" style={{ whiteSpace: 'pre-line' }}>{message}</div>
        <div className="message-time">{formatTime(timestamp)}</div>
      </div>
    </div>
  );
};

export default Message;
