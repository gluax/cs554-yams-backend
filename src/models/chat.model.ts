import { Document, model, Model, Schema } from 'mongoose';
import uuidv4 from 'uuid/v4';

import User, { IUser, IUserModel } from './user.model';
import Message, { IMessage } from './message.model';

export interface IChat extends Document {
  _id: string,
  chatName: string,
  isGroupChat: boolean,
  img: string,
  users: Array<IUser>,
  messages: Array<IMessage>
}

export interface IChatModel extends Model<IChat> {
  newChat(newChat: IChat, callback: (err: Error, chat: IChat) => void): Promise<void>,
  addUser(chatId: string, username: string, callback: (err: Error, chat: IChat) => any): Promise<void>,
  removeUser(chatId: string, username: string, callback: (err: Error, chat: IChat) => any): Promise<void>
}

const ChatSchema: Schema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  chatName: {
    type: String,
    default: '',
    required: true,
  },
  isGroupChat: {
    type: Boolean,
    required: true
  },
  img: {
    type: String,
    default: '',
    required: false
  },
  users: {
    type: [{ type: Schema.Types.ObjectId, ref: 'IUser'}],
    default: [],
    required: true,
  },
  messages: {
    type: [{ type: Schema.Types.ObjectId, ref: 'IMessage'}],
    default: [],
    required: false
  }
});

ChatSchema.static('newChat', async (newChat: IChat, callback: (err: Error, chat: IChat) => void): Promise<void> => {
  await newChat.save(callback);
});

ChatSchema.static('addUser', async (chatId: string, username: string, callback: (err: Error, chat: IChat) => any): Promise<void> => {
  const found: any = await User.getUserByUsername(username,  async (err: Error, user: IUser) => {
    if (err) throw err;;
    if (!user) {
      return false;
    }

    await Chat.findOneAndUpdate(
      { _id: chatId },
      { $push: { users: user } },
      { new: true },
      callback
    );
  });

});

ChatSchema.static('addUser', async (chatId: string, username: string, callback: (err: Error, chat: IChat) => any): Promise<void> => {
  const found: any = await User.getUserByUsername(username,  async (err: Error, user: IUser) => {
    if (err) throw err;;
    if (!user) {
      return false;
    }

    await Chat.findOneAndUpdate(
      { _id: chatId },
      { $pull: { users: { username: username } } },
      { new: true },
      callback
    );
  });

});

const Chat: IChatModel = model<IChat>('Chat', ChatSchema) as IChatModel;

export default Chat;