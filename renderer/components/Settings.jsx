import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // コンポーネントがマウントされたときにAPIキーを取得
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        const savedKey = await window.electronAPI.getApiKey();
        setApiKey(savedKey);
        setIsLoading(false);
      } catch (err) {
        setMessage('APIキーの取得に失敗しました: ' + err.message);
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  // APIキーを保存
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage('APIキーを入力してください');
      return;
    }
    
    try {
      setIsLoading(true);
      await window.electronAPI.saveApiKey(apiKey);
      setMessage('APIキーが正常に保存されました');
      setIsLoading(false);
      
      // 成功メッセージを3秒後に消す
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('APIキーの保存に失敗しました: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>アプリケーション設定</h2>

      <div className="settings-card">
        <div className="settings-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <h3>Google Gemini API Key</h3>
        </div>
        
        <p className="settings-description">
          Slack分析機能を使用するにはGoogle Gemini APIのキーが必要です。
          <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="external-link">
            Google AIスタジオ
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
          でAPIキーを取得できます。
        </p>

        <div className="input-group">
          <div className="input-wrapper">
            <label htmlFor="api-key">APIキー</label>
            <input
              type="password"
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini APIキーを入力"
              className="api-key-input"
            />
          </div>
          
          <button 
            className="save-button"
            onClick={handleSaveApiKey} 
            disabled={isLoading || !apiKey.trim()}
          >
            {isLoading ? (
              <span className="loading-icon"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            )}
            保存
          </button>
        </div>

        {message && (
          <div className={`message-container ${message.includes('失敗') ? 'error-message' : 'success-message'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {message.includes('失敗') 
                ? <><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></>
                : <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></>
              }
            </svg>
            <p>{message}</p>
          </div>
        )}
        
        <div className="security-note">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <p>APIキーはローカルにのみ保存され、サーバーには送信されません。</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 