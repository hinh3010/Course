export interface IAccount {
  accountId: string
  displayName: string
  email: string
  password: string
  phoneNumber: string

  roles: ['user', 'admin', 'super_admin', 'mentor']
  accountType: 'account' | 'facebook' | 'google'
  status: 'active' | 'banned'
  avatarUrl: string
  coverImageUrl: string
}
