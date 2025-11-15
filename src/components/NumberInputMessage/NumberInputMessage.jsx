import NumberInput from '../NumberInput/NumberInput';
import './NumberInputMessage.css';

const NumberInputMessage = ({ onNumberSubmit, min, max, placeholder, message, defaultValue }) => {
  return (
    <div className="number-input-message-container">
      <div className="number-input-message">
        <p className="number-input-message-text">
          {message || "Please enter a number:"}
        </p>
        <NumberInput 
          onNumberSubmit={onNumberSubmit} 
          min={min}
          max={max}
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
      </div>
    </div>
  );
};

export default NumberInputMessage;
