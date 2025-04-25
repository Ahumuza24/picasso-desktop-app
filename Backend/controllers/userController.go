package controllers

import (
	"JWT-Authentication-go/database"
	"JWT-Authentication-go/models"
	"JWT-Authentication-go/utils"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// UpdateUser updates a user by ID (admin only)
func UpdateUser(c *fiber.Ctx) error {
	fmt.Println("Admin request - UpdateUser")

	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Admin access required",
		})
	}

	// Get user ID from URL parameter
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User ID is required",
		})
	}

	// Parse request body
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	// Get existing user
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Update user fields if provided
	if data["name"] != "" {
		user.Name = data["name"]
	}
	if data["email"] != "" {
		// Check if email is already taken by a different user
		var existingUser models.User
		if err := database.DB.Where("email = ? AND id != ?", data["email"], id).First(&existingUser).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Email is already in use",
			})
		}
		user.Email = data["email"]
	}
	if data["department"] != "" {
		user.Department = data["department"]
	}
	if data["role"] != "" {
		user.Role = data["role"]
	}

	// Update password if provided
	if data["password"] != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data["password"]), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to hash password",
			})
		}
		user.Password = hashedPassword
	}

	// Save updated user
	result := database.DB.Save(&user)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user: " + result.Error.Error(),
		})
	}

	// Check if any rows were affected
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "No changes were made to the user",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "User updated successfully",
		"user": fiber.Map{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"role":       user.Role,
			"department": user.Department,
		},
	})
}

// DeleteUser deletes a user by ID (admin only)
func DeleteUser(c *fiber.Ctx) error {
	fmt.Println("Admin request - DeleteUser")

	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Admin access required",
		})
	}

	// Get user ID from URL parameter
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User ID is required",
		})
	}

	// Check if the user is trying to delete themselves
	userID := utils.GetUserIdFromToken(c)
	if strconv.Itoa(int(userID)) == id {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "You cannot delete your own account",
		})
	}

	// Verify the user exists first
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Delete the user
	result := database.DB.Delete(&user)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user: " + result.Error.Error(),
		})
	}

	// Check if any rows were affected
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "No user was deleted",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "User deleted successfully",
	})
}

// GetUserByID gets a user by ID (admin only)
func GetUserByID(c *fiber.Ctx) error {
	fmt.Println("Admin request - GetUserByID")

	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Admin access required",
		})
	}

	// Get user ID from URL parameter
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User ID is required",
		})
	}

	// Get user from database
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(user)
}
