import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Precisamos do BrowserRouter englobando o App pra as rotas do vite funcionarem normal */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)