import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, OAuthUserDto } from './dto/auth.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  displayName: string;
}

export interface TokenResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
      },
    });

    return this.generateTokenResponse(user);
  }

  async login(dto: LoginDto): Promise<TokenResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokenResponse(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async handleOAuthLogin(oauthUser: OAuthUserDto): Promise<TokenResponse> {
    let user = await this.prisma.user.findFirst({
      where: {
        oauthProvider: oauthUser.provider,
        oauthId: oauthUser.providerId,
      },
    });

    if (!user) {
      // Check if user exists with same email
      const existingUser = await this.prisma.user.findUnique({
        where: { email: oauthUser.email },
      });

      if (existingUser) {
        // Link OAuth to existing account
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            oauthProvider: oauthUser.provider,
            oauthId: oauthUser.providerId,
            avatarUrl: existingUser.avatarUrl || oauthUser.avatarUrl,
          },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email: oauthUser.email,
            displayName: oauthUser.displayName,
            avatarUrl: oauthUser.avatarUrl,
            oauthProvider: oauthUser.provider,
            oauthId: oauthUser.providerId,
          },
        });
      }
    }

    return this.generateTokenResponse(user);
  }

  async createSession(userId: string, token: string, userAgent?: string, ipAddress?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return this.prisma.session.create({
      data: {
        userId,
        token,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });
  }

  async validateSession(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  }

  async revokeSession(token: string) {
    await this.prisma.session.delete({
      where: { token },
    }).catch(() => null);
  }

  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  private generateTokenResponse(user: { id: string; email: string; displayName: string; avatarUrl?: string | null }): TokenResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl || undefined,
      },
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
