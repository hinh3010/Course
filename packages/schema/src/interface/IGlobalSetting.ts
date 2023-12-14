import { ObjectId } from 'mongoose'

export type GLOBAL_SETTING_KEY = {
  JWT_ACCESS_TOKEN_SECRET: 'jwt_access_token_secret',
  JWT_REFRESH_TOKEN_SECRET: 'jwt_refresh_token_secret',
  JWT_ACCESS_TOKEN_EXPIRES: 'jwt_access_token_expires',
  JWT_REFRESH_TOKEN_EXPIRES: 'jwt_refresh_token_expires'
}

export interface IGlobalSetting {
  _id: ObjectId
  key: GLOBAL_SETTING_KEY
  value: string
  meta?: any
}
