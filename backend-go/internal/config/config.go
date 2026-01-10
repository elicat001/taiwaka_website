package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config 应用配置结构
type Config struct {
	// 服务器配置
	Port string
	Env  string

	// 数据库配置
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// Google Gemini API
	GeminiAPIKey string
}

var AppConfig *Config

// Load 加载配置
func Load() *Config {
	// 尝试加载 .env 文件
	if err := godotenv.Load("../.env"); err != nil {
		// 如果在 backend-go 目录运行，尝试父目录
		_ = godotenv.Load("../../.env")
	}

	AppConfig = &Config{
		Port:         getEnv("PORT", "3000"),
		Env:          getEnv("NODE_ENV", "development"),
		DBHost:       getEnv("DB_HOST", "localhost"),
		DBPort:       getEnv("DB_PORT", "3306"),
		DBUser:       getEnv("DB_USER", "root"),
		DBPassword:   getEnv("DB_PASSWORD", ""),
		DBName:       getEnv("DB_NAME", "taiwaka_coffee"),
		GeminiAPIKey: getEnv("GEMINI_API_KEY", ""),
	}

	log.Printf("[Config] Loaded configuration for %s environment", AppConfig.Env)
	return AppConfig
}

// getEnv 获取环境变量，带默认值
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// GetDSN 获取数据库连接字符串
func (c *Config) GetDSN() string {
	return c.DBUser + ":" + c.DBPassword + "@tcp(" + c.DBHost + ":" + c.DBPort + ")/" + c.DBName + "?charset=utf8mb4&parseTime=True&loc=Local"
}
