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
    
    // In a real application, you would typically generate a JWT token here
    // For now, we'll redirect with user data in query parameters
    // Note: In production, use a more secure method to pass user data
    res.redirect(`http://localhost:5173/auth/success?user=${encodeURIComponent(JSON.stringify(userData))}`);
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;