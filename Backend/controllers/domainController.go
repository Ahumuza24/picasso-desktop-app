package controllers

import (
	"JWT-Authentication-go/database"
	"JWT-Authentication-go/models"
	"JWT-Authentication-go/utils"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetDomainMappings returns all domain mappings (admin only)
func GetDomainMappings(c *fiber.Ctx) error {
	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	var mappings []models.DomainMapping
	if err := database.DB.Find(&mappings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch domain mappings",
		})
	}

	return c.JSON(mappings)
}

// GetDefaultMapping returns the default folder mapping
func GetDefaultMapping(c *fiber.Ctx) error {
	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	var defaultMapping models.DefaultMapping
	if err := database.DB.First(&defaultMapping).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch default mapping",
		})
	}

	return c.JSON(defaultMapping)
}

// CreateDomainMapping creates a new domain mapping
func CreateDomainMapping(c *fiber.Ctx) error {
	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	// Log the raw body
	fmt.Printf("Received raw body: %s\n", string(c.Body()))

	var data map[string]interface{}
	if err := c.BodyParser(&data); err != nil {
		fmt.Printf("Error parsing body: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body: " + err.Error(),
		})
	}

	// Log the parsed data
	fmt.Printf("Parsed data: %+v\n", data)

	// Validate required fields
	if data["domain"] == nil || data["drive_url"] == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Domain and Drive URL are required",
		})
	}

	// Get current user ID
	userId := utils.GetUserIdFromToken(c)
	currentTime := time.Now().Unix()

	// Create the domain mapping
	mapping := models.DomainMapping{
		Domain:      data["domain"].(string),
		DriveURL:    data["drive_url"].(string),
		Description: data["description"].(string),
		IsActive:    true,
		CreatedAt:   currentTime,
		UpdatedAt:   currentTime,
		CreatedBy:   userId,
	}

	if err := database.DB.Create(&mapping).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create domain mapping",
		})
	}

	return c.JSON(mapping)
}

// UpdateDomainMapping updates an existing domain mapping
func UpdateDomainMapping(c *fiber.Ctx) error {
	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	// Parse request
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	// Validate input
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Domain mapping ID is required",
		})
	}

	// Get existing mapping
	var mapping models.DomainMapping
	if err := database.DB.First(&mapping, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Domain mapping not found",
		})
	}

	// Update fields
	if data["domain"] != "" {
		mapping.Domain = normalizeDomain(data["domain"])
	}
	if data["drive_url"] != "" {
		mapping.DriveURL = data["drive_url"]
	}
	if data["description"] != "" {
		mapping.Description = data["description"]
	}

	// Update timestamp and save
	mapping.UpdatedAt = time.Now().Unix()
	if err := database.DB.Save(&mapping).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update domain mapping",
		})
	}

	return c.JSON(mapping)
}

// DeleteDomainMapping deletes a domain mapping
func DeleteDomainMapping(c *fiber.Ctx) error {
	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	// Get domain mapping ID from URL parameter
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Domain mapping ID is required",
		})
	}

	// Find and delete the mapping
	if err := database.DB.Delete(&models.DomainMapping{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete domain mapping",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Domain mapping deleted successfully",
	})
}

// UpdateDefaultMapping updates the default mapping
func UpdateDefaultMapping(c *fiber.Ctx) error {
	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	// Validate input
	if data["drive_url"] == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Drive URL is required",
		})
	}

	// Get current user ID
	userId := utils.GetUserIdFromToken(c)

	var defaultMapping models.DefaultMapping
	if err := database.DB.First(&defaultMapping).Error; err != nil {
		// Create if doesn't exist
		defaultMapping = models.DefaultMapping{
			DriveURL:  data["drive_url"],
			UpdatedAt: time.Now().Unix(),
			UpdatedBy: userId,
		}
		if err := database.DB.Create(&defaultMapping).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create default mapping",
			})
		}
	} else {
		// Update existing
		defaultMapping.DriveURL = data["drive_url"]
		defaultMapping.UpdatedAt = time.Now().Unix()
		defaultMapping.UpdatedBy = userId
		if err := database.DB.Save(&defaultMapping).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update default mapping",
			})
		}
	}

	return c.JSON(defaultMapping)
}

// FindDriveUrlForUser finds the appropriate drive URL based on user's email domain
func FindDriveUrlForUser(c *fiber.Ctx) error {
	// Get current user from JWT
	cookie := c.Cookies("jwt")
	token, err := jwt.ParseWithClaims(cookie, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(utils.SecretKey), nil
	})

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	claims := token.Claims.(*jwt.MapClaims)
	userId := utils.GetUintFromClaims(claims, "sub")

	// Get user email
	var user models.User
	if err := database.DB.Where("id = ?", userId).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Extract domain from email
	emailDomain := extractDomainFromEmail(user.Email)
	if emailDomain == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid email domain",
		})
	}

	// Find domain mapping
	var mapping models.DomainMapping
	if err := database.DB.Where("domain = ? AND is_active = ?", emailDomain, true).First(&mapping).Error; err != nil {
		// If no domain mapping found, use default mapping
		var defaultMapping models.DefaultMapping
		if err := database.DB.First(&defaultMapping).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "No drive mapping found for your domain",
			})
		}

		// Log access using default mapping
		logAccess(user.ID, emailDomain, defaultMapping.DriveURL, c)

		return c.JSON(fiber.Map{
			"drive_url":  defaultMapping.DriveURL,
			"is_default": true,
			"domain":     emailDomain,
		})
	}

	// Log access
	logAccess(user.ID, emailDomain, mapping.DriveURL, c)

	// Return drive URL for the domain
	return c.JSON(fiber.Map{
		"drive_url":   mapping.DriveURL,
		"domain":      emailDomain,
		"is_default":  false,
		"description": mapping.Description,
	})
}

// Helper functions

// normalizeDomain normalizes a domain by removing common prefixes
func normalizeDomain(domain string) string {
	// Remove http://, https://, www.
	domain = strings.ToLower(domain)
	domain = strings.TrimPrefix(domain, "http://")
	domain = strings.TrimPrefix(domain, "https://")
	domain = strings.TrimPrefix(domain, "www.")

	// Remove anything after a slash if present
	if idx := strings.Index(domain, "/"); idx != -1 {
		domain = domain[:idx]
	}

	return domain
}

// extractDomainFromEmail extracts the domain portion from an email address
func extractDomainFromEmail(email string) string {
	if email == "" {
		return ""
	}

	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return ""
	}

	domain := parts[1]
	if domain == "" {
		return ""
	}

	// Additional validation if needed
	if !strings.Contains(domain, ".") {
		return ""
	}

	return domain
}

// logAccess logs user access to drive folders
func logAccess(userID uint, domain string, driveURL string, c *fiber.Ctx) {
	accessLog := models.AccessLog{
		UserID:    userID,
		Domain:    domain,
		DriveURL:  driveURL,
		Timestamp: time.Now().Unix(),
		IPAddress: c.IP(),
		UserAgent: c.Get("User-Agent"),
	}

	database.DB.Create(&accessLog)
}
