package handlers

import (
	"strconv"

	"taiwaka-coffee/internal/database"
	"taiwaka-coffee/internal/models"
	"taiwaka-coffee/pkg/response"

	"github.com/gin-gonic/gin"
)

// ProductHandler 产品处理器
type ProductHandler struct{}

// NewProductHandler 创建产品处理器
func NewProductHandler() *ProductHandler {
	return &ProductHandler{}
}

// GetProducts 获取产品列表 (支持分页和搜索)
func (h *ProductHandler) GetProducts(c *gin.Context) {
	var params models.ProductSearchParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	params.SetDefaults()

	db := database.GetDB()
	query := db.Model(&models.Product{}).Where("isActive = ?", 1)

	// 搜索过滤
	if params.Q != "" {
		search := "%" + params.Q + "%"
		query = query.Where("name LIKE ? OR description LIKE ?", search, search)
	}
	if params.Category != "" {
		query = query.Where("category = ?", params.Category)
	}
	if params.MinPrice != nil {
		query = query.Where("price >= ?", *params.MinPrice)
	}
	if params.MaxPrice != nil {
		query = query.Where("price <= ?", *params.MaxPrice)
	}
	if params.InStock != nil && *params.InStock {
		query = query.Where("stock > 0")
	}
	if params.Featured != nil && *params.Featured {
		query = query.Where("featured = 1")
	}

	// 计算总数
	var total int64
	query.Count(&total)

	// 排序
	orderClause := params.SortBy + " " + params.SortOrder
	query = query.Order(orderClause)

	// 分页
	offset := (params.Page - 1) * params.Limit
	var products []models.Product
	if err := query.Offset(offset).Limit(params.Limit).Find(&products).Error; err != nil {
		response.InternalError(c, "Failed to fetch products")
		return
	}

	response.Paginated(c, products, params.Page, params.Limit, total)
}

// GetFeaturedProducts 获取推荐产品
func (h *ProductHandler) GetFeaturedProducts(c *gin.Context) {
	var products []models.Product
	if err := database.GetDB().
		Where("featured = ? AND isActive = ?", 1, 1).
		Order("createdAt DESC").
		Limit(6).
		Find(&products).Error; err != nil {
		response.InternalError(c, "Failed to fetch featured products")
		return
	}
	response.Success(c, products)
}

// GetProduct 获取单个产品
func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid product ID")
		return
	}

	var product models.Product
	if err := database.GetDB().First(&product, id).Error; err != nil {
		response.NotFound(c, "Product not found")
		return
	}

	response.Success(c, product)
}

// CreateProduct 创建产品
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var input models.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	product := models.Product{
		Name:           input.Name,
		Description:    input.Description,
		Price:          input.Price,
		Category:       input.Category,
		Image:          input.Image,
		Specifications: input.Specifications,
		Stock:          input.Stock,
		Featured:       input.Featured,
		Tag:            input.Tag,
		IsActive:       1,
	}

	if input.Category == "" {
		product.Category = models.CategoryCoffee
	}

	if err := database.GetDB().Create(&product).Error; err != nil {
		response.InternalError(c, "Failed to create product")
		return
	}

	response.Created(c, product)
}

// UpdateProduct 更新产品
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid product ID")
		return
	}

	var product models.Product
	if err := database.GetDB().First(&product, id).Error; err != nil {
		response.NotFound(c, "Product not found")
		return
	}

	var input models.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	// 更新字段
	updates := map[string]interface{}{
		"name":           input.Name,
		"description":    input.Description,
		"price":          input.Price,
		"category":       input.Category,
		"image":          input.Image,
		"specifications": input.Specifications,
		"stock":          input.Stock,
		"featured":       input.Featured,
		"tag":            input.Tag,
		"isActive":       input.IsActive,
	}

	if err := database.GetDB().Model(&product).Updates(updates).Error; err != nil {
		response.InternalError(c, "Failed to update product")
		return
	}

	// 重新获取更新后的产品
	database.GetDB().First(&product, id)
	response.Success(c, product)
}

// DeleteProduct 删除产品 (软删除)
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid product ID")
		return
	}

	var product models.Product
	if err := database.GetDB().First(&product, id).Error; err != nil {
		response.NotFound(c, "Product not found")
		return
	}

	// 软删除：设置 isActive = 0
	if err := database.GetDB().Model(&product).Update("isActive", 0).Error; err != nil {
		response.InternalError(c, "Failed to delete product")
		return
	}

	response.SuccessWithMessage(c, nil, "Product deleted successfully")
}

// GetProductsByCategory 按分类获取产品
func (h *ProductHandler) GetProductsByCategory(c *gin.Context) {
	category := c.Param("category")

	var products []models.Product
	if err := database.GetDB().
		Where("category = ? AND isActive = ?", category, 1).
		Order("createdAt DESC").
		Find(&products).Error; err != nil {
		response.InternalError(c, "Failed to fetch products")
		return
	}

	response.Success(c, products)
}
