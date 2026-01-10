package models

import "time"

// OrderStatus 订单状态
type OrderStatus string

const (
	StatusPending    OrderStatus = "pending"
	StatusConfirmed  OrderStatus = "confirmed"
	StatusProcessing OrderStatus = "processing"
	StatusShipped    OrderStatus = "shipped"
	StatusCompleted  OrderStatus = "completed"
	StatusCancelled  OrderStatus = "cancelled"
)

// Order 订单模型
type Order struct {
	ID              uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderNumber     string      `gorm:"column:orderNumber;size:50;not null;uniqueIndex" json:"orderNumber"`
	CustomerID      *uint       `gorm:"column:customerId;index" json:"customerId"`
	CustomerName    string      `gorm:"column:customerName;size:255;not null" json:"customerName"`
	CustomerEmail   string      `gorm:"column:customerEmail;size:255;not null;index" json:"customerEmail"`
	CustomerPhone   *string     `gorm:"column:customerPhone;size:20" json:"customerPhone"`
	ShippingAddress *string     `gorm:"column:shippingAddress;type:text" json:"shippingAddress"`
	TotalPrice      float64     `gorm:"column:totalPrice;type:decimal(10,2);not null" json:"totalPrice"`
	Status          OrderStatus `gorm:"size:50;not null;default:pending;index" json:"status"`
	Note            *string     `gorm:"type:text" json:"note"`
	CreatedAt       time.Time   `gorm:"autoCreateTime;index" json:"createdAt"`
	UpdatedAt       time.Time   `gorm:"autoUpdateTime" json:"updatedAt"`

	// 关联
	Customer *Customer   `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	Items    []OrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
}

// TableName 指定表名
func (Order) TableName() string {
	return "orders"
}

// OrderItem 订单项目模型
type OrderItem struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID      uint      `gorm:"column:orderId;not null;index" json:"orderId"`
	ProductID    uint      `gorm:"column:productId;not null;index" json:"productId"`
	ProductName  string    `gorm:"column:productName;size:255;not null" json:"productName"`
	ProductImage *string   `gorm:"column:productImage;size:500" json:"productImage"`
	Price        float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	Quantity     int       `gorm:"not null;default:1" json:"quantity"`
	Subtotal     float64   `gorm:"type:decimal(10,2);not null" json:"subtotal"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"createdAt"`

	// 关联
	Order   *Order   `gorm:"foreignKey:OrderID" json:"-"`
	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// TableName 指定表名
func (OrderItem) TableName() string {
	return "order_items"
}

// OrderInput 创建订单的输入
type OrderInput struct {
	CustomerName    string           `json:"customerName" binding:"required"`
	CustomerEmail   string           `json:"customerEmail" binding:"required,email"`
	CustomerPhone   *string          `json:"customerPhone"`
	ShippingAddress *string          `json:"shippingAddress"`
	Items           []OrderItemInput `json:"items" binding:"required,min=1"`
	Note            *string          `json:"note"`
}

// OrderItemInput 订单项目输入
type OrderItemInput struct {
	ProductID uint `json:"productId" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

// OrderSearchParams 订单搜索参数
type OrderSearchParams struct {
	Status        OrderStatus `form:"status"`
	CustomerEmail string      `form:"customerEmail"`
	StartDate     string      `form:"startDate"`
	EndDate       string      `form:"endDate"`
	SortBy        string      `form:"sortBy" binding:"omitempty,oneof=createdAt totalPrice"`
	SortOrder     string      `form:"sortOrder" binding:"omitempty,oneof=asc desc"`
	Page          int         `form:"page" binding:"omitempty,min=1"`
	Limit         int         `form:"limit" binding:"omitempty,min=1,max=100"`
}

// SetDefaults 设置默认值
func (p *OrderSearchParams) SetDefaults() {
	if p.Page == 0 {
		p.Page = 1
	}
	if p.Limit == 0 {
		p.Limit = 10
	}
	if p.SortBy == "" {
		p.SortBy = "createdAt"
	}
	if p.SortOrder == "" {
		p.SortOrder = "desc"
	}
}
