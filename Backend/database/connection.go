package database

import (
	"JWT-Authentication-go/models"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// creating a reference to a GORM database connection that can be used throughout your application to perform
// database operations like querying, inserting, updating, and deleting data from the database.
var DB *gorm.DB

// Connect to MySQL database
func ConnectDB() (*gorm.DB, error) {
	// Database configuration
	dsn := "root:Urhumuzer@123@tcp(localhost:3306)/picasso"
	// dsn := "user:password@tcp(localhost:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"

	// Connect to MySQL database
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	DB = db

	// Auto migrate all models
	db.AutoMigrate(
		&models.User{},
		&models.DomainMapping{},
		&models.DefaultMapping{},
		&models.AccessLog{},
	)

	// Create default mapping if it doesn't exist
	var defaultMapping models.DefaultMapping
	if db.First(&defaultMapping).RowsAffected == 0 {
		db.Create(&models.DefaultMapping{
			DriveURL:  "https://drive.google.com/drive/folders/default",
			UpdatedAt: time.Now().Unix(),
			UpdatedBy: 1, // System ID
		})
	}

	return db, nil
}
