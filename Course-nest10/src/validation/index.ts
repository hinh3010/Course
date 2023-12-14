import { registerDecorator, ValidationOptions } from 'class-validator';
import mongoose from 'mongoose';

export function IsArrayMongoIds(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isArrayMongoIds',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value)) {
            return false;
          }
          for (const item of value) {
            if (!mongoose.Types.ObjectId.isValid(item)) {
              return false;
            }
          }
          return true;
        },
      },
    });
  };
}

export function IsMongoId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMongoId',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return mongoose.Types.ObjectId.isValid(value);
        },
      },
    });
  };
}
