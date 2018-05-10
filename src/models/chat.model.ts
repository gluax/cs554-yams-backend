import { Document, model, Model, Schema } from 'mongoose';

import User, { IUser, IUserModel } from './user.model';
import Message, { IMessage } from './message.model';

export interface IChat extends Document {
   chatname: string;
   img: string;
   users: Array<any>;
   messages: Array<IMessage>;
}

export interface IChatModel extends Model<IChat> {
   newChat(
      newChat: IChat,
      callback: (err: Error, chat: IChat) => void
   ): Promise<void>;
   addUser(
      chatId: string,
      username: string,
      callback: (err: Error, chat: IChat) => any
   ): Promise<void>;
   removeUser(
      chatId: string,
      username: string,
      callback: (err: Error, chat: IChat) => any
   ): Promise<void>;
}

const ChatSchema: Schema = new Schema({
   chatname: {
      type: String,
      default: '',
      required: true
   },
   img: {
      type: String,
      default: '',
      required: false
   },
   users: [
      {
         username: String,
         user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
         },
         _id: false
      }
   ],
   messages: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
      default: [],
      required: false
   }
});

ChatSchema.static(
   'newChat',
   async (
      newChat: IChat,
      callback: (err: Error, chat: IChat) => void
   ): Promise<void> => {
      await newChat.save(callback);
   }
);

const Chat: IChatModel = model<IChat>('Chat', ChatSchema) as IChatModel;

export default Chat;
