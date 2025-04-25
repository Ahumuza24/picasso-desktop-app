package main

import (
	"JWT-Authentication-go/database"
	"JWT-Authentication-go/routes"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Ensure database handle is set
	database.DB = db

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			// Default error handling
			code := fiber.StatusInternalServerError
			message := "Internal Server Error"

			// Check if it's a Fiber error
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
				message = e.Message
			} else {
				message = err.Error()
			}

			// Set Content-Type to application/json
			c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSON)

			// Return JSON error response
			return c.Status(code).JSON(fiber.Map{
				"error": message,
			})
		},
	})

	// Add logger middleware
	app.Use(logger.New(logger.Config{
		Format:     "[${time}] ${status} - ${method} ${path} ${latency}\n",
		TimeFormat: "15:04:05",
		TimeZone:   "Local",
	}))

	// Configure CORS with specific origin
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000", // Specific React frontend origin
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Content-Length,Accept-Language,Accept-Encoding,Connection,Access-Control-Allow-Origin",
		AllowCredentials: true,
		MaxAge:           300,
		ExposeHeaders:    "Set-Cookie",
	}))

	// Setup routes
	routes.SetupRoutes(app)

	// Start server on port 8000
	log.Fatal(app.Listen(":8000"))
}
