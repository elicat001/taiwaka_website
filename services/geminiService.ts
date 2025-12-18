
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCoffeeRecommendation(preference: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `用户偏好: "${preference}"。作为太哇卡 (Taiwaka) 的风味导师，请根据我们对非洲火山风土、原生豆种及处理法的深厚研究，为用户推荐一款咖啡。
      背景参考：太哇卡源自斯瓦希里语，寓意“鹰的敏锐狩猎”。
      核心理念：好咖啡，你我轻松拥有。
      请使用敏锐、专业且富有穿透力的文字，解释风味背后的产地故事，100字以内。`,
      config: {
        systemInstruction: "你是太哇卡咖啡的风味专家。你拥有如鹰般的敏锐洞察力，专注于非洲优质咖啡豆的探寻。你的回答应体现对产地、豆种和原始处理法的尊重，同时保持简洁易懂。",
      }
    });
    return response.text || "寻觅卓越。我为您推荐源自埃塞俄比亚原产地的『山雾拼配』，它如鹰般精准捕捉了高海拔柑橘的清冽与花香。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "让咖啡回归本质。我们的『太哇卡甄选』正等待您的品鉴。";
  }
}
