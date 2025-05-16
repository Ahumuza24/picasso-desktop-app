package database

import (
	"JWT-Authentication-go/models"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// creating a reference to a GORM database connection that can be used throughout your application to perform
// database operations like querying, inserting, updating, and deleting data from the database.
var DB *gorm.DB

// Connect to database - either MySQL or SQLite depending on environment
func ConnectDB() (*gorm.DB, error) {
	// Check if running in production (compiled with Tauri)
	exePath, err := os.Executable()
	if err != nil {
		fmt.Printf("Warning: Could not determine executable path: %v\n", err)
	}

	// Try to determine if we're running in a Tauri app
	isDesktopApp := false
	resourcesDir := ""

	if exePath != "" {
		// Check if we're in a Tauri app structure
		execDir := filepath.Dir(exePath)
		// On Windows, the resources directory is in the same directory as the executable
		possibleResourcesDir := filepath.Join(execDir, "resources")
		if _, err := os.Stat(possibleResourcesDir); err == nil {
			isDesktopApp = true
			resourcesDir = possibleResourcesDir
		}
	}

	var db *gorm.DB

	if isDesktopApp {
		// Use SQLite for desktop app
		dbPath := filepath.Join(resourcesDir, "picasso.db")
		fmt.Printf("Using SQLite database at: %s\n", dbPath)

		db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
		if err != nil {
			return nil, fmt.Errorf("failed to connect to SQLite database: %w", err)
		}
	} else {
		// Use MySQL for non-desktop (development) environment
		dsn := "root:Urhumuzer@123@tcp(localhost:3306)/picasso"
		fmt.Println("Using MySQL database")

		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err != nil {
			return nil, fmt.Errorf("failed to connect to MySQL database: %w", err)
		}
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
