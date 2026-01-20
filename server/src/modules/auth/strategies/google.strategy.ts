import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID') || 'not-configured',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || 'not-configured',
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  authorizationParams(): { [key: string]: string } {
    return {
      hl: 'en',
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, displayName, emails, photos } = profile;

    const user = {
      providerId: id,
      provider: 'google',
      email: emails?.[0]?.value,
      displayName: displayName || 'Google User',
      avatarUrl: photos?.[0]?.value,
    };

    done(null, user);
  }
}
