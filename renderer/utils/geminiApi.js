// Google Gemini API呼び出し用ユーティリティ
const axios = require('axios');

// Gemini APIのベースURL
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent';

/**
 * Gemini APIを使用してSlackデータを分析
 * @param {Object} slackData 統合されたSlackデータ
 * @param {string} prompt 分析のためのプロンプト
 * @param {string} apiKey Google Gemini API Key
 * @returns {Promise<string>} 分析結果
 */
async function analyzeWithGemini(slackData, prompt, apiKey) {
  if (!apiKey) {
    throw new Error('Gemini APIキーが設定されていません。設定画面でAPIキーを設定してください。');
  }

  // 分析対象のデータを準備
  // メッセージ数が多すぎる場合は代表的なメッセージのみを抽出
  const MAX_MESSAGES = 100; // 最大メッセージ数を制限
  let targetMessages = slackData.messages;
  
  if (targetMessages.length > MAX_MESSAGES) {
    // 均等に間引いたメッセージを選択
    const step = Math.floor(targetMessages.length / MAX_MESSAGES);
    targetMessages = targetMessages.filter((_, index) => index % step === 0).slice(0, MAX_MESSAGES);
  }
  
  // 分析用のデータを作成
  const analysisData = {
    total_messages: slackData.total_messages,
    analyzed_messages: targetMessages.length,
    users: slackData.users.length,
    messages: targetMessages.map(msg => ({
      user: msg.username || msg.user,
      text: msg.text,
      channel: msg.channel,
      timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
    }))
  };

  try {
    // Gemini APIリクエスト用のペイロードを構築
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `${prompt}\n\nSlackデータ:\n${JSON.stringify(analysisData, null, 2)}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    // Gemini APIを呼び出し
    const response = await axios.post(
      `${GEMINI_API_BASE_URL}?key=${apiKey}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // レスポンスから生成されたテキストを抽出
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts) {
      return response.data.candidates[0].content.parts
        .map(part => part.text || '')
        .join('\n');
    } else {
      throw new Error('Gemini APIからの応答を解析できませんでした');
    }
  } catch (error) {
    if (error.response) {
      // APIからのエラーレスポンス
      throw new Error(`Gemini API エラー (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない
      throw new Error('Gemini APIからの応答がありませんでした。インターネット接続を確認してください。');
    } else {
      // その他のエラー
      throw error;
    }
  }
}

module.exports = {
  analyzeWithGemini
}; 