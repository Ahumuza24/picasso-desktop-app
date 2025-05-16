package main

import (
	"JWT-Authentication-go/database"
	"JWT-Authentication-go/routes"
	"flag"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Parse command line flags
	port := flag.String("port", "8081", "Port to run the server on")
	disableCors := flag.Bool("disable-cors", false, "Disable CORS (useful for desktop app)")
	flag.Parse()

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

	// Configure CORS
	if !*disableCors {
		log.Println("CORS enabled with specific origins")
		app.Use(cors.New(cors.Config{
			AllowOrigins:     "http://localhost:3000,http://localhost:1420,http://127.0.0.1:1420,http://127.0.0.1:8080,http://localhost:8080",
			AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
			AllowMethods:     "GET, POST, PUT, DELETE",
			AllowCredentials: true,
		}))
	} else {
		// When CORS is disabled, set a simple header to allow all origins
		log.Println("CORS disabled - running in desktop mode")
		app.Use(func(c *fiber.Ctx) error {
			c.Set("Access-Control-Allow-Origin", c.Get("Origin"))
			c.Set("Access-Control-Allow-Credentials", "true")
			c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
			c.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")

			// Handle preflight OPTIONS request
			if c.Method() == "OPTIONS" {
				return c.SendStatus(fiber.StatusNoContent)
			}

			return c.Next()
		})
	}

	// Add a health check endpoint
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// Setup routes
	routes.SetupRoutes(app)

	// Start server
	log.Printf("Server started on port %s", *port)
	log.Fatal(app.Listen(":" + *port))
}
