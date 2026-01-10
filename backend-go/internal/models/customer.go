package models

import "time"

// Customer 客户模型
type Customer struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Email     string    `gorm:"size:255;not null;uniqueIndex" json:"email"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	Phone     *string   `gorm:"size:20" json:"phone"`
	Address   *string   `gorm:"type:text" json:"address"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	// 关联
	Orders []Order `gorm:"foreignKey:CustomerID" json:"orders,omitempty"`
}

// TableName 指定表名
func (Customer) TableName() string {
	return "customers"
}

// CustomerInput 创建/更新客户的输入
type CustomerInput struct {
	Email   string  `json:"email" binding:"required,email"`
	Name    string  `json:"name" binding:"required"`
	Phone   *string `json:"phone"`
	Address *string `json:"address"`
}

// CustomerSearchParams 客户搜索参数
type CustomerSearchParams struct {
	Email     string `form:"email"`
	Name      string `form:"name"`
	SortBy    string `form:"sortBy" binding:"omitempty,oneof=createdAt name email"`
	SortOrder string `form:"sortOrder" binding:"omitempty,oneof=asc desc"`
	Page      int    `form:"page" binding:"omitempty,min=1"`
	Limit     int    `form:"limit" binding:"omitempty,min=1,max=100"`
}

// SetDefaults 设置默认值
func (p *CustomerSearchParams) SetDefaults() {
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
