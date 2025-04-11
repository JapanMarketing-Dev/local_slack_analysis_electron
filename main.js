const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// ユーティリティモジュールを読み込み
const { processSlackData } = require('./renderer/utils/fileProcessor');
const { analyzeWithGemini } = require('./renderer/utils/geminiApi');

// アプリケーションのメインウィンドウを保持する変数
let mainWindow;

// メインウィンドウを作成する関数
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#f8f9fa',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: false,
    show: false
  });

  // HTML ファイルを読み込む（file:// プロトコル）
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'renderer', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // ウィンドウが読み込まれてから表示する（スプラッシュ効果）
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 開発ツールを開く
  mainWindow.webContents.openDevTools();

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electronの初期化が完了したらウィンドウを作成
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOSでは、ドックアイコンをクリックしたときにウィンドウがなければ再作成
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// すべてのウィンドウが閉じられたらアプリケーションを終了（Windows & Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ファイル選択ダイアログを開く
ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory'],
    filters: [
      { name: 'Slack Export', extensions: ['zip'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!canceled) {
    return filePaths[0];
  }
  return null;
});

// API Keyの保存
ipcMain.handle('save-api-key', (event, key) => {
  // 本番環境では暗号化することが望ましいが、要件に従いシンプルに保存
  const configPath = path.join(app.getPath('userData'), 'config.json');
  fs.writeFileSync(configPath, JSON.stringify({ apiKey: key }));
  return true;
});

// API Keyの取得
ipcMain.handle('get-api-key', () => {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.apiKey || '';
  }
  return '';
});

// Slackデータの処理
ipcMain.handle('process-slack-data', async (event, filePath) => {
  try {
    // Slackデータを処理
    const processedData = await processSlackData(filePath);
    
    // 処理結果をJSONファイルとして保存
    const outputDir = path.join(app.getPath('userData'), 'processed_data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `slack_data_${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));
    
    // 処理結果を返す
    return processedData;
  } catch (err) {
    console.error('Slackデータ処理エラー:', err);
    throw err;
  }
});

// Gemini APIによる分析
ipcMain.handle('analyze-with-gemini', async (event, data, prompt) => {
  try {
    // APIキーを取得
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('APIキーが設定されていません');
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const apiKey = config.apiKey;
    
    if (!apiKey) {
      throw new Error('APIキーが設定されていません');
    }
    
    // Gemini APIで分析
    const result = await analyzeWithGemini(data, prompt, apiKey);
    
    // 分析結果をファイルに保存
    const outputDir = path.join(app.getPath('userData'), 'analysis_results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `analysis_${Date.now()}.txt`);
    fs.writeFileSync(outputPath, result);
    
    return result;
  } catch (err) {
    console.error('Gemini分析エラー:', err);
    throw err;
  }
}); 