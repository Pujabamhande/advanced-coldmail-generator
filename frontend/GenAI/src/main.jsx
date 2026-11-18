 import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

try {
    document.body.dataset.theme = localStorage.getItem('mailgen-theme') === 'light' ? 'light' : 'dark';
} catch {
    document.body.dataset.theme = 'dark';
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)
