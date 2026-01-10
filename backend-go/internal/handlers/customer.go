package handlers

import (
	"strconv"

	"taiwaka-coffee/internal/database"
	"taiwaka-coffee/internal/models"
	"taiwaka-coffee/pkg/response"

	"github.com/gin-gonic/gin"
)

// CustomerHandler 客户处理器
type CustomerHandler struct{}

// NewCustomerHandler 创建客户处理器
func NewCustomerHandler() *CustomerHandler {
	return &CustomerHandler{}
}

// GetCustomers 获取客户列表
func (h *CustomerHandler) GetCustomers(c *gin.Context) {
	var params models.CustomerSearchParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	params.SetDefaults()

	db := database.GetDB()
	query := db.Model(&models.Customer{})

	// 搜索过滤
	if params.Email != "" {
		query = query.Where("email LIKE ?", "%"+params.Email+"%")
	}
	if params.Name != "" {
		query = query.Where("name LIKE ?", "%"+params.Name+"%")
	}

	// 计算总数
	var total int64
	query.Count(&total)

	// 排序
	orderClause := params.SortBy + " " + params.SortOrder
	query = query.Order(orderClause)

	// 分页
	offset := (params.Page - 1) * params.Limit
	var customers []models.Customer
	if err := query.Offset(offset).Limit(params.Limit).Find(&customers).Error; err != nil {
		response.InternalError(c, "Failed to fetch customers")
		return
	}

	response.Paginated(c, customers, params.Page, params.Limit, total)
}

// GetCustomer 获取单个客户
func (h *CustomerHandler) GetCustomer(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid customer ID")
		return
	}

	var customer models.Customer
	if err := database.GetDB().First(&customer, id).Error; err != nil {
		response.NotFound(c, "Customer not found")
		return
	}

	response.Success(c, customer)
}

// GetCustomerByEmail 通过邮箱获取客户
func (h *CustomerHandler) GetCustomerByEmail(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		response.BadRequest(c, "email is required")
		return
	}

	var customer models.Customer
	if err := database.GetDB().Where("email = ?", email).First(&customer).Error; err != nil {
		response.NotFound(c, "Customer not found")
		return
	}

	response.Success(c, customer)
}

// CreateCustomer 创建客户
func (h *CustomerHandler) CreateCustomer(c *gin.Context) {
	var input models.CustomerInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	// 检查邮箱是否已存在
	var existing models.Customer
	if err := database.GetDB().Where("email = ?", input.Email).First(&existing).Error; err == nil {
		response.BadRequest(c, "Email already exists")
		return
	}

	customer := models.Customer{
		Email:   input.Email,
		Name:    input.Name,
		Phone:   input.Phone,
		Address: input.Address,
	}

	if err := database.GetDB().Create(&customer).Error; err != nil {
		response.InternalError(c, "Failed to create customer")
		return
	}

	response.Created(c, customer)
}

// UpdateCustomer 更新客户
func (h *CustomerHandler) UpdateCustomer(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid customer ID")
		return
	}

	var customer models.Customer
	if err := database.GetDB().First(&customer, id).Error; err != nil {
		response.NotFound(c, "Customer not found")
		return
	}

	var input models.CustomerInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	// 检查邮箱是否被其他用户使用
	var existing models.Customer
	result := database.GetDB().Where("email = ? AND id != ?", input.Email, id).First(&existing)
	if result.Error == nil {
		response.BadRequest(c, "Email already in use by another customer")
		return
	}

	updates := map[string]interface{}{
		"email":   input.Email,
		"name":    input.Name,
		"phone":   input.Phone,
		"address": input.Address,
	}

	if err := database.GetDB().Model(&customer).Updates(updates).Error; err != nil {
		response.InternalError(c, "Failed to update customer")
		return
	}

	database.GetDB().First(&customer, id)
	response.Success(c, customer)
}

// DeleteCustomer 删除客户
func (h *CustomerHandler) DeleteCustomer(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid customer ID")
		return
	}

	var customer models.Customer
	if err := database.GetDB().First(&customer, id).Error; err != nil {
		response.NotFound(c, "Customer not found")
		return
	}

	// 检查客户是否有订单
	var orderCount int64
	database.GetDB().Model(&models.Order{}).Where("customerId = ?", id).Count(&orderCount)
	if orderCount > 0 {
		response.BadRequest(c, "Cannot delete customer with existing orders")
		return
	}

	if err := database.GetDB().Delete(&customer).Error; err != nil {
		response.InternalError(c, "Failed to delete customer")
		return
	}

	response.SuccessWithMessage(c, nil, "Customer deleted successfully")
}

// GetCustomerOrders 获取客户的订单
func (h *CustomerHandler) GetCustomerOrders(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid customer ID")
		return
	}

	var orders []models.Order
	if err := database.GetDB().Preload("Items").
		Where("customerId = ?", id).
		Order("createdAt DESC").
		Find(&orders).Error; err != nil {
		response.InternalError(c, "Failed to fetch customer orders")
		return
	}

	response.Success(c, orders)
}
