import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './components/Home';
import Settings from './components/Settings';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Slack Export Analyzer</h1>
          <nav className="app-nav">
            <button 
              className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              ホーム
            </button>
            <button 
              className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentPage('settings')}
            >
              設定
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="content-container">
          {currentPage === 'home' ? <Home /> : <Settings />}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Slack Export Analyzer © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

// Reactアプリケーションのレンダリング
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />); 