import DatePicker from '../DatePicker/DatePicker';
import './DatePickerMessage.css';

const DatePickerMessage = ({ onDateSelect }) => {
  return (
    <div className="datepicker-message-container">
      <div className="datepicker-message">
        <p className="datepicker-message-text">
          Please select a date for your maintenance schedule:
        </p>
        <DatePicker onDateSelect={onDateSelect} />
      </div>
    </div>
  );
};

export default DatePickerMessage;
