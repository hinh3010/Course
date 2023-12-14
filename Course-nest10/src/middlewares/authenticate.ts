import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getModel } from 'src/libs/getDb';
import { IAccountDocument } from 'src/types';
import { JwtService } from './jwt';

type Role = 'user' | 'admin' | 'super_admin' | 'mentor';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly jwtService: JwtService;
  constructor(private readonly rolesGuard?: Role[] | Role) {
    this.jwtService = new JwtService();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const decoded = this.jwtService.verifyToken(token);

      const Account = getModel<IAccountDocument>('Account');
      const account = await Account.findById(decoded.id).lean();

      if (!account) {
        throw new HttpException('Your account has not been activated', HttpStatus.FORBIDDEN);
      }

      if (account.status !== 'active') {
        throw new HttpException('Your account has not been activated', HttpStatus.FORBIDDEN);
      }

      const { roles = [] } = account;
      const rolesGuards = !this.rolesGuard ? ['user'] : typeof this.rolesGuard === 'string' ? [this.rolesGuard] : this.rolesGuard;

      const isAccess = roles.some((role) => rolesGuards.includes(role));
      if (!isAccess) {
        throw new HttpException('You do not have permission', HttpStatus.FORBIDDEN);
      }

      delete account.password;
      request.user = account;
      return true;
    } catch (error: any) {
      if (error.status) {
        throw new HttpException(error.message, HttpStatus.BAD_GATEWAY);
      } else {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    }
  }
}
