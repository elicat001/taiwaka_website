// AI 咖啡推荐服务 - 通过后端 API 调用，避免 API Key 暴露

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3000'
  : '';

export async function getCoffeeRecommendation(preference: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/api/ai/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preference }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data?.recommendation) {
      return data.data.recommendation;
    }

    return data.data?.recommendation ||
           "寻觅卓越。我们为您推荐源自火山土壤的高海拔豆种，那是大自然最精准的馈赠。";
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return "回归咖啡的本质。每一颗太哇卡豆子都承载着产地的灵魂，正等待您的品鉴。";
  }
}
