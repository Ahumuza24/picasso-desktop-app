# Deployment Guide for Render

This guide explains how to deploy the Picasso Design Agency application on Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Git repository with your code
3. Node.js and Go installed locally for testing

## Backend Deployment

1. Create a new Web Service on Render
2. Connect your Git repository
3. Configure the service:
   - Name: picasso-backend
   - Environment: Go
   - Build Command: `go build -o main`
   - Start Command: `./main`
   - Environment Variables:
     - GO_ENV: production
     - PORT: 8081

4. Click "Create Web Service"

## Frontend Deployment

1. Create a new Web Service on Render
2. Connect your Git repository
3. Configure the service:
   - Name: picasso-frontend
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `serve -s build`
   - Environment Variables:
     - REACT_APP_API_URL: https://picasso-backend.onrender.com

4. Click "Create Web Service"

## Important Notes

1. The backend service must be deployed first
2. Update the REACT_APP_API_URL in the frontend service with your actual backend URL
3. Make sure your backend CORS settings allow requests from your frontend domain
4. The database will be SQLite, which is file-based. For production, consider using a more robust database solution

## Environment Variables

### Backend
- GO_ENV: production
- PORT: 8081

### Frontend
- REACT_APP_API_URL: Your backend service URL

## Troubleshooting

1. If the backend fails to start:
   - Check the logs in Render dashboard
   - Verify all environment variables are set
   - Ensure the build command completes successfully

2. If the frontend fails to build:
   - Check the logs in Render dashboard
   - Verify all dependencies are in package.json
   - Ensure the REACT_APP_API_URL is correct

3. If the frontend can't connect to the backend:
   - Verify CORS settings in the backend
   - Check if the backend URL is correct
   - Ensure the backend service is running

## Security Considerations

1. Update the JWT secret in production
2. Use HTTPS for all communications
3. Implement rate limiting
4. Set up proper CORS policies
5. Use environment variables for sensitive data 