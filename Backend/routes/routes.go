package routes

import (
	"JWT-Authentication-go/controllers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Public routes
	app.Get("/", controllers.Hello)
	app.Post("/api/register", controllers.Register)
	app.Post("/api/login", controllers.Login)
	app.Get("/api/debug/auth", controllers.DebugAuth)
	app.Post("/api/create-admin", controllers.CreateAdmin)
	app.Get("/api/debug/admin", controllers.DebugAdmin)
	app.Get("/api/ping", controllers.Ping)

	// User routes (require authentication)
	app.Get("/api/user", controllers.User)
	app.Post("/api/logout", controllers.Logout)
	app.Put("/api/user/profile", controllers.UpdateProfile)
	app.Get("/api/user/drive", controllers.FindDriveUrlForUser)

	// Admin routes
	app.Get("/api/admin/users", controllers.GetAllUsers)
	app.Get("/api/admin/users/:id", controllers.GetUserByID)
	app.Put("/api/admin/users/:id", controllers.UpdateUser)
	app.Delete("/api/admin/users/:id", controllers.DeleteUser)
	app.Get("/api/admin/domains", controllers.GetDomainMappings)
	app.Post("/api/admin/domains", controllers.CreateDomainMapping)
	app.Put("/api/admin/domains/:id", controllers.UpdateDomainMapping)
	app.Delete("/api/admin/domains/:id", controllers.DeleteDomainMapping)
	app.Get("/api/admin/default-mapping", controllers.GetDefaultMapping)
	app.Put("/api/admin/default-mapping", controllers.UpdateDefaultMapping)

	// Admin user creation
	app.Post("/api/admin/update-role", controllers.UpdateUserRole)
}
