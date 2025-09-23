import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {

    const userData = {
      id: req.user._id,
      name: req.user.profile.name,
      email: req.user.profile.email,
      role: req.user.role,
      suiAddress: req.user.suiAddress
    };

    res.redirect(`http://localhost:3001/auth/success?user=${encodeURIComponent(JSON.stringify(userData))}`);
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;