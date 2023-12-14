import { IAccount } from '@hellocacbantre/schema';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GetAccountContext } from 'src/decorators/getAccountContext';
import { RolesGuard } from 'src/middlewares/authenticate';
import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgetPasswordDto, LoginDto, LogoutDto, RefreshTokenDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('')
  @UseGuards(new RolesGuard())
  async root(@GetAccountContext() accountContext: IAccount) {
    return this.authService.root(accountContext);
  }

  @Post('register')
  createAccount(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  logout(@Body() logoutDto: LogoutDto) {
    return logoutDto;
  }

  @Post('/refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('change-password')
  @UseGuards(new RolesGuard())
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }

  @Post('forget-password')
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
