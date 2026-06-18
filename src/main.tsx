import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { installCrashTracker } from './services/crashTracker'
import './index.css'

installCrashTracker()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
