// =============================================
// main.jsx - React Application Entry Point
// =============================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// ReactDOM.createRoot() finds the <div id="root"> in index.html
// and mounts our entire React app inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter enables URL-based navigation */}
    <BrowserRouter>
      {/* Our main App component with all providers */}
      <App />

      {/* Global Toast Notification System */}
      {/* This renders toasts anywhere in the app */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            borderRadius: '12px',
            border: '1px solid #334155',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          },
          // Success toast styling
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
            style: {
              background: '#064E3B',
              border: '1px solid #10B981',
              color: '#D1FAE5',
            },
          },
          // Error toast styling
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
            style: {
              background: '#7F1D1D',
              border: '1px solid #EF4444',
              color: '#FEE2E2',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)