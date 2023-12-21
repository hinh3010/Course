import { ClientSession } from 'mongoose';
import { Connection } from 'src/models';

type OperationCallback = (session: ClientSession) => Promise<any>;

export const withTransaction = async (operations: OperationCallback) => {
  const session = await Connection.startSession();
  session.startTransaction();

  try {
    const result = await operations(session);
    await session.commitTransaction();

    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
};
