import mongoose, { type Connection } from 'mongoose';

const MONGO_URI = 'mongodb+srv://hello:hellocacbantre@cluster.s4zdbqr.mongodb.net/?retryWrites=true&w=majority';

console.log({ MONGO_URI });
interface MyConnection extends Connection {
  name: string;
}
function createConnectMongo(): Connection {
  const mongodb = mongoose.createConnection(MONGO_URI, {
    ssl: true,
    tlsAllowInvalidCertificates: true,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
    autoCreate: true,
    heartbeatFrequencyMS: 60000,
    autoIndex: true,
    retryWrites: true,
    w: 'majority',
    dbName: 'platform',
    maxPoolSize: 10,
    maxConnecting: 10,
    maxIdleTimeMS: 60000,
    waitQueueTimeoutMS: 10000,
  });

  mongodb.on('connected', function (this: MyConnection) {
    console.log(`[MongoDb:::] connected ${this.name}.db!!`);
  });
  mongodb.on('connecting', function (this: MyConnection) {
    console.log(`[MongoDb:::] connecting ${this.name}.db!!`);
  });
  mongodb.on('disconnected', function (this: MyConnection) {
    console.log(`[MongoDb:::] disconnected ${this.name}.db!!`);
  });
  mongodb.on('reconnected', function (this: MyConnection) {
    console.log(`[MongoDb:::] reconnected ${this.name}.db!!`);
  });
  mongodb.on('error', function (this: MyConnection, err) {
    console.log(`[MongoDb:::] Failed to connect ${this.name}.db!! ${err.message}`);
  });

  return mongodb;
}

export const mongoConnection = createConnectMongo();
