import { IAccount } from '@hellocacbantre/schema';
import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/middlewares/authenticate';
import { GetAccountContext } from '../../decorators/getAccountContext';
import { UpdateMeDto, UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(new RolesGuard())
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(new RolesGuard())
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('account/:accountId')
  @UseGuards(new RolesGuard())
  findByAccountId(@Param('accountId') accountId: string) {
    return this.usersService.findByAccountId(accountId);
  }

  @Patch('me')
  @UseGuards(new RolesGuard())
  updateMe(@Body() updateMeDto: UpdateMeDto, @GetAccountContext() accountContext: IAccount) {
    return this.usersService.updateMe(accountContext, updateMeDto);
  }

  @Get('me')
  @UseGuards(new RolesGuard())
  getMe(@GetAccountContext() accountContext: IAccount) {
    return accountContext;
  }

  @Patch(':id')
  @UseGuards(new RolesGuard())
  updateUserById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserById(id, updateUserDto);
  }
}
