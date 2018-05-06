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

const User = model<UserModel>('User', UserSchema);

export let createUser = async (newUser: UserModel) =>
   bcrypt.genSalt(10, async (err, salt) => {
      bcrypt.hash(newUser.password, salt, async (err, hash) => {
         newUser.password = hash;
         return newUser.save();
      });
   });

export let getUserByUsername = async (username: string) =>
   User.findOne({ username });

export let getUserById = async (id: string) => User.findById(id);

type UserUpdates = {
   username?: string;
   password?: string;
   email?: string;
   firstName?: string;
   lastName?: string;
};

export let updateUser = async (id: string, updates: UserUpdates) => {
   if (updates.password) {
      await bcrypt.genSalt(10, async (err, salt) => {
         await bcrypt.hash(updates.password, salt, async (err, hash) => {
            updates.password = hash;
            return User.findOneAndUpdate(
               { _id: id },
               {
                  $set: updates
               },
               { new: true }
            );
         });
      });
   } else {
      return User.findOneAndUpdate(
         { _id: id },
         {
            $set: updates
         },
         { new: true }
      );
   }
};

export default User;
