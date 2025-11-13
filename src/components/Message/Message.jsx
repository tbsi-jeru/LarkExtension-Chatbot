import { useState, useEffect } from 'react';
import DesignTabs from '../DesignTabs/DesignTabs';
import './Message.css';

const Message = ({ type, message, timestamp, imageUrl, imageUrls, imageMetadata, designs, onEditImage, onImageChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInstructions, setEditInstructions] = useState('');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Convert single imageUrl to array or use imageUrls
  const images = imageUrls || (imageUrl ? [imageUrl] : []);

  // Notify parent of initial image when component mounts with imageUrls (not designs)
  useEffect(() => {
    if (imageUrls && imageUrls.length > 0 && onImageChange && !designs) {
      onImageChange(imageUrls[0], null); // No design context for flat carousel
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openModal = (index = 0) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditInstructions('');
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
      onEditImage({
        imageUrl: images[currentCarouselIndex],
        imageIndex: currentCarouselIndex,
        variation: imageMetadata?.[currentCarouselIndex]?.variation || currentCarouselIndex + 1,
        instructions: editInstructions.trim()
      });
      setIsEditMode(false);
      setEditInstructions('');
    }
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNextCarousel = () => {
    setCurrentCarouselIndex((prev) => {
      const nextIndex = (prev + 1) % images.length;
      // Notify parent of image change
      if (onImageChange && images[nextIndex]) {
        onImageChange(images[nextIndex], null); // No design context for flat carousel
      }
      return nextIndex;
    });
  };

  const goToPreviousCarousel = () => {
    setCurrentCarouselIndex((prev) => {
      const prevIndex = (prev - 1 + images.length) % images.length;
      // Notify parent of image change
      if (onImageChange && images[prevIndex]) {
        onImageChange(images[prevIndex], null); // No design context for flat carousel
      }
      return prevIndex;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      goToNextImage();
    } else if (e.key === 'ArrowLeft') {
      goToPreviousImage();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };

  return (
    <>
      <div className={`message ${type === 'bot' ? 'bot-message' : 'user-message'}`}>
        <div className="message-content">
          {/* Use DesignTabs if designs structure is available */}
          {designs && designs.length > 0 ? (
            <DesignTabs 
              designs={designs}
              onEditImage={onEditImage}
              onImageChange={onImageChange}
            />
          ) : images.length > 0 ? (
            <div className="message-images-container-large">
              {/* Carousel for multiple images */}
              <div className="message-carousel">
                <div className="carousel-image-wrapper">
                  <img 
                    src={images[currentCarouselIndex]} 
                    alt={`Design variation ${currentCarouselIndex + 1}`} 
                    className="carousel-main-image"
                    onClick={() => openModal(currentCarouselIndex)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image failed to load</text></svg>';
                    }}
                  />
                  
                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button 
                        className="carousel-nav carousel-nav-prev" 
                        onClick={goToPreviousCarousel}
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                      <button 
                        className="carousel-nav carousel-nav-next" 
                        onClick={goToNextCarousel}
                        aria-label="Next image"
                      >
                        ›
                      </button>
                      
                      {/* Image counter */}
                      <div className="carousel-counter">
                        {imageMetadata?.[currentCarouselIndex]?.variation || currentCarouselIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Edit and View buttons */}
                <div className="carousel-actions">
                  <button 
                    className="carousel-action-button carousel-view-button"
                    onClick={() => openModal(currentCarouselIndex)}
                  >
                    🔍 View Full Size
                  </button>
                  {onEditImage && (
                    <button 
                      className="carousel-action-button carousel-edit-button"
                      onClick={handleEditClick}
                    >
                      ✏️ Edit Design
                    </button>
                  )}
                </div>
                
                {/* Edit instructions input */}
                {isEditMode && (
                  <div className="carousel-edit-container">
                    <label className="carousel-edit-label">
                      Enter editing instructions for Variation {imageMetadata?.[currentCarouselIndex]?.variation || currentCarouselIndex + 1}:
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
                
                <div className="image-hint">Click image or "View Full Size" for modal gallery</div>
              </div>
            </div>
          ) : null}
          <div className="message-text" style={{ whiteSpace: 'pre-line' }}>{message}</div>
          <div className="message-time">{formatTime(timestamp)}</div>
        </div>
      </div>

      {/* Image Modal/Gallery */}
      {isModalOpen && images.length > 0 && (
        <div className="image-modal" onClick={closeModal} onKeyDown={handleKeyDown} tabIndex={0}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeModal}>
              × 
            </button>
            
            {/* Navigation arrows for multiple images */}
            {images.length > 1 && (
              <>
                <button 
                  className="image-modal-nav image-modal-prev" 
                  onClick={goToPreviousImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button 
                  className="image-modal-nav image-modal-next" 
                  onClick={goToNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <img 
              src={images[selectedImageIndex]} 
              alt={`Generated design ${selectedImageIndex + 1} - Full size`} 
              className="image-modal-img"
            />
            
            {/* Image counter */}
            {images.length > 1 && (
              <div className="image-modal-counter">
                {imageMetadata?.[selectedImageIndex]?.variation || selectedImageIndex + 1} / {images.length}
              </div>
            )}
            
            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="image-modal-thumbnails">
                {images.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail ${index === selectedImageIndex ? 'thumbnail-active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}

            <div className="image-modal-actions">
              {!isEditMode ? (
                <>
                  {onEditImage && (
                    <button 
                      className="image-modal-button image-modal-button-edit"
                      onClick={handleEditClick}
                    >
                      ✏️ Edit This Design
                    </button>
                  )}
                  <a 
                    href={images[selectedImageIndex]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="image-modal-button"
                  >
                    Open in New Tab
                  </a>
                  <a 
                    href={images[selectedImageIndex]} 
                    download={`generated-design-${selectedImageIndex + 1}.png`}
                    className="image-modal-button"
                  >
                    Download
                  </a>
                  {images.length > 1 && (
                    <button 
                      className="image-modal-button"
                      onClick={() => {
                        images.forEach((url, idx) => {
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `generated-design-${idx + 1}.png`;
                          link.click();
                        });
                      }}
                    >
                      Download All
                    </button>
                  )}
                </>
              ) : (
                <div className="edit-instructions-container">
                  <label htmlFor="edit-instructions" className="edit-instructions-label">
                    Enter your editing instructions:
                  </label>
                  <textarea
                    id="edit-instructions"
                    className="edit-instructions-input"
                    placeholder="E.g., Make it brighter, change the background to blue, add more contrast..."
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    autoFocus
                    rows={4}
                  />
                  <div className="edit-instructions-buttons">
                    <button 
                      className="image-modal-button edit-cancel-button"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                    <button 
                      className="image-modal-button edit-submit-button"
                      onClick={handleSubmitEdit}
                      disabled={!editInstructions.trim()}
                    >
                      Submit Edit Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;