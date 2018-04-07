import { Document, model, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import uuidv4 from 'uuid/v4';

export interface IUser extends Document {
  _id: string,
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string
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

const User: Model<IUser> = model('User', UserSchema);

export default User;

module.exports.newUser = async (newUser: IUser, callback: any) => {
  bcrypt.genSalt(10, async (err: Error | null, salt: string) => {
    bcrypt.hash(newUser.password, salt, async (err: Error | null, hash: string) => {
      newUser.password = hash;
      await newUser.save(callback);
    });
  });
}

module.exports.getUserByUsername = (username: string, callback) => {
  User.findOne({username: username}, callback);
}

module.exports.getUserById =  (id: string, callback) => {
  User.findById(id, callback);
}

module.exports.comparePassword =  (possiblePass: string, hash: string, callback) => {
  bcrypt.compare(possiblePass, hash,  (err: Error | null, match: boolean) => {
    if(err) throw err;
    callback(null, match);
  });
}

module.exports.updateUser = async (id: string, updates: object, callback) => {
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

};