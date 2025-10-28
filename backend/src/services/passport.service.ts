import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
  VerifyCallback,
} from 'passport-google-oauth20';
import * as authService from '../api/auth/auth.service';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth environment variables');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback', // Must match your route and Google Console setup
      passReqToCallback: false, // We don't need the `req` object in the verify function
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: VerifyCallback,
    ) => {
      try {
        // This is the core logic: find or create a user based on the Google profile
        const user = await authService.findOrCreateUserFromProvider(profile);
        
        // Pass the user to passport. `null` for error.
        done(null, user);
      } catch (error: any) {
        // Pass the error to passport
        done(error, false);
      }
    },
  ),
);
