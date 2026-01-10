package handlers

import (
	"strconv"

	"taiwaka-coffee/internal/database"
	"taiwaka-coffee/internal/models"
	"taiwaka-coffee/pkg/response"

	"github.com/gin-gonic/gin"
)

// StockHandler 库存处理器
type StockHandler struct{}

// NewStockHandler 创建库存处理器
func NewStockHandler() *StockHandler {
	return &StockHandler{}
}

// GetStockLogs 获取库存变动记录
func (h *StockHandler) GetStockLogs(c *gin.Context) {
	var params models.StockLogSearchParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	params.SetDefaults()

	db := database.GetDB()
	query := db.Model(&models.StockLog{})

	// 过滤
	if params.ProductID != 0 {
		query = query.Where("productId = ?", params.ProductID)
	}
	if params.Reason != "" {
		query = query.Where("reason = ?", params.Reason)
	}
	if params.StartDate != "" {
		query = query.Where("createdAt >= ?", params.StartDate)
	}
	if params.EndDate != "" {
		query = query.Where("createdAt <= ?", params.EndDate+" 23:59:59")
	}

	// 计算总数
	var total int64
	query.Count(&total)

	// 排序
	query = query.Order("createdAt DESC")

	// 分页
	offset := (params.Page - 1) * params.Limit
	var logs []models.StockLog
	if err := query.Preload("Product").Offset(offset).Limit(params.Limit).Find(&logs).Error; err != nil {
		response.InternalError(c, "Failed to fetch stock logs")
		return
	}

	response.Paginated(c, logs, params.Page, params.Limit, total)
}

// GetProductStockLogs 获取特定产品的库存记录
func (h *StockHandler) GetProductStockLogs(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("productId"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid product ID")
		return
	}

	var logs []models.StockLog
	if err := database.GetDB().
		Where("productId = ?", productID).
		Order("createdAt DESC").
		Limit(100).
		Find(&logs).Error; err != nil {
		response.InternalError(c, "Failed to fetch stock logs")
		return
	}

	response.Success(c, logs)
}

// AdjustStock 调整库存
func (h *StockHandler) AdjustStock(c *gin.Context) {
	var input models.StockAdjustmentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	db := database.GetDB()

	// 开始事务
	tx := db.Begin()

	// 获取产品
	var product models.Product
	if err := tx.First(&product, input.ProductID).Error; err != nil {
		tx.Rollback()
		response.NotFound(c, "Product not found")
		return
	}

	// 计算新库存
	newStock := product.Stock + input.ChangeAmount
	if newStock < 0 {
		tx.Rollback()
		response.BadRequest(c, "Resulting stock cannot be negative")
		return
	}

	// 更新库存
	if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
		tx.Rollback()
		response.InternalError(c, "Failed to update stock")
		return
	}

	// 记录变动
	stockLog := models.StockLog{
		ProductID:     input.ProductID,
		ChangeAmount:  input.ChangeAmount,
		Reason:        input.Reason,
		ReferenceID:   input.ReferenceID,
		PreviousStock: product.Stock,
		NewStock:      newStock,
	}

	if err := tx.Create(&stockLog).Error; err != nil {
		tx.Rollback()
		response.InternalError(c, "Failed to log stock change")
		return
	}

	if err := tx.Commit().Error; err != nil {
		response.InternalError(c, "Failed to commit transaction")
		return
	}

	response.Success(c, gin.H{
		"product":       product.Name,
		"previousStock": product.Stock,
		"changeAmount":  input.ChangeAmount,
		"newStock":      newStock,
		"reason":        input.Reason,
	})
}

// GetLowStockProducts 获取低库存产品
func (h *StockHandler) GetLowStockProducts(c *gin.Context) {
	threshold := 10 // 默认阈值
	if t := c.Query("threshold"); t != "" {
		if parsed, err := strconv.Atoi(t); err == nil {
			threshold = parsed
		}
	}

	var products []models.Product
	if err := database.GetDB().
		Where("isActive = ? AND stock < ?", 1, threshold).
		Order("stock ASC").
		Find(&products).Error; err != nil {
		response.InternalError(c, "Failed to fetch low stock products")
		return
	}

	response.Success(c, products)
}

// GetStockSummary 获取库存汇总
func (h *StockHandler) GetStockSummary(c *gin.Context) {
	db := database.GetDB()

	var summary struct {
		TotalProducts    int64   `json:"totalProducts"`
		TotalStock       int64   `json:"totalStock"`
		LowStockCount    int64   `json:"lowStockCount"`
		OutOfStockCount  int64   `json:"outOfStockCount"`
		TotalStockValue  float64 `json:"totalStockValue"`
	}

	// 总产品数
	db.Model(&models.Product{}).Where("isActive = ?", 1).Count(&summary.TotalProducts)

	// 总库存数量
	db.Model(&models.Product{}).Where("isActive = ?", 1).Select("COALESCE(SUM(stock), 0)").Scan(&summary.TotalStock)

	// 低库存产品数 (< 10)
	db.Model(&models.Product{}).Where("isActive = ? AND stock < ? AND stock > 0", 1, 10).Count(&summary.LowStockCount)

	// 缺货产品数
	db.Model(&models.Product{}).Where("isActive = ? AND stock = 0", 1).Count(&summary.OutOfStockCount)

	// 总库存价值
	db.Model(&models.Product{}).Where("isActive = ?", 1).Select("COALESCE(SUM(price * stock), 0)").Scan(&summary.TotalStockValue)

	response.Success(c, summary)
}
