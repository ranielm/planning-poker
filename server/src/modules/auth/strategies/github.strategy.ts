import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID') || 'not-configured',
      clientSecret: configService.get('GITHUB_CLIENT_SECRET') || 'not-configured',
      callbackURL: configService.get('GITHUB_CALLBACK_URL') || 'http://localhost:3001/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ) {
    const { id, username, displayName, photos, emails } = profile;

    const user = {
      providerId: id,
      provider: 'github',
      email: emails?.[0]?.value || `${username}@github.local`,
      displayName: displayName || username || 'GitHub User',
      avatarUrl: photos?.[0]?.value,
    };

    done(null, user);
  }
}
