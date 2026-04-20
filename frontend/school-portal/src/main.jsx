import '@lumiqos/shared-frontend/theme.css';
import '@lumiqos/shared-frontend/fonts.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@lumiqos/shared-frontend/theme.css'
import '@lumiqos/shared-frontend/fonts.css'
import './i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
