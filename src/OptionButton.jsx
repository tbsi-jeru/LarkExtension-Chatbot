import './OptionButton.css';

const OptionButton = ({ text, onClick }) => {
  return (
    <button className="option-button" onClick={onClick}>
      {text}
    </button>
  );
};

export default OptionButton;
