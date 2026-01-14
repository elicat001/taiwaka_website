package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"taiwaka-coffee/internal/config"
	"taiwaka-coffee/internal/database"
	"taiwaka-coffee/internal/handlers"
	"taiwaka-coffee/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 连接数据库
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("[Fatal] Failed to connect to database: %v", err)
	}
	defer database.Close()

	// 设置 Gin 模式
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 创建 Gin 引擎
	r := gin.New()

	// 应用全局中间件
	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.SecureHeaders())
	r.Use(middleware.RequestID())

	// 静态文件服务 (用于前端资源)
	r.Static("/assets", "../dist/assets")
	r.StaticFile("/", "../dist/index.html")
	r.StaticFile("/favicon.ico", "../dist/favicon.ico")

	// 创建处理器
	productHandler := handlers.NewProductHandler()
	cartHandler := handlers.NewCartHandler()
	orderHandler := handlers.NewOrderHandler()
	customerHandler := handlers.NewCustomerHandler()
	stockHandler := handlers.NewStockHandler()
	aiHandler := handlers.NewAIHandler()

	// API 路由组
	api := r.Group("/api")
	{
		// 健康检查 (公开)
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "healthy",
				"service": "taiwaka-coffee-api",
				"version": "2.0.0",
			})
		})

		// ============ 公开路由 (无需认证) ============

		// 产品查询 (公开)
		api.GET("/products", productHandler.GetProducts)
		api.GET("/products/featured", productHandler.GetFeaturedProducts)
		api.GET("/products/category/:category", productHandler.GetProductsByCategory)
		api.GET("/products/:id", productHandler.GetProduct)

		// 购物车 (公开 - 基于 sessionId)
		cart := api.Group("/cart")
		{
			cart.GET("", cartHandler.GetCart)
			cart.GET("/count", cartHandler.GetCartCount)
			cart.POST("", cartHandler.AddToCart)
			cart.PUT("/:id", cartHandler.UpdateCartItem)
			cart.DELETE("/:id", cartHandler.RemoveFromCart)
			cart.DELETE("", cartHandler.ClearCart)
		}

		// 订单创建和查询 (公开 - 客户自助)
		api.POST("/orders", orderHandler.CreateOrder)
		api.GET("/orders/by-email", orderHandler.GetOrdersByEmail)
		api.GET("/orders/number/:orderNumber", orderHandler.GetOrderByNumber)

		// AI 推荐 (公开)
		ai := api.Group("/ai")
		{
			ai.POST("/recommend", aiHandler.GetCoffeeRecommendation)
			ai.GET("/health", aiHandler.HealthCheck)
		}

		// ============ 受保护路由 (需要 API Key 认证) ============

		// 产品管理 (需认证)
		adminProducts := api.Group("/products")
		adminProducts.Use(middleware.APIKeyAuth())
		{
			adminProducts.POST("", productHandler.CreateProduct)
			adminProducts.PUT("/:id", productHandler.UpdateProduct)
			adminProducts.DELETE("/:id", productHandler.DeleteProduct)
		}

		// 订单管理 (需认证)
		adminOrders := api.Group("/orders")
		adminOrders.Use(middleware.APIKeyAuth())
		{
			adminOrders.GET("", orderHandler.GetOrders)
			adminOrders.GET("/:id", orderHandler.GetOrder)
			adminOrders.PUT("/:id/status", orderHandler.UpdateOrderStatus)
			adminOrders.POST("/:id/cancel", orderHandler.CancelOrder)
		}

		// 客户管理 (需认证)
		customers := api.Group("/customers")
		customers.Use(middleware.APIKeyAuth())
		{
			customers.GET("", customerHandler.GetCustomers)
			customers.GET("/by-email", customerHandler.GetCustomerByEmail)
			customers.GET("/:id", customerHandler.GetCustomer)
			customers.GET("/:id/orders", customerHandler.GetCustomerOrders)
			customers.POST("", customerHandler.CreateCustomer)
			customers.PUT("/:id", customerHandler.UpdateCustomer)
			customers.DELETE("/:id", customerHandler.DeleteCustomer)
		}

		// 库存管理 (需认证)
		stock := api.Group("/stock")
		stock.Use(middleware.APIKeyAuth())
		{
			stock.GET("/logs", stockHandler.GetStockLogs)
			stock.GET("/logs/product/:productId", stockHandler.GetProductStockLogs)
			stock.GET("/low", stockHandler.GetLowStockProducts)
			stock.GET("/summary", stockHandler.GetStockSummary)
			stock.POST("/adjust", stockHandler.AdjustStock)
		}

		// 仪表盘统计 (需认证)
		api.GET("/stats/dashboard", middleware.APIKeyAuth(), orderHandler.GetDashboardStats)
	}

	// 处理前端路由 (SPA)
	r.NoRoute(func(c *gin.Context) {
		c.File("../dist/index.html")
	})

	// 优雅关闭
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit
		log.Println("[Server] Shutting down gracefully...")
		database.Close()
		os.Exit(0)
	}()

	// 启动服务器
	addr := ":" + cfg.Port
	log.Printf("[Server] Starting Taiwaka Coffee API on %s", addr)
	log.Printf("[Server] Environment: %s", cfg.Env)
	if cfg.AdminAPIKey != "" {
		log.Println("[Server] Admin API authentication: ENABLED")
	} else {
		log.Println("[Server] Admin API authentication: DISABLED (development mode)")
	}

	if err := r.Run(addr); err != nil {
		log.Fatalf("[Fatal] Failed to start server: %v", err)
	}
}
