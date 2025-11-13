// src/components/DatePicker/DatePicker.jsx
import { useState } from 'react';
import './DatePicker.css';

const DatePicker = ({ onDateSelect, minDate = null, maxDate = null }) => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
    }
  };

  // Format date for input min/max attributes
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const today = formatDate(new Date());

  return (
    <div className="datepicker-container">
      <div className="datepicker-wrapper">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={minDate || today}
          max={maxDate || ''}
          className="datepicker-input"
          placeholder="Select a date"
        />
      </div>
      <button 
        onClick={handleSubmit} 
        disabled={!selectedDate}
        className="datepicker-submit"
      >
        Confirm Date
      </button>
    </div>
  );
};

export default DatePicker;