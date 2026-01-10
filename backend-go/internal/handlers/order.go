package handlers

import (
	"fmt"
	"strconv"
	"time"

	"taiwaka-coffee/internal/database"
	"taiwaka-coffee/internal/models"
	"taiwaka-coffee/pkg/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// OrderHandler 订单处理器
type OrderHandler struct{}

// NewOrderHandler 创建订单处理器
func NewOrderHandler() *OrderHandler {
	return &OrderHandler{}
}

// GetOrders 获取订单列表
func (h *OrderHandler) GetOrders(c *gin.Context) {
	var params models.OrderSearchParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	params.SetDefaults()

	db := database.GetDB()
	query := db.Model(&models.Order{})

	// 过滤
	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}
	if params.CustomerEmail != "" {
		query = query.Where("customerEmail = ?", params.CustomerEmail)
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
	orderClause := params.SortBy + " " + params.SortOrder
	query = query.Order(orderClause)

	// 分页
	offset := (params.Page - 1) * params.Limit
	var orders []models.Order
	if err := query.Preload("Items").Offset(offset).Limit(params.Limit).Find(&orders).Error; err != nil {
		response.InternalError(c, "Failed to fetch orders")
		return
	}

	response.Paginated(c, orders, params.Page, params.Limit, total)
}

// GetOrder 获取单个订单
func (h *OrderHandler) GetOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid order ID")
		return
	}

	var order models.Order
	if err := database.GetDB().Preload("Items").First(&order, id).Error; err != nil {
		response.NotFound(c, "Order not found")
		return
	}

	response.Success(c, order)
}

// GetOrderByNumber 通过订单号获取订单
func (h *OrderHandler) GetOrderByNumber(c *gin.Context) {
	orderNumber := c.Param("orderNumber")

	var order models.Order
	if err := database.GetDB().Preload("Items").
		Where("orderNumber = ?", orderNumber).
		First(&order).Error; err != nil {
		response.NotFound(c, "Order not found")
		return
	}

	response.Success(c, order)
}

// CreateOrder 创建订单 (带事务)
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var input models.OrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	db := database.GetDB()

	// 开始事务
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. 验证所有产品并计算总价
	var totalPrice float64
	var orderItems []models.OrderItem
	productIDs := make([]uint, len(input.Items))

	for i, item := range input.Items {
		productIDs[i] = item.ProductID
	}

	var products []models.Product
	if err := tx.Where("id IN ?", productIDs).Find(&products).Error; err != nil {
		tx.Rollback()
		response.InternalError(c, "Failed to fetch products")
		return
	}

	// 创建产品映射
	productMap := make(map[uint]*models.Product)
	for i := range products {
		productMap[products[i].ID] = &products[i]
	}

	// 验证每个订单项
	for _, item := range input.Items {
		product, exists := productMap[item.ProductID]
		if !exists || product.IsActive != 1 {
			tx.Rollback()
			response.BadRequest(c, fmt.Sprintf("Product %d not found or not available", item.ProductID))
			return
		}

		if product.Stock < item.Quantity {
			tx.Rollback()
			response.BadRequest(c, fmt.Sprintf("Insufficient stock for product: %s", product.Name))
			return
		}

		subtotal := product.Price * float64(item.Quantity)
		totalPrice += subtotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID:    item.ProductID,
			ProductName:  product.Name,
			ProductImage: product.Image,
			Price:        product.Price,
			Quantity:     item.Quantity,
			Subtotal:     subtotal,
		})
	}

	// 2. 查找或创建客户
	var customer models.Customer
	result := tx.Where("email = ?", input.CustomerEmail).First(&customer)
	if result.Error != nil {
		// 创建新客户
		customer = models.Customer{
			Email:   input.CustomerEmail,
			Name:    input.CustomerName,
			Phone:   input.CustomerPhone,
			Address: input.ShippingAddress,
		}
		if err := tx.Create(&customer).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "Failed to create customer")
			return
		}
	}

	// 3. 生成订单号
	orderNumber := generateOrderNumber()

	// 4. 创建订单
	order := models.Order{
		OrderNumber:     orderNumber,
		CustomerID:      &customer.ID,
		CustomerName:    input.CustomerName,
		CustomerEmail:   input.CustomerEmail,
		CustomerPhone:   input.CustomerPhone,
		ShippingAddress: input.ShippingAddress,
		TotalPrice:      totalPrice,
		Status:          models.StatusPending,
		Note:            input.Note,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		response.InternalError(c, "Failed to create order")
		return
	}

	// 5. 创建订单项并扣减库存
	for i := range orderItems {
		orderItems[i].OrderID = order.ID

		// 创建订单项
		if err := tx.Create(&orderItems[i]).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "Failed to create order items")
			return
		}

		// 扣减库存
		product := productMap[orderItems[i].ProductID]
		newStock := product.Stock - orderItems[i].Quantity

		if err := tx.Model(&models.Product{}).Where("id = ?", product.ID).
			Update("stock", newStock).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "Failed to update stock")
			return
		}

		// 记录库存变动
		stockLog := models.StockLog{
			ProductID:     product.ID,
			ChangeAmount:  -orderItems[i].Quantity,
			Reason:        models.ReasonOrder,
			ReferenceID:   &order.ID,
			PreviousStock: product.Stock,
			NewStock:      newStock,
		}
		if err := tx.Create(&stockLog).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "Failed to log stock change")
			return
		}
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		response.InternalError(c, "Failed to commit transaction")
		return
	}

	// 重新加载订单（包含关联）
	database.GetDB().Preload("Items").First(&order, order.ID)

	response.Created(c, order)
}

// UpdateOrderStatus 更新订单状态
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid order ID")
		return
	}

	var input struct {
		Status models.OrderStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var order models.Order
	if err := database.GetDB().First(&order, id).Error; err != nil {
		response.NotFound(c, "Order not found")
		return
	}

	// 验证状态转换
	if !isValidStatusTransition(order.Status, input.Status) {
		response.BadRequest(c, "Invalid status transition")
		return
	}

	if err := database.GetDB().Model(&order).Update("status", input.Status).Error; err != nil {
		response.InternalError(c, "Failed to update order status")
		return
	}

	order.Status = input.Status
	response.Success(c, order)
}

// CancelOrder 取消订单并恢复库存
func (h *OrderHandler) CancelOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid order ID")
		return
	}

	db := database.GetDB()

	var order models.Order
	if err := db.Preload("Items").First(&order, id).Error; err != nil {
		response.NotFound(c, "Order not found")
		return
	}

	if order.Status == models.StatusCancelled {
		response.BadRequest(c, "Order is already cancelled")
		return
	}

	if order.Status == models.StatusCompleted {
		response.BadRequest(c, "Cannot cancel completed order")
		return
	}

	// 开始事务
	tx := db.Begin()

	// 恢复库存
	for _, item := range order.Items {
		var product models.Product
		if err := tx.First(&product, item.ProductID).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "Failed to find product")
			return
		}

		newStock := product.Stock + item.Quantity
		if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "Failed to restore stock")
			return
		}

		// 记录库存变动
		stockLog := models.StockLog{
			ProductID:     product.ID,
			ChangeAmount:  item.Quantity,
			Reason:        models.ReasonReturn,
			ReferenceID:   &order.ID,
			PreviousStock: product.Stock,
			NewStock:      newStock,
		}
		if err := tx.Create(&stockLog).Error; err != nil {
			tx.Rollback()
			response.InternalError(c, "Failed to log stock change")
			return
		}
	}

	// 更新订单状态
	if err := tx.Model(&order).Update("status", models.StatusCancelled).Error; err != nil {
		tx.Rollback()
		response.InternalError(c, "Failed to cancel order")
		return
	}

	if err := tx.Commit().Error; err != nil {
		response.InternalError(c, "Failed to commit transaction")
		return
	}

	order.Status = models.StatusCancelled
	response.Success(c, order)
}

// GetOrdersByEmail 通过邮箱获取订单
func (h *OrderHandler) GetOrdersByEmail(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		response.BadRequest(c, "email is required")
		return
	}

	var orders []models.Order
	if err := database.GetDB().Preload("Items").
		Where("customerEmail = ?", email).
		Order("createdAt DESC").
		Find(&orders).Error; err != nil {
		response.InternalError(c, "Failed to fetch orders")
		return
	}

	response.Success(c, orders)
}

// generateOrderNumber 生成订单号
func generateOrderNumber() string {
	return fmt.Sprintf("TWK%s%04d",
		time.Now().Format("20060102150405"),
		time.Now().Nanosecond()%10000,
	)
}

// isValidStatusTransition 验证订单状态转换
func isValidStatusTransition(from, to models.OrderStatus) bool {
	validTransitions := map[models.OrderStatus][]models.OrderStatus{
		models.StatusPending:    {models.StatusConfirmed, models.StatusCancelled},
		models.StatusConfirmed:  {models.StatusProcessing, models.StatusCancelled},
		models.StatusProcessing: {models.StatusShipped, models.StatusCancelled},
		models.StatusShipped:    {models.StatusCompleted},
		models.StatusCompleted:  {},
		models.StatusCancelled:  {},
	}

	allowed, exists := validTransitions[from]
	if !exists {
		return false
	}

	for _, status := range allowed {
		if status == to {
			return true
		}
	}
	return false
}

// GetDashboardStats 获取仪表盘统计
func (h *OrderHandler) GetDashboardStats(c *gin.Context) {
	db := database.GetDB()

	var stats struct {
		TotalOrders      int64   `json:"totalOrders"`
		TotalRevenue     float64 `json:"totalRevenue"`
		PendingOrders    int64   `json:"pendingOrders"`
		TotalProducts    int64   `json:"totalProducts"`
		TotalCustomers   int64   `json:"totalCustomers"`
		LowStockProducts int64   `json:"lowStockProducts"`
	}

	db.Model(&models.Order{}).Count(&stats.TotalOrders)
	db.Model(&models.Order{}).Where("status = ?", "completed").Select("COALESCE(SUM(totalPrice), 0)").Scan(&stats.TotalRevenue)
	db.Model(&models.Order{}).Where("status = ?", "pending").Count(&stats.PendingOrders)
	db.Model(&models.Product{}).Where("isActive = ?", 1).Count(&stats.TotalProducts)
	db.Model(&models.Customer{}).Count(&stats.TotalCustomers)
	db.Model(&models.Product{}).Where("isActive = ? AND stock < ?", 1, 10).Count(&stats.LowStockProducts)

	response.Success(c, stats)
}
