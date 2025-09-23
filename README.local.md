# Local Development Setup

This guide explains how to run the Fave Backend and Frontend on localhost for development.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on default port 27017)
- Google Cloud Console project with OAuth credentials

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/fave_dev
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3001

# Node Environment
NODE_ENV=development
```

Replace `your_jwt_secret_key_here`, `your_google_client_id_here`, and `your_google_client_secret_here` with your actual values.

## Running the Backend

1. Open a terminal in the project root directory
2. Install dependencies: `npm install`
3. Start the backend server: `npm start`
4. The backend will be available at `http://localhost:3000`

## Running the Frontend

1. Open a new terminal
2. Navigate to the frontend directory: `cd frontend`
3. Install dependencies (if not already installed): `npm install`
4. Start the frontend server: `npm start`
5. The frontend will be available at `http://localhost:3001`

## Google OAuth Configuration

For Google OAuth to work in local development:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add the following authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
6. Save the changes

## Testing the Application

1. Open your browser and navigate to `http://localhost:3001`
2. Click the login button to initiate Google OAuth
3. After successful authentication, you should be redirected back to the frontend with your user data

## Troubleshooting

### 500 Internal Server Error
If you encounter a "500. That's an error" message:

1. **Check your environment variables**:
   - Ensure your `.env` file has valid values for:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `JWT_SECRET`
   - These should not contain "your_..." placeholder values

2. **Verify Google OAuth configuration**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Credentials"
   - Edit your OAuth 2.0 Client ID
   - Confirm that `http://localhost:3000/auth/google/callback` is listed under "Authorized redirect URIs"
   - Ensure the client ID and secret in your .env file match what's shown in the console

3. **Check MongoDB connection**:
   - Verify MongoDB is running on your machine
   - Check that the MONGO_URI in your .env file points to a valid MongoDB instance
   - The default value `mongodb://localhost:27017/fave_dev` assumes MongoDB is running on the default port (27017)

4. **Review server logs**:
   - Check the terminal where you started the backend for any error messages
   - Look for specific error details that can help identify the root cause

### Other Common Issues

- **CORS errors**: Ensure that `http://localhost:3001` is in the allowed origins in server.js
- **Connection refused**: Make sure the backend server is running before attempting to access it
- **Page not found**: Verify you're accessing the correct URL (`http://localhost:3001` for frontend, `http://localhost:3000` for backend API)