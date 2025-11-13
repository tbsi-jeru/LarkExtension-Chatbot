import './OptionButton.css';

const OptionButton = ({ text, onClick, disabled = false }) => {
  return (
    <button className="option-button" onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};

export default OptionButton;
