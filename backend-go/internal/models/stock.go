package models

import "time"

// StockChangeReason 库存变动原因
type StockChangeReason string

const (
	ReasonOrder      StockChangeReason = "order"
	ReasonAdjustment StockChangeReason = "adjustment"
	ReasonReturn     StockChangeReason = "return"
	ReasonInitial    StockChangeReason = "initial"
)

// StockLog 库存变动记录模型
type StockLog struct {
	ID            uint              `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID     uint              `gorm:"column:productId;not null;index" json:"productId"`
	ChangeAmount  int               `gorm:"column:changeAmount;not null" json:"changeAmount"` // 正数为入库，负数为出库
	Reason        StockChangeReason `gorm:"size:100;not null" json:"reason"`
	ReferenceID   *uint             `gorm:"column:referenceId" json:"referenceId"` // 关联的订单ID或其他
	PreviousStock int               `gorm:"column:previousStock;not null" json:"previousStock"`
	NewStock      int               `gorm:"column:newStock;not null" json:"newStock"`
	CreatedAt     time.Time         `gorm:"autoCreateTime;index" json:"createdAt"`

	// 关联
	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// TableName 指定表名
func (StockLog) TableName() string {
	return "stock_logs"
}

// StockAdjustmentInput 库存调整输入
type StockAdjustmentInput struct {
	ProductID    uint              `json:"productId" binding:"required"`
	ChangeAmount int               `json:"changeAmount" binding:"required"`
	Reason       StockChangeReason `json:"reason" binding:"required"`
	ReferenceID  *uint             `json:"referenceId"`
}

// StockLogSearchParams 库存日志搜索参数
type StockLogSearchParams struct {
	ProductID uint              `form:"productId"`
	Reason    StockChangeReason `form:"reason"`
	StartDate string            `form:"startDate"`
	EndDate   string            `form:"endDate"`
	Page      int               `form:"page" binding:"omitempty,min=1"`
	Limit     int               `form:"limit" binding:"omitempty,min=1,max=100"`
}

// SetDefaults 设置默认值
func (p *StockLogSearchParams) SetDefaults() {
	if p.Page == 0 {
		p.Page = 1
	}
	if p.Limit == 0 {
		p.Limit = 50
	}
}
