import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google OAuth authentication route
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    prompt: 'select_account consent' 
  })
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
    
    // For development, redirect to localhost:3001
    // Determine frontend URL based on environment
    const frontendUrl = process.env.FRONTEND_URL || 
      (process.env.NODE_ENV === 'production' ? 'https://favefrontend.onrender.com' : 'http://localhost:3001');
    
    // Redirect to frontend application
    res.redirect(`${frontendUrl}/auth/success?user=${encodeURIComponent(JSON.stringify(userData))}`);
  }
);

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) { return next(err); }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

export default router;