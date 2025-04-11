import React, { useState } from 'react';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ファイル選択ダイアログを開く
  const handleFileSelect = async () => {
    try {
      const filePath = await window.electronAPI.openFileDialog();
      if (filePath) {
        setSelectedFile(filePath);
        setProcessedData(null);
        setAnalysisResult('');
        setError('');
      }
    } catch (err) {
      setError('ファイル選択エラー: ' + err.message);
    }
  };

  // Slackデータの統合処理を実行
  const handleProcessData = async () => {
    if (!selectedFile) {
      setError('ファイルを選択してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await window.electronAPI.processSlackData(selectedFile);
      setProcessedData(result);
      setIsLoading(false);
    } catch (err) {
      setError('データ処理エラー: ' + err.message);
      setIsLoading(false);
    }
  };

  // Gemini APIで分析を実行
  const handleAnalyzeData = async () => {
    if (!processedData) {
      setError('先にデータ統合を実行してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 簡単なプロンプト例（実際の要件に合わせて調整）
      const prompt = 'このSlackデータから重要な会話やトピックを要約してください。';
      const result = await window.electronAPI.analyzeWithGemini(processedData, prompt);
      setAnalysisResult(result);
      setIsLoading(false);
    } catch (err) {
      setError('分析エラー: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h2>Slackデータの統合と分析</h2>
      
      <div className="step-container">
        <div className="step-number">1</div>
        <div className="step-content">
          <h3>ファイル選択</h3>
          <p className="step-description">
            分析するSlackエクスポートファイル（ZIP）または解凍済みディレクトリを選択してください。
          </p>
          <div className="file-selection">
            <button className="primary-button" onClick={handleFileSelect}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              ファイルを選択
            </button>
            {selectedFile && (
              <div className="selected-file">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span>{selectedFile}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="step-container">
        <div className="step-number">2</div>
        <div className="step-content">
          <h3>データ統合</h3>
          <p className="step-description">
            Slackのエクスポートデータを統合し、分析しやすい形式に変換します。
          </p>
          <button 
            className={`action-button ${processedData ? 'success-button' : ''}`} 
            onClick={handleProcessData} 
            disabled={!selectedFile || isLoading}
          >
            {processedData ? 
              <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> 統合完了</> : 
              '統合処理を実行'
            }
          </button>
        </div>
      </div>

      <div className="step-container">
        <div className="step-number">3</div>
        <div className="step-content">
          <h3>Gemini分析</h3>
          <p className="step-description">
            Google Gemini APIを使用してSlackデータを分析します。
          </p>
          <button 
            className="action-button"
            onClick={handleAnalyzeData} 
            disabled={!processedData || isLoading}
          >
            Gemini分析を実行
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>処理中...</p>
        </div>
      )}
      
      {error && <div className="error-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p className="error">{error}</p>
      </div>}
      
      {analysisResult && (
        <div className="result-section">
          <h3>分析結果</h3>
          <div className="analysis-result">
            <pre>{analysisResult}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 