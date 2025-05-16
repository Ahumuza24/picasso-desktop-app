# Admin User Creation Guide

There are three ways to create an admin user in the Picasso Design Agency application:

## 1. Using the Admin Web Interface

If you already have an admin user account, you can use the admin web interface to promote other users to admin:

1. Log in with your existing admin credentials
2. Navigate to the Admin Panel (accessible from the navigation bar when logged in as admin)
3. Under the "Create Admin User" section, enter the email of an existing user
4. Select "admin" from the role dropdown
5. Click "Update Role"

## 2. Using the Command-line Tool

For first-time setup or when you don't have an admin account yet, you can use the provided command-line tool:

1. First, make sure you have registered a user account through the web interface
2. Navigate to the project root directory in your terminal
3. Run the following command:

```bash
go run Backend/cmd/admin/create_admin.go -email=your-email@example.com
```

Replace `your-email@example.com` with the email of the user you want to promote to admin.

## 3. Using Direct Database Update

If the above methods don't work, you can directly update the database:

1. Access your MySQL database using a client like MySQL Workbench or command line
2. Connect to your database (default is "picasso")
3. Execute the following SQL command:

```sql
USE picasso;
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with the email of the user you want to promote to admin.

4. Verify the update with:

```sql
SELECT id, name, email, role FROM users WHERE email = 'your-email@example.com';
```

## Important Notes

- Admin users have access to all user data and domain mappings
- Create admin accounts only for trusted users
- The system does not allow removing the admin role from the last admin user to prevent lockout
- Admin role changes take effect immediately (no logout required) 