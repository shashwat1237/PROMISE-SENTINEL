import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// [AUDIT FIX] Disabled StrictMode to prevent Double-Effect Jitter in Force Graph
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)