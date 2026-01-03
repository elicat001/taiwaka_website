
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCoffeeRecommendation(preference: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `用户需求: "${preference}"。作为太哇卡 (Taiwaka) 的首席咖啡猎寻专家，请用一种冷静、极简、充满品牌高级感的方式回复。
      
      要求：
      1. 体现产地风土 (Terroir) 的精准性。
      2. 语气类似高端生活杂志的专栏。
      3. 必须推荐一个风味方向（如：清冽花香、火山深邃巧克力、热带浆果气息）。
      4. 字数控制在 80 字以内。
      
      品牌背景：太哇卡，猎寻于火山之巅，极致纯净。`,
      config: {
        systemInstruction: "你不再是 AI 助手，而是 Taiwaka Specialty Coffee 的品牌风味顾问。你的表达应该是感性且专业的，能够瞬间勾勒出咖啡在舌尖的画面感。避免使用过于生硬的销售用语。",
      }
    });
    return response.text || "寻觅卓越。我们为您推荐源自火山土壤的高海拔豆种，那是大自然最精准的馈赠。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "回归咖啡的本质。每一颗太哇卡豆子都承载着产地的灵魂，正等待您的品鉴。";
  }
}
