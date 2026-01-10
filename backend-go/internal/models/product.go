package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// ProductCategory 产品分类
type ProductCategory string

const (
	CategoryCoffee      ProductCategory = "coffee"
	CategoryMerchandise ProductCategory = "merchandise"
	CategoryEquipment   ProductCategory = "equipment"
)

// ProductTag 产品标签
type ProductTag string

const (
	TagLimited    ProductTag = "LIMITED"
	TagSeasonal   ProductTag = "SEASONAL"
	TagNew        ProductTag = "NEW"
	TagBestseller ProductTag = "BESTSELLER"
)

// Specifications 产品规格 (JSON 字段)
type Specifications map[string]interface{}

// Value 实现 driver.Valuer 接口
func (s Specifications) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	return json.Marshal(s)
}

// Scan 实现 sql.Scanner 接口
func (s *Specifications) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, s)
}

// Product 产品模型
type Product struct {
	ID             uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	Name           string          `gorm:"size:255;not null" json:"name"`
	Description    *string         `gorm:"type:text" json:"description"`
	Price          float64         `gorm:"type:decimal(10,2);not null" json:"price"`
	Category       ProductCategory `gorm:"size:50;not null;default:coffee" json:"category"`
	Image          *string         `gorm:"size:500" json:"image"`
	Specifications Specifications  `gorm:"type:json" json:"specifications"`
	Stock          int             `gorm:"not null;default:0" json:"stock"`
	Featured       int             `gorm:"default:0" json:"featured"`
	Tag            *string         `gorm:"size:50" json:"tag"`
	IsActive       int             `gorm:"not null;default:1" json:"isActive"`
	CreatedAt      time.Time       `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time       `gorm:"autoUpdateTime" json:"updatedAt"`

	// 关联
	CartItems  []CartItem  `gorm:"foreignKey:ProductID" json:"-"`
	OrderItems []OrderItem `gorm:"foreignKey:ProductID" json:"-"`
	StockLogs  []StockLog  `gorm:"foreignKey:ProductID" json:"-"`
}

// TableName 指定表名
func (Product) TableName() string {
	return "products"
}

// ProductInput 创建/更新产品的输入
type ProductInput struct {
	Name           string          `json:"name" binding:"required"`
	Description    *string         `json:"description"`
	Price          float64         `json:"price" binding:"required,gt=0"`
	Category       ProductCategory `json:"category"`
	Image          *string         `json:"image"`
	Specifications Specifications  `json:"specifications"`
	Stock          int             `json:"stock"`
	Featured       int             `json:"featured"`
	Tag            *string         `json:"tag"`
	IsActive       int             `json:"isActive"`
}

// ProductSearchParams 产品搜索参数
type ProductSearchParams struct {
	Q         string          `form:"q"`
	Category  ProductCategory `form:"category"`
	MinPrice  *float64        `form:"minPrice"`
	MaxPrice  *float64        `form:"maxPrice"`
	InStock   *bool           `form:"inStock"`
	Featured  *bool           `form:"featured"`
	SortBy    string          `form:"sortBy" binding:"omitempty,oneof=price name createdAt"`
	SortOrder string          `form:"sortOrder" binding:"omitempty,oneof=asc desc"`
	Page      int             `form:"page" binding:"omitempty,min=1"`
	Limit     int             `form:"limit" binding:"omitempty,min=1,max=100"`
}

// SetDefaults 设置默认值
func (p *ProductSearchParams) SetDefaults() {
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
