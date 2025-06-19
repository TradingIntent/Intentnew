import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // This is okay for demonstration purposes in a client-side app. For production, consider a backend proxy.
});

export const openaiService = {
  async analyzeTradingBehavior(tradeLogsSummary: string): Promise<string> {
    try {
      const prompt = `You are a highly skilled trading behavior analyst with expertise in quantitative analysis and market dynamics. Based on the user's detailed logged trades, provide a comprehensive trading thesis. Your analysis should include:

1.  **Statistical Overview:** Calculate and present key metrics such as:
    *   Overall Win Rate (based on "Hit TP" vs. "SL" outcomes)
    *   Average Profit per winning trade
    *   Average Loss per losing trade
    *   Average Position Size
    *   Average Confidence Level

2.  **Ticker-Specific Analysis:**
    *   Identify the most frequently traded tickers.
    *   Analyze performance (win rate, average P&L) per ticker.
    *   Point out any patterns or correlations with specific assets (e.g., higher confidence on certain tokens, better outcomes).

3.  **Trade Pattern Identification:**
    *   Describe common entry and exit strategies based on entry/exit market caps.
    *   Analyze the relationship between confidence levels and trade outcomes/P&L.
    *   Identify consistent behaviors across trades (e.g., always setting TP, holding times).

4.  **Strengths and Weaknesses:**
    *   Clearly outline the user's top strengths as a trader, supported by data.
    *   Identify areas for improvement and potential weaknesses based on statistical anomalies or consistent patterns.

5.  **Personalized Suggestions for Improvement:**
    *   Offer actionable, data-driven advice to refine their trading strategy.
    *   Suggest specific areas to focus on for better consistency or profitability.

Here are the user's detailed trade logs. Each line represents one trade:
${tradeLogsSummary}

Provide your detailed, analytical thesis and summary, ensuring all insights are backed by the provided data. Present the information clearly and concisely, focusing on statistical correlations and actionable conclusions.`;

      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o',
      });

      return chatCompletion.choices[0].message.content || 'No analysis available.';
    } catch (error) {
      console.error('Error getting OpenAI analysis:', error);
      throw new Error('Failed to get AI analysis. Please check your API key and try again.');
    }
  },
}; 