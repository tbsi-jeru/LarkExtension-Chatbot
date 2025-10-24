import { ThemeProvider } from './ThemeContext';
import Chatbot from './Chatbot'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <h1>Lark Extension Chatbot</h1>
        <Chatbot />
      </div>
    </ThemeProvider>
  )
}

export default App
