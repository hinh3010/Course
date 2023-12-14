import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compareStr } from 'src/libs/compareStr';
import { generateId } from 'src/libs/generateId';
import { getModel } from 'src/libs/getDb';
import { hashStr } from 'src/libs/hashStr';
import { JwtService } from 'src/middlewares/jwt';
import { IAccountDocument, IAccountModel } from 'src/types';
import { ChangePasswordDto, ForgetPasswordDto, LoginDto, LogoutDto, RefreshTokenDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { IAccount } from '@hellocacbantre/schema';

@Injectable()
export class AuthService {
  private AccountModel: IAccountModel;
  private jwtService: JwtService;

  constructor() {
    this.AccountModel = getModel<IAccountDocument>('Account');
    this.jwtService = new JwtService();
  }

  private async _genAccountId(): Promise<string> {
    const accountId = generateId({ prefix: 'A' });
    const existsAccId = await this.AccountModel.exists({ accountId }).lean();

    if (existsAccId) {
      return await this._genAccountId();
    }

    return accountId;
  }

  private async generateTokens(userId: string) {
    const token = await this.jwtService.generateToken({ id: userId });
    const refreshToken = await this.jwtService.generateToken({ id: userId }, 'refreshToken');
    return { token, refreshToken };
  }

  async register(dto: RegisterDto) {
    const { displayName, email, password } = dto;

    const exists = await this.AccountModel.exists({
      email,
      accountType: 'account',
    }).lean();

    if (exists) throw new HttpException(`${email} is already`, HttpStatus.CONFLICT);

    const accountId = await this._genAccountId();
    const hashedPassword = await hashStr(password);

    const accData = {
      displayName,
      email,
      accountId,
      accountType: 'account',
      password: hashedPassword,
    };

    const newAccount = (await this.AccountModel.create(accData)).toObject();
    delete newAccount.password;
    const { refreshToken, token } = await this.generateTokens(newAccount._id.toString());

    return { ...newAccount, refreshToken, token };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const account = await this.AccountModel.findOne({
      email,
      accountType: 'account',
    }).lean();

    if (!account) throw new HttpException(`${email} is not exists`, HttpStatus.CONFLICT);

    const { status, password: hashedPassword, _id, ...rest } = account;

    if (status === 'banned') throw new HttpException('Account banned', HttpStatus.BAD_REQUEST);

    const isCorrectPassword = compareStr(password, hashedPassword);

    if (!isCorrectPassword) throw new HttpException('Password not match', HttpStatus.UNAUTHORIZED);

    const { refreshToken, token } = await this.generateTokens(_id.toString());

    return { ...rest, status, token, refreshToken, _id };
  }

  async logout(dto: LogoutDto) {
    return dto;
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const { refetchToken } = dto;
    const decoded = this.jwtService.verifyToken(refetchToken, 'refreshToken');
    return await this.generateTokens(decoded.id);
  }

  async changePassword(dto: ChangePasswordDto) {
    const { email, oldPassword, newPassword } = dto;

    if (oldPassword === newPassword) throw new HttpException(`Old and new passwords must be different for ${email}`, HttpStatus.BAD_REQUEST);

    const account = await this.AccountModel.findOne({
      email,
      accountType: 'account',
    }).lean();

    if (!account) throw new HttpException(`${email} is not exists`, HttpStatus.CONFLICT);

    const { status, password: hashedPassword } = account;

    if (status === 'banned') throw new HttpException('Account banned', HttpStatus.BAD_REQUEST);

    const isCorrectPassword = compareStr(oldPassword, hashedPassword);

    if (!isCorrectPassword) throw new HttpException('Old password not match', HttpStatus.UNAUTHORIZED);

    const hashedNewPassword = await hashStr(newPassword);

    await this.AccountModel.findOneAndUpdate(
      {
        email,
        accountType: 'account',
      },
      {
        password: hashedNewPassword,
      },
    ).lean();

    return true;
  }

  async forgetPassword(dto: ForgetPasswordDto) {
    return {
      success: true,
      message: 'Password change successful',
      dto,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    return {
      success: true,
      message: 'Password change successful',
      dto,
    };
  }

  async root(payload: IAccount) {
    return {
      success: true,
      message: 'auth router',
      data: payload,
    };
  }
}
