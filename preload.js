const { contextBridge, ipcRenderer } = require('electron');

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld('electronAPI', {
  // ファイル選択ダイアログを開く
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  
  // API Key関連
  saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  
  // Slackデータ処理（実際の処理はメインプロセスで行います）
  processSlackData: (filePath) => ipcRenderer.invoke('process-slack-data', filePath),
  
  // Gemini API呼び出し
  analyzeWithGemini: (data, prompt) => ipcRenderer.invoke('analyze-with-gemini', data, prompt)
}); 