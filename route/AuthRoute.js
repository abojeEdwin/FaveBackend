import express from 'express';
import passport from 'passport';
import { generateSessionToken } from '../utils/helper.js';

const router = express.Router();

// Google OAuth authentication route
router.get('/google',
  (req, res, next) => {
    // Store the role in the session before starting the authentication flow
    if (req.query.role) {
      req.session.role = req.query.role;
    }
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login' 
  }),
  (req, res) => {
    // Successful authentication, the user object is already in the session
    const frontendUrl = process.env.RENDER_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
    
    // Generate a session token
    const sessionToken = generateSessionToken(req.user._id);

    // Get the role from the session
    const userRole = req.session.role || 'fan'; // Default to 'fan' if role is not set

    // Clear the role from the session
    delete req.session.role;

    res.redirect(`${frontendUrl}/auth/success?token=${sessionToken}&role=${userRole}`);
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
  });
});

export default router;