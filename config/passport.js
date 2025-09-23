import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import Artist from '../data/models/Artist.js';
import Fan from '../data/models/Fan.js';
import Role from '../enum/Role.js';
import Status from '../enum/Status.js'; // Import Status enum
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

passport.use(new GoogleStrategy.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Check if user exists in either Artist or Fan collection
      let user = await Artist.findOne({ 'profile.email': profile.emails[0].value });
      
      if (!user) {
        user = await Fan.findOne({ 'profile.email': profile.emails[0].value });
      }
      
      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      } else {
        // Create new user - default to Artist role
        const keypair = new Ed25519Keypair();
        const suiAddress = keypair.getPublicKey().toSuiAddress();
        
        const newUser = new Artist({
          authProviderId: profile.id,
          providerId: profile.id,
          provider: 'google',
          profile: { 
            name: profile.displayName, 
            email: profile.emails[0].value, 
            picture: profile.photos[0].value 
          },
          role: Role.ARTIST,
          distributorLink: '',
          nin: undefined, // Set to undefined instead of empty string to avoid duplicate key error
          isVerified: false,
          verificationStatus: Status.PENDING, // Use the enum value instead of string
          suiAddress,
          suiPrivateKey: keypair.getSecretKey().toString('base64'),
          createdAt: new Date(),
          lastLogin: new Date()
        });
        
        await newUser.save();
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    let user = await Artist.findById(id);
    if (!user) {
      user = await Fan.findById(id);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;