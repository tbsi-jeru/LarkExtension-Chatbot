import { ThemeProvider } from './context/ThemeContext';
import Chatbot from './components/Chatbot/Chatbot'
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Chatbot />
      </div>
    </ThemeProvider>
  )
}

export default App
