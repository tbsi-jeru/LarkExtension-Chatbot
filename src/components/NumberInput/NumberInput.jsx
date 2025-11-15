import { useState } from 'react';
import './NumberInput.css';

const NumberInput = ({ onNumberSubmit, min = 1, max = 10, placeholder = "Enter a number...", defaultValue = 3 }) => {
  const [value, setValue] = useState(defaultValue.toString());
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setValue(inputValue);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const number = parseInt(value);
    
    // Validation
    if (!value || value.trim() === '') {
      setError('Please enter a number');
      return;
    }
    
    if (isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (number < min) {
      setError(`Number must be at least ${min}`);
      return;
    }
    
    if (number > max) {
      setError(`Number must be at most ${max}`);
      return;
    }
    
    // Valid number, submit it
    onNumberSubmit(number);
    setValue('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="number-input-container">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="number"
          className="number-input-field"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          min={min}
          max={max}
          autoFocus
        />
        {error && <div className="number-input-error">{error}</div>}
        <button type="submit" className="number-input-submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default NumberInput;
