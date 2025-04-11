// Slackエクスポートデータ処理用ユーティリティ
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const readDirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const AdmZip = require('adm-zip');

/**
 * ZIPファイルを解凍してSlackデータを抽出
 * @param {string} zipPath ZIPファイルのパス
 * @param {string} extractPath 解凍先パス
 * @returns {Promise<string>} 解凍されたディレクトリパス
 */
async function extractZipFile(zipPath, extractPath) {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
      resolve(extractPath);
    } catch (err) {
      reject(new Error(`ZIPファイルの解凍に失敗しました: ${err.message}`));
    }
  });
}

/**
 * ディレクトリからSlackメッセージを再帰的に収集
 * @param {string} dirPath ディレクトリパス
 * @returns {Promise<Array>} Slackメッセージの配列
 */
async function collectSlackMessages(dirPath) {
  const messages = [];
  const files = await readDirAsync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await statAsync(filePath);
    
    if (stats.isDirectory()) {
      // サブディレクトリを再帰的に処理
      const subDirMessages = await collectSlackMessages(filePath);
      messages.push(...subDirMessages);
    } else if (file.endsWith('.json') && file !== 'users.json' && file !== 'channels.json') {
      // JSONファイルを読み込み、メッセージを取得
      try {
        const content = await readFileAsync(filePath, 'utf-8');
        const jsonData = JSON.parse(content);
        
        // 有効なSlackメッセージファイルかチェック
        if (Array.isArray(jsonData)) {
          // チャンネル情報を追加
          const channelName = path.basename(path.dirname(filePath));
          const messagesWithChannel = jsonData.map(msg => ({
            ...msg,
            channel: channelName
          }));
          
          messages.push(...messagesWithChannel);
        }
      } catch (err) {
        console.error(`ファイル読み込みエラー (${filePath}): ${err.message}`);
      }
    }
  }
  
  return messages;
}

/**
 * ユーザー情報を取得
 * @param {string} dirPath Slackエクスポートディレクトリ
 * @returns {Promise<Object>} ユーザーID→ユーザー情報のマップ
 */
async function getUserInfo(dirPath) {
  try {
    const userFiles = await findFiles(dirPath, 'users.json');
    if (userFiles.length === 0) {
      return {};
    }
    
    const content = await readFileAsync(userFiles[0], 'utf-8');
    const users = JSON.parse(content);
    
    // ユーザーIDをキーとするマップを作成
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });
    
    return userMap;
  } catch (err) {
    console.error(`ユーザー情報取得エラー: ${err.message}`);
    return {};
  }
}

/**
 * 特定のファイル名を持つファイルをディレクトリから検索
 * @param {string} dirPath 検索するディレクトリパス
 * @param {string} fileName 検索するファイル名
 * @returns {Promise<Array>} 見つかったファイルパスの配列
 */
async function findFiles(dirPath, fileName) {
  const result = [];
  const files = await readDirAsync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await statAsync(filePath);
    
    if (stats.isDirectory()) {
      const subResults = await findFiles(filePath, fileName);
      result.push(...subResults);
    } else if (file === fileName) {
      result.push(filePath);
    }
  }
  
  return result;
}

/**
 * Slackエクスポートデータを処理して統合
 * @param {string} inputPath 入力ファイル/ディレクトリパス
 * @returns {Promise<Object>} 統合されたSlackデータ
 */
async function processSlackData(inputPath) {
  try {
    let targetDir = inputPath;
    
    // 入力がZIPファイルの場合、一時ディレクトリに解凍
    if (inputPath.toLowerCase().endsWith('.zip')) {
      const tempDir = path.join(path.dirname(inputPath), 'temp_slack_export_' + Date.now());
      targetDir = await extractZipFile(inputPath, tempDir);
    }
    
    // ユーザー情報を取得
    const userMap = await getUserInfo(targetDir);
    
    // メッセージを収集
    const messages = await collectSlackMessages(targetDir);
    
    // メッセージをタイムスタンプでソート
    messages.sort((a, b) => {
      return parseFloat(a.ts) - parseFloat(b.ts);
    });
    
    // ユーザー情報をメッセージに追加
    const enrichedMessages = messages.map(msg => {
      if (msg.user && userMap[msg.user]) {
        return {
          ...msg,
          username: userMap[msg.user].name,
          real_name: userMap[msg.user].real_name || userMap[msg.user].name
        };
      }
      return msg;
    });
    
    return {
      messages: enrichedMessages,
      users: Object.values(userMap),
      total_messages: enrichedMessages.length,
      processed_at: new Date().toISOString()
    };
  } catch (err) {
    throw new Error(`Slackデータ処理エラー: ${err.message}`);
  }
}

module.exports = {
  processSlackData
}; 