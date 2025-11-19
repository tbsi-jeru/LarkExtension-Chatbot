import { useState, useEffect } from 'react';
import './ScrollToBottom.css';

const ScrollToBottom = ({ messagesContainerRef, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Show button if user has scrolled up more than 200px from bottom
      setIsVisible(distanceFromBottom > 200);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messagesContainerRef]);

  if (!isVisible) return null;

  return (
    <button className="scroll-to-bottom" onClick={onClick} aria-label="Scroll to bottom">
      <span className="scroll-arrow">↓</span>
      <span className="scroll-text">Scroll to bottom</span>
    </button>
  );
};

export default ScrollToBottom;
