import { Injectable } from '@nestjs/common';
import * as Jwt from 'jsonwebtoken';
import { JwtPayload, SignOptions } from 'jsonwebtoken';

interface IPayload extends JwtPayload {
  id: string;
}

@Injectable()
export class JwtService {
  private readonly accessTokenSecret: Jwt.Secret = 'Env.ACCESS_TOKEN';
  private readonly refreshTokenSecret: Jwt.Secret = 'Env.REFRESH_TOKEN';
  private readonly refreshTokenExpires = '3d';
  private readonly accessTokenExpires = '7d';

  async generateToken(payload: IPayload, type?: 'accessToken' | 'refreshToken') {
    let secret = this.accessTokenSecret;
    let expires = this.accessTokenExpires;

    if (type === 'refreshToken') {
      secret = this.refreshTokenSecret;
      expires = this.refreshTokenExpires;
    }

    const options: SignOptions = {
      expiresIn: expires,
      algorithm: 'HS256',
      subject: 'authentication',
    };

    try {
      return Jwt.sign(payload, secret, options);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  verifyToken(token: string, type?: 'accessToken' | 'refreshToken'): IPayload {
    const secret = type === 'refreshToken' ? this.refreshTokenSecret : this.accessTokenSecret;
    return Jwt.verify(token, secret) as IPayload;
  }
}
