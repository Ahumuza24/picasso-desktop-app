package main

import (
	"JWT-Authentication-go/database"
	"JWT-Authentication-go/routes"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Ensure database handle is set
	database.DB = db

	app := fiber.New()

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
