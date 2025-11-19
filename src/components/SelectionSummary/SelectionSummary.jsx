import './SelectionSummary.css';

const SelectionSummary = ({ currentSelection, isVisible, onToggle }) => {
  const selections = [
    { label: 'Brand', value: currentSelection.brand },
    { label: 'Category', value: currentSelection.category },
    { label: 'Department', value: currentSelection.department },
    { label: 'Sub-Dept', value: currentSelection.subDepartment },
    { label: 'Date', value: currentSelection.date },
    { label: 'Designs', value: currentSelection.numBaseDesigns },
    { label: 'Variations', value: currentSelection.numVariationsPerBase }
  ].filter(item => item.value); // Only show selections that have values

  if (selections.length === 0) return null;

  return (
    <div className="selection-summary-wrapper">
      {isVisible && (
        <div className="selection-summary">
          <div className="selection-summary-compact">
            {selections.map((item, index) => (
              <span key={index} className="selection-chip">
                <span className="chip-label">{item.label}:</span>
                <span className="chip-value">{item.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <button 
        className="summary-toggle-btn" 
        onClick={onToggle}
        aria-label={isVisible ? 'Hide selections' : 'Show selections'}
      >
        {isVisible ? '▼' : '▲'}
      </button>
    </div>
  );
};

export default SelectionSummary;
