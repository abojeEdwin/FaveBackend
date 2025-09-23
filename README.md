# FaveBackend
Fave is a platform where music creatives tokenize their projects (like music albums) and fans invest by buying tokens to earn future royalties. The platform uses React + Typescript for the frontend, Node.js (Express) + MongoDB for the backend, and Sui Move for smart contracts

## Deployment to Render

### Environment Variables
You need to set these environment variables in your Render dashboard:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
PORT=3000
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
GOOGLE_CALLBACK_URL=https://favebackend.onrender.com/auth/google/callback (optional)
NODE_ENV=production
```

### Render Configuration
1. Connect your GitHub repository to Render
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Set Auto-Deploy to "Yes"

### Google OAuth Setup (Optional)
If you want to use Google OAuth:
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set Authorized redirect URIs to: `https://favebackend.onrender.com/auth/google/callback`
4. Add the client ID and secret to your Render environment variables

### Common Issues
- **502 Bad Gateway**: Usually caused by missing environment variables or MongoDB connection issues
- **CORS errors**: Make sure your frontend URL is in the allowedOrigins array
- **Google OAuth not working**: Check that GOOGLE_CALLBACK_URL matches exactly with what's set in Google Cloud Console

### Local Development
1. Clone the repository
2. Run `npm install`
3. Create a `.env` file with your environment variables
4. Run `npm start`