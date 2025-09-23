# FaveBackend
Fave is a platform where music creatives tokenize their projects (like music albums) and fans invest by buying tokens to earn future royalties. The platform uses React + Typescript for the frontend, Node.js (Express) + MongoDB for the backend, and Sui Move for smart contracts

## Deployment to Render

### Environment Variables
You need to set these environment variables in your Render dashboard:

**Backend Environment Variables:**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
PORT=3000
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
GOOGLE_CALLBACK_URL=https://your-backend-service.onrender.com/auth/google/callback (optional)
FRONTEND_URL=https://your-frontend-service.onrender.com
ADMIN_EMAIL=admin@fave.com
ADMIN_FIRSTNAME=Fave
ADMIN_LASTNAME=Admin
NODE_ENV=production
```

**Frontend Environment Variables:**
```
PORT=3001
NODE_ENV=production
```

### Render Configuration
1. Connect your GitHub repository to Render
2. The render.yaml file will automatically configure both services

### Google OAuth Setup (Optional)
If you want to use Google OAuth:
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set Authorized redirect URIs to: `https://your-backend-service.onrender.com/auth/google/callback`
4. Add the client ID and secret to your Render environment variables

### Common Issues
- **502 Bad Gateway**: Usually caused by missing environment variables or MongoDB connection issues
- **CORS errors**: Make sure your frontend URL is in the allowedOrigins array
- **Google OAuth not working**: Check that GOOGLE_CALLBACK_URL matches exactly with what's set in Google Cloud Console

### Local Development
For detailed instructions on setting up and running both the backend and frontend on localhost, please refer to [README.local.md](README.local.md).

Quick Start:
1. Clone the repository
2. Run `npm install`
3. Create a `.env` file with your environment variables (see README.local.md for required variables)
4. Run `npm start` to start the backend server
5. In a separate terminal, navigate to the frontend directory and run `npm start` to start the frontend server