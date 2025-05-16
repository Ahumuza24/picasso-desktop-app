# Picasso Design Agency Application

A desktop application that authenticates users, detects email domains, and redirects users to specific Google Drive folders based on domain mappings.

## Features

- User authentication with JWT
- User registration and profile management
- Email domain detection and mapping to Google Drive folders
- Admin panel for managing domain mappings
- Secure password handling
- Role-based access control

## Technology Stack

### Backend
- Go (Golang)
- Gorilla Mux for routing
- GORM for database operations
- JWT for authentication
- MySQL database

### Frontend
- React.js
- React Router for navigation
- Bootstrap for UI components
- Axios for API communication

## Installation

### Prerequisites
- Go 1.16+
- Node.js 14+
- MySQL 8.0+

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/picasso-design-agency.git
   cd picasso-design-agency
   ```

2. Set up the database:
   ```
   # Create a MySQL database named 'picasso'
   # Update the database connection details in Backend/database/connection.go if needed
   ```

3. Install dependencies and run the backend:
   ```
   cd Backend
   go mod tidy
   go run main.go
   ```
   
   The backend server will start on http://localhost:8000

### Frontend Setup

1. Install dependencies:
   ```
   cd Frontend
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```
   
   The frontend will be available at http://localhost:3000

## Usage

### User Features
1. Register a new account using your email
2. Log in to your account
3. Access your Google Drive folder based on your email domain
4. Update your profile information
5. Change your password

### Admin Features
1. Manage domain-to-folder mappings
2. Update the default folder for unrecognized domains
3. View and manage user accounts

## Creating an Admin User

To create an admin user, use the following MySQL command:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Building for Production

### Backend
```
cd Backend
go build -o picasso-design-agency
```

### Frontend
```
cd Frontend
npm run build
```

## License
MIT
