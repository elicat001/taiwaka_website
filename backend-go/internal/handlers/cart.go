package handlers

import (
	"strconv"

	"taiwaka-coffee/internal/database"
	"taiwaka-coffee/internal/models"
	"taiwaka-coffee/pkg/response"

	"github.com/gin-gonic/gin"
)

// CartHandler 购物车处理器
type CartHandler struct{}

// NewCartHandler 创建购物车处理器
func NewCartHandler() *CartHandler {
	return &CartHandler{}
}

// GetCart 获取购物车内容
func (h *CartHandler) GetCart(c *gin.Context) {
	sessionID := c.Query("sessionId")
	if sessionID == "" {
		response.BadRequest(c, "sessionId is required")
		return
	}

	var cartItems []models.CartItem
	if err := database.GetDB().
		Preload("Product").
		Where("sessionId = ?", sessionID).
		Find(&cartItems).Error; err != nil {
		response.InternalError(c, "Failed to fetch cart")
		return
	}

	// 转换为显示格式
	var displayItems []models.CartDisplayItem
	for _, item := range cartItems {
		if item.Product != nil && item.Product.IsActive == 1 {
			displayItem := models.CartDisplayItem{}
			displayItem.FromCartItemWithProduct(&item, item.Product)
			displayItems = append(displayItems, displayItem)
		}
	}

	if displayItems == nil {
		displayItems = []models.CartDisplayItem{}
	}

	response.Success(c, displayItems)
}

// AddToCart 添加商品到购物车
func (h *CartHandler) AddToCart(c *gin.Context) {
	var input models.CartItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	if input.Quantity <= 0 {
		input.Quantity = 1
	}

	// 验证产品存在
	var product models.Product
	if err := database.GetDB().First(&product, input.ProductID).Error; err != nil {
		response.NotFound(c, "Product not found")
		return
	}

	if product.IsActive != 1 {
		response.BadRequest(c, "Product is not available")
		return
	}

	// 检查库存
	if product.Stock < input.Quantity {
		response.BadRequest(c, "Insufficient stock")
		return
	}

	// 检查是否已在购物车中
	var existingItem models.CartItem
	result := database.GetDB().
		Where("sessionId = ? AND productId = ?", input.SessionID, input.ProductID).
		First(&existingItem)

	if result.Error == nil {
		// 更新数量
		newQuantity := existingItem.Quantity + input.Quantity
		if newQuantity > product.Stock {
			response.BadRequest(c, "Insufficient stock")
			return
		}
		if err := database.GetDB().Model(&existingItem).Update("quantity", newQuantity).Error; err != nil {
			response.InternalError(c, "Failed to update cart")
			return
		}
		existingItem.Quantity = newQuantity
		response.Success(c, existingItem)
	} else {
		// 创建新项
		cartItem := models.CartItem{
			SessionID: input.SessionID,
			ProductID: input.ProductID,
			Quantity:  input.Quantity,
		}
		if err := database.GetDB().Create(&cartItem).Error; err != nil {
			response.InternalError(c, "Failed to add to cart")
			return
		}
		response.Created(c, cartItem)
	}
}

// UpdateCartItem 更新购物车项数量
func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid cart item ID")
		return
	}

	var input struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var cartItem models.CartItem
	if err := database.GetDB().First(&cartItem, id).Error; err != nil {
		response.NotFound(c, "Cart item not found")
		return
	}

	// 验证库存
	var product models.Product
	if err := database.GetDB().First(&product, cartItem.ProductID).Error; err != nil {
		response.NotFound(c, "Product not found")
		return
	}

	if input.Quantity > product.Stock {
		response.BadRequest(c, "Insufficient stock")
		return
	}

	if err := database.GetDB().Model(&cartItem).Update("quantity", input.Quantity).Error; err != nil {
		response.InternalError(c, "Failed to update cart item")
		return
	}

	cartItem.Quantity = input.Quantity
	response.Success(c, cartItem)
}

// RemoveFromCart 从购物车移除商品
func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid cart item ID")
		return
	}

	if err := database.GetDB().Delete(&models.CartItem{}, id).Error; err != nil {
		response.InternalError(c, "Failed to remove from cart")
		return
	}

	response.SuccessWithMessage(c, nil, "Item removed from cart")
}

// ClearCart 清空购物车
func (h *CartHandler) ClearCart(c *gin.Context) {
	sessionID := c.Query("sessionId")
	if sessionID == "" {
		response.BadRequest(c, "sessionId is required")
		return
	}

	if err := database.GetDB().Where("sessionId = ?", sessionID).Delete(&models.CartItem{}).Error; err != nil {
		response.InternalError(c, "Failed to clear cart")
		return
	}

	response.SuccessWithMessage(c, nil, "Cart cleared")
}

// GetCartCount 获取购物车商品数量
func (h *CartHandler) GetCartCount(c *gin.Context) {
	sessionID := c.Query("sessionId")
	if sessionID == "" {
		response.BadRequest(c, "sessionId is required")
		return
	}

	var count int64
	if err := database.GetDB().Model(&models.CartItem{}).
		Where("sessionId = ?", sessionID).
		Select("COALESCE(SUM(quantity), 0)").
		Scan(&count).Error; err != nil {
		response.InternalError(c, "Failed to get cart count")
		return
	}

	response.Success(c, gin.H{"count": count})
}
