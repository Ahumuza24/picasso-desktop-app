package controllers

import (
	"JWT-Authentication-go/database"
	"JWT-Authentication-go/models"
	"JWT-Authentication-go/utils"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// No need for local secretKey, using utils.SecretKey instead

// Hello returns a simple "Hello world!!" message
func Hello(c *fiber.Ctx) error {
	return c.SendString("Hello world!!")
}

// SignUp is a function to register a new user
func Register(c *fiber.Ctx) error {
	fmt.Println("Received a registration request")
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	fmt.Println("User name: ", data["name"], "email", data["email"])

	// Check if the email already exists
	var existingUser models.User
	if err := database.DB.Where("email = ?", data["email"]).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email already exists",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data["password"]), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	fmt.Println("Creating User...")
	user := &models.User{
		Name:       data["name"],
		Email:      data["email"],
		Password:   hashedPassword,
		Role:       "user", // Default role
		Department: data["department"],
		CreatedAt:  time.Now().Unix(),
		LastLogin:  time.Now().Unix(),
	}
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	fmt.Println("User registered successfully")
	return c.JSON(fiber.Map{
		"message": "User registered successfully",
	})
}

func Login(c *fiber.Ctx) error {
	fmt.Println("Received a Login request")

	// Parse request body
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	fmt.Println("User email", data)

	// Check if user exists
	var user models.User
	database.DB.Where("email = ?", data["email"]).First(&user)
	if user.ID == 0 {
		fmt.Println("User not found")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid credentials",
		})
	}

	// Compare passwords
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data["password"]))
	if err != nil {
		fmt.Println("Invalid Password:", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid credentials",
		})
	}

	// Update last login time
	user.LastLogin = time.Now().Unix()
	database.DB.Save(&user)

	fmt.Println("Generating JWT token")
	// Generate JWT token
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": strconv.Itoa(int(user.ID)),
		"exp": time.Now().Add(time.Hour * 24).Unix(), // Expires in 24 hours
	})
	token, err := claims.SignedString([]byte(utils.SecretKey))
	if err != nil {
		fmt.Println("Error generating token:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	fmt.Println("Setting cookie")

	// Set JWT token in cookie
	cookie := fiber.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  time.Now().Add(time.Hour * 24), // Expires in 24 hours
		HTTPOnly: true,
		SameSite: "Lax",
		Path:     "/",
	}
	c.Cookie(&cookie)

	fmt.Println("Authentication successful, returning")
	// Authentication successful, return success response with user info
	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"message": "Login successful",
		"user": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// UpdateProfile updates the current user's profile
func UpdateProfile(c *fiber.Ctx) error {
	fmt.Println("Received a profile update request")

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
	id, _ := strconv.Atoi((*claims)["sub"].(string))

	// Parse request body
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	// Get user from database
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
	if data["department"] != "" {
		user.Department = data["department"]
	}

	// Only admins can update roles
	if data["role"] != "" {
		// Check if current user is admin
		if user.Role == "admin" {
			user.Role = data["role"]
		} else {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Only admins can update roles",
			})
		}
	}

	// Update password if provided
	if data["password"] != "" && data["password_confirm"] != "" {
		if data["password"] != data["password_confirm"] {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Passwords do not match",
			})
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data["password"]), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to hash password",
			})
		}
		user.Password = hashedPassword
	}

	// Save updated user
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Profile updated successfully",
	})
}

// GetAllUsers returns all users (admin only)
func GetAllUsers(c *fiber.Ctx) error {
	fmt.Println("Admin request - GetAllUsers")

	// Check if user is admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Admin access required",
		})
	}

	var users []models.User
	database.DB.Find(&users)

	return c.JSON(users)
}

func User(c *fiber.Ctx) error {
	fmt.Println("Request to get user...")

	// Retrieve JWT token from cookie
	cookie := c.Cookies("jwt")

	// Parse JWT token with claims
	token, err := jwt.ParseWithClaims(cookie, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(utils.SecretKey), nil
	})

	// Handle token parsing errors
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Extract claims from token
	claims, ok := token.Claims.(*jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse claims",
		})
	}

	// Extract user ID from claims
	userID := utils.GetUintFromClaims(claims, "sub")
	var user models.User

	// Query user from database using ID
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	fmt.Println("Found user:", user.Name, "with role:", user.Role)

	// Return user details as JSON response
	return c.JSON(user)
}

func Logout(c *fiber.Ctx) error {
	fmt.Println("Received a logout request")

	// Clear JWT token by setting an empty value and expired time in the cookie
	cookie := fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour), // Expired 1 hour ago
		HTTPOnly: true,
		Secure:   true,
	}
	c.Cookie(&cookie)

	// Return success response indicating logout was successful
	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"message": "Logout successful",
	})
}

// UpdateUserRole updates a user's role (for admin creation)
func UpdateUserRole(c *fiber.Ctx) error {
	// Check if the current user is an admin
	if !utils.IsAdmin(c) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Admin access required",
		})
	}

	// Parse request body
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	// Check if the email exists
	var user models.User
	if err := database.DB.Where("email = ?", data["email"]).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Update the user role
	user.Role = data["role"]
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user role",
		})
	}

	return c.JSON(fiber.Map{
		"message": "User role updated successfully",
		"user": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// DebugAuth is a function to check authentication status and cookie values
func DebugAuth(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")

	fmt.Println("Debug - JWT cookie:", len(cookie) > 0)

	if len(cookie) == 0 {
		return c.JSON(fiber.Map{
			"status":  "no_cookie",
			"message": "No JWT cookie found",
		})
	}

	// Try to parse the token
	token, err := jwt.ParseWithClaims(cookie, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(utils.SecretKey), nil
	})

	if err != nil {
		return c.JSON(fiber.Map{
			"status": "invalid_token",
			"error":  err.Error(),
		})
	}

	// Extract claims
	claims, ok := token.Claims.(*jwt.MapClaims)
	if !ok {
		return c.JSON(fiber.Map{
			"status":  "invalid_claims",
			"message": "Failed to parse claims",
		})
	}

	// Get user ID
	userID := utils.GetUintFromClaims(claims, "sub")

	// Find user
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.JSON(fiber.Map{
			"status": "user_not_found",
			"userId": userID,
			"error":  err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "authenticated",
		"user": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// CreateAdmin creates a new admin user (for testing purposes)
func CreateAdmin(c *fiber.Ctx) error {
	// Parse request
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	// Check if all fields are provided
	if data["name"] == "" || data["email"] == "" || data["password"] == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Please provide name, email, and password",
		})
	}

	// Check if user already exists
	var user models.User
	database.DB.Where("email = ?", data["email"]).First(&user)
	if user.ID != 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email already exists",
		})
	}

	// Hash password
	password, err := bcrypt.GenerateFromPassword([]byte(data["password"]), 14)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Create new admin user
	user = models.User{
		Name:      data["name"],
		Email:     data["email"],
		Password:  password,
		Role:      "admin",
		CreatedAt: time.Now().Unix(),
	}

	// Add department if provided
	if data["department"] != "" {
		user.Department = data["department"]
	}

	database.DB.Create(&user)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Admin user created successfully",
	})
}

// DebugAdmin checks if the current user is an admin and provides debug info
func DebugAdmin(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")

	if len(cookie) == 0 {
		return c.JSON(fiber.Map{
			"status":   "error",
			"message":  "No JWT cookie found",
			"is_admin": false,
		})
	}

	token, err := jwt.ParseWithClaims(cookie, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(utils.SecretKey), nil
	})

	if err != nil {
		return c.JSON(fiber.Map{
			"status":        "error",
			"message":       "JWT parsing error: " + err.Error(),
			"is_admin":      false,
			"cookie_length": len(cookie),
		})
	}

	claims := token.Claims.(*jwt.MapClaims)
	userID := utils.GetUintFromClaims(claims, "sub")

	var user models.User
	dbResult := database.DB.Where("id = ?", userID).First(&user)

	if dbResult.Error != nil {
		return c.JSON(fiber.Map{
			"status":   "error",
			"message":  "Error finding user: " + dbResult.Error.Error(),
			"is_admin": false,
			"user_id":  userID,
		})
	}

	return c.JSON(fiber.Map{
		"status":        "success",
		"message":       "User found",
		"is_admin":      user.Role == "admin",
		"user_id":       userID,
		"user_email":    user.Email,
		"user_role":     user.Role,
		"cookie_length": len(cookie),
	})
}

// Ping is a simple endpoint to check if the server is running
func Ping(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":    "success",
		"message":   "Server is running",
		"timestamp": time.Now().Unix(),
	})
}
