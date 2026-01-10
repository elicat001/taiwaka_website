package models

import "time"

// CartItem 购物车项目模型
type CartItem struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SessionID string    `gorm:"column:sessionId;size:255;not null;index" json:"sessionId"`
	ProductID uint      `gorm:"column:productId;not null;index" json:"productId"`
	Quantity  int       `gorm:"not null;default:1" json:"quantity"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`

	// 关联
	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// TableName 指定表名
func (CartItem) TableName() string {
	return "cart_items"
}

// CartItemInput 添加/更新购物车的输入
type CartItemInput struct {
	SessionID string `json:"sessionId" binding:"required"`
	ProductID uint   `json:"productId" binding:"required"`
	Quantity  int    `json:"quantity"`
}

// CartDisplayItem 前端购物车显示用
type CartDisplayItem struct {
	CartItemID uint   `json:"cartItemId"`
	Quantity   int    `json:"quantity"`
	Product    *Product `json:"product,omitempty"`

	// 产品字段扁平化 (可选)
	ID             uint            `json:"id"`
	Name           string          `json:"name"`
	Description    *string         `json:"description"`
	Price          float64         `json:"price"`
	Category       ProductCategory `json:"category"`
	Image          *string         `json:"image"`
	Specifications Specifications  `json:"specifications"`
	Stock          int             `json:"stock"`
	Featured       int             `json:"featured"`
	Tag            *string         `json:"tag"`
	IsActive       int             `json:"isActive"`
}

// FromCartItemWithProduct 从购物车项和产品创建显示项
func (c *CartDisplayItem) FromCartItemWithProduct(item *CartItem, product *Product) {
	c.CartItemID = item.ID
	c.Quantity = item.Quantity

	if product != nil {
		c.ID = product.ID
		c.Name = product.Name
		c.Description = product.Description
		c.Price = product.Price
		c.Category = product.Category
		c.Image = product.Image
		c.Specifications = product.Specifications
		c.Stock = product.Stock
		c.Featured = product.Featured
		c.Tag = product.Tag
		c.IsActive = product.IsActive
	}
}
