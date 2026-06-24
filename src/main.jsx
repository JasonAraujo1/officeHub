import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import logoUrl from './assets/logo.png'

// Define a logo como ícone da aba do navegador (favicon) e ícone iOS.
function setIcon(rel, type) {
  let link = document.querySelector(`link[rel="${rel}"]`)
  if (!link) { link = document.createElement('link'); link.rel = rel; document.head.appendChild(link) }
  if (type) link.type = type
  link.href = logoUrl
}
setIcon('icon', 'image/png')
setIcon('apple-touch-icon')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
