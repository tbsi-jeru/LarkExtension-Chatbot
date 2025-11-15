import { useState, useEffect } from 'react';
import './DesignTabs.css';

const DesignTabs = ({ designs, onEditImage, onImageChange }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInstructions, setEditInstructions] = useState('');

  // Reset carousel when switching tabs ONLY
  useEffect(() => {
    setCurrentCarouselIndex(0);
    setIsEditMode(false);
    setEditInstructions('');
    // Notify parent of the first image in the new tab
    if (designs[activeTabIndex]?.variations?.length > 0 && onImageChange) {
      onImageChange(
        designs[activeTabIndex].variations[0].url,
        { baseDesignIndex: activeTabIndex, variationIndex: 0 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex]); // Only depend on activeTabIndex

  // Notify parent when component mounts with first image
  useEffect(() => {
    if (designs.length > 0 && designs[0].variations?.length > 0 && onImageChange) {
      onImageChange(
        designs[0].variations[0].url,
        { baseDesignIndex: 0, variationIndex: 0 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  if (!designs || designs.length === 0) {
    return null;
  }

  const currentDesign = designs[activeTabIndex];
  const variations = currentDesign?.variations || [];

  const goToNextVariation = () => {
    setCurrentCarouselIndex((prev) => {
      const nextIndex = (prev + 1) % variations.length;
      console.log('Next variation:', { prev, nextIndex, totalVariations: variations.length });
      if (onImageChange && variations[nextIndex]) {
        onImageChange(
          variations[nextIndex].url,
          { baseDesignIndex: activeTabIndex, variationIndex: nextIndex }
        );
      }
      return nextIndex;
    });
  };

  const goToPreviousVariation = () => {
    setCurrentCarouselIndex((prev) => {
      const prevIndex = (prev - 1 + variations.length) % variations.length;
      console.log('Previous variation:', { prev, prevIndex, totalVariations: variations.length });
      if (onImageChange && variations[prevIndex]) {
        onImageChange(
          variations[prevIndex].url,
          { baseDesignIndex: activeTabIndex, variationIndex: prevIndex }
        );
      }
      return prevIndex;
    });
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditInstructions('');
  };

  const handleSubmitEdit = () => {
    if (editInstructions.trim() && onEditImage) {
      const globalIndex = designs
        .slice(0, activeTabIndex)
        .reduce((sum, design) => sum + design.variations.length, 0) + currentCarouselIndex;
      
      onEditImage({
        imageUrl: variations[currentCarouselIndex].url,
        imageIndex: globalIndex,
        variation: variations[currentCarouselIndex].variation || currentCarouselIndex + 1,
        instructions: editInstructions.trim()
      });
      setIsEditMode(false);
      setEditInstructions('');
    }
  };

  return (
    <div className="design-tabs-container">
      {/* Tabs Header */}
      <div className="design-tabs-header">
        {designs.map((design, index) => (
          <button
            key={index}
            className={`design-tab ${activeTabIndex === index ? 'active' : ''}`}
            onClick={() => setActiveTabIndex(index)}
          >
            Design {index + 1}
            {/* <span className="variation-count">({design.variations?.length || 0} variations)</span> */}
          </button>
        ))}
      </div>

      {/* Tab Content - Carousel */}
      <div className="design-tab-content" key={activeTabIndex}>
        {variations.length > 0 ? (
          <div className="design-carousel">
            <div className="carousel-image-wrapper">
              <img 
                key={`${activeTabIndex}-${currentCarouselIndex}`}
                src={variations[currentCarouselIndex].url} 
                alt={`Base Design ${activeTabIndex + 1} - Variation ${currentCarouselIndex + 1}`}
                className="carousel-main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image failed to load</text></svg>';
                }}
              />
              
              {/* Navigation arrows */}
              {variations.length > 1 && (
                <>
                  <button 
                    className="carousel-nav carousel-nav-prev" 
                    onClick={goToPreviousVariation}
                    aria-label="Previous variation"
                  >
                    ‹
                  </button>
                  <button 
                    className="carousel-nav carousel-nav-next" 
                    onClick={goToNextVariation}
                    aria-label="Next variation"
                  >
                    ›
                  </button>
                  
                  {/* Variation counter */}
                  <div className="carousel-counter">
                    Variation {currentCarouselIndex + 1} / {variations.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Edit controls */}
            {onEditImage && !isEditMode && (
              <div className="carousel-actions">
                <button 
                  className="carousel-action-button carousel-edit-button"
                  onClick={handleEditClick}
                >
                  ✏️ Edit Design
                </button>
              </div>
            )}
            
            {/* Edit instructions input */}
            {isEditMode && (
              <div className="carousel-edit-container">
                <label className="carousel-edit-label">
                  Enter editing instructions for Base {activeTabIndex + 1}, Variation {variations[currentCarouselIndex].variation || currentCarouselIndex + 1}:
                </label>
                <textarea
                  className="carousel-edit-input"
                  placeholder="E.g., Make it brighter, change the background to blue, add more contrast..."
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  autoFocus
                  rows={3}
                />
                <div className="carousel-edit-buttons">
                  <button 
                    className="carousel-edit-cancel"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button 
                    className="carousel-edit-submit"
                    onClick={handleSubmitEdit}
                    disabled={!editInstructions.trim()}
                  >
                    Submit Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-variations">No variations available for this design</div>
        )}
      </div>
    </div>
  );
};

export default DesignTabs;
