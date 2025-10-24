import { useTheme } from './ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className={`toggle-slider ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="toggle-icon">
          {isDarkMode ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;

