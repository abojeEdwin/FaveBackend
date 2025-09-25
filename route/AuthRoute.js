// import express from 'express';
// import { login as artistLogin } from '../controller/ArtistController.js';
// import { login as fanLogin } from '../controller/FanController.js';
//
// const router = express.Router();
//
// router.post('/login', async (req, res) => {
//     try {
//         const { role } = req.body;
//         if (role === 'artist') {
//             await artistLogin(req, res);
//         } else if (role === 'fan') {
//             await fanLogin(req, res);
//         } else {
//             return res.status(400).json({ error: 'Invalid role specified' });
//         }
//     } catch (error) {
//         console.error("Authentication failed:", error);
//         res.status(401).json({ success: false, error: error.message });
//     }
// });
//
// // Logout route
// router.get('/logout', (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error logging out' });
//     }
//     req.session.destroy(() => {
//  res.clearCookie('connect.sid');
//         res.json({ message: 'Logged out successfully' });
//     });
//   });
// });
//
// export default router;