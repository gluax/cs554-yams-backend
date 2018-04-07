import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import uuidv4 from 'uuid/v4';

class UserSchema: Schema = new Schema({
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

const User = module.exports = model('User', UserSchema);

module.exports.newUser = async (newUser: UserSchema, callback: function) => {
  bcrypt.genSalt(10, async (err: Error | null, salt: string) => {
    bcrypt.hash(newUser.password, salt, async (err: Error | null, hash: string | number) => {
      newUser.password = hash;
      await newUser.save(callback);
    });
  });
}

module.exports.getUserByUsername = (username: string, callback: function) => {
  User.findOne({username: username}, callback);
}

module.exports.getUserById =  (id: string, callback: function) => {
  User.findById(id, callback);
}

module.exports.comparePassword =  (possiblePass: string, hash: string, callback: function) => {
  bcrypt.compare(possiblePass, hash,  (err: Error | null, match: string) => {
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