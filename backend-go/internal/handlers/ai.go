package handlers

import (
	"context"
	"fmt"
	"strings"
	"time"

	"taiwaka-coffee/internal/config"
	"taiwaka-coffee/internal/database"
	"taiwaka-coffee/internal/models"
	"taiwaka-coffee/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// AIHandler AI 处理器
type AIHandler struct {
	apiKey string
}

// NewAIHandler 创建 AI 处理器
func NewAIHandler() *AIHandler {
	return &AIHandler{
		apiKey: config.AppConfig.GeminiAPIKey,
	}
}

// RecommendationRequest 推荐请求
type RecommendationRequest struct {
	Preferences string `json:"preferences" binding:"required"`
	Mood        string `json:"mood"`
	Time        string `json:"time"` // morning, afternoon, evening
}

// GetCoffeeRecommendation 获取咖啡推荐
func (h *AIHandler) GetCoffeeRecommendation(c *gin.Context) {
	var req RecommendationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	if h.apiKey == "" {
		response.InternalError(c, "AI service not configured")
		return
	}

	// 获取可用产品
	var products []models.Product
	if err := database.GetDB().
		Where("isActive = ? AND stock > 0 AND category = ?", 1, "coffee").
		Find(&products).Error; err != nil {
		response.InternalError(c, "Failed to fetch products")
		return
	}

	if len(products) == 0 {
		response.Success(c, gin.H{
			"recommendation": "抱歉，目前没有可推荐的咖啡产品。",
			"products":       []models.Product{},
		})
		return
	}

	// 构建产品描述
	var productDescriptions []string
	for _, p := range products {
		desc := fmt.Sprintf("- %s (¥%.2f): %s",
			p.Name, p.Price, getProductDescription(&p))
		productDescriptions = append(productDescriptions, desc)
	}

	// 构建提示词
	prompt := buildRecommendationPrompt(req, productDescriptions)

	// 调用 Gemini API
	recommendation, err := h.callGeminiAPI(prompt)
	if err != nil {
		// 降级处理：返回默认推荐
		response.Success(c, gin.H{
			"recommendation": getDefaultRecommendation(products, req),
			"products":       products[:min(3, len(products))],
			"aiGenerated":    false,
		})
		return
	}

	// 解析推荐结果，找出推荐的产品
	recommendedProducts := findRecommendedProducts(recommendation, products)

	response.Success(c, gin.H{
		"recommendation": recommendation,
		"products":       recommendedProducts,
		"aiGenerated":    true,
	})
}

// callGeminiAPI 调用 Gemini API
func (h *AIHandler) callGeminiAPI(prompt string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(h.apiKey))
	if err != nil {
		return "", err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	model.SetTemperature(0.7)
	model.SetMaxOutputTokens(500)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("empty response from AI")
	}

	// 提取文本内容
	var result strings.Builder
	for _, part := range resp.Candidates[0].Content.Parts {
		if text, ok := part.(genai.Text); ok {
			result.WriteString(string(text))
		}
	}

	return result.String(), nil
}

// buildRecommendationPrompt 构建推荐提示词
func buildRecommendationPrompt(req RecommendationRequest, products []string) string {
	prompt := fmt.Sprintf(`你是一位专业的咖啡师，请根据顾客的偏好为他们推荐最适合的咖啡。

顾客偏好：%s`, req.Preferences)

	if req.Mood != "" {
		prompt += fmt.Sprintf("\n当前心情：%s", req.Mood)
	}
	if req.Time != "" {
		timeMap := map[string]string{
			"morning":   "早晨",
			"afternoon": "下午",
			"evening":   "傍晚",
		}
		prompt += fmt.Sprintf("\n饮用时间：%s", timeMap[req.Time])
	}

	prompt += fmt.Sprintf(`

我们目前提供以下咖啡：
%s

请用简短的中文（2-3句话）推荐1-2款最适合的咖啡，并说明原因。
推荐时请使用产品的确切名称。`, strings.Join(products, "\n"))

	return prompt
}

// getProductDescription 获取产品描述
func getProductDescription(p *models.Product) string {
	if p.Description != nil && *p.Description != "" {
		return *p.Description
	}

	// 从规格中生成描述
	if p.Specifications != nil {
		var parts []string
		if origin, ok := p.Specifications["origin"].(string); ok {
			parts = append(parts, "产地："+origin)
		}
		if roast, ok := p.Specifications["roastLevel"].(string); ok {
			parts = append(parts, "烘焙度："+roast)
		}
		if flavor, ok := p.Specifications["flavor"].(string); ok {
			parts = append(parts, "风味："+flavor)
		}
		if len(parts) > 0 {
			return strings.Join(parts, "，")
		}
	}

	return "精选咖啡"
}

// getDefaultRecommendation 获取默认推荐
func getDefaultRecommendation(products []models.Product, req RecommendationRequest) string {
	if len(products) == 0 {
		return "抱歉，目前没有可推荐的咖啡。"
	}

	// 简单的基于关键词的推荐
	preferences := strings.ToLower(req.Preferences)

	for _, p := range products {
		name := strings.ToLower(p.Name)
		desc := ""
		if p.Description != nil {
			desc = strings.ToLower(*p.Description)
		}

		// 检查偏好是否匹配
		if strings.Contains(preferences, "浓") && (strings.Contains(name, "特浓") || strings.Contains(desc, "浓郁")) {
			return fmt.Sprintf("根据您喜欢浓郁口感的偏好，推荐您尝试「%s」。", p.Name)
		}
		if strings.Contains(preferences, "果") && (strings.Contains(name, "果") || strings.Contains(desc, "果香")) {
			return fmt.Sprintf("根据您喜欢果香的偏好，推荐您尝试「%s」。", p.Name)
		}
		if strings.Contains(preferences, "花") && strings.Contains(desc, "花香") {
			return fmt.Sprintf("根据您喜欢花香的偏好，推荐您尝试「%s」。", p.Name)
		}
	}

	// 默认推荐第一个产品
	return fmt.Sprintf("为您推荐我们的招牌咖啡「%s」，这是一款广受好评的经典之选。", products[0].Name)
}

// findRecommendedProducts 从推荐文本中找出推荐的产品
func findRecommendedProducts(recommendation string, products []models.Product) []models.Product {
	var recommended []models.Product
	recLower := strings.ToLower(recommendation)

	for _, p := range products {
		if strings.Contains(recLower, strings.ToLower(p.Name)) {
			recommended = append(recommended, p)
		}
	}

	// 如果没找到，返回前3个产品
	if len(recommended) == 0 {
		return products[:min(3, len(products))]
	}

	return recommended
}

// min 返回两个整数中较小的一个
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// HealthCheck AI 服务健康检查
func (h *AIHandler) HealthCheck(c *gin.Context) {
	if h.apiKey == "" {
		response.Success(c, gin.H{
			"status":    "degraded",
			"message":   "AI service not configured",
			"available": false,
		})
		return
	}

	response.Success(c, gin.H{
		"status":    "healthy",
		"message":   "AI service is available",
		"available": true,
	})
}
