package database

import (
	"log"
	"time"

	"taiwaka-coffee/internal/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect 连接数据库
func Connect(cfg *config.Config) error {
	var err error

	// 配置 GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// 生产环境减少日志
	if cfg.Env == "production" {
		gormConfig.Logger = logger.Default.LogMode(logger.Error)
	}

	// 连接数据库
	DB, err = gorm.Open(mysql.Open(cfg.GetDSN()), gormConfig)
	if err != nil {
		return err
	}

	// 获取底层 sql.DB 进行连接池配置
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	// 连接池配置 - 针对高并发优化
	sqlDB.SetMaxIdleConns(10)           // 最大空闲连接数
	sqlDB.SetMaxOpenConns(100)          // 最大打开连接数
	sqlDB.SetConnMaxLifetime(time.Hour) // 连接最大生命周期

	log.Println("[Database] Connected to MySQL successfully")
	return nil
}

// Close 关闭数据库连接
func Close() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}
