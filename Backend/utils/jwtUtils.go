package utils

import (
	"JWT-Authentication-go/database"
	"JWT-Authentication-go/models"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

const SecretKey = "secret"

// GetUintFromClaims converts a claim to uint
func GetUintFromClaims(claims *jwt.MapClaims, key string) uint {
	value := (*claims)[key]
	fmt.Printf("GetUintFromClaims - key: %s, value: %v, type: %T\n", key, value, value)

	switch v := value.(type) {
	case float64:
		return uint(v)
	case string:
		// Try to parse string to uint
		id, err := strconv.ParseUint(v, 10, 32)
		if err != nil {
			fmt.Printf("Error parsing string to uint: %v\n", err)
			return 0
		}
		return uint(id)
	default:
		fmt.Printf("Unsupported claim type: %T\n", value)
		return 0
	}
}

// IsAdmin checks if the current user is an admin
func IsAdmin(c *fiber.Ctx) bool {
	fmt.Println("==== IsAdmin Check Start ====")

	// Debug: Print request headers
	fmt.Println("Request headers:")
	for k, v := range c.GetReqHeaders() {
		fmt.Printf("  %s: %s\n", k, v)
	}

	cookie := c.Cookies("jwt")
	fmt.Println("JWT cookie length:", len(cookie))

	if len(cookie) > 0 {
		fmt.Printf("JWT cookie prefix: %s...\n", cookie[:min(20, len(cookie))])
	}

	if len(cookie) == 0 {
		fmt.Println("No JWT cookie found")
		return false
	}

	token, err := jwt.ParseWithClaims(cookie, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(SecretKey), nil
	})

	if err != nil {
		fmt.Println("JWT parsing error:", err)
		return false
	}

	claims := token.Claims.(*jwt.MapClaims)
	fmt.Printf("JWT claims: %+v\n", *claims)

	userID := GetUintFromClaims(claims, "sub")
	fmt.Println("User ID from token:", userID)

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		fmt.Println("Error finding user:", err)
		return false
	}

	fmt.Printf("User found: ID=%d, Name=%s, Email=%s, Role=%s\n",
		user.ID, user.Name, user.Email, user.Role)
	isAdmin := user.Role == "admin"
	fmt.Println("Is user admin:", isAdmin)
	fmt.Println("==== IsAdmin Check End ====")

	return isAdmin
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// GetUserIdFromToken gets the user ID from JWT token
func GetUserIdFromToken(c *fiber.Ctx) uint {
	cookie := c.Cookies("jwt")
	token, err := jwt.ParseWithClaims(cookie, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(SecretKey), nil
	})

	if err != nil {
		return 0
	}

	claims := token.Claims.(*jwt.MapClaims)
	return GetUintFromClaims(claims, "sub")
}
