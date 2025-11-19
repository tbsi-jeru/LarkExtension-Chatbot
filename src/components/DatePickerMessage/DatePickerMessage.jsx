import DatePicker from '../DatePicker/DatePicker';
import './DatePickerMessage.css';

const DatePickerMessage = ({ onDateSelect }) => {
  return (
    <div className="datepicker-message-container">
      <div className="datepicker-message">
        <p className="datepicker-message-text">
          When do you plan to release the new designs?
        </p>
        <DatePicker onDateSelect={onDateSelect} />
      </div>
    </div>
  );
};

export default DatePickerMessage;
