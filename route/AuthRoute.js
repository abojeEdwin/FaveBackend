import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google OAuth authentication route
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend with user data
    const userData = {
      id: req.user._id,
      name: req.user.profile.name,
      email: req.user.profile.email,
      role: req.user.role,
      suiAddress: req.user.suiAddress
    };
    
    // Check if we're in production or development
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://favefrontend.onrender.com' // Update this to your actual frontend URL when deployed
      : 'http://localhost:3001';
    
    // Redirect to frontend application
    res.redirect(`${frontendUrl}/auth/success?user=${encodeURIComponent(JSON.stringify(userData))}`);
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;