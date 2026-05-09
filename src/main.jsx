import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Set HTML lang on load for correct Hindi font rendering
document.documentElement.lang = localStorage.getItem('shilpmitra_lang') || 'en';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
