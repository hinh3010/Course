import { IAccount } from '@hellocacbantre/schema';
import { Injectable } from '@nestjs/common';
import { getModel } from 'src/libs/getDb';
import { IAccountDocument, IAccountModel } from 'src/types';
import { UpdateMeDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private AccountModel: IAccountModel;

  constructor() {
    this.AccountModel = getModel<IAccountDocument>('Account');
  }

  async findAll() {
    const users = await this.AccountModel.find({ status: 'active' }).select('-password').lean();
    return users;
  }

  async findById(id: string) {
    const user = await this.AccountModel.findOne({ _id: id, status: 'active' }).select('-password').lean();
    return user;
  }

  async findByAccountId(accountId: string) {
    const user = await this.AccountModel.findOne({ accountId, status: 'active' }).select('-password').lean();
    return user;
  }

  async updateMe(accountContext: IAccount, updateUserDto: UpdateMeDto) {
    const { avatarUrl, coverImageUrl, displayName, phoneNumber } = updateUserDto;
    const { accountId } = accountContext;

    const update: UpdateMeDto = {};

    if (avatarUrl !== undefined) {
      update['avatarUrl'] = avatarUrl;
    }

    if (coverImageUrl !== undefined) {
      update['coverImageUrl'] = coverImageUrl;
    }

    if (displayName !== undefined) {
      update['displayName'] = displayName;
    }

    if (phoneNumber !== undefined) {
      update['phoneNumber'] = phoneNumber;
    }

    const user = await this.AccountModel.findOneAndUpdate(
      { accountId, status: 'active' },
      {
        $set: update,
      },
      { new: true },
    )
      .select('-password')
      .lean();
    return user;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    const { roles, status } = updateUserDto;
    const update: UpdateMeDto = {};

    if (status !== undefined) {
      update['status'] = status;
    }

    if (Array.isArray(roles) && roles.length > 0) {
      if (!roles.includes('user')) roles.push('user');

      update['roles'] = roles;
    }

    const user = await this.AccountModel.findOneAndUpdate(
      { _id: id, status: 'active' },
      {
        $set: update,
      },
      { new: true },
    )
      .select('-password')
      .lean();
    return user;
  }
}
