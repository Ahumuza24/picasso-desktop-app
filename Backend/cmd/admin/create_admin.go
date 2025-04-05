package main

import (
	"JWT-Authentication-go/database"
	"JWT-Authentication-go/models"
	"flag"
	"fmt"
	"os"
)

func main() {
	// Parse command-line arguments
	email := flag.String("email", "", "Email of the user to make admin")
	flag.Parse()

	// Check if email is provided
	if *email == "" {
		fmt.Println("Error: Email is required")
		fmt.Println("Usage: go run cmd/admin/create_admin.go -email=user@example.com")
		os.Exit(1)
	}

	// Initialize database connection
	_, err := database.ConnectDB()
	if err != nil {
		fmt.Printf("Error connecting to database: %v\n", err)
		os.Exit(1)
	}

	// Find user by email
	var user models.User
	if err := database.DB.Where("email = ?", *email).First(&user).Error; err != nil {
		fmt.Printf("Error: User with email %s not found\n", *email)
		os.Exit(1)
	}

	// Update user role to admin
	user.Role = "admin"
	if err := database.DB.Save(&user).Error; err != nil {
		fmt.Printf("Error updating user role: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Successfully updated user %s (%s) to admin role\n", user.Name, user.Email)
}
