import { useState, useEffect } from 'react';
import './VariationSelectionModal.css';

const VariationSelectionModal = ({ isOpen, onClose, onSubmit, variations, addedToLarkImages }) => {
  // Canonicalize URL to compare against stored Set keys
  const canonicalUrl = (url) => {
    try {
      const u = new URL(url);
      return `${u.origin}${u.pathname}`;
    } catch (e) {
      return url;
    }
  };
  const [selectedVariations, setSelectedVariations] = useState(new Set());

  // Initialize with all non-uploaded variations selected
  useEffect(() => {
    if (isOpen && variations) {
      const availableVariations = variations
        .map((v, idx) => idx)
        .filter(idx => !addedToLarkImages.has(canonicalUrl(variations[idx].url)));
      setSelectedVariations(new Set(availableVariations));
    }
  }, [isOpen, variations, addedToLarkImages]);

  if (!isOpen) return null;

  const toggleVariation = (index) => {
    // Don't allow toggling already uploaded images
    if (addedToLarkImages.has(canonicalUrl(variations[index].url))) {
      return;
    }

    setSelectedVariations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedVariations.size === availableCount) {
      // Deselect all
      setSelectedVariations(new Set());
    } else {
      // Select all available (non-uploaded)
      const allAvailable = variations
        .map((v, idx) => idx)
        .filter(idx => !addedToLarkImages.has(canonicalUrl(variations[idx].url)));
      setSelectedVariations(new Set(allAvailable));
    }
  };

  const handleSubmit = () => {
    const selectedVars = Array.from(selectedVariations).map(idx => variations[idx]);
    onSubmit(selectedVars);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const availableCount = variations.filter(v => !addedToLarkImages.has(v.url)).length;
  const uploadedCount = variations.length - availableCount;

  return (
    <div className="variation-modal-overlay" onClick={handleOverlayClick}>
      <div className="variation-modal">
        <div className="variation-modal-header">
          <h2 className="variation-modal-title">Select Variations to Add to Lark</h2>
          <button className="variation-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="variation-modal-controls">
          <label className="variation-modal-select-all">
            <input
              type="checkbox"
              checked={selectedVariations.size === availableCount && availableCount > 0}
              onChange={toggleSelectAll}
              disabled={availableCount === 0}
            />
            <span>Select All Available</span>
          </label>
          <div className="variation-modal-selected-count">
            {selectedVariations.size} of {availableCount} selected
            {uploadedCount > 0 && ` (${uploadedCount} already uploaded)`}
          </div>
        </div>

        <div className="variation-modal-grid">
          {variations.map((variation, index) => {
            const isAlreadyUploaded = addedToLarkImages.has(canonicalUrl(variation.url));
            const isSelected = selectedVariations.has(index);

            return (
              <div
                key={index}
                className={`variation-item ${isSelected ? 'selected' : ''} ${isAlreadyUploaded ? 'already-uploaded' : ''}`}
                onClick={() => toggleVariation(index)}
              >
                <input
                  type="checkbox"
                  className="variation-item-checkbox"
                  checked={isSelected}
                  disabled={isAlreadyUploaded}
                  onChange={() => toggleVariation(index)}
                  onClick={(e) => e.stopPropagation()}
                />
                {isAlreadyUploaded && (
                  <div className="variation-item-uploaded-badge">✓ Uploaded</div>
                )}
                <img
                  src={variation.url}
                  alt={`Variation ${variation.variationNumber || index + 1}`}
                  className="variation-item-image"
                />
                <div className="variation-item-info">
                  <span className="variation-item-label">
                    Base {variation.baseDesign || 'N/A'} - Var {variation.variationNumber || index + 1}
                  </span>
                  {variation.dominantColor && (
                    <div className="variation-item-details">
                      Color: {variation.dominantColor}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="variation-modal-footer">
          <button
            className="variation-modal-button variation-modal-button-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="variation-modal-button variation-modal-button-submit"
            onClick={handleSubmit}
            disabled={selectedVariations.size === 0}
          >
            Add {selectedVariations.size} to Lark
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariationSelectionModal;
