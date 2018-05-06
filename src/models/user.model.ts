import { Schema, Document, model } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserModel = Document & {
   firstName: string;
   lastName: string;
   username: string;
   email: string;
   password: string;
};

const UserSchema = new Schema(
   {
      firstName: {
         type: String,
         required: true
      },
      lastName: {
         type: String,
         required: true
      },
      username: {
         type: String,
         required: true,
         unique: true,
         lowercase: true
      },
      email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true
      },
      password: {
         type: String,
         required: true
      }
   },
   { timestamps: true }
);

// These need to all be async, no callbacks

// export let newUser = async (newUser: UserModel, callback: function) => {
//    bcrypt.genSalt(10, async (err: Error | null, salt: string) => {
//       bcrypt.hash(
//          newUser.password,
//          salt,
//          async (err: Error | null, hash: string | number) => {
//             newUser.password = hash;
//             await newUser.save(callback);
//          }
//       );
//    });
// };

// export let getUserByUsername = (username: string, callback: function) => {
//    User.findOne({ username: username }, callback);
// };

// export let getUserById = (id: string, callback: function) => {
//    User.findById(id, callback);
// };

// export let comparePassword = (
//    possiblePass: string,
//    hash: string,
//    callback: function
// ) => {
//    bcrypt.compare(possiblePass, hash, (err: Error | null, match: string) => {
//       if (err) throw err;
//       callback(null, match);
//    });
// };

// export let updateUser = async (id: string, updates: object, callback) => {
//    if (updates.password) {
//       await bcrypt.genSalt(10, async (err: Error | null, salt: string) => {
//          await bcrypt.hash(
//             updates.password,
//             salt,
//             async (err: Error | null, hash: string | number) => {
//                updates.password = hash;
//                await User.findOneAndUpdate(
//                   { _id: id },
//                   {
//                      $set: updates
//                   },
//                   { new: true },
//                   callback
//                );
//             }
//          );
//       });
//    } else {
//       await User.findOneAndUpdate(
//          { _id: id },
//          {
//             $set: updates
//          },
//          { new: true },
//          callback
//       );
//    }
// };

const User = model('User', UserSchema);
export default User;
