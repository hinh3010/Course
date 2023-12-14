import { schemas } from '@hellocacbantre/schema';
import { type Model } from 'mongoose';
import * as path from 'path';
import { mongoConnection } from '../connections/mongo.db';

export const getModel = <T>(collection: string = ''): Model<T> => {
  const file = path.join(schemas, collection);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Schema = require(file).default;

  if (mongoConnection.models[collection]) {
    return mongoConnection.models[collection] as Model<T>;
  }

  return mongoConnection.model<T>(collection, Schema);
};

export const getConnection = () => mongoConnection;
