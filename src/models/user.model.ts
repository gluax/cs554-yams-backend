import { Document, model, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import uuidv4 from 'uuid/v4';
import passportLocalMongoose from 'passport-local-mongoose';

export interface IUser extends Document {
  _id: string,
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
}

export interface IUserModel extends Model<IUser> {
  newUser(newUser: IUser, callback: (err: Error, user: IUser) => void): Promise<any>
  updateUser(id: any, updates: any, callback: (err: Error, user: IUser) => void): Promise<any>
}

const UserSchema: Schema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  firstName: {
    type: String,
    default: '',
    required: true
  },
  lastName: {
    type: String,
    default: '',
    required: true
  },
  username: {
    type: String,
    default: '',
    required: true,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    default: '',
    required: true,
    unique: true,
    lowercase: true
  },
   password: {
    type: String,
    default: '',
    required: true
  },
  //in future need to subnest chats model
});

UserSchema.plugin(passportLocalMongoose);

UserSchema.static('newUser', async (newUser: IUser, callback: (err: Error, user: IUser) => void): Promise<any> => {
  bcrypt.genSalt(10, async (err: Error | null, salt: string) => {
    bcrypt.hash(newUser.password, salt, async (err: Error | null, hash: string) => {
      newUser.password = hash;
      await newUser.save(callback);
    });
  });
});

UserSchema.static('getUserByUsername', (username: string, callback: Function) => {
  User.findOne({username: username}, callback);
});

UserSchema.static('getUserById', (id: string, callback: Function) => {
  User.findById(id, callback);
});

UserSchema.static('comparePassword', (possiblePass: string, hash: string, callback: Function) => {
  bcrypt.compare(possiblePass, hash,  (err: Error | null, match: boolean) => {
    if(err) throw err;
    callback(null, match);
  });
});

UserSchema.static('updateUser', async (id: any, updates: any, callback: (err: Error, user: IUser) => void) => {
  if(updates.password) {
    await bcrypt.genSalt(10, async (err: Error | null, salt: string) => {
      await bcrypt.hash(updates.password, salt, async (err: Error | null, hash: string | number) => {
        updates.password = hash;
        await User.findOneAndUpdate(
          { _id: id },
          {
            $set: updates
          },
          { new: true },
          callback
        );
      });
    });
  } else {
    await User.findOneAndUpdate(
      { _id: id },
      {
        $set: updates
      },
      { new: true },
      callback
    );
  }

});

const User = model<IUser>('User', UserSchema) as IUserModel;

export default User;