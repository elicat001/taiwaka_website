package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"time"

	"taiwaka-coffee/internal/config"
	"taiwaka-coffee/pkg/response"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Logger 请求日志中间件
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// 处理请求
		c.Next()

		// 计算延迟
		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		log.Printf("[%d] %s %s %s %v",
			statusCode,
			method,
			path,
			clientIP,
			latency,
		)
	}
}

// Recovery 恢复中间件
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[Recovery] panic recovered: %v", err)
				response.InternalError(c, "Internal server error")
				c.Abort()
			}
		}()
		c.Next()
	}
}

// CORS 跨域配置中间件
func CORS() gin.HandlerFunc {
	config := cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",      // Vite 开发服务器
			"http://localhost:3000",      // 本地开发
			"http://localhost:80",        // Docker 本地
			"http://localhost",           // Docker 本地 (无端口)
			"https://taiwaka.coffee",     // 生产域名
			"https://www.taiwaka.coffee", // 生产域名 (www)
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "X-API-Key"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	return cors.New(config)
}

// RateLimiter 简单的速率限制器 (基于内存)
type RateLimiter struct {
	requests map[string][]time.Time
	limit    int
	window   time.Duration
}

// NewRateLimiter 创建速率限制器
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

// Limit 速率限制中间件
func (rl *RateLimiter) Limit() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		now := time.Now()

		// 清理过期请求
		if times, exists := rl.requests[clientIP]; exists {
			var validTimes []time.Time
			for _, t := range times {
				if now.Sub(t) < rl.window {
					validTimes = append(validTimes, t)
				}
			}
			rl.requests[clientIP] = validTimes
		}

		// 检查限制
		if len(rl.requests[clientIP]) >= rl.limit {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Rate limit exceeded",
			})
			c.Abort()
			return
		}

		// 记录请求
		rl.requests[clientIP] = append(rl.requests[clientIP], now)
		c.Next()
	}
}

// SecureHeaders 安全头部中间件
func SecureHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Next()
	}
}

// RequestID 请求ID中间件
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		c.Set("RequestID", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

// generateRequestID 生成简单的请求ID
func generateRequestID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

// randomString 生成加密安全的随机字符串
func randomString(n int) string {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		// 回退到时间戳方案（不推荐但作为备用）
		const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		for i := range bytes {
			bytes[i] = letters[time.Now().UnixNano()%int64(len(letters))]
		}
		return string(bytes)
	}
	return hex.EncodeToString(bytes)[:n]
}

// APIKeyAuth API Key 认证中间件
// 用于保护管理端点，需要在请求头中携带 X-API-Key
func APIKeyAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		cfg := config.AppConfig

		// 如果未配置 AdminAPIKey，在开发环境跳过认证
		if cfg.AdminAPIKey == "" {
			if cfg.Env == "development" {
				log.Println("[Warning] ADMIN_API_KEY not configured, skipping auth in development mode")
				c.Next()
				return
			}
			// 生产环境必须配置
			response.InternalError(c, "API key authentication not configured")
			c.Abort()
			return
		}

		// 从请求头获取 API Key
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			// 也支持 Authorization: Bearer <key> 格式
			authHeader := c.GetHeader("Authorization")
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				apiKey = authHeader[7:]
			}
		}

		if apiKey == "" {
			response.Unauthorized(c, "API key is required")
			c.Abort()
			return
		}

		// 验证 API Key (使用常量时间比较防止时序攻击)
		if !secureCompare(apiKey, cfg.AdminAPIKey) {
			response.Forbidden(c, "Invalid API key")
			c.Abort()
			return
		}

		c.Next()
	}
}

// secureCompare 常量时间字符串比较，防止时序攻击
func secureCompare(a, b string) bool {
	if len(a) != len(b) {
		return false
	}
	var result byte
	for i := 0; i < len(a); i++ {
		result |= a[i] ^ b[i]
	}
	return result == 0
}
